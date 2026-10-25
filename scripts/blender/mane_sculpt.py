"""S1 mane, --mane sculpt (2026-10-25): sculpted chibi hair, the figurine way.

User: « commence par produire une crinière chibi conforme ». What the chibi references share
(harness/chibi-refs/README.md: Woona, Sameko, Just a Unicorn): sculpted locks, not strands; a few
big masses that hug the head, broken into broad locks with crisp thin edges and pointed tips,
layered (crown over sides over back). A2-A8 built every lock as its own swept tube standing off
the skull (« nouilles », « dreadlocks », « casque » when they merged); here the hair is ONE mass
per tier, grown from a whorl behind the horn:

  - a tier is a closed shell: an outer and an inner surface over the same grid of lanes
    (columns around the whorl) x rows (root -> tip), sewn along the hem;
  - lanes march over the skull from the whorl, and below the skull's middle they turn
    down under gravity (a chibi bob hangs, it does not wrap under the jaw);
  - lanes are grouped into locks: a lock bulges in the middle, thins to a crisp edge at its
    sides (the groove between locks deepens towards the tips), and its lanes stop at lengths
    that make a pointed tip, so the hem is a row of points with V notches between them;
  - tiers stack: each upper tier is shorter, lifted, and turned by half a lock, so its tips
    lie over the notches of the tier under it (the layering of the references).

Deterministic, no random numbers. Colours: studio.MANE_STOPS via unicorn_mane.gradient_field.
"""

import math
from dataclasses import dataclass

import bmesh
import bpy
from mathutils import Matrix, Vector

import shapes
import studio
from face_parts import smoothstep, sph
from unicorn_mane import MANE_STOPS

DOWN = Vector((0.0, 0.0, -1.0))


@dataclass(frozen=True)
class Tier:
    """One layer of the mane. Lengths are arc lengths in skull radii, per lane azimuth around the
    whorl (degrees, 0 = towards the face, + = character's left): `length` is a list of
    (azimuth, length) knots, mirrored to the right side. `locks` per full turn; `phase` turns the
    lock grid (in locks). `lift` / `thick`: outer surface height above the skull and shell
    thickness at the root and at the tip (scene units). `tip`: how much shorter a lock's edge
    lanes are than its centre (pointed tips). `groove`: fraction of the thickness kept at a lock
    edge at the root and at the tip. `sweep`: tip deflection (degrees) per knot azimuth, + =
    towards the face. `flick`: lift added at the very tip (+ out, - in towards the head)."""

    length: tuple
    locks: int
    phase: float
    lift: tuple
    thick: tuple
    tip: float
    groove: tuple
    sweep: tuple
    flick: float
    t: tuple = (0.0, 1.0)


WHORL = sph(0, 74)  # the hair grows from just behind the horn (horn at el 54, ears at az +-50 el 55)
LANES_PER_LOCK = 12
ROWS = 72
# Carving after the sculpted bar (harness/bar-evie, « Evie Sculpt » by veer, user's pick 2026-10-25):
WAVE = (0.05, 1.5)  # sideways S-wave of every lock: amplitude, waves along the lock
RIPPLE = (0.022, 2.2)  # crests across the lock surface (finger waves): amplitude, count
SUB_GROOVE = (0.38, 0.08, 0.4)  # second groove inside each lock: |x| position, width, depth
HOOK = (0.09, 0.07)  # tips curl: sideways (alternating per lock), outward lift
HANG = (0.05, 0.55)  # depth below the skull centre (in radii) where lanes start / finish turning down
HANG_OUT = 0.18  # outward drift of a hanging lane (fraction of its downward step)


def knots(table, az):
    """Piecewise-linear lookup in a mirrored (azimuth, value) table, azimuth in [-180, 180]."""
    a = abs(((az + 180.0) % 360.0) - 180.0)
    for (a0, v0), (a1, v1) in zip(table, table[1:]):
        if a0 <= a <= a1:
            return v0 + (v1 - v0) * smoothstep(0.0, 1.0, (a - a0) / (a1 - a0))
    return table[-1][1]


def lane_basis():
    """Whorl direction and the two tangents there: towards the face (az 0) and towards +X."""
    w = WHORL.normalized()
    fwd = (sph(0, 0) - w * w.dot(sph(0, 0))).normalized()
    left = w.cross(fwd) * -1.0 if w.cross(fwd).x < 0 else w.cross(fwd)
    return w, fwd, left


def march(skull, az, length, sweep_deg, rows):
    """Spine of one lane: from the whorl along the skull towards azimuth `az` (around the whorl),
    turning down under gravity below HANG, bent sideways by sweep_deg towards the tip.
    Returns [(point on the base surface, outward normal)] * (rows + 1)."""
    w, fwd, left = lane_basis()
    a = math.radians(az)
    tan = fwd * math.cos(a) + left * math.sin(a)
    c, r = skull.centre, skull.radius
    p = c + w * r
    ds = length * r / rows
    out = []
    for i in range(rows + 1):
        s = i / rows
        radial = (p - c).normalized()
        flat = p - c
        flat.z = 0.0
        g = smoothstep(HANG[0], HANG[1], (c.z - p.z) / r)
        normal = (radial * (1 - g) + flat.normalized() * g).normalized()
        out.append((p.copy(), normal))
        t_sph = (tan - radial * tan.dot(radial)).normalized()
        bend = Matrix.Rotation(math.radians(sweep_deg) * 2.0 * s / rows, 3, normal)  # total sweep * s^2
        t_sph = bend @ t_sph
        tan = (t_sph * (1 - g) + (DOWN + flat.normalized() * HANG_OUT).normalized() * g).normalized()
        p = p + tan * ds
        if g == 0.0:
            p = c + (p - c).normalized() * r
        else:  # hanging: never closer to the axis than the skull at that height allows
            d = p - c
            reach = math.sqrt(max(r * r - d.z * d.z, 0.0))
            hz = Vector((d.x, d.y, 0.0))
            if hz.length < reach:
                p = c + hz.normalized() * reach + Vector((0, 0, d.z))
    return out


