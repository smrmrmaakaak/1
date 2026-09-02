import bpy
import math
import os
from mathutils import Vector, Euler

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.scenes:
        bpy.data.scenes.new(name="Scene")
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.length_unit = 'METERS'
    return scene

def add_bevel_subsurf(obj, bevel_width=0.03, segments=3):
    bev = obj.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = bevel_width
    bev.segments = segments
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35)
    
    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True

def create_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), roughness=0.5, metallic=0.0, 
                        emission_color=(0,0,0,1), emission_strength=0.0, transmission_weight=0.0, ior=1.45, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    if "Base Color" in node_bsdf.inputs:
        node_bsdf.inputs["Base Color"].default_value = base_color
    if "Roughness" in node_bsdf.inputs:
        node_bsdf.inputs["Roughness"].default_value = roughness
    if "Metallic" in node_bsdf.inputs:
        node_bsdf.inputs["Metallic"].default_value = metallic
    if "IOR" in node_bsdf.inputs:
        node_bsdf.inputs["IOR"].default_value = ior
    if "Alpha" in node_bsdf.inputs:
        node_bsdf.inputs["Alpha"].default_value = alpha
    if "Emission Color" in node_bsdf.inputs:
        node_bsdf.inputs["Emission Color"].default_value = emission_color
    if "Emission Strength" in node_bsdf.inputs:
        node_bsdf.inputs["Emission Strength"].default_value = emission_strength
    if "Transmission Weight" in node_bsdf.inputs:
        node_bsdf.inputs["Transmission Weight"].default_value = transmission_weight
    elif "Transmission" in node_bsdf.inputs:
        node_bsdf.inputs["Transmission"].default_value = transmission_weight
        
    links.new(node_bsdf.outputs["BSDF"], node_out.inputs["Surface"])
    return mat

