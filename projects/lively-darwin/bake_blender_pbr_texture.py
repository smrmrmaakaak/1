import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

print("=== BAKING 2048x2048 PBR TEXTURE & PACKAGING GLB FOR WEB VIEWER ===")

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# 1. Import Master AI OBJ
obj_input_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\ai_output\hero_3_4_mesh.obj"
bpy.ops.wm.obj_import(filepath=obj_input_path)

main_obj = [o for o in scene.objects if o.type == 'MESH'][0]
main_obj.name = "RoyalDoulton_PastGlory_AI"
bpy.context.view_layer.objects.active = main_obj
main_obj.select_set(True)

# 2. Orient Upright (+Z up, -Y forward)
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

# 3. Smart UV Unwrap
print("Generating clean UV map...")
bpy.ops.uv.smart_project(angle_limit=math.radians(66), margin_method='SCALED', island_margin=0.002)
bpy.ops.object.mode_set(mode='OBJECT')

# 4. Setup Bake Material with Vertex Color Attribute
mat_bake = bpy.data.materials.new(name="Mat_BakeSource")
mat_bake.use_nodes = True
nodes = mat_bake.node_tree.nodes
nodes.clear()

node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
node_attr = nodes.new(type='ShaderNodeAttribute')
node_attr.attribute_type = 'GEOMETRY'
node_attr.attribute_name = "Color"

node_hsv = nodes.new(type='ShaderNodeHueSaturation')
node_hsv.inputs['Saturation'].default_value = 1.6
node_hsv.inputs['Value'].default_value = 1.25

mat_bake.node_tree.links.new(node_attr.outputs['Color'], node_hsv.inputs['Color'])
mat_bake.node_tree.links.new(node_hsv.outputs['Color'], node_bsdf.inputs['Base Color'])
mat_bake.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

# Create Target Image Texture for Bake
tex_image = bpy.data.images.new(name="PastGlory_BakedDiffuse", width=2048, height=2048, alpha=False, float_buffer=False)
node_tex = nodes.new(type='ShaderNodeTexImage')
node_tex.image = tex_image
nodes.active = node_tex

main_obj.data.materials.clear()
main_obj.data.materials.append(mat_bake)

# 5. Bake Diffuse Texture via Cycles GPU/CPU
print("Baking 2048x2048 texture atlas...")
scene.render.engine = 'CYCLES'
try:
    scene.cycles.device = 'GPU'
    bpy.context.preferences.addons['cycles'].preferences.compute_device_type = 'CUDA'
    bpy.context.preferences.addons['cycles'].preferences.get_devices()
except Exception as e:
    scene.cycles.device = 'CPU'

scene.cycles.samples = 16
scene.cycles.bake_type = 'DIFFUSE'
scene.render.bake.use_pass_direct = False
scene.render.bake.use_pass_indirect = False
scene.render.bake.use_pass_color = True
scene.render.bake.margin = 4

bpy.ops.object.bake(type='DIFFUSE')
print("Bake completed!")

# Save baked image
workspace_dir = r"c:\Users\황태민\Documents\antigravity\lively-darwin"
baked_png_path = os.path.join(workspace_dir, "antique_past_glory_diffuse.png")
tex_image.filepath_raw = baked_png_path
tex_image.file_format = 'PNG'
tex_image.save()
print(f"Saved baked texture: {baked_png_path}")

# 6. Apply Final Web PBR Material (Principled BSDF with baked texture)
mat_pbr = bpy.data.materials.new(name="Mat_RoyalDoulton_PastGlory_PBR")
mat_pbr.use_nodes = True
nodes_pbr = mat_pbr.node_tree.nodes
nodes_pbr.clear()

node_out_pbr = nodes_pbr.new(type='ShaderNodeOutputMaterial')
node_bsdf_pbr = nodes_pbr.new(type='ShaderNodeBsdfPrincipled')
node_tex_pbr = nodes_pbr.new(type='ShaderNodeTexImage')
node_tex_pbr.image = tex_image

mat_pbr.node_tree.links.new(node_tex_pbr.outputs['Color'], node_bsdf_pbr.inputs['Base Color'])
mat_pbr.node_tree.links.new(node_bsdf_pbr.outputs['BSDF'], node_out_pbr.inputs['Surface'])

def set_pbr_input(k, val):
    if k in node_bsdf_pbr.inputs:
        node_bsdf_pbr.inputs[k].default_value = val

set_pbr_input('Roughness', 0.15)
set_pbr_input('Metallic', 0.0)
set_pbr_input('IOR', 1.52)
set_pbr_input('Coat Weight', 0.8)
set_pbr_input('Coat Roughness', 0.04)

main_obj.data.materials.clear()
main_obj.data.materials.append(mat_pbr)

# 7. Render Multi-Angle Verification with EEVEE Next
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1920
scene.render.image_settings.file_format = 'PNG'

# Studio Environment
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

def set_camera_view(pos, target=(0, 0, 0.095)):
    obj_cam.location = pos
    dir_vec = Vector(target) - Vector(pos)
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    obj_cam.rotation_euler = rot_quat.to_euler()

renders = [
    ("antique_past_glory_hero.png", (0.24, -0.32, 0.16), (0, 0, 0.095)),
    ("antique_past_glory_front.png", (0.0, -0.34, 0.095), (0, 0, 0.095)),
    ("antique_past_glory_side.png", (-0.34, 0.0, 0.095), (0, 0, 0.095)),
    ("antique_past_glory_top.png", (0.0, -0.06, 0.35), (0, 0, 0.085)),
    ("antique_past_glory_back.png", (0.0, 0.34, 0.095), (0, 0, 0.095))
]

for filename, cam_pos, cam_target in renders:
    out_path = os.path.join(workspace_dir, filename)
    print(f"Rendering: {filename} ...")
    set_camera_view(cam_pos, cam_target)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Saved: {out_path}")

# 8. Export Master Files (.blend, .glb, .fbx, .obj)
blend_path = os.path.join(workspace_dir, "antique_past_glory.blend")
glb_path = os.path.join(workspace_dir, "antique_past_glory.glb")
fbx_path = os.path.join(workspace_dir, "antique_past_glory.fbx")
obj_path = os.path.join(workspace_dir, "antique_past_glory.obj")

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(f"Saved .blend: {blend_path}")

bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_materials='EXPORT',
    export_image_format='AUTO'
)
print(f"Exported .glb: {glb_path}")

try:
    bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False, apply_scale_options='FBX_SCALE_ALL')
    print(f"Exported .fbx: {fbx_path}")
except Exception as e:
    print(f"FBX export: {e}")

try:
    bpy.ops.wm.obj_export(filepath=obj_path)
    print(f"Exported .obj: {obj_path}")
except Exception as e:
    print(f"OBJ export: {e}")

print("=== ALL MASTER DELIVERABLES COMPLETED & TEXTURED ===")
