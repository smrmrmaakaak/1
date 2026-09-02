import bpy
import bmesh
import os
import math
from mathutils import Vector, Euler

def run():
    print("=== BUILDING PROCEDURAL ROYAL DOULTON MASTER FIGURINE (QUAD TOPOLOGY) ===")
    
    # 1. Reset Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 64
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = False

    # Studio World
    world = bpy.data.worlds.new(name="StudioWorld")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.94, 0.95, 0.96, 1.0)
        bg_node.inputs['Strength'].default_value = 1.0

    # 2. PBR Porcelain Glaze Materials
    def create_porcelain_mat(name, base_col, roughness=0.18, coat=0.45, metallic=0.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()
        
        output = nodes.new(type='ShaderNodeOutputMaterial')
        output.location = (400, 0)
        
        bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        bsdf.location = (0, 0)
        bsdf.inputs['Base Color'].default_value = base_col
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['IOR'].default_value = 1.52
        
        if 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = coat
        elif 'Coat' in bsdf.inputs:
            bsdf.inputs['Coat'].default_value = coat
            
        if 'Coat Roughness' in bsdf.inputs:
            bsdf.inputs['Coat Roughness'].default_value = 0.04

        links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
        return mat

    # Materials
    mat_scarlet = create_porcelain_mat("Mat_Scarlet_Tunic", (0.75, 0.08, 0.12, 1.0), roughness=0.20, coat=0.50)
    mat_navy = create_porcelain_mat("Mat_Navy_Trim", (0.05, 0.07, 0.14, 1.0), roughness=0.22, coat=0.40)
    mat_gold = create_porcelain_mat("Mat_Gold_Gilt", (0.95, 0.72, 0.15, 1.0), roughness=0.15, coat=0.60, metallic=0.85)
    mat_silver = create_porcelain_mat("Mat_Silver_Medal", (0.85, 0.88, 0.92, 1.0), roughness=0.12, coat=0.70, metallic=0.95)
    mat_brass = create_porcelain_mat("Mat_Brass_Bugle", (0.92, 0.68, 0.18, 1.0), roughness=0.16, coat=0.55, metallic=0.88)
    mat_black_boot = create_porcelain_mat("Mat_Black_Patent", (0.02, 0.02, 0.03, 1.0), roughness=0.10, coat=0.85)
    mat_trousers = create_porcelain_mat("Mat_Dark_Trousers", (0.06, 0.07, 0.09, 1.0), roughness=0.30, coat=0.20)
    mat_flesh = create_porcelain_mat("Mat_Porcelain_Flesh", (0.95, 0.75, 0.68, 1.0), roughness=0.25, coat=0.35)
    mat_white_hair = create_porcelain_mat("Mat_White_Hair", (0.92, 0.92, 0.94, 1.0), roughness=0.35, coat=0.20)
    mat_wood = create_porcelain_mat("Mat_Mahogany_Trunk", (0.28, 0.14, 0.08, 1.0), roughness=0.28, coat=0.35)
    mat_slate = create_porcelain_mat("Mat_Slate_Corner", (0.12, 0.13, 0.15, 1.0), roughness=0.25, coat=0.40, metallic=0.4)
    mat_ribbon_cyan = create_porcelain_mat("Mat_Ribbon_Cyan", (0.02, 0.65, 0.85, 1.0), roughness=0.25, coat=0.3)
    mat_ribbon_green = create_porcelain_mat("Mat_Ribbon_Green", (0.05, 0.60, 0.25, 1.0), roughness=0.25, coat=0.3)
    mat_ribbon_red = create_porcelain_mat("Mat_Ribbon_Red", (0.85, 0.10, 0.15, 1.0), roughness=0.25, coat=0.3)

    created_objects = []

    def make_mesh_obj(name, bm, mat, loc=(0,0,0), rot=(0,0,0), scale=(1,1,1)):
        mesh = bpy.data.meshes.new(name + "_Mesh")
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.collection.objects.link(obj)
        obj.location = loc
        obj.rotation_euler = rot
        obj.scale = scale
        obj.data.materials.append(mat)
        for p in obj.data.polygons: p.use_smooth = True
        created_objects.append(obj)
        return obj

    def bm_cyl(radius, depth, seg=16):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=radius, radius2=radius, depth=depth)
        return bm

    def bm_cone(r1, r2, depth, seg=16):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=depth)
        return bm

    def bm_cube():
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        return bm

    def bm_sphere(sub=2, rad=0.01):
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=rad)
        return bm

    # 3. Geometric Components (19.5cm physical scale)
    # A. Antique Trunk Base (Width=10.5cm, Depth=9.5cm, Height=7.6cm)
    obj_trunk = make_mesh_obj("Antique_Trunk", bm_cube(), mat_wood, loc=(0, 0, 0.038), scale=(0.105, 0.095, 0.076))
    bev = obj_trunk.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.04
    bev.segments = 3

    # Trunk Slate Trim & Corners
    obj_corners = make_mesh_obj("Trunk_Corners", bm_cube(), mat_slate, loc=(0, 0, 0.038), scale=(0.108, 0.098, 0.078))
    bev_c = obj_corners.modifiers.new(name="Bevel", type='BEVEL')
    bev_c.width = 0.03
    bev_c.segments = 2

    # B. Lower Body (Trousers & Legs seated forward)
    obj_thighs = make_mesh_obj("Pensioner_Thighs", bm_cube(), mat_trousers, loc=(0, -0.025, 0.082), scale=(0.082, 0.065, 0.035))
    bev_th = obj_thighs.modifiers.new(name="Bevel", type='BEVEL')
    bev_th.width = 0.15
    bev_th.segments = 4

    # Lower Legs
    for side, x in [("L", -0.028), ("R", 0.028)]:
        make_mesh_obj(f"Shin_{side}", bm_cyl(0.016, 0.065, 16), mat_trousers, loc=(x, -0.055, 0.045), rot=(math.radians(10), 0, 0))

    # Boots (Glossy Black Patent Leather)
    for side, x in [("L", -0.028), ("R", 0.028)]:
        obj_boot = make_mesh_obj(f"Boot_{side}", bm_cube(), mat_black_boot, loc=(x, -0.065, 0.012), scale=(0.026, 0.048, 0.024))
        bev_b = obj_boot.modifiers.new(name="Bevel", type='BEVEL')
        bev_b.width = 0.35
        bev_b.segments = 4

    # C. Torso & Scarlet Tunic (Seated upright with coat tails)
    obj_torso = make_mesh_obj("Pensioner_Torso", bm_cyl(0.038, 0.075, 24), mat_scarlet, loc=(0, -0.012, 0.125), scale=(1.05, 0.85, 1.0))
    bev_t = obj_torso.modifiers.new(name="Bevel", type='BEVEL')
    bev_t.width = 0.08
    bev_t.segments = 3

    # Navy Collar
    make_mesh_obj("Navy_Collar", bm_cyl(0.022, 0.012, 20), mat_navy, loc=(0, -0.012, 0.162))

    # Gold Double-Breasted Buttons (10 buttons: 5 pairs)
    for row in range(5):
        z_pos = 0.105 + row * 0.011
        for col_x in [-0.012, 0.012]:
            make_mesh_obj(f"Btn_{row}_{col_x}", bm_sphere(2, 0.0022), mat_gold, loc=(col_x, -0.044, z_pos))

    # Medals (Left Chest: 3-bar ribbon + Silver Medallions)
    ribbon_colors = [mat_ribbon_cyan, mat_ribbon_green, mat_ribbon_red]
    for i, r_mat in enumerate(ribbon_colors):
        x_m = 0.016 + i * 0.0055
        make_mesh_obj(f"Ribbon_{i}", bm_cube(), r_mat, loc=(x_m, -0.043, 0.145), scale=(0.0045, 0.002, 0.008))
        make_mesh_obj(f"Medal_{i}", bm_cyl(0.0026, 0.001, 12), mat_silver, loc=(x_m, -0.044, 0.138), rot=(math.radians(90), 0, 0))

    # D. Arms & Hands holding Bugle
    # Upper Arms
    for side, x, rot_y in [("L", -0.044, -15), ("R", 0.044, 15)]:
        make_mesh_obj(f"UpperArm_{side}", bm_cyl(0.014, 0.055, 16), mat_scarlet, loc=(x, -0.015, 0.135), rot=(math.radians(35), math.radians(rot_y), 0))

    # Forearms
    for side, x, rot_z in [("L", -0.028, 30), ("R", 0.028, -30)]:
        make_mesh_obj(f"ForeArm_{side}", bm_cyl(0.013, 0.050, 16), mat_scarlet, loc=(x, -0.042, 0.118), rot=(math.radians(75), 0, math.radians(rot_z)))
        make_mesh_obj(f"Cuff_{side}", bm_cyl(0.014, 0.010, 16), mat_navy, loc=(x, -0.055, 0.115), rot=(math.radians(75), 0, math.radians(rot_z)))

    # Hands
    for side, x in [("L", -0.018), ("R", 0.018)]:
        make_mesh_obj(f"Hand_{side}", bm_sphere(2, 0.009), mat_flesh, loc=(x, -0.065, 0.114))

    # E. Brass Bugle Horn & Silk Tassel
    # Bell Horn Flare
    make_mesh_obj("Bugle_Bell", bm_cone(0.016, 0.005, 0.038, 20), mat_brass, loc=(-0.015, -0.078, 0.110), rot=(math.radians(-25), math.radians(65), math.radians(-30)))

    # Horn Tube Loop
    bpy.ops.mesh.primitive_torus_add(major_radius=0.022, minor_radius=0.0045, major_segments=24, minor_segments=12, location=(0.008, -0.072, 0.115), rotation=(math.radians(70), math.radians(20), 0))
    obj_loop = bpy.context.active_object
    obj_loop.name = "Bugle_Loop"
    obj_loop.data.materials.append(mat_brass)
    for p in obj_loop.data.polygons: p.use_smooth = True
    created_objects.append(obj_loop)

    # Black Silk Tassel
    make_mesh_obj("Bugle_Tassel", bm_cone(0.006, 0.001, 0.025, 12), mat_navy, loc=(0.022, -0.070, 0.098), rot=(math.radians(15), 0, 0))

    # F. Head, Facial Features & Peaked Cap
    obj_head = make_mesh_obj("Pensioner_Head", bm_sphere(3, 0.018), mat_flesh, loc=(0, -0.015, 0.178), scale=(0.95, 1.05, 1.15))

    # Mustache
    obj_mus = make_mesh_obj("Mustache", bm_cube(), mat_white_hair, loc=(0, -0.031, 0.174), scale=(0.016, 0.005, 0.004))
    bev_m = obj_mus.modifiers.new(name="Bevel", type='BEVEL')
    bev_m.width = 0.35
    bev_m.segments = 3

    # White Hair Sideburns
    for side, x in [("L", -0.016), ("R", 0.016)]:
        make_mesh_obj(f"Sideburn_{side}", bm_sphere(2, 0.006), mat_white_hair, loc=(x, -0.016, 0.176))

    # Peaked Cap Crown
    make_mesh_obj("Cap_Crown", bm_cyl(0.021, 0.016, 24), mat_black_boot, loc=(0, -0.015, 0.192), scale=(1.02, 1.08, 1.0))

    # Cap Visor
    make_mesh_obj("Cap_Visor", bm_cyl(0.024, 0.003, 24), mat_black_boot, loc=(0, -0.024, 0.186), rot=(math.radians(20), 0, 0), scale=(0.9, 0.7, 1.0))

    # Gold "RH" Badge & Chin Strap
    make_mesh_obj("Cap_RH_Badge", bm_sphere(2, 0.004), mat_gold, loc=(0, -0.033, 0.195))

    bpy.ops.mesh.primitive_torus_add(major_radius=0.021, minor_radius=0.0015, major_segments=24, minor_segments=8, location=(0, -0.016, 0.187), rotation=(math.radians(15), 0, 0))
    obj_strap = bpy.context.active_object
    obj_strap.name = "Cap_Strap"
    obj_strap.data.materials.append(mat_gold)
    for p in obj_strap.data.polygons: p.use_smooth = True
    created_objects.append(obj_strap)

    # 4. Join into Master Figurine Object
    bpy.ops.object.select_all(action='DESELECT')
    for obj in created_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = created_objects[0]
    
    bpy.ops.object.duplicate()
    bpy.ops.object.join()
    master_obj = bpy.context.active_object
    master_obj.name = "RoyalDoulton_PastGlory_HN2484_Master"
    
    # Hide individual parts from render
    for obj in created_objects:
        obj.hide_render = True
        obj.hide_viewport = True

    # 5. Studio Lighting
    bpy.ops.object.light_add(type='AREA', location=(0.35, -0.45, 0.35))
    key_light = bpy.context.active_object
    key_light.name = "Studio_Key"
    key_light.data.energy = 22.0
    key_light.data.size = 0.50
    key_light.data.color = (1.0, 0.98, 0.95)
    key_light.rotation_euler = (math.radians(45), math.radians(15), math.radians(40))

    bpy.ops.object.light_add(type='AREA', location=(-0.35, -0.40, 0.28))
    fill_light = bpy.context.active_object
    fill_light.name = "Studio_Fill"
    fill_light.data.energy = 14.0
    fill_light.data.size = 0.60
    fill_light.data.color = (0.95, 0.98, 1.0)
    fill_light.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-40))

    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.35, 0.38))
    rim_light = bpy.context.active_object
    rim_light.name = "Studio_Rim"
    rim_light.data.energy = 20.0
    rim_light.data.size = 0.45
    rim_light.data.color = (1.0, 1.0, 1.0)
    rim_light.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # 6. Render 5 Studio Angles
    cam_data = bpy.data.cameras.new(name="MasterRenderCam")
    cam_data.lens = 70.0
    cam_render = bpy.data.objects.new(name="MasterRenderCam", object_data=cam_data)
    scene.collection.objects.link(cam_render)
    scene.camera = cam_render

    target = Vector((0, 0, 0.098))

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

    # 7. Export GLB & Blend
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

    print("=== PROCEDURAL ROYAL DOULTON MASTER COMPLETE ===")

if __name__ == '__main__':
    run()
