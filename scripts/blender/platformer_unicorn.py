"""Candidate B - Quaternius "Animated Platformer Character" (CC0, via Poly Pizza) restyled as a
unicorn: pearl/pastel recolour, golden horn parented to the Head bone, blush + eye catch-lights,
smooth-by-angle shading. Same studio (lights, camera, materials, background) as candidate A.

Usage:
  blender -b --python scripts/blender/platformer_unicorn.py -- <character.glb> <out_dir> [--preview] [--tag NAME]

The .glb stays outside the repo; only the renders are written to <out_dir>.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import face_parts  # noqa: E402
import shapes  # noqa: E402
import studio  # noqa: E402
from studio import hex_linear, vinyl_material  # noqa: E402

POSE_ACTION = "CharacterArmature|Idle"
EAR_SCALE = 0.62  # long bunny ears -> shorter pony-like ears
SMOOTH_ANGLE = 80.0

# (object, original material) -> restyled material key. Fists and shoe soles become lilac hooves.
SLOT_OVERRIDES = {("Arms", "Main_Light"): "hoof", ("Body", "Main_Light"): "hoof"}
BASE_MAP = {"Main": "pearl", "Main_Light": "skin", "Main2": "belly", "EyeColor": "eye", "White": "white", "Black": "line"}
SKIN = hex_linear(studio.MASCOT["muzzle"])
BLUSH = hex_linear(studio.MASCOT["blush"])
EYE_STOPS = studio.linear_stops(studio.EYE_STOPS)
MANE_STOPS = studio.linear_stops(studio.MANE_STOPS)
TUFT_MIN_Z = 2.6
EYE_SCALE = 1.3  # the stock eyes are small for a chibi read
EYE_LIFT = 0.06  # the hood's spiky hair tuft = Head islands of material "Main" entirely above this


def make_materials():
    return {
        "pearl": studio.pearl_material(vertex_color=None),
        "skin": studio.pearl_material("SkinVinyl", studio.MASCOT["muzzle"], vertex_color=None),
        "belly": studio.pearl_material("BellyVinyl", "#e2cfff", vertex_color=None),
        "hoof": studio.pearl_material("HoofVinyl", studio.MASCOT["hoof"], vertex_color=None),
        "eye": studio.eye_material(),
        "white": vinyl_material("EyeWhite", "#ffffff", roughness=0.2, coat=0.6, subsurface=0.0),
        "line": studio.line_material(),
        "mane": studio.mane_material(),
    }


def import_character(glb):
    bpy.ops.import_scene.gltf(filepath=glb)
    stray = bpy.data.objects.get("Icosphere")  # unparented, material-less helper shipped in the glb
    if stray is not None:
        bpy.data.objects.remove(stray)
    arm = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
    arm.animation_data.action = bpy.data.actions[POSE_ACTION]
    bpy.context.scene.frame_set(1)
    for side in ("L", "R"):
        arm.pose.bones[f"Ear1.{side}"].scale = (EAR_SCALE,) * 3
    bpy.context.view_layer.update()
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    return arm, meshes


def islands(obj):
    """Connected face sets of a mesh (lists of polygon indices)."""
    import bmesh

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    seen, out = set(), []
    for f in bm.faces:
        if f.index in seen:
            continue
        stack, comp = [f], []
        seen.add(f.index)
        while stack:
            g = stack.pop()
            comp.append(g.index)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen:
                        seen.add(h.index)
                        stack.append(h)
        out.append(comp)
    bm.free()
    return out


def delete_faces(obj, face_indices):
    import bmesh

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.faces.ensure_lookup_table()
    doomed = set(face_indices)
    verts = {v for i in doomed for v in bm.faces[i].verts}
    bmesh.ops.delete(bm, geom=[bm.faces[i] for i in doomed], context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in verts if v.is_valid and not v.link_faces], context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


def enlarge_eyes(head, mats):
    """Scale each eye (iris + ring + catch-light islands) by EYE_SCALE in the face's tangent plane,
    pushing it slightly out along the normal so the bigger disc stays on the curved face."""
    me = head.data
    mw = head.matrix_world
    inv = mw.inverted()
    eye_idx = {i for i, m in enumerate(me.materials) if m in (mats["eye"], mats["white"], mats["line"])}
    frames = eye_frames(head)
    for side, (centre, rot, radii) in frames.items():
        verts = {v for p in me.polygons if p.material_index in eye_idx and ((mw @ p.center).x > 0) == (side > 0) for v in p.vertices}
        for vi in verts:
            q = rot.transposed() @ (mw @ me.vertices[vi].co - centre)
            r2 = (q.x / radii[0]) ** 2 + (q.y / radii[1]) ** 2
            q = Vector((q.x * EYE_SCALE, q.y * EYE_SCALE, q.z + EYE_LIFT * radii[0] * (1 + r2)))
            me.vertices[vi].co = inv @ (centre + rot @ q)
    me.update()


def restyle_materials(meshes):
    mats = make_materials()
    for o in meshes:
        me = o.data
        for i, m in enumerate(me.materials):
            key = SLOT_OVERRIDES.get((o.name, m.name), BASE_MAP.get(m.name))
            if key:
                me.materials[i] = mats[key]
    head = next(o for o in meshes if o.name == "Head")
    recolor_head(head, mats)
    return mats


def recolor_head(head, mats):
    """Tuft islands -> pastel mane gradient; iris -> vertical violet gradient (one colour attr)."""
    me = head.data
    mw = head.matrix_world
    me.materials.append(mats["mane"])
    mane_idx = len(me.materials) - 1
    pearl_idx = list(me.materials).index(mats["pearl"])
    tufts = []
    for comp in islands(head):
        polys = [me.polygons[i] for i in comp]
        if all(p.material_index == pearl_idx for p in polys) and min((mw @ p.center).z for p in polys) > TUFT_MIN_Z:
            tufts.append(comp)
    # The centre spike makes way for the horn; the two side spikes become a pastel forelock.
    centre_spike = min(tufts, key=lambda c: abs(sum((mw @ me.polygons[i].center).x for i in c) / len(c)))
    delete_faces(head, centre_spike)
    me = head.data
    tuft_verts = set()
    for comp in islands(head):
        polys = [me.polygons[i] for i in comp]
        if all(p.material_index == pearl_idx for p in polys) and min((mw @ p.center).z for p in polys) > TUFT_MIN_Z:
            for p in polys:
                p.material_index = mane_idx
                tuft_verts.update(p.vertices)
    enlarge_eyes(head, mats)
    xs = [(mw @ me.vertices[v].co).x for v in tuft_verts]
    x0, x1 = min(xs), max(xs)
    frames = eye_frames(head)

    def col(p, n):
        side = 1 if p.x > 0 else -1
        centre, rot, radii = frames[side]
        q = rot.transposed() @ (p - centre)
        if abs(q.x) <= radii[0] * 1.2 and abs(q.y) <= radii[1] * 1.2 and q.z > -0.2:
            return studio.ramp(EYE_STOPS, q.y / radii[1])
        return studio.ramp(MANE_STOPS, (p.x - x0) / (x1 - x0))

    shapes.paint(head, col)
    print("TUFT verts", len(tuft_verts))


def smooth(meshes):
    for o in meshes:
        bpy.ops.object.select_all(action="DESELECT")
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(SMOOTH_ANGLE))


def attach_to_bone(objs, arm, bone):
    bpy.context.view_layer.update()
    for o in objs:
        mw = o.matrix_world.copy()
        o.parent = arm
        o.parent_type = "BONE"
        o.parent_bone = bone
        bpy.context.view_layer.update()
        o.matrix_world = mw


def eye_frames(head):
    """Centroid, orientation and half-extents of each iris patch (rest mesh or posed snapshot)."""
    me = head.data
    idx = next(i for i, m in enumerate(me.materials) if m and m.name.startswith("EyeGloss"))
    mw = head.matrix_world
    sides = {1: [], -1: []}
    for poly in me.polygons:
        if poly.material_index == idx:
            c = mw @ poly.center
            sides[1 if c.x > 0 else -1].append((c, (mw.to_3x3() @ poly.normal).normalized(), poly.area))
    frames = {}
    for side, items in sides.items():
        area = sum(a for _, _, a in items)
        centre = sum((c * a for c, _, a in items), Vector()) / area
        normal = sum((n * a for _, n, a in items), Vector()).normalized()
        rot = shapes.frame_from_normal(normal)
        local = [rot.transposed() @ (c - centre) for c, _, _ in items]
        rx = max(abs(q.x) for q in local) * 1.1
        ry = max(abs(q.y) for q in local) * 1.1
        frames[side] = (centre, rot, (rx, ry, rx * 0.3))
    return frames


def decorate(arm, meshes):
    head = next(o for o in meshes if o.name == "Head")
    snap = shapes.evaluated_snapshot(head)
    lo, hi = studio.world_bbox([snap])
    face_c = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, (lo.z + hi.z) / 2))
    print("HEAD bbox", tuple(round(v, 3) for v in lo), tuple(round(v, 3) for v in hi))
    height = hi.z - lo.z
    added = [face_parts.horn(snap, face_c, face_parts.sph(0, 62), 0.42 * height, 0.085 * height, studio.gold_material())]
    hl_mat = studio.highlight_material()
    blush_mat = studio.blush_material()
    for side, (centre, rot, radii) in eye_frames(snap).items():
        added += face_parts.eye_highlights(centre, rot, radii, hl_mat, f"Highlight.{side}", surface=snap)
        # cheek: below the eye and slightly towards the face centre
        cheek = centre + rot @ Vector((-side * radii[0] * 0.6, -radii[1] * 1.9, 0))
        r = 0.08 * height
        added.append(face_parts.blush(snap, face_c, cheek - face_c, (r, r * 0.6, r * 0.25), blush_mat, BLUSH, SKIN, f"Blush.{side}"))
    bpy.data.objects.remove(snap)
    attach_to_bone(added, arm, "Head")
    return added


def main():
    args = studio.parse_args(2)
    glb, out_dir = args[0], os.path.abspath(args[1])
    preview = "--preview" in args
    tag = args[args.index("--tag") + 1] if "--tag" in args else "B_platformer"
    scene = studio.begin(preview)
    arm, meshes = import_character(glb)
    restyle_materials(meshes)
    smooth(meshes)
    added = decorate(arm, meshes)
    snaps = [shapes.evaluated_snapshot(o) for o in meshes]
    parts = snaps + added
    lo, hi = studio.world_bbox(parts)
    hlo, hhi = studio.world_bbox([s for s in snaps if s.name.startswith("Head")])
    print(f"BBOX total z {lo.z:.3f}..{hi.z:.3f}  head z {hlo.z:.3f}..{hhi.z:.3f}  head share {(hhi.z - hlo.z) / (hi.z - lo.z):.2%}")
    studio.stage(scene, meshes + added, ground_z=lo.z, frame_objs=parts)
    dt = studio.finish(scene, out_dir, tag)  # snapshots are hide_render, used only for bounds
    print(f"DONE render_seconds={dt:.1f}")


if __name__ == "__main__":
    main()
