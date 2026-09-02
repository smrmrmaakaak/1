import bpy
import math
import os
from mathutils import Vector

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.scenes:
        bpy.data.scenes.new(name="Scene")
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.length_unit = 'METERS'
    return scene

def add_bevel(obj, width=0.012, segments=2):
    bev = obj.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = width
    bev.segments = segments
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35)
    for poly in obj.data.polygons:
        poly.use_smooth = True

def create_pbr_mat(name, color=(0.8, 0.8, 0.8, 1.0), roughness=0.5, metallic=0.0, 
                   transmission=0.0, emission_col=(0,0,0,1), emission_str=0.0, ior=1.45, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    if "Base Color" in node_bsdf.inputs: node_bsdf.inputs["Base Color"].default_value = color
    if "Roughness" in node_bsdf.inputs: node_bsdf.inputs["Roughness"].default_value = roughness
    if "Metallic" in node_bsdf.inputs: node_bsdf.inputs["Metallic"].default_value = metallic
    if "Alpha" in node_bsdf.inputs: node_bsdf.inputs["Alpha"].default_value = alpha
    if "IOR" in node_bsdf.inputs: node_bsdf.inputs["IOR"].default_value = ior
    if "Emission Color" in node_bsdf.inputs: node_bsdf.inputs["Emission Color"].default_value = emission_col
    if "Emission Strength" in node_bsdf.inputs: node_bsdf.inputs["Emission Strength"].default_value = emission_str
    if "Transmission Weight" in node_bsdf.inputs: node_bsdf.inputs["Transmission Weight"].default_value = transmission
    elif "Transmission" in node_bsdf.inputs: node_bsdf.inputs["Transmission"].default_value = transmission
        
    links.new(node_bsdf.outputs["BSDF"], node_out.inputs["Surface"])
    return mat

def create_wood_floor(name, base_col=(0.76, 0.62, 0.44, 1.0), roughness=0.32):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    tex_coord = nodes.new(type='ShaderNodeTexCoord')
    mapping = nodes.new(type='ShaderNodeMapping')
    mapping.inputs['Scale'].default_value = (8.0, 1.5, 1.0)
    
    noise = nodes.new(type='ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 14.0
    noise.inputs['Detail'].default_value = 4.0
    
    color_ramp = nodes.new(type='ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.3
    color_ramp.color_ramp.elements[0].color = (base_col[0]*0.8, base_col[1]*0.8, base_col[2]*0.8, 1.0)
    color_ramp.color_ramp.elements[1].position = 0.7
    color_ramp.color_ramp.elements[1].color = base_col
    
    links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], noise.inputs['Vector'])
    links.new(noise.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], node_bsdf.inputs['Base Color'])
    node_bsdf.inputs['Roughness'].default_value = roughness
    
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def build_wirye_37py_scene():
    # Materials
    mat_floor_oak = create_wood_floor("Floor_OakHerringbone", base_col=(0.78, 0.64, 0.46, 1.0), roughness=0.3)
    mat_floor_tile = create_pbr_mat("Floor_PorcelainTile", color=(0.91, 0.90, 0.88, 1.0), roughness=0.25)
    mat_wall = create_pbr_mat("Wall_PureWhitePaint", color=(0.96, 0.96, 0.95, 1.0), roughness=0.7)
    mat_wall_accent = create_pbr_mat("Wall_WarmTaupe", color=(0.82, 0.78, 0.72, 1.0), roughness=0.6)
    mat_wood_walnut = create_pbr_mat("Wood_WarmWalnut", color=(0.42, 0.24, 0.12, 1.0), roughness=0.35)
    mat_wood_oak = create_pbr_mat("Wood_NaturalOak", color=(0.74, 0.56, 0.38, 1.0), roughness=0.35)
    mat_marble = create_pbr_mat("Marble_Calacatta", color=(0.95, 0.95, 0.96, 1.0), roughness=0.15)
    mat_sofa_fabric = create_pbr_mat("Fabric_BoucleIvory", color=(0.90, 0.88, 0.84, 1.0), roughness=0.85)
    mat_leather = create_pbr_mat("Leather_TanBrown", color=(0.58, 0.34, 0.18, 1.0), roughness=0.4)
    mat_glass = create_pbr_mat("Glass_Crystal", color=(0.95, 0.98, 1.0, 1.0), roughness=0.02, transmission=0.95, ior=1.52, alpha=0.2)
    mat_metal_black = create_pbr_mat("Metal_MatteBlack", color=(0.08, 0.08, 0.09, 1.0), roughness=0.35, metallic=0.85)
    mat_metal_brass = create_pbr_mat("Metal_BrushedBrass", color=(0.88, 0.72, 0.38, 1.0), roughness=0.25, metallic=0.92)
    mat_led_warm = create_pbr_mat("LED_Warm2700K", color=(1.0, 0.88, 0.65, 1.0), emission_col=(1.0, 0.86, 0.60, 1.0), emission_str=12.0)
    mat_tv_screen = create_pbr_mat("TV_Screen", color=(0.02, 0.02, 0.03, 1.0), roughness=0.1, metallic=0.5)

    # 1. Floor Slabs (Total: 13.6m wide x 9.6m deep, 4-Bay Layout)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.05))
    floor_base = bpy.context.active_object
    floor_base.name = "Floor_Main_Wood"
    floor_base.scale = (13.6, 9.6, 0.1)
    floor_base.data.materials.append(mat_floor_oak)
    add_bevel(floor_base, 0.02, 2)

    # Kitchen & Foyer Porcelain Tile Inset (X=-1.5 to 2.8, Y=0.0 to 4.2)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, 2.0, 0.052))
    kitch_tile = bpy.context.active_object
    kitch_tile.name = "Floor_Kitchen_Tile"
    kitch_tile.scale = (4.5, 4.4, 0.1)
    kitch_tile.data.materials.append(mat_floor_tile)

    # 2. Architectural Isometric Cutaway Walls (Height = 1.1m for 3D layout view)
    wall_h = 1.1
    walls_data = [
        # Outer Perimeter Walls
        ((0, -4.75, wall_h/2 + 0.1), (13.6, 0.2, wall_h)), # Front South Wall
        ((0, 4.75, wall_h/2 + 0.1), (13.6, 0.2, wall_h)),  # Back North Wall
        ((-6.75, 0, wall_h/2 + 0.1), (0.2, 9.6, wall_h)),  # Left West Wall
        ((6.75, 0, wall_h/2 + 0.1), (0.2, 9.6, wall_h)),   # Right East Wall

        # Interior 4-Bay Vertical Divider Walls
        ((3.1, -1.8, wall_h/2 + 0.1), (0.16, 5.8, wall_h)),  # Living / Master Bedroom divider
        ((-1.8, -1.8, wall_h/2 + 0.1), (0.16, 5.8, wall_h)), # Living / Bed2 divider
        ((-4.3, -1.8, wall_h/2 + 0.1), (0.16, 5.8, wall_h)), # Bed2 / Bed3 divider

        # Horizontal Corridor / Room Dividers
        ((-4.3, 1.2, wall_h/2 + 0.1), (4.8, 0.16, wall_h)),   # Bed2, Bed3 / Foyer, Bath divider
        ((4.9, 1.2, wall_h/2 + 0.1), (3.6, 0.16, wall_h)),    # Master Bed / Dresser, Bath divider
        ((0.65, 4.1, wall_h/2 + 0.1), (4.8, 0.16, wall_h)),   # Kitchen / Utility room divider
        ((-1.8, 2.7, wall_h/2 + 0.1), (0.16, 3.2, wall_h)),   # Kitchen / Foyer divider
        ((-4.3, 2.8, wall_h/2 + 0.1), (0.16, 3.2, wall_h)),   # Foyer / Bath divider
    ]

    for idx, (pos, sc) in enumerate(walls_data):
        bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
        w = bpy.context.active_object
        w.name = f"Wall_Arch_{idx}"
        w.scale = sc
        w.data.materials.append(mat_wall)
        add_bevel(w, 0.01, 2)

    # 3. ZONE 1: 광폭 거실 (Wide Living Room: X=0.6, Y=-2.0)
    # Luxury Boucle Modular Sofa (3.2m wide x 1.1m deep x 0.75m high)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, -0.6, 0.25 + 0.1))
    sofa_base = bpy.context.active_object
    sofa_base.name = "Living_Sofa_Base"
    sofa_base.scale = (3.2, 1.0, 0.4)
    sofa_base.data.materials.append(mat_sofa_fabric)
    add_bevel(sofa_base, 0.06, 3)

    # Sofa Backrest
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, -0.15, 0.5 + 0.1))
    sofa_back = bpy.context.active_object
    sofa_back.name = "Living_Sofa_Back"
    sofa_back.scale = (3.2, 0.25, 0.35)
    sofa_back.data.materials.append(mat_sofa_fabric)
    add_bevel(sofa_back, 0.05, 3)

    # Designer Calacatta Marble Round Coffee Table
    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=0.32, location=(0.6, -2.1, 0.16 + 0.1), vertices=48)
    table1 = bpy.context.active_object
    table1.name = "Living_Coffee_Table"
    table1.data.materials.append(mat_marble)
    add_bevel(table1, 0.015, 2)

    # Secondary Walnut Stool Table
    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=0.38, location=(1.35, -1.9, 0.19 + 0.1), vertices=48)
    table2 = bpy.context.active_object
    table2.name = "Living_Sub_Table"
    table2.data.materials.append(mat_wood_walnut)
    add_bevel(table2, 0.015, 2)

    # Large Designer Area Rug (3.6m x 2.4m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, -1.8, 0.005 + 0.1))
    rug = bpy.context.active_object
    rug.name = "Living_Area_Rug"
    rug.scale = (3.8, 2.6, 0.01)
    rug.data.materials.append(mat_sofa_fabric)

    # TV Wall Low Console (3.0m x 0.45m x 0.35m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, -4.45, 0.175 + 0.1))
    tv_stand = bpy.context.active_object
    tv_stand.name = "TV_Console"
    tv_stand.scale = (3.0, 0.4, 0.35)
    tv_stand.data.materials.append(mat_wood_walnut)
    add_bevel(tv_stand, 0.015, 2)

    # 85" Ultra-Slim TV on Stand
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, -4.55, 0.8 + 0.1))
    tv = bpy.context.active_object
    tv.name = "OLED_85_TV"
    tv.scale = (1.9, 0.06, 1.1)
    tv.data.materials.append(mat_tv_screen)
    add_bevel(tv, 0.008, 2)

    # 4. ZONE 2: 대면형 주방 & 다이닝 (Kitchen & Dining: X=0.6, Y=2.0)
    # Large Kitchen Island Table (2.4m x 0.9m x 0.88m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, 1.0, 0.44 + 0.1))
    island = bpy.context.active_object
    island.name = "Kitchen_Island"
    island.scale = (2.4, 0.9, 0.88)
    island.data.materials.append(mat_marble)
    add_bevel(island, 0.015, 3)

    # 6-Person Designer Dining Table (2.0m x 0.9m x 0.75m) attached to island
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, -0.15, 0.375 + 0.1))
    dining_table = bpy.context.active_object
    dining_table.name = "Dining_Table"
    dining_table.scale = (2.0, 0.85, 0.05)
    dining_table.data.materials.append(mat_wood_walnut)
    add_bevel(dining_table, 0.01, 2)

    # Dining Table Brass Legs
    for dx in [-0.85, 0.85]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6 + dx, -0.15, 0.175 + 0.1))
        leg = bpy.context.active_object
        leg.name = f"DiningLeg_{dx}"
        leg.scale = (0.06, 0.75, 0.35)
        leg.data.materials.append(mat_metal_brass)

    # 4 Dining Chairs
    for cx in [-0.6, 0.6]:
        for cy in [-0.55, 0.25]:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6 + cx, cy, 0.22 + 0.1))
            ch = bpy.context.active_object
            ch.name = f"Chair_{cx}_{cy}"
            ch.scale = (0.45, 0.45, 0.45)
            ch.data.materials.append(mat_leather)
            add_bevel(ch, 0.02, 2)

    # Back Kitchen Main Counter ('ㅡ' + 'ㄷ'자형 캐비닛: 4.2m x 0.65m x 0.88m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.6, 3.6, 0.44 + 0.1))
    k_sink = bpy.context.active_object
    k_sink.name = "Kitchen_Back_Counter"
    k_sink.scale = (4.2, 0.65, 0.88)
    k_sink.data.materials.append(mat_wood_oak)
    add_bevel(k_sink, 0.015, 2)

    # Built-in Fridge Cabinet (X=-1.4, Y=3.0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.3, 3.0, 0.85 + 0.1))
    fridge = bpy.context.active_object
    fridge.name = "Kitchen_Fridge_Wall"
    fridge.scale = (0.7, 1.8, 1.7)
    fridge.data.materials.append(mat_wall_accent)
    add_bevel(fridge, 0.015, 2)

    # 5. ZONE 3: 안방 마스터룸 (Master Bedroom: X=4.9, Y=-2.0)
    # Luxury King Size Bed (2.0m x 2.2m x 0.55m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(4.9, -1.8, 0.25 + 0.1))
    bed_mat = bpy.context.active_object
    bed_mat.name = "Master_Bed_Mattress"
    bed_mat.scale = (2.0, 2.1, 0.45)
    bed_mat.data.materials.append(mat_sofa_fabric)
    add_bevel(bed_mat, 0.05, 3)

    # Bed Headboard with Acoustic Slat Wood & LED Backlight
    bpy.ops.mesh.primitive_cube_add(size=1, location=(4.9, -0.65, 0.6 + 0.1))
    headboard = bpy.context.active_object
    headboard.name = "Master_Bed_Headboard"
    headboard.scale = (2.8, 0.12, 1.0)
    headboard.data.materials.append(mat_wood_walnut)
    add_bevel(headboard, 0.015, 2)

    # LED Backlight on Headboard
    bpy.ops.mesh.primitive_cube_add(size=1, location=(4.9, -0.68, 0.95 + 0.1))
    h_led = bpy.context.active_object
    h_led.name = "Master_Headboard_LED"
    h_led.scale = (2.7, 0.02, 0.03)
    h_led.data.materials.append(mat_led_warm)

    # Nightstands on both sides
    for side in [-1.55, 1.55]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(4.9 + side, -0.75, 0.22 + 0.1))
        ns = bpy.context.active_object
        ns.name = f"Nightstand_{side}"
        ns.scale = (0.5, 0.45, 0.45)
        ns.data.materials.append(mat_wood_walnut)
        add_bevel(ns, 0.015, 2)

    # Master Dresser Room Wardrobe (X=4.9, Y=2.5)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(4.9, 2.6, 0.55 + 0.1))
    dresser = bpy.context.active_object
    dresser.name = "Master_Walkin_Closet"
    dresser.scale = (3.2, 0.6, 1.1)
    dresser.data.materials.append(mat_wood_oak)
    add_bevel(dresser, 0.015, 2)

    # Master Bath Shower Glass Partition (X=6.0, Y=3.6)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5.8, 3.6, 0.55 + 0.1))
    m_glass = bpy.context.active_object
    m_glass.name = "Master_Bath_Glass"
    m_glass.scale = (1.5, 0.05, 1.1)
    m_glass.data.materials.append(mat_glass)

    # 6. ZONE 4: 침실 2 (Bedroom 2 / Study: X=-3.05, Y=-2.0)
    # Single Bed
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-3.05, -1.2, 0.22 + 0.1))
    bed2 = bpy.context.active_object
    bed2.name = "Bed2_Mattress"
    bed2.scale = (1.2, 2.0, 0.4)
    bed2.data.materials.append(mat_sofa_fabric)
    add_bevel(bed2, 0.04, 2)

    # Study Desk (1.4m x 0.65m x 0.75m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-3.05, -3.8, 0.37 + 0.1))
    desk2 = bpy.context.active_object
    desk2.name = "Bed2_Study_Desk"
    desk2.scale = (1.5, 0.65, 0.74)
    desk2.data.materials.append(mat_wood_oak)
    add_bevel(desk2, 0.015, 2)

    # 7. ZONE 5: 침실 3 (Bedroom 3 / Guest Room: X=-5.5, Y=-2.0)
    # Daybed / Guest Bed
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-5.5, -1.2, 0.22 + 0.1))
    bed3 = bpy.context.active_object
    bed3.name = "Bed3_Mattress"
    bed3.scale = (1.2, 2.0, 0.4)
    bed3.data.materials.append(mat_sofa_fabric)
    add_bevel(bed3, 0.04, 2)

    # Built-in Wardrobe (X=-5.5, Y=-4.0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-5.5, -4.1, 0.55 + 0.1))
    ward3 = bpy.context.active_object
    ward3.name = "Bed3_Wardrobe"
    ward3.scale = (1.8, 0.6, 1.1)
    ward3.data.materials.append(mat_wall)
    add_bevel(ward3, 0.015, 2)

    # 8. ZONE 6: 공용 욕실 (Common Bathroom: X=-3.05, Y=2.8)
    # Luxury Bathtub
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-3.05, 3.6, 0.25 + 0.1))
    tub = bpy.context.active_object
    tub.name = "Common_Bath_Tub"
    tub.scale = (1.6, 0.75, 0.5)
    tub.data.materials.append(mat_marble)
    add_bevel(tub, 0.04, 3)

    # Vanity Counter
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-3.05, 2.0, 0.4 + 0.1))
    vanity = bpy.context.active_object
    vanity.name = "Common_Bath_Vanity"
    vanity.scale = (1.2, 0.5, 0.8)
    vanity.data.materials.append(mat_wood_walnut)
    add_bevel(vanity, 0.015, 2)

    # 9. ZONE 7: 현관 & 펜트리 (Foyer & Pantry: X=-5.5, Y=2.8)
    # Shoe Cabinet with Footlight
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-5.5, 2.8, 0.55 + 0.1))
    shoe_cab = bpy.context.active_object
    shoe_cab.name = "Foyer_Shoe_Cabinet"
    shoe_cab.scale = (1.8, 0.5, 1.1)
    shoe_cab.data.materials.append(mat_wall_accent)
    add_bevel(shoe_cab, 0.015, 2)

    # LED Footlight under Shoe Cabinet
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-5.5, 2.8, 0.05 + 0.1))
    f_led = bpy.context.active_object
    f_led.name = "Foyer_Footlight_LED"
    f_led.scale = (1.7, 0.05, 0.02)
    f_led.data.materials.append(mat_led_warm)

