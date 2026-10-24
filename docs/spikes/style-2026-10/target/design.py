"""Target design of the mane and tail, four views, for paintover.py.

A paint-over MAP, not a render. The locks are NOT drawn by hand any more: project_mane.py defines
them in 3D on the head mesh (user, 2026-10-24: « pourquoi tu ne suis pas la forme du crane ? »)
and projects them with each view's camera into proj_<view>.json; this file turns every projected
lock into a bundle of fine locks (« attention à la finesse de la crinière »), shown only where
the camera sees it. Crest mane, not a cap (« on dirait un casque de cheveux ! »): see
project_mane.py for the layout. Labels: F forelock, L1 the user's lock behind the ear, M main
mass, N nape, R far side, T tail.
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "bald", "bald_{}_gradient.png")


def out(view):
    return os.path.join(HERE, f"target_{view}.png")


def bundle(label, spine, half, t, curl=None, back=False, seed=0.0):
    """One readable clump (gesture = spine, half-width = half) drawn as 3-6 fine locks of varied
    widths converging to the tip."""
    n = max(3, min(6, round(half / 9)))
    sec = {"label": label, "spine": spine, "half": half, "n": n, "t": (t - 0.07, t + 0.07), "min_len": 0.78, "seed": seed, "back": back}
    if curl:
        sec["curl"] = curl
    return sec


def projected(view):
    """Bundles from proj_<view>.json: spine = the projected 3D lock, kept where it is seen."""
    with open(os.path.join(HERE, f"proj_{view}.json"), encoding="utf-8") as f:
        locks = json.load(f)
    res = []
    for k, lk in enumerate(locks):
        pts = [tuple(p) for p in lk["pts"]]
        step = max(1, len(pts) // 12)
        spine = pts[::step] if (len(pts) - 1) % step == 0 else pts[::step] + [pts[-1]]
        sec = bundle(lk["label"], spine, lk["half_px"], lk["t"], tuple(lk["curl"]) if lk["curl"] else None, seed=(k * 0.29) % 1)
        sec["vis_pts"] = list(zip(pts, lk["vis"]))
        res.append(sec)
    return res


TITLES = {"3q": "3/4", "front": "Face", "side": "Profil (cote gauche du perso)", "back": "Dos"}
VIEWS = [(B.format(v), projected(v), [], out(v), title) for v, title in TITLES.items()]
