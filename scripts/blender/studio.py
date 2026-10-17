"""Shared look-dev studio for the Tables Magiques mascot spikes (Blender 5.2, Cycles).

Imported by chibi_unicorn.py and platformer_unicorn.py so both candidates share the exact same
render settings, lights, camera rig, "vinyl toy" materials and background compositing.
"""

import math
import os

import bpy
import numpy as np
from mathutils import Vector

# App palette (lib/animations/colors.ts) + pastel companions used for the mascot.
PALETTE = {
    "hot_pink": "#ff69b4",
    "orchid": "#ba55d3",
    "gold": "#ffd700",
    "sky": "#87ceeb",
    "plum": "#dda0dd",
    "purple": "#a855f7",
    "indigo": "#6366f1",
    "pink": "#f472b6",
    "blue": "#3b82f6",
}

# Mascot colours shared by both candidates (sRGB hex).
MASCOT = {
    "pearl": "#fffbff",
    "pearl_low": "#f3e8ff",
    # Body tint (contrast against the pastel background): warm ivory where the key/top light
    # lands, cool lilac on surfaces facing down. Subtle on purpose - never grey.
    "pearl_warm": "#fff6ec",
    "pearl_cool": "#e4d6ff",
    "muzzle": "#ffdeee",
    "hoof": "#c4a8ff",
    "blush": "#ff8cc8",
    "inner_ear": "#ffb0d8",
    "line": "#6a2f7e",
}
# Iris: lilac-violet glow at the bottom -> deep plum at the top (Kirby-style glossy eye).
EYE_STOPS = ((-1.0, "#8a6bff"), (-0.15, "#2e1a55"), (1.0, "#170b2b"))
# Mane / tail / tuft: hot pink -> lilac -> sky.
MANE_STOPS = ((0.0, PALETTE["hot_pink"]), (0.45, "#c88bf2"), (1.0, "#8fd6ff"))

# Background gradient stops (sRGB hex, position 0..1 along the diagonal), lilac -> pink -> cyan.
BG_STOPS = ((0.0, "#e3d4ff"), (0.5, "#ffd6ec"), (1.0, "#c9f1ff"))
# Strength of the soft white glow behind the character (0 = none). Was 0.35: it brightened the
# background exactly where the pearl silhouette sits (measure_contrast.py).
BG_GLOW = 0.15

RENDER_RES = 1024
RENDER_SAMPLES = 160
# Rim lights (lilac-white, cyan-white), light-linked to the character: they outline the pearl
# body against the pastel background. Only a faint tint: a saturated lilac/cyan rim pulls the edge
# towards the background's own hues (measured with measure_contrast.py).
RIM_ENERGY = (2200, 5000)
RIM_COLORS = ("#c9a2ff", "#9fe8ff")


# ----------------------------------------------------------------------------- colour helpers
def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_srgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


def hex_linear(h):
    """Hex sRGB -> linear RGBA tuple (what Blender shader sockets expect)."""
    return tuple(srgb_to_linear(c) for c in hex_srgb(h)) + (1.0,)


def linear_stops(stops):
    return tuple((p, hex_linear(h)) for p, h in stops)


def lerp_color(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(len(a)))


def ramp(stops, t):
    """Piecewise-linear colour ramp. stops = ((pos, rgba), ...) sorted by pos."""
    t = min(max(t, stops[0][0]), stops[-1][0])
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        if t <= p1:
            return lerp_color(c0, c1, 0.0 if p1 == p0 else (t - p0) / (p1 - p0))
    return stops[-1][1]


# ----------------------------------------------------------------------------- scene / render
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def configure_render(scene, res=RENDER_RES, samples=RENDER_SAMPLES):
    scene.render.engine = "CYCLES"
    cy = scene.cycles
    prefs = bpy.context.preferences.addons["cycles"].preferences
    gpu = False
    for kind in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
        except TypeError:
            continue
        devs = [d for d in prefs.devices if d.type != "CPU"]
        if devs:
            for d in prefs.devices:
                d.use = d.type != "CPU"
            gpu = True
            break
    cy.device = "GPU" if gpu else "CPU"
    cy.samples = samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.01
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.seed = 0
    cy.max_bounces = 8
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    scene.render.resolution_x = scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Punchy"
    scene.view_settings.exposure = 0.0
    return "GPU" if gpu else "CPU"


