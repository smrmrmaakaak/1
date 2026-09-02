import bpy
import bmesh
import math
from mathutils import Vector, Euler, Matrix

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 64
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = False

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.15, coat=0.85, coat_roughness=0.05, sss=0.0, sss_color=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (400, 0)
    
    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (0, 0)
    
    # Base Color
    principled.inputs['Base Color'].default_value = base_color
    principled.inputs['Metallic'].default_value = metallic
    principled.inputs['Roughness'].default_value = roughness
    principled.inputs['IOR'].default_value = 1.52
    
    # Clearcoat (Porcelain Glaze)
    if 'Coat Weight' in principled.inputs:
        principled.inputs['Coat Weight'].default_value = coat
    elif 'Coat' in principled.inputs:
        principled.inputs['Coat'].default_value = coat
        
    if 'Coat Roughness' in principled.inputs:
        principled.inputs['Coat Roughness'].default_value = coat_roughness
        
    # Subsurface
    if sss > 0.0:
        if 'Subsurface Weight' in principled.inputs:
            principled.inputs['Subsurface Weight'].default_value = sss
        elif 'Subsurface' in principled.inputs:
            principled.inputs['Subsurface'].default_value = sss
        if sss_color and 'Subsurface Color' in principled.inputs:
            principled.inputs['Subsurface Color'].default_value = sss_color

    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_wood_chest_material():
    mat = bpy.data.materials.new(name='Mat_Antique_Walnut')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (600, 0)
    
    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (300, 0)
    principled.inputs['Roughness'].default_value = 0.28
    principled.inputs['IOR'].default_value = 1.52
    if 'Coat Weight' in principled.inputs:
        principled.inputs['Coat Weight'].default_value = 0.6
    elif 'Coat' in principled.inputs:
        principled.inputs['Coat'].default_value = 0.6
        
    tex_wave = nodes.new(type='ShaderNodeTexWave')
    tex_wave.location = (-300, 100)
    tex_wave.wave_type = 'BANDS'
    tex_wave.rings_direction = 'Z'
    tex_wave.inputs['Scale'].default_value = 15.0
    tex_wave.inputs['Distortion'].default_value = 4.5
    tex_wave.inputs['Detail'].default_value = 3.0
    
    ramp = nodes.new(type='ShaderNodeValToRGB')
    ramp.location = (0, 100)
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.22, 0.11, 0.05, 1.0) # Dark rich walnut
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = (0.42, 0.22, 0.10, 1.0) # Warm golden amber wood
    
    links.new(tex_wave.outputs['Color'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], principled.inputs['Base Color'])
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    return mat

