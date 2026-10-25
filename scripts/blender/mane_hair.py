"""--mane hair: mane grown as Blender hair curves (proposal of 2026-10-25,
docs/spikes/style-2026-10/proposal-hair-curves/). Inspiration: the Meshy « Midnight Ponytail »
render (full mass, layers, grouped locks, tapered tips, ragged outline), transposed to a chibi
unicorn: pastel, chibi length, 15-25 readable locks.

Guides are not placed lock by lock: each one grows from a root on the crest, steps along the skull
under gravity and is pushed out of the head and body (collision ellipsoids), so the flow follows
the skull by construction. Blender's procedural hair node groups then fill the mass between guides
(Interpolate, roots limited to the crest band by a density mask), group strands into locks (Clump),
loosen the tips (Frizz) and taper them (Set Hair Curve Profile).

Deterministic: fixed seeds everywhere. Blender 5.2 API notes: proposal-hair-curves/README.md.
"""

import math
import os
from dataclasses import dataclass

import bpy
import numpy as np
from mathutils import Vector

import shapes
import studio
from face_parts import smoothstep

ASSETS = os.path.join(os.path.dirname(bpy.app.binary_path), "5.2", "datafiles", "assets", "nodes", "procedural_hair_node_assets.blend")
GROUPS = ("Attach Hair Curves to Surface", "Interpolate Hair Curves", "Clump Hair Curves", "Hair Curves Noise", "Frizz Hair Curves", "Trim Hair Curves", "Set Hair Curve Profile")
GUIDE_POINTS = 24
GRAVITY = Vector((0.0, 0.0, -1.0))
MASK_ATTR = "mane_mask"


@dataclass(frozen=True)
class Collider:
    """Ellipsoid the guides are pushed out of, with a clearance (the hair layer's thickness)."""

    centre: Vector
    radii: Vector

    def push_out(self, p, clearance):
        d = p - self.centre
        r = Vector((self.radii.x + clearance, self.radii.y + clearance, self.radii.z + clearance))
        q = Vector((d.x / r.x, d.y / r.y, d.z / r.z))
        k = q.length
        return p if k >= 1.0 or k == 0.0 else self.centre + Vector((d.x / k, d.y / k, d.z / k))


@dataclass(frozen=True)
class Layer:
    """One family of guides. phis: positions along the crest (degrees, 0 = forehead level,
    90 = crown, 180 = back of the skull level). offsets: azimuth offsets across the crest (deg).
    side: lateral pull (+X = character's left = camera side). length in scene units."""

    phis: tuple
    offsets: tuple
    length: float
    lift: float
    clearance: float
    side: float
    back: float


@dataclass(frozen=True)
class Groom:
    """A hair piece: guide layers, where roots may grow (mask on the cranium), node-group settings
    (inputs by their UI names), colour stops root -> tip, share of the side pull that always goes
    to +X (the camera side)."""

    name: str
    layers: tuple
    mask: object
    interpolate: dict
    clump: dict
    noise: dict
    frizz: dict
    profile: dict
    stops: tuple
    side_bias: float
    trim: dict = None  # Trim Hair Curves inputs, or None


def crest_coords(u):
    """(phi, across) in degrees of a unit direction from the cranium centre (see crest_point)."""
    phi = math.degrees(math.atan2(u.z, -u.y)) % 360.0
    return phi, math.degrees(math.asin(max(-1.0, min(1.0, u.x))))


def crest_mask(u):
    """Band along the midline from behind the horn to below the back of the skull."""
    phi, across = crest_coords(u)
    along = smoothstep(56, 64, phi) * (1.0 - smoothstep(190, 202, phi))
    width = 34.0 + 8.0 * smoothstep(90, 160, phi)
    return along * (1.0 - smoothstep(width - 6.0, width, abs(across)))