def _world_gradient(world):
    """Soft studio dome: bright lilac-white zenith, pink horizon, darker plum floor.

    Only seen in reflections (film is transparent) - gives glossy surfaces something to mirror.
    """
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    tex = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    rmp = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(tex.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], rmp.inputs["Fac"])
    els = rmp.color_ramp.elements
    els[0].position, els[0].color = 0.0, hex_linear("#b89ae8")
    els[1].position, els[1].color = 1.0, hex_linear("#fbf7ff")
    mid = els.new(0.5)
    mid.color = hex_linear("#ffe3f2")
    nt.links.new(rmp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.42
    nt.links.new(bg.outputs[0], out.inputs[0])


def setup_world(scene):
    world = bpy.data.worlds.new("StudioWorld")
    scene.world = world
    _world_gradient(world)
    return world


def _add_area(scene, name, loc, target, energy, size, color_hex, receivers=None):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = energy
    ld.color = hex_srgb(color_hex)
    ld.shape = "DISK"
    ld.size = size
    obj = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    if receivers is not None:
        obj.light_linking.receiver_collection = receivers
    return obj


def character_collection(objs):
    """Light-linking receiver set: the character only (never the shadow catcher)."""
    coll = bpy.data.collections.new("CharacterReceivers")
    for o in objs:
        coll.objects.link(o)
    return coll


def setup_lights(scene, target, character_objs, scale=1.0):
    """Key + top light the whole scene (they make the contact shadow). Fill and the two tinted rim
    lights are light-linked to the character only, so their shadows never streak the floor."""
    t = Vector(target)
    s = scale
    rx = character_collection(character_objs)

    def at(x, y, z):
        return tuple(t + Vector((x, y, z)) * s)

    energy = s * s
    _add_area(scene, "Key", at(-3.2, -4.0, 3.6), target, 1100 * energy, 4.0 * s, "#fff6f0")
    # Small, strong top light (was 250 W-equivalent, 3.0 wide) = a denser contact shadow under the hooves.
    _add_area(scene, "Top", at(0.0, 0.5, 5.0), target, 450 * energy, 1.6 * s, "#ffffff")
    _add_area(scene, "Fill", at(4.2, -2.6, 0.8), target, 240 * energy, 5.0 * s, "#d2a8ff", rx)
    _add_area(scene, "RimLilac", at(-3.4, 3.6, 2.2), target, RIM_ENERGY[0] * energy, 2.2 * s, RIM_COLORS[0], rx)
    _add_area(scene, "RimCyan", at(3.6, 3.0, 1.6), target, RIM_ENERGY[1] * energy, 2.2 * s, RIM_COLORS[1], rx)


def add_shadow_catcher(scene, z=0.0, size=40.0):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    plane = bpy.context.active_object
    plane.name = "ShadowCatcher"
    plane.is_shadow_catcher = True
    plane.data.materials.append(vinyl_material("CatcherMat", "#ffffff", roughness=1.0, coat=0.0))
    return plane


def world_bbox(objs):
    pts = []
    for o in objs:
        pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)])
    hi = Vector([max(p[i] for p in pts) for i in range(3)])
    return lo, hi


