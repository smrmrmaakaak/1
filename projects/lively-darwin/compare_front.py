import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

# 1. Reset Scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# 2. Import Front Eye Level AI OBJ
obj_input_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\ai_output\front_eye_level_mesh.obj"
bpy.ops.wm.obj_import(filepath=obj_input_path)

imported_objs = [o for o in scene.objects if o.type == 'MESH']
main_obj = imported_objs[0]
main_obj.name = "RoyalDoulton_PastGlory_AI_Front"
bpy.context.view_layer.objects.active = main_obj
main_obj.select_set(True)

# 3. Rotate to make figure upright and face forward (-Y)
main_obj.rotation_euler = Euler((0, math.radians(-90), math.radians(90)), 'XYZ')
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

# Auto-center and Scale to 19.5cm height
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

bbox = [main_obj.matrix_world @ Vector(corner) for corner in main_obj.bound_box]
size_x = max([v.x for v in bbox]) - min([v.x for v in bbox])
size_y = max([v.y for v in bbox]) - min([v.y for v in bbox])
size_z = max([v.z for v in bbox]) - min([v.z for v in bbox])

scale_factor = 0.195 / size_z
main_obj.scale = (scale_factor, scale_factor, scale_factor)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Align base to z=0 and center on XY
bbox_scaled = [main_obj.matrix_world @ Vector(corner) for corner in main_obj.bound_box]
min_z = min([v.z for v in bbox_scaled])
mid_x = (min([v.x for v in bbox_scaled]) + max([v.x for v in bbox_scaled])) / 2.0
mid_y = (min([v.y for v in bbox_scaled]) + max([v.y for v in bbox_scaled])) / 2.0

main_obj.location.x -= mid_x
main_obj.location.y -= mid_y
main_obj.location.z -= min_z
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

for p in main_obj.data.polygons:
    p.use_smooth = True

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

# 4. Porcelain High-Glaze PBR Shader
mat_porcelain = bpy.data.materials.new(name="Mat_RoyalDoulton_PorcelainGlaze")
mat_porcelain.use_nodes = True
nodes = mat_porcelain.node_tree.nodes
nodes.clear()

node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_out.location = (600, 0)

node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
node_bsdf.location = (200, 0)

node_attr = nodes.new(type='ShaderNodeAttribute')
node_attr.location = (-400, 0)
node_attr.attribute_type = 'GEOMETRY'
node_attr.attribute_name = "Color"

node_hsv = nodes.new(type='ShaderNodeHueSaturation')
node_hsv.location = (-100, 0)
node_hsv.inputs['Saturation'].default_value = 1.7
node_hsv.inputs['Value'].default_value = 1.3

mat_porcelain.node_tree.links.new(node_attr.outputs['Color'], node_hsv.inputs['Color'])
mat_porcelain.node_tree.links.new(node_hsv.outputs['Color'], node_bsdf.inputs['Base Color'])

def set_input(k, val):
    if k in node_bsdf.inputs:
        node_bsdf.inputs[k].default_value = val

set_input('Roughness', 0.16)
set_input('Metallic', 0.0)
set_input('IOR', 1.52)
set_input('Coat Weight', 0.5)
set_input('Coat Roughness', 0.05)

mat_porcelain.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

main_obj.data.materials.clear()
main_obj.data.materials.append(mat_porcelain)

# 5. Studio Environment & Focused Lighting
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
world.use_nodes = True
w_bg = world.node_tree.nodes.get("Background")
if w_bg:
    w_bg.inputs['Color'].default_value = (0.08, 0.09, 0.11, 1.0)
    w_bg.inputs['Strength'].default_value = 0.3

col_lights = bpy.data.collections.new("Studio_Lighting")
scene.collection.children.link(col_lights)

def add_studio_light(name, l_type, energy, color, location, target=(0, 0, 0.095)):
    light_data = bpy.data.lights.new(name=name, type=l_type)
    light_data.energy = energy
    light_data.color = color
    if l_type == 'AREA':
        light_data.size = 0.45
    
    obj_l = bpy.data.objects.new(name=name, object_data=light_data)
    obj_l.location = location
    col_lights.objects.link(obj_l)
    
    dir_vec = Vector(target) - Vector(location)
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    obj_l.rotation_euler = rot_quat.to_euler()
    return obj_l

add_studio_light("Key_Warm_Softbox", 'AREA', 4.5, (1.0, 0.96, 0.90), (0.28, -0.40, 0.28))
add_studio_light("Fill_Cool_Softbox", 'AREA', 2.0, (0.90, 0.94, 1.0), (-0.35, -0.30, 0.22))
add_studio_light("Rim_Gold_Accent", 'AREA', 3.8, (1.0, 0.88, 0.70), (0.20, 0.35, 0.25))
add_studio_light("Top_Rim", 'AREA', 2.2, (1.0, 1.0, 1.0), (0.0, 0.15, 0.45))

cam_data = bpy.data.cameras.new(name="StudioCamera")
cam_data.lens = 70
obj_cam = bpy.data.objects.new(name="Main_Camera", object_data=cam_data)
scene.collection.objects.link(obj_cam)
scene.camera = obj_cam

try:
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
except:
    try:
        scene.render.engine = 'BLENDER_EEVEE'
    except:
        pass

scene.render.resolution_x = 1920
scene.render.resolution_y = 1920
scene.render.image_settings.file_format = 'PNG'

def set_camera_view(pos, target=(0, 0, 0.095)):
    obj_cam.location = pos
    dir_vec = Vector(target) - Vector(pos)
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    obj_cam.rotation_euler = rot_quat.to_euler()

workspace_dir = r"c:\Users\황태민\Documents\antigravity\lively-darwin"

renders = [
    ("compare_front_hero.png", (0.24, -0.32, 0.16), (0, 0, 0.095)),
    ("compare_front_front.png", (0.0, -0.34, 0.095), (0, 0, 0.095))
]

for filename, cam_pos, cam_target in renders:
    out_path = os.path.join(workspace_dir, filename)
    set_camera_view(cam_pos, cam_target)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Saved: {out_path}")
