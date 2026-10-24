"""A8 mane and tail, --mane crest: the user's pick of 2026-10-24, « structure C, mais avec la
finesse de crinière de A » (bars in docs/spikes/style-2026-10/harness/chibi-refs/).

Structure (C, « Just a Unicorn! »): a crest rising behind the horn and sweeping back, a forelock
falling beside the horn, broad locks packed side by side that fall behind the ear and down the
neck, a tail of the same locks. Finish (A, « Woona »): fine grooves running along every lock,
thin edges, tips split into 2-3 tapered sub-locks of different lengths.

Lock layout reuses unicorn_mane (Lock, lock_spine, gradient_field); deterministic, no random.
"""

import math
from dataclasses import dataclass, replace

from mathutils import Vector

import shapes
import studio
from face_parts import smoothstep
from shapes import paint
from unicorn_mane import LENS, TAIL_BACK, TAIL_LOCKS, TAIL_ROOT, TIP_BACK, UP, Lock, gradient_field, lock_spine, lock_width

GROOVES = 10  # grooves across each face of a lock (A: fine parallel grooves along the locks)
GROOVE_DEPTH = 0.1  # fraction of the local thickness carved by each groove (0.22 read as piped icing, judges it0)
BODY_END = 0.8  # the lock body stops here (fraction of the spine); its sub-locks carry the tip
FORK_START = 0.6  # sub-locks leave the body here, hidden inside it
FORK_WIDTH = 0.5  # sub-lock half-width / lock half-width
FORK_SPREAD = 0.9  # sideways divergence of the outer sub-locks at the tip (x lock half-width)
SEGMENTS = 96  # around a lock: enough samples to resolve GROOVES on both faces
SAMPLES = 160


@dataclass(frozen=True)
class Fork:
    """One sub-lock of a split tip: offset across the lock (-1..1), length (fraction of the
    spine; > 1 runs past the body's tip along its last direction) and extra twist (radians)."""

    side: float
    length: float
    twist: float


FORKS_3 = (Fork(-1.0, 0.86, 0.1), Fork(0.0, 1.12, 0.0), Fork(1.0, 0.97, -0.12))
FORKS_2 = (Fork(-0.8, 1.1, 0.08), Fork(0.8, 0.88, -0.1))


def grooved_section(theta):
    """Unit cross-section: a lens (thin side edges) whose faces carry GROOVES shallow grooves."""
    c, s = math.cos(theta), math.sin(theta)
    groove = math.sin(GROOVES * math.pi * (c + 1) / 2) ** 2
    return c, s * (1 - LENS * c * c) * (1 - GROOVE_DEPTH * groove)


def lens_section(theta):
    """Sub-lock cross-section: the lens without grooves (grooves at that width crumpled, it0)."""
    c, s = math.cos(theta), math.sin(theta)
    return c, s * (1 - LENS * c * c)


def extend(spine, length):
    """The spine cut at `length` (fraction), or prolonged straight past its end when > 1."""
    n = len(spine) - 1
    if length <= 1.0:
        return spine[: max(int(n * length), 8) + 1]
    step = spine[-1] - spine[-2]
    extra = int(n * (length - 1.0))
    return spine + [spine[-1] + step * (k + 1) for k in range(extra)]


def body(name, lock, spine, up, root):
    """The lock up to BODY_END, grooved, its colour following lock.t."""
    pts = spine[: int((len(spine) - 1) * BODY_END) + 1]
    w = lambda s: lock.width * lock_width(s * BODY_END)  # noqa: E731
    h = lambda s: w(s) * (lock.flat + (1 - lock.flat) * s * BODY_END)  # noqa: E731
    obj = shapes.sweep(name, pts, w, h, up, twist=lambda s: lock.twist * s * BODY_END, section=grooved_section, tip=2.0, segments=SEGMENTS, parent=root)
    t0, t1 = lock.t
    m = len(pts) - 1
    paint(obj, gradient_field([(p, w(i / m), t0 + (t1 - t0) * BODY_END * i / m) for i, p in enumerate(pts)]))
    return obj


def fork(name, lock, spine, frames, f, up, root):
    """A sub-lock from FORK_START to f.length, drifting sideways (f.side) and tapering to a point."""
    n = len(spine) - 1
    full = extend(spine, f.length)
    i0 = int(n * FORK_START)
    pts = []
    for i in range(i0, len(full)):
        t = i / n
        tan, nrm = frames[min(i, n)]
        a = lock.twist * min(t, 1.0)
        across = tan.cross(nrm) * math.cos(a) + nrm * math.sin(a)
        drift = lock.width * f.side * FORK_SPREAD * smoothstep(FORK_START, 1.0, t)
        pts.append(full[i] + across * drift)
    pts = shapes.resample(pts, 80)
    span = f.length - FORK_START
    w = lambda s: lock.width * FORK_WIDTH * (max(1.0 - s**1.6, 0.0) ** 0.7 + 0.015)  # noqa: E731
    h = lambda s: w(s) * 0.8  # noqa: E731
    obj = shapes.sweep(name, pts, w, h, up, twist=lambda s: (lock.twist + f.twist) * s, section=lens_section, tip=3.0, segments=32, parent=root)
    t0, t1 = lock.t
    m = len(pts) - 1
    paint(obj, gradient_field([(p, w(i / m), t0 + (t1 - t0) * min(FORK_START + span * i / m, 1.0)) for i, p in enumerate(pts)]))
    return obj