def fringe_mask(u):
    """Front of the crest, behind the horn: the roots of a fringe falling over the forehead."""
    phi, across = crest_coords(u)
    along = smoothstep(56, 62, phi) * (1.0 - smoothstep(112, 120, phi))  # past the Meshy cut (phi 100)
    return along * (1.0 - smoothstep(36.0, 42.0, abs(across)))


# Top layer: long, lifts off the crown, falls behind the ear to the neck. Under-layer: short,
# close to the skull, fills the mass under it. Forelock: falls forward beside the horn.
MANE = Groom(
    name="ManeHair",
    layers=(
        Layer(phis=(80, 104, 128, 152, 176, 196), offsets=(-28, -12, 4, 20, 36), length=0.75, lift=0.45, clearance=0.06, side=0.5, back=0.4),
        Layer(phis=(70, 88, 106, 124, 142, 160, 178, 196), offsets=(-24, -10, 4, 18, 32), length=1.05, lift=0.9, clearance=0.13, side=0.55, back=0.3),
        Layer(phis=(60, 66, 72), offsets=(-4, 8, 20), length=0.42, lift=0.8, clearance=0.06, side=0.8, back=-0.7),
    ),
    mask=crest_mask,
    interpolate={"Density": 20000.0, "Interpolation Guides": 4, "Distance to Guides": 0.5, "Seed": 7},
    clump={"Factor": 0.88, "Shape": 0.5, "Tip Spread": 0.014, "Clump Offset": 0.0, "Distance Threshold": 0.6, "Seed": 11, "Guide Distance": 0.2},
    noise={"Factor": 0.6, "Distance": 0.025, "Shape": 0.0, "Scale": 1.2, "Seed": 3},  # whole locks wave together (low scale)
    frizz={"Factor": 0.25, "Distance": 0.012, "Shape": 0.9, "Seed": 5},  # loose strands at the tips only
    profile={"Radius": 0.0045, "Shape": 0.6},
    stops=studio.MANE_STOPS,
    side_bias=0.35,
)
# Fringe (user 2026-10-25: « la frange ... il faut des mèches »; bar = the fine locks of the Meshy
# example): fine strands from behind the horn, falling forward over the forehead to the brow,
# parting both ways around the horn; many thin locks; pink -> lilac like the top of the mane.
FRINGE = Groom(
    name="FringeHair",
    layers=(
        # fr1: 0.4-0.5 long, close clearance -> a fuzzy band like an eyebrow; longer, lifted at the root
        Layer(phis=(70, 82, 94, 106, 116), offsets=(-40, -26, -12, 0, 12, 26, 40), length=0.68, lift=0.8, clearance=0.06, side=0.55, back=-0.8),
        Layer(phis=(62, 72, 84), offsets=(-32, -16, 0, 16, 32), length=0.55, lift=0.5, clearance=0.03, side=0.45, back=-0.9),
    ),
    mask=fringe_mask,
    interpolate={"Density": 40000.0, "Interpolation Guides": 3, "Distance to Guides": 0.3, "Seed": 7},
    clump={"Factor": 1.0, "Shape": 0.8, "Tip Spread": 0.004, "Clump Offset": 0.0, "Distance Threshold": 0.4, "Seed": 11, "Guide Distance": 0.11},
    noise={"Factor": 0.5, "Distance": 0.012, "Shape": 0.0, "Scale": 2.0, "Seed": 3},
    frizz={"Factor": 0.3, "Distance": 0.008, "Shape": 0.9, "Seed": 5},
    profile={"Radius": 0.0038, "Shape": 0.6},
    stops=((0.0, studio.MANE_STOPS[0][1]), (1.0, studio.MANE_STOPS[1][1])),
    side_bias=0.0,
)
# Strands along given guides (the lock axes of the Meshy mane, user 2026-10-25 option 2): the
# shape comes from the guides; mask = where the sculpted mane met the head (set by the caller).
STRANDS = Groom(
    name="ManeStrands",
    layers=(),
    mask=crest_mask,
    interpolate={"Density": 30000.0, "Interpolation Guides": 3, "Distance to Guides": 0.6, "Seed": 7},
    # st1: Factor 0.85 / Guide Distance 0.1 / frizz 0.3 read as a ball of fur, no locks
    clump={"Factor": 1.0, "Shape": 0.6, "Tip Spread": 0.012, "Clump Offset": 0.0, "Distance Threshold": 0.6, "Seed": 11, "Guide Distance": 0.15},
    noise={"Factor": 0.4, "Distance": 0.012, "Shape": 0.0, "Scale": 1.5, "Seed": 3},
    frizz={"Factor": 0.15, "Distance": 0.008, "Shape": 0.95, "Seed": 5},
    profile={"Radius": 0.0035, "Shape": 0.6},
    stops=studio.MANE_STOPS,
    side_bias=0.0,
    # st4: a smooth dome at full length (guides streaming out); st5: trimmed to 0.45 it read as a
    # fuzz cap. Now full length again, the guides droop (lock_axes.DROOP) so it lies on the head
)


