"""Crest mane + tail of the target map, defined in 3D ON the head and projected into each view.

Why (user, 2026-10-24: « pourquoi tu ne suis pas la forme du crane ? »): the previous maps were
hand-drawn per view in 2D, so nothing tied the locks to the skull. Here every lock is a 3D curve:
its waypoints are directions from the cranium centre, joined along great circles, and every point
is snapped onto the real head mesh (ray from the centre) plus a small lift, so the lock follows
the head's actual shape. Past its last skull waypoint a lock leaves the head and falls. The same
3D locks are projected with the A7 camera of each view; points hidden by the head are flagged
(ray cast against the bald character).

  B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
  for v in 3q front side back; do "$B" -b --python project_mane.py -- $v; done
  -> proj_<view>.json next to this file (read by design.py)
"""

import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "scripts", "blender"))

import bpy  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
from mathutils import Vector  # noqa: E402

import chibi_unicorn as cu  # noqa: E402
import studio  # noqa: E402
from face_parts import sph  # noqa: E402
from shapes import surface_dir  # noqa: E402

UP = Vector((0, 0, 1))
TAIL_YAW = math.radians(40)
TAIL_BACK = Vector((math.sin(TAIL_YAW), math.cos(TAIL_YAW), 0))
TAIL_SIDE = UP.cross(TAIL_BACK)

# Mane locks: (label, waypoints (az, el, lift) on the head, fall, half-width, colour t, curl).
# az 0 = front, + = character's left (+X), 180 = back; el + = up. Crest = az 0 / 180 midline.
# fall = how far the lock drops after leaving the head (world units; head radius 0.62).
MANE = [
    ("F1", [(0, 84, 0.03), (-10, 77, 0.07), (-24, 66, 0.08), (-34, 56, 0.07), (-40, 47, 0.05)], 0.0, 0.085, 0.05, (18, 0.9, 1)),
    ("F2", [(0, 82, 0.03), (9, 73, 0.06), (15, 63, 0.06), (17, 56, 0.04)], 0.0, 0.045, 0.12, None),
    ("L1", [(0, 84, 0.03), (46, 72, 0.06), (70, 54, 0.08), (80, 26, 0.08), (84, -4, 0.07), (82, -32, 0.05)], 0.0, 0.065, 0.2, None),
    ("M1", [(0, 88, 0.03), (60, 72, 0.08), (100, 46, 0.1), (118, 16, 0.1), (122, -14, 0.07)], 0.32, 0.085, 0.4, None),
    ("M2", [(0, 90, 0.03), (90, 76, 0.09), (128, 46, 0.11), (140, 16, 0.1), (142, -16, 0.07)], 0.36, 0.08, 0.55, (22, 0.9, 1)),
    ("M3", [(180, 78, 0.03), (140, 62, 0.09), (154, 38, 0.11), (160, 10, 0.1), (162, -20, 0.07)], 0.3, 0.075, 0.65, None),
    ("N1", [(180, 62, 0.03), (172, 46, 0.08), (174, 22, 0.09), (176, -6, 0.08), (178, -30, 0.06)], 0.24, 0.08, 0.75, None),
    ("R1", [(0, 88, 0.03), (-70, 72, 0.07), (-110, 46, 0.09), (-126, 16, 0.08), (-130, -14, 0.06)], 0.22, 0.06, 0.5, None),
    ("R2", [(180, 70, 0.03), (-150, 52, 0.07), (-160, 26, 0.08), (-164, -6, 0.06)], 0.2, 0.055, 0.7, None),
]
# Tail: world offsets (back, up, side) from the rump, in the tail plane swung towards the camera.
TAIL = [
    ("T1", [(0, 0, 0), (0.18, 0.22, 0), (0.45, 0.22, 0.02), (0.62, 0.0, 0.03), (0.6, -0.3, 0.02)], 0.1, 0.3, (24, 0.9, -1)),
    ("T2", [(0, 0, 0), (0.2, 0.1, 0.06), (0.4, 0.0, 0.08), (0.48, -0.22, 0.07), (0.42, -0.4, 0.06)], 0.07, 0.6, None),
    ("T3", [(0, 0, 0), (0.14, -0.02, -0.06), (0.26, -0.16, -0.08), (0.27, -0.36, -0.07)], 0.045, 0.85, None),
]


