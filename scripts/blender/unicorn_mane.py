"""Mane and tail styles of the chibi unicorn (chibi_unicorn.py), selected with --mane:

  curls  A2 (2026-10-17): round tubes hugging the skull, rolled into spiral curls. The user found
         they "can evoke pool noodles" (uniform round thickness + regular rings).
  locks  A3: flattened, tapering hair locks (elliptical cross-section, width swelling then
         narrowing to a soft point, slight twist) on gentle S-curves, layered on both sides of the
         head, tips rolling outward; a fringe beside the horn; a flowing tuft of a tail.
         Chosen over A2 (2026-10-20), but "a unicorn with dreadlocks" (one thick sweep per lock).
  strands A4: the A3 layout, every lock split into five thinner strands that fan out, with
         staggered lengths, small lifts (layering) and fine pointed tips.
  layered A5: A4 without the smooth underlayer (seen from the front as a band between skull and
         strands), its volume filled by an inner layer of strands pressed closer to the skull.
  filled A6: A5 plus, per side, two locks in the slit between skull and mane seen in 3/4 and one
         lock lying on the side of the skull in front of the mane (user, 2026-10-22: "rajouter
         une mèche", then drawn on the render).
  settled A7: A6 with the side locks brought forward and lowered in cascade, so the lock above
         SIDE_LOCK lies on it instead of standing off with a dark crease (user drawing, 2026-10-22).

Deterministic: no random numbers. Colours: studio.MANE_STOPS (pink -> lilac -> sky).
"""

import math
from dataclasses import dataclass, replace

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


def build_mane_locks(skull, root, mat, make_lock=None, under=hair_underlayer, extra=(), sides=MANE_LEFT + MANE_RIGHT):
    """A3 layout: scalp cap, underlayer (`under`, None = none), then every lock (plus `extra`)
    built by make_lock (default hair_lock; A4 passes split_lock, which returns several strands
    per lock)."""
    make_lock = make_lock or (lambda *a: [hair_lock(*a)])

    def up(p):  # flat side of every lock against the skull
        return p - skull.centre

    def out(p):  # tips flick away from the head and back: seen side-on, never end-on
        side = p - skull.centre
        side.z = 0.0
        return side.normalized() * 0.7 + TIP_BACK

    locks = tuple(sides) + (MANE_NAPE,) + FRINGE + tuple(extra)
    objs = [scalp_cap(skull, root, (66, 90, 115, 140, 165, 185), 0.0, 0.17)]
    if under:
        objs.append(under(skull, root))
    for k, lock in enumerate(locks):
        ctrl = [skull.point(*c) for c in lock.ctrl]
        objs.extend(make_lock(f"ManeLock.{k}", lock, ctrl, up, out, root))
    studio.assign(shapes.join(objs, "Mane"), mat)


# Tail: control points as (back, up, side) offsets from the rump in the tail plane (TAIL_YAW);
# the flat side of each lock faces sideways so the tuft reads wide in profile; tips flick up.
TAIL_LOCKS = (
    Lock(((0, 0, 0), (0.2, 0.24, 0.0), (0.46, 0.2, 0.02), (0.6, -0.04, 0.03), (0.56, -0.26, 0.02)), 0.15, curl=(0.1, 0.4, UP), twist=0.25),
    Lock(((0, 0, 0), (0.22, 0.12, 0.07), (0.44, 0.02, 0.09), (0.52, -0.2, 0.08), (0.46, -0.36, 0.07)), 0.14, curl=(0.09, 0.4, UP), twist=-0.3, t=(0.05, 1.0)),
    Lock(((0, 0, 0), (0.18, 0.02, -0.07), (0.34, -0.12, -0.09), (0.36, -0.34, -0.08)), 0.13, curl=(0.08, 0.4, UP), twist=0.3, t=(0.08, 1.0)),
    Lock(((0, 0, 0), (0.12, -0.04, 0.0), (0.2, -0.2, 0.01), (0.17, -0.4, 0.0)), 0.11, curl=(0.07, 0.4, UP), twist=-0.25, t=(0.1, 1.0)),
)


def build_tail_locks(root, mat, make_lock=None):
    make_lock = make_lock or (lambda *a: [hair_lock(*a)])
    side = UP.cross(TAIL_BACK)
    objs = []
    for k, lock in enumerate(TAIL_LOCKS):
        ctrl = [TAIL_ROOT + TAIL_BACK * b + UP * u + side * s for b, u, s in lock.ctrl]
        objs.extend(make_lock(f"TailLock.{k}", lock, ctrl, lambda p: side, None, root))
    studio.assign(shapes.join(objs, "Tail"), mat)