def colliders(elements):
    """Collision ellipsoids from metaball element dicts (shapes.ball / shapes.ellipsoid)."""
    out = []
    for e in elements:
        r = e["radius"] * shapes.META_SURFACE
        size = e.get("size", (1.0, 1.0, 1.0))
        out.append(Collider(Vector(e["co"]), Vector((r * size[0], r * size[1], r * size[2]))))
    return out


def crest_point(centre, radius, phi, offset):
    """Root on the cranium: phi along the midline (0 = forehead, 90 = top), offset across it."""
    p = math.radians(phi)
    midline = Vector((0.0, -math.cos(p), math.sin(p)))
    across = Vector((1.0, 0.0, 0.0))
    o = math.radians(offset)
    return centre + (midline * math.cos(o) + across * math.sin(o)).normalized() * radius


def grow_guide(root, normal, layer, colliders, across, side_bias):
    """Steps from the root: starts along normal (lift) + backwards, bends under gravity and the
    side pull, every point pushed out of the colliders by the layer's clearance. `across` (-1..1)
    = root position across the crest: strands fall to their own side, biased to +X."""
    back = Vector((0.0, layer.back, 0.0))
    side = Vector((layer.side * (side_bias + (1.0 - side_bias) * across), 0.0, 0.0))
    d = (normal * layer.lift + back + side * 0.3).normalized()
    pts = [root.copy()]
    n = GUIDE_POINTS - 1
    step = layer.length / n
    for k in range(n):
        s = (k + 1) / n
        d = (d + (GRAVITY * 0.9 + side) * (step / 0.1) * smoothstep(0.0, 0.5, s)).normalized()
        p = pts[-1] + d * step
        for c in colliders:
            # volume at the root, then the lock settles back towards the head (it4: a full-length
            # clearance floated the side locks off the skull as a horizontal brim)
            p = c.push_out(p, layer.clearance * smoothstep(0.0, 0.25, s) * (1.0 - 0.7 * smoothstep(0.3, 0.8, s)))
        d = (p - pts[-1]).normalized()
        pts.append(p)
    return pts


def guides(centre, radius, colliders, groom):
    out = []
    for layer in groom.layers:
        for phi in layer.phis:
            for off in layer.offsets:
                root = crest_point(centre, radius, phi, off)
                across = off / max(abs(o) for o in layer.offsets)
                # behind the crown the strands lie down: lifted there, their roots face a back camera (it3 « bun »)
                lie = 1.0 - 0.85 * smoothstep(140, 200, phi)
                # launched along the crest's own normal, not the root's: off the midline the root
                # normal points sideways and the locks left horizontally (a brim, judge5 front/back)
                launch = (crest_point(centre, radius, phi, 0) - centre).normalized()
                out.append(grow_guide(root, launch * lie, layer, colliders, across, groom.side_bias))
    return out


