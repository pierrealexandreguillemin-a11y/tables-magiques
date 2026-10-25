"""Hair-curve mane, every view from ONE baked groom, with its own bald render per view.

Why one groom: Interpolate/Clump Hair Curves do not give the same strands from one Blender run to
the next (strand count, and which strands lead the clumps: the whole groom changes), so the groom
is baked to an .npz on first use and every later render rebuilds it from there.
Why a bald render per view: build_pack.py frames the hair by difference with the bald render; the
bald images in ../target/bald/ were rendered in another session and no longer match pixel for
pixel (the difference covered the whole body, judge6). Rendering both here makes them match by
construction. Framing: the A7 « settled » unicorn, mane and tail hidden (= target/bald_views.py).

  B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
  "$B" -b --python render_views.py -- <out_dir> --bake <groom.npz> [--res 1024] [--spp 64]
Writes cand_<view>_* and bald_<view>_* (gradient + transparent) for 3q, front, side, back.
Pack: python ../harness/build_pack.py "<out>/cand_{view}_gradient.png" <pack> "<out>/bald_{view}_gradient.png"
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "scripts", "blender"))

import bpy  # noqa: E402

import chibi_unicorn as cu  # noqa: E402
import mane_hair  # noqa: E402
import studio  # noqa: E402
import unicorn_mane as um  # noqa: E402

VIEWS = ("3q", "front", "side", "back")


def opt(args, name, default):
    return args[args.index(name) + 1] if name in args else default


def groom(root, path):
    if os.path.exists(path):
        return mane_hair.load_baked(path, root)
    obj = mane_hair.build_mane(um.Skull(cu.HEAD_C, cu.HEAD_R, None), root, mane_hair.colliders(cu.HEAD + cu.TORSO))
    mane_hair.bake(obj, path)
    return obj


def main():
    args = sys.argv[sys.argv.index("--") + 1 :]
    out_dir = os.path.abspath(args[0])
    scene = studio.begin(True)
    studio.configure_render(scene, int(opt(args, "--res", 1024)), int(opt(args, "--spp", 64)))
    root, parts, _ = cu.build_unicorn("settled")
    for o in parts:
        if o.name.startswith(("Mane", "Tail")):
            o.hide_render = True
    hair = groom(root, os.path.abspath(opt(args, "--bake", os.path.join(out_dir, "groom.npz"))))
    bpy.context.view_layer.update()
    for k, view in enumerate(VIEWS):
        if k == 0:
            studio.stage(scene, parts, view=view)  # lights + ground once; they do not move with the view
        else:
            studio.setup_camera(scene, parts, **studio.VIEWS[view])
        bpy.context.view_layer.update()
        for tag, hidden in (("cand", False), ("bald", True)):
            hair.hide_render = hidden
            studio.finish(scene, out_dir, f"{tag}_{view}")
    print("DONE")


main()