def build_model():
    mats = {
        'scarlet': create_pbr_material('Mat_Scarlet_Porcelain', (0.85, 0.06, 0.08, 1.0), roughness=0.10, coat=0.95),
        'skin': create_pbr_material('Mat_Skin_Porcelain', (0.82, 0.52, 0.42, 1.0), roughness=0.15, coat=0.88, sss=0.08, sss_color=(0.9, 0.4, 0.3, 1.0)),
        'patent_black': create_pbr_material('Mat_Patent_Black', (0.04, 0.05, 0.07, 1.0), roughness=0.06, coat=1.0),
        'navy_velvet': create_pbr_material('Mat_Navy_Velvet', (0.05, 0.08, 0.16, 1.0), roughness=0.18, coat=0.80),
        'brass': create_pbr_material('Mat_Polished_Brass', (0.92, 0.72, 0.22, 1.0), metallic=0.95, roughness=0.14, coat=0.7),
        'silver': create_pbr_material('Mat_Silver_Metal', (0.85, 0.88, 0.92, 1.0), metallic=0.95, roughness=0.18, coat=0.6),
        'chest_iron': create_pbr_material('Mat_Chest_Iron', (0.16, 0.20, 0.26, 1.0), metallic=0.75, roughness=0.30, coat=0.5),
        'walnut': create_wood_chest_material(),
        'mustache': create_pbr_material('Mat_Mustache_Silver', (0.68, 0.70, 0.72, 1.0), roughness=0.22, coat=0.8),
        'white_trim': create_pbr_material('Mat_White_Enamel', (0.95, 0.95, 0.95, 1.0), roughness=0.10, coat=0.9),
        'ribbon_blue': create_pbr_material('Mat_Ribbon_Blue', (0.15, 0.45, 0.85, 1.0), roughness=0.2, coat=0.8),
        'ribbon_green': create_pbr_material('Mat_Ribbon_Green', (0.10, 0.55, 0.25, 1.0), roughness=0.2, coat=0.8),
        'ribbon_red': create_pbr_material('Mat_Ribbon_Red', (0.80, 0.15, 0.18, 1.0), roughness=0.2, coat=0.8),
        'ceramic_base': create_pbr_material('Mat_Ceramic_White_Base', (0.92, 0.92, 0.90, 1.0), roughness=0.12, coat=0.9),
    }

    collection = bpy.data.collections.new("RoyalDoulton_PastGlory")
    bpy.context.scene.collection.children.link(collection)

    def apply_mod_and_smooth(obj, subsurf_levels=1, bevel_width=0.0):
        if bevel_width > 0.0:
            bev = obj.modifiers.new(name="Bevel", type='BEVEL')
            bev.width = bevel_width
            bev.segments = 3
        if subsurf_levels > 0:
            sub = obj.modifiers.new(name="Subdivision", type='SUBSURF')
            sub.levels = subsurf_levels
            sub.render_levels = subsurf_levels
        for poly in obj.data.polygons:
            poly.use_smooth = True
        return obj

    # ==========================================
    # 1. Antique Wooden Chest / Trunk (Seat Base)
    # ==========================================
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.01, 0.0375), scale=(0.102, 0.096, 0.072))
    chest_body = bpy.context.active_object
    chest_body.name = "Chest_WoodBody"
    chest_body.data.materials.append(mats['walnut'])
    apply_mod_and_smooth(chest_body, subsurf_levels=1, bevel_width=0.003)
    collection.objects.link(chest_body)
    bpy.context.scene.collection.objects.unlink(chest_body)

    # Top lid edge frame
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.01, 0.072), scale=(0.106, 0.100, 0.006))
    lid_rim = bpy.context.active_object
    lid_rim.name = "Chest_LidRim"
    lid_rim.data.materials.append(mats['chest_iron'])
    apply_mod_and_smooth(lid_rim, subsurf_levels=1, bevel_width=0.002)
    collection.objects.link(lid_rim)
    bpy.context.scene.collection.objects.unlink(lid_rim)

    # Base bottom frame
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.01, 0.004), scale=(0.106, 0.100, 0.008))
    base_rim = bpy.context.active_object
    base_rim.name = "Chest_BaseRim"
    base_rim.data.materials.append(mats['chest_iron'])
    apply_mod_and_smooth(base_rim, subsurf_levels=1, bevel_width=0.002)
    collection.objects.link(base_rim)
    bpy.context.scene.collection.objects.unlink(base_rim)

    # 4 Vertical Iron Corner Straps
    corners = [
        (0.052, 0.058), (-0.052, 0.058),
        (0.052, -0.038), (-0.052, -0.038)
    ]
    for i, (cx, cy) in enumerate(corners):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=0.070, location=(cx, cy, 0.038))
        c_strap = bpy.context.active_object
        c_strap.name = f"Chest_Corner_{i}"
        c_strap.data.materials.append(mats['chest_iron'])
        apply_mod_and_smooth(c_strap, subsurf_levels=1)
        collection.objects.link(c_strap)
        bpy.context.scene.collection.objects.unlink(c_strap)

    # Side Drop Handles (Left & Right)
    for side, sx in [("R", 0.054), ("L", -0.054)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx, 0.01, 0.040), scale=(0.003, 0.024, 0.016))
        plate = bpy.context.active_object
        plate.name = f"Chest_HandlePlate_{side}"
        plate.data.materials.append(mats['chest_iron'])
        apply_mod_and_smooth(plate, subsurf_levels=1, bevel_width=0.001)
        collection.objects.link(plate)
        bpy.context.scene.collection.objects.unlink(plate)
        
        bpy.ops.mesh.primitive_torus_add(major_radius=0.010, minor_radius=0.002, location=(sx + (0.004 if sx > 0 else -0.004), 0.01, 0.036), rotation=(0, math.radians(90), 0))
        ring = bpy.context.active_object
        ring.name = f"Chest_HandleRing_{side}"
        ring.data.materials.append(mats['chest_iron'])
        apply_mod_and_smooth(ring, subsurf_levels=1)
        collection.objects.link(ring)
        bpy.context.scene.collection.objects.unlink(ring)

    # Front Lock Clasp & Strap (Facing -Y)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.040, 0.048), scale=(0.014, 0.004, 0.036))
    strap = bpy.context.active_object
    strap.name = "Chest_FrontLockStrap"
    strap.data.materials.append(mats['chest_iron'])
    apply_mod_and_smooth(strap, subsurf_levels=1, bevel_width=0.001)
    collection.objects.link(strap)
    bpy.context.scene.collection.objects.unlink(strap)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.005, depth=0.008, location=(0, -0.042, 0.045), rotation=(math.radians(90), 0, 0))
    hasp = bpy.context.active_object
    hasp.name = "Chest_LockHasp"
    hasp.data.materials.append(mats['brass'])
    apply_mod_and_smooth(hasp, subsurf_levels=1)
    collection.objects.link(hasp)
    bpy.context.scene.collection.objects.unlink(hasp)

    # Bottom Porcelain Hallmark Pedestal Rim
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.01, 0.001), scale=(0.100, 0.094, 0.002))
    base_bottom = bpy.context.active_object
    base_bottom.name = "Chest_CeramicBottom"
    base_bottom.data.materials.append(mats['ceramic_base'])
    collection.objects.link(base_bottom)
    bpy.context.scene.collection.objects.unlink(base_bottom)

    # ==========================================
    # 2. Chelsea Pensioner Lower Body & Legs
    # ==========================================
    # Right Thigh
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.062, location=(0.024, -0.022, 0.072), rotation=(math.radians(78), math.radians(6), math.radians(-10)))
    r_thigh = bpy.context.active_object
    r_thigh.name = "Pensioner_R_Thigh"
    r_thigh.data.materials.append(mats['patent_black'])
    apply_mod_and_smooth(r_thigh, subsurf_levels=2)
    collection.objects.link(r_thigh)
    bpy.context.scene.collection.objects.unlink(r_thigh)

    # Left Thigh
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.062, location=(-0.024, -0.022, 0.072), rotation=(math.radians(78), math.radians(-6), math.radians(10)))
    l_thigh = bpy.context.active_object
    l_thigh.name = "Pensioner_L_Thigh"
    l_thigh.data.materials.append(mats['patent_black'])
    apply_mod_and_smooth(l_thigh, subsurf_levels=2)
    collection.objects.link(l_thigh)
    bpy.context.scene.collection.objects.unlink(l_thigh)

    # Right Shin
    bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.060, location=(0.028, -0.048, 0.038), rotation=(math.radians(12), math.radians(4), 0))
    r_shin = bpy.context.active_object
    r_shin.name = "Pensioner_R_Shin"
    r_shin.data.materials.append(mats['patent_black'])
    apply_mod_and_smooth(r_shin, subsurf_levels=2)
    collection.objects.link(r_shin)
    bpy.context.scene.collection.objects.unlink(r_shin)

    # Left Shin
    bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.060, location=(-0.028, -0.048, 0.038), rotation=(math.radians(12), math.radians(-4), 0))
    l_shin = bpy.context.active_object
    l_shin.name = "Pensioner_L_Shin"
    l_shin.data.materials.append(mats['patent_black'])
    apply_mod_and_smooth(l_shin, subsurf_levels=2)
    collection.objects.link(l_shin)
    bpy.context.scene.collection.objects.unlink(l_shin)

    # Glossy Patent Leather Boots
    for side, bx, rot_z in [("R", 0.030, -12), ("L", -0.030, 12)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, -0.056, 0.008), scale=(0.018, 0.036, 0.014), rotation=(0, 0, math.radians(rot_z)))
        boot = bpy.context.active_object
        boot.name = f"Pensioner_Boot_{side}"
        boot.data.materials.append(mats['patent_black'])
        apply_mod_and_smooth(boot, subsurf_levels=2, bevel_width=0.002)
        collection.objects.link(boot)
        bpy.context.scene.collection.objects.unlink(boot)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=0.006, location=(bx, -0.044, 0.003))
        heel = bpy.context.active_object
        heel.name = f"Pensioner_Heel_{side}"
        heel.data.materials.append(mats['patent_black'])
        apply_mod_and_smooth(heel, subsurf_levels=1)
        collection.objects.link(heel)
        bpy.context.scene.collection.objects.unlink(heel)

    # ==========================================
    # 3. Scarlet Tunic / Frock Coat & Coat Tails
    # ==========================================
    bpy.ops.mesh.primitive_cylinder_add(radius=0.042, depth=0.038, location=(0, -0.005, 0.082))
    skirt = bpy.context.active_object
    skirt.scale = (1.05, 1.15, 1.0)
    skirt.name = "Pensioner_CoatSkirt"
    skirt.data.materials.append(mats['scarlet'])
    apply_mod_and_smooth(skirt, subsurf_levels=2)
    collection.objects.link(skirt)
    bpy.context.scene.collection.objects.unlink(skirt)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.038, 0.076), scale=(0.068, 0.014, 0.032))
    coat_tails = bpy.context.active_object
    coat_tails.name = "Pensioner_CoatTails"
    coat_tails.data.materials.append(mats['scarlet'])
    apply_mod_and_smooth(coat_tails, subsurf_levels=2, bevel_width=0.003)
    collection.objects.link(coat_tails)
    bpy.context.scene.collection.objects.unlink(coat_tails)

    # Main Torso
    bpy.ops.mesh.primitive_cylinder_add(radius=0.036, depth=0.058, location=(0, -0.008, 0.116), rotation=(math.radians(10), 0, 0))
    torso = bpy.context.active_object
    torso.scale = (1.08, 0.92, 1.0)
    torso.name = "Pensioner_Torso"
    torso.data.materials.append(mats['scarlet'])
    apply_mod_and_smooth(torso, subsurf_levels=2)
    collection.objects.link(torso)
    bpy.context.scene.collection.objects.unlink(torso)

    # Collar
    bpy.ops.mesh.primitive_cylinder_add(radius=0.020, depth=0.012, location=(0, -0.016, 0.146), rotation=(math.radians(12), 0, 0))
    collar = bpy.context.active_object
    collar.name = "Pensioner_Collar"
    collar.data.materials.append(mats['navy_velvet'])
    apply_mod_and_smooth(collar, subsurf_levels=2)
    collection.objects.link(collar)
    bpy.context.scene.collection.objects.unlink(collar)

    # Buttons
    for row in range(5):
        bz = 0.096 + row * 0.010
        by = -0.038 - (row * 0.002)
        for col_sign, cx in [("R", 0.011), ("L", -0.011)]:
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0022, location=(cx, by, bz))
            btn = bpy.context.active_object
            btn.name = f"Pensioner_Button_{row}_{col_sign}"
            btn.data.materials.append(mats['brass'])
            collection.objects.link(btn)
            bpy.context.scene.collection.objects.unlink(btn)

    # ==========================================
    # 4. Chest Medals & Military Honours
    # ==========================================
    medals_data = [
        (-0.018, mats['ribbon_blue'], "Medal_1"),
        (-0.024, mats['ribbon_green'], "Medal_2"),
        (-0.030, mats['ribbon_red'], "Medal_3"),
    ]
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.024, -0.036, 0.134), scale=(0.020, 0.003, 0.010), rotation=(math.radians(10), 0, math.radians(-5)))
    bar_plate = bpy.context.active_object
    bar_plate.name = "Medal_Bar_Plate"
    bar_plate.data.materials.append(mats['navy_velvet'])
    collection.objects.link(bar_plate)
    bpy.context.scene.collection.objects.unlink(bar_plate)

    for mx, rib_mat, mname in medals_data:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mx, -0.037, 0.134), scale=(0.005, 0.002, 0.008), rotation=(math.radians(10), 0, math.radians(-5)))
        rib = bpy.context.active_object
        rib.name = f"{mname}_Ribbon"
        rib.data.materials.append(rib_mat)
        collection.objects.link(rib)
        bpy.context.scene.collection.objects.unlink(rib)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.0035, depth=0.0015, location=(mx, -0.039, 0.126), rotation=(math.radians(100), 0, math.radians(-5)))
        disc = bpy.context.active_object
        disc.name = f"{mname}_Disc"
        disc.data.materials.append(mats['silver'])
        collection.objects.link(disc)
        bpy.context.scene.collection.objects.unlink(disc)

    # Sergeant Chevron
    bpy.ops.mesh.primitive_torus_add(major_radius=0.018, minor_radius=0.0018, location=(-0.038, -0.008, 0.132), rotation=(math.radians(35), math.radians(-25), 0))
    chevron = bpy.context.active_object
    chevron.name = "Pensioner_SergeantChevron"
    chevron.data.materials.append(mats['white_trim'])
    collection.objects.link(chevron)
    bpy.context.scene.collection.objects.unlink(chevron)

    # ==========================================
    # 5. Arms, Hands & Cuffs
    # ==========================================
    bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.046, location=(0.036, -0.012, 0.132), rotation=(math.radians(35), math.radians(20), math.radians(-25)))
    r_uarm = bpy.context.active_object
    r_uarm.name = "Pensioner_R_UpperArm"
    r_uarm.data.materials.append(mats['scarlet'])
    apply_mod_and_smooth(r_uarm, subsurf_levels=2)
    collection.objects.link(r_uarm)
    bpy.context.scene.collection.objects.unlink(r_uarm)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.044, location=(0.024, -0.034, 0.114), rotation=(math.radians(-25), math.radians(-45), math.radians(45)))
    r_farm = bpy.context.active_object
    r_farm.name = "Pensioner_R_ForeArm"
    r_farm.data.materials.append(mats['scarlet'])
    apply_mod_and_smooth(r_farm, subsurf_levels=2)
    collection.objects.link(r_farm)
    bpy.context.scene.collection.objects.unlink(r_farm)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.010, location=(0.016, -0.042, 0.106), rotation=(math.radians(-25), math.radians(-45), math.radians(45)))
    r_cuff = bpy.context.active_object
    r_cuff.name = "Pensioner_R_Cuff"
    r_cuff.data.materials.append(mats['navy_velvet'])
    apply_mod_and_smooth(r_cuff, subsurf_levels=2)
    collection.objects.link(r_cuff)
    bpy.context.scene.collection.objects.unlink(r_cuff)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.046, location=(-0.036, -0.012, 0.132), rotation=(math.radians(35), math.radians(-20), math.radians(25)))
    l_uarm = bpy.context.active_object
    l_uarm.name = "Pensioner_L_UpperArm"
    l_uarm.data.materials.append(mats['scarlet'])
    apply_mod_and_smooth(l_uarm, subsurf_levels=2)
    collection.objects.link(l_uarm)
    bpy.context.scene.collection.objects.unlink(l_uarm)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.044, location=(-0.022, -0.034, 0.114), rotation=(math.radians(-25), math.radians(45), math.radians(-45)))
    l_farm = bpy.context.active_object
    l_farm.name = "Pensioner_L_ForeArm"
    l_farm.data.materials.append(mats['scarlet'])
    apply_mod_and_smooth(l_farm, subsurf_levels=2)
    collection.objects.link(l_farm)
    bpy.context.scene.collection.objects.unlink(l_farm)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.010, location=(-0.014, -0.042, 0.106), rotation=(math.radians(-25), math.radians(45), math.radians(-45)))
    l_cuff = bpy.context.active_object
    l_cuff.name = "Pensioner_L_Cuff"
    l_cuff.data.materials.append(mats['navy_velvet'])
    apply_mod_and_smooth(l_cuff, subsurf_levels=2)
    collection.objects.link(l_cuff)
    bpy.context.scene.collection.objects.unlink(l_cuff)

    # Hands
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.008, -0.048, 0.102), scale=(0.014, 0.018, 0.010), rotation=(math.radians(-15), math.radians(-20), math.radians(30)))
    r_hand = bpy.context.active_object
    r_hand.name = "Pensioner_R_Hand"
    r_hand.data.materials.append(mats['skin'])
    apply_mod_and_smooth(r_hand, subsurf_levels=2, bevel_width=0.002)
    collection.objects.link(r_hand)
    bpy.context.scene.collection.objects.unlink(r_hand)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.006, -0.049, 0.101), scale=(0.014, 0.018, 0.010), rotation=(math.radians(-15), math.radians(20), math.radians(-30)))
    l_hand = bpy.context.active_object
    l_hand.name = "Pensioner_L_Hand"
    l_hand.data.materials.append(mats['skin'])
    apply_mod_and_smooth(l_hand, subsurf_levels=2, bevel_width=0.002)
    collection.objects.link(l_hand)
    bpy.context.scene.collection.objects.unlink(l_hand)

    # ==========================================
    # 6. Brass Bugle Horn & Silk Tassels
    # ==========================================
    bpy.ops.mesh.primitive_cone_add(radius1=0.014, radius2=0.004, depth=0.038, location=(0.024, -0.052, 0.096), rotation=(0, math.radians(72), math.radians(-25)))
    bugle_flare = bpy.context.active_object
    bugle_flare.name = "Bugle_BellFlare"
    bugle_flare.data.materials.append(mats['brass'])
    apply_mod_and_smooth(bugle_flare, subsurf_levels=2)
    collection.objects.link(bugle_flare)
    bpy.context.scene.collection.objects.unlink(bugle_flare)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.018, minor_radius=0.003, location=(0.002, -0.050, 0.098), rotation=(math.radians(75), math.radians(10), 0))
    bugle_loop = bpy.context.active_object
    bugle_loop.scale = (1.4, 0.6, 1.0)
    bugle_loop.name = "Bugle_TubeLoop"
    bugle_loop.data.materials.append(mats['brass'])
    apply_mod_and_smooth(bugle_loop, subsurf_levels=2)
    collection.objects.link(bugle_loop)
    bpy.context.scene.collection.objects.unlink(bugle_loop)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.003, depth=0.032, location=(-0.022, -0.047, 0.103), rotation=(0, math.radians(-80), math.radians(20)))
    bugle_pipe = bpy.context.active_object
    bugle_pipe.name = "Bugle_MouthpiecePipe"
    bugle_pipe.data.materials.append(mats['brass'])
    apply_mod_and_smooth(bugle_pipe, subsurf_levels=1)
    collection.objects.link(bugle_pipe)
    bpy.context.scene.collection.objects.unlink(bugle_pipe)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.012, minor_radius=0.0018, location=(0.004, -0.052, 0.097), rotation=(math.radians(75), math.radians(10), 0))
    bugle_cord = bpy.context.active_object
    bugle_cord.scale = (1.2, 0.5, 0.8)
    bugle_cord.name = "Bugle_GoldCord"
    bugle_cord.data.materials.append(mats['brass'])
    collection.objects.link(bugle_cord)
    bpy.context.scene.collection.objects.unlink(bugle_cord)

    for tx in [0.002, 0.010]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.004, radius2=0.001, depth=0.018, location=(tx, -0.054, 0.082), rotation=(math.radians(180), 0, math.radians(tx * 200)))
        tassel = bpy.context.active_object
        tassel.name = f"Bugle_Tassel_{tx}"
        tassel.data.materials.append(mats['patent_black'])
        apply_mod_and_smooth(tassel, subsurf_levels=1)
        collection.objects.link(tassel)
        bpy.context.scene.collection.objects.unlink(tassel)

    # ==========================================
    # 7. Head, Face, Silver Mustache & Features
    # ==========================================
    bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.016, location=(0, -0.016, 0.150), rotation=(math.radians(8), 0, 0))
    neck = bpy.context.active_object
    neck.name = "Pensioner_Neck"
    neck.data.materials.append(mats['skin'])
    apply_mod_and_smooth(neck, subsurf_levels=2)
    collection.objects.link(neck)
    bpy.context.scene.collection.objects.unlink(neck)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.020, location=(0, -0.018, 0.165))
    head = bpy.context.active_object
    head.scale = (0.95, 1.05, 1.12)
    head.name = "Pensioner_Head"
    head.data.materials.append(mats['skin'])
    apply_mod_and_smooth(head, subsurf_levels=2)
    collection.objects.link(head)
    bpy.context.scene.collection.objects.unlink(head)

    for side, ex, ez_rot in [("R", 0.019, 15), ("L", -0.019, -15)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0055, location=(ex, -0.016, 0.164), rotation=(0, 0, math.radians(ez_rot)))
        ear = bpy.context.active_object
        ear.scale = (0.5, 0.8, 1.2)
        ear.name = f"Pensioner_Ear_{side}"
        ear.data.materials.append(mats['skin'])
        apply_mod_and_smooth(ear, subsurf_levels=1)
        collection.objects.link(ear)
        bpy.context.scene.collection.objects.unlink(ear)

    bpy.ops.mesh.primitive_cone_add(radius1=0.0045, radius2=0.0015, depth=0.008, location=(0, -0.038, 0.165), rotation=(math.radians(-90), 0, 0))
    nose = bpy.context.active_object
    nose.name = "Pensioner_Nose"
    nose.data.materials.append(mats['skin'])
    apply_mod_and_smooth(nose, subsurf_levels=1)
    collection.objects.link(nose)
    bpy.context.scene.collection.objects.unlink(nose)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.038, 0.158), scale=(0.022, 0.005, 0.005), rotation=(math.radians(-10), 0, 0))
    mustache = bpy.context.active_object
    mustache.name = "Pensioner_Mustache"
    mustache.data.materials.append(mats['mustache'])
    apply_mod_and_smooth(mustache, subsurf_levels=2, bevel_width=0.001)
    collection.objects.link(mustache)
    bpy.context.scene.collection.objects.unlink(mustache)

    for side, mx_tip, mz_rot in [("R", 0.013, -25), ("L", -0.013, 25)]:
        bpy.ops.mesh.primitive_torus_add(major_radius=0.004, minor_radius=0.0015, location=(mx_tip, -0.036, 0.156), rotation=(math.radians(90), 0, math.radians(mz_rot)))
        mtip = bpy.context.active_object
        mtip.name = f"Pensioner_MustacheTip_{side}"
        mtip.data.materials.append(mats['mustache'])
        collection.objects.link(mtip)
        bpy.context.scene.collection.objects.unlink(mtip)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.019, minor_radius=0.004, location=(0, -0.014, 0.165), rotation=(math.radians(15), 0, 0))
    hair = bpy.context.active_object
    hair.scale = (0.95, 1.05, 0.8)
    hair.name = "Pensioner_SilverHair"
    hair.data.materials.append(mats['mustache'])
    apply_mod_and_smooth(hair, subsurf_levels=1)
    collection.objects.link(hair)
    bpy.context.scene.collection.objects.unlink(hair)

    # ==========================================
    # 8. Traditional Chelsea Pensioner Peaked Cap
    # ==========================================
    bpy.ops.mesh.primitive_cylinder_add(radius=0.021, depth=0.018, location=(0, -0.015, 0.178), rotation=(math.radians(12), 0, 0))
    cap_crown = bpy.context.active_object
    cap_crown.scale = (1.04, 1.10, 1.0)
    cap_crown.name = "Pensioner_CapCrown"
    cap_crown.data.materials.append(mats['patent_black'])
    apply_mod_and_smooth(cap_crown, subsurf_levels=2, bevel_width=0.002)
    collection.objects.link(cap_crown)
    bpy.context.scene.collection.objects.unlink(cap_crown)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.003, location=(0, -0.014, 0.187), rotation=(math.radians(12), 0, 0))
    cap_top = bpy.context.active_object
    cap_top.scale = (1.06, 1.12, 1.0)
    cap_top.name = "Pensioner_CapTopPlate"
    cap_top.data.materials.append(mats['patent_black'])
    apply_mod_and_smooth(cap_top, subsurf_levels=2)
    collection.objects.link(cap_top)
    bpy.context.scene.collection.objects.unlink(cap_top)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.023, depth=0.002, location=(0, -0.030, 0.173), rotation=(math.radians(-32), 0, 0))
    visor = bpy.context.active_object
    visor.scale = (1.05, 0.8, 1.0)
    visor.name = "Pensioner_CapVisor"
    visor.data.materials.append(mats['patent_black'])
    apply_mod_and_smooth(visor, subsurf_levels=2)
    collection.objects.link(visor)
    bpy.context.scene.collection.objects.unlink(visor)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.021, minor_radius=0.0016, location=(0, -0.017, 0.174), rotation=(math.radians(12), 0, 0))
    strap = bpy.context.active_object
    strap.scale = (1.05, 1.08, 0.9)
    strap.name = "Pensioner_CapGoldStrap"
    strap.data.materials.append(mats['brass'])
    collection.objects.link(strap)
    bpy.context.scene.collection.objects.unlink(strap)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.0045, depth=0.002, location=(0, -0.034, 0.181), rotation=(math.radians(78), 0, 0))
    badge = bpy.context.active_object
    badge.name = "Pensioner_CapBadge_RH"
    badge.data.materials.append(mats['brass'])
    apply_mod_and_smooth(badge, subsurf_levels=1)
    collection.objects.link(badge)
    bpy.context.scene.collection.objects.unlink(badge)

