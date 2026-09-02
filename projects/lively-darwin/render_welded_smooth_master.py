import bpy
import os
import math
from mathutils import Vector, Euler

def run():
    print("=== STARTING WELDED CONTINUOUS SURFACE RENDERING ===")
    
    # 1. Reset Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 64
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = False

    world = bpy.data.worlds.new(name="StudioWorld")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.94, 0.94, 0.96, 1.0)
        bg_node.inputs['Strength'].default_value = 1.0

    obj_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural.obj"
    front_img_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\multiview_square\front_square.png"

    # 2. Import OBJ
    bpy.ops.wm.obj_import(filepath=obj_path)
    mesh_obj = bpy.context.selected_objects[0]
    mesh_obj.name = "RoyalDoulton_PastGlory_Master"
    
    mesh_obj.rotation_euler = Euler((0, math.radians(-90), math.radians(90)), 'XYZ')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    mesh_obj.location = (0, 0, 0)
    
    dims = mesh_obj.dimensions
    height = dims.z
    if height > 0:
        scale_factor = 0.195 / height
        mesh_obj.scale = (scale_factor, scale_factor, scale_factor)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    min_z = min([v.co.z for v in mesh_obj.data.vertices])
    mesh_obj.location.z = -min_z
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    # 3. WELD SEAM VERTICES (remove_doubles) to make manifold
    bpy.context.view_layer.objects.active = mesh_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Apply Gentle Smooth on WELDED manifold mesh
    smooth_mod = mesh_obj.modifiers.new(name="SmoothSurface", type='SMOOTH')
    smooth_mod.factor = 0.5
    smooth_mod.iterations = 6
    bpy.ops.object.modifier_apply(modifier="SmoothSurface")

    for poly in mesh_obj.data.polygons:
        poly.use_smooth = True

    # 4. Setup Projector Camera for 1:1 Photo Mapping
    target = Vector((0, 0, 0.098))
    cam_data = bpy.data.cameras.new(name="Cam_Front_Proj")
    cam_data.lens = 65.0
    cam_data.sensor_width = 36.0
    cam_data.sensor_fit = 'AUTO'
    cam_front = bpy.data.objects.new(name="Cam_Front_Proj", object_data=cam_data)
    scene.collection.objects.link(cam_front)
    cam_front.location = Vector((0.0, -0.42, 0.10))
    direction = target - cam_front.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_front.rotation_euler = rot_quat.to_euler()

    # Clear old UVs and project fresh clean UV
    while mesh_obj.data.uv_layers:
        mesh_obj.data.uv_layers.remove(mesh_obj.data.uv_layers[0])
    
    uv_map = mesh_obj.data.uv_layers.new(name="UVMap")
    uv_map.active_render = True
    
    mod_uv = mesh_obj.modifiers.new(name="UVProject_Front", type='UV_PROJECT')
    mod_uv.projector_count = 1
    mod_uv.projectors[0].object = cam_front
    mod_uv.uv_layer = "UVMap"
    mod_uv.aspect_x = 1.0
    mod_uv.aspect_y = 1.0
    bpy.ops.object.modifier_apply(modifier="UVProject_Front")

    # 5. Realistic Royal Doulton Porcelain PBR Material
    mat = bpy.data.materials.new(name="Mat_PastGlory_Master")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (600, 0)

    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (200, 0)
    principled.inputs['Roughness'].default_value = 0.22
    principled.inputs['IOR'].default_value = 1.50
    principled.inputs['Metallic'].default_value = 0.0

    if 'Coat Weight' in principled.inputs:
        principled.inputs['Coat Weight'].default_value = 0.35
    elif 'Coat' in principled.inputs:
        principled.inputs['Coat'].default_value = 0.35
        
    if 'Coat Roughness' in principled.inputs:
        principled.inputs['Coat Roughness'].default_value = 0.05

    # Texture Node
    tex_front = nodes.new(type='ShaderNodeTexImage')
    tex_front.location = (-200, 0)
    if os.path.exists(front_img_path):
        tex_front.image = bpy.data.images.load(front_img_path)

    links.new(tex_front.outputs['Color'], principled.inputs['Base Color'])
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])

    if mesh_obj.data.materials:
        mesh_obj.data.materials[0] = mat
    else:
        mesh_obj.data.materials.append(mat)

    # 6. Studio Lighting
    bpy.ops.object.light_add(type='AREA', location=(0.35, -0.45, 0.35))
    key_light = bpy.context.active_object
    key_light.name = "Studio_Key"
    key_light.data.energy = 16.0
    key_light.data.size = 0.60
    key_light.data.color = (1.0, 0.98, 0.95)
    key_light.rotation_euler = (math.radians(45), math.radians(15), math.radians(40))

    bpy.ops.object.light_add(type='AREA', location=(-0.35, -0.40, 0.28))
    fill_light = bpy.context.active_object
    fill_light.name = "Studio_Fill"
    fill_light.data.energy = 12.0
    fill_light.data.size = 0.70
    fill_light.data.color = (0.95, 0.98, 1.0)
    fill_light.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-40))

    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.35, 0.38))
    rim_light = bpy.context.active_object
    rim_light.name = "Studio_Rim"
    rim_light.data.energy = 14.0
    rim_light.data.size = 0.50
    rim_light.data.color = (1.0, 1.0, 1.0)
    rim_light.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # 7. Render Cameras
    cam_data = bpy.data.cameras.new(name="MasterRenderCam")
    cam_data.lens = 70.0
    cam_render = bpy.data.objects.new(name="MasterRenderCam", object_data=cam_data)
    scene.collection.objects.link(cam_render)
    scene.camera = cam_render

    def point_cam_at(cam, pos, tgt):
        cam.location = pos
        direction = tgt - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam.rotation_euler = rot_quat.to_euler()

    views = {
        'antique_past_glory_master_hero.png': Vector((0.24, -0.32, 0.18)),
        'antique_past_glory_master_front.png': Vector((0.0, -0.40, 0.10)),
        'antique_past_glory_master_side.png': Vector((0.40, 0.0, 0.10)),
        'antique_past_glory_master_top.png': Vector((0.001, -0.05, 0.42)),
        'antique_past_glory_master_back.png': Vector((0.0, 0.40, 0.10)),
    }

    out_base = r"c:\Users\황태민\Documents\antigravity\lively-darwin"
    for filename, pos in views.items():
        point_cam_at(cam_render, pos, target)
        scene.render.filepath = os.path.join(out_base, filename)
        bpy.ops.render.render(write_still=True)
        print(f"[RENDER] Saved: {filename}")

    # 8. Export GLB & Blend
    glb_out = os.path.join(out_base, "antique_past_glory_master.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_out,
        export_format='GLB',
        export_apply=True,
        export_yup=True
    )
    print(f"[EXPORT] GLB: {glb_out}")

    blend_out = os.path.join(out_base, "antique_past_glory_master.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_out)
    print(f"[EXPORT] BLEND: {blend_out}")

    print("=== WELDED CONTINUOUS RENDERING COMPLETE ===")

if __name__ == '__main__':
    run()
