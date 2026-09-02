import bpy
import bmesh
import math
import os

def create_pbr_mat(name, color, roughness=0.35, metallic=0.0, specular=0.6, emissive=None, emissive_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.inputs['Base Color'].default_value = color
    node_bsdf.inputs['Roughness'].default_value = roughness
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Specular IOR Level'].default_value = specular
    
    if emissive:
        node_bsdf.inputs['Emission Color'].default_value = emissive
        node_bsdf.inputs['Emission Strength'].default_value = emissive_strength
        
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def build_ace_masterpiece():
    print("🔥 [Blender 4.2] Building Masterpiece Anime AAA Portgas D. Ace...")

    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Master Materials
    mat_skin = create_pbr_mat("AceSkin", (0.95, 0.76, 0.64, 1.0), roughness=0.28, specular=0.6)
    mat_hair = create_pbr_mat("AceHair", (0.04, 0.04, 0.05, 1.0), roughness=0.18, specular=0.9)
    mat_eye_sclera = create_pbr_mat("EyeWhite", (0.98, 0.98, 0.98, 1.0), roughness=0.1)
    mat_eye_pupil = create_pbr_mat("EyePupil", (0.02, 0.02, 0.02, 1.0), roughness=0.05, specular=1.0)
    mat_hat = create_pbr_mat("HatOrange", (0.92, 0.35, 0.03, 1.0), roughness=0.35, specular=0.5)
    mat_hat_band = create_pbr_mat("HatBandBlack", (0.08, 0.08, 0.09, 1.0), roughness=0.25)
    mat_bead_red = create_pbr_mat("BeadCrimson", (0.90, 0.04, 0.04, 1.0), roughness=0.12, specular=1.0)
    mat_badge_cyan = create_pbr_mat("BadgeCyan", (0.0, 0.88, 0.96, 1.0), roughness=0.15, specular=0.9, emissive=(0.0, 0.45, 0.55, 1.0), emissive_strength=0.6)
    mat_badge_red = create_pbr_mat("BadgeRed", (0.96, 0.12, 0.12, 1.0), roughness=0.15, specular=0.9, emissive=(0.55, 0.05, 0.05, 1.0), emissive_strength=0.6)
    mat_pants = create_pbr_mat("PantsNavy", (0.08, 0.11, 0.18, 1.0), roughness=0.5)
    mat_belt = create_pbr_mat("BeltBrown", (0.30, 0.15, 0.06, 1.0), roughness=0.35)
    mat_gold = create_pbr_mat("GoldBuckle", (0.96, 0.80, 0.22, 1.0), roughness=0.15, metallic=0.95)
    mat_boots = create_pbr_mat("BootsBlack", (0.05, 0.05, 0.06, 1.0), roughness=0.3)
    mat_elbow = create_pbr_mat("ElbowOrange", (0.92, 0.35, 0.03, 1.0), roughness=0.38)
    mat_wrist = create_pbr_mat("WristBlack", (0.08, 0.08, 0.09, 1.0), roughness=0.3)
    mat_tattoo = create_pbr_mat("TattooBlue", (0.08, 0.12, 0.32, 1.0), roughness=0.35)

    created_meshes = []

    def make_part(name, ptype, loc, scale, rot=(0,0,0), mat=None, subsurf=False, **kwargs):
        if ptype == 'cube':
            bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot, **kwargs)
        elif ptype == 'sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(location=loc, rotation=rot, **kwargs)
        elif ptype == 'cylinder':
            bpy.ops.mesh.primitive_cylinder_add(location=loc, rotation=rot, **kwargs)
        elif ptype == 'cone':
            bpy.ops.mesh.primitive_cone_add(location=loc, rotation=rot, **kwargs)
        elif ptype == 'torus':
            bpy.ops.mesh.primitive_torus_add(location=loc, rotation=rot, **kwargs)
            
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        if mat:
            obj.data.materials.append(mat)
        if subsurf:
            mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
            mod.levels = 1
            mod.render_levels = 2
            bpy.ops.object.modifier_apply(modifier="Subsurf")
        bpy.ops.object.shade_smooth()
        created_meshes.append(obj)
        return obj

    # 1. HEAD & FACE
    head = make_part("Head", 'sphere', (0, 0, 1.62), (0.16, 0.17, 0.17), segments=28, ring_count=24, mat=mat_skin, subsurf=True)
    jaw = make_part("Jaw", 'cone', (0, -0.03, 1.52), (0.135, 0.135, 0.14), rot=(math.pi, 0, 0), vertices=16, mat=mat_skin)
    nose = make_part("Nose", 'cone', (0, -0.165, 1.60), (0.016, 0.024, 0.035), rot=(-math.pi*0.46, 0, 0), vertices=8, mat=mat_skin)
    ear_l = make_part("Ear_L", 'sphere', (-0.16, 0.01, 1.62), (0.025, 0.040, 0.060), rot=(0, -0.2, 0), mat=mat_skin)
    ear_r = make_part("Ear_R", 'sphere', (0.16, 0.01, 1.62), (0.025, 0.040, 0.060), rot=(0, 0.2, 0), mat=mat_skin)

    # Anime Eyes
    make_part("EyeWhite_L", 'sphere', (-0.06, -0.155, 1.63), (0.036, 0.015, 0.028), rot=(-0.1, 0.12, 0), mat=mat_eye_sclera)
    make_part("EyeWhite_R", 'sphere', (0.06, -0.155, 1.63), (0.036, 0.015, 0.028), rot=(-0.1, -0.12, 0), mat=mat_eye_sclera)
    make_part("Pupil_L", 'sphere', (-0.06, -0.165, 1.63), (0.025, 0.010, 0.025), rot=(-0.1, 0.12, 0), mat=mat_eye_pupil)
    make_part("Pupil_R", 'sphere', (0.06, -0.165, 1.63), (0.025, 0.010, 0.025), rot=(-0.1, -0.12, 0), mat=mat_eye_pupil)

    # Sharp Eyebrows & Confident Smirk
    make_part("Brow_L", 'cylinder', (-0.062, -0.160, 1.67), (0.007, 0.007, 0.052), rot=(0.15, 0.35, math.pi*0.5), vertices=8, mat=mat_hair)
    make_part("Brow_R", 'cylinder', (0.062, -0.160, 1.67), (0.007, 0.007, 0.052), rot=(0.15, -0.35, math.pi*0.5), vertices=8, mat=mat_hair)
    make_part("Mouth", 'cylinder', (0.012, -0.150, 1.54), (0.005, 0.005, 0.042), rot=(0, 0.12, math.pi*0.5), vertices=8, mat=mat_hair)

    # Ace Freckles (양 볼 6개 주근깨)
    for i, fx in enumerate([-0.085, -0.06, -0.035, 0.035, 0.06, 0.085]):
        fy = -0.158
        fz = 1.585 + (0.004 if i % 2 == 0 else -0.004)
        make_part(f"Freckle_{i}", 'sphere', (fx, fy, fz), (0.0045, 0.0045, 0.0045), mat=mat_belt)

    # 2. WAVY BLACK HAIR LOCKS (풍성한 흑발 가닥들)
    for i in range(18):
        angle = (i / 18) * math.pi * 2
        hx = math.cos(angle) * 0.165
        hy = math.sin(angle) * 0.165 + 0.01
        hz = 1.67 - abs(math.cos(angle)) * 0.04
        make_part(f"HairLock_{i}", 'cone', (hx, hy, hz), (0.038, 0.038, 0.15), rot=(-math.sin(angle)*0.45, math.cos(angle)*0.45, 0), vertices=8, mat=mat_hair)

    # Front bangs
    make_part("FrontBang_L", 'cone', (-0.085, -0.155, 1.64), (0.028, 0.028, 0.13), rot=(0.32, 0.22, 0), vertices=8, mat=mat_hair)
    make_part("FrontBang_R", 'cone', (0.085, -0.155, 1.64), (0.028, 0.028, 0.13), rot=(0.32, -0.22, 0), vertices=8, mat=mat_hair)

    # 3. COWBOY FEDORA HAT
    make_part("Hat_Brim", 'cylinder', (0, 0, 1.74), (0.40, 0.42, 0.015), rot=(-0.04, 0, 0), vertices=32, mat=mat_hat)
    make_part("Hat_Crown", 'cylinder', (0, 0.01, 1.81), (0.22, 0.24, 0.14), rot=(-0.02, 0, 0), vertices=24, mat=mat_hat)
    make_part("Hat_Band", 'cylinder', (0, 0.008, 1.755), (0.225, 0.245, 0.032), rot=(-0.02, 0, 0), vertices=24, mat=mat_hat_band)

    # Badges: Smile (Cyan) & Frown (Red)
    make_part("Badge_Smile", 'sphere', (-0.11, -0.22, 1.76), (0.030, 0.016, 0.030), rot=(-0.1, 0.2, 0), mat=mat_badge_cyan)
    make_part("Badge_Frown", 'sphere', (0.11, -0.22, 1.76), (0.030, 0.016, 0.030), rot=(-0.1, -0.2, 0), mat=mat_badge_red)

    # Hanging Bead Cords
    for bi in range(6):
        make_part(f"HatBead_L_{bi}", 'sphere', (-0.20, 0.02, 1.70 - bi * 0.04), (0.015, 0.015, 0.015), mat=mat_bead_red)
        make_part(f"HatBead_R_{bi}", 'sphere', (0.20, 0.02, 1.70 - bi * 0.04), (0.015, 0.015, 0.015), mat=mat_bead_red)

    # 4. RED BEADED NECKLACE (대형 붉은 염주)
    for ni in range(16):
        n_angle = (ni / 16) * math.pi * 2
        nx = math.cos(n_angle) * 0.16
        ny = math.sin(n_angle) * 0.14 - 0.02
        nz = 1.45 + (-0.025 if math.sin(n_angle) < 0 else 0.025)
        make_part(f"NeckBead_{ni}", 'sphere', (nx, ny, nz), (0.026, 0.026, 0.026), mat=mat_bead_red)

    # 5. ATHLETIC HEROIC TORSO & MUSCLES
    make_part("Neck", 'cylinder', (0, 0, 1.50), (0.08, 0.08, 0.10), vertices=16, mat=mat_skin)
    make_part("Chest", 'cube', (0, 0, 1.36), (0.23, 0.14, 0.15), mat=mat_skin, subsurf=True)
    make_part("Pec_L", 'sphere', (-0.10, -0.10, 1.38), (0.10, 0.08, 0.09), mat=mat_skin)
    make_part("Pec_R", 'sphere', (0.10, -0.10, 1.38), (0.10, 0.08, 0.09), mat=mat_skin)
    make_part("Abs", 'cylinder', (0, 0.01, 1.18), (0.17, 0.12, 0.22), vertices=16, mat=mat_skin)

    # 6-Pack Abs Definition
    for r in range(3):
        for c in range(2):
            ax = -0.055 if c == 0 else 0.055
            az = 1.25 - r * 0.065
            make_part(f"Ab_{r}_{c}", 'sphere', (ax, -0.11, az), (0.045, 0.030, 0.030), mat=mat_skin)

    # 6. ARMS & SHOULDERS
    # Left Arm (Tattoo + Elbow Guard + Wristband)
    make_part("Shoulder_L", 'sphere', (-0.25, 0, 1.40), (0.085, 0.085, 0.085), mat=mat_skin)
    make_part("UpperArm_L", 'cylinder', (-0.26, 0, 1.28), (0.060, 0.060, 0.16), vertices=12, mat=mat_skin)
    make_part("Tattoo_ASCE", 'cube', (-0.318, 0, 1.28), (0.005, 0.035, 0.07), mat=mat_tattoo)
    make_part("ElbowGuard_L", 'cylinder', (-0.27, 0, 1.18), (0.070, 0.070, 0.08), vertices=16, mat=mat_elbow)
    make_part("Forearm_L", 'cylinder', (-0.27, 0, 1.06), (0.056, 0.056, 0.16), vertices=12, mat=mat_skin)
    make_part("Wristband_L", 'cylinder', (-0.27, 0, 0.98), (0.062, 0.062, 0.05), vertices=16, mat=mat_wrist)
    make_part("Hand_L", 'sphere', (-0.27, 0, 0.91), (0.048, 0.058, 0.068), mat=mat_skin)

    # Right Arm
    make_part("Shoulder_R", 'sphere', (0.25, 0, 1.40), (0.085, 0.085, 0.085), mat=mat_skin)
    make_part("UpperArm_R", 'cylinder', (0.26, 0, 1.28), (0.060, 0.060, 0.16), vertices=12, mat=mat_skin)
    make_part("Forearm_R", 'cylinder', (0.27, 0, 1.10), (0.056, 0.056, 0.20), vertices=12, mat=mat_skin)
    make_part("Wristband_R", 'cylinder', (0.27, 0, 0.98), (0.062, 0.062, 0.05), vertices=16, mat=mat_wrist)
    make_part("Hand_R", 'sphere', (0.27, 0, 0.91), (0.048, 0.058, 0.068), mat=mat_skin)

    # 7. WAIST & GEAR
    make_part("Pelvis", 'cube', (0, 0, 1.02), (0.18, 0.13, 0.12), mat=mat_pants, subsurf=True)
    make_part("Belt", 'cylinder', (0, 0, 1.05), (0.185, 0.135, 0.05), vertices=20, mat=mat_belt)
    make_part("Buckle", 'cube', (0, -0.140, 1.05), (0.055, 0.016, 0.045), mat=mat_gold)

    # Dagger Sheath & Pouch
    make_part("Pouch", 'cube', (0.19, -0.02, 1.02), (0.038, 0.055, 0.065), mat=mat_belt)
    make_part("Dagger_Sheath", 'cylinder', (-0.20, -0.04, 0.94), (0.024, 0.038, 0.22), rot=(-0.2, -0.3, 0), vertices=8, mat=mat_belt)
    make_part("Dagger_Hilt", 'cylinder', (-0.17, -0.03, 1.07), (0.019, 0.019, 0.09), rot=(-0.2, -0.3, 0), vertices=8, mat=mat_gold)

    # 8. LEGS & SHORTS (다크 네이비 반바지)
    make_part("Shorts_L", 'cylinder', (-0.10, 0, 0.88), (0.085, 0.085, 0.18), vertices=16, mat=mat_pants)
    make_part("Shorts_R", 'cylinder', (0.10, 0, 0.88), (0.085, 0.085, 0.18), vertices=16, mat=mat_pants)
    make_part("Knee_L", 'cylinder', (-0.10, 0, 0.68), (0.060, 0.060, 0.20), vertices=12, mat=mat_skin)
    make_part("Knee_R", 'cylinder', (0.10, 0, 0.68), (0.060, 0.060, 0.20), vertices=12, mat=mat_skin)

    # 9. BLACK PIRATE BOOTS
    make_part("BootCuff_L", 'cylinder', (-0.10, 0, 0.52), (0.075, 0.075, 0.08), vertices=16, mat=mat_boots)
    make_part("BootCuff_R", 'cylinder', (0.10, 0, 0.52), (0.075, 0.075, 0.08), vertices=16, mat=mat_boots)
    make_part("BootLeg_L", 'cylinder', (-0.10, 0, 0.32), (0.065, 0.065, 0.32), vertices=16, mat=mat_boots)
    make_part("BootLeg_R", 'cylinder', (0.10, 0, 0.32), (0.065, 0.065, 0.32), vertices=16, mat=mat_boots)
    make_part("Foot_L", 'cube', (-0.10, -0.06, 0.07), (0.065, 0.12, 0.07), mat=mat_boots)
    make_part("Foot_R", 'cube', (0.10, -0.06, 0.07), (0.065, 0.12, 0.07), mat=mat_boots)

    # Join meshes
    bpy.ops.object.select_all(action='DESELECT')
    for m in created_meshes:
        m.select_set(True)
    bpy.context.view_layer.objects.active = created_meshes[0]
    bpy.ops.object.join()
    
    ace_mesh = bpy.context.active_object
    ace_mesh.name = "Ace_Masterpiece"

    # 10. ARMATURE RIGGING (Full Three.js Compatibility)
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

    # Bones
    add_bone("root", (0, 0, 0), (0, 0, 0.1))
    add_bone("hips", (0, 0, 1.02), (0, 0, 1.15), "root")
    add_bone("spine", (0, 0, 1.15), (0, 0, 1.32), "hips")
    add_bone("chest", (0, 0, 1.32), (0, 0, 1.50), "spine")
    add_bone("head", (0, 0, 1.50), (0, 0, 1.75), "chest")

    add_bone("upperarml", (-0.22, 0, 1.40), (-0.27, 0, 1.18), "chest")
    add_bone("lowerarml", (-0.27, 0, 1.18), (-0.27, 0, 0.98), "upperarml")
    add_bone("wristl", (-0.27, 0, 0.98), (-0.27, 0, 0.92), "lowerarml")
    add_bone("handl", (-0.27, 0, 0.92), (-0.27, 0, 0.85), "wristl")

    add_bone("upperarmr", (0.22, 0, 1.40), (0.27, 0, 1.18), "chest")
    add_bone("lowerarmr", (0.27, 0, 1.18), (0.27, 0, 0.98), "upperarmr")
    add_bone("wristr", (0.27, 0, 0.98), (0.27, 0, 0.92), "lowerarmr")
    add_bone("handr", (0.27, 0, 0.92), (0.27, 0, 0.85), "wristr")

    add_bone("upperlegl", (-0.10, 0, 0.98), (-0.10, 0, 0.58), "hips")
    add_bone("lowerlegl", (-0.10, 0, 0.58), (-0.10, 0, 0.15), "upperlegl")
    add_bone("footl", (-0.10, 0, 0.15), (-0.10, -0.12, 0.05), "lowerlegl")

    add_bone("upperlegr", (0.10, 0, 0.98), (0.10, 0, 0.58), "hips")
    add_bone("lowerlegr", (0.10, 0, 0.58), (0.10, 0, 0.15), "upperlegr")
    add_bone("footr", (0.10, 0, 0.15), (0.10, -0.12, 0.05), "lowerlegr")

    bpy.ops.object.mode_set(mode='OBJECT')

    # Skin Mesh to Armature
    bpy.ops.object.select_all(action='DESELECT')
    ace_mesh.select_set(True)
    armature_obj.select_set(True)
    bpy.context.view_layer.objects.active = armature_obj
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')

    # Export GLB to public/models/hero_ace_masterpiece.glb
    output_path = os.path.abspath("public/models/hero_ace_masterpiece.glb")
    print(f"📦 Exporting Masterpiece Ace GLB to: {output_path}")

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

    print("✨ [DONE] Masterpiece Anime AAA Portgas D. Ace created!")

build_ace_masterpiece()