def slerp(a, b, f):
    a, b = a.normalized(), b.normalized()
    w = math.acos(max(-1.0, min(1.0, a.dot(b))))
    if w < 1e-6:
        return a
    return (a * math.sin((1 - f) * w) + b * math.sin(f * w)) / math.sin(w)


def on_head(head, centre, waypoints, steps=10):
    """Waypoints joined along great circles, every point snapped onto the head surface + lift."""
    pts = []
    for (az0, el0, l0), (az1, el1, l1) in zip(waypoints, waypoints[1:]):
        d0, d1 = sph(az0, el0), sph(az1, el1)
        for k in range(steps):
            f = k / steps
            hit, n = surface_dir(head, centre, slerp(d0, d1, f))
            pts.append(hit + n * (l0 + (l1 - l0) * f))
    az, el, lift = waypoints[-1]
    hit, n = surface_dir(head, centre, sph(az, el))
    pts.append(hit + n * lift)
    return pts


def fall(pts, centre, length):
    """Leave the head: out and down, then swing back in a little (opposite curve)."""
    if length <= 0:
        return pts
    e = pts[-1]
    out = e - centre
    out.z = 0
    out = out.normalized()
    for f in (0.35, 0.7, 1.0):
        pts.append(e + out * (0.16 * math.sin(math.pi * f * 0.8)) - UP * length * f)
    return pts


def main():
    view = sys.argv[sys.argv.index("--") + 1]
    studio.VIEWS["back"] = {**studio.CAMERA, "azimuth_deg": 160.0}
    scene = studio.begin(True)
    studio.configure_render(scene, 1024, 64)  # same pixel space as the bald renders (bald_views.py)
    root, parts, _ = cu.build_unicorn("settled")
    cam = studio.stage(scene, parts, view=view)  # framed with mane + tail, exactly as A7
    for o in [o for o in parts if o.name.startswith(("Mane", "Tail"))]:
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.context.view_layer.update()
    lift = Vector((0, 0, root.location.z))
    centre = cu.HEAD_C + lift
    head = next(o for o in root.children if o.name.startswith("Head"))
    locks = []
    for label, wps, drop, half, t, curl in MANE:
        locks.append((label, fall(on_head(head, centre, wps), centre, drop), half, t, curl))
    rump = Vector((0.0, 0.56, 0.62)) + lift
    for label, offs, half, t, curl in TAIL:
        locks.append((label, [rump + TAIL_BACK * b + UP * u + TAIL_SIDE * s for b, u, s in offs], half, t, curl))

    res = scene.render.resolution_x
    depsgraph = bpy.context.evaluated_depsgraph_get()
    cam_loc = cam.matrix_world.translation
    tan_half = cam.data.sensor_height / 2 / cam.data.lens
    out = []
    for label, pts, half, t, curl in locks:
        pix, vis, ppu = [], [], []
        for p in pts:
            v = world_to_camera_view(scene, cam, p)
            pix.append((round(v.x * res, 1), round((1 - v.y) * res, 1)))
            ppu.append(res / (2 * v.z * tan_half))
            ray = p - cam_loc
            hit, *_ = scene.ray_cast(depsgraph, cam_loc, ray.normalized(), distance=ray.length - 0.02)
            vis.append(not hit)
        out.append({"label": label, "pts": pix, "vis": vis, "half_px": round(half * sum(ppu) / len(ppu), 1), "t": t, "curl": curl})
    path = os.path.join(HERE, f"proj_{view}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=0)
    print("WROTE", path, len(out), "locks")


main()