def setup_studio_lighting():
    scene = bpy.context.scene

    # 1. Warm Key Light (Right 45° High)
    bpy.ops.object.light_add(type='AREA', location=(0.35, -0.38, 0.42))
    key_light = bpy.context.active_object
    key_light.name = "Studio_KeyLight"
    key_light.data.energy = 35.0
    key_light.data.size = 0.25
    key_light.data.color = (1.0, 0.96, 0.90)
    key_light.rotation_euler = (math.radians(48), math.radians(18), math.radians(45))

    # 2. Cool Fill Light (Left 45°)
    bpy.ops.object.light_add(type='AREA', location=(-0.35, -0.32, 0.28))
    fill_light = bpy.context.active_object
    fill_light.name = "Studio_FillLight"
    fill_light.data.energy = 18.0
    fill_light.data.size = 0.35
    fill_light.data.color = (0.90, 0.94, 1.0)
    fill_light.rotation_euler = (math.radians(48), math.radians(-18), math.radians(-45))

    # 3. Crisp Rim / Silhouette Light (Back High)
    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.38, 0.38))
    rim_light = bpy.context.active_object
    rim_light.name = "Studio_RimLight"
    rim_light.data.energy = 45.0
    rim_light.data.size = 0.30
    rim_light.data.color = (1.0, 1.0, 1.0)
    rim_light.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # 4. Under-Bounce Light
    bpy.ops.object.light_add(type='POINT', location=(0.0, -0.15, -0.05))
    bounce_light = bpy.context.active_object
    bounce_light.name = "Studio_BounceLight"
    bounce_light.data.energy = 5.0
    bounce_light.data.color = (0.95, 0.92, 0.88)