def clear_lights():
    for obj in list(bpy.data.objects):
        if obj.type == 'LIGHT':
            bpy.data.objects.remove(obj, do_unlink=True)

def setup_lighting_mode(mode="noon"):
    clear_lights()
    scene = bpy.context.scene
    if not scene.world:
        scene.world = bpy.data.worlds.new("StudioWorld")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if not bg_node:
        bg_node = scene.world.node_tree.nodes.new(type='ShaderNodeBackground')
    
    if mode == "morning":
        bg_node.inputs["Color"].default_value = (0.98, 0.95, 0.90, 1.0)
        bg_node.inputs["Strength"].default_value = 0.8
        
        sun_data = bpy.data.lights.new(name="Sun_Morning", type='SUN')
        sun_data.energy = 4.8
        sun_data.color = (1.0, 0.85, 0.65)
        sun_obj = bpy.data.objects.new(name="Sun_Morning_Obj", object_data=sun_data)
        sun_obj.rotation_euler = (math.radians(28), math.radians(18), math.radians(-35))
        bpy.context.collection.objects.link(sun_obj)
        
        sky_data = bpy.data.lights.new(name="Sky_Morning_Fill", type='SUN')
        sky_data.energy = 1.8
        sky_data.color = (0.88, 0.93, 1.0)
        sky_obj = bpy.data.objects.new(name="Sky_Morning_Obj", object_data=sky_data)
        sky_obj.rotation_euler = (math.radians(85), 0, 0)
        bpy.context.collection.objects.link(sky_obj)

    elif mode == "noon":
        bg_node.inputs["Color"].default_value = (0.97, 0.97, 0.98, 1.0)
        bg_node.inputs["Strength"].default_value = 1.0
        
        sun_data = bpy.data.lights.new(name="Sun_Noon", type='SUN')
        sun_data.energy = 5.5
        sun_data.color = (1.0, 0.98, 0.96)
        sun_obj = bpy.data.objects.new(name="Sun_Noon_Obj", object_data=sun_data)
        sun_obj.rotation_euler = (math.radians(65), math.radians(20), math.radians(-50))
        bpy.context.collection.objects.link(sun_obj)
        
        sky_data = bpy.data.lights.new(name="Sky_Noon_Fill", type='SUN')
        sky_data.energy = 2.5
        sky_data.color = (0.92, 0.96, 1.0)
        sky_obj = bpy.data.objects.new(name="Sky_Noon_Obj", object_data=sky_data)
        sky_obj.rotation_euler = (math.radians(88), 0, 0)
        bpy.context.collection.objects.link(sky_obj)

    elif mode == "night":
        bg_node.inputs["Color"].default_value = (0.05, 0.07, 0.12, 1.0)
        bg_node.inputs["Strength"].default_value = 0.3
        
        moon_data = bpy.data.lights.new(name="Moon_Fill", type='SUN')
        moon_data.energy = 0.5
        moon_data.color = (0.45, 0.65, 0.95)
        moon_obj = bpy.data.objects.new(name="Moon_Obj", object_data=moon_data)
        moon_obj.rotation_euler = (math.radians(45), 0, math.radians(-30))
        bpy.context.collection.objects.link(moon_obj)

        spot_coords = [
            (0.6, -1.8, 3.8),   # Over Living Room Sofa & Rug
            (0.6, 0.6, 3.8),    # Over Kitchen Island & Dining
            (4.9, -1.8, 3.8),   # Over Master Bedroom Bed
            (-3.05, -2.0, 3.8), # Over Bed 2 Study
            (-5.5, -2.0, 3.8),  # Over Bed 3
            (-5.5, 2.8, 3.8),   # Over Foyer
        ]
        for idx, (sx, sy, sz) in enumerate(spot_coords):
            spot_data = bpy.data.lights.new(name=f"Spot_{idx}", type='SPOT')
            spot_data.energy = 220.0
            spot_data.spot_size = math.radians(55)
            spot_data.spot_blend = 0.35
            spot_data.color = (1.0, 0.88, 0.65)
            spot_obj = bpy.data.objects.new(name=f"SpotObj_{idx}", object_data=spot_data)
            spot_obj.location = (sx, sy, sz)
            bpy.context.collection.objects.link(spot_obj)

