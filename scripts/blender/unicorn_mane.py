"""Mane and tail styles of the chibi unicorn (chibi_unicorn.py), selected with --mane:

  curls  A2 (2026-10-17): round tubes hugging the skull, rolled into spiral curls. The user found
         they "can evoke pool noodles" (uniform round thickness + regular rings).
  locks  A3: flattened, tapering hair locks (elliptical cross-section, width swelling then
         narrowing to a soft point, slight twist) on gentle S-curves, layered on both sides of the
         head, tips rolling outward; a fringe beside the horn; a flowing tuft of a tail.

Deterministic: no random numbers. Colours: studio.MANE_STOPS (pink -> lilac -> sky).
"""

import math
from dataclasses import dataclass

from mathutils import Vector
from mathutils.kdtree import KDTree

import shapes
import studio
from face_parts import smoothstep, sph
from shapes import ball, metaball_mesh, paint, surface_dir
from studio import ramp

MANE_STOPS = studio.linear_stops(studio.MANE_STOPS)


@dataclass(frozen=True)
class Skull:
    """The cranium sphere the mane is laid on (character faces -Y, Z up) and the head mesh."""

    centre: Vector
    radius: float
    mesh: object

    def point(self, az, el, lift):
        """Point at `lift` above the cranium sphere in direction sph(az, el). On the midline
        (az 0) elevations above 90 continue over the crown towards the nape."""
        return self.centre + sph(az, el) * (self.radius + lift)


def gradient_field(samples):
    """Vertex colour from MANE_STOPS: each vertex takes the gradient parameter t of the nearest
    samples (co, radius, t), inverse-distance weighted (smooth where locks overlap)."""
    tree = KDTree(len(samples))
    for i, (c, _, _) in enumerate(samples):
        tree.insert(c, i)
    tree.balance()

    def col(p, n):
        ws, acc = 0.0, 0.0
        for _, i, d in tree.find_n(p, 8):
            w = 1.0 / max(d - samples[i][1] * 0.6, 1e-3) ** 4
            ws += w
            acc += w * samples[i][2]
        return ramp(MANE_STOPS, acc / ws)

    return col


def crest_dir(phi_deg, lean=0.28):
    """Direction over the skull: phi 0 = forehead, 90 = crown, 180 = nape; leans to +X (camera)."""
    p = math.radians(phi_deg)
    return Vector((lean, -math.cos(p), math.sin(p)))


def scalp_cap(skull, root, phis, lean, radius):
    """Slim metaball ridge along the crest that hides the lock roots; painted pink -> lilac."""
    cap = []
    for k, phi in enumerate(phis):
        hit, n = surface_dir(skull.mesh, skull.centre, crest_dir(phi, lean))
        cap.append((hit + n * 0.05, radius, 0.1 + 0.6 * k / (len(phis) - 1)))
    obj = metaball_mesh("ManeCap", [ball(c, r) for c, r, _ in cap], parent=root)
    paint(obj, gradient_field(cap))
    return obj


# ============================================================================= A2: curls
def skull_arc(skull, d0, d1, lift):
    """curl_path start, tangent and arc that hug the cranium (radius + lift) from d0 to d1."""
    d0, d1 = d0.normalized(), d1.normalized()
    tangent = d1 - d0 * d0.dot(d1)
    arc = {"bend": -d0, "radius": skull.radius + lift, "turns": d0.angle(d1) / (2 * math.pi)}
    return skull.centre + d0 * (skull.radius + lift), tangent, arc


def curl_lock(name, start, tangent, arcs, radius, t0, t1, root, tip=0.28):
    """One tapering lock along curl_path, painted with its own gradient (t0 at root -> t1 at tip;
    painting per lock keeps a neighbour's colour from bleeding where locks touch)."""
    pts = shapes.resample(shapes.curl_path(start, tangent, arcs), 120)
    taper = lambda t: 1.0 - (1.0 - tip) * t**1.3  # noqa: E731
    lock = shapes.tube(name, pts, radius, parent=root, taper=taper, bevel_resolution=6)
    n = len(pts) - 1
    paint(lock, gradient_field([(p, radius * taper(i / n), t0 + (t1 - t0) * i / n) for i, p in enumerate(pts)]))
    return lock


