import bpy
import os
import math
from mathutils import Vector, Euler

def run():
    print("=== MULTI-VIEW 360 PHOTOGRAMMETRIC PROJECTION & ATLAS BAKE ===")
    
    # 1. Reset Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'GPU'
    
    # Enable CUDA / OptiX for Cycles
    prefs = bpy.context.preferences
    cprefs = prefs.addons['cycles'].preferences
    cprefs.compute_device_type = 'CUDA'
    cprefs.get_devices()
    for d in cprefs.devices:
        d.use = True
    scene.cycles.samples = 128
    scene.cycles.bake_type = 'DIFFUSE'
    scene.render.bake.use_pass_direct = False
    scene.render.bake.use_pass_indirect = False
    scene.render.bake.use_pass_color = True
    scene.render.bake.margin = 16

    obj_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural.obj"
    multiview_dir = r"c:\Users\황태민\Documents\antigravity\lively-darwin\multiview_square"

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

    # 3. WELD SEAM VERTICES
    bpy.context.view_layer.objects.active = mesh_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Apply Gentle Smooth
    smooth_mod = mesh_obj.modifiers.new(name="SmoothSurface", type='SMOOTH')
    smooth_mod.factor = 0.4
    smooth_mod.iterations = 5
    bpy.ops.object.modifier_apply(modifier="SmoothSurface")

    for poly in mesh_obj.data.polygons:
        poly.use_smooth = True

    # 4. Create Master UV Atlas for Texture Baking
    while mesh_obj.data.uv_layers:
        mesh_obj.data.uv_layers.remove(mesh_obj.data.uv_layers[0])
        
    uv_atlas = mesh_obj.data.uv_layers.new(name="UVMap_Atlas")
    uv_atlas.active_render = True
    uv_atlas.active = True

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=66.0, island_margin=0.015)
    bpy.ops.object.mode_set(mode='OBJECT')

    # 5. Create 4 Projector Cameras (Front, Right, Back, Left)
    target = Vector((0, 0, 0.098))
    dist = 0.42
    lens = 55.0

    cam_configs = [
        ("Cam_Front", Vector((0.0, -dist, 0.098)), "UVMap_Front", "front_square.png"),
        ("Cam_Right", Vector((dist, 0.0, 0.098)), "UVMap_Right", "right_square.png"),
        ("Cam_Back", Vector((0.0, dist, 0.098)), "UVMap_Back", "back_square.png"),
        ("Cam_Left", Vector((-dist, 0.0, 0.098)), "UVMap_Left", "left_square.png"),
    ]

    for name, pos, uv_layer_name, img_file in cam_configs:
        cam_data = bpy.data.cameras.new(name=name)
        cam_data.lens = lens
        cam_data.sensor_width = 36.0
        cam_data.sensor_fit = 'AUTO'
        cam_obj = bpy.data.objects.new(name=name, object_data=cam_data)
        scene.collection.objects.link(cam_obj)
        cam_obj.location = pos
        direction = target - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()

        # Add UV Layer
        uv_layer = mesh_obj.data.uv_layers.new(name=uv_layer_name)
        mod_uv = mesh_obj.modifiers.new(name=f"UVProject_{name}", type='UV_PROJECT')
        mod_uv.projector_count = 1
        mod_uv.projectors[0].object = cam_obj
        mod_uv.uv_layer = uv_layer_name
        mod_uv.aspect_x = 1.0
        mod_uv.aspect_y = 1.0
        bpy.ops.object.modifier_apply(modifier=f"UVProject_{name}")

    # Set Atlas as active render UV
    mesh_obj.data.uv_layers["UVMap_Atlas"].active_render = True
    mesh_obj.data.uv_layers["UVMap_Atlas"].active = True

    # 6. Build 4-Way Multi-Angle Blended Shader
    mat_blend = bpy.data.materials.new(name="Mat_MultiAngle_Blend")
    mat_blend.use_nodes = True
    nodes = mat_blend.node_tree.nodes
    links = mat_blend.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (1200, 0)
    emission = nodes.new(type='ShaderNodeEmission') # Using emission for pure color pass during diffuse bake
    emission.location = (1000, 0)
    links.new(emission.outputs['Emission'], output.inputs['Surface'])

    # Geometry Normal
    geom = nodes.new(type='ShaderNodeNewGeometry')
    geom.location = (-600, 400)
    
    # Separate XYZ of Normal
    sep_norm = nodes.new(type='ShaderNodeSeparateXYZ')
    sep_norm.location = (-400, 400)
    links.new(geom.outputs['Normal'], sep_norm.inputs['Vector'])

    # Texture Nodes for Front, Right, Back, Left
    tex_nodes = {}
    for idx, (cname, _, uv_name, img_file) in enumerate(cam_configs):
        uv_node = nodes.new(type='ShaderNodeUVMap')
        uv_node.location = (-600, 200 - idx * 250)
        uv_node.uv_map = uv_name

        t_node = nodes.new(type='ShaderNodeTexImage')
        t_node.location = (-350, 200 - idx * 250)
        t_node.extension = 'CLIP'
        img_full_path = os.path.join(multiview_dir, img_file)
        if os.path.exists(img_full_path):
            t_node.image = bpy.data.images.load(img_full_path)
        links.new(uv_node.outputs['UV'], t_node.inputs['Vector'])
        tex_nodes[cname] = t_node

    # Mix Front and Back based on Normal Y (Normal Y < 0 is Front, Normal Y > 0 is Back)
    # Front-Back Map Range: map Normal Y [-1, 1] to [0, 1]
    map_fb = nodes.new(type='ShaderNodeMapRange')
    map_fb.location = (-100, 300)
    map_fb.inputs['From Min'].default_value = -0.5
    map_fb.inputs['From Max'].default_value = 0.5
    links.new(sep_norm.outputs['Y'], map_fb.inputs['Value'])

    mix_fb = nodes.new(type='ShaderNodeMix')
    mix_fb.data_type = 'RGBA'
    mix_fb.location = (200, 200)
    links.new(map_fb.outputs['Result'], mix_fb.inputs['Factor'])
    links.new(tex_nodes['Cam_Front'].outputs['Color'], mix_fb.inputs[6]) # A: Front
    links.new(tex_nodes['Cam_Back'].outputs['Color'], mix_fb.inputs[7])  # B: Back

    # Mix Left and Right based on Normal X (Normal X < 0 is Left, Normal X > 0 is Right)
    map_lr = nodes.new(type='ShaderNodeMapRange')
    map_lr.location = (-100, -100)
    map_lr.inputs['From Min'].default_value = -0.5
    map_lr.inputs['From Max'].default_value = 0.5
    links.new(sep_norm.outputs['X'], map_lr.inputs['Value'])

    mix_lr = nodes.new(type='ShaderNodeMix')
    mix_lr.data_type = 'RGBA'
    mix_lr.location = (200, -100)
    links.new(map_lr.outputs['Result'], mix_lr.inputs['Factor'])
    links.new(tex_nodes['Cam_Left'].outputs['Color'], mix_lr.inputs[6])  # A: Left
    links.new(tex_nodes['Cam_Right'].outputs['Color'], mix_lr.inputs[7]) # B: Right

    # Final Blend between (Front/Back) and (Left/Right) based on abs(Normal.X)
    math_abs = nodes.new(type='ShaderNodeMath')
    math_abs.operation = 'ABSOLUTE'
    math_abs.location = (100, 0)
    links.new(sep_norm.outputs['X'], math_abs.inputs[0])

    map_final = nodes.new(type='ShaderNodeMapRange')
    map_final.location = (300, 0)
    map_final.inputs['From Min'].default_value = 0.2
    map_final.inputs['From Max'].default_value = 0.8
    links.new(math_abs.outputs['Value'], map_final.inputs['Value'])

    mix_final = nodes.new(type='ShaderNodeMix')
    mix_final.data_type = 'RGBA'
    mix_final.location = (600, 50)
    links.new(map_final.outputs['Result'], mix_final.inputs['Factor'])
    links.new(mix_fb.outputs[2], mix_final.inputs[6]) # A: Front/Back
    links.new(mix_lr.outputs[2], mix_final.inputs[7]) # B: Left/Right

    links.new(mix_final.outputs[2], emission.inputs['Color'])

    # Bake Target Image Node
    bake_img = bpy.data.images.new("PastGlory_Baked_Atlas", width=4096, height=4096)
    target_tex_node = nodes.new(type='ShaderNodeTexImage')
    target_tex_node.location = (800, 300)
    target_tex_node.image = bake_img
    nodes.active = target_tex_node

    if mesh_obj.data.materials:
        mesh_obj.data.materials[0] = mat_blend
    else:
        mesh_obj.data.materials.append(mat_blend)

    # 7. Execute Bake
    print("Starting 4096x4096 Cycles GPU Bake...")
    bpy.ops.object.bake(type='EMIT')
    
    baked_path = os.path.join(r"c:\Users\황태민\Documents\antigravity\lively-darwin", "antique_past_glory_baked_atlas.png")
    bake_img.filepath_raw = baked_path
    bake_img.file_format = 'PNG'
    bake_img.save()
    print(f"Bake complete: {baked_path}")

    # 8. Setup Final PBR Porcelain Shader with Baked Atlas
    mat_final = bpy.data.materials.new(name="Mat_RoyalDoulton_PastGlory_PBR")
    mat_final.use_nodes = True
    f_nodes = mat_final.node_tree.nodes
    f_links = mat_final.node_tree.links
    f_nodes.clear()

    f_out = f_nodes.new(type='ShaderNodeOutputMaterial')
    f_out.location = (600, 0)

    principled = f_nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (200, 0)
    principled.inputs['Roughness'].default_value = 0.30
    principled.inputs['IOR'].default_value = 1.50
    principled.inputs['Metallic'].default_value = 0.0

    if 'Coat Weight' in principled.inputs:
        principled.inputs['Coat Weight'].default_value = 0.20
    elif 'Coat' in principled.inputs:
        principled.inputs['Coat'].default_value = 0.20

    final_tex_node = f_nodes.new(type='ShaderNodeTexImage')
    final_tex_node.location = (-200, 0)
    final_tex_node.image = bake_img

    f_links.new(final_tex_node.outputs['Color'], principled.inputs['Base Color'])
    f_links.new(principled.outputs['BSDF'], f_out.inputs['Surface'])

    mesh_obj.data.materials[0] = mat_final

    # Remove extra UV layers, keep only UVMap_Atlas as "UVMap"
    for uv_name in ["UVMap_Front", "UVMap_Right", "UVMap_Back", "UVMap_Left"]:
        if uv_name in mesh_obj.data.uv_layers:
            mesh_obj.data.uv_layers.remove(mesh_obj.data.uv_layers[uv_name])
    mesh_obj.data.uv_layers["UVMap_Atlas"].name = "UVMap"

    # 9. Multi-Angle Verification Renders
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 64

    world = bpy.data.worlds.new(name="StudioWorld_Final")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.95, 0.95, 0.96, 1.0)
        bg_node.inputs['Strength'].default_value = 1.0

    # Soft studio lights
    bpy.ops.object.light_add(type='SUN', location=(0.5, -1.0, 2.0))
    sun = bpy.context.active_object
    sun.data.energy = 2.5
    sun.data.color = (1.0, 0.98, 0.96)

    bpy.ops.object.light_add(type='AREA', location=(0.0, -0.45, 0.20))
    front_soft = bpy.context.active_object
    front_soft.data.energy = 8.0
    front_soft.data.size = 0.8
    front_soft.data.color = (1.0, 1.0, 1.0)
    front_soft.rotation_euler = (math.radians(70), 0, 0)

    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.45, 0.20))
    back_soft = bpy.context.active_object
    back_soft.data.energy = 6.0
    back_soft.data.size = 0.8
    back_soft.data.color = (1.0, 1.0, 1.0)
    back_soft.rotation_euler = (math.radians(-70), 0, math.radians(180))

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

    # 10. Export Final GLB & Blend
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

    print("=== 360 PHOTOGRAMMETRIC PROJECTION & ATLAS BAKE COMPLETE ===")

if __name__ == '__main__':
    run()