# ============================================================================= A4: strands
@dataclass(frozen=True)
class Strand:
    """One strand of a split lock: its offset across the lock (in lock half-widths; the spread
    grows from root to tip, see FAN), its length (fraction of the lock), its lift off the lock
    along the skull normal (layers the strands) and its own extra twist (radians, root -> tip)."""

    side: float
    length: float
    lift: float
    twist: float


# A3 locks read as dreadlocks (user, 2026-10-20): one thick sweep each. A4 keeps the A3 layout
# and splits every lock into these strands: thinner, staggered lengths, fanning out, sharp tips.
STRANDS = (
    Strand(-1.0, 0.86, 0.0, 0.3),
    Strand(-0.5, 1.0, 0.03, -0.2),
    Strand(0.0, 0.94, 0.05, 0.15),
    Strand(0.5, 0.97, 0.02, 0.25),
    Strand(1.0, 0.8, 0.04, -0.3),
)
STRAND_WIDTH = 0.5  # strand half-width / lock half-width: neighbours overlap, the lock keeps its volume
FAN = (0.55, 1.0)  # strand spread across the lock (x lock half-width) at the root / at the tip
SINK = 0.045  # strands are thinner than the A3 lock: lowered onto the skull so no hollow opens under them
STRAND_TIP_CONE = 6.0
STRAND_SAMPLES = 100


def strand_width(t):
    """Swells a little after the root, then tapers to a fine point (floor 0.02; A3 lock: 0.08)."""
    return (0.75 + 0.25 * smoothstep(0.0, 0.3, t)) * max(1.0 - t**2.4, 0.0) ** 0.6 + 0.02


def split_lock(name, lock, ctrl, up, out, root):
    """The A3 lock's spine (lock_spine) split into STRANDS: each strand is offset across the lock
    along the sweep's width axis (same frames as hair_lock), lifted off it, cut to its length,
    then swept thin with its own stretch of the lock's colour gradient."""
    spine = lock_spine(ctrl, lock.curl, out)
    n = len(spine) - 1
    frames = shapes.follow_frames(spine, up)
    w = lambda t: lock.width * STRAND_WIDTH * strand_width(t)  # noqa: E731
    h = lambda t: w(t) * (lock.flat + (1 - lock.flat) * t)  # noqa: E731
    t0, t1 = lock.t
    objs = []
    for k, s in enumerate(STRANDS):
        last = max(int(n * s.length), 8)
        pts = []
        for i in range(last + 1):
            t = i / n
            tan, nrm = frames[i]
            a = lock.twist * t
            across = tan.cross(nrm) * math.cos(a) + nrm * math.sin(a)
            spread = lock.width * s.side * (FAN[0] + (FAN[1] - FAN[0]) * t)
            pts.append(spine[i] + across * spread + Vector(up(spine[i])).normalized() * (s.lift - SINK) * smoothstep(0.0, 0.25, t))
        pts = shapes.resample(pts, STRAND_SAMPLES)
        twist = lambda t, s=s: (lock.twist + s.twist) * t  # noqa: E731
        obj = shapes.sweep(f"{name}.{k}", pts, w, h, up, twist=twist, section=lock_section, tip=STRAND_TIP_CONE, segments=20, parent=root)
        m = len(pts) - 1
        paint(obj, gradient_field([(p, w(i / m), t0 + (t1 - t0) * s.length * i / m) for i, p in enumerate(pts)]))
        objs.append(obj)
    return objs


def build_mane_strands(skull, root, mat):
    build_mane_locks(skull, root, mat, split_lock)


def build_tail_strands(root, mat):
    build_tail_locks(root, mat, split_lock)


# ============================================================================= A5: layered strands
# A4 seen from the front (user, 2026-10-21): a smooth lilac band between the skull and the thin
# strands. Measured: it is the UNDERLAYER metaball mass (dropping it removes the band but reopens
# the dark hollow behind the ear in 3/4). A5 drops it and fills that hollow with an inner layer of
# strands instead: the side locks again, pressed closer to the skull, so the band reads as hair.
INNER_LIFT = 0.45  # inner lock control-point lift / outer lock lift
INNER_WIDTH = 0.9  # inner lock half-width / outer lock half-width
INNER_AZ = 6.0  # degrees the inner locks are turned towards the nape, so they show between the outer ones


