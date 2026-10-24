"""Mechanical verdict of a hair review pack, from the judges' JSON (never recomputed by hand).

  python verdict.py <pack-dir>

Reads <pack-dir>/key.json (written by build_pack.py) and <pack-dir>/judge/*.json: one file per
judge pass, the judge's JSON answer saved as is (`H-A_<view>_<order>.json`, `H-B.json`).
Rules (hair-rubric.md, calibration in README.md):
  H-A  an axis is lost when the reference wins it in both orders of the same view;
  H-B  score = max(0, 10 - 3R - M - 0.25m), capped at 4 with any R;
       passes when no R and score >= BAR_SCORE (the reference's own score, measured).
"""

import glob
import json
import os
import sys

BAR_SCORE = 4.5  # reference judged as a candidate, rubric H-v1, 2026-10-24 (README § Calibration)


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def h_a(pack, key):
    lost = []
    for view in sorted({k.split("_")[0] for k in key}):
        files = {o: os.path.join(pack, "judge", f"H-A_{view}_{o}.json") for o in "AB"}
        if not all(os.path.exists(p) for p in files.values()):
            continue
        winners = {}
        for order, path in files.items():
            cand = str(key[f"{view}_{order}"]["candidate"])
            for axis in load(path)["axes"]:
                better = axis["better"]
                side = "tie" if better == "tie" else ("cand" if better == cand else "ref")
                winners.setdefault(axis["id"], []).append(side)
        lost += [f"{view}:{a}" for a, w in winners.items() if w == ["ref", "ref"]]
    return lost


def h_b(pack):
    path = os.path.join(pack, "judge", "H-B.json")
    if not os.path.exists(path):
        return None
    sev = [d["severity"] for d in load(path)["defects"]]
    r, m_major, m_minor = sev.count("R"), sev.count("M"), sev.count("m")
    score = max(0.0, 10 - 3 * r - m_major - 0.25 * m_minor)
    if r:
        score = min(score, 4.0)
    return r, m_major, m_minor, score


def main(pack):
    key = load(os.path.join(pack, "key.json"))
    lost = h_a(pack, key)
    b = h_b(pack)
    n_a = len(glob.glob(os.path.join(pack, "judge", "H-A_*.json")))
    print(f"H-A: {n_a} passes, axes lost in both orders: {lost or 'none'}")
    if b:
        r, m_major, m_minor, score = b
        print(f"H-B: R {r}, M {m_major}, m {m_minor} -> score {score:.2f} (bar {BAR_SCORE})")
    passed = n_a > 0 and not lost and b is not None and b[0] == 0 and b[3] >= BAR_SCORE
    print("FILTER PASSED -> user's forced choice" if passed else "FILTER FAILED")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