def scalp(centre, radius, root, mask_fn, name):
    """UV sphere just inside the cranium: the surface the strands are attached to. Carries the
    density mask: 1 where roots grow, 0 elsewhere (no strand roots on cheeks or face)."""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    import bmesh

    bm = bmesh.new()
    bm.loops.layers.uv.new("UVMap")  # calc_uvs fills an existing layer only
    bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=48, radius=radius - 0.004, calc_uvs=True)
    bmesh.ops.translate(bm, vec=centre, verts=bm.verts)  # object at the origin, like the hair object
    bm.to_mesh(mesh)
    bm.free()
    obj.parent = root
    obj.add_rest_position_attribute = True
    obj.hide_render = True
    mask = mesh.attributes.new(MASK_ATTR, "FLOAT", "POINT")
    for v in mesh.vertices:
        mask.data[v.index].value = mask_fn((v.co - centre).normalized())
    return obj


def load_groups():
    missing = [g for g in GROUPS if g not in bpy.data.node_groups]
    if missing:
        with bpy.data.libraries.load(ASSETS) as (_, dst):
            dst.node_groups = missing
    return {g: bpy.data.node_groups[g] for g in GROUPS}


def add_modifier(obj, group, values):
    """Geometry-nodes modifier; inputs set by UI name (Blender 5.2: properties.inputs.<id>)."""
    mod = obj.modifiers.new(group.name, "NODES")
    mod.node_group = group
    ids = {i.name: i.identifier for i in group.interface.items_tree if getattr(i, "in_out", None) == "INPUT"}
    for name, value in values.items():
        slot = getattr(mod.properties.inputs, ids[name])
        if isinstance(value, str) and name == "Density Mask":
            slot.type = "ATTRIBUTE"
            slot.attribute_name = value
        else:
            slot.value = value
    return mod


