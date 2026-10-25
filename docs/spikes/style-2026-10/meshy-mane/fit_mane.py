"""Fit the Meshy-generated mane onto the A6 chibi unicorn and render the harness views.

Source: Meshy text-to-3D, Meshy 6, task 01a173f7-a64c-712e-80e6-b4985f3ebca6 (2026-10-25, user's
Pro account, licence « Privé »), prompt in README.md. Meshy ignored « hair only » and made a whole
horse-like unicorn head with the mane: one shell of 423 773 vertices, no material. This script
keeps the mane: Meshy's cranium is scaled to sit inside ours, then its face (a cone in front and
below), its horn and ears (ours stay) and everything hidden inside our head are deleted. Colour:
the existing mane material and gradient (studio.mane_material, MANE_STOPS) painted by height.

  B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
  "$B" -b --python fit_mane.py -- <mane.glb> <out_dir> [--res 1024] [--spp 64] [--scale 1.45] [--fringe-bake <npz>] [--export-mesh <npz>: write the trimmed mane for lock_axes.py and stop]
     [--guides <guides.npz> --mesh <mane_mesh.npz> [--strands-bake <npz>] [--per-lock 600]: strands along the lock axes]
Writes cand_<view>_* and bald_<view>_* for 3q, front, side, back (bald = same camera, mane hidden).
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "scripts", "blender"))

import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import chibi_unicorn as cu  # noqa: E402
import mane_hair  # noqa: E402
import studio  # noqa: E402
import unicorn_mane as um  # noqa: E402
from face_parts import smoothstep, sph  # noqa: E402
from shapes import paint  # noqa: E402

VIEWS = ("3q", "front", "side", "back")
# Meshy head, read on orthographic views with a grid (Meshy units, face towards -Y, Z up)
MESHY_CRANIUM = Vector((0.0, -0.2, 0.0))
MESHY_RADIUS = 0.4
FACE_AXIS = Vector((0.0, -1.0, -0.6)).normalized()  # eyes, snout, mouth
FACE_HALF_ANGLE = 52.0  # degrees; the forelock (elevation ~ +25 deg) stays outside
# fit6 (2026-10-25): the cone sliced Meshy's own forelock into the straight « helmet » hem (fit5
# R). The face cut now stops below this elevation (Meshy units, from its cranium centre): snout
# and mouth go, the forehead and the lock lying on it stay.
FACE_MAX_EL = float(sys.argv[sys.argv.index("--face-max-el") + 1]) if "--face-max-el" in sys.argv else 90.0
def _arg(name, default):
    return float(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


# fit7 (2026-10-25, fit6 judges): the rolls round Meshy's horn read as a rosette of lumps (R) and
# stubs of its ears as pink thorns beside our horn (M): both capsules can be widened.
MESHY_HORN = (Vector((0.0, -0.48, 0.47)), Vector((0.0, -0.97, 0.52)), _arg("--horn-r", 0.1))  # capsule base, tip, radius (pixels on the grid views)
MESHY_EARS = tuple((Vector((x, -0.35, 0.40)), Vector((x * 1.33, -0.42, 0.70 + _arg("--ear-ext", 0.0))), _arg("--ear-r", 0.1)) for x in (-0.27, 0.27))
# fit7: the forelock's tip landed on the eyelashes (3 of 6 pairwise judges, H-B intersect).
# Remapping elevations to a floor (f7a-f7d, f7f) crumpled the forelock into a band; it is now
# shifted up the skull as a whole by FRINGE_SHIFT degrees, fading out above the forehead and
# towards the sides, so its shape is kept.
FRINGE_SHIFT = _arg("--fringe-shift", 0.0)
# fit8 (user's green box on the fit7 board, 2026-10-25): the rolls Meshy wrapped round ITS horn
# stay as a rosette of lumps round ours. ROSETTE = (radius around Meshy's horn base, Meshy units;
# mode: "cut" deletes the rolls standing off the skull, "press" flattens them towards it).
ROSETTE_R = _arg("--rosette-r", 0.0)
ROSETTE_PRESS = _arg("--rosette-press", 0.0)  # 0 = cut, 0..1 = keep this fraction of the height
ROSETTE_KEEP = _arg("--rosette-keep", 0.05)  # cut mode: keep what lies within this of the skull (our units)
# fit9 judges: the cut won silhouette / tips / flow but lost density and volume in 3q and side
# (crown thinned behind the horn). --rosette-front: cut only in front of the horn base (the
# zone the user boxed), Meshy units along -Y; behind it the crown keeps its mass.
ROSETTE_FRONT = _arg("--rosette-front", 9.0)
CROWN_INFLATE, CROWN_INFLATE_R = _arg("--crown-inflate", 0.0), _arg("--crown-inflate-r", 0.5)
# capsules, not spheres: spheres sliced the locks around them (fit2: torn « petals » around the horn)
HANG = 0.72  # vertical squash of the hanging locks (fit1 fell past the chest)
INSIDE_MARGIN = 0.01
# Meshy's fringe and the rolls around its horn: refused (fit5 judges, R `helmet` « rolled cap »;
# user: « la frange … il faut des mèches »). Cut in front of the crown, replaced by FRINGE strands.
FRINGE_CUT_PHI = 100.0
FRINGE_CUT_ACROSS = 55.0  # keep what lies on our head's surface, drop what is under it


FRINGE_CUT = "--meshy-fringe" not in sys.argv  # fit5 state: keep Meshy's own fringe, no strand fringe


def opt(args, name, default):
    return args[args.index(name) + 1] if name in args else default


def import_mane(path, scale, root):
    bpy.ops.import_scene.gltf(filepath=path)
    obj = next(o for o in bpy.context.selected_objects if o.type == "MESH")
    obj.name = "MeshyMane"
    me = obj.data
    me.transform(obj.matrix_world)  # glTF import may carry a rotation/scale on the object
    obj.matrix_world.identity()
    offset = cu.HEAD_C - MESHY_CRANIUM * scale
    for v in me.vertices:
        q = v.co - MESHY_CRANIUM
        if q.z < 0.0:  # shorten what hangs below the cranium centre (chibi length), keep the crown
            q.z *= HANG
            q.x *= 1.0 + (HANG - 1.0) * 0.5 * min(-q.z / 0.6, 1.0)
        v.co = cu.HEAD_C + q * scale
    obj.parent = root
    return obj


def press_rosette(obj, head, scale):
    """Flatten the rolls round Meshy's horn base towards our skull (see ROSETTE_R)."""
    from mathutils.bvhtree import BVHTree

    bvh = BVHTree.FromObject(head, bpy.context.evaluated_depsgraph_get())
    base = cu.HEAD_C + (MESHY_HORN[0] - MESHY_CRANIUM) * scale
    n = 0
    for v in obj.data.vertices:
        d = (v.co - base).length / scale
        if d >= ROSETTE_R:
            continue
        hit, normal, _, _ = bvh.find_nearest(v.co)
        if hit is None:
            continue
        h = (v.co - hit).dot(normal)
        w = 1.0 - smoothstep(0.6 * ROSETTE_R, ROSETTE_R, d)
        v.co = v.co - normal * h * (1.0 - ROSETTE_PRESS) * w
        n += 1
    print(f"ROSETTE_PRESS {ROSETTE_PRESS} r {ROSETTE_R}: {n} vertices")