def inner_lock(lock):
    """The side lock pressed towards the skull (lifts x INNER_LIFT, root kept) and shifted a few
    degrees back, with a slightly darker stretch of the gradient."""
    sign = lambda az: 1 if az >= 0 else -1  # noqa: E731
    ctrl = (lock.ctrl[0],) + tuple((az + sign(az) * INNER_AZ, el, lift * INNER_LIFT) for az, el, lift in lock.ctrl[1:])
    t0, t1 = lock.t
    return replace(lock, ctrl=ctrl, width=lock.width * INNER_WIDTH, t=(t0 + 0.1, t1))


def build_mane_layered(skull, root, mat):
    build_mane_locks(skull, root, mat, split_lock, under=None, extra=[inner_lock(lk) for lk in MANE_LEFT + MANE_RIGHT])


# ============================================================================= A6: filled slit
# A5 vote (user, 2026-10-22): "l'espace entre la tete et la meche gache tout; il faut rajouter une
# meche". Seen in 3/4, a dark slit runs between the back edge of the skull and the mane, from the
# ear down to the cheek: the 3/4 camera sees the skull's outline around az 120-150, where the
# side locks stand 0.13-0.27 off the skull. Two locks per side lie there, close to the skull
# (it01, one lock: the slit narrowed, a gap stayed under the ear; it02 adds the second, nearer the ear).
SLIT_LOCKS = (
    Lock(((0, 118, -0.03), (96, 72, 0.04), (126, 38, 0.06), (138, 6, 0.06), (132, -24, 0.04)), 0.19, curl=(0.1, 0.32, None), twist=-0.2, t=(0.2, 0.85)),
    Lock(((0, 106, -0.03), (80, 76, 0.06), (112, 44, 0.09), (124, 12, 0.09), (120, -18, 0.06)), 0.2, curl=(0.1, 0.32, None), twist=-0.25, t=(0.15, 0.8)),
)


def mirrored(lock):
    return replace(lock, ctrl=tuple((-az, el, lift) for az, el, lift in lock.ctrl))


# it03 (user's drawing on the A6 render, 2026-10-22): the lock wanted is not in the hidden slit
# but in front of the mane, lying on the side of the skull from just behind the ear down to the
# back of the cheek. Mapped with a throwaway projection of skull (az, el) to the 3/4 render: the
# green strip spans az ~70-95, el 55 down to -30 (it03 at az 84-95 sat ~15 degrees too far back).
SIDE_LOCK = Lock(((0, 78, -0.03), (46, 72, 0.06), (70, 54, 0.08), (80, 26, 0.08), (84, -4, 0.07), (82, -32, 0.05)), 0.21, curl=(0.1, 0.32, None), twist=-0.25, t=(0.05, 0.7))


def build_mane_filled(skull, root, mat, sides=MANE_LEFT + MANE_RIGHT):
    inner = [inner_lock(lk) for lk in sides]
    added = [f(lk) for lk in SLIT_LOCKS + (SIDE_LOCK,) for f in (lambda x: x, mirrored)]
    build_mane_locks(skull, root, mat, split_lock, under=None, extra=inner + added, sides=sides)


# ============================================================================= A7: settled layers
# A6 adopted (vote 2026-10-22), then the user drew the lock above SIDE_LOCK (green) offset from it
# (yellow): it stood further off the skull, with a dark crease between them. Moving that lock
# alone opened a new dark gap behind it (it01-it02), so the side locks move together, front ones
# most: (degrees brought forward, lift factor) for MANE_LEFT/RIGHT[0..3] (it03-it04; it04 kept).
CASCADE = ((10, 0.75), (8, 0.8), (6, 0.85), (4, 0.9))


def settled(lock, az_shift, lift_k):
    """A side lock brought forward (az) and lowered (lift), so the layers sit on SIDE_LOCK."""
    s = lambda az: 1 if az >= 0 else -1  # noqa: E731
    return replace(lock, ctrl=(lock.ctrl[0],) + tuple((az - s(az) * az_shift, el, lift * lift_k) for az, el, lift in lock.ctrl[1:]))


def build_mane_settled(skull, root, mat):
    sides = tuple(settled(lk, *CASCADE[i]) for side in (MANE_LEFT, MANE_RIGHT) for i, lk in enumerate(side))
    build_mane_filled(skull, root, mat, sides)


STYLES = {
    "curls": (build_mane_curls, build_tail_curls),
    "locks": (build_mane_locks, build_tail_locks),
    "strands": (build_mane_strands, build_tail_strands),
    "layered": (build_mane_layered, build_tail_strands),
    "filled": (build_mane_filled, build_tail_strands),
    "settled": (build_mane_settled, build_tail_strands),
}
