import bpy, sys, math, os
from mathutils import Vector
argv = sys.argv[sys.argv.index("--")+1:]
gltf, outdir = argv[0], argv[1]
name = os.path.splitext(os.path.basename(gltf))[0]
STYLES = {"lowpoly": (False, 0.9, 0.0), "clay": (True, 0.85, 0.0), "toy": (True, 0.25, 0.5)}

def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = 768, 768
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    world = bpy.data.worlds.new("W"); sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.94, 0.92, 0.99, 1); bg.inputs[1].default_value = 1.0
    for kind, loc, energy, size in (("AREA",(4,-4,6),800,4),("AREA",(-5,-2,3),300,5)):
        ld = bpy.data.lights.new(kind, "AREA"); ld.energy = energy; ld.size = size
        o = bpy.data.objects.new(kind, ld); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (Vector((0,0,0)) - Vector(loc)).to_track_quat("-Z","Y").to_euler()
    cam = bpy.data.cameras.new("C"); cam.lens = 60
    co = bpy.data.objects.new("Cam", cam); sc.collection.objects.link(co); sc.camera = co
    return sc, co

def import_model():
    bpy.ops.import_scene.gltf(filepath=gltf)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    for o in bpy.context.scene.objects:
        if o.type == "ARMATURE":
            o.animation_data_clear()
    return meshes

def frame(co, meshes):
    pts = []
    for o in meshes:
        pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)])
    c = (lo+hi)/2; r = (hi-lo).length/2
    d = r / math.tan(math.radians(20)) * 1.05
    dirv = Vector((1.0,-1.4,0.7)).normalized()
    co.location = c + dirv*d
    co.rotation_euler = (c - co.location).to_track_quat("-Z","Y").to_euler()

def style(meshes, smooth, rough, spec_boost, tint):
    for o in meshes:
        if smooth:
            bpy.context.view_layer.objects.active = o; o.select_set(True)
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(60))
        for slot in o.material_slots:
            mat = slot.material
            if not mat or not mat.use_nodes: continue
            bsdf = next((n for n in mat.node_tree.nodes if n.type=="BSDF_PRINCIPLED"), None)
            if not bsdf: continue
            bsdf.inputs["Roughness"].default_value = rough
            if "Specular IOR Level" in bsdf.inputs:
                bsdf.inputs["Specular IOR Level"].default_value = 0.5 + spec_boost
            if tint and not bsdf.inputs["Base Color"].is_linked:
                bc = bsdf.inputs["Base Color"].default_value
                bsdf.inputs["Base Color"].default_value = tuple(0.6*bc[i]+0.4*tint[i] for i in range(3))+(1,)

for sname, (smooth, rough, spec) in STYLES.items():
    sc, co = setup_scene()
    meshes = import_model()
    frame(co, meshes)
    style(meshes, smooth, rough, spec, None)
    sc.render.filepath = os.path.join(outdir, f"{name}_{sname}.png")
    bpy.ops.render.render(write_still=True)
    print("WROTE", sc.render.filepath)