# Mane locks: (root on the crest, end of the skull-hugging part, tube radius, curl radius, curl turns).
# Every lock falls on the character's left (+X, camera side) and rolls outward into a curl.
CURL_LOCKS = (
    (crest_dir(80, 0.12), sph(92, 32), 0.15, 0.17, 0.95),
    (crest_dir(104, 0.12), sph(108, 14), 0.16, 0.18, 0.95),
    (crest_dir(128, 0.12), sph(124, -2), 0.16, 0.18, 0.95),
    (crest_dir(152, 0.1), sph(142, -16), 0.15, 0.17, 0.95),
    (crest_dir(176, 0.05), sph(162, -28), 0.14, 0.16, 0.9),
)


def build_mane_curls(skull, root, mat):
    """Soft curls: a slim scalp cap along the crest, five locks hugging the skull then rolling
    outward into tapering spiral curls, and a flat swirl of forelock on the forehead."""
    objs = [scalp_cap(skull, root, (66, 90, 115, 140, 165, 185), 0.05, 0.17)]
    n_locks = len(CURL_LOCKS)
    for k, (d0, d1, r, cr, turns) in enumerate(CURL_LOCKS):
        start, tangent, arc = skull_arc(skull, d0, d1, r * 0.5)
        curl = {"bend": d1, "radius": cr, "turns": turns, "shrink": 0.6, "drift": 0.08}
        u = 0.15 + 0.7 * k / (n_locks - 1)
        objs.append(curl_lock(f"ManeLock.{k}", start, tangent, [arc, curl], r, u, u + 0.3, root))
    # Forelock: from beside the horn down onto the forehead, then a flat swirl lying on the skin.
    start, tangent, arc = skull_arc(skull, sph(14, 66), sph(26, 42), 0.06)
    swirl = {"bend": Vector((1, 0, 0)), "radius": 0.09, "turns": 1.1, "shrink": 0.62}
    objs.append(curl_lock("Forelock", start, tangent, [arc, swirl], 0.1, 0.0, 0.3, root))
    studio.assign(shapes.join(objs, "Mane"), mat)


TAIL_YAW = math.radians(40)  # tail plane swung towards +X so its curls face the 3/4 camera
TAIL_ROOT = Vector((0.0, 0.56, 0.62))
TAIL_BACK = Vector((math.sin(TAIL_YAW), math.cos(TAIL_YAW), 0))
UP = Vector((0, 0, 1))


def build_tail_curls(root, mat):
    """Two locks from the rump: a big one rising and rolling forward over itself, a smaller one
    hanging down and curling back; pink at the root -> sky at the tips."""
    back, up = TAIL_BACK, UP
    locks = (
        (back * 0.8 + up * 0.6, [{"bend": up, "radius": 0.6, "turns": 0.1}, {"bend": -back, "radius": 0.19, "turns": 0.95, "shrink": 0.6, "drift": 0.08}], 0.14),
        (back * 0.7 - up * 0.7, [{"bend": back, "radius": 0.35, "turns": 0.06}, {"bend": back, "radius": 0.14, "turns": 0.9, "shrink": 0.6, "drift": -0.08}], 0.115),
    )
    objs = [curl_lock(f"TailLock.{k}", TAIL_ROOT, t, arcs, r, 0.0, 1.0, root) for k, (t, arcs, r) in enumerate(locks)]
    studio.assign(shapes.join(objs, "Tail"), mat)


# ============================================================================= A3: hair locks
@dataclass(frozen=True)
class Lock:
    """A hair lock: control points through which it flows (root first), its widest half-width,
    the roll of its tip (radius, turns, bend: None = away from the skull), its twist (radians,
    root -> tip), its stretch of the colour gradient and its flatness (thickness / width of the
    cross-section at the root; rounder towards the tip)."""

    ctrl: tuple
    width: float
    curl: tuple = (0.1, 0.42, None)
    twist: float = 0.3
    t: tuple = (0.0, 1.0)
    flat: float = 0.42


LENS = 0.4  # thins the side edges of the section, so overlapping locks show crisp layered edges
CREASE = 0.26  # depth of the soft groove down the middle of each face (a sculpted hair-clump cue)
TIP_CONE = 3.0  # soft point: the tip cap is a cone this many tip radii long


