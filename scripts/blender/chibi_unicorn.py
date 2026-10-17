"""Candidate A - procedural chibi unicorn (our own model, no third-party asset).

Usage:
  blender -b --python scripts/blender/chibi_unicorn.py -- <out_dir> [--preview] [--tag NAME] [--view 3q|front|side]

Writes <out_dir>/A_unicorn_transparent.png, A_unicorn_gradient.png and A_unicorn.glb
(with --tag, files are prefixed with the tag instead, for iteration snapshots; the GLB is only
exported for a full-quality 3/4 render).
Deterministic: no random numbers; Cycles seed fixed in studio.configure_render.
"""

import math
import os
import sys

import bpy
from mathutils import Vector
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import face_parts  # noqa: E402
import shapes  # noqa: E402
import studio  # noqa: E402
from face_parts import smoothstep, sph  # noqa: E402
from shapes import ball, capsule, ellipsoid, frame_from_normal, metaball_mesh, paint, surface_dir, uv_ellipsoid  # noqa: E402
from studio import hex_linear, ramp, vinyl_material  # noqa: E402

# ----------------------------------------------------------------------------- design constants
HEAD_C = Vector((0.0, -0.22, 1.38))  # cranium centre (character faces -Y, Z up)
HEAD_R = 0.62
MUZZLE_C = Vector((0.0, -0.58, 1.06))
COL = {k: hex_linear(v) for k, v in studio.MASCOT.items()}
EYE_STOPS = studio.linear_stops(studio.EYE_STOPS)
MANE_STOPS = studio.linear_stops(studio.MANE_STOPS)
# Heavier, pale warm-tinted coat: face-on stays pearl, grazing edges (longer path through the
# coat) turn a deeper warm ivory, away from the pink-lilac background. Rougher coat keeps it satin.
PEARL_EDGE = {"coat": 0.8, "coat_roughness": 0.28, "coat_tint": "#ffe8d2"}
PEARL_STOPS = ((0.0, COL["pearl_cool"]), (0.35, COL["pearl"]), (1.0, COL["pearl_warm"]))


def pearl_tint(p, n):
    """Warm ivory facing up (key/top light), cool lilac facing down: separates the pearl body
    from the pastel background without greying it."""
    return ramp(PEARL_STOPS, smoothstep(-0.8, 0.2, n.z))


# ----------------------------------------------------------------------------- body & head
def build_body(root):
    """Small chibi pony body: rounded chest, belly, haunches, a short neck, four stubby legs with
    slightly flared hooves. Legs are thin enough not to fuse into a pillar."""
    els = [
        ellipsoid((0, 0.15, 0.50), (0.25, 0.32, 0.22)),  # belly
        ball((0, -0.09, 0.56), 0.245),  # chest, pushed forward
        ellipsoid((0, -0.14, 0.74), (0.15, 0.14, 0.12)),  # short neck under the head
    ]
    for x in (-0.14, 0.14):
        els.append(ball((x, 0.36, 0.50), 0.19))  # rounded haunches
    for x in (-0.165, 0.165):
        for y in (-0.08, 0.40):
            els.append(capsule((x, y, 0.25), 0.095, 0.09))
            els.append(ellipsoid((x, y, 0.095), (0.118, 0.118, 0.085)))  # hoof, flattened sole
    body = metaball_mesh("Body", els, parent=root)
    hoof_top = 0.10

    def col(p, n):
        return studio.lerp_color(COL["hoof"], pearl_tint(p, n), smoothstep(hoof_top - 0.012, hoof_top + 0.012, p.z))

    return body, col


def build_head(root):
    els = [
        ball(HEAD_C, HEAD_R),
        ellipsoid(MUZZLE_C, (0.27, 0.17, 0.19)),
        ball((-0.27, -0.50, 1.13), 0.28),
        ball((0.27, -0.50, 1.13), 0.28),
    ]
    head = metaball_mesh("Head", els, parent=root)
    snout = MUZZLE_C + Vector((0, -0.12, 0))

    def col(p, n):
        return studio.lerp_color(COL["muzzle"], pearl_tint(p, n), smoothstep(0.16, 0.3, (p - snout).length))

    return head, col


# ----------------------------------------------------------------------------- face
def build_eye(head, side, root, mats):
    radii = (0.16, 0.21, 0.07)
    tag = "L" if side > 0 else "R"
    eye, centre, rot = face_parts.place_on(head, HEAD_C, sph(28 * side, 3), radii, 0.035, f"Eye.{tag}", root)
    studio.assign(eye, mats["eye"])

    def col(p, nn):
        ly = (rot.transposed() @ (p - centre)).y / radii[1]
        return ramp(EYE_STOPS, ly)

    paint(eye, col)
    face_parts.eye_highlights(centre, rot, radii, mats["highlight"], f"Highlight.{tag}", root)
    build_lashes(head, centre, rot, radii[0], radii[1], side, root, mats)
    return centre + rot @ Vector((0, 0, radii[2]))  # apex, for the face-axis measurement


