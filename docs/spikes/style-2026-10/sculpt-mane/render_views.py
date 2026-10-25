"""Render a mesh mane style (chibi_unicorn --mane <style>) from the four review views, plus the
same character bald at the same cameras (build_pack.py frames the hair by difference).

  B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
  "$B" -b --python render_views.py -- <out_dir> [--mane sculpt] [--res 512] [--spp 32] [--views 3q,front,side,back] [--no-bald]
Writes cand_<view>_* and bald_<view>_* (gradient + transparent).
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "scripts", "blender"))

import bpy  # noqa: E402

import chibi_unicorn as cu  # noqa: E402
import studio  # noqa: E402


def opt(args, name, default):
    return args[args.index(name) + 1] if name in args else default


def main():
    args = sys.argv[sys.argv.index("--") + 1 :]
    out_dir = os.path.abspath(args[0])
    os.makedirs(out_dir, exist_ok=True)
    scene = studio.begin(True)
    studio.configure_render(scene, int(opt(args, "--res", 512)), int(opt(args, "--spp", 32)))
    root, parts, _ = cu.build_unicorn(opt(args, "--mane", "sculpt"))
    hair = [o for o in parts if o.name.startswith("Mane")]
    for k, view in enumerate(opt(args, "--views", "3q,front,side,back").split(",")):
        if k == 0:
            studio.stage(scene, parts, view=view)  # lights + ground once; they do not move with the view
        else:
            studio.setup_camera(scene, parts, **studio.VIEWS[view])
        bpy.context.view_layer.update()
        for tag, hidden in (("cand", False), ("bald", True)):
            if hidden and "--no-bald" in args:
                continue
            for o in hair:
                o.hide_render = hidden
            studio.finish(scene, out_dir, f"{tag}_{view}")
    print("DONE")


main()
