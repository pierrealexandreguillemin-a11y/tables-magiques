"""Smooth-primitive geometry helpers for the mascot spikes (no low-poly + SUBSURF blobs).

Everything is built from high-resolution primitives or metaballs converted to real meshes so it
can be exported to glTF. Deterministic: no randomness anywhere.
"""

import math

import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector


def link(obj, parent=None):
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def set_smooth(obj):
    n = len(obj.data.polygons)
    obj.data.polygons.foreach_set("use_smooth", [True] * n)
    obj.data.update()
    return obj


def frame_from_normal(normal, up=Vector((0, 0, 1))):
    """Rotation matrix whose local +Z is `normal` and local +Y points as close to `up` as possible."""
    z = Vector(normal).normalized()
    x = Vector(up).cross(z)
    if x.length < 1e-6:
        x = Vector((1, 0, 0))
    x.normalize()
    y = z.cross(x).normalized()
    return Matrix((x, y, z)).transposed()


def uv_ellipsoid(name, loc, radii, rot=None, segments=96, rings=48, parent=None):
    """High-res UV sphere scaled to `radii`, transform baked into the mesh (scale = 1)."""
    import bmesh

    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=rings, radius=1.0)
    m = Matrix.Diagonal(Vector(radii)).to_4x4()
    if rot is not None:
        rot3 = rot.to_matrix() if isinstance(rot, Quaternion) else rot
        m = rot3.to_4x4() @ m
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.location = loc
    link(obj, parent)
    return set_smooth(obj)


# Isosurface radius of a lone metaball BALL (stiffness 2, threshold 0.6): solving
# 2 * (1 - x^2)^3 = 0.6 gives x ~= 0.575 * radius. `ball()` takes the VISIBLE radius instead.
META_SURFACE = 0.575


def ball(co, r, **kw):
    return {"type": "BALL", "co": tuple(co), "radius": r / META_SURFACE, **kw}


def ellipsoid(co, semi, **kw):
    """Metaball ellipsoid with visible semi-axes `semi` (approximate: fusion adds bulk)."""
    m = max(semi)
    return {"type": "ELLIPSOID", "co": tuple(co), "radius": m / META_SURFACE, "size": tuple(v / m for v in semi), **kw}


def capsule(co, r, half_len, axis=(0, 0, 1), **kw):
    """Metaball capsule: segment of +-half_len along `axis`, visible radius r."""
    rot = Vector((1, 0, 0)).rotation_difference(Vector(axis).normalized())
    return {"type": "CAPSULE", "co": tuple(co), "radius": r / META_SURFACE, "size": (half_len, 1, 1), "rot": rot, **kw}


def metaball_mesh(name, elements, resolution=0.012, threshold=0.6, parent=None):
    """Fuse metaball elements into ONE smooth mesh object.

    elements: dicts with keys type ('BALL'|'ELLIPSOID'|'CAPSULE'), co, radius, optional
    size=(x,y,z), rot=Quaternion, stiffness, negative.
    """
    mb = bpy.data.metaballs.new(name + "_mb")
    mb.resolution = resolution
    mb.render_resolution = resolution
    mb.threshold = threshold
    for e in elements:
        el = mb.elements.new(type=e.get("type", "BALL"))
        el.co = e["co"]
        el.radius = e["radius"]
        el.stiffness = e.get("stiffness", 2.0)
        el.use_negative = e.get("negative", False)
        if "size" in e:
            el.size_x, el.size_y, el.size_z = e["size"]
        if "rot" in e:
            el.rotation = e["rot"]
    mb_obj = bpy.data.objects.new(name + "_mbobj", mb)
    link(mb_obj)
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(mb_obj.evaluated_get(dg))
    me.name = name
    bpy.data.objects.remove(mb_obj)
    bpy.data.metaballs.remove(mb)
    obj = bpy.data.objects.new(name, me)
    link(obj, parent)
    return set_smooth(obj)


