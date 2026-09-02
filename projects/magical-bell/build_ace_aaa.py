import bpy
import bmesh
import math
import os

def create_pbr_material(name, base_color, roughness=0.35, metallic=0.0, specular=0.5, emissive=None, emissive_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Roughness'].default_value = roughness
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Specular IOR Level'].default_value = specular
    
    if emissive:
        node_bsdf.inputs['Emission Color'].default_value = emissive
        node_bsdf.inputs['Emission Strength'].default_value = emissive_strength
        
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def build_ace_aaa():
    print("🎨 [Blender 4.2] Crafting Ultra High-Quality Anime AAA Portgas D. Ace...")

    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Materials
    mat_skin = create_pbr_material("Skin", (0.96, 0.78, 0.68, 1.0), roughness=0.32, specular=0.6)
    mat_hair = create_pbr_material("Hair", (0.04, 0.04, 0.05, 1.0), roughness=0.20, specular=0.9)
    mat_eyes = create_pbr_material("Eyes", (0.02, 0.02, 0.02, 1.0), roughness=0.1, specular=1.0)
    mat_eye_white = create_pbr_material("EyeWhite", (0.95, 0.95, 0.95, 1.0), roughness=0.2)
    mat_hat = create_pbr_material("HatOrange", (0.92, 0.36, 0.04, 1.0), roughness=0.38, specular=0.5)
    mat_hat_band = create_pbr_material("HatBand", (0.08, 0.08, 0.08, 1.0), roughness=0.25)
    mat_bead_red = create_pbr_material("BeadRed", (0.88, 0.04, 0.04, 1.0), roughness=0.15, specular=0.95)
    mat_badge_cyan = create_pbr_material("BadgeCyan", (0.0, 0.85, 0.95, 1.0), roughness=0.2, specular=0.9, emissive=(0.0, 0.4, 0.5, 1.0), emissive_strength=0.5)
    mat_badge_red = create_pbr_material("BadgeRed", (0.95, 0.12, 0.12, 1.0), roughness=0.2, specular=0.9, emissive=(0.5, 0.05, 0.05, 1.0), emissive_strength=0.5)
    mat_pants = create_pbr_material("PantsNavy", (0.06, 0.09, 0.15, 1.0), roughness=0.55)
    mat_belt = create_pbr_material("BeltLeather", (0.32, 0.16, 0.07, 1.0), roughness=0.38)
    mat_buckle = create_pbr_material("BuckleGold", (0.95, 0.78, 0.20, 1.0), roughness=0.18, metallic=0.9)
    mat_silver = create_pbr_material("Silver", (0.85, 0.85, 0.88, 1.0), roughness=0.2, metallic=0.9)
    mat_boots = create_pbr_material("BootsBlack", (0.05, 0.05, 0.06, 1.0), roughness=0.35)
    mat_elbow = create_pbr_material("ElbowOrange", (0.92, 0.36, 0.04, 1.0), roughness=0.4)
    mat_wrist = create_pbr_material("WristBlack", (0.1, 0.1, 0.1, 1.0), roughness=0.3)
    mat_pouch = create_pbr_material("PouchBrown", (0.24, 0.12, 0.05, 1.0), roughness=0.45)
    mat_tattoo = create_pbr_material("TattooBlue", (0.1, 0.15, 0.35, 1.0), roughness=0.4)

    created_meshes = []

    def make_mesh(name, primitive_type, location, scale, rotation=(0,0,0), material=None, subsurf=False, **kwargs):
        if primitive_type == 'cube':
            bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation, **kwargs)
        elif primitive_type == 'uv_sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(location=location, rotation=rotation, **kwargs)
        elif primitive_type == 'cylinder':
            bpy.ops.mesh.primitive_cylinder_add(location=location, rotation=rotation, **kwargs)
        elif primitive_type == 'cone':
            bpy.ops.mesh.primitive_cone_add(location=location, rotation=rotation, **kwargs)
        elif primitive_type == 'torus':
            bpy.ops.mesh.primitive_torus_add(location=location, rotation=rotation, **kwargs)
        
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        if material:
            obj.data.materials.append(material)
        
        if subsurf:
            mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
            mod.levels = 1
            mod.render_levels = 2
            bpy.ops.object.modifier_apply(modifier="Subsurf")
            
        bpy.ops.object.shade_smooth()
        created_meshes.append(obj)
        return obj

    # Note: In Blender, front-facing towards camera (+Y is back, -Y is forward)
    # 1. HEAD & ANIME FACE
    head = make_mesh("Head", 'uv_sphere', (0, 0, 1.62), (0.15, 0.16, 0.16), segments=24, ring_count=20, material=mat_skin, subsurf=True)
    jaw = make_mesh("Jaw", 'cone', (0, -0.02, 1.54), (0.13, 0.13, 0.13), rotation=(math.pi, 0, 0), vertices=16, material=mat_skin)
    nose = make_mesh("Nose", 'cone', (0, -0.155, 1.60), (0.018, 0.025, 0.035), rotation=(-math.pi*0.45, 0, 0), vertices=8, material=mat_skin)
    ear_l = make_mesh("Ear_L", 'uv_sphere', (-0.155, 0.01, 1.62), (0.024, 0.040, 0.058), rotation=(0, -0.2, 0), material=mat_skin)
    ear_r = make_mesh("Ear_R", 'uv_sphere', (0.155, 0.01, 1.62), (0.024, 0.040, 0.058), rotation=(0, 0.2, 0), material=mat_skin)

    # Expressive Anime Eyes (White Sclera + Iris/Pupil)
    eye_bg_l = make_mesh("EyeWhite_L", 'uv_sphere', (-0.058, -0.146, 1.63), (0.035, 0.014, 0.026), rotation=(-0.1, 0.1, 0), material=mat_eye_white)
    eye_bg_r = make_mesh("EyeWhite_R", 'uv_sphere', (0.058, -0.146, 1.63), (0.035, 0.014, 0.026), rotation=(-0.1, -0.1, 0), material=mat_eye_white)
    eye_l = make_mesh("Eye_L", 'uv_sphere', (-0.058, -0.155, 1.63), (0.024, 0.010, 0.024), rotation=(-0.1, 0.1, 0), material=mat_eyes)
    eye_r = make_mesh("Eye_R", 'uv_sphere', (0.058, -0.155, 1.63), (0.024, 0.010, 0.024), rotation=(-0.1, -0.1, 0), material=mat_eyes)

    # Eyebrows
    brow_l = make_mesh("Brow_L", 'cylinder', (-0.060, -0.152, 1.66), (0.007, 0.007, 0.050), rotation=(0.15, 0.3, math.pi*0.5), vertices=8, material=mat_hair)
    brow_r = make_mesh("Brow_R", 'cylinder', (0.060, -0.152, 1.66), (0.007, 0.007, 0.050), rotation=(0.15, -0.3, math.pi*0.5), vertices=8, material=mat_hair)

    # Confident Smirk Mouth
    make_mesh("Mouth", 'cylinder', (0.01, -0.142, 1.55), (0.005, 0.005, 0.040), rotation=(0, 0.1, math.pi*0.5), vertices=8, material=mat_hair)

    # Signature Freckles (주근깨)
    for i, fx in enumerate([-0.08, -0.055, -0.03, 0.03, 0.055, 0.08]):
        fy = -0.148
        fz = 1.588 + (0.004 if i % 2 == 0 else -0.004)
        make_mesh(f"Freckle_{i}", 'uv_sphere', (fx, fy, fz), (0.004, 0.004, 0.004), material=mat_belt)

    # 2. WAVY JET BLACK HAIR (헝클어진 흑발 머리칼)
    for i in range(16):
        angle = (i / 16) * math.pi * 2
        hx = math.cos(angle) * 0.155
        hy = math.sin(angle) * 0.155 + 0.01
        hz = 1.67 - abs(math.cos(angle)) * 0.04
        make_mesh(f"HairLock_{i}", 'cone', (hx, hy, hz), (0.035, 0.035, 0.14), rotation=(-math.sin(angle)*0.4, math.cos(angle)*0.4, 0), vertices=8, material=mat_hair)

    # Front bangs framing face
    make_mesh("FrontBang_L", 'cone', (-0.08, -0.145, 1.64), (0.026, 0.026, 0.12), rotation=(0.3, 0.2, 0), vertices=8, material=mat_hair)
    make_mesh("FrontBang_R", 'cone', (0.08, -0.145, 1.64), (0.026, 0.026, 0.12), rotation=(0.3, -0.2, 0), vertices=8, material=mat_hair)

    # 3. COWBOY HAT (오렌지 카우보이 페도라)
    hat_brim = make_mesh("Hat_Brim", 'cylinder', (0, 0, 1.73), (0.38, 0.40, 0.014), rotation=(-0.04, 0, 0), vertices=32, material=mat_hat)
    hat_crown = make_mesh("Hat_Crown", 'cylinder', (0, 0.01, 1.80), (0.20, 0.22, 0.13), rotation=(-0.02, 0, 0), vertices=24, material=mat_hat)
    hat_band = make_mesh("Hat_Band", 'cylinder', (0, 0.008, 1.745), (0.205, 0.225, 0.030), rotation=(-0.02, 0, 0), vertices=24, material=mat_hat_band)

    # Badges on Hat: Smile (Cyan) & Frown (Red)
    badge_smile = make_mesh("Badge_Smile", 'uv_sphere', (-0.10, -0.20, 1.75), (0.028, 0.015, 0.028), rotation=(-0.1, 0.2, 0), material=mat_badge_cyan)
    badge_frown = make_mesh("Badge_Frown", 'uv_sphere', (0.10, -0.20, 1.75), (0.028, 0.015, 0.028), rotation=(-0.1, -0.2, 0), material=mat_badge_red)

    # Hanging Red Bead Cord from Hat
    for bi in range(6):
        make_mesh(f"HatBead_L_{bi}", 'uv_sphere', (-0.18, 0.02, 1.70 - bi * 0.04), (0.014, 0.014, 0.014), material=mat_bead_red)
        make_mesh(f"HatBead_R_{bi}", 'uv_sphere', (0.18, 0.02, 1.70 - bi * 0.04), (0.014, 0.014, 0.014), material=mat_bead_red)

    # 4. RED BEADED NECKLACE (에이스 대형 붉은 염주 목걸이)
    for ni in range(16):
        n_angle = (ni / 16) * math.pi * 2
        nx = math.cos(n_angle) * 0.15
        ny = math.sin(n_angle) * 0.13 - 0.02
        nz = 1.45 + (-0.02 if math.sin(n_angle) < 0 else 0.02)
        make_mesh(f"NeckBead_{ni}", 'uv_sphere', (nx, ny, nz), (0.024, 0.024, 0.024), material=mat_bead_red)

    # 5. ATHLETIC HEROIC MUSCULAR TORSO (선명한 근육질 상체)
    neck = make_mesh("Neck", 'cylinder', (0, 0, 1.50), (0.075, 0.075, 0.10), vertices=16, material=mat_skin)
    chest = make_mesh("Chest", 'cube', (0, 0, 1.36), (0.21, 0.13, 0.14), material=mat_skin, subsurf=True)
    pec_l = make_mesh("Pec_L", 'uv_sphere', (-0.09, -0.09, 1.38), (0.09, 0.07, 0.08), material=mat_skin)
    pec_r = make_mesh("Pec_R", 'uv_sphere', (0.09, -0.09, 1.38), (0.09, 0.07, 0.08), material=mat_skin)
    abs_torso = make_mesh("Abs", 'cylinder', (0, 0.01, 1.18), (0.16, 0.11, 0.22), vertices=16, material=mat_skin)

    # 6-Pack Abs Definition
    for r in range(3):
        for c in range(2):
            ax = -0.05 if c == 0 else 0.05
            az = 1.25 - r * 0.06
            make_mesh(f"Ab_{r}_{c}", 'uv_sphere', (ax, -0.10, az), (0.042, 0.028, 0.028), material=mat_skin)

    # 6. ARMS & SHOULDERS
    # Left Arm (with "ASCE" Tattoo, Orange Elbow Guard, Black Wristband)
    sh_l = make_mesh("Shoulder_L", 'uv_sphere', (-0.23, 0, 1.40), (0.075, 0.075, 0.075), material=mat_skin)
    arm_l = make_mesh("UpperArm_L", 'cylinder', (-0.24, 0, 1.28), (0.055, 0.055, 0.16), vertices=12, material=mat_skin)
    
    # "ASCE" Tattoo Plaque on Left Bicep
    make_mesh("Tattoo_ASCE", 'cube', (-0.292, 0, 1.28), (0.005, 0.03, 0.06), material=mat_tattoo)
    
    elbow_l = make_mesh("ElbowGuard_L", 'cylinder', (-0.25, 0, 1.18), (0.065, 0.065, 0.08), vertices=16, material=mat_elbow)
    forearm_l = make_mesh("Forearm_L", 'cylinder', (-0.25, 0, 1.06), (0.052, 0.052, 0.16), vertices=12, material=mat_skin)
    wrist_l = make_mesh("Wristband_L", 'cylinder', (-0.25, 0, 0.98), (0.058, 0.058, 0.05), vertices=16, material=mat_wrist)
    hand_l = make_mesh("Hand_L", 'uv_sphere', (-0.25, 0, 0.91), (0.045, 0.055, 0.065), material=mat_skin)

    # Right Arm
    sh_r = make_mesh("Shoulder_R", 'uv_sphere', (0.23, 0, 1.40), (0.075, 0.075, 0.075), material=mat_skin)
    arm_r = make_mesh("UpperArm_R", 'cylinder', (0.24, 0, 1.28), (0.055, 0.055, 0.16), vertices=12, material=mat_skin)
    forearm_r = make_mesh("Forearm_R", 'cylinder', (0.25, 0, 1.10), (0.052, 0.052, 0.20), vertices=12, material=mat_skin)
    wrist_r = make_mesh("Wristband_R", 'cylinder', (0.25, 0, 0.98), (0.058, 0.058, 0.05), vertices=16, material=mat_wrist)
    hand_r = make_mesh("Hand_R", 'uv_sphere', (0.25, 0, 0.91), (0.045, 0.055, 0.065), material=mat_skin)

    # 7. WAIST, BELT & GEAR
    pelvis = make_mesh("Pelvis", 'cube', (0, 0, 1.02), (0.16, 0.11, 0.12), material=mat_pants, subsurf=True)
    belt = make_mesh("Belt", 'cylinder', (0, 0, 1.05), (0.165, 0.12, 0.05), vertices=20, material=mat_belt)
    buckle = make_mesh("Buckle", 'cube', (0, -0.125, 1.05), (0.05, 0.015, 0.04), material=mat_buckle)

    # Dagger Sheath on Left Hip & Pouch on Right Hip
    pouch = make_mesh("Pouch", 'cube', (0.17, -0.02, 1.02), (0.035, 0.05, 0.06), material=mat_pouch)
    sheath = make_mesh("Dagger_Sheath", 'cylinder', (-0.18, -0.04, 0.94), (0.022, 0.035, 0.22), rotation=(-0.2, -0.3, 0), vertices=8, material=mat_belt)
    dagger_hilt = make_mesh("Dagger_Hilt", 'cylinder', (-0.15, -0.03, 1.07), (0.018, 0.018, 0.09), rotation=(-0.2, -0.3, 0), vertices=8, material=mat_silver)

    # 8. LEGS & SHORTS (다크 네이비 반바지)
    thigh_l = make_mesh("Shorts_L", 'cylinder', (-0.09, 0, 0.88), (0.075, 0.075, 0.18), vertices=16, material=mat_pants)
    thigh_r = make_mesh("Shorts_R", 'cylinder', (0.09, 0, 0.88), (0.075, 0.075, 0.18), vertices=16, material=mat_pants)
    
    knee_l = make_mesh("Knee_L", 'cylinder', (-0.09, 0, 0.68), (0.055, 0.055, 0.20), vertices=12, material=mat_skin)
    knee_r = make_mesh("Knee_R", 'cylinder', (0.09, 0, 0.68), (0.055, 0.055, 0.20), vertices=12, material=mat_skin)

    # 9. BLACK PIRATE BOOTS (해적 가죽 롱 부츠)
    boot_cuff_l = make_mesh("BootCuff_L", 'cylinder', (-0.09, 0, 0.52), (0.07, 0.07, 0.08), vertices=16, material=mat_boots)
    boot_cuff_r = make_mesh("BootCuff_R", 'cylinder', (0.09, 0, 0.52), (0.07, 0.07, 0.08), vertices=16, material=mat_boots)
    
    boot_leg_l = make_mesh("BootLeg_L", 'cylinder', (-0.09, 0, 0.32), (0.06, 0.06, 0.32), vertices=16, material=mat_boots)
    boot_leg_r = make_mesh("BootLeg_R", 'cylinder', (0.09, 0, 0.32), (0.06, 0.06, 0.32), vertices=16, material=mat_boots)

    foot_l = make_mesh("Foot_L", 'cube', (-0.09, -0.05, 0.07), (0.06, 0.11, 0.07), material=mat_boots)
    foot_r = make_mesh("Foot_R", 'cube', (0.09, -0.05, 0.07), (0.06, 0.11, 0.07), material=mat_boots)

    # Join meshes
    bpy.ops.object.select_all(action='DESELECT')
    for m in created_meshes:
        m.select_set(True)
    bpy.context.view_layer.objects.active = created_meshes[0]
    bpy.ops.object.join()
    
    ace_mesh = bpy.context.active_object
    ace_mesh.name = "Ace_Hero_AAA"

    # 10. ARMATURE RIGGING
    bpy.ops.object.armature_add(location=(0, 0, 0))
    armature_obj = bpy.context.active_object
    armature_obj.name = "Rig"
    
    bpy.ops.object.mode_set(mode='EDIT')
    edit_bones = armature_obj.data.edit_bones
    edit_bones.remove(edit_bones[0])

    def add_bone(bname, head_pos, tail_pos, parent_name=None):
        b = edit_bones.new(bname)
        b.head = head_pos
        b.tail = tail_pos
        if parent_name and parent_name in edit_bones:
            b.parent = edit_bones[parent_name]
        return b

    # Core Spine
    add_bone("root", (0, 0, 0), (0, 0, 0.1))
    add_bone("hips", (0, 0, 1.02), (0, 0, 1.15), "root")
    add_bone("spine", (0, 0, 1.15), (0, 0, 1.32), "hips")
    add_bone("chest", (0, 0, 1.32), (0, 0, 1.50), "spine")
    add_bone("head", (0, 0, 1.50), (0, 0, 1.75), "chest")

    # Left Arm
    add_bone("upperarml", (-0.20, 0, 1.40), (-0.25, 0, 1.18), "chest")
    add_bone("lowerarml", (-0.25, 0, 1.18), (-0.25, 0, 0.98), "upperarml")
    add_bone("wristl", (-0.25, 0, 0.98), (-0.25, 0, 0.92), "lowerarml")
    add_bone("handl", (-0.25, 0, 0.92), (-0.25, 0, 0.85), "wristl")

    # Right Arm
    add_bone("upperarmr", (0.20, 0, 1.40), (0.25, 0, 1.18), "chest")
    add_bone("lowerarmr", (0.25, 0, 1.18), (0.25, 0, 0.98), "upperarmr")
    add_bone("wristr", (0.25, 0, 0.98), (0.25, 0, 0.92), "lowerarmr")
    add_bone("handr", (0.25, 0, 0.92), (0.25, 0, 0.85), "wristr")

    # Left Leg
    add_bone("upperlegl", (-0.09, 0, 0.98), (-0.09, 0, 0.58), "hips")
    add_bone("lowerlegl", (-0.09, 0, 0.58), (-0.09, 0, 0.15), "upperlegl")
    add_bone("footl", (-0.09, 0, 0.15), (-0.09, -0.12, 0.05), "lowerlegl")

    # Right Leg
    add_bone("upperlegr", (0.09, 0, 0.98), (0.09, 0, 0.58), "hips")
    add_bone("lowerlegr", (0.09, 0, 0.58), (0.09, 0, 0.15), "upperlegr")
    add_bone("footr", (0.09, 0, 0.15), (0.09, -0.12, 0.05), "lowerlegr")

    bpy.ops.object.mode_set(mode='OBJECT')

    # Skin Mesh to Armature
    bpy.ops.object.select_all(action='DESELECT')
    ace_mesh.select_set(True)
    armature_obj.select_set(True)
    bpy.context.view_layer.objects.active = armature_obj
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')

    # Export GLB
    output_path = os.path.abspath("public/models/hero_ace_aaa.glb")
    print(f"📦 Exporting AAA Ace GLB to: {output_path}")

    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_animations=True,
        export_skins=True,
        export_morph=True
    )

    print("✨ [DONE] AAA Grade Portgas D. Ace created!")

build_ace_aaa()
