"""Fit the Meshy-generated mane onto the A6 chibi unicorn and render the harness views.

Source: Meshy text-to-3D, Meshy 6, task 01a173f7-a64c-712e-80e6-b4985f3ebca6 (2026-10-25, user's
Pro account, licence « Privé »), prompt in README.md. Meshy ignored « hair only » and made a whole
horse-like unicorn head with the mane: one shell of 423 773 vertices, no material. This script
keeps the mane: Meshy's cranium is scaled to sit inside ours, then its face (a cone in front and
below), its horn and ears (ours stay) and everything hidden inside our head are deleted. Colour:
the existing mane material and gradient (studio.mane_material, MANE_STOPS) painted by height.

  B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
  "$B" -b --python fit_mane.py -- <mane.glb> <out_dir> [--res 1024] [--spp 64] [--scale 1.45]
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
import studio  # noqa: E402
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
INSIDE_MARGIN = 0.01  # keep what lies on our head's surface, drop what is under it


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
    """Meshy skin, face, horn and ears; anything under our head's surface."""
    rel = (p - cu.HEAD_C) / scale
    d = rel - Vector((0.0, 0.0, 0.0))
    if d.length > 1e-6 and math.degrees(d.angle(FACE_AXIS)) < FACE_HALF_ANGLE:
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
    colour(mane)
    bpy.context.view_layer.update()
    for k, view in enumerate(VIEWS):
        if k == 0:
            studio.stage(scene, parts, view=view)
        else:
            studio.setup_camera(scene, parts, **studio.VIEWS[view])
        bpy.context.view_layer.update()
        for tag, hidden in (("cand", False), ("bald", True)):
            mane.hide_render = hidden
            studio.finish(scene, out_dir, f"{tag}_{view}")
    print("DONE")


main()