def evaluated_snapshot(obj, name=None):
    """Static mesh copy of `obj` as currently deformed (armature pose, modifiers), same world
    transform, hidden from render - for ray casts against posed skinned meshes. Remove it with
    bpy.data.objects.remove() when done."""
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    snap = bpy.data.objects.new(name or obj.name + "_snap", me)
    link(snap)
    snap.matrix_world = obj.matrix_world.copy()
    snap.hide_render = True
    return snap


def surface_hit(obj, origin, direction):
    """World-space ray cast against `obj` (mesh, any transform). Returns (point, normal) world."""
    bpy.context.view_layer.update()
    mw = obj.matrix_world
    inv = mw.inverted()
    o = inv @ Vector(origin)
    d = (inv.to_3x3() @ Vector(direction)).normalized()
    ok, loc, nor, _ = obj.ray_cast(o, d)
    if not ok:
        raise RuntimeError(f"ray missed {obj.name} from {origin} dir {direction}")
    n = (inv.to_3x3().transposed() @ nor).normalized()
    return mw @ loc, n


def surface_dir(obj, center, direction):
    """Hit the surface of `obj` from outside along the ray that passes through `center` with
    `direction` (points outward)."""
    d = Vector(direction).normalized()
    origin = Vector(center) + d * 10.0
    return surface_hit(obj, origin, -d)


def paint(obj, fn, attr="Col"):
    """Per-vertex colour attribute (linear float RGBA) from fn(world_co, world_normal) -> rgba."""
    bpy.context.view_layer.update()  # matrix_world is stale right after setting .location
    me = obj.data
    if attr in me.color_attributes:
        me.color_attributes.remove(me.color_attributes[attr])
    ca = me.color_attributes.new(attr, "FLOAT_COLOR", "POINT")
    mw = obj.matrix_world
    nm = mw.to_3x3().inverted().transposed()
    cols = np.empty(len(me.vertices) * 4, np.float32)
    for v in me.vertices:
        c = fn(mw @ v.co, (nm @ v.normal).normalized())
        cols[v.index * 4 : v.index * 4 + 4] = c
    ca.data.foreach_set("color", cols)
    me.color_attributes.active_color = ca
    me.color_attributes.render_color_index = me.color_attributes.find(attr)
    return ca


def lathe(name, profile, axis_rot, loc, segments=96, twist=None, parent=None):
    """Surface of revolution. profile = [(radius, height)...] from base to tip; twist(t, theta)
    -> radial multiplier (spiral ridges). Base and tip are closed with fan caps."""
    verts, faces = [], []
    n = len(profile)
    for i, (r, h) in enumerate(profile):
        t = i / (n - 1)
        for j in range(segments):
            th = 2 * math.pi * j / segments
            k = twist(t, th) if twist else 1.0
            verts.append((r * k * math.cos(th), r * k * math.sin(th), h))
    for i in range(n - 1):
        for j in range(segments):
            a = i * segments + j
            b = i * segments + (j + 1) % segments
            faces.append((a, b, b + segments, a + segments))
    base = len(verts)
    verts.append((0, 0, profile[0][1]))
    tip = len(verts)
    verts.append((0, 0, profile[-1][1]))
    last = (n - 1) * segments
    for j in range(segments):
        faces.append((base, (j + 1) % segments, j))
        faces.append((tip, last + j, last + (j + 1) % segments))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.transform(axis_rot.to_4x4())
    me.update()
    obj = bpy.data.objects.new(name, me)
    obj.location = loc
    link(obj, parent)
    return set_smooth(obj)