def setup_camera(scene, objs, lens=85.0, azimuth_deg=32.0, elevation_deg=-4.0, fill=0.80, aim_z=0.5):
    """3/4 front camera. Character faces -Y; azimuth > 0 moves the camera towards +X so the key
    light (at -X) lands on the camera's upper-left. Negative elevation = slight low angle (camera
    below the aim point, looking up). `fill` = fraction of the frame used by the bbox extent.
    `aim_z` = vertical aim point as a fraction of the bbox height."""
    lo, hi = world_bbox(objs)
    size = hi - lo
    aim = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z + size.z * aim_z))
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = lens
    cam_data.sensor_fit = "VERTICAL"
    cam_data.sensor_height = 24.0
    cam = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    half_fov = math.atan(cam_data.sensor_height / 2 / lens)
    extent = max(size.z, size.x * 1.05, size.y * 0.9) / 2
    dist = extent / math.tan(half_fov) / fill
    az, el = math.radians(azimuth_deg), math.radians(elevation_deg)
    direction = Vector((math.sin(az), -math.cos(az), 0)) * math.cos(el) + Vector((0, 0, math.sin(el)))
    cam.location = aim + direction.normalized() * dist
    cam.rotation_euler = (aim - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam_data.clip_end = dist * 4
    return cam


# ----------------------------------------------------------------------------- materials
def _principled(mat):
    if mat.node_tree is None:
        mat.use_nodes = True
    return next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def vinyl_material(
    name,
    color_hex="#ffffff",
    roughness=0.38,
    coat=0.45,
    coat_roughness=0.12,
    subsurface=0.12,
    metallic=0.0,
    emission=0.0,
    vertex_color=None,
    thin_film=0.0,
    coat_tint=None,
    sheen=0.0,
    sheen_tint="#ffffff",
):
    """Satin 'vinyl toy' Principled BSDF. vertex_color = name of a colour attribute to drive the
    base colour (exported to glTF as COLOR_0); otherwise flat `color_hex`."""
    mat = bpy.data.materials.new(name)
    b = _principled(mat)
    col = hex_linear(color_hex)
    b.inputs["Base Color"].default_value = col
    b.inputs["Roughness"].default_value = roughness
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = coat_roughness
    b.inputs["Subsurface Weight"].default_value = subsurface
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.55, 0.65)
    b.inputs["Subsurface Scale"].default_value = 0.05
    b.inputs["Thin Film Thickness"].default_value = thin_film
    if coat_tint:  # absorbed more at grazing angles: tints and deepens the silhouette edge
        b.inputs["Coat Tint"].default_value = hex_linear(coat_tint)
    if sheen > 0:
        b.inputs["Sheen Weight"].default_value = sheen
        b.inputs["Sheen Tint"].default_value = hex_linear(sheen_tint)
    if emission > 0:
        b.inputs["Emission Color"].default_value = col
        b.inputs["Emission Strength"].default_value = emission
    if vertex_color:
        node = mat.node_tree.nodes.new("ShaderNodeVertexColor")
        node.layer_name = vertex_color
        mat.node_tree.links.new(node.outputs["Color"], b.inputs["Base Color"])
    return mat


# Presets shared by both candidates (one definition each - no per-script copies).
def pearl_material(name="PearlVinyl", color_hex=MASCOT["pearl"], vertex_color="Col", **overrides):
    """`overrides`: any vinyl_material keyword (e.g. coat / coat_tint for silhouette contrast)."""
    params = {"roughness": 0.45, "coat": 0.3, "coat_roughness": 0.2, "subsurface": 0.2, **overrides}
    return vinyl_material(name, color_hex, vertex_color=vertex_color, **params)


def mane_material():
    return vinyl_material("ManeVinyl", roughness=0.5, coat=0.25, coat_roughness=0.25, subsurface=0.15, vertex_color="Col")


def line_material():
    return vinyl_material("Line", MASCOT["line"], roughness=0.4, coat=0.3, subsurface=0.0)


def gold_material(color_hex="#ffbb29", metallic=0.5):
    return vinyl_material("GoldVinyl", color_hex, roughness=0.22, coat=0.8, coat_roughness=0.06, metallic=metallic, subsurface=0.0)


def eye_material(vertex_color="Col", color_hex="#2e1a55"):
    return vinyl_material("EyeGloss", color_hex, roughness=0.08, coat=1.0, coat_roughness=0.02, subsurface=0.0, vertex_color=vertex_color)


def highlight_material():
    return vinyl_material("EyeHighlight", "#ffffff", roughness=0.3, coat=0.0, subsurface=0.0, emission=3.0)


def blush_material(**overrides):
    """`overrides`: match the skin's coat (pearl_material overrides) so the lens edge blends in."""
    return vinyl_material("Blush", vertex_color="Col", **{"roughness": 0.45, "coat": 0.3, "subsurface": 0.1, **overrides})


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


