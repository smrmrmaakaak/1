import bpy
import os
import math
from mathutils import Vector, Euler

def run():
    print("=== RENDERING 5-ANGLE FULL-FIGURE VERIFICATION RENDERS ===")
    
    # 1. Open Master Blend File
    blend_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\antique_past_glory_master.blend"
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 64
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024

    # Setup studio background
    world = bpy.data.worlds.new(name="StudioWorld_Master")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.95, 0.95, 0.96, 1.0)
        bg_node.inputs['Strength'].default_value = 1.0

    # Ensure clean studio lighting
    for obj in list(scene.objects):
        if obj.type == 'LIGHT' or obj.type == 'CAMERA':
            bpy.data.objects.remove(obj, do_unlink=True)

    # Soft studio lights
    bpy.ops.object.light_add(type='SUN', location=(0.5, -1.0, 2.0))
    sun = bpy.context.active_object
    sun.data.energy = 2.4
    sun.data.color = (1.0, 0.98, 0.96)

    bpy.ops.object.light_add(type='AREA', location=(0.0, -0.55, 0.20))
    front_soft = bpy.context.active_object
    front_soft.data.energy = 8.0
    front_soft.data.size = 1.0
    front_soft.data.color = (1.0, 1.0, 1.0)
    front_soft.rotation_euler = (math.radians(70), 0, 0)

    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.55, 0.20))
    back_soft = bpy.context.active_object
    back_soft.data.energy = 6.0
    back_soft.data.size = 1.0
    back_soft.data.color = (1.0, 1.0, 1.0)
    back_soft.rotation_euler = (math.radians(-70), 0, math.radians(180))

    # Setup Master Camera with 52mm focal length
    cam_data = bpy.data.cameras.new(name="MasterFramedCam")
    cam_data.lens = 52.0
    cam_render = bpy.data.objects.new(name="MasterFramedCam", object_data=cam_data)
    scene.collection.objects.link(cam_render)
    scene.camera = cam_render

    target = Vector((0, 0, 0.098))

    def point_cam_at(cam, pos, tgt):
        cam.location = pos
        direction = tgt - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam.rotation_euler = rot_quat.to_euler()

    dist = 0.48
    views = {
        'antique_past_glory_master_hero.png': Vector((0.32, -0.40, 0.20)),
        'antique_past_glory_master_front.png': Vector((0.0, -dist, 0.098)),
        'antique_past_glory_master_side.png': Vector((dist, 0.0, 0.098)),
        'antique_past_glory_master_top.png': Vector((0.001, -0.05, 0.50)),
        'antique_past_glory_master_back.png': Vector((0.0, dist, 0.098)),
    }

    out_base = r"c:\Users\황태민\Documents\antigravity\lively-darwin"
    for filename, pos in views.items():
        point_cam_at(cam_render, pos, target)
        scene.render.filepath = os.path.join(out_base, filename)
        bpy.ops.render.render(write_still=True)
        print(f"[RENDER] Saved full-figure: {filename}")

    # Re-export GLB with clean textures and materials
    glb_out = os.path.join(out_base, "antique_past_glory_master.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_out,
        export_format='GLB',
        export_apply=True,
        export_yup=True
    )
    print(f"[EXPORT] Updated GLB: {glb_out}")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"[EXPORT] Updated BLEND: {blend_path}")

if __name__ == '__main__':
    run()