def spiral_horn(name, base, axis, length, base_radius, turns=2.5, ridge=0.16, sharp=1.0, lobes=2, parent=None):
    """Unicorn horn: tapered cone with `lobes` twisted ridges, rounded (hemispherical) tip.
    sharp < 1 widens the ridges and pinches the grooves (a readable spiral); 1 = plain cosine."""
    rings = 120
    tip_r = base_radius * 0.16
    profile = []
    body_len = length - tip_r
    for i in range(rings):
        t = i / (rings - 1)
        r = tip_r + (base_radius - tip_r) * (1 - t) ** 0.9
        profile.append((r, body_len * t))
    for i in range(1, 13):  # hemispherical tip cap
        a = (math.pi / 2) * i / 12
        profile.append((tip_r * math.cos(a), body_len + tip_r * math.sin(a)))
    n = len(profile)

    def twist(t, th):
        tt = min(1.0, t * n / rings)
        fade = (1 - tt) ** 0.6 * min(1.0, tt * 12 + 0.25)
        wave = (math.cos(th * lobes - tt * turns * 2 * math.pi) + 1) / 2
        return 1.0 + ridge * fade * (2 * wave**sharp - 1)

    rot = Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized())
    return lathe(name, profile, rot.to_matrix(), base, twist=twist, parent=parent)


def tube(name, points, radius, parent=None, taper=None, bevel_resolution=8):
    """Bevelled poly-curve converted to a mesh (e.g. a smile). taper(t) scales the radius, t = point
    index fraction (= arc-length fraction for `resample`d points)."""
    cu = bpy.data.curves.new(name + "_cu", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = bevel_resolution
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(points) - 1)
    for i, p in enumerate(points):
        w = taper(i / (len(points) - 1)) if taper else 1.0
        sp.points[i].co = (p[0], p[1], p[2], 1.0)
        sp.points[i].radius = w
    cobj = bpy.data.objects.new(name + "_cobj", cu)
    link(cobj)
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(cobj.evaluated_get(dg))
    me.name = name
    bpy.data.objects.remove(cobj)
    bpy.data.curves.remove(cu)
    obj = bpy.data.objects.new(name, me)
    link(obj, parent)
    return set_smooth(obj)


def resample(points, n):
    """Copy of a polyline with `n` points evenly spaced along its arc length."""
    pts = [Vector(p) for p in points]
    cum = [0.0]
    for a, b in zip(pts, pts[1:]):
        cum.append(cum[-1] + (b - a).length)
    out, j = [], 0
    for i in range(n):
        s = cum[-1] * i / (n - 1)
        while j < len(cum) - 2 and cum[j + 1] < s:
            j += 1
        seg = cum[j + 1] - cum[j]
        out.append(pts[j].lerp(pts[j + 1], 0.0 if seg == 0 else (s - cum[j]) / seg))
    return out


def _spiral_arc(start, tangent, bend, radius, turns, shrink, drift, samples):
    """One arc of a curl: leaves `start` along `tangent`, rolls towards `bend` with a radius that
    shrinks linearly to radius * (1 - shrink) and drifts `drift` sideways (tangent x bend) so that
    successive turns never touch. Returns (points, end tangent)."""
    t = tangent.normalized()
    b = (bend - t * bend.dot(t)).normalized()
    w = t.cross(b)
    c = start + b * radius
    total = 2 * math.pi * turns
    dr = -radius * shrink / total  # d(radius)/d(angle)
    pts = []
    for i in range(1, samples + 1):
        a = total * i / samples
        r = radius + dr * a
        pts.append(c - b * (r * math.cos(a)) + t * (r * math.sin(a)) + w * (drift * a / total))
    a = total
    r = radius + dr * a
    end_t = -b * (dr * math.cos(a) - r * math.sin(a)) + t * (dr * math.sin(a) + r * math.cos(a)) + w * (drift / total)
    return pts, end_t.normalized()


def curl_path(start, tangent, arcs, samples_per_turn=64):
    """Smooth lock of hair as a chain of spiral arcs (turtle style). Each arc is a dict with
    bend (world vector the path turns towards), radius, turns, and optional shrink (0 = circle
    arc, 0.7 = tight curl end) and drift. A circle arc around a sphere centre (bend = towards the
    centre, radius = distance) follows that sphere's surface."""
    pts, t = [Vector(start)], Vector(tangent)
    for arc in arcs:
        n = max(4, int(samples_per_turn * arc["turns"]))
        seg, t = _spiral_arc(pts[-1], t, Vector(arc["bend"]), arc["radius"], arc["turns"], arc.get("shrink", 0.0), arc.get("drift", 0.0), n)
        pts += seg
    return pts


