"""Candidate A - procedural chibi unicorn (our own model, no third-party asset).

Usage:
  blender -b --python scripts/blender/chibi_unicorn.py -- <out_dir> [--preview] [--tag NAME]

Writes <out_dir>/A_unicorn_transparent.png, A_unicorn_gradient.png and A_unicorn.glb
(with --tag, files are prefixed with the tag instead, for iteration snapshots).
Deterministic: no random numbers; Cycles seed fixed in studio.configure_render.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import face_parts  # noqa: E402
import shapes  # noqa: E402
import studio  # noqa: E402
from face_parts import smoothstep, sph  # noqa: E402
from shapes import ball, capsule, ellipsoid, frame_from_normal, metaball_mesh, paint, surface_dir, uv_ellipsoid  # noqa: E402
from studio import hex_linear, ramp, vinyl_material  # noqa: E402

# ----------------------------------------------------------------------------- design constants
HEAD_C = Vector((0.0, -0.22, 1.38))  # cranium centre (character faces -Y, Z up)
MUZZLE_C = Vector((0.0, -0.62, 1.06))
COL = {k: hex_linear(v) for k, v in studio.MASCOT.items()}
EYE_STOPS = studio.linear_stops(studio.EYE_STOPS)
MANE_STOPS = studio.linear_stops(studio.MANE_STOPS)


# ----------------------------------------------------------------------------- body & head
def build_body(root):
    els = [ellipsoid((0, 0.16, 0.48), (0.34, 0.5, 0.30)), ball((0, -0.08, 0.66), 0.2)]
    for x in (-0.19, 0.19):
        for y in (-0.10, 0.42):
            els.append(capsule((x, y, 0.21), 0.125, 0.08))
    body = metaball_mesh("Body", els, parent=root)
    hoof_top = 0.10

    def col(p, n):
        base = ramp(((0.0, COL["pearl_low"]), (1.0, COL["pearl"])), smoothstep(0.2, 0.7, p.z))
        return studio.lerp_color(COL["hoof"], base, smoothstep(hoof_top - 0.012, hoof_top + 0.012, p.z))

    return body, col


def build_head(root):
    els = [
        ball(HEAD_C, 0.62),
        ellipsoid(MUZZLE_C, (0.27, 0.2, 0.19)),
        ball((-0.27, -0.50, 1.13), 0.28),
        ball((0.27, -0.50, 1.13), 0.28),
    ]
    head = metaball_mesh("Head", els, parent=root)
    snout = MUZZLE_C + Vector((0, -0.12, 0))

    def col(p, n):
        return studio.lerp_color(COL["muzzle"], COL["pearl"], smoothstep(0.16, 0.3, (p - snout).length))

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
    build_lashes(centre, rot, radii[0], radii[1], side, root, mats)
    return eye


def build_lashes(centre, rot, rx, ry, side, root, mats):
    """Two small curled lashes at the outer-upper corner of the eye."""
    for k, a0 in enumerate((22, 42)):
        pts = []
        for i in range(9):
            t = i / 8
            a = math.radians(a0 + 6 * t)
            reach = 1.0 + 0.42 * t
            lx = side * rx * math.cos(a) * reach
            ly = ry * math.sin(a) * reach + 0.035 * t * t
            pts.append(centre + rot @ Vector((lx, ly, 0.045 - 0.02 * t)))
        lash = shapes.tube(f"Lash.{side}.{k}", pts, 0.012, parent=root, taper=lambda t: 1.0 - 0.75 * t)
        studio.assign(lash, mats["smile"])


def build_blush(head, side, root, mats):
    face_parts.blush(head, HEAD_C, sph(54 * side, -14), (0.12, 0.075, 0.03), mats["blush"], COL["blush"], COL["pearl"], f"Blush.{side}", root)


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


def build_ears(head, root, mats):
    for side in (-1, 1):
        hit, n = surface_dir(head, HEAD_C, sph(50 * side, 55))
        axis = (n + Vector((0.12 * side, 0.1, 0.35))).normalized()
        rot = frame_from_normal(axis, Vector((0, -1, 0)))
        base = hit + axis * 0.1
        ear = uv_ellipsoid(f"Ear.{side}", base, (0.12, 0.075, 0.22), rot=rot, parent=root)
        studio.assign(ear, mats["pearl"])
        paint(ear, lambda p, nn: COL["pearl"])
        inner = uv_ellipsoid(f"EarInner.{side}", base + rot @ Vector((0, 0.05, 0.015)), (0.07, 0.035, 0.15), rot=rot, parent=root)
        studio.assign(inner, mats["inner_ear"])


def build_horn(head, root, mats):
    return face_parts.horn(head, HEAD_C, sph(0, 54), 0.62, 0.125, mats["gold"], parent=root)


# ----------------------------------------------------------------------------- mane & tail
def gradient_by_path(points):
    def col(p, n):
        ws, acc = 0.0, 0.0
        for i, (c, r) in enumerate(points):
            d = max((p - Vector(c)).length - r * 0.6, 1e-3)
            w = 1.0 / d**4
            ws += w
            acc += w * (i / (len(points) - 1))
        return ramp(MANE_STOPS, acc / ws)

    return col


def crest_dir(phi_deg, lean=0.28):
    """Direction over the skull: phi 0 = forehead, 90 = crown, 180 = nape; leans to +X (camera)."""
    p = math.radians(phi_deg)
    return Vector((lean, -math.cos(p), math.sin(p)))


def build_mane(head, root, mats):
    """Puffy scalloped mane: distinct round puffs (spaced ~1.4 r apart) fused only at their roots."""
    pts = []
    puffs = [
        (sph(15, 47), 0.04, 0.135),  # forelock cascading to the character's left of the horn
        (sph(31, 37), 0.035, 0.11),
        (sph(43, 25), 0.02, 0.08),
        (crest_dir(72), 0.06, 0.18),
        (crest_dir(100), 0.07, 0.2),
        (crest_dir(128), 0.07, 0.2),
        (crest_dir(154), 0.06, 0.19),
        (sph(100, 42), 0.06, 0.16),  # second row on the camera side for volume
        (sph(124, 26), 0.06, 0.18),  # drape behind the cheek
        (sph(116, 4), 0.05, 0.15),
        (crest_dir(178, 0.15), 0.05, 0.16),
    ]
    for d, out, r in puffs:
        hit, n = surface_dir(head, HEAD_C, d)
        pts.append((tuple(hit + n * out), r))
    pts.append(((0.06, 0.38, 0.92), 0.14))
    mane = metaball_mesh("Mane", [ball(c, r) for c, r in pts], parent=root)
    studio.assign(mane, mats["mane"])
    paint(mane, gradient_by_path(pts))


def build_tail(root, mats):
    pts = [
        ((0.0, 0.62, 0.55), 0.12),
        ((0.03, 0.79, 0.64), 0.16),
        ((0.06, 0.92, 0.82), 0.17),
        ((0.06, 0.92, 1.04), 0.15),
        ((0.04, 0.80, 1.17), 0.12),
        ((0.02, 0.69, 1.15), 0.08),
    ]
    tail = metaball_mesh("Tail", [ball(c, r) for c, r in pts], parent=root)
    studio.assign(tail, mats["mane"])
    paint(tail, gradient_by_path(pts))


# ----------------------------------------------------------------------------- assembly
def make_materials():
    return {
        "pearl": studio.pearl_material(),
        "mane": studio.mane_material(),
        "gold": studio.gold_material(),
        "eye": studio.eye_material(),
        "highlight": studio.highlight_material(),
        "blush": studio.blush_material(),
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
    for side in (-1, 1):
        build_eye(head, side, root, mats)
        build_blush(head, side, root, mats)
    build_smile(head, root, mats)
    build_ears(head, root, mats)
    build_horn(head, root, mats)
    build_mane(head, root, mats)
    build_tail(root, mats)
    parts = [o for o in root.children if o.type == "MESH"]
    lo, _ = studio.world_bbox(parts)
    root.location.z -= lo.z  # hooves rest exactly on the ground (z = 0)
    bpy.context.view_layer.update()
    return root, parts


GLB_MAX_TRIS_PER_MESH = 6000  # renders keep full density; the web GLB is decimated on export


def export_glb(root, path):
    """Web-weight GLB: each dense mesh gets a collapse-decimate applied at export only."""
    for o in root.children:
        if o.type != "MESH":
            continue
        tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
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
    scene = studio.begin(preview)
    root, parts = build_unicorn()
    lo, hi = studio.world_bbox(parts)
    hlo, hhi = studio.world_bbox([o for o in parts if o.name.startswith("Head")])
    print(f"BBOX total z {lo.z:.3f}..{hi.z:.3f}  head z {hlo.z:.3f}..{hhi.z:.3f}  head share {(hhi.z - hlo.z) / (hi.z - lo.z):.2%}")
    studio.stage(scene, parts)
    dt = studio.finish(scene, out_dir, tag)
    if not preview:
        export_glb(root, os.path.join(out_dir, f"{tag}.glb"))
    print(f"DONE render_seconds={dt:.1f}")


if __name__ == "__main__":
    main()
