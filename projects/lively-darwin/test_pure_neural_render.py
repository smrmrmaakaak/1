import bpy
import os
import math
from mathutils import Vector, Euler

def run():
    print("=== TESTING PURE NEURAL TEXTURED PORCELAIN RENDER ===")
    
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
        bg_node.inputs['Color'].default_value = (0.95, 0.95, 0.96, 1.0)
        bg_node.inputs['Strength'].default_value = 1.0

    obj_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural.obj"
    tex_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural_diffuse.png"

    # Import
    bpy.ops.wm.obj_import(filepath=obj_path)
    mesh_obj = bpy.context.selected_objects[0]
    mesh_obj.name = "RoyalDoulton_PastGlory_Master"
    
    # Rotate upright: (0, -90, 90) makes it face forward (-Y)
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

    # Smooth
    smooth_mod = mesh_obj.modifiers.new(name="SmoothSurface", type='SMOOTH')
    smooth_mod.factor = 0.4
    smooth_mod.iterations = 6
    bpy.ops.object.modifier_apply(modifier="SmoothSurface")

    for poly in mesh_obj.data.polygons:
        poly.use_smooth = True

    # Pure Diffuse PBR Material
    mat = bpy.data.materials.new(name="Mat_Porcelain_Glaze")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (600, 0)

    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (200, 0)
    principled.inputs['Roughness'].default_value = 0.35
    principled.inputs['IOR'].default_value = 1.45
    principled.inputs['Metallic'].default_value = 0.0

    if 'Coat Weight' in principled.inputs:
        principled.inputs['Coat Weight'].default_value = 0.0

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

    # Soft 3-Point Light
    bpy.ops.object.light_add(type='AREA', location=(0.35, -0.45, 0.35))
    k = bpy.context.active_object
    k.data.energy = 12.0
    k.data.size = 0.6
    k.rotation_euler = (math.radians(45), math.radians(15), math.radians(40))

    bpy.ops.object.light_add(type='AREA', location=(-0.35, -0.40, 0.28))
    f = bpy.context.active_object
    f.data.energy = 10.0
    f.data.size = 0.7
    f.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-40))

    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.35, 0.38))
    r = bpy.context.active_object
    r.data.energy = 12.0
    r.data.size = 0.5
    r.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # Render Hero and Front
    cam_data = bpy.data.cameras.new(name="Cam")
    cam_data.lens = 70.0
    cam_obj = bpy.data.objects.new(name="Cam", object_data=cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    target = Vector((0, 0, 0.098))
    def point_cam(pos):
        cam_obj.location = pos
        direction = target - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()

    views = {
        'antique_past_glory_master_hero.png': Vector((0.24, -0.32, 0.18)),
        'antique_past_glory_master_front.png': Vector((0.0, -0.40, 0.10)),
        'antique_past_glory_master_side.png': Vector((0.40, 0.0, 0.10)),
        'antique_past_glory_master_top.png': Vector((0.001, -0.05, 0.42)),
        'antique_past_glory_master_back.png': Vector((0.0, 0.40, 0.10)),
    }

    out_base = r"c:\Users\황태민\Documents\antigravity\lively-darwin"
    for filename, pos in views.items():
        point_cam(pos)
        scene.render.filepath = os.path.join(out_base, filename)
        bpy.ops.render.render(write_still=True)
        print(f"[RENDER] Saved: {filename}")

    # Export
    glb_out = os.path.join(out_base, "antique_past_glory_master.glb")
    bpy.ops.export_scene.gltf(filepath=glb_out, export_format='GLB', export_apply=True, export_yup=True)
    blend_out = os.path.join(out_base, "antique_past_glory_master.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_out)

if __name__ == '__main__':
    run()