def catmull_rom(points, samples_per_segment=24):
    """Smooth polyline through every control point (uniform Catmull-Rom, end points repeated)."""
    p = [Vector(c) for c in points]
    p = [p[0]] + p + [p[-1]]
    out = [p[1].copy()]
    for k in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[k - 1], p[k], p[k + 1], p[k + 2]
        for i in range(1, samples_per_segment + 1):
            s = i / samples_per_segment
            out.append(0.5 * (2 * p1 + (p2 - p0) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (3 * p1 - p0 - 3 * p2 + p3) * s**3))
    return out


def follow_frames(points, up, follow=0.3):
    """Per-point (tangent, normal) along a polyline: the normal is transported with the curve
    (rotation-minimising, no flips) and nudged towards up(p) projected off the tangent. The sign
    of up is ignored (it suits symmetric cross-sections)."""
    n = len(points)
    frames, u = [], None
    for i, p in enumerate(points):
        t = (points[min(i + 1, n - 1)] - points[max(i - 1, 0)]).normalized()
        hint = Vector(up(p))
        hint = hint - t * hint.dot(t)
        if u is None:
            u = hint.normalized()
        else:
            u = (u - t * u.dot(t)).normalized()
            if hint.length > 1e-4:
                hint.normalize()
                if hint.dot(u) < 0:
                    hint = -hint
                u = u.lerp(hint, follow).normalized()
        frames.append((t, u))
    return frames


def sweep(name, points, half_width, half_height, up, twist=None, section=None, tip=1.0, segments=24, parent=None):
    """Closed tube along `points` with an elliptical cross-section: half_width(t) / half_height(t)
    at point fraction t (= arc-length fraction for `resample`d points), the height axis following
    up(p) (see follow_frames), rolled by twist(t) radians. section(theta) -> (x, y) reshapes the
    unit circle (default: ellipse). Pointed caps at both ends; the tip cone is `tip` x the last
    radius long. A hair lock is a flattened sweep whose radii shrink towards t = 1."""
    import bmesh

    pts = [Vector(p) for p in points]
    n = len(pts)
    section = section or (lambda th: (math.cos(th), math.sin(th)))
    rim = [section(2 * math.pi * j / segments) for j in range(segments)]
    verts = []
    for i, (p, (t, u)) in enumerate(zip(pts, follow_frames(pts, up))):
        s = i / (n - 1)
        a = twist(s) if twist else 0.0
        b = t.cross(u)
        b, u = b * math.cos(a) + u * math.sin(a), u * math.cos(a) - b * math.sin(a)
        w, h = half_width(s), half_height(s)
        for j in range(segments):
            cx, cy = rim[j]
            verts.append(p + b * (w * cx) + u * (h * cy))
    faces = []
    for i in range(n - 1):
        for j in range(segments):
            a, c = i * segments + j, i * segments + (j + 1) % segments
            faces.append((a, c, c + segments, a + segments))
    t0, t1 = (pts[1] - pts[0]).normalized(), (pts[-1] - pts[-2]).normalized()
    i_root, i_tip = len(verts), len(verts) + 1
    verts.append(pts[0] - t0 * 0.5 * min(half_width(0.0), half_height(0.0)))
    verts.append(pts[-1] + t1 * tip * max(half_width(1.0), half_height(1.0), 0.004))
    last = (n - 1) * segments
    for j in range(segments):
        faces.append((i_root, (j + 1) % segments, j))
        faces.append((i_tip, last + j, last + (j + 1) % segments))
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    link(obj, parent)
    return set_smooth(obj)


def join(objs, name):
    """Merge mesh objects into the first one (renamed `name`); keeps its parent."""
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = objs[0].data.name = name
    return objs[0]