def hair_material(stops=studio.MANE_STOPS):
    """Pastel gradient root -> tip (default studio.MANE_STOPS, as the sculpted manes), slight
    per-strand variation so locks separate."""
    mat = bpy.data.materials.new("HairStrands")
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    bsdf = nodes["Principled BSDF"]
    info = nodes.new("ShaderNodeHairInfo")
    ramp = nodes.new("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    stops = studio.linear_stops(stops)
    els[0].position, els[0].color = stops[0][0], stops[0][1]
    els[1].position, els[1].color = stops[-1][0], stops[-1][1]
    for pos, col in stops[1:-1]:
        e = els.new(pos)
        e.color = col
    links.new(info.outputs["Intercept"], ramp.inputs["Fac"])
    vary = nodes.new("ShaderNodeMix")
    vary.data_type = "RGBA"
    vary.blend_type = "MULTIPLY"
    vary.inputs["B"].default_value = (0.82, 0.8, 0.9, 1.0)
    links.new(info.outputs["Random"], vary.inputs["Factor"])
    links.new(ramp.outputs["Color"], vary.inputs["A"])
    links.new(vary.outputs["Result"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.45
    bsdf.inputs["Coat Weight"].default_value = 0.2
    return mat


def build_mane(skull, root, colliders, groom=MANE, given=None):
    """`given`: guide polylines (GUIDE_POINTS points each) to use instead of growing them, e.g.
    the lock axes of a sculpted mane (docs/spikes/style-2026-10/meshy-mane/lock_axes.py)."""
    surface = scalp(skull.centre, skull.radius, root, groom.mask, f"{groom.name}Scalp")
    data = bpy.data.hair_curves.new(groom.name)
    gs = [[Vector(p) for p in g] for g in given] if given is not None else guides(skull.centre, skull.radius, colliders, groom)
    data.add_curves([GUIDE_POINTS] * len(gs))
    for i, p in enumerate(q for g in gs for q in g):
        data.points[i].position = p
    data.surface = surface
    data.surface_uv_map = "UVMap"
    obj = bpy.data.objects.new(groom.name, data)
    bpy.context.collection.objects.link(obj)
    obj.parent = root
    g = load_groups()
    add_modifier(obj, g["Attach Hair Curves to Surface"], {"Surface Object": surface})
    add_modifier(obj, g["Interpolate Hair Curves"], {**groom.interpolate, "Density Mask": MASK_ATTR})
    add_modifier(obj, g["Clump Hair Curves"], groom.clump)
    add_modifier(obj, g["Hair Curves Noise"], groom.noise)
    add_modifier(obj, g["Frizz Hair Curves"], groom.frizz)
    if groom.trim:
        add_modifier(obj, g["Trim Hair Curves"], groom.trim)
    add_modifier(obj, g["Set Hair Curve Profile"], groom.profile)
    data.materials.append(hair_material(groom.stops))
    report(obj)
    return obj


def report(obj):
    for m in obj.modifiers:
        for w in m.node_warnings:
            print(f"HAIR_WARN {m.name}: {w.type} {w.message}")
    ev = obj.evaluated_get(bpy.context.evaluated_depsgraph_get()).data
    print(f"HAIR_STRANDS {obj.name}: {len(ev.curves)} curves, {len(ev.points)} points")


# ----------------------------------------------------------------------------- explicit locks
# st2: Interpolate blends neighbouring guides and Clump picks its own random lock centres, so the
# lock shapes of the source mane were smoothed into one mass. Here every strand belongs to one
# given lock: placed at random in the lock's cross-section, which narrows towards the tip.
LOCK_TIGHTEN = 0.55  # share of the sub-lock's width gathered at the tip (0.85: claw tips, st5 R)
SUB_LOCKS = 3  # each lock splits into sub-locks of different lengths (st5: 26 identical locks = clones)
SUB_OFFSET = 0.6  # sub-lock centre offset, as a fraction of the lock's half-width
TIP_FAN = 0.025  # strands fan out a little at the very tip, each its own way
LOCK_TRIM = (0.75, 1.0)  # each strand's length, as a fraction of its lock
WAVE = 0.006  # per-strand low-frequency wave (scene units)


def frames(axis):
    """Parallel-transport frames (tangent, normal, binormal) along a polyline (n, 3)."""
    t = np.gradient(axis, axis=0)
    t /= np.linalg.norm(t, axis=1)[:, None]
    ref = np.array([0.0, 0.0, 1.0]) if abs(t[0, 2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    n = [np.cross(t[0], ref)]
    n[0] /= np.linalg.norm(n[0])
    for i in range(1, len(axis)):
        m = n[-1] - t[i] * (n[-1] @ t[i])
        n.append(m / np.linalg.norm(m))
    n = np.array(n)
    return t, n, np.cross(t, n)


def along(axis, frac):
    """Points of `axis` re-sampled over its first `frac` of length, same point count."""
    seg = np.linalg.norm(np.diff(axis, axis=0), axis=1)
    s = np.r_[0, np.cumsum(seg)]
    q = np.linspace(0, s[-1] * frac, len(axis))
    return np.stack([np.interp(q, s, axis[:, k]) for k in range(3)], axis=1), q / s[-1]


def lock_strands(name, axes, widths, root, head_centre, head_radius, per_lock, stops, radius=0.0032, seed=5):
    """Hair curves: `per_lock` strands for every lock axis (k, n, 3) of half-width (k, n)."""
    rng = np.random.default_rng(seed)
    centre = np.asarray(head_centre, dtype=float)
    pos, rad = [], []
    for axis, width in zip(np.asarray(axes, float), np.asarray(widths, float)):
        n = len(axis)
        subs = [(rng.uniform(0, 2 * np.pi), rng.uniform(0.0, SUB_OFFSET), rng.uniform(0.7, 1.0)) for _ in range(SUB_LOCKS)]
        for _ in range(per_lock):
            sub_angle, sub_r, sub_len = subs[rng.integers(SUB_LOCKS)]
            frac = sub_len * rng.uniform(*LOCK_TRIM)
            pts, s = along(axis, frac)
            _, nn, bb = frames(pts)
            lock_w = np.interp(s, np.linspace(0, 1, n), width)
            sub_c = (np.cos(sub_angle) * nn + np.sin(sub_angle) * bb) * (lock_w * sub_r)[:, None]
            w = lock_w * (1.0 - SUB_OFFSET) * (1.0 - LOCK_TIGHTEN * s**1.5)
            r, a = np.sqrt(rng.uniform()), rng.uniform(0, 2 * np.pi)
            fan = rng.normal(size=3) * TIP_FAN * (s**3)[:, None]
            off = sub_c + (np.cos(a) * nn + np.sin(a) * bb) * (w * r)[:, None] + fan
            phase, freq = rng.uniform(0, 2 * np.pi), rng.uniform(1.5, 3.0)
            wave = np.sin(phase + freq * np.pi * s)[:, None] * (np.cos(a + 1.3) * nn + np.sin(a + 1.3) * bb) * WAVE * s[:, None]
            p = pts + off + wave
            d = p - centre
            dist = np.linalg.norm(d, axis=1)
            inside = dist < head_radius + 0.004  # strands laid on the skin, never under it
            p[inside] = centre + d[inside] / dist[inside, None] * (head_radius + 0.004)
            pos.append(p)
            rad.append(radius * (1.0 - 0.8 * s))
    pos, rad = np.array(pos, np.float32), np.array(rad, np.float32)
    data = bpy.data.hair_curves.new(name)
    data.add_curves([pos.shape[1]] * len(pos))
    data.attributes["position"].data.foreach_set("vector", pos.ravel())
    if "radius" not in data.attributes:
        data.attributes.new("radius", "FLOAT", "POINT")
    data.attributes["radius"].data.foreach_set("value", rad.ravel())
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.parent = root
    data.materials.append(hair_material(stops))
    print(f"HAIR_LOCKS {name}: {len(axes)} locks x {per_lock} = {len(pos)} strands")
    return obj


# ----------------------------------------------------------------------------- bake
# Interpolate + Clump do not give the same groom from one Blender run to the next (strand count
# and which strands lead the clumps vary): a groom that is judged or approved is baked to an .npz
# and rebuilt from it, never regenerated.
def bake(obj, path):
    ev = obj.evaluated_get(bpy.context.evaluated_depsgraph_get()).data
    n_pts, n_cur = len(ev.points), len(ev.curves)
    pos = np.empty(n_pts * 3, np.float32)
    ev.attributes["position"].data.foreach_get("vector", pos)
    rad = np.empty(n_pts, np.float32)
    ev.attributes["radius"].data.foreach_get("value", rad)
    sizes = np.array([c.points_length for c in ev.curves], np.int32)
    np.savez_compressed(path, position=pos.reshape(-1, 3), radius=rad, sizes=sizes)
    print(f"HAIR_BAKED {path}: {n_cur} curves, {n_pts} points")


def load_baked(path, root, groom=MANE):
    """Static hair object rebuilt from bake(); same material, no modifiers."""
    z = np.load(path)
    data = bpy.data.hair_curves.new(groom.name)
    data.add_curves(z["sizes"].tolist())
    data.attributes["position"].data.foreach_set("vector", z["position"].ravel())
    if "radius" not in data.attributes:
        data.attributes.new("radius", "FLOAT", "POINT")
    data.attributes["radius"].data.foreach_set("value", z["radius"])
    obj = bpy.data.objects.new(groom.name, data)
    bpy.context.collection.objects.link(obj)
    obj.parent = root
    data.materials.append(hair_material(groom.stops))
    print(f"HAIR_LOADED {path}: {len(data.curves)} curves")
    return obj