def build_lashes(head, centre, rot, rx, ry, side, root, mats):
    """Two small curled lashes at the outer-upper corner of the eye. Each grows from the eye rim
    and lies down onto the head surface towards its tip, so from any angle it stays inside the
    head silhouette (a lash standing off the skull read as a spike on the far eye)."""
    normal = rot @ Vector((0, 0, 1))
    for k, a0 in enumerate((22, 42)):
        pts = []
        for i in range(9):
            t = i / 8
            a = math.radians(a0 + 6 * t)
            reach = 1.0 + 0.42 * t
            local = Vector((side * rx * math.cos(a) * reach, ry * math.sin(a) * reach + 0.03 * t * t, 0.0))
            hit, n = shapes.surface_hit(head, centre + rot @ local + normal, -normal)
            pts.append(hit + n * (0.012 + 0.028 * (1 - t)))
        lash = shapes.tube(f"Lash.{side}.{k}", pts, 0.014, parent=root, taper=lambda t: 1.0 - 0.5 * t)
        studio.assign(lash, mats["smile"])


def build_blush(head, side, root, mats):
    d = sph(54 * side, -14)
    skin = pearl_tint(*surface_dir(head, HEAD_C, d))  # fade into the head's own tint there
    face_parts.blush(head, HEAD_C, d, (0.12, 0.075, 0.03), mats["blush"], COL["blush"], skin, f"Blush.{side}", root)


def build_smile(head, root, mats):
    pts = []
    for i in range(13):
        u = -1 + 2 * i / 12
        x = 0.07 * u
        z = MUZZLE_C.z - 0.07 + 0.03 * u * u
        hit, n = shapes.surface_hit(head, (x, -5, z), (0, 1, 0))
        pts.append(hit + n * 0.004)
    sm = shapes.tube("Smile", pts, 0.013, parent=root, taper=lambda t: 0.55 + 0.45 * math.sin(math.pi * t))
    studio.assign(sm, mats["smile"])
    return pts[6]


def build_ears(head, root, mats):
    for side in (-1, 1):
        hit, n = surface_dir(head, HEAD_C, sph(50 * side, 55))
        axis = (n + Vector((0.12 * side, 0.1, 0.35))).normalized()
        rot = frame_from_normal(axis, Vector((0, -1, 0)))
        base = hit + axis * 0.1
        ear = uv_ellipsoid(f"Ear.{side}", base, (0.12, 0.075, 0.22), rot=rot, parent=root)
        studio.assign(ear, mats["pearl"])
        paint(ear, pearl_tint)
        inner = uv_ellipsoid(f"EarInner.{side}", base + rot @ Vector((0, 0.05, 0.015)), (0.07, 0.035, 0.15), rot=rot, parent=root)
        studio.assign(inner, mats["inner_ear"])


def build_horn(head, root, mats):
    return face_parts.horn(head, HEAD_C, sph(0, 54), 0.62, 0.125, mats["gold"], parent=root, turns=3.0, ridge=0.3, sharp=0.45)


# ----------------------------------------------------------------------------- mane & tail
def gradient_field(samples):
    """Vertex colour from MANE_STOPS: each vertex takes the gradient parameter t of the nearest
    samples (co, radius, t), inverse-distance weighted (smooth where locks overlap)."""
    tree = KDTree(len(samples))
    for i, (c, _, _) in enumerate(samples):
        tree.insert(c, i)
    tree.balance()

    def col(p, n):
        ws, acc = 0.0, 0.0
        for _, i, d in tree.find_n(p, 8):
            w = 1.0 / max(d - samples[i][1] * 0.6, 1e-3) ** 4
            ws += w
            acc += w * samples[i][2]
        return ramp(MANE_STOPS, acc / ws)

    return col


def crest_dir(phi_deg, lean=0.28):
    """Direction over the skull: phi 0 = forehead, 90 = crown, 180 = nape; leans to +X (camera)."""
    p = math.radians(phi_deg)
    return Vector((lean, -math.cos(p), math.sin(p)))


