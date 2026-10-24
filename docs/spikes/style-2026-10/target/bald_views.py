"""The A7 unicorn rendered WITHOUT mane and tail, same framing as A7 (camera framed with mane +
tail, then those two hidden): base images for the paint-over target (paintover.py). Writes
bald_<view>_gradient.png and bald_<view>_transparent.png (-> alpha mask, see below), and prints the screen
position of skull landmarks (az, el) used to place the clumps in design.py.

  B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
  for v in 3q front side back; do "$B" -b --python bald_views.py -- bald $v; done
  python -c "from PIL import Image; [Image.open(f'bald/bald_{v}_transparent.png').getchannel('A').save(f'bald/bald_{v}_alpha.png') for v in ('3q','front','side','back')]"
  rm bald/*_transparent.png   (Blender's Python has no Pillow, hence the separate step)
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "scripts", "blender"))

import bpy  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402

import chibi_unicorn as cu  # noqa: E402
import studio  # noqa: E402
import unicorn_mane as um  # noqa: E402

args = sys.argv[sys.argv.index("--") + 1 :]
out_dir, view = os.path.abspath(args[0]), args[1]
studio.VIEWS["back"] = {**studio.CAMERA, "azimuth_deg": 160.0}

scene = studio.begin(True)
studio.configure_render(scene, 1024, 64)
root, parts, marks = cu.build_unicorn("settled")
cam = studio.stage(scene, parts, view=view)
for o in parts:
    if o.name.startswith(("Mane", "Tail")):
        o.hide_render = True
bpy.context.view_layer.update()

res = scene.render.resolution_x
skull = um.Skull(cu.HEAD_C, cu.HEAD_R, None)
for az in range(-180, 181, 30):
    for el in (90, 60, 30, 0, -30):
        p = skull.point(az, el, 0.0)
        p.z += root.location.z
        v = world_to_camera_view(scene, cam, p)
        print(f"SKULL az {az:4d} el {el:3d} -> x {v.x * res:7.1f} y {(1 - v.y) * res:7.1f}")
studio.finish(scene, out_dir, f"bald_{view}")
print("DONE", view)
