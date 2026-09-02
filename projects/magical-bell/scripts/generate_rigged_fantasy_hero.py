import bpy
import math
import os

OUTPUT_PATH = r"c:\Users\황태민\Documents\antigravity\magical-bell\public\models\hero_sorcerer_rigged.glb"
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), roughness=0.5, metalness=0.0, emissive=(0, 0, 0, 1.0), emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = base_color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metalness
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emissive
            bsdf.inputs['Emission Strength'].default_value = emissive_strength
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emissive
    return mat

def create_rigged_fantasy_sorcerer():
    clear_scene()

    # Materials
    robe_dark = create_pbr_material("RobeDark", (0.05, 0.12, 0.28, 1.0), roughness=0.7, metalness=0.1)
    robe_trim = create_pbr_material("RobeGoldTrim", (0.85, 0.65, 0.15, 1.0), roughness=0.3, metalness=0.8)
    skin_mat = create_pbr_material("SorcererSkin", (0.92, 0.76, 0.64, 1.0), roughness=0.4)
    beard_mat = create_pbr_material("SilverBeard", (0.9, 0.92, 0.95, 1.0), roughness=0.8)
    ice_glow = create_pbr_material("IceRuneGlow", (0.2, 0.8, 1.0, 1.0), roughness=0.1, emissive=(0.15, 0.75, 1.0, 1.0), emissive_strength=4.0)
    leather_mat = create_pbr_material("BootsLeather", (0.2, 0.12, 0.08, 1.0), roughness=0.6)
    crystal_mat = create_pbr_material("FrostCrystal", (0.4, 0.9, 1.0, 1.0), roughness=0.05, metalness=0.2, emissive=(0.2, 0.8, 1.0, 1.0), emissive_strength=2.5)

    # 1. Create Armature
    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    arm_obj = bpy.context.active_object
    arm_obj.name = "SorcererRig"
    arm = arm_obj.data
    arm.name = "SorcererArmature"

    # Remove default bone
    bpy.ops.armature.select_all(action='SELECT')
    bpy.ops.armature.delete()

    # Create Skeletal Hierarchy in Edit Mode
    # Hips
    b_hips = arm.edit_bones.new("Hips")
    b_hips.head = (0, 0, 0.95)
    b_hips.tail = (0, 0, 1.15)

    # Spine
    b_spine = arm.edit_bones.new("Spine")
    b_spine.head = (0, 0, 1.15)
    b_spine.tail = (0, 0, 1.35)
    b_spine.parent = b_hips

    # Chest
    b_chest = arm.edit_bones.new("Chest")
    b_chest.head = (0, 0, 1.35)
    b_chest.tail = (0, 0, 1.55)
    b_chest.parent = b_spine

    # Neck & Head
    b_neck = arm.edit_bones.new("Neck")
    b_neck.head = (0, 0, 1.55)
    b_neck.tail = (0, 0, 1.62)
    b_neck.parent = b_chest

    b_head = arm.edit_bones.new("Head")
    b_head.head = (0, 0, 1.62)
    b_head.tail = (0, 0, 1.95)
    b_head.parent = b_neck

    # Left Arm
    b_l_shoulder = arm.edit_bones.new("LeftShoulder")
    b_l_shoulder.head = (-0.08, 0, 1.5)
    b_l_shoulder.tail = (-0.22, 0, 1.48)
    b_l_shoulder.parent = b_chest

    b_l_arm = arm.edit_bones.new("LeftArm")
    b_l_arm.head = (-0.22, 0, 1.48)
    b_l_arm.tail = (-0.38, 0, 1.15)
    b_l_arm.parent = b_l_shoulder

    b_l_forearm = arm.edit_bones.new("LeftForeArm")
    b_l_forearm.head = (-0.38, 0, 1.15)
    b_l_forearm.tail = (-0.38, 0.15, 0.85)
    b_l_forearm.parent = b_l_arm

    b_l_hand = arm.edit_bones.new("LeftHand")
    b_l_hand.head = (-0.38, 0.15, 0.85)
    b_l_hand.tail = (-0.38, 0.22, 0.72)
    b_l_hand.parent = b_l_forearm

    # Right Arm
    b_r_shoulder = arm.edit_bones.new("RightShoulder")
    b_r_shoulder.head = (0.08, 0, 1.5)
    b_r_shoulder.tail = (0.22, 0, 1.48)
    b_r_shoulder.parent = b_chest

    b_r_arm = arm.edit_bones.new("RightArm")
    b_r_arm.head = (0.22, 0, 1.48)
    b_r_arm.tail = (0.38, 0, 1.15)
    b_r_arm.parent = b_r_shoulder

    b_r_forearm = arm.edit_bones.new("RightForeArm")
    b_r_forearm.head = (0.38, 0, 1.15)
    b_r_forearm.tail = (0.38, 0.15, 0.85)
    b_r_forearm.parent = b_r_arm

    b_r_hand = arm.edit_bones.new("RightHand")
    b_r_hand.head = (0.38, 0.15, 0.85)
    b_r_hand.tail = (0.38, 0.22, 0.72)
    b_r_hand.parent = b_r_forearm

    # Left Leg
    b_l_upleg = arm.edit_bones.new("LeftUpLeg")
    b_l_upleg.head = (-0.15, 0, 0.95)
    b_l_upleg.tail = (-0.15, 0, 0.5)
    b_l_upleg.parent = b_hips

    b_l_leg = arm.edit_bones.new("LeftLeg")
    b_l_leg.head = (-0.15, 0, 0.5)
    b_l_leg.tail = (-0.15, 0, 0.1)
    b_l_leg.parent = b_l_upleg

    b_l_foot = arm.edit_bones.new("LeftFoot")
    b_l_foot.head = (-0.15, 0, 0.1)
    b_l_foot.tail = (-0.15, 0.18, 0.02)
    b_l_foot.parent = b_l_leg

    # Right Leg
    b_r_upleg = arm.edit_bones.new("RightUpLeg")
    b_r_upleg.head = (0.15, 0, 0.95)
    b_r_upleg.tail = (0.15, 0, 0.5)
    b_r_upleg.parent = b_hips

    b_r_leg = arm.edit_bones.new("RightLeg")
    b_r_leg.head = (0.15, 0, 0.5)
    b_r_leg.tail = (0.15, 0, 0.1)
    b_r_leg.parent = b_r_upleg

    b_r_foot = arm.edit_bones.new("RightFoot")
    b_r_foot.head = (0.15, 0, 0.1)
    b_r_foot.tail = (0.15, 0.18, 0.02)
    b_r_foot.parent = b_r_leg

    bpy.ops.object.mode_set(mode='OBJECT')

    # Helper function to create mesh and parent to bone
    def create_body_part(name, primitive_func, bone_name, materials):
        primitive_func()
        obj = bpy.context.active_object
        obj.name = name
        for mat in materials:
            obj.data.materials.append(mat)
        
        # Add Subdivision & Smooth
        mod_sub = obj.modifiers.new("Subsurf", 'SUBSURF')
        mod_sub.levels = 1
        mod_sub.render_levels = 1
        bpy.ops.object.shade_smooth()

        # Create Vertex Group for Bone Rigging
        vg = obj.vertex_groups.new(name=bone_name)
        vg.add(list(range(len(obj.data.vertices))), 1.0, 'REPLACE')

        # Armature Modifier
        mod_arm = obj.modifiers.new("Armature", 'ARMATURE')
        mod_arm.object = arm_obj
        obj.parent = arm_obj

        return obj

    # 2. Model Detailed Sorcerer Body Meshes
    # Head & Hood (Deep Mystic Wizard Hood)
    def make_hood():
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.25, location=(0, -0.04, 1.7))
    create_body_part("SorcererHood", make_hood, "Head", [robe_dark])

    # Silver Beard & Face
    def make_beard():
        bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.18, depth=0.48, location=(0, 0.12, 1.5))
        obj = bpy.context.active_object
        obj.rotation_euler.x = math.radians(20)
    create_body_part("SorcererBeard", make_beard, "Head", [beard_mat])

    # Glowing Ice Eyes
    for x in [-0.07, 0.07]:
        def make_eye(px=x):
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.03, location=(px, 0.16, 1.72))
        create_body_part(f"IceEye_{x}", make_eye, "Head", [ice_glow])

    # Torso & Runic Chestplate
    def make_chest():
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.42))
        obj = bpy.context.active_object
        obj.scale = (0.5, 0.32, 0.4)
    create_body_part("SorcererChest", make_chest, "Chest", [robe_dark, robe_trim])

    # Runic Chest Brooch
    def make_brooch():
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.08, location=(0, 0.18, 1.45))
        obj = bpy.context.active_object
        obj.scale = (1.0, 0.4, 1.2)
    create_body_part("RuneBrooch", make_brooch, "Chest", [ice_glow])

    # Curved Crystal Pauldrons (Shoulders)
    for x, bname in [(-0.25, "LeftShoulder"), (0.25, "RightShoulder")]:
        def make_pauldron(px=x):
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.18, location=(px, 0, 1.52))
            obj = bpy.context.active_object
            obj.scale = (1.2, 0.9, 0.7)
            obj.rotation_euler.y = math.radians(-30 if px < 0 else 30)
        create_body_part(f"Pauldron_{bname}", make_pauldron, bname, [crystal_mat, robe_trim])

    # Flowing Wizard Cape (Back)
    def make_cape():
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.2, 1.15))
        obj = bpy.context.active_object
        obj.scale = (0.52, 0.04, 0.85)
        obj.rotation_euler.x = math.radians(12)
    create_body_part("MysticCape", make_cape, "Chest", [robe_dark, robe_trim])

    # Long Runic Robe Skirt (Lower Body)
    def make_robe_skirt():
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.48, depth=0.85, location=(0, 0, 0.58))
    create_body_part("RobeSkirt", make_robe_skirt, "Hips", [robe_dark, robe_trim, ice_glow])

    # Arms (Left & Right)
    create_body_part("LeftArmMesh", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.1, depth=0.45, location=(-0.3, 0, 1.32)), "LeftArm", [robe_dark])
    create_body_part("LeftForeArmMesh", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.08, depth=0.4, location=(-0.38, 0.08, 0.98)), "LeftForeArm", [robe_dark, leather_mat])

    create_body_part("RightArmMesh", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.1, depth=0.45, location=(0.3, 0, 1.32)), "RightArm", [robe_dark])
    create_body_part("RightForeArmMesh", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.08, depth=0.4, location=(0.38, 0.08, 0.98)), "RightForeArm", [robe_dark, leather_mat])

    # Legs & Leather Boots
    for x, bname in [(-0.15, "LeftFoot"), (0.15, "RightFoot")]:
        def make_boot(px=x):
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, 0.08, 0.08))
            obj = bpy.context.active_object
            obj.scale = (0.16, 0.32, 0.16)
        create_body_part(f"Boot_{bname}", make_boot, bname, [leather_mat])

    # Legendary Crystalline Staff in Right Hand
    def make_staff():
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.03, depth=1.9, location=(0.42, 0.25, 0.95))
        shaft = bpy.context.active_object
        shaft.data.materials.append(robe_trim)

        # Ice Crescent Headpiece
        bpy.ops.mesh.primitive_torus_add(major_radius=0.22, minor_radius=0.035, location=(0.42, 0.25, 1.82))
        crescent = bpy.context.active_object
        crescent.rotation_euler.x = math.radians(90)
        crescent.data.materials.append(crystal_mat)

        # Floating Glowing Frost Orb
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.12, location=(0.42, 0.25, 1.82))
        orb = bpy.context.active_object
        orb.data.materials.append(ice_glow)

        bpy.ops.object.select_all(action='DESELECT')
        shaft.select_set(True)
        crescent.select_set(True)
        orb.select_set(True)
        bpy.context.view_layer.objects.active = shaft
        bpy.ops.object.join()

    create_body_part("LegendaryStaff", make_staff, "RightHand", [])

    # 3. Create Skeletal Animations
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')
    pb = arm_obj.pose.bones

    # 3.1 IDLE ANIMATION (40 Frames, 30fps)
    idle_action = bpy.data.actions.new(name="Idle")
    arm_obj.animation_data_create()
    arm_obj.animation_data.action = idle_action

    for f in [0, 20, 40]:
        t = (f / 40.0) * math.pi * 2
        breath = math.sin(t)
        pb["Chest"].location = (0, 0, breath * 0.02)
        pb["Chest"].rotation_euler = (math.radians(breath * 1.5), 0, 0)
        pb["RightArm"].rotation_euler = (math.radians(breath * 2.0), 0, 0)
        pb["LeftArm"].rotation_euler = (math.radians(breath * -2.0), 0, 0)

        pb["Chest"].keyframe_insert(data_path="location", frame=f)
        pb["Chest"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["RightArm"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["LeftArm"].keyframe_insert(data_path="rotation_euler", frame=f)

    # 3.2 WALK ANIMATION (30 Frames, 30fps)
    walk_action = bpy.data.actions.new(name="Walk")
    arm_obj.animation_data.action = walk_action

    for f in range(0, 31, 5):
        phase = (f / 30.0) * math.pi * 2
        stride = math.sin(phase)
        bob = abs(math.sin(phase)) * 0.04
        twist = math.sin(phase) * 0.08

        pb["Hips"].location = (0, 0, bob)
        pb["Hips"].rotation_euler = (0, 0, twist)
        pb["Chest"].rotation_euler = (0, 0, -twist * 0.8)

        # Legs stride & knee flex
        pb["LeftUpLeg"].rotation_euler = (stride * 0.55, 0, 0)
        pb["RightUpLeg"].rotation_euler = (-stride * 0.55, 0, 0)
        pb["LeftLeg"].rotation_euler = (max(0, -stride) * 0.65, 0, 0)
        pb["RightLeg"].rotation_euler = (max(0, stride) * 0.65, 0, 0)

        # Arms opposition swing
        pb["LeftArm"].rotation_euler = (-stride * 0.45, 0, 0)
        pb["RightArm"].rotation_euler = (stride * 0.45, 0, 0)

        for bname in ["Hips", "Chest", "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg", "LeftArm", "RightArm"]:
            pb[bname].keyframe_insert(data_path="location", frame=f)
            pb[bname].keyframe_insert(data_path="rotation_euler", frame=f)

    # 3.3 RUN ANIMATION (18 Frames, 30fps)
    run_action = bpy.data.actions.new(name="Run")
    arm_obj.animation_data.action = run_action

    for f in range(0, 19, 3):
        phase = (f / 18.0) * math.pi * 2
        stride = math.sin(phase)
        bob = abs(math.sin(phase)) * 0.07

        pb["Hips"].location = (0, 0, bob)
        pb["Chest"].rotation_euler = (math.radians(15), 0, -stride * 0.12)

        pb["LeftUpLeg"].rotation_euler = (stride * 0.95, 0, 0)
        pb["RightUpLeg"].rotation_euler = (-stride * 0.95, 0, 0)
        pb["LeftLeg"].rotation_euler = (max(0, -stride) * 1.1, 0, 0)
        pb["RightLeg"].rotation_euler = (max(0, stride) * 1.1, 0, 0)

        pb["LeftArm"].rotation_euler = (-stride * 0.85, 0, 0)
        pb["RightArm"].rotation_euler = (stride * 0.85, 0, 0)

        for bname in ["Hips", "Chest", "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg", "LeftArm", "RightArm"]:
            pb[bname].keyframe_insert(data_path="location", frame=f)
            pb[bname].keyframe_insert(data_path="rotation_euler", frame=f)

    # 3.4 CAST ANIMATION (24 Frames, 30fps)
    cast_action = bpy.data.actions.new(name="Cast")
    arm_obj.animation_data.action = cast_action

    # Wind up (f=0..8) -> Release (f=12..16) -> Settle (f=24)
    key_frames = [0, 8, 14, 24]
    for f in key_frames:
        if f == 0:
            pb["Chest"].rotation_euler = (0, 0, 0)
            pb["RightArm"].rotation_euler = (0, 0, 0)
            pb["LeftArm"].rotation_euler = (0, 0, 0)
        elif f == 8:
            pb["Chest"].rotation_euler = (math.radians(-15), math.radians(-20), 0)
            pb["RightArm"].rotation_euler = (math.radians(80), math.radians(30), 0)
            pb["LeftArm"].rotation_euler = (math.radians(-30), 0, 0)
        elif f == 14:
            pb["Chest"].rotation_euler = (math.radians(20), math.radians(15), 0)
            pb["RightArm"].rotation_euler = (math.radians(-40), 0, 0)
            pb["LeftArm"].rotation_euler = (math.radians(70), 0, 0)
        elif f == 24:
            pb["Chest"].rotation_euler = (0, 0, 0)
            pb["RightArm"].rotation_euler = (0, 0, 0)
            pb["LeftArm"].rotation_euler = (0, 0, 0)

        pb["Chest"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["RightArm"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["LeftArm"].keyframe_insert(data_path="rotation_euler", frame=f)

    bpy.ops.object.mode_set(mode='OBJECT')

    # Push all actions to NLA Tracks so they are exported in GLTF
    for act in [idle_action, walk_action, run_action, cast_action]:
        track = arm_obj.animation_data.nla_tracks.new()
        track.name = act.name
        track.strips.new(act.name, 0, act)

    # 4. Export GLB with Full Armature & Embedded Animations
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format='GLB',
        export_animations=True,
        export_skins=True,
        export_nla_strips=True
    )
    print(f"🎉 Fully Rigged & Animated AAA Fantasy Sorcerer Exported: {OUTPUT_PATH}")

if __name__ == "__main__":
    create_rigged_fantasy_sorcerer()