def skull_arc(d0, d1, lift):
    """curl_path start, tangent and arc that hug the cranium (radius HEAD_R + lift) from d0 to d1."""
    d0, d1 = d0.normalized(), d1.normalized()
    tangent = d1 - d0 * d0.dot(d1)
    arc = {"bend": -d0, "radius": HEAD_R + lift, "turns": d0.angle(d1) / (2 * math.pi)}
    return HEAD_C + d0 * (HEAD_R + lift), tangent, arc


def curl_lock(name, start, tangent, arcs, radius, t0, t1, root, tip=0.28):
    """One tapering lock along curl_path, painted with its own gradient (t0 at root -> t1 at tip;
    painting per lock keeps a neighbour's colour from bleeding where locks touch)."""
    pts = shapes.resample(shapes.curl_path(start, tangent, arcs), 120)
    taper = lambda t: 1.0 - (1.0 - tip) * t**1.3  # noqa: E731
    lock = shapes.tube(name, pts, radius, parent=root, taper=taper, bevel_resolution=6)
    n = len(pts) - 1
    paint(lock, gradient_field([(p, radius * taper(i / n), t0 + (t1 - t0) * i / n) for i, p in enumerate(pts)]))
    return lock


# Mane locks: (root on the crest, end of the skull-hugging part, tube radius, curl radius, curl turns).
# Every lock falls on the character's left (+X, camera side) and rolls outward into a curl.
MANE_LOCKS = (
    (crest_dir(80, 0.12), sph(92, 32), 0.15, 0.17, 0.95),
    (crest_dir(104, 0.12), sph(108, 14), 0.16, 0.18, 0.95),
    (crest_dir(128, 0.12), sph(124, -2), 0.16, 0.18, 0.95),
    (crest_dir(152, 0.1), sph(142, -16), 0.15, 0.17, 0.95),
    (crest_dir(176, 0.05), sph(162, -28), 0.14, 0.16, 0.9),
)


def build_mane(head, root, mats):
    """Soft curls: a slim scalp cap along the crest, five locks hugging the skull then rolling
    outward into tapering spiral curls, and a flat swirl of forelock on the forehead."""
    cap = []
    for k, phi in enumerate((66, 90, 115, 140, 165, 185)):
        hit, n = surface_dir(head, HEAD_C, crest_dir(phi, 0.05))
        cap.append((hit + n * 0.05, 0.17, 0.1 + 0.6 * k / 5))
    objs = [metaball_mesh("ManeCap", [ball(c, r) for c, r, _ in cap], parent=root)]
    paint(objs[0], gradient_field(cap))
    n_locks = len(MANE_LOCKS)
    for k, (d0, d1, r, cr, turns) in enumerate(MANE_LOCKS):
        start, tangent, arc = skull_arc(d0, d1, r * 0.5)
        curl = {"bend": d1, "radius": cr, "turns": turns, "shrink": 0.6, "drift": 0.08}
        u = 0.15 + 0.7 * k / (n_locks - 1)
        objs.append(curl_lock(f"ManeLock.{k}", start, tangent, [arc, curl], r, u, u + 0.3, root))
    # Forelock: from beside the horn down onto the forehead, then a flat swirl lying on the skin.
    start, tangent, arc = skull_arc(sph(14, 66), sph(26, 42), 0.06)
    swirl = {"bend": Vector((1, 0, 0)), "radius": 0.09, "turns": 1.1, "shrink": 0.62}
    objs.append(curl_lock("Forelock", start, tangent, [arc, swirl], 0.1, 0.0, 0.3, root))
    studio.assign(shapes.join(objs, "Mane"), mats["mane"])


TAIL_YAW = math.radians(40)  # tail plane swung towards +X so its curls face the 3/4 camera


def build_tail(root, mats):
    """Two locks from the rump: a big one rising and rolling forward over itself, a smaller one
    hanging down and curling back; pink at the root -> sky at the tips."""
    back = Vector((math.sin(TAIL_YAW), math.cos(TAIL_YAW), 0))
    up = Vector((0, 0, 1))
    start = Vector((0.0, 0.56, 0.62))
    locks = (
        (back * 0.8 + up * 0.6, [{"bend": up, "radius": 0.6, "turns": 0.1}, {"bend": -back, "radius": 0.19, "turns": 0.95, "shrink": 0.6, "drift": 0.08}], 0.14),
        (back * 0.7 - up * 0.7, [{"bend": back, "radius": 0.35, "turns": 0.06}, {"bend": back, "radius": 0.14, "turns": 0.9, "shrink": 0.6, "drift": -0.08}], 0.115),
    )
    objs = [curl_lock(f"TailLock.{k}", start, t, arcs, r, 0.0, 1.0, root) for k, (t, arcs, r) in enumerate(locks)]
    studio.assign(shapes.join(objs, "Tail"), mats["mane"])


