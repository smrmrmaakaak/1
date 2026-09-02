import bpy
import math
import os

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.scenes:
        bpy.data.scenes.new(name="Scene")
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.length_unit = 'METERS'
    return scene

def add_bevel(obj, width=0.015, segments=3):
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

def create_procedural_wood(name, base_col=(0.52, 0.32, 0.18, 1.0), roughness=0.35):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    tex_coord = nodes.new(type='ShaderNodeTexCoord')
    mapping = nodes.new(type='ShaderNodeMapping')
    mapping.inputs['Scale'].default_value = (0.5, 4.0, 0.5)
    
    noise = nodes.new(type='ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 10.0
    noise.inputs['Detail'].default_value = 6.0
    noise.inputs['Roughness'].default_value = 0.55
    
    color_ramp = nodes.new(type='ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.2
    color_ramp.color_ramp.elements[0].color = (base_col[0]*0.7, base_col[1]*0.7, base_col[2]*0.7, 1.0)
    color_ramp.color_ramp.elements[1].position = 0.8
    color_ramp.color_ramp.elements[1].color = base_col
    
    bump = nodes.new(type='ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.03
    
    links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], noise.inputs['Vector'])
    links.new(noise.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], node_bsdf.inputs['Base Color'])
    links.new(noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], node_bsdf.inputs['Normal'])
    node_bsdf.inputs['Roughness'].default_value = roughness
    
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def build_high_detail_salondeju():
    # Photorealistic PBR Materials
    mat_floor = create_pbr_mat("Floor_LinenWood", color=(0.92, 0.90, 0.86, 1.0), roughness=0.45)
    mat_floor_skirt = create_pbr_mat("Floor_Skirting", color=(0.35, 0.32, 0.28, 1.0), roughness=0.4)
    mat_white = create_pbr_mat("Kiosk_SilkWhite", color=(0.98, 0.98, 0.97, 1.0), roughness=0.25)
    mat_black_logo = create_pbr_mat("Logo_BlackAnodized", color=(0.04, 0.04, 0.05, 1.0), roughness=0.3, metallic=0.7)
    mat_walnut = create_procedural_wood("Plinth_WarmWalnut", base_col=(0.48, 0.27, 0.14, 1.0), roughness=0.3)
    mat_light_oak = create_procedural_wood("Shelf_NaturalOak", base_col=(0.78, 0.58, 0.38, 1.0), roughness=0.38)
    mat_glass = create_pbr_mat("Glass_TemperedCrystal", color=(0.96, 0.99, 1.0, 1.0), roughness=0.01, transmission=0.96, ior=1.52, alpha=0.15)
    mat_metal_black = create_pbr_mat("Metal_MatteBlack", color=(0.08, 0.08, 0.09, 1.0), roughness=0.35, metallic=0.85)
    mat_gold_brass = create_pbr_mat("Metal_BrushedGold", color=(0.92, 0.76, 0.42, 1.0), roughness=0.22, metallic=0.95)
    mat_chrome = create_pbr_mat("Metal_PolishedChrome", color=(0.92, 0.92, 0.94, 1.0), roughness=0.12, metallic=0.98)
    mat_wall = create_pbr_mat("Wall_ArchitecturalCream", color=(0.94, 0.92, 0.88, 1.0), roughness=0.65)
    mat_led_warm = create_pbr_mat("LED_2700KWarm", color=(1.0, 0.88, 0.65, 1.0), emission_col=(1.0, 0.86, 0.60, 1.0), emission_str=15.0)
    mat_velvet_tray = create_pbr_mat("Jewelry_VelvetGrey", color=(0.28, 0.30, 0.32, 1.0), roughness=0.9)
    mat_leather_bag = create_pbr_mat("Decor_CognacLeather", color=(0.62, 0.32, 0.15, 1.0), roughness=0.35)

    # 1. Main Base Platform (7.2m x 5.2m x 0.15m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.075))
    floor = bpy.context.active_object
    floor.name = "Floor_Platform"
    floor.scale = (7.2, 5.2, 0.15)
    floor.data.materials.append(mat_floor)
    add_bevel(floor, 0.02, 3)

    # Base Skirting Shadow Gap (Architectural Detail)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.015))
    skirt = bpy.context.active_object
    skirt.name = "Floor_Shadow_Gap"
    skirt.scale = (7.3, 5.3, 0.03)
    skirt.data.materials.append(mat_floor_skirt)

    # 2. Central Kiosk Tower & SALONDEJU Counter (X=0.3, Y=1.3)
    # Cylindrical Main Column
    bpy.ops.mesh.primitive_cylinder_add(radius=0.72, depth=3.0, location=(0.3, 1.3, 1.5 + 0.15), vertices=64)
    tower = bpy.context.active_object
    tower.name = "Central_Kiosk_Tower"
    tower.data.materials.append(mat_white)
    add_bevel(tower, 0.01, 2)

    # Fluted Oak Slats on Upper Kiosk Column (High Detail)
    num_kiosk_slats = 40
    for i in range(num_kiosk_slats):
        angle = (i / num_kiosk_slats) * math.pi * 2
        sx = 0.3 + math.cos(angle) * 0.725
        sy = 1.3 + math.sin(angle) * 0.725
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=1.4, location=(sx, sy, 1.8 + 0.15), vertices=12)
        slat = bpy.context.active_object
        slat.name = f"KioskSlat_{i}"
        slat.data.materials.append(mat_light_oak)

    # Top Fascia Header Ring
    bpy.ops.mesh.primitive_cylinder_add(radius=0.76, depth=0.45, location=(0.3, 1.3, 2.75 + 0.15), vertices=64)
    fascia = bpy.context.active_object
    fascia.name = "Header_Fascia"
    fascia.data.materials.append(mat_white)
    add_bevel(fascia, 0.01, 2)

    # LED Halo Strip under Header
    bpy.ops.mesh.primitive_torus_add(major_radius=0.75, minor_radius=0.015, location=(0.3, 1.3, 2.5 + 0.15))
    led_halo = bpy.context.active_object
    led_halo.name = "LED_Header_Halo"
    led_halo.data.materials.append(mat_led_warm)

    # "SALONDEJU" 3D Precision Text
    bpy.ops.object.text_add(location=(-0.25, 0.52, 2.65 + 0.15), rotation=(math.radians(90), 0, 0))
    txt = bpy.context.active_object
    txt.name = "Text_SALONDEJU"
    txt.data.body = "SALONDEJU"
    txt.data.size = 0.14
    txt.data.extrude = 0.025
    txt.data.bevel_depth = 0.003
    txt.data.materials.append(mat_black_logo)

    # Half-Cylinder Reception Counter
    bpy.ops.mesh.primitive_cylinder_add(radius=0.65, depth=0.95, location=(0.3, 0.65, 0.475 + 0.15), vertices=64)
    cnt = bpy.context.active_object
    cnt.name = "Counter_Body"
    cnt.data.materials.append(mat_white)
    add_bevel(cnt, 0.015, 3)

    # Counter Solid Walnut Top Slab
    bpy.ops.mesh.primitive_cylinder_add(radius=0.68, depth=0.045, location=(0.3, 0.65, 0.95 + 0.15), vertices=64)
    cnt_top = bpy.context.active_object
    cnt_top.name = "Counter_Top"
    cnt_top.data.materials.append(mat_walnut)
    add_bevel(cnt_top, 0.008, 2)

    # Counter Toe-Kick LED Glow Strip
    bpy.ops.mesh.primitive_torus_add(major_radius=0.64, minor_radius=0.012, location=(0.3, 0.65, 0.03 + 0.15))
    cnt_led = bpy.context.active_object
    cnt_led.name = "Counter_ToeKick_LED"
    cnt_led.data.materials.append(mat_led_warm)

    # Back Walls
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.8, 1.7, 1.35 + 0.15))
    bw_l = bpy.context.active_object
    bw_l.name = "BackWall_L"
    bw_l.scale = (1.4, 0.12, 2.7)
    bw_l.data.materials.append(mat_wall)
    add_bevel(bw_l, 0.01, 2)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.35, 1.7, 1.35 + 0.15))
    bw_r = bpy.context.active_object
    bw_r.name = "BackWall_R"
    bw_r.scale = (1.3, 0.12, 2.7)
    bw_r.data.materials.append(mat_wall)
    add_bevel(bw_r, 0.01, 2)

    # Tall Back Storage Block (X=2.0, Y=1.7)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(2.0, 1.7, 1.35 + 0.15))
    box = bpy.context.active_object
    box.name = "Storage_Block"
    box.scale = (0.7, 0.75, 2.7)
    box.data.materials.append(mat_white)
    add_bevel(box, 0.015, 2)

    # 3. Black Wire Shelf Stand (X=1.0, Y=0.7)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.0, 0.7, 0.6 + 0.15))
    wire = bpy.context.active_object
    wire.name = "Black_Wire_Rack"
    wire.scale = (0.35, 0.35, 1.2)
    wire.data.materials.append(mat_metal_black)
    add_bevel(wire, 0.01, 2)

    # 4. Left Zone: 3-Bay Open Shelves & Showcase Vitrine
    # Vitrine Base + Glass Hood (X=-2.6, Y=-0.7)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.6, -0.7, 0.2 + 0.15))
    v_base = bpy.context.active_object
    v_base.name = "Vitrine_Base"
    v_base.scale = (1.3, 0.6, 0.4)
    v_base.data.materials.append(mat_walnut)
    add_bevel(v_base, 0.015, 3)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.6, -0.7, 0.75 + 0.15))
    v_glass = bpy.context.active_object
    v_glass.name = "Vitrine_Glass"
    v_glass.scale = (1.28, 0.58, 0.7)
    v_glass.data.materials.append(mat_glass)
    add_bevel(v_glass, 0.008, 2)

    # Interior Jewelry Velvet Tray inside Glass Case
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.6, -0.7, 0.42 + 0.15))
    v_tray = bpy.context.active_object
    v_tray.name = "Vitrine_Velvet_Tray"
    v_tray.scale = (1.1, 0.45, 0.04)
    v_tray.data.materials.append(mat_velvet_tray)
    add_bevel(v_tray, 0.005, 2)

    # 3-Bay Wall Shelving Unit (Back Left: X=-2.1, Y=1.0)
    for b in range(4):
        ux = -2.85 + b * 0.7
        bpy.ops.mesh.primitive_cube_add(size=1, location=(ux, 1.0, 0.85 + 0.15))
        upright = bpy.context.active_object
        upright.name = f"Upright_{b}"
        upright.scale = (0.04, 0.4, 1.7)
        upright.data.materials.append(mat_light_oak)
        add_bevel(upright, 0.006, 2)

    for h_idx in range(4):
        hz = 0.1 + h_idx * 0.5
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.8, 1.0, hz + 0.15))
        board = bpy.context.active_object
        board.name = f"ShelfBoard_{h_idx}"
        board.scale = (2.1, 0.4, 0.035)
        board.data.materials.append(mat_light_oak)
        add_bevel(board, 0.006, 2)

        # Micro LED under shelf boards
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.8, 0.98, hz + 0.13))
        sled = bpy.context.active_object
        sled.name = f"ShelfLED_{h_idx}"
        sled.scale = (2.05, 0.015, 0.01)
        sled.data.materials.append(mat_led_warm)

        # Display Luxury Handbag on 2nd and 3rd shelves
        if h_idx in [1, 2]:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.2 + h_idx*0.4, 1.0, hz + 0.28))
            bag = bpy.context.active_object
            bag.name = f"Handbag_Decor_{h_idx}"
            bag.scale = (0.22, 0.14, 0.2)
            bag.data.materials.append(mat_leather_bag)
            add_bevel(bag, 0.03, 3)

    # Low Wooden Storage Chest (X=-1.4, Y=1.6)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.4, 1.6, 0.3 + 0.15))
    chest = bpy.context.active_object
    chest.name = "Low_Chest"
    chest.scale = (0.8, 0.45, 0.6)
    chest.data.materials.append(mat_walnut)
    add_bevel(chest, 0.015, 2)

    # Low Round Display Drum (X=-1.4, Y=0.45)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.35, location=(-1.4, 0.45, 0.175 + 0.15), vertices=48)
    drum = bpy.context.active_object
    drum.name = "Round_Drum"
    drum.data.materials.append(mat_walnut)
    add_bevel(drum, 0.015, 3)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.44, depth=0.04, location=(-1.4, 0.45, 0.33 + 0.15), vertices=48)
    drum_rim = bpy.context.active_object
    drum_rim.name = "Drum_BlackRim"
    drum_rim.data.materials.append(mat_metal_black)

    # 5. Center-Front Display Plinths (Walnut Tables)
    # Main Big Square Plinth (X=-0.2, Y=-0.5)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.2, -0.5, 0.175 + 0.15))
    p1 = bpy.context.active_object
    p1.name = "Main_Square_Plinth"
    p1.scale = (1.6, 1.6, 0.35)
    p1.data.materials.append(mat_walnut)
    add_bevel(p1, 0.02, 3)

    # Sub Square Plinth (X=0.9, Y=-1.3)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.9, -1.3, 0.13 + 0.15))
    p2 = bpy.context.active_object
    p2.name = "Sub_Square_Plinth"
    p2.scale = (1.3, 1.3, 0.26)
    p2.data.materials.append(mat_walnut)
    add_bevel(p2, 0.02, 3)

    # 6. Right Zone (3 Garment Poles + 2-Tier Shelf + Side Cabinet)
    for idx, px in enumerate([1.7, 2.0, 2.3]):
        py = -0.55 - idx * 0.28
        # Chrome Disc Base
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=0.02, location=(px, py, 0.01 + 0.15), vertices=32)
        disc = bpy.context.active_object
        disc.name = f"PoleDisc_{idx}"
        disc.data.materials.append(mat_chrome)

        # Walnut Pole
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=1.65, location=(px, py, 0.825 + 0.15), vertices=32)
        pole = bpy.context.active_object
        pole.name = f"WoodPole_{idx}"
        pole.data.materials.append(mat_walnut)
        add_bevel(pole, 0.005, 2)

        # Top Gold Brass Hook Collar
        bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.05, location=(px, py, 1.45 + 0.15), vertices=24)
        collar = bpy.context.active_object
        collar.name = f"PoleCollar_{idx}"
        collar.data.materials.append(mat_gold_brass)

    # Right Back 2-Tier Shelf (X=2.4, Y=1.0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(2.4, 1.0, 0.45 + 0.15))
    r_shelf = bpy.context.active_object
    r_shelf.name = "Right_2Tier_Shelf"
    r_shelf.scale = (1.5, 0.45, 0.9)
    r_shelf.data.materials.append(mat_walnut)
    add_bevel(r_shelf, 0.015, 3)

    # Right Side Cabinet (X=2.65, Y=0.15)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(2.65, 0.15, 0.35 + 0.15))
    r_cab = bpy.context.active_object
    r_cab.name = "Right_Side_Cabinet"
    r_cab.scale = (0.55, 0.55, 0.7)
    r_cab.data.materials.append(mat_walnut)
    add_bevel(r_cab, 0.015, 3)

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
        bg_node.inputs["Color"].default_value = (0.98, 0.94, 0.88, 1.0)
        bg_node.inputs["Strength"].default_value = 0.8
        
        sun_data = bpy.data.lights.new(name="Sun_Morning", type='SUN')
        sun_data.energy = 4.5
        sun_data.color = (1.0, 0.82, 0.62)
        sun_data.angle = math.radians(2.0)
        sun_obj = bpy.data.objects.new(name="Sun_Morning_Obj", object_data=sun_data)
        sun_obj.rotation_euler = (math.radians(24), math.radians(18), math.radians(-35))
        bpy.context.collection.objects.link(sun_obj)
        
        sky_data = bpy.data.lights.new(name="Sky_Morning_Fill", type='SUN')
        sky_data.energy = 1.5
        sky_data.color = (0.85, 0.92, 1.0)
        sky_obj = bpy.data.objects.new(name="Sky_Morning_Obj", object_data=sky_data)
        sky_obj.rotation_euler = (math.radians(85), 0, 0)
        bpy.context.collection.objects.link(sky_obj)

    elif mode == "noon":
        bg_node.inputs["Color"].default_value = (0.97, 0.97, 0.98, 1.0)
        bg_node.inputs["Strength"].default_value = 1.0
        
        sun_data = bpy.data.lights.new(name="Sun_Noon", type='SUN')
        sun_data.energy = 5.0
        sun_data.color = (1.0, 0.98, 0.96)
        sun_data.angle = math.radians(1.0)
        sun_obj = bpy.data.objects.new(name="Sun_Noon_Obj", object_data=sun_data)
        sun_obj.rotation_euler = (math.radians(65), math.radians(20), math.radians(-50))
        bpy.context.collection.objects.link(sun_obj)
        
        sky_data = bpy.data.lights.new(name="Sky_Noon_Fill", type='SUN')
        sky_data.energy = 2.2
        sky_data.color = (0.92, 0.96, 1.0)
        sky_obj = bpy.data.objects.new(name="Sky_Noon_Obj", object_data=sky_data)
        sky_obj.rotation_euler = (math.radians(88), 0, 0)
        bpy.context.collection.objects.link(sky_obj)

    elif mode == "night":
        bg_node.inputs["Color"].default_value = (0.05, 0.07, 0.12, 1.0)
        bg_node.inputs["Strength"].default_value = 0.3
        
        moon_data = bpy.data.lights.new(name="Moon_Fill", type='SUN')
        moon_data.energy = 0.4
        moon_data.color = (0.4, 0.6, 0.9)
        moon_obj = bpy.data.objects.new(name="Moon_Obj", object_data=moon_data)
        moon_obj.rotation_euler = (math.radians(45), 0, math.radians(-30))
        bpy.context.collection.objects.link(moon_obj)

        spot_coords = [
            (0.3, 0.8, 3.2),   # Over Counter
            (-2.0, -0.6, 3.2), # Over Showcase & Drum
            (-0.2, -0.5, 3.2), # Over Main Plinth
            (0.9, -1.3, 3.2),  # Over Sub Plinth
            (2.0, -0.6, 3.2),  # Over Garment Poles
        ]
        for idx, (sx, sy, sz) in enumerate(spot_coords):
            spot_data = bpy.data.lights.new(name=f"Spot_{idx}", type='SPOT')
            spot_data.energy = 180.0
            spot_data.spot_size = math.radians(52)
            spot_data.spot_blend = 0.35
            spot_data.color = (1.0, 0.88, 0.65)
            spot_obj = bpy.data.objects.new(name=f"SpotObj_{idx}", object_data=spot_data)
            spot_obj.location = (sx, sy, sz)
            bpy.context.collection.objects.link(spot_obj)