def shell(name, skull, tier, root):
    """Closed shell of one tier (see module docstring), painted root -> tip."""
    n_lanes = tier.locks * LANES_PER_LOCK
    outer, inner, cols = [], [], []
    for j in range(n_lanes):
        u = (j + 0.5) / LANES_PER_LOCK - tier.phase  # lock units, lock grid turned by phase
        x = 2.0 * (u - math.floor(u)) - 1.0  # -1..1 across the lock, 0 = centre
        az = 360.0 * (j + 0.5) / n_lanes - 180.0
        az_c = 360.0 * (math.floor(u) + 0.5 + tier.phase) / tier.locks - 180.0  # lock centre
        length = knots(tier.length, az_c) * (1.0 - tier.tip * abs(x))  # V point
        sweep = knots(tier.sweep, az_c) * (1 if az_c >= 0 else -1)
        bulge = (1.0 - abs(x) ** 2.4) ** 0.5
        spine = march(skull, az, length, sweep, ROWS)
        lock = math.floor(u)
        phi = lock * 2.39996  # golden angle: every lock waves out of step with its neighbours
        hook = 1.0 if lock % 2 else -1.0
        notch = math.exp(-(((abs(x) - SUB_GROOVE[0]) / SUB_GROOVE[1]) ** 2))
        for i, (p, n) in enumerate(spine):
            s = i / ROWS
            ahead = spine[min(i + 1, ROWS)][0] - spine[max(i - 1, 0)][0]
            side = ahead.cross(n).normalized() if ahead.length > 1e-9 else Vector((0, 0, 0))
            on = smoothstep(0.15, 0.45, s)
            tip = smoothstep(0.8, 1.0, s) ** 2
            wave = WAVE[0] * math.sin(2 * math.pi * WAVE[1] * s + phi) * on + HOOK[0] * hook * tip
            ripple = RIPPLE[0] * math.sin(2 * math.pi * RIPPLE[1] * s + 0.5 * phi) * on * bulge
            lift = tier.lift[0] + (tier.lift[1] - tier.lift[0]) * s + tier.flick * smoothstep(0.75, 1.0, s) + ripple + HOOK[1] * tip
            thick = tier.thick[0] + (tier.thick[1] - tier.thick[0]) * s ** 0.8
            keep = tier.groove[0] + (tier.groove[1] - tier.groove[0]) * smoothstep(0.2, 0.9, s)  # smooth crown, locks part lower
            th = thick * (keep + (1 - keep) * bulge) * (1 - SUB_GROOVE[2] * notch * smoothstep(0.3, 0.8, s))
            o = p + n * lift + side * wave
            outer.append(o)
            inner.append(o - n * th)
        cols.append(length)
    verts = outer + inner
    m = ROWS + 1
    N = n_lanes * m
    faces = []
    for j in range(n_lanes):
        k = (j + 1) % n_lanes
        for i in range(ROWS):
            a, b, c, d = j * m + i, k * m + i, k * m + i + 1, j * m + i + 1
            faces.append((a, b, c, d))
            faces.append((N + d, N + c, N + b, N + a))
        faces.append((j * m + ROWS, k * m + ROWS, N + k * m + ROWS, N + j * m + ROWS))  # hem
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    shapes.link(obj, root)
    shapes.set_smooth(obj)
    whorl = skull.centre + WHORL * skull.radius
    reach = max((v - whorl).length for v in outer)
    t0, t1 = tier.t

    def colour(p, n):  # gradient by distance from the whorl point, like a lane's arc length
        s = min((p - whorl).length / reach, 1.0)
        return studio.ramp(MANE_STOPS, t0 + (t1 - t0) * s)

    shapes.paint(obj, colour)
    sub = obj.modifiers.new("Smooth", "SUBSURF")
    sub.levels = sub.render_levels = 1
    return obj


# Lengths (skull radii) per lane azimuth around the whorl: short over the forehead (bangs stop
# above the eyes), framing the cheeks on the sides, longest down the nape.
BANGS = ((0, 0.6), (30, 0.68), (55, 1.35), (90, 2.15), (130, 2.45), (180, 2.6))
TIERS = (
    Tier(BANGS, 12, 0.13, (0.1, 0.07), (0.2, 0.05), 0.2, (0.7, 0.12), ((0, 22), (60, 8), (120, 4), (180, 0)), -0.03, (0.0, 1.0)),
    Tier(tuple((a, l * 0.72) for a, l in BANGS), 10, 0.63, (0.17, 0.12), (0.16, 0.04), 0.24, (0.7, 0.12), ((0, 28), (60, 10), (120, 5), (180, 0)), -0.04, (0.05, 0.8)),
)


def build_mane(skull, root, mat):
    objs = [shell(f"ManeTier.{k}", skull, tier, root) for k, tier in enumerate(TIERS)]
    for o in objs:
        studio.assign(o, mat)
    return objs