# ----------------------------------------------------------------------------- assembly
def make_materials():
    return {
        "pearl": studio.pearl_material(**PEARL_EDGE),
        "mane": studio.mane_material(),
        "gold": studio.gold_material("#ffc44f", metallic=0.45),  # soft gold
        "eye": studio.eye_material(),
        "highlight": studio.highlight_material(),
        "blush": studio.blush_material(**PEARL_EDGE),
        "inner_ear": vinyl_material("InnerEar", studio.MASCOT["inner_ear"], roughness=0.45, coat=0.3),
        "smile": studio.line_material(),
    }


def build_unicorn():
    root = bpy.data.objects.new("Unicorn", None)
    shapes.link(root)
    mats = make_materials()
    body, body_col = build_body(root)
    head, head_col = build_head(root)
    for obj, fn in ((body, body_col), (head, head_col)):
        studio.assign(obj, mats["pearl"])
        paint(obj, fn)
    marks = {}
    for side in (-1, 1):
        marks["eye_L" if side > 0 else "eye_R"] = build_eye(head, side, root, mats)
        build_blush(head, side, root, mats)
    marks["mouth"] = build_smile(head, root, mats)
    build_ears(head, root, mats)
    build_horn(head, root, mats)
    build_mane(head, root, mats)
    build_tail(root, mats)
    parts = [o for o in root.children if o.type == "MESH"]
    lo, _ = studio.world_bbox(parts)
    root.location.z -= lo.z  # hooves rest exactly on the ground (z = 0)
    bpy.context.view_layer.update()
    return root, parts, {k: p - Vector((0, 0, lo.z)) for k, p in marks.items()}


def face_axis_report(scene, cam, marks):
    """Screen-space check of defect 2: horizontal offset of the mouth from the midpoint of the two
    eye apexes, in pixels and as a fraction of the on-screen eye spacing."""
    from bpy_extras.object_utils import world_to_camera_view

    bpy.context.view_layer.update()  # camera matrix_world is stale right after stage()
    res = scene.render.resolution_x
    x = {k: world_to_camera_view(scene, cam, p).x * res for k, p in marks.items()}
    mid = (x["eye_L"] + x["eye_R"]) / 2
    off = x["mouth"] - mid
    print(f"FACE_AXIS eye_R {x['eye_R']:.1f} eye_L {x['eye_L']:.1f} mid {mid:.1f} mouth {x['mouth']:.1f} px  offset {off:+.1f} px = {off / abs(x['eye_L'] - x['eye_R']):+.1%} of eye spacing")


GLB_MAX_TRIS_PER_MESH = 6000  # renders keep full density; the web GLB is decimated on export


def export_glb(root, path):
    """Web-weight GLB: each dense mesh gets a collapse-decimate applied at export only."""
    for o in root.children:
        if o.type != "MESH":
            continue
        tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
        print(f"GLB_MESH {o.name}: {tris} tris" + (f" -> decimated to {GLB_MAX_TRIS_PER_MESH}" if tris > GLB_MAX_TRIS_PER_MESH else ""))
        if tris > GLB_MAX_TRIS_PER_MESH:
            mod = o.modifiers.new("WebDecimate", "DECIMATE")
            mod.ratio = GLB_MAX_TRIS_PER_MESH / tris
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for o in root.children:
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_vertex_color="MATERIAL", export_apply=True)
    print("EXPORTED", path)


def main():
    args = studio.parse_args(1)
    out_dir = os.path.abspath(args[0])
    preview = "--preview" in args
    tag = args[args.index("--tag") + 1] if "--tag" in args else "A_unicorn"
    view = args[args.index("--view") + 1] if "--view" in args else "3q"
    scene = studio.begin(preview)
    root, parts, marks = build_unicorn()
    lo, hi = studio.world_bbox(parts)
    hlo, hhi = studio.world_bbox([o for o in parts if o.name.startswith("Head")])
    print(f"BBOX total z {lo.z:.3f}..{hi.z:.3f}  head z {hlo.z:.3f}..{hhi.z:.3f}  head share {(hhi.z - hlo.z) / (hi.z - lo.z):.2%}")
    cam = studio.stage(scene, parts, view=view)
    face_axis_report(scene, cam, marks)
    dt = studio.finish(scene, out_dir, tag)
    if not preview and view == "3q":
        export_glb(root, os.path.join(out_dir, f"{tag}.glb"))
    print(f"DONE render_seconds={dt:.1f}")


if __name__ == "__main__":
    main()
