"""Cute-face parts shared by both mascot candidates: glossy eye highlights, soft blush, horn
placement. Geometry comes from shapes.py, materials from studio.py."""

import math

from mathutils import Vector

import shapes
import studio


def smoothstep(e0, e1, x):
    t = min(max((x - e0) / (e1 - e0), 0.0), 1.0)
    return t * t * (3 - 2 * t)


def sph(az_deg, el_deg):
    """Unit direction for a character facing -Y: azimuth 0 = straight ahead, + = character's left
    (+X), elevation + = up."""
    az, el = math.radians(az_deg), math.radians(el_deg)
    return Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))


def place_on(obj, center, direction, radii, sink, name, parent=None, up=Vector((0, 0, 1))):
    """Ellipsoid lens sitting on the surface of `obj`, local +Z along the surface normal."""
    hit, n = shapes.surface_dir(obj, center, direction)
    rot = shapes.frame_from_normal(n, up)
    centre = hit - n * sink
    return shapes.uv_ellipsoid(name, centre, radii, rot=rot, parent=parent), centre, rot


def eye_highlights(centre, rot, radii, material, name, parent=None, surface=None):
    """Big upper-left + small lower-right emissive catch-lights on an ellipsoid eye (key light is
    on the camera's upper-left in studio.setup_lights). With `surface`, each catch-light is
    projected onto that mesh instead of the analytic ellipsoid (for imported eyes)."""
    rx, ry, rz = radii
    out = []
    up = rot @ Vector((0, 1, 0))
    for k, (fx, fy, fr) in enumerate(((-0.28, 0.36, 0.3), (0.31, -0.4, 0.14))):
        lx, ly, r = fx * rx, fy * ry, fr * rx
        if surface is not None:
            hit, n = shapes.surface_hit(surface, centre + rot @ Vector((lx, ly, 1.0)), -(rot @ Vector((0, 0, 1))))
        else:
            z = rz * math.sqrt(max(0.0, 1 - (lx / rx) ** 2 - (ly / ry) ** 2))
            hit = centre + rot @ Vector((lx, ly, z))
            n = (rot @ Vector((lx / rx**2, ly / ry**2, z / rz**2))).normalized()
        # Flat lens tangent to the eye where it sits: never stands off the eye at grazing angles.
        loc = hit - n * 0.06 * r
        hl = shapes.uv_ellipsoid(f"{name}.{k}", loc, (r, r * 1.15, r * 0.35), rot=shapes.frame_from_normal(n, up), segments=48, rings=24, parent=parent)
        out.append(studio.assign(hl, material))
    return out


def blush(obj, center, direction, radii, material, blush_col, skin_col, name, parent=None):
    """Flat lens on the cheek whose colour fades radially into the skin colour (no alpha needed,
    so it survives glTF export)."""
    sink = radii[2] * 0.73
    lens, centre, rot = place_on(obj, center, direction, radii, sink, name, parent)
    studio.assign(lens, material)

    def col(p, n):
        q = rot.transposed() @ (p - centre)
        d = math.sqrt((q.x / radii[0]) ** 2 + (q.y / radii[1]) ** 2)
        return studio.lerp_color(blush_col, skin_col, smoothstep(0.35, 0.95, d))

    shapes.paint(lens, col)
    return lens


def horn(obj, center, direction, length, base_radius, material, parent=None, sink=0.05, turns=2.6, ridge=0.16, sharp=1.0):
    """Golden spiral horn rooted on the surface of `obj`, leaning slightly up from the normal.
    turns / ridge / sharp: see shapes.spiral_horn."""
    hit, n = shapes.surface_dir(obj, center, direction)
    axis = (n + Vector((0, -0.05, 0.6))).normalized()
    base = hit - axis * sink * length / 0.62
    h = shapes.spiral_horn("Horn", base, axis, length, base_radius, turns=turns, ridge=ridge, sharp=sharp, parent=parent)
    return studio.assign(h, material)
