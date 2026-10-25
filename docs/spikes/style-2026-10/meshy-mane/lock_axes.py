"""Lock axes of the fitted Meshy mane -> guide curves for Blender hair (Reeb-graph skeleton).

User, 2026-10-25, option 2: the whole mane in fine strands, with Meshy's shape. Every vertex of
the fitted mane gets its distance to the head measured along the mesh surface (geodesic,
Dijkstra on the edge graph, sources = vertices on our head's surface). Cut into bands of equal
distance, each lock becomes a chain of small rings; the chain of ring centres from the root band
outwards is the lock's axis. Every chain ending in a tip becomes one guide.

System Python (scipy is not in Blender's Python):
  python lock_axes.py <mane_mesh.npz> <guides.npz>
Input: fit_mane.py --export-mesh (vertices, edges, head centre and radius, root-local coords).
Output: guides (k, POINTS, 3), roots on the head sphere, and widths (k, POINTS): the lock's
half-width along the axis (RMS radius of its ring); prints counts.
"""

import sys

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components, dijkstra

BAND = 0.035  # band width along the surface (scene units; the cranium radius is 0.62)
ROOT_SKIN = 0.03  # vertices closer than this to the head sphere are roots
MIN_BANDS = 3  # a chain shorter than this is a stub, not a lock
POINTS = 24  # guide resolution (mane_hair.GUIDE_POINTS)


def graph(v, e):
    w = np.linalg.norm(v[e[:, 0]] - v[e[:, 1]], axis=1)
    n = len(v)
    return coo_matrix((np.r_[w, w], (np.r_[e[:, 0], e[:, 1]], np.r_[e[:, 1], e[:, 0]])), shape=(n, n)).tocsr()


def band_components(v, e, band):
    """Connected pieces of each band: only edges whose two ends share a band are kept."""
    same = band[e[:, 0]] == band[e[:, 1]]
    ee = e[same]
    n = len(v)
    g = coo_matrix((np.ones(len(ee)), (ee[:, 0], ee[:, 1])), shape=(n, n))
    return connected_components(g, directed=False)[1]


def links(e, band, comp):
    """Weighted links between pieces of consecutive bands (lower -> upper)."""
    a, b = e[:, 0], e[:, 1]
    up = band[b] == band[a] + 1
    down = band[a] == band[b] + 1
    lo = np.r_[comp[a[up]], comp[b[down]]]
    hi = np.r_[comp[b[up]], comp[a[down]]]
    pairs, counts = np.unique(np.c_[lo, hi], axis=0, return_counts=True)
    return pairs, counts


MERGE_GROWTH = 6.0  # a parent piece this many times larger than the lock's median piece = the lock joined the mass
INSIDE = 0.06  # a piece whose centre is this close to (or inside) the head sphere has left the lock


def chains(v, band, comp, pairs, counts, centre_head, radius):
    """From each tip, walk towards the head while the piece still belongs to one lock. First
    version walked to band 0: near the roots the whole mane is one ring round the head, its centre
    inside the skull, and every axis converged there (axes.png, 2026-10-25)."""
    ncomp = comp.max() + 1
    centre = np.zeros((ncomp, 3))
    np.add.at(centre, comp, v)
    size = np.bincount(comp, minlength=ncomp)
    centre /= np.maximum(size, 1)[:, None]
    spread = np.zeros(ncomp)  # ring radius: RMS distance of a piece's vertices to its centre
    np.add.at(spread, comp, np.sum((v - centre[comp]) ** 2, axis=1))
    spread = np.sqrt(spread / np.maximum(size, 1))
    cband = np.full(ncomp, -1)
    cband[comp] = band
    best_parent = {}
    for (lo, hi), c in zip(pairs, counts):
        if hi not in best_parent or c > best_parent[hi][1]:
            best_parent[hi] = (lo, c)
    has_child = set(int(lo) for lo, _ in pairs)
    leaves = [c for c in range(ncomp) if cband[c] >= MIN_BANDS and c not in has_child]
    out = []
    for leaf in leaves:
        path = [leaf]
        while path[-1] in best_parent and cband[path[-1]] > 0:
            parent = best_parent[path[-1]][0]
            typical = np.median(size[path])
            if size[parent] > MERGE_GROWTH * typical or np.linalg.norm(centre[parent] - centre_head) < radius + INSIDE:
                break
            path.append(parent)
        if len(path) >= MIN_BANDS:
            axis = centre[path[::-1]]
            widths = spread[path[::-1]]
            out.append((np.vstack([root_point(axis, centre_head, radius), axis]), np.r_[widths[0], widths]))
    return out


def root_point(axis, centre_head, radius):
    """Where the lock meets the head: its first direction prolonged backwards to the head sphere
    (st1: a root straight under the lock made every strand leave the skull at right angles)."""
    start = axis[0]
    back = axis[0] - axis[min(2, len(axis) - 1)]
    back = back / np.linalg.norm(back)
    oc = start - centre_head
    b = oc @ back
    disc = b * b - (oc @ oc - radius * radius)
    if disc >= 0.0:
        t = -b - np.sqrt(disc)
        if t > 0.0:
            return start + back * t
    u = oc / np.linalg.norm(oc)
    return centre_head + u * radius  # the ray misses the head: radial fallback


def resample(poly, n, widths):
    seg = np.linalg.norm(np.diff(poly, axis=0), axis=1)
    s = np.r_[0, np.cumsum(seg)]
    t = np.linspace(0, s[-1], n)
    return np.stack([np.interp(t, s, poly[:, k]) for k in range(3)], axis=1), np.interp(t, s, widths)


def smooth(poly, passes=2):
    p = poly.copy()
    for _ in range(passes):
        p[1:-1] = 0.25 * p[:-2] + 0.5 * p[1:-1] + 0.25 * p[2:]
    return p


def main(src, dst):
    z = np.load(src)
    v, e = z["vertices"].astype(np.float64), z["edges"]
    centre, radius = z["head_centre"], float(z["head_radius"])
    skin = np.linalg.norm(v - centre, axis=1) - radius
    roots = np.flatnonzero(skin < ROOT_SKIN)
    d = dijkstra(graph(v, e), indices=roots, min_only=True)
    reach = np.isfinite(d)
    print(f"LOCK_AXES {len(v)} vertices, {len(roots)} roots, {reach.mean():.1%} reachable, max geodesic {d[reach].max():.2f}")
    band = np.where(reach, np.floor(d / BAND), -1).astype(int)
    keep = band >= 0
    comp = band_components(v, e, band)
    ee = e[keep[e[:, 0]] & keep[e[:, 1]]]
    pairs, counts = links(ee, band, comp)
    polys = chains(v, band, comp, pairs, counts, centre, radius)
    guides, widths = [], []
    for p, w in polys:
        g, gw = resample(smooth(p), POINTS, w)
        u = g[0] - centre
        g[0] = centre + u / np.linalg.norm(u) * radius  # root on the head sphere
        guides.append(g)
        widths.append(gw)
    guides = np.array(guides, np.float32)
    np.savez_compressed(dst, guides=guides, widths=np.array(widths, np.float32))
    ws = np.array(widths)
    print(f"LOCK_AXES lock half-width (ring RMS radius) {ws.min():.3f}-{ws.max():.3f}, median {np.median(ws):.3f}")
    lengths = [np.linalg.norm(np.diff(g, axis=0), axis=1).sum() for g in guides]
    print(f"LOCK_AXES {len(guides)} guides, length {min(lengths):.2f}-{max(lengths):.2f} (median {np.median(lengths):.2f}) -> {dst}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