def inflate_crown(obj, scale):
    """fit9 judges: removing the rolls thinned the crown (density, volume lost in 3q / side).
    The crown left round the horn is pushed out from the head centre by CROWN_INFLATE (fraction
    of its radius), faded out by distance to Meshy's horn base (CROWN_INFLATE_R, Meshy units)."""
    base = cu.HEAD_C + (MESHY_HORN[0] - MESHY_CRANIUM) * scale
    n = 0
    for v in obj.data.vertices:
        d = (v.co - base).length / scale
        w = 1.0 - smoothstep(0.5 * CROWN_INFLATE_R, CROWN_INFLATE_R, d)
        if w <= 0.0:
            continue
        v.co = cu.HEAD_C + (v.co - cu.HEAD_C) * (1.0 + CROWN_INFLATE * w)
        n += 1
    print(f"CROWN_INFLATE {CROWN_INFLATE} r {CROWN_INFLATE_R}: {n} vertices")


def lift_fringe(obj):
    """Shift the front of the mane up the skull (see FRINGE_SHIFT)."""
    moved = 0
    for v in obj.data.vertices:
        d = v.co - cu.HEAD_C
        r = d.length
        el = math.degrees(math.asin(max(-1.0, min(1.0, d.z / r))))
        az = math.degrees(math.atan2(d.x, -d.y))
        w = (1.0 - smoothstep(40.0, 60.0, abs(az))) * (1.0 - smoothstep(48.0, 72.0, el))
        if w <= 0.0:
            continue
        v.co = cu.HEAD_C + sph(az, el + FRINGE_SHIFT * w) * r
        moved += 1
    print(f"FRINGE_SHIFT {FRINGE_SHIFT} deg, {moved} vertices moved")