def crest_lock(name, lock, ctrl, up, out, root, forks):
    spine = lock_spine(ctrl, lock.curl, out)
    spine = shapes.resample(spine, SAMPLES)
    frames = shapes.follow_frames(spine, up)
    objs = [body(name, lock, spine, up, root)]
    objs += [fork(f"{name}.f{k}", lock, spine, frames, f, up, root) for k, f in enumerate(forks)]
    return objs


NO_ROLL = (0.05, 0.08, None)  # tips keep their direction: no rolled knob (A7 finding 5)

# (az, el, lift) on the cranium sphere; az > 0 = character's left (camera side), el > 90 on the
# midline continues over the crown to the nape. Roots on the crest, lifts kept low so the locks
# hug the head (« forme du crâne »), neighbours overlapping so no skull shows between them.
CREST = Lock(((0, 76, -0.04), (3, 98, 0.18), (5, 124, 0.22), (7, 150, 0.17), (172, 14, 0.12), (168, -22, 0.08), (164, -56, 0.04)), 0.3, curl=NO_ROLL, twist=0.15, t=(0.0, 0.85))
FORELOCK = Lock(((0, 72, -0.04), (12, 66, 0.07), (24, 56, 0.08), (31, 46, 0.07)), 0.21, curl=NO_ROLL, twist=0.3, t=(0.0, 0.4), flat=0.34)
FORELOCK_FAR = Lock(((0, 74, -0.04), (-12, 64, 0.06), (-20, 52, 0.06)), 0.15, curl=NO_ROLL, twist=-0.25, t=(0.05, 0.35), flat=0.34)
# it0 (judges + checked by eye): side locks at az 113-122 draped the side of the skull down to the
# jaw and merged into one wig-like hull. it1: they fall behind the ear and down the neck (az >= 135),
# narrower, with staggered lengths so their tips break the outline.
NEAR = (
    Lock(((0, 100, -0.04), (122, 60, 0.08), (138, 30, 0.1), (142, 2, 0.09), (138, -24, 0.06)), 0.22, curl=NO_ROLL, twist=-0.2, t=(0.1, 0.7)),
    Lock(((0, 124, -0.04), (148, 52, 0.08), (158, 22, 0.1), (160, -14, 0.09), (156, -50, 0.05)), 0.21, curl=NO_ROLL, twist=0.2, t=(0.2, 0.9)),
    Lock(((0, 148, -0.04), (166, 44, 0.07), (171, 12, 0.09), (172, -30, 0.08), (169, -68, 0.04)), 0.2, curl=NO_ROLL, twist=-0.15, t=(0.3, 1.0)),
)
FAR = (
    Lock(((0, 108, -0.04), (-126, 56, 0.08), (-142, 24, 0.09), (-146, -8, 0.07), (-142, -36, 0.04)), 0.2, curl=NO_ROLL, twist=0.2, t=(0.15, 0.8)),
    Lock(((0, 136, -0.04), (-156, 46, 0.07), (-164, 14, 0.08), (-166, -30, 0.06), (-163, -58, 0.04)), 0.2, curl=NO_ROLL, twist=-0.2, t=(0.25, 0.95)),
)
NAPE = Lock(((0, 168, -0.04), (180, 8, 0.09), (179, -22, 0.09), (177, -62, 0.05)), 0.22, curl=NO_ROLL, t=(0.35, 1.0))
# (lock, forks), back to front: later locks lie over earlier ones
MANE = ((NAPE, FORKS_2), *((lk, FORKS_3) for lk in FAR), *((lk, FORKS_3) for lk in reversed(NEAR)), (CREST, FORKS_3), (FORELOCK_FAR, FORKS_2), (FORELOCK, FORKS_2))


def build_mane(skull, root, mat):
    def up(p):  # flat side of every lock against the skull
        return p - skull.centre

    def out(p):
        side = p - skull.centre
        side.z = 0.0
        return side.normalized() * 0.7 + TIP_BACK

    objs = []
    for k, (lock, forks) in enumerate(MANE):
        ctrl = [skull.point(*c) for c in lock.ctrl]
        objs += crest_lock(f"ManeLock.{k}", lock, ctrl, up, out, root, forks)
    studio.assign(shapes.join(objs, "Mane"), mat)


def build_tail(root, mat):
    """The A3 tail layout, widened into broad grooved locks with split tips and no roll."""
    side = UP.cross(TAIL_BACK)
    objs = []
    for k, lock in enumerate(TAIL_LOCKS):
        lock = replace(lock, width=lock.width * 1.45, curl=(0.05, 0.08, UP))
        ctrl = [TAIL_ROOT + TAIL_BACK * b + UP * u + side * s for b, u, s in lock.ctrl]
        forks = FORKS_3 if k < 2 else FORKS_2
        objs += crest_lock(f"TailLock.{k}", lock, ctrl, lambda p: side, None, root, forks)
    studio.assign(shapes.join(objs, "Tail"), mat)
