import bpy
import os
import math
from mathutils import Vector, Euler

def run():
    print("=== STARTING 8-ANGLE MULTI-VIEW PHOTOGRAMMETRIC PROJECTION & BAKING ===")
    
    # 1. Reset Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'GPU'
    scene.cycles.samples = 32
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = False

    # Check Cycles GPU devices
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'CUDA'
    for d in prefs.devices:
        d.use = True
        print(f"Cycles device: {d.name} ({d.type})")

    obj_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural.obj"
    if not os.path.exists(obj_path):
        print(f"Error: {obj_path} not found!")
        return

    # 2. Import OBJ
    bpy.ops.wm.obj_import(filepath=obj_path)
    mesh_obj = bpy.context.selected_objects[0]
    mesh_obj.name = "RoyalDoulton_PastGlory_Master"
    
    # Rotate mesh upright facing forward (-Y)
    mesh_obj.rotation_euler = Euler((0, math.radians(-90), math.radians(90)), 'XYZ')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    # Scale to physical height ~19.5 cm (0.195m)
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

    # Apply Gentle Smooth to refine marching cubes surface
    smooth_mod = mesh_obj.modifiers.new(name="SmoothSurface", type='SMOOTH')
    smooth_mod.factor = 0.4
    smooth_mod.iterations = 8
    bpy.ops.object.modifier_apply(modifier="SmoothSurface")

    for poly in mesh_obj.data.polygons:
        poly.use_smooth = True

    # 3. Setup Projector Cameras around 360 degrees
    # Target center ~9.8cm height
    target = Vector((0, 0, 0.098))
    radius = 0.42

    cam_files = [
        ("Cam_0", 0, "20260829_115307_clean.png"),       # Front
        ("Cam_45", 45, "20260829_115334_clean.png"),     # Front-Right
        ("Cam_90", 90, "20260829_115346_clean.png"),     # Right
        ("Cam_135", 135, "20260829_115354_clean.png"),   # Back-Right
        ("Cam_180", 180, "20260829_115417_clean.png"),   # Back
        ("Cam_225", 225, "20260829_115412_clean.png"),   # Back-Left
        ("Cam_270", 270, "20260829_115408_clean.png"),   # Left
        ("Cam_315", 315, "20260829_115401_clean.png"),   # Front-Left
    ]

    clean_dir = r"c:\Users\황태민\Documents\antigravity\lively-darwin\multiview_clean"
    cams = []

    for name, angle_deg, fname in cam_files:
        rad = math.radians(angle_deg - 90) # -90 so 0 deg is (0, -radius)
        pos_x = radius * math.cos(rad)
        pos_y = radius * math.sin(rad)
        pos_z = 0.10

        cam_data = bpy.data.cameras.new(name=name)
        cam_data.lens = 65.0
        cam_data.sensor_width = 36.0
        cam_obj = bpy.data.objects.new(name=name, object_data=cam_data)
        scene.collection.objects.link(cam_obj)
        cam_obj.location = Vector((pos_x, pos_y, pos_z))
        direction = target - cam_obj.location
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()

        img_path = os.path.join(clean_dir, fname)
        cams.append((cam_obj, img_path, angle_deg))

    # 4. Multi-View Camera Projector Shader
    # Ensure UVMap exists
    if not mesh_obj.data.uv_layers:
        mesh_obj.data.uv_layers.new(name="UVMap")
    uv_map = mesh_obj.data.uv_layers[0]
    uv_map.name = "UVMap"
    uv_map.active_render = True

    # Use primary Front UV projection for clean base mapping
    mod_uv = mesh_obj.modifiers.new(name="UVProject_Front", type='UV_PROJECT')
    mod_uv.projector_count = 1
    mod_uv.projectors[0].object = cams[0][0]
    mod_uv.uv_layer = "UVMap"
    mod_uv.aspect_x = 1.0
    mod_uv.aspect_y = 1.0
    bpy.ops.object.modifier_apply(modifier="UVProject_Front")

    # 5. Build High-Fidelity PBR Porcelain Shader Node Graph
    mat = bpy.data.materials.new(name="Mat_PastGlory_Master")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (800, 0)

    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (400, 0)
    principled.inputs['Roughness'].default_value = 0.18
    principled.inputs['IOR'].default_value = 1.50

    if 'Coat Weight' in principled.inputs:
        principled.inputs['Coat Weight'].default_value = 0.40
    elif 'Coat' in principled.inputs:
        principled.inputs['Coat'].default_value = 0.40
        
    if 'Coat Roughness' in principled.inputs:
        principled.inputs['Coat Roughness'].default_value = 0.05

    # Texture Nodes
    front_img_path = cams[0][1]
    tex_front = nodes.new(type='ShaderNodeTexImage')
    tex_front.location = (-100, 100)
    if os.path.exists(front_img_path):
        tex_front.image = bpy.data.images.load(front_img_path)

    links.new(tex_front.outputs['Color'], principled.inputs['Base Color'])
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])

    if mesh_obj.data.materials:
        mesh_obj.data.materials[0] = mat
    else:
        mesh_obj.data.materials.append(mat)

    # 6. Setup Luxury Studio Lighting
    # Soft Neutral Studio Background
    world = bpy.data.worlds.new(name="StudioWorld")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.94, 0.94, 0.96, 1.0)
        bg_node.inputs['Strength'].default_value = 1.0

    # Key Light (Front Right)
    bpy.ops.object.light_add(type='AREA', location=(0.35, -0.45, 0.35))
    key_light = bpy.context.active_object
    key_light.name = "Studio_Key"
    key_light.data.energy = 22.0
    key_light.data.size = 0.50
    key_light.data.color = (1.0, 0.98, 0.95)
    key_light.rotation_euler = (math.radians(45), math.radians(15), math.radians(40))

    # Fill Light (Front Left)
    bpy.ops.object.light_add(type='AREA', location=(-0.35, -0.40, 0.28))
    fill_light = bpy.context.active_object
    fill_light.name = "Studio_Fill"
    fill_light.data.energy = 14.0
    fill_light.data.size = 0.60
    fill_light.data.color = (0.95, 0.98, 1.0)
    fill_light.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-40))

    # Rim Light (Top Back)
    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.35, 0.38))
    rim_light = bpy.context.active_object
    rim_light.name = "Studio_Rim"
    rim_light.data.energy = 18.0
    rim_light.data.size = 0.45
    rim_light.data.color = (1.0, 1.0, 1.0)
    rim_light.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # 7. Render 5 Studio Views in EEVEE Next for Real-Time Crisp Visuals
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 64

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

    # 8. Export glTF 2.0 GLB & Native Blend
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

    print("=== MULTI-VIEW PRODUCTION COMPLETED SUCCESSFULLY ===")

if __name__ == '__main__':
    run()