def create_procedural_marble_material(name="CalacattaMarble"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    tex_coord = nodes.new(type='ShaderNodeTexCoord')
    noise1 = nodes.new(type='ShaderNodeTexNoise')
    noise1.inputs['Scale'].default_value = 2.5
    noise1.inputs['Detail'].default_value = 8.0
    noise1.inputs['Roughness'].default_value = 0.55
    
    noise2 = nodes.new(type='ShaderNodeTexNoise')
    noise2.inputs['Scale'].default_value = 8.0
    noise2.inputs['Detail'].default_value = 4.0
    
    color_ramp = nodes.new(type='ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.38
    color_ramp.color_ramp.elements[0].color = (0.15, 0.08, 0.12, 1.0) # Viola dark burgundy vein
    color_ramp.color_ramp.elements[1].position = 0.62
    color_ramp.color_ramp.elements[1].color = (0.96, 0.95, 0.93, 1.0) # White calacatta base
    
    bump = nodes.new(type='ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.04
    
    links.new(tex_coord.outputs['Object'], noise1.inputs['Vector'])
    links.new(noise1.outputs['Color'], noise2.inputs['Vector'])
    links.new(noise2.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], node_bsdf.inputs['Base Color'])
    node_bsdf.inputs['Roughness'].default_value = 0.18
    
    links.new(noise2.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], node_bsdf.inputs['Normal'])
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def create_wood_material(name="NaturalWarmOak"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    tex_coord = nodes.new(type='ShaderNodeTexCoord')
    mapping = nodes.new(type='ShaderNodeMapping')
    mapping.inputs['Scale'].default_value = (0.2, 3.5, 0.2)
    
    noise = nodes.new(type='ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 12.0
    noise.inputs['Detail'].default_value = 6.0
    
    color_ramp = nodes.new(type='ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.25
    color_ramp.color_ramp.elements[0].color = (0.52, 0.35, 0.18, 1.0)
    color_ramp.color_ramp.elements[1].position = 0.75
    color_ramp.color_ramp.elements[1].color = (0.75, 0.58, 0.38, 1.0)
    
    links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], noise.inputs['Vector'])
    links.new(noise.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], node_bsdf.inputs['Base Color'])
    node_bsdf.inputs['Roughness'].default_value = 0.35
    
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def build_scene():
    # Materials
    mat_floor = create_pbr_material("ConcretePolishedFloor", base_color=(0.42, 0.40, 0.38, 1.0), roughness=0.28)
    mat_ceiling = create_pbr_material("ConcreteCeiling", base_color=(0.55, 0.53, 0.50, 1.0), roughness=0.7)
    mat_wall = create_pbr_material("DrywallWarm", base_color=(0.95, 0.93, 0.90, 1.0), roughness=0.6)
    mat_slats = create_wood_material("OakSlats")
    mat_dark_wood = create_pbr_material("DarkWalnut", base_color=(0.18, 0.12, 0.08, 1.0), roughness=0.35)
    mat_led = create_pbr_material("WarmLEDCove", base_color=(1.0, 0.9, 0.7, 1.0), emission_color=(1.0, 0.82, 0.52, 1.0), emission_strength=25.0)
    mat_glass = create_pbr_material("GlassClear", base_color=(0.95, 0.98, 1.0, 1.0), roughness=0.01, transmission_weight=0.96, ior=1.52, alpha=0.15)
    mat_frame = create_pbr_material("MatteBlackSteel", base_color=(0.06, 0.06, 0.07, 1.0), roughness=0.25, metallic=0.9)
    mat_boucle = create_pbr_material("IvoryBoucle", base_color=(0.95, 0.93, 0.88, 1.0), roughness=0.8)
    mat_pillow = create_pbr_material("WarmLinenPillow", base_color=(0.78, 0.68, 0.56, 1.0), roughness=0.7)
    mat_rug = create_pbr_material("JuteWoolRug", base_color=(0.82, 0.77, 0.70, 1.0), roughness=0.92)
    mat_marble = create_procedural_marble_material("CalacattaViolaMarble")
    mat_brass = create_pbr_material("BrushedBrass", base_color=(0.92, 0.75, 0.42, 1.0), roughness=0.22, metallic=0.95)
    mat_plant = create_pbr_material("FicusLeaf", base_color=(0.12, 0.35, 0.14, 1.0), roughness=0.3)
    mat_pot = create_pbr_material("TerracottaCeramic", base_color=(0.72, 0.42, 0.28, 1.0), roughness=0.55)
    mat_sunset_sky = create_pbr_material("SunsetSkyBackdrop", base_color=(1.0, 0.7, 0.5, 1.0), emission_color=(1.0, 0.75, 0.55, 1.0), emission_strength=4.5)

    # 1. Floor
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.05))
    floor = bpy.context.active_object
    floor.name = "Floor"
    floor.scale = (9.5, 11.5, 0.1)
    floor.data.materials.append(mat_floor)

    # 2. Ceiling
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 3.25))
    ceiling = bpy.context.active_object
    ceiling.name = "Ceiling_Concrete"
    ceiling.scale = (9.5, 11.5, 0.1)
    ceiling.data.materials.append(mat_ceiling)

    # Drop Ceiling Soffit on Left
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.4, 0, 3.05))
    soffit = bpy.context.active_object
    soffit.name = "Soffit_DropCeiling"
    soffit.scale = (4.2, 11.2, 0.3)
    soffit.data.materials.append(mat_wall)
    add_bevel_subsurf(soffit, 0.02, 2)

    # Linear LED Strip along Soffit edge
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.25, 0, 2.92))
    led_soffit = bpy.context.active_object
    led_soffit.name = "LED_Soffit_Light"
    led_soffit.scale = (0.04, 10.8, 0.04)
    led_soffit.data.materials.append(mat_led)

    # 3. Fluted Acoustic Wood Slat Wall (Left side)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.55, -0.6, 1.5))
    wall_left = bpy.context.active_object
    wall_left.name = "Wall_Left_Back"
    wall_left.scale = (0.1, 7.2, 3.0)
    wall_left.data.materials.append(mat_dark_wood)

    # Vertical Wood Slats
    num_slats = 65
    spacing = 7.0 / num_slats
    for i in range(num_slats):
        y_pos = -4.0 + (i * spacing)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.48, y_pos, 1.5))
        slat = bpy.context.active_object
        slat.name = f"Slat_{i:02d}"
        slat.scale = (0.04, 0.05, 3.0)
        slat.data.materials.append(mat_slats)
        add_bevel_subsurf(slat, 0.008, 2)

    # Linear LED Light Along Bottom/Top of Slat Wall
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.42, -0.6, 0.05))
    led_wall_bottom = bpy.context.active_object
    led_wall_bottom.name = "LED_Wall_Bottom"
    led_wall_bottom.scale = (0.04, 7.0, 0.04)
    led_wall_bottom.data.materials.append(mat_led)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.42, -0.6, 2.92))
    led_wall_top = bpy.context.active_object
    led_wall_top.name = "LED_Wall_Top"
    led_wall_top.scale = (0.04, 7.0, 0.04)
    led_wall_top.data.materials.append(mat_led)

    # 4. Built-in Backlit Bookcase Niche (Left Back)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.4, 3.8, 1.5))
    niche = bpy.context.active_object
    niche.name = "Bookcase_Niche"
    niche.scale = (0.4, 2.2, 3.0)
    niche.data.materials.append(mat_dark_wood)

    for s_idx in range(4):
        s_z = 0.6 + s_idx * 0.7
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.25, 3.8, s_z))
        shelf = bpy.context.active_object
        shelf.name = f"Shelf_{s_idx}"
        shelf.scale = (0.45, 2.1, 0.06)
        shelf.data.materials.append(mat_dark_wood)
        add_bevel_subsurf(shelf, 0.01, 2)

        # LED under each shelf
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.4, 3.8, s_z + 0.03))
        sled = bpy.context.active_object
        sled.name = f"ShelfLED_{s_idx}"
        sled.scale = (0.03, 2.0, 0.02)
        sled.data.materials.append(mat_led)

        # Ceramics / Decor
        bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=0.22, location=(-4.25, 3.3 + s_idx*0.35, s_z + 0.14))
        vase = bpy.context.active_object
        vase.name = f"Decor_Vase_{s_idx}"
        vase.data.materials.append(mat_pot)
        add_bevel_subsurf(vase, 0.02, 2)

    # 5. Panoramic Floor-to-Ceiling Windows & Sunset Backdrop
    # Glass Right
    bpy.ops.mesh.primitive_cube_add(size=1, location=(4.6, 0, 1.55))
    glass_r = bpy.context.active_object
    glass_r.name = "Glass_Right"
    glass_r.scale = (0.05, 11.2, 3.0)
    glass_r.data.materials.append(mat_glass)

    for f_idx in range(6):
        f_y = -5.0 + f_idx * 2.0
        bpy.ops.mesh.primitive_cube_add(size=1, location=(4.58, f_y, 1.55))
        mullion = bpy.context.active_object
        mullion.name = f"Mullion_R_{f_idx}"
        mullion.scale = (0.12, 0.08, 3.1)
        mullion.data.materials.append(mat_frame)
        add_bevel_subsurf(mullion, 0.01, 2)

    # Glass Front (South facing)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -5.6, 1.55))
    glass_f = bpy.context.active_object
    glass_f.name = "Glass_Front"
    glass_f.scale = (9.2, 0.05, 3.0)
    glass_f.data.materials.append(mat_glass)

    for f_idx in range(5):
        f_x = -4.0 + f_idx * 2.0
        bpy.ops.mesh.primitive_cube_add(size=1, location=(f_x, -5.58, 1.55))
        mullion_f = bpy.context.active_object
        mullion_f.name = f"Mullion_F_{f_idx}"
        mullion_f.scale = (0.08, 0.12, 3.1)
        mullion_f.data.materials.append(mat_frame)
        add_bevel_subsurf(mullion_f, 0.01, 2)

    # Sunset Horizon Glow Backdrop Plane
    bpy.ops.mesh.primitive_cube_add(size=1, location=(12.0, -12.0, 3.0), rotation=(0, 0, math.radians(45)))
    sky_plane = bpy.context.active_object
    sky_plane.name = "Sky_Sunset_Backdrop"
    sky_plane.scale = (25.0, 0.1, 15.0)
    sky_plane.data.materials.append(mat_sunset_sky)

    # 6. Architectural Concrete Column (Corner positioned)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=3.1, location=(4.2, -5.2, 1.55), vertices=48)
    column = bpy.context.active_object
    column.name = "Column_Concrete"
    column.data.materials.append(mat_ceiling)
    add_bevel_subsurf(column, 0.02, 2)

    # 7. Area Rug
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.8, -0.6, 0.02))
    rug = bpy.context.active_object
    rug.name = "Area_Rug"
    rug.scale = (5.6, 4.6, 0.04)
    rug.data.materials.append(mat_rug)
    add_bevel_subsurf(rug, 0.03, 3)

    # 8. Luxury Curved Modular Boucle Sectional Sofa
    # Module 1 (Left Wing)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.4, 0.8, 0.28))
    m1_seat = bpy.context.active_object
    m1_seat.name = "Sofa_M1_Seat"
    m1_seat.scale = (1.5, 1.4, 0.48)
    m1_seat.data.materials.append(mat_boucle)
    add_bevel_subsurf(m1_seat, 0.14, 4)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.9, 0.8, 0.68))
    m1_back = bpy.context.active_object
    m1_back.name = "Sofa_M1_Back"
    m1_back.scale = (0.42, 1.4, 0.52)
    m1_back.data.materials.append(mat_boucle)
    add_bevel_subsurf(m1_back, 0.12, 4)

    # Module 2 (Curved Center)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.9, -0.7, 0.28), rotation=(0, 0, math.radians(-32)))
    m2_seat = bpy.context.active_object
    m2_seat.name = "Sofa_M2_Seat"
    m2_seat.scale = (1.5, 1.4, 0.48)
    m2_seat.data.materials.append(mat_boucle)
    add_bevel_subsurf(m2_seat, 0.14, 4)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.45, -0.85, 0.68), rotation=(0, 0, math.radians(-32)))
    m2_back = bpy.context.active_object
    m2_back.name = "Sofa_M2_Back"
    m2_back.scale = (0.42, 1.4, 0.52)
    m2_back.data.materials.append(mat_boucle)
    add_bevel_subsurf(m2_back, 0.12, 4)

    # Module 3 (Chaise / Lounger)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.5, -1.9, 0.28), rotation=(0, 0, math.radians(-68)))
    m3_seat = bpy.context.active_object
    m3_seat.name = "Sofa_M3_Seat"
    m3_seat.scale = (1.6, 1.4, 0.48)
    m3_seat.data.materials.append(mat_boucle)
    add_bevel_subsurf(m3_seat, 0.14, 4)

    # Throw Pillows
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.4, 1.0, 0.65), rotation=(math.radians(15), math.radians(10), math.radians(20)))
    p1 = bpy.context.active_object
    p1.name = "Pillow_1"
    p1.scale = (0.22, 0.48, 0.48)
    p1.data.materials.append(mat_pillow)
    add_bevel_subsurf(p1, 0.08, 3)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.0, -0.3, 0.65), rotation=(math.radians(10), math.radians(-12), math.radians(-25)))
    p2 = bpy.context.active_object
    p2.name = "Pillow_2"
    p2.scale = (0.22, 0.48, 0.48)
    p2.data.materials.append(mat_pillow)
    add_bevel_subsurf(p2, 0.08, 3)

    # Sphere pillow
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.19, location=(-1.3, -1.1, 0.6))
    p_sph = bpy.context.active_object
    p_sph.name = "Pillow_Sphere"
    p_sph.data.materials.append(mat_pillow)

    # 9. Sculptural Organic Calacatta Viola Marble Coffee Table
    bpy.ops.mesh.primitive_cylinder_add(radius=1.1, depth=0.1, location=(-0.3, 0.05, 0.38), vertices=48)
    c_top = bpy.context.active_object
    c_top.name = "CoffeeTable_Top"
    c_top.scale = (1.45, 0.9, 1.0)
    c_top.data.materials.append(mat_marble)
    add_bevel_subsurf(c_top, 0.04, 3)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.9, -0.05, 0.17), rotation=(0, 0, math.radians(25)))
    c_leg1 = bpy.context.active_object
    c_leg1.name = "CoffeeTable_Leg1"
    c_leg1.scale = (0.22, 0.65, 0.32)
    c_leg1.data.materials.append(mat_marble)
    add_bevel_subsurf(c_leg1, 0.04, 3)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.4, 0.15, 0.17), rotation=(0, 0, math.radians(-20)))
    c_leg2 = bpy.context.active_object
    c_leg2.name = "CoffeeTable_Leg2"
    c_leg2.scale = (0.22, 0.65, 0.32)
    c_leg2.data.materials.append(mat_marble)
    add_bevel_subsurf(c_leg2, 0.04, 3)

    # Books & Candle on Table
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.5, 0.12, 0.46))
    book = bpy.context.active_object
    book.name = "ArtBook"
    book.scale = (0.38, 0.28, 0.05)
    book.data.materials.append(mat_wall)
    add_bevel_subsurf(book, 0.01, 2)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.1, location=(0.2, -0.08, 0.48), vertices=24)
    candle = bpy.context.active_object
    candle.name = "Candle_Glass"
    candle.data.materials.append(mat_glass)

    # 10. Mid-Century Modern Wood Lounge Chair
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.4, -1.3, 0.36), rotation=(math.radians(12), 0, math.radians(-42)))
    chair_seat = bpy.context.active_object
    chair_seat.name = "LoungeChair_Seat"
    chair_seat.scale = (0.75, 0.75, 0.09)
    chair_seat.data.materials.append(mat_dark_wood)
    add_bevel_subsurf(chair_seat, 0.03, 3)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.75, -1.0, 0.68), rotation=(math.radians(26), 0, math.radians(-42)))
    chair_back = bpy.context.active_object
    chair_back.name = "LoungeChair_Back"
    chair_back.scale = (0.75, 0.09, 0.62)
    chair_back.data.materials.append(mat_dark_wood)
    add_bevel_subsurf(chair_back, 0.03, 3)

    # Throw blanket on chair
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.78, -0.96, 0.71), rotation=(math.radians(26), 0, math.radians(-42)))
    chair_throw = bpy.context.active_object
    chair_throw.name = "LoungeChair_Throw"
    chair_throw.scale = (0.48, 0.12, 0.48)
    chair_throw.data.materials.append(mat_boucle)
    add_bevel_subsurf(chair_throw, 0.04, 3)

    # 11. Potted Fiddle-Leaf Fig Tree
    bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=0.7, location=(3.0, -3.2, 0.35), vertices=36)
    pot = bpy.context.active_object
    pot.name = "Plant_Pot"
    pot.data.materials.append(mat_pot)
    add_bevel_subsurf(pot, 0.03, 3)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=1.9, location=(3.0, -3.2, 1.45), vertices=20)
    trunk = bpy.context.active_object
    trunk.name = "Plant_Trunk"
    trunk.data.materials.append(mat_dark_wood)

    leaf_coords = [
        (3.0, -3.2, 2.4, 0.55, 0.38),
        (2.8, -3.0, 2.15, 0.50, 0.35),
        (3.2, -3.3, 2.05, 0.52, 0.36),
        (2.85, -3.45, 1.85, 0.48, 0.32),
        (3.3, -3.05, 1.95, 0.50, 0.35),
        (3.0, -3.15, 2.65, 0.44, 0.30),
    ]
    for idx, (lx, ly, lz, lsx, lsy) in enumerate(leaf_coords):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(lx, ly, lz))
        leaf = bpy.context.active_object
        leaf.name = f"Leaf_{idx}"
        leaf.scale = (lsx, lsy, 0.16)
        leaf.rotation_euler = (math.radians(18 * idx), math.radians(-12 * idx), math.radians(45 * idx))
        leaf.data.materials.append(mat_plant)

    # 12. Modern Brass Floor Lamp
    bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.03, location=(3.4, -1.5, 0.015))
    l_base = bpy.context.active_object
    l_base.name = "Lamp_Base"
    l_base.data.materials.append(mat_brass)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=1.85, location=(3.4, -1.5, 0.93))
    l_pole = bpy.context.active_object
    l_pole.name = "Lamp_Pole"
    l_pole.data.materials.append(mat_brass)

    bpy.ops.mesh.primitive_cone_add(radius1=0.28, radius2=0.14, depth=0.38, location=(3.4, -1.5, 1.75))
    l_shade = bpy.context.active_object
    l_shade.name = "Lamp_Shade"
    l_shade.data.materials.append(mat_wall)
    add_bevel_subsurf(l_shade, 0.02, 2)

    lamp_light = bpy.data.lights.new(name="LampLight", type='POINT')
    lamp_light.energy = 120.0
    lamp_light.color = (1.0, 0.85, 0.6)
    lamp_light_obj = bpy.data.objects.new(name="Lamp_Point", object_data=lamp_light)
    lamp_light_obj.location = (3.4, -1.5, 1.7)
    bpy.context.collection.objects.link(lamp_light_obj)

    # 13. Dining Set
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.9, 2.9, 0.74))
    d_top = bpy.context.active_object
    d_top.name = "DiningTable_Top"
    d_top.scale = (2.3, 1.05, 0.06)
    d_top.data.materials.append(mat_dark_wood)
    add_bevel_subsurf(d_top, 0.02, 2)

    for dx, dy in [(-0.85, -0.38), (-0.85, 0.38), (0.85, -0.38), (0.85, 0.38)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.72, location=(1.9 + dx, 2.9 + dy, 0.36))
        d_leg = bpy.context.active_object
        d_leg.name = f"DiningLeg_{dx}_{dy}"
        d_leg.data.materials.append(mat_brass)

    # Dining Chairs
    c_positions = [
        (1.3, 2.9 - 0.7, 0),
        (2.5, 2.9 - 0.7, 0),
        (1.3, 2.9 + 0.7, math.pi),
        (2.5, 2.9 + 0.7, math.pi),
    ]
    for c_idx, (cx, cy, crot) in enumerate(c_positions):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy, 0.46), rotation=(0, 0, crot))
        dc_seat = bpy.context.active_object
        dc_seat.name = f"DiningSeat_{c_idx}"
        dc_seat.scale = (0.48, 0.48, 0.06)
        dc_seat.data.materials.append(mat_boucle)
        add_bevel_subsurf(dc_seat, 0.04, 2)

        bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy + (-0.22 if crot==0 else 0.22), 0.72), rotation=(0, 0, crot))
        dc_back = bpy.context.active_object
        dc_back.name = f"DiningBack_{c_idx}"
        dc_back.scale = (0.48, 0.06, 0.46)
        dc_back.data.materials.append(mat_boucle)
        add_bevel_subsurf(dc_back, 0.04, 2)

    # Dining Pendant
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, location=(1.9, 2.9, 2.25))
    pendant = bpy.context.active_object
    pendant.name = "Dining_Pendant"
    pendant.data.materials.append(mat_led)

    pendant_light = bpy.data.lights.new(name="PendantLight", type='POINT')
    pendant_light.energy = 220.0
    pendant_light.color = (1.0, 0.88, 0.68)
    pendant_obj = bpy.data.objects.new(name="Pendant_Point", object_data=pendant_light)
    pendant_obj.location = (1.9, 2.9, 2.2)
    bpy.context.collection.objects.link(pendant_obj)

    # 14. Professional Architectural Studio Lighting Rig
    # Soft Overhead Diffused Area Light
    area_data = bpy.data.lights.new(name="Interior_Key_Area", type='AREA')
    area_data.energy = 650.0
    area_data.size = 6.0
    area_data.color = (1.0, 0.94, 0.88)
    area_obj = bpy.data.objects.new(name="Interior_Key_Area_Obj", object_data=area_data)
    area_obj.location = (0.0, 0.0, 2.95)
    bpy.context.collection.objects.link(area_obj)

    # Sunset Window Light Rig (Entering from Right/Front)
    sun_data = bpy.data.lights.new(name="GoldenHour_Sun", type='SUN')
    sun_data.energy = 7.0
    sun_data.color = (1.0, 0.78, 0.58)
    sun_obj = bpy.data.objects.new(name="Sun_Obj", object_data=sun_data)
    sun_obj.rotation_euler = (math.radians(38), math.radians(22), math.radians(-115))
    bpy.context.collection.objects.link(sun_obj)

    # Window Area Fill Light
    win_area_data = bpy.data.lights.new(name="Window_Area_Fill", type='AREA')
    win_area_data.energy = 800.0
    win_area_data.size = 8.0
    win_area_data.color = (1.0, 0.82, 0.65)
    win_area_obj = bpy.data.objects.new(name="Window_Fill_Obj", object_data=win_area_data)
    win_area_obj.location = (4.2, -3.0, 1.8)
    win_area_obj.rotation_euler = (0, math.radians(-85), 0)
    bpy.context.collection.objects.link(win_area_obj)

