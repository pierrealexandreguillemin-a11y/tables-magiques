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
MESHY_HORN = (Vector((0.0, -0.48, 0.47)), Vector((0.0, -0.97, 0.52)), 0.1)  # capsule base, tip, radius (pixels on the grid views)
MESHY_EARS = tuple((Vector((x, -0.35, 0.40)), Vector((x * 1.33, -0.42, 0.70)), 0.1) for x in (-0.27, 0.27))
# capsules, not spheres: spheres sliced the locks around them (fit2: torn « petals » around the horn)
HANG = 0.72  # vertical squash of the hanging locks (fit1 fell past the chest)
INSIDE_MARGIN = 0.01
# Meshy's fringe and the rolls around its horn: refused (fit5 judges, R `helmet` « rolled cap »;
# user: « la frange … il faut des mèches »). Cut in front of the crown, replaced by FRINGE strands.
FRINGE_CUT_PHI = 100.0
FRINGE_CUT_ACROSS = 55.0  # keep what lies on our head's surface, drop what is under it


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


def capsule_distance(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


def doomed(p, scale, head_bvh):
    """Meshy skin, face, horn and ears, its fringe (replaced by strands); anything under our
    head's surface."""
    rel = (p - cu.HEAD_C) / scale
    d = rel - Vector((0.0, 0.0, 0.0))
    if d.length > 1e-6 and math.degrees(d.angle(FACE_AXIS)) < FACE_HALF_ANGLE:
        return True
    if d.length > 1e-6:
        phi, across = mane_hair.crest_coords(d.normalized())
        if phi < FRINGE_CUT_PHI and abs(across) < FRINGE_CUT_ACROSS:
            return True
    q = rel + MESHY_CRANIUM
    if any(capsule_distance(q, a, b) < r for a, b, r in (MESHY_HORN, *MESHY_EARS)):
        return True
    hit, normal, _, _ = head_bvh.find_nearest(p)
    return hit is not None and (p - hit).dot(normal) < INSIDE_MARGIN


def trim(obj, head, scale):
    from mathutils.bvhtree import BVHTree

    dg = bpy.context.evaluated_depsgraph_get()
    head_bvh = BVHTree.FromObject(head, dg)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    kill = [v for v in bm.verts if doomed(v.co, scale, head_bvh)]
    print(f"MESHY_TRIM {len(kill)} of {len(bm.verts)} vertices removed")
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    # close the cut edges: an open hair shell shows its dark inside (fit4: hollows by the ears)
    rim = [e for e in bm.edges if e.is_boundary]
    filled = bmesh.ops.holes_fill(bm, edges=rim, sides=0)["faces"]
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


def colour(obj):
    zs = [v.co.z for v in obj.data.vertices]
    top, bottom = max(zs), min(zs)
    stops = studio.linear_stops(studio.MANE_STOPS)

    def col(p, n):  # roots (top) pink -> lilac -> tips (bottom) blue
        return studio.ramp(stops, smoothstep(top, bottom, p.z))

    paint(obj, col)
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
    trim(mane, head, scale)
    if "--export-mesh" in args:
        export_mesh(mane, os.path.abspath(opt(args, "--export-mesh", "")))
        return
    colour(mane)
    hair = [mane, fringe(root, os.path.abspath(opt(args, "--fringe-bake", os.path.join(out_dir, "fringe.npz"))))]
    if "--guides" in args:  # option 2: strands along the Meshy lock axes replace the sculpted mesh
        mane.hide_render = True
        mesh_npz = os.path.abspath(opt(args, "--mesh", ""))
        hair = [strand_mane(root, os.path.abspath(opt(args, "--guides", "")), mesh_npz, os.path.abspath(opt(args, "--strands-bake", os.path.join(out_dir, "strands.npz")))), hair[1]]
        import numpy as np

        z = np.load(os.path.abspath(opt(args, "--guides", "")))
        per_lock = int(opt(args, "--per-lock", 600))
        hair.append(mane_hair.lock_strands("ManeLocks", z["guides"], z["widths"], root, cu.HEAD_C, cu.HEAD_R, per_lock, studio.MANE_STOPS))
    bpy.context.view_layer.update()
    for k, view in enumerate(VIEWS):
        if k == 0:
            studio.stage(scene, parts, view=view)
        else:
            studio.setup_camera(scene, parts, **studio.VIEWS[view])
        bpy.context.view_layer.update()
        for tag, hidden in (("cand", False), ("bald", True)):
            for o in hair:
                o.hide_render = hidden
            studio.finish(scene, out_dir, f"{tag}_{view}")
    print("DONE")


main()