def render_verification_views():
    scene = bpy.context.scene
    
    # Camera
    cam_data = bpy.data.cameras.new(name="MasterCamera")
    cam_data.lens = 70.0 # 70mm portrait lens
    cam_obj = bpy.data.objects.new(name="MasterCamera", object_data=cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Target look-at point: center of figurine (X=0, Y=-0.01, Z=0.10)
    target = Vector((0, -0.01, 0.10))

    def point_cam_at(cam, pos, tgt):
        cam.location = pos
        direction = tgt - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam.rotation_euler = rot_quat.to_euler()

    views = {
        'antique_past_glory_hero.png': Vector((0.28, -0.32, 0.22)),   # 3/4 Isometric Hero
        'antique_past_glory_front.png': Vector((0.0, -0.42, 0.11)),   # Front Portrait
        'antique_past_glory_side.png': Vector((0.42, -0.01, 0.11)),   # 90° Profile
        'antique_past_glory_top.png': Vector((0.001, -0.08, 0.44)),   # Top Bird's Eye
        'antique_past_glory_back.png': Vector((0.0, 0.42, 0.12)),     # Back View
    }

    for filename, pos in views.items():
        point_cam_at(cam_obj, pos, target)
        scene.render.filepath = f"c:/Users/황태민/Documents/antigravity/lively-darwin/{filename}"
        bpy.ops.render.render(write_still=True)
        print(f"[RENDER] Saved: {filename}")

def export_assets():
    # glTF / GLB Export
    glb_path = "c:/Users/황태민/Documents/antigravity/lively-darwin/antique_past_glory.glb"
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True
    )
    print(f"[EXPORT] GLB: {glb_path}")

    # FBX Export
    fbx_path = "c:/Users/황태민/Documents/antigravity/lively-darwin/antique_past_glory.fbx"
    bpy.ops.export_scene.fbx(
        filepath=fbx_path,
        use_selection=False,
        apply_scale_options='FBX_SCALE_ALL',
        axis_forward='-Z',
        axis_up='Y'
    )
    print(f"[EXPORT] FBX: {fbx_path}")

    # OBJ Export
    obj_path = "c:/Users/황태민/Documents/antigravity/lively-darwin/antique_past_glory.obj"
    bpy.ops.wm.obj_export(filepath=obj_path)
    print(f"[EXPORT] OBJ: {obj_path}")

    # Blend Native Project Save
    blend_path = "c:/Users/황태민/Documents/antigravity/lively-darwin/antique_past_glory.blend"
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"[EXPORT] BLEND: {blend_path}")

if __name__ == '__main__':
    print("=== STARTING MASTERPIECE 3D RECONSTRUCTION ===")
    reset_scene()
    build_model()
    setup_studio_lighting()
    render_verification_views()
    export_assets()
    print("=== MASTERPIECE 3D RECONSTRUCTION COMPLETE ===")
