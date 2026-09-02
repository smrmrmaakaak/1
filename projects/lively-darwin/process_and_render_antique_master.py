import bpy
import os
import math
from mathutils import Vector, Euler

def run():
    print("=== STARTING BLENDER 4.2 LTS MASTER RECONSTRUCTION RENDER ===")
    
    # 1. Reset Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 64
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = False

    # Set soft studio gradient background
    world = bpy.data.worlds.new(name="StudioWorld")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.15, 0.16, 0.18, 1.0)
        bg_node.inputs['Strength'].default_value = 0.6

    obj_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural.obj"
    tex_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural_diffuse.png"

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

    # Center origin and scale to physical height ~19.5 cm (0.195m)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    mesh_obj.location = (0, 0, 0)
    
    dims = mesh_obj.dimensions
    height = dims.z
    if height > 0:
        scale_factor = 0.195 / height
        mesh_obj.scale = (scale_factor, scale_factor, scale_factor)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    # Align bottom of base to Z=0
    min_z = min([v.co.z for v in mesh_obj.data.vertices])
    mesh_obj.location.z = -min_z
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    # Smooth shading
    for poly in mesh_obj.data.polygons:
        poly.use_smooth = True

    # 3. Create High-End Royal Doulton Porcelain PBR Material
    mat = bpy.data.materials.new(name="Mat_RoyalDoulton_Porcelain")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (600, 0)

    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (200, 0)
    principled.inputs['Roughness'].default_value = 0.12
    principled.inputs['IOR'].default_value = 1.52

    # Clearcoat Porcelain Glaze
    if 'Coat Weight' in principled.inputs:
        principled.inputs['Coat Weight'].default_value = 0.95
    elif 'Coat' in principled.inputs:
        principled.inputs['Coat'].default_value = 0.95
        
    if 'Coat Roughness' in principled.inputs:
        principled.inputs['Coat Roughness'].default_value = 0.03

    # Diffuse Texture
    tex_node = nodes.new(type='ShaderNodeTexImage')
    tex_node.location = (-200, 0)
    if os.path.exists(tex_path):
        tex_node.image = bpy.data.images.load(tex_path)
    
    links.new(tex_node.outputs['Color'], principled.inputs['Base Color'])
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])

    if mesh_obj.data.materials:
        mesh_obj.data.materials[0] = mat
    else:
        mesh_obj.data.materials.append(mat)

    # 4. Studio Lighting
    # Key Light (Front Right, Warm 5600K)
    bpy.ops.object.light_add(type='AREA', location=(0.35, -0.42, 0.35))
    key_light = bpy.context.active_object
    key_light.name = "Studio_Key"
    key_light.data.energy = 32.0
    key_light.data.size = 0.35
    key_light.data.color = (1.0, 0.96, 0.90)
    key_light.rotation_euler = (math.radians(45), math.radians(15), math.radians(40))

    # Fill Light (Front Left, Soft Cool 6500K)
    bpy.ops.object.light_add(type='AREA', location=(-0.35, -0.36, 0.28))
    fill_light = bpy.context.active_object
    fill_light.name = "Studio_Fill"
    fill_light.data.energy = 18.0
    fill_light.data.size = 0.45
    fill_light.data.color = (0.92, 0.96, 1.0)
    fill_light.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-40))

    # Top Silhouette Rim Light
    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.38, 0.38))
    rim_light = bpy.context.active_object
    rim_light.name = "Studio_Rim"
    rim_light.data.energy = 36.0
    rim_light.data.size = 0.35
    rim_light.data.color = (1.0, 1.0, 1.0)
    rim_light.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # Soft Base Bounce
    bpy.ops.object.light_add(type='POINT', location=(0.0, -0.20, 0.05))
    bounce_light = bpy.context.active_object
    bounce_light.name = "Studio_Bounce"
    bounce_light.data.energy = 6.0
    bounce_light.data.color = (1.0, 0.96, 0.92)

    # 5. Camera & Multi-Angle Verification Renders
    cam_data = bpy.data.cameras.new(name="RenderCam")
    cam_data.lens = 70.0
    cam_obj = bpy.data.objects.new(name="RenderCam", object_data=cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Target look-at: center chest height ~10.5cm
    target = Vector((0, 0, 0.105))

    def point_cam_at(cam, pos, tgt):
        cam.location = pos
        direction = tgt - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam.rotation_euler = rot_quat.to_euler()

    views = {
        'antique_final_hero.png': Vector((0.26, -0.32, 0.18)),
        'antique_final_front.png': Vector((0.0, -0.40, 0.11)),
        'antique_final_side.png': Vector((0.40, 0.0, 0.11)),
        'antique_final_top.png': Vector((0.001, -0.05, 0.44)),
        'antique_final_back.png': Vector((0.0, 0.40, 0.11)),
    }

    out_base = r"c:\Users\황태민\Documents\antigravity\lively-darwin"
    for filename, pos in views.items():
        point_cam_at(cam_obj, pos, target)
        scene.render.filepath = os.path.join(out_base, filename)
        bpy.ops.render.render(write_still=True)
        print(f"[RENDER] Saved: {filename}")

    # 6. Export Deliverables
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

    print("=== MASTER POST-PROCESSING COMPLETE ===")

if __name__ == '__main__':
    run()