def capsule_distance(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


def doomed(p, scale, head_bvh):
    """Meshy skin, face, horn and ears, its fringe (replaced by strands); anything under our
    head's surface."""
    rel = (p - cu.HEAD_C) / scale
    d = rel - Vector((0.0, 0.0, 0.0))
    if d.length > 1e-6 and math.degrees(d.angle(FACE_AXIS)) < FACE_HALF_ANGLE and d.z < math.sin(math.radians(FACE_MAX_EL)) * d.length:
        return True
    if d.length > 1e-6 and FRINGE_CUT:
        phi, across = mane_hair.crest_coords(d.normalized())
        if phi < FRINGE_CUT_PHI and abs(across) < FRINGE_CUT_ACROSS:
            return True
    q = rel + MESHY_CRANIUM
    if any(capsule_distance(q, a, b) < r for a, b, r in (MESHY_HORN, *MESHY_EARS)):
        return True
    hit, normal, _, _ = head_bvh.find_nearest(p)
    if ROSETTE_R and not ROSETTE_PRESS and (q - MESHY_HORN[0]).length < ROSETTE_R and q.y < MESHY_HORN[0].y + ROSETTE_FRONT and hit is not None and (p - hit).dot(normal) > ROSETTE_KEEP:
        return True
    return hit is not None and (p - hit).dot(normal) < INSIDE_MARGIN


def drop_islands(bm, min_verts):
    """Delete the fragments a cut leaves floating (fit8: shreds by the horn after the rosette cut)."""
    if not min_verts:
        return
    seen, small = set(), []
    for v in bm.verts:
        if v in seen:
            continue
        stack, island = [v], []
        seen.add(v)
        while stack:
            u = stack.pop()
            island.append(u)
            for e in u.link_edges:
                w = e.other_vert(u)
                if w not in seen:
                    seen.add(w)
                    stack.append(w)
        if len(island) < min_verts:
            small.extend(island)
    print(f"ISLANDS dropped {len(small)} vertices in fragments under {min_verts}")
    bmesh.ops.delete(bm, geom=small, context="VERTS")


def trim(obj, head, scale):
    from mathutils.bvhtree import BVHTree

    dg = bpy.context.evaluated_depsgraph_get()
    head_bvh = BVHTree.FromObject(head, dg)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    kill = [v for v in bm.verts if doomed(v.co, scale, head_bvh)]
    print(f"MESHY_TRIM {len(kill)} of {len(bm.verts)} vertices removed")
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    drop_islands(bm, int(_arg("--min-island", 0)))
    # close the cut edges: an open hair shell shows its dark inside (fit4: hollows by the ears)
    rim = [e for e in bm.edges if e.is_boundary]
    filled = bmesh.ops.holes_fill(bm, edges=rim, sides=0)["faces"]
    # fit10: remember the caps (flat faces closing the cuts) so colour() can shade them as the
    # inside of the hair; they read as a « smooth pale scalp » round the horn (judges r9-r11).
    # Marked on the vertices, before triangulate replaces the faces.
    cap = bm.verts.layers.int.new("cap")
    for f in filled:
        for v in f.verts:
            v[cap] = 1
    if CAP_SINK and filled:
        # fit10: the caps are big flat polygons spanning the cut loops (the « pale smooth patch »
        # at the horn base, judges r9-r11). Poke each one and pull its centre down onto the
        # skull: the cap becomes a funnel that falls into shadow instead of a pale plateau.
        # only the caps round the horn: sinking the face-cut cap pulled a veil from the fringe's
        # lower edge down to the forehead (frayed edge, 3q)
        base = cu.HEAD_C + (MESHY_HORN[0] - MESHY_CRANIUM) * scale
        near = [f for f in filled if (f.calc_center_median() - base).length < (ROSETTE_R + 0.08) * scale]
        poked = bmesh.ops.poke(bm, faces=near)
        for v in poked["verts"]:
            hit, normal, _, _ = head_bvh.find_nearest(v.co)
            if hit is not None:
                v.co = hit + normal * 0.005
        filled = [f for f in filled if f.is_valid] + poked["faces"]
    bmesh.ops.triangulate(bm, faces=filled)
    print(f"MESHY_CAPS {len(rim)} cut edges closed with {len(filled)} faces")
    bm.to_mesh(obj.data)
    bm.free()


def fringe_colliders():
    """Head and body, plus the horn base and the ears, so the strands part around them."""
    extra = [mane_hair.Collider(cu.HEAD_C + sph(0, 54) * (cu.HEAD_R + 0.14), Vector((0.13, 0.13, 0.13)))]
    extra += [mane_hair.Collider(cu.HEAD_C + sph(50 * s, 55) * (cu.HEAD_R + 0.12), Vector((0.12, 0.12, 0.14))) for s in (-1, 1)]
    return mane_hair.colliders(cu.HEAD + cu.TORSO) + extra


def fringe(root, path):
    """Strand fringe, baked on first use (the procedural hair is not reproducible run to run)."""
    if os.path.exists(path):
        return mane_hair.load_baked(path, root, mane_hair.FRINGE)
    obj = mane_hair.build_mane(um.Skull(cu.HEAD_C, cu.HEAD_R, None), root, fringe_colliders(), mane_hair.FRINGE)
    mane_hair.bake(obj, path)
    return obj


def export_mesh(obj, path):
    """Fitted, trimmed mane for lock_axes.py (root-local coordinates, like HEAD_C)."""
    import numpy as np

    me = obj.data
    v = np.empty(len(me.vertices) * 3, np.float32)
    me.vertices.foreach_get("co", v)
    e = np.empty(len(me.edges) * 2, np.int32)
    me.edges.foreach_get("vertices", e)
    np.savez_compressed(path, vertices=v.reshape(-1, 3), edges=e.reshape(-1, 2), head_centre=np.array(cu.HEAD_C), head_radius=cu.HEAD_R)
    print(f"MESHY_EXPORTED {path}: {len(me.vertices)} vertices, {len(me.edges)} edges")


def strand_mane(root, guides_path, mesh_path, bake_path):
    """The whole mane in strands along the Meshy lock axes; roots where Meshy's mane met the head."""
    import dataclasses

    import numpy as np

    if os.path.exists(bake_path):
        return mane_hair.load_baked(bake_path, root, mane_hair.STRANDS)
    g = np.load(guides_path)["guides"]
    m = np.load(mesh_path)
    v = m["vertices"]
    skin = np.linalg.norm(v - m["head_centre"], axis=1) - float(m["head_radius"])
    dirs = v[skin < 0.03] - m["head_centre"]
    dirs = dirs / np.linalg.norm(dirs, axis=1)[:, None]
    dirs = dirs[:: max(1, len(dirs) // 1500)]

    def mask(u):  # the crest band, plus ~12 deg around every point where the sculpted mane touched the head
        best = float(np.max(dirs @ np.array(u)))
        # st1: Meshy's contact points alone left the back of the skull bare
        phi, across = mane_hair.crest_coords(u)
        # st3: a bare patch remained on the back of the skull beside the crest -> whole upper back
        back = smoothstep(56, 66, phi) * (1.0 - smoothstep(205, 218, phi)) * (1.0 - smoothstep(62.0, 72.0, abs(across)))
        return max(back, smoothstep(math.cos(math.radians(14)), math.cos(math.radians(8)), best))

    groom = dataclasses.replace(mane_hair.STRANDS, mask=mask)
    obj = mane_hair.build_mane(um.Skull(cu.HEAD_C, cu.HEAD_R, None), root, [], groom, given=g)
    mane_hair.bake(obj, bake_path)
    return obj


def debug_bands(obj, scale):
    """Diagnostic paint (--debug-rosette): colour bands of distance to Meshy's horn base, 0.06 Meshy units each."""
    base = cu.HEAD_C + (MESHY_HORN[0] - MESHY_CRANIUM) * scale
    bands = [(1, 0, 0, 1), (1, 0.5, 0, 1), (1, 1, 0, 1), (0, 1, 0, 1), (0, 1, 1, 1), (0, 0, 1, 1), (1, 0, 1, 1)]

    def col(p, n):
        k = int((p - base).length / scale / 0.06)
        return bands[k] if k < len(bands) else (0.9, 0.9, 0.9, 1)

    paint(obj, col)
    studio.assign(obj, studio.mane_material())


# fit10 (judges r9-r11: « pale gap / scalp showing » at the horn base; chibi courses, COURSES.md:
# « inner part of the hair darker, never black — dark purple or blue »): hair lying close to the
# skull is shifted towards DEPTH_HEX by up to DEPTH_MIX, so hollows read as depth, not skin.
DEPTH_HEX = "#6a4fb0"
DEPTH_MIX = _arg("--depth-mix", 0.0)
CAP_MIX = _arg("--cap-mix", 0.0)  # tried at 0.75: the caps read as pasted lilac patches, not used
CAP_SINK = "--cap-sink" in sys.argv
DEPTH_RANGE = (0.02, _arg("--depth-reach", 0.12))  # height above the skull: full depth -> none


# fit10: the pale patch the judges call « scalp showing » at the horn base IS our white scalp
# (measured: depth colouring of the hair left it unchanged), where Meshy had its own horn. Like a
# painted figurine, the scalp round the horn base takes the mane's root colour, deepened.
SCALP_TINT = _arg("--scalp-tint", 0.0)  # mix towards the root colour, 0 = off
SCALP_R = (_arg("--scalp-r", 0.22), _arg("--scalp-r", 0.22) + 0.14)  # full tint -> none, from our horn base
SCALP_EL = (36.0, 46.0)  # elevation fade: the forehead under the fringe stays white


def tint_scalp(head, root):
    import numpy as np

    ca = head.data.color_attributes["Col"]
    cols = np.empty(len(ca.data) * 4, np.float32)
    ca.data.foreach_get("color", cols)
    cols = cols.reshape(-1, 4)
    stops = studio.linear_stops(studio.MANE_STOPS)
    want = studio.lerp_color(studio.ramp(stops, 0.08), studio.hex_linear(DEPTH_HEX), 0.35)
    horn = cu.HEAD_C + sph(0, 54) * cu.HEAD_R
    n = 0
    for v in head.data.vertices:
        d = v.co - cu.HEAD_C
        el = math.degrees(math.asin(max(-1.0, min(1.0, d.z / d.length))))
        w = SCALP_TINT * (1.0 - smoothstep(*SCALP_R, (v.co - horn).length)) * smoothstep(*SCALP_EL, el)
        if w > 0.0:
            cols[v.index] = studio.lerp_color(tuple(cols[v.index]), want, w)
            n += 1
    ca.data.foreach_set("color", cols.ravel())
    print(f"SCALP_TINT {SCALP_TINT}: {n} head vertices")


def colour(obj, head=None):
    from mathutils.bvhtree import BVHTree

    zs = [v.co.z for v in obj.data.vertices]
    top, bottom = max(zs), min(zs)
    stops = studio.linear_stops(studio.MANE_STOPS)
    deep = studio.hex_linear(DEPTH_HEX)
    bvh = BVHTree.FromObject(head, bpy.context.evaluated_depsgraph_get()) if head and DEPTH_MIX else None

    def col(p, n):  # roots (top) pink -> lilac -> tips (bottom) blue, darker and cooler near the skull
        c = studio.ramp(stops, smoothstep(top, bottom, p.z))
        if bvh is None:
            return c
        hit, _, _, dist = bvh.find_nearest(p)
        k = DEPTH_MIX * (1.0 - smoothstep(*DEPTH_RANGE, dist if hit is not None else 1.0))
        return studio.lerp_color(c, deep, k)

    paint(obj, col)
    caps = obj.data.attributes.get("cap")
    if caps is not None and CAP_MIX:
        import numpy as np

        ca = obj.data.color_attributes["Col"]
        cols = np.empty(len(ca.data) * 4, np.float32)
        ca.data.foreach_get("color", cols)
        cols = cols.reshape(-1, 4)
        flags = np.empty(len(caps.data), np.int32)
        caps.data.foreach_get("value", flags)
        d = np.array(deep, np.float32)
        cols[flags == 1] = cols[flags == 1] * (1 - CAP_MIX) + d * CAP_MIX
        ca.data.foreach_set("color", cols.ravel())
        print(f"CAP_SHADE {int(flags.sum())} vertices")
    studio.assign(obj, studio.mane_material())


def main():
    args = sys.argv[sys.argv.index("--") + 1 :]
    glb, out_dir = os.path.abspath(args[0]), os.path.abspath(args[1])
    os.makedirs(out_dir, exist_ok=True)
    scale = float(opt(args, "--scale", 1.45))
    scene = studio.begin(True)
    studio.configure_render(scene, int(opt(args, "--res", 1024)), int(opt(args, "--spp", 64)))
    root, parts, _ = cu.build_unicorn("settled")
    for o in parts:
        if o.name.startswith(("Mane", "Tail")):
            o.hide_render = True
    head = next(o for o in parts if o.name == "Head")
    mane = import_mane(glb, scale, root)
    bpy.context.view_layer.update()
    if "--raw" not in args:
        trim(mane, head, scale)
    if FRINGE_SHIFT:
        lift_fringe(mane)
    if ROSETTE_R and ROSETTE_PRESS:
        press_rosette(mane, head, scale)
    if CROWN_INFLATE:
        inflate_crown(mane, scale)
    if "--export-mesh" in args:
        export_mesh(mane, os.path.abspath(opt(args, "--export-mesh", "")))
        return
    if "--debug-rosette" in args:
        debug_bands(mane, scale)
    else:
        colour(mane, head)
    if SCALP_TINT:
        tint_scalp(head, root)
    hair = [mane] if not FRINGE_CUT else [mane, fringe(root, os.path.abspath(opt(args, "--fringe-bake", os.path.join(out_dir, "fringe.npz"))))]
    if "--guides" in args:  # option 2: strands along the Meshy lock axes replace the sculpted mesh
        mane.hide_render = True
        mesh_npz = os.path.abspath(opt(args, "--mesh", ""))
        hair = [strand_mane(root, os.path.abspath(opt(args, "--guides", "")), mesh_npz, os.path.abspath(opt(args, "--strands-bake", os.path.join(out_dir, "strands.npz")))), hair[1]]
        import numpy as np

        z = np.load(os.path.abspath(opt(args, "--guides", "")))
        per_lock = int(opt(args, "--per-lock", 600))
        hair.append(mane_hair.lock_strands("ManeLocks", z["guides"], z["widths"], root, cu.HEAD_C, cu.HEAD_R, per_lock, studio.MANE_STOPS))
    bpy.context.view_layer.update()
    for k, view in enumerate(opt(args, "--views", ",".join(VIEWS)).split(",")):
        if k == 0:
            studio.stage(scene, parts, view=view)
        else:
            studio.setup_camera(scene, parts, **studio.VIEWS[view])
        bpy.context.view_layer.update()
        for tag, hidden in (("cand", False),) + ((("bald", True),) if "--no-bald" not in args else ()):
            for o in hair:
                o.hide_render = hidden
            studio.finish(scene, out_dir, f"{tag}_{view}")
    print("DONE")


main()