def setup_cameras_and_render_all(output_dir):
    scene = bpy.context.scene
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    
    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except:
        scene.render.engine = 'BLENDER_EEVEE'
    
    cameras = {
        "render_hero.png": {
            "loc": (6.5, -7.5, 5.8),
            "rot": (math.radians(56), 0, math.radians(40)),
            "ortho": False,
            "lens": 35
        },
        "render_top_floorplan.png": {
            "loc": (0.0, 0.0, 11.5),
            "rot": (0, 0, 0),
            "ortho": True,
            "ortho_scale": 11.0
        },
        "render_front_elevation.png": {
            "loc": (0.0, -10.0, 1.6),
            "rot": (math.radians(90), 0, 0),
            "ortho": True,
            "ortho_scale": 9.5
        },
        "render_side_view.png": {
            "loc": (10.0, 0.0, 1.6),
            "rot": (math.radians(90), 0, math.radians(90)),
            "ortho": True,
            "ortho_scale": 11.0
        },
        "render_eye_level_living.png": {
            "loc": (2.6, -3.6, 1.35),
            "rot": (math.radians(82), 0, math.radians(45)),
            "ortho": False,
            "lens": 26
        }
    }

    ceiling_obj = bpy.data.objects.get("Ceiling_Concrete")
    soffit_obj = bpy.data.objects.get("Soffit_DropCeiling")

    for filename, cfg in cameras.items():
        cam_data = bpy.data.cameras.new(name=f"Cam_{filename}")
        cam_data.lens = cfg.get("lens", 50)
        if cfg.get("ortho", False):
            cam_data.type = 'ORTHO'
            cam_data.ortho_scale = cfg.get("ortho_scale", 10.0)
        else:
            cam_data.type = 'PERSP'

        cam_obj = bpy.data.objects.new(name=f"CamObj_{filename}", object_data=cam_data)
        cam_obj.location = cfg["loc"]
        cam_obj.rotation_euler = cfg["rot"]
        scene.collection.objects.link(cam_obj)
        scene.camera = cam_obj

        # Manage ceiling visibility for cutaway views
        if filename in ["render_top_floorplan.png", "render_hero.png"]:
            if ceiling_obj: ceiling_obj.hide_render = True
            if soffit_obj: soffit_obj.hide_render = True
        else:
            if ceiling_obj: ceiling_obj.hide_render = False
            if soffit_obj: soffit_obj.hide_render = False

        filepath = os.path.join(output_dir, filename)
        scene.render.filepath = filepath
        print(f"Rendering: {filepath}")
        bpy.ops.render.render(write_still=True)
        scene.collection.objects.unlink(cam_obj)

def export_deliverables(output_dir):
    blend_path = os.path.join(output_dir, "penthouse_interior_3d.blend")
    glb_path = os.path.join(output_dir, "penthouse_interior_3d.glb")
    fbx_path = os.path.join(output_dir, "penthouse_interior_3d.fbx")

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Exported .blend: {blend_path}")

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_cameras=True,
        export_lights=True,
        export_apply=True
    )
    print(f"Exported .glb: {glb_path}")

    bpy.ops.export_scene.fbx(
        filepath=fbx_path,
        use_selection=False,
        apply_unit_scale=True,
        apply_scale_options='FBX_SCALE_ALL'
    )
    print(f"Exported .fbx: {fbx_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\황태민\Documents\antigravity\lively-darwin"
    print("Rebuilding & Rendering Penthouse 3D Scene...")
    reset_scene()
    build_scene()
    setup_cameras_and_render_all(out_dir)
    export_deliverables(out_dir)
    print("Execution complete!")
