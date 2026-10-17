"""Figure-ground contrast of a mascot render against the studio pastel gradient.

Usage:
  blender -b --python scripts/blender/measure_contrast.py -- <render>_transparent.png [more.png ...]

For each transparent render: takes the character's edge band (fully opaque pixels within BAND px
of the silhouette, upper GROUND_CUT of the frame so the floor shadow is excluded), and compares
each pixel with the background gradient the compositor puts behind it at the same position
(studio._gradient_bg, so the measure always matches the composite). Prints the CIELAB dE76
(D65, sRGB) median / mean and the share of edge pixels below dE 10 (hard to separate), for the
whole edge and for its "pearl" part only (edge pixels with chroma < PEARL_CHROMA: the white body,
head and ears, not the pastel mane / gold horn). Also prints the contact-shadow density: for every
column whose lowest opaque pixel is a hoof on the ground, the shadow-catcher alpha CONTACT_GAP
(at 512 px) below it, averaged; plus the mean catcher alpha over the bottom rows (cast shadow).
"""

import os
import sys

import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio  # noqa: E402

BAND = 4
GROUND_CUT = 0.8  # fraction of rows (from the top) kept
PEARL_CHROMA = 14.0
CONTACT_GAP = 3


def srgb_to_lab(rgb):
    lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = lin @ m.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > (6 / 29) ** 3, np.cbrt(xyz), xyz / (3 * (6 / 29) ** 2) + 4 / 29)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def erode(mask, k):
    out = mask.copy()
    for dy in range(-k, k + 1):
        for dx in range(-k, k + 1):
            out &= np.roll(np.roll(mask, dy, 0), dx, 1)
    return out


def measure(path):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    px = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)  # row 0 = bottom
    solid = px[..., 3] > 0.999
    band = solid & ~erode(solid, BAND)
    band[: int(h * (1 - GROUND_CUT))] = False  # drop the bottom rows (hooves on the shadow)
    fg = srgb_to_lab(px[..., :3][band].astype(np.float64))
    d = np.linalg.norm(fg - srgb_to_lab(studio._gradient_bg(w, h)[band].astype(np.float64)), axis=-1)
    pearl = np.hypot(fg[:, 1], fg[:, 2]) < PEARL_CHROMA
    alpha = px[..., 3]
    gap = max(1, round(CONTACT_GAP * h / 512))
    ys, xs = np.nonzero(solid)
    low = np.full(w, h, int)
    np.minimum.at(low, xs, ys)  # lowest opaque row per column (row 0 = bottom)
    ground = low.min()
    cols = np.nonzero(low <= ground + gap)[0]  # columns where a hoof touches the ground
    contact = alpha[np.clip(low[cols] - gap, 0, h - 1), cols]
    cast = alpha[: int(h * (1 - GROUND_CUT))]
    cast = cast[(cast > 0.01) & (cast < 0.999)]
    print(f"SHADOW {os.path.basename(path)}: contact alpha {contact.mean():.2f} (over {cols.size} hoof columns)  cast mean {cast.mean():.2f}")
    for label, sel in (("all", slice(None)), ("pearl", pearl)):
        s = d[sel]
        print(f"CONTRAST {os.path.basename(path)} [{label}]: edge px {s.size}  dE76 median {np.median(s):.1f}  mean {s.mean():.1f}  share<10 {np.mean(s < 10):.0%}")


for p in studio.parse_args(1):
    measure(os.path.abspath(p))