# ----------------------------------------------------------------------------- output
def render_png(scene, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene.render.filepath = path
    import time

    t0 = time.perf_counter()
    bpy.ops.render.render(write_still=True)
    dt = time.perf_counter() - t0
    print(f"RENDERED {path} in {dt:.1f}s")
    return dt


def _gradient_bg(w, h, stops=BG_STOPS):
    """Diagonal lilac (top-left) -> pink -> cyan (bottom-right) + soft centre glow. sRGB floats."""
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    # Blender pixel rows start at the bottom: y=0 is the bottom row.
    t = ((xs / (w - 1)) + (1.0 - ys / (h - 1))) / 2.0  # 0 top-left .. 1 bottom-right
    t = 1.0 - t
    t = np.clip(t, 0, 1)
    pos = np.array([s[0] for s in stops], np.float32)
    cols = np.array([hex_srgb(s[1]) for s in stops], np.float32)
    rgb = np.stack([np.interp(t, pos, cols[:, i]) for i in range(3)], axis=-1)
    cx, cy = (w - 1) / 2, (h - 1) * 0.55
    r = np.sqrt(((xs - cx) / w) ** 2 + ((ys - cy) / h) ** 2)
    glow = np.clip(1.0 - r / 0.55, 0, 1) ** 2 * BG_GLOW
    rgb = rgb + (1.0 - rgb) * glow[..., None]
    return rgb


def composite_on_gradient(src_png, dst_png, stops=BG_STOPS):
    """Alpha-over the transparent render onto the pastel gradient (straight alpha, sRGB)."""
    img = bpy.data.images.load(src_png, check_existing=False)
    w, h = img.size
    px = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)
    fg, a = px[..., :3], px[..., 3:4]
    out = fg * a + _gradient_bg(w, h, stops) * (1.0 - a)
    res = np.concatenate([out, np.ones_like(a)], axis=-1).astype(np.float32)
    dst = bpy.data.images.new("composite", w, h, alpha=True, float_buffer=False)
    dst.pixels.foreach_set(res.ravel())
    dst.filepath_raw = dst_png
    dst.file_format = "PNG"
    dst.save()
    print("COMPOSITED", dst_png)
    bpy.data.images.remove(img)
    bpy.data.images.remove(dst)


# One camera framing for both candidates so the forced choice compares like with like.
CAMERA = {"azimuth_deg": 34.0, "elevation_deg": -3.0, "fill": 0.84, "aim_z": 0.5}
# Extra angles to judge proportions (same framing rule, camera swung around the character).
VIEWS = {"3q": CAMERA, "front": {**CAMERA, "azimuth_deg": 0.0}, "side": {**CAMERA, "azimuth_deg": 90.0}}


def begin(preview):
    """Fresh scene + render settings + studio world. Preview = 512 px / 48 spp for iteration."""
    scene = reset_scene()
    res, spp = (512, 48) if preview else (RENDER_RES, RENDER_SAMPLES)
    device = configure_render(scene, res, spp)
    setup_world(scene)
    print("DEVICE", device, "RES", res, "SPP", spp)
    return scene


def stage(scene, parts, ground_z=0.0, frame_objs=None, view="3q"):
    """Lights + shadow catcher + camera around the character meshes `parts` (also the light-link
    receivers). `frame_objs` overrides what is used for bounds (e.g. posed snapshots).
    `view` = key of VIEWS (lights stay put, only the camera moves)."""
    lo, hi = world_bbox(frame_objs or parts)
    setup_lights(scene, (lo + hi) / 2, parts, scale=(hi.z - lo.z) / 2)
    add_shadow_catcher(scene, z=ground_z)
    return setup_camera(scene, frame_objs or parts, **VIEWS[view])


def finish(scene, out_dir, tag):
    """Render <tag>_transparent.png then composite <tag>_gradient.png. Returns render seconds."""
    tpng = os.path.join(out_dir, f"{tag}_transparent.png")
    dt = render_png(scene, tpng)
    composite_on_gradient(tpng, os.path.join(out_dir, f"{tag}_gradient.png"))
    return dt


def parse_args(count):
    import sys

    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) < count:
        raise SystemExit(f"expected {count} args after '--', got {args}")
    return args
