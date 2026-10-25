import bpy, os, math, sys
from mathutils import Vector
OUT = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(os.path.dirname(bpy.app.binary_path), "5.2/datafiles/assets/nodes/procedural_hair_node_assets.blend")
WANT = ["Attach Hair Curves to Surface","Interpolate Hair Curves","Clump Hair Curves","Frizz Hair Curves","Set Hair Curve Profile","Hair Curves Noise"]
with bpy.data.libraries.load(p) as (src, dst):
    dst.node_groups = WANT
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=64, ring_count=32)
head = bpy.context.active_object; head.name = "head"; head.add_rest_position_attribute = True
me = head.data; at = me.attributes.new("mane_mask", 'FLOAT', 'POINT')
for v in me.vertices:
    x, y, z = v.co
    at.data[v.index].value = 1.0 if (abs(x) < 0.22 and (z > 0.0 or y > 0.3)) else 0.0
# guides: a crest line from forehead over the top to the nape, each guide droops to one side
cv = bpy.data.hair_curves.new("mane")
N, P = 24, 12
cv.add_curves([P]*N)
pos = []
for i in range(N):
    t = i/(N-1); side = 1 if i % 2 else -1
    a = math.radians(-60 + 150*t)              # along the crest, front -> back
    root = Vector((0.12*side, math.sin(a)*-1.0, math.cos(a)))
    for k in range(P):
        s = k/(P-1)
        d = root + Vector((side*0.6*s, -0.5*s*s, -1.1*s*s)) + root*0.15*s
        pos.append(d)
for i, v in enumerate(pos): cv.points[i].position = v
ob = bpy.data.objects.new("mane", cv); bpy.context.collection.objects.link(ob)
cv.surface = head; cv.surface_uv_map = "UVMap"
def mod(name, **vals):
    m = ob.modifiers.new(name, 'NODES'); g = bpy.data.node_groups[name]; m.node_group = g
    ids = {i.name: i.identifier for i in g.interface.items_tree if getattr(i,'in_out',None)=='INPUT'}
    for k, v in vals.items():
        getattr(m.properties.inputs, ids[k.replace("_"," ")]).value = v
    return m
ma = mod("Attach Hair Curves to Surface", Surface_Object=head)
for it in bpy.data.node_groups["Attach Hair Curves to Surface"].interface.items_tree:
    if getattr(it,"in_out",None)=="INPUT": print("ATT", it.name, it.identifier, repr(getattr(getattr(ma.properties.inputs, it.identifier), "value", "-")))
mi = mod("Interpolate Hair Curves", Density=4000.0, Distance_to_Guides=0.6, Interpolation_Guides=3)
for it in bpy.data.node_groups["Interpolate Hair Curves"].interface.items_tree:
    if getattr(it,"name","")=="Density Mask":
        inp = getattr(mi.properties.inputs, it.identifier); print("MASKINPUT", [a for a in dir(inp) if not a.startswith("_")], inp.type)
        inp.type = 'ATTRIBUTE'; inp.attribute_name = "mane_mask"
mod("Clump Hair Curves", Factor=0.8, Tip_Spread=0.05)
mod("Frizz Hair Curves", Factor=0.4, Distance=0.04)
mod("Set Hair Curve Profile", Radius=0.006)
dg = bpy.context.evaluated_depsgraph_get()
ev = ob.evaluated_get(dg).data
for mm in ob.modifiers: print("WARN", mm.name, [(w.type, w.message) for w in mm.node_warnings])
print("RESULT curves:", len(ev.curves), "points:", len(ev.points))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 32; sc.cycles.device='CPU'
sc.render.resolution_x = sc.render.resolution_y = 512
mat = bpy.data.materials.new("hair"); mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]; bsdf.inputs["Base Color"].default_value = (0.8,0.7,0.95,1)
cv.materials.append(mat)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (4.5,-3.0,1.2); cam.rotation_euler = (math.radians(82),0,math.radians(56))
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun",'SUN')); sc.collection.objects.link(sun); sun.rotation_euler=(0.6,0.2,0.8)
sc.render.filepath = os.path.join(OUT, "probe_mask.png"); bpy.ops.render.render(write_still=True)
print("RENDERED")