def render_all_lighting_modes(output_dir):
    scene = bpy.context.scene
    scene.render.resolution_x = 2048
    scene.render.resolution_y = 2048
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'

    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except:
        scene.render.engine = 'BLENDER_EEVEE'

    # Camera setup (Isometric 3/4 beauty angle)
    cam_data = bpy.data.cameras.new(name="Cam_ISO")
    cam_data.lens = 46
    cam_obj = bpy.data.objects.new(name="Cam_ISO_Obj", object_data=cam_data)
    cam_obj.location = (8.6, -9.6, 8.0)
    cam_obj.rotation_euler = (math.radians(56), 0, math.radians(42))
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    modes = [
        ("morning", "salondeju_render_morning.png"),
        ("noon", "salondeju_render_noon.png"),
        ("night", "salondeju_render_night.png")
    ]

    for mode_name, filename in modes:
        print(f"Setting up lighting: {mode_name}...")
        setup_lighting_mode(mode_name)
        filepath = os.path.join(output_dir, filename)
        scene.render.filepath = filepath
        print(f"Rendering {mode_name} -> {filepath}")
        bpy.ops.render.render(write_still=True)

    # Render HD Top-Down 2D CAD Floorplan (Noon lighting)
    setup_lighting_mode("noon")
    cam_top_data = bpy.data.cameras.new(name="Cam_TOP")
    cam_top_data.type = 'ORTHO'
    cam_top_data.ortho_scale = 7.6
    cam_top_obj = bpy.data.objects.new(name="Cam_TOP_Obj", object_data=cam_top_data)
    cam_top_obj.location = (0.0, 0.0, 12.0)
    cam_top_obj.rotation_euler = (0, 0, 0)
    scene.collection.objects.link(cam_top_obj)
    scene.camera = cam_top_obj

    top_filepath = os.path.join(output_dir, "salondeju_floorplan_hd.png")
    scene.render.filepath = top_filepath
    print(f"Rendering Floorplan HD -> {top_filepath}")
    bpy.ops.render.render(write_still=True)

    # Export high-detail models
    blend_path = os.path.join(output_dir, "salondeju_booth_exact.blend")
    glb_path = os.path.join(output_dir, "salondeju_booth_exact.glb")
    fbx_path = os.path.join(output_dir, "salondeju_booth_exact.fbx")

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB', use_selection=False, export_materials='EXPORT', export_apply=True)
    bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False, apply_unit_scale=True, apply_scale_options='FBX_SCALE_ALL')
    print("All lighting renders and exports successfully completed!")

if __name__ == "__main__":
    out_dir = r"C:\Users\황태민\Documents\antigravity\lively-darwin"
    reset_scene()
    build_high_detail_salondeju()
    render_all_lighting_modes(out_dir)