def lock_width(t):
    """Swells from the root to its widest at ~1/3, then narrows to a soft, still chunky point."""
    return (0.7 + 0.3 * smoothstep(0.0, 0.35, t)) * max(1.0 - t**2.4, 0.0) ** 0.55 + 0.08


def lock_section(theta):
    """Unit cross-section of a lock: a lens (thin side edges) with a shallow central crease."""
    c, s = math.cos(theta), math.sin(theta)
    return c, s * (1 - LENS * c * c) * (1 - CREASE * math.exp(-((c / 0.28) ** 2)))


def lock_spine(ctrl, curl, out):
    """Smooth S-curve through `ctrl`, then the tip rolls towards bend (default `out`)."""
    pts = shapes.catmull_rom(ctrl)
    radius, turns, bend = curl
    tangent = (pts[-1] - pts[-3]).normalized()
    roll = shapes.curl_path(pts[-1], tangent, [{"bend": bend or out(pts[-1]), "radius": radius, "turns": turns, "shrink": 0.55}])
    return shapes.resample(pts + roll[1:], 140)


def hair_lock(name, lock, ctrl, up, out, root):
    """Flattened tapering sweep along lock_spine, painted with its own stretch of the gradient."""
    pts = lock_spine(ctrl, lock.curl, out)
    w = lambda t: lock.width * lock_width(t)  # noqa: E731
    h = lambda t: w(t) * (lock.flat + (1 - lock.flat) * t)  # noqa: E731
    obj = shapes.sweep(name, pts, w, h, up, twist=lambda t: lock.twist * t, section=lock_section, tip=TIP_CONE, segments=32, parent=root)
    n = len(pts) - 1
    t0, t1 = lock.t
    paint(obj, gradient_field([(p, w(i / n), t0 + (t1 - t0) * i / n) for i, p in enumerate(pts)]))
    return obj


# Mane: (az, el, lift) control points around the cranium, az > 0 = character's left (+X, the 3/4
# camera side); the "right" set is mirrored to -X. Roots sit on the midline crest, just under the
# scalp cap; each lock puffs out over the side of the head, comes back in, and its tip rolls out.
MANE_LEFT = (
    Lock(((0, 76, -0.03), (40, 80, 0.16), (88, 52, 0.24), (105, 22, 0.26), (98, -2, 0.2)), 0.19, curl=(0.11, 0.32, None), t=(0.0, 0.45)),
    Lock(((0, 100, -0.03), (70, 74, 0.18), (112, 34, 0.27), (125, 2, 0.27), (116, -30, 0.2)), 0.2, curl=(0.12, 0.32, None), twist=-0.35, t=(0.1, 0.75)),
    Lock(((0, 124, -0.03), (105, 60, 0.16), (138, 18, 0.26), (149, -12, 0.25), (140, -34, 0.18)), 0.19, curl=(0.11, 0.32, None), t=(0.2, 0.8)),
    Lock(((0, 148, -0.03), (140, 50, 0.13), (160, 8, 0.21), (167, -24, 0.22), (158, -52, 0.15)), 0.18, curl=(0.1, 0.32, None), twist=-0.3, t=(0.3, 1.0)),
)
MANE_RIGHT = (
    Lock(((0, 88, -0.03), (-55, 78, 0.16), (-96, 42, 0.23), (-112, 12, 0.25), (-104, -12, 0.19)), 0.18, curl=(0.11, 0.32, None), t=(0.05, 0.55)),
    Lock(((0, 112, -0.03), (-90, 66, 0.16), (-126, 26, 0.25), (-138, -6, 0.25), (-128, -38, 0.18)), 0.19, curl=(0.11, 0.32, None), twist=-0.3, t=(0.15, 0.85)),
    Lock(((0, 136, -0.03), (-125, 54, 0.13), (-152, 12, 0.21), (-160, -18, 0.21), (-150, -44, 0.15)), 0.17, curl=(0.1, 0.32, None), t=(0.25, 0.95)),
)
# Down the nape, then the fringe: two bangs falling forward from behind the horn onto the
# forehead on either side of it, stopping above the eyes and flicking outward.
MANE_NAPE = Lock(((0, 168, -0.03), (180, 6, 0.13), (176, -26, 0.19), (172, -50, 0.13)), 0.18, curl=(0.1, 0.32, None), t=(0.35, 1.0))
FRINGE = (
    Lock(((0, 84, -0.03), (12, 73, 0.1), (24, 59, 0.11), (32, 45, 0.09), (38, 33, 0.06)), 0.17, curl=(0.08, 0.3, Vector((1, -0.3, 0.6))), twist=0.25, t=(0.0, 0.4), flat=0.32),
    Lock(((0, 86, -0.03), (-12, 74, 0.09), (-22, 60, 0.09), (-28, 47, 0.07)), 0.14, curl=(0.07, 0.3, Vector((-1, -0.3, 0.6))), twist=-0.25, t=(0.0, 0.32), flat=0.32),
)