def render_wirye_views(output_dir):
    scene = bpy.context.scene
    scene.render.resolution_x = 2048
    scene.render.resolution_y = 2048
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'

    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except:
        scene.render.engine = 'BLENDER_EEVEE'

    # Camera setup (3D Isometric cutaway view)
    cam_data = bpy.data.cameras.new(name="Cam_ISO")
    cam_data.lens = 45
    cam_obj = bpy.data.objects.new(name="Cam_ISO_Obj", object_data=cam_data)
    cam_obj.location = (14.5, -16.0, 14.2)
    cam_obj.rotation_euler = (math.radians(54), 0, math.radians(42))
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # 1. Noon Render
    setup_lighting_mode("noon")
    filepath_noon = os.path.join(output_dir, "wirye_37py_noon.png")
    scene.render.filepath = filepath_noon
    print(f"Rendering Noon -> {filepath_noon}")
    bpy.ops.render.render(write_still=True)

    # 2. Morning Render
    setup_lighting_mode("morning")
    filepath_morning = os.path.join(output_dir, "wirye_37py_morning.png")
    scene.render.filepath = filepath_morning
    print(f"Rendering Morning -> {filepath_morning}")
    bpy.ops.render.render(write_still=True)

    # 3. Night Render
    setup_lighting_mode("night")
    filepath_night = os.path.join(output_dir, "wirye_37py_night.png")
    scene.render.filepath = filepath_night
    print(f"Rendering Night -> {filepath_night}")
    bpy.ops.render.render(write_still=True)

    # 4. 2D Top-Down Floorplan Render
    setup_lighting_mode("noon")
    cam_top_data = bpy.data.cameras.new(name="Cam_TOP")
    cam_top_data.type = 'ORTHO'
    cam_top_data.ortho_scale = 15.0
    cam_top_obj = bpy.data.objects.new(name="Cam_TOP_Obj", object_data=cam_top_data)
    cam_top_obj.location = (0.0, 0.0, 20.0)
    cam_top_obj.rotation_euler = (0, 0, 0)
    scene.collection.objects.link(cam_top_obj)
    scene.camera = cam_top_obj

    top_filepath = os.path.join(output_dir, "wirye_37py_floorplan.png")
    scene.render.filepath = top_filepath
    print(f"Rendering Floorplan -> {top_filepath}")
    bpy.ops.render.render(write_still=True)

    # Export 3D assets
    blend_path = os.path.join(output_dir, "wirye_37py.blend")
    glb_path = os.path.join(output_dir, "wirye_37py.glb")
    fbx_path = os.path.join(output_dir, "wirye_37py.fbx")

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB', use_selection=False, export_materials='EXPORT', export_apply=True)
    bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False, apply_unit_scale=True, apply_scale_options='FBX_SCALE_ALL')
    print("Wirye Central Prugio 37py 3D architecture complete!")

if __name__ == "__main__":
    out_dir = r"C:\Users\황태민\Documents\antigravity\lively-darwin"
    reset_scene()
    build_wirye_37py_scene()
    render_wirye_views(out_dir)