TIP_BACK = Vector((0.0, 0.7, 0.25))  # added to the outward flick of every mane tip (see out())
# Hidden volume under the side locks, (az, el, lift, radius) per side: fills the gap between the
# skull and the lifted locks, which otherwise reads as a dark hollow behind the ears.
UNDERLAYER = ((78, 60, -0.02, 0.16), (105, 34, 0.08, 0.2), (130, 18, 0.08, 0.2), (155, 10, 0.06, 0.19), (120, -6, 0.06, 0.17))


def hair_underlayer(skull, root):
    """Metaball mass under the side locks (mirrored UNDERLAYER), lilac like the locks over it."""
    els = [(skull.point(s * az, el, lift), r, 0.35 + 0.002 * az) for s in (-1, 1) for az, el, lift, r in UNDERLAYER]
    obj = metaball_mesh("ManeUnder", [ball(c, r) for c, r, _ in els], parent=root)
    paint(obj, gradient_field(els))
    return obj


def build_mane_locks(skull, root, mat):
    def up(p):  # flat side of every lock against the skull
        return p - skull.centre

    def out(p):  # tips flick away from the head and back: seen side-on, never end-on
        side = p - skull.centre
        side.z = 0.0
        return side.normalized() * 0.7 + TIP_BACK

    locks = MANE_LEFT + MANE_RIGHT + (MANE_NAPE,) + FRINGE
    objs = [scalp_cap(skull, root, (66, 90, 115, 140, 165, 185), 0.0, 0.17), hair_underlayer(skull, root)]
    for k, lock in enumerate(locks):
        ctrl = [skull.point(*c) for c in lock.ctrl]
        objs.append(hair_lock(f"ManeLock.{k}", lock, ctrl, up, out, root))
    studio.assign(shapes.join(objs, "Mane"), mat)


# Tail: control points as (back, up, side) offsets from the rump in the tail plane (TAIL_YAW);
# the flat side of each lock faces sideways so the tuft reads wide in profile; tips flick up.
TAIL_LOCKS = (
    Lock(((0, 0, 0), (0.2, 0.24, 0.0), (0.46, 0.2, 0.02), (0.6, -0.04, 0.03), (0.56, -0.26, 0.02)), 0.15, curl=(0.1, 0.4, UP), twist=0.25),
    Lock(((0, 0, 0), (0.22, 0.12, 0.07), (0.44, 0.02, 0.09), (0.52, -0.2, 0.08), (0.46, -0.36, 0.07)), 0.14, curl=(0.09, 0.4, UP), twist=-0.3, t=(0.05, 1.0)),
    Lock(((0, 0, 0), (0.18, 0.02, -0.07), (0.34, -0.12, -0.09), (0.36, -0.34, -0.08)), 0.13, curl=(0.08, 0.4, UP), twist=0.3, t=(0.08, 1.0)),
    Lock(((0, 0, 0), (0.12, -0.04, 0.0), (0.2, -0.2, 0.01), (0.17, -0.4, 0.0)), 0.11, curl=(0.07, 0.4, UP), twist=-0.25, t=(0.1, 1.0)),
)


def build_tail_locks(root, mat):
    side = UP.cross(TAIL_BACK)
    objs = []
    for k, lock in enumerate(TAIL_LOCKS):
        ctrl = [TAIL_ROOT + TAIL_BACK * b + UP * u + side * s for b, u, s in lock.ctrl]
        objs.append(hair_lock(f"TailLock.{k}", lock, ctrl, lambda p: side, None, root))
    studio.assign(shapes.join(objs, "Tail"), mat)


STYLES = {"curls": (build_mane_curls, build_tail_curls), "locks": (build_mane_locks, build_tail_locks)}
