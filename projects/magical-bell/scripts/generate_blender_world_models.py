import bpy
import math
import os
import random

OUTPUT_DIR = r"c:\Users\황태민\Documents\antigravity\magical-bell\public\models"
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

def add_bevel(obj, width=0.04, segments=2):
    mod = obj.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = width
    mod.segments = segments

def export_glb(name):
    out_path = os.path.join(OUTPUT_DIR, f"{name}.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format='GLB')
    print(f"✅ Exported: {out_path}")

# ==============================================================================
# 1. AAA Hero Generator (Z-Up Standard Humanoid)
# ==============================================================================
def create_base_humanoid(root, skin_color=(0.95, 0.78, 0.65, 1.0), suit_color=(0.15, 0.2, 0.28, 1.0), armor_color=(0.7, 0.75, 0.82, 1.0), metalness=0.8):
    skin_mat = create_pbr_material("Skin", base_color=skin_color, roughness=0.4, metalness=0.0)
    suit_mat = create_pbr_material("Suit", base_color=suit_color, roughness=0.6, metalness=0.1)
    armor_mat = create_pbr_material("Armor", base_color=armor_color, roughness=0.25, metalness=metalness)

    # Head (Z = 1.62m)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.22, location=(0, 0, 1.62))
    head = bpy.context.active_object
    head.scale = (1.0, 1.05, 1.15)
    head.data.materials.append(skin_mat)
    head.parent = root

    # Torso (Chestplate, Z = 1.25m)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.25))
    chest = bpy.context.active_object
    chest.scale = (0.52, 0.32, 0.45)
    chest.data.materials.append(armor_mat)
    add_bevel(chest, width=0.03)
    chest.parent = root

    # Waist & Belt (Z = 0.95m)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.95))
    waist = bpy.context.active_object
    waist.scale = (0.42, 0.28, 0.2)
    waist.data.materials.append(suit_mat)
    waist.parent = root

    # Shoulders (Pauldrons, Z = 1.35m)
    for x in [-0.34, 0.34]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.15, depth=0.18, location=(x, 0, 1.35))
        p = bpy.context.active_object
        p.data.materials.append(armor_mat)
        add_bevel(p, width=0.02)
        p.parent = root

    # Arms (Z = 1.05m)
    for x in [-0.34, 0.34]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.08, depth=0.55, location=(x, 0, 1.05))
        arm = bpy.context.active_object
        arm.data.materials.append(suit_mat)
        arm.parent = root

        # Hand Gauntlets (Z = 0.72m)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0, 0.72))
        gaunt = bpy.context.active_object
        gaunt.scale = (0.12, 0.14, 0.18)
        gaunt.data.materials.append(armor_mat)
        gaunt.parent = root

    # Legs & Greaves (Z = 0.45m)
    for x in [-0.16, 0.16]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.1, depth=0.8, location=(x, 0, 0.45))
        leg = bpy.context.active_object
        leg.data.materials.append(armor_mat)
        leg.parent = root

        # Boots (Z = 0.06m)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0.05, 0.06))
        boot = bpy.context.active_object
        boot.scale = (0.16, 0.28, 0.12)
        boot.data.materials.append(suit_mat)
        boot.parent = root

    return armor_mat, suit_mat

# 1.1 Arthur (Frost Sorcerer)
def generate_hero_arthur():
    clear_scene()
    root = bpy.data.objects.new("HeroArthur", None)
    bpy.context.collection.objects.link(root)

    armor_mat, suit_mat = create_base_humanoid(root, suit_color=(0.06, 0.15, 0.28, 1.0), armor_color=(0.1, 0.4, 0.7, 1.0))
    glow_mat = create_pbr_material("FrostGlow", base_color=(0.3, 0.8, 1.0, 1.0), roughness=0.1, emissive=(0.2, 0.8, 1.0, 1.0), emissive_strength=3.0)

    # Wizard Hat
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.48, depth=0.04, location=(0, 0, 1.76))
    brim = bpy.context.active_object
    brim.data.materials.append(suit_mat)
    brim.parent = root

    bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.28, depth=0.6, location=(0, -0.05, 2.06))
    hat = bpy.context.active_object
    hat.rotation_euler.x = math.radians(10)
    hat.data.materials.append(suit_mat)
    hat.parent = root

    # Ice Crystal Staff
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.03, depth=1.6, location=(0.42, 0.15, 0.8))
    staff = bpy.context.active_object
    staff.data.materials.append(armor_mat)
    staff.parent = root

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.14, location=(0.42, 0.15, 1.62))
    staff_gem = bpy.context.active_object
    staff_gem.data.materials.append(glow_mat)
    staff_gem.parent = root

    export_glb("hero_arthur")

# 1.2 Raiden (Storm Walker)
def generate_hero_raiden():
    clear_scene()
    root = bpy.data.objects.new("HeroRaiden", None)
    bpy.context.collection.objects.link(root)

    armor_mat, suit_mat = create_base_humanoid(root, suit_color=(0.1, 0.1, 0.14, 1.0), armor_color=(0.85, 0.75, 0.2, 1.0), metalness=0.9)
    glow_mat = create_pbr_material("LightningGlow", base_color=(1.0, 0.9, 0.2, 1.0), roughness=0.1, emissive=(1.0, 0.9, 0.1, 1.0), emissive_strength=3.5)

    # Conical Ninja Kasa Hat (삿갓)
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.55, depth=0.22, location=(0, 0, 1.8))
    hat = bpy.context.active_object
    hat.data.materials.append(suit_mat)
    hat.parent = root

    # Lightning Katana Blade
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.42, 0.25, 0.75))
    blade = bpy.context.active_object
    blade.scale = (0.02, 0.06, 1.1)
    blade.rotation_euler.y = math.radians(25)
    blade.data.materials.append(glow_mat)
    blade.parent = root

    export_glb("hero_raiden")

# 1.3 Ignis (Pyromancer)
def generate_hero_ignis():
    clear_scene()
    root = bpy.data.objects.new("HeroIgnis", None)
    bpy.context.collection.objects.link(root)

    armor_mat, suit_mat = create_base_humanoid(root, suit_color=(0.2, 0.05, 0.05, 1.0), armor_color=(0.35, 0.12, 0.08, 1.0), metalness=0.6)
    glow_mat = create_pbr_material("FireGlow", base_color=(1.0, 0.3, 0.0, 1.0), roughness=0.1, emissive=(1.0, 0.25, 0.0, 1.0), emissive_strength=3.5)

    # Horned Heavy Helm
    for x in [-0.22, 0.22]:
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.06, depth=0.35, location=(x, 0, 1.85))
        horn = bpy.context.active_object
        horn.rotation_euler.y = math.radians(-30 if x > 0 else 30)
        horn.data.materials.append(glow_mat)
        horn.parent = root

    # Flaming Greatsword
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.45, 0.2, 0.8))
    sword = bpy.context.active_object
    sword.scale = (0.04, 0.14, 1.3)
    sword.data.materials.append(glow_mat)
    sword.parent = root

    export_glb("hero_ignis")

# 1.4 Lumina (Arcane Sage)
def generate_hero_lumina():
    clear_scene()
    root = bpy.data.objects.new("HeroLumina", None)
    bpy.context.collection.objects.link(root)

    armor_mat, suit_mat = create_base_humanoid(root, suit_color=(0.9, 0.92, 0.96, 1.0), armor_color=(1.0, 0.84, 0.3, 1.0), metalness=0.9)
    glow_mat = create_pbr_material("SunGlow", base_color=(1.0, 0.95, 0.4, 1.0), roughness=0.1, emissive=(1.0, 0.95, 0.3, 1.0), emissive_strength=3.0)

    # Winged Circlet
    bpy.ops.mesh.primitive_torus_add(major_radius=0.24, minor_radius=0.02, location=(0, 0, 1.7))
    circlet = bpy.context.active_object
    circlet.data.materials.append(armor_mat)
    circlet.parent = root

    # Floating Arcane Orb
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.18, location=(0.42, 0.25, 1.3))
    orb = bpy.context.active_object
    orb.data.materials.append(glow_mat)
    orb.parent = root

    export_glb("hero_lumina")

# 1.5 Tesla (Trap Master)
def generate_hero_tesla():
    clear_scene()
    root = bpy.data.objects.new("HeroTesla", None)
    bpy.context.collection.objects.link(root)

    armor_mat, suit_mat = create_base_humanoid(root, suit_color=(0.2, 0.18, 0.15, 1.0), armor_color=(0.75, 0.5, 0.2, 1.0), metalness=0.85)

    # Steampunk Goggles
    for x in [-0.09, 0.09]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.07, depth=0.08, location=(x, 0.22, 1.66))
        goggle = bpy.context.active_object
        goggle.rotation_euler.x = math.radians(90)
        goggle.data.materials.append(armor_mat)
        goggle.parent = root

    # Mechanical Backpack
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.22, 1.25))
    pack = bpy.context.active_object
    pack.scale = (0.42, 0.22, 0.5)
    pack.data.materials.append(armor_mat)
    pack.parent = root

    export_glb("hero_tesla")

# 1.6 Boreas (Glacial Knight)
def generate_hero_boreas():
    clear_scene()
    root = bpy.data.objects.new("HeroBoreas", None)
    bpy.context.collection.objects.link(root)

    armor_mat, suit_mat = create_base_humanoid(root, suit_color=(0.1, 0.2, 0.3, 1.0), armor_color=(0.6, 0.8, 0.95, 1.0), metalness=0.9)
    glow_mat = create_pbr_material("FrostShieldGlow", base_color=(0.2, 0.7, 1.0, 1.0), roughness=0.1, emissive=(0.1, 0.6, 1.0, 1.0), emissive_strength=2.0)

    # Tower Shield (거대 방패)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.42, 0.25, 0.85))
    shield = bpy.context.active_object
    shield.scale = (0.08, 0.55, 1.1)
    shield.data.materials.append(armor_mat)
    add_bevel(shield, width=0.03)
    shield.parent = root

    # Glacial Mace Flail
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.04, depth=0.8, location=(0.42, 0.15, 0.75))
    mace = bpy.context.active_object
    mace.data.materials.append(armor_mat)
    mace.parent = root
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.16, location=(0.42, 0.15, 1.2))
    mace_head = bpy.context.active_object
    mace_head.data.materials.append(glow_mat)
    mace_head.parent = root

    export_glb("hero_boreas")

# 1.7 Sera (Tempest Witch)
def generate_hero_sera():
    clear_scene()
    root = bpy.data.objects.new("HeroSera", None)
    bpy.context.collection.objects.link(root)

    armor_mat, suit_mat = create_base_humanoid(root, suit_color=(0.15, 0.35, 0.3, 1.0), armor_color=(0.2, 0.6, 0.5, 1.0), metalness=0.3)
    glow_mat = create_pbr_material("WindGlow", base_color=(0.3, 1.0, 0.7, 1.0), roughness=0.1, emissive=(0.2, 0.9, 0.6, 1.0), emissive_strength=3.0)

    # Tempest Wand
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.02, depth=0.9, location=(0.38, 0.15, 0.8))
    wand = bpy.context.active_object
    wand.data.materials.append(armor_mat)
    wand.parent = root
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.1, depth=0.3, location=(0.38, 0.15, 1.3))
    tip = bpy.context.active_object
    tip.data.materials.append(glow_mat)
    tip.parent = root

    export_glb("hero_sera")

# ==============================================================================
# 2. AAA NPCs (3 Village NPCs, Z-Up)
# ==============================================================================
def generate_npc_elder():
    clear_scene()
    root = bpy.data.objects.new("NPCElder", None)
    bpy.context.collection.objects.link(root)

    robe_mat = create_pbr_material("ElderRobe", base_color=(0.85, 0.75, 0.3, 1.0), roughness=0.6)
    beard_mat = create_pbr_material("ElderBeard", base_color=(0.95, 0.95, 0.95, 1.0), roughness=0.8)
    skin_mat = create_pbr_material("ElderSkin", base_color=(0.92, 0.74, 0.62, 1.0), roughness=0.5)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.22, location=(0, 0, 1.62))
    head = bpy.context.active_object
    head.data.materials.append(skin_mat)
    head.parent = root

    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.18, depth=0.45, location=(0, 0.12, 1.38))
    beard = bpy.context.active_object
    beard.rotation_euler.x = math.radians(15)
    beard.data.materials.append(beard_mat)
    beard.parent = root

    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.45, depth=1.35, location=(0, 0, 0.7))
    robe = bpy.context.active_object
    robe.data.materials.append(robe_mat)
    robe.parent = root

    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.035, depth=1.7, location=(0.42, 0.1, 0.85))
    staff = bpy.context.active_object
    staff.data.materials.append(beard_mat)
    staff.parent = root

    export_glb("npc_elder")

def generate_npc_blacksmith():
    clear_scene()
    root = bpy.data.objects.new("NPCBlacksmith", None)
    bpy.context.collection.objects.link(root)

    leather_mat = create_pbr_material("ApronLeather", base_color=(0.3, 0.18, 0.1, 1.0), roughness=0.7)
    steel_mat = create_pbr_material("SteelHammer", base_color=(0.4, 0.45, 0.5, 1.0), roughness=0.25, metalness=0.9)
    skin_mat = create_pbr_material("ForgeSkin", base_color=(0.88, 0.68, 0.55, 1.0), roughness=0.4)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.25))
    chest = bpy.context.active_object
    chest.scale = (0.6, 0.38, 0.5)
    chest.data.materials.append(skin_mat)
    chest.parent = root

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.08, 0.95))
    apron = bpy.context.active_object
    apron.scale = (0.5, 0.1, 0.7)
    apron.data.materials.append(leather_mat)
    apron.parent = root

    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.04, depth=1.2, location=(0.45, 0, 0.6))
    handle = bpy.context.active_object
    handle.data.materials.append(leather_mat)
    handle.parent = root

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.45, 0, 1.1))
    head = bpy.context.active_object
    head.scale = (0.22, 0.35, 0.22)
    head.data.materials.append(steel_mat)
    head.parent = root

    export_glb("npc_blacksmith")

def generate_npc_alchemist():
    clear_scene()
    root = bpy.data.objects.new("NPCAlchemist", None)
    bpy.context.collection.objects.link(root)

    robe_mat = create_pbr_material("AlchRobe", base_color=(0.55, 0.15, 0.65, 1.0), roughness=0.5)
    potion_mat = create_pbr_material("PotionGlow", base_color=(0.2, 1.0, 0.4, 1.0), roughness=0.1, emissive=(0.2, 1.0, 0.4, 1.0), emissive_strength=3.0)

    bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.48, depth=1.35, location=(0, 0, 0.7))
    robe = bpy.context.active_object
    robe.data.materials.append(robe_mat)
    robe.parent = root

    for x in [-0.22, 0, 0.22]:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.08, location=(x, 0.24, 0.92))
        flask = bpy.context.active_object
        flask.data.materials.append(potion_mat)
        flask.parent = root

    export_glb("npc_alchemist")

# ==============================================================================
# 3. Medieval Village Houses (Z-Up)
# ==============================================================================
def generate_medieval_houses():
    clear_scene()
    root = bpy.data.objects.new("MedievalHousePack", None)
    bpy.context.collection.objects.link(root)

    wall_mat = create_pbr_material("PlasterWall", base_color=(0.88, 0.85, 0.8, 1.0), roughness=0.65)
    wood_mat = create_pbr_material("TimberBeam", base_color=(0.28, 0.16, 0.08, 1.0), roughness=0.7)
    roof_mat = create_pbr_material("TileRoof", base_color=(0.65, 0.22, 0.15, 1.0), roughness=0.55)

    # 2-Story Medieval House
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 2.5))
    house = bpy.context.active_object
    house.scale = (8.0, 7.0, 5.0)
    house.data.materials.append(wall_mat)
    house.parent = root

    # Gable Roof
    bpy.ops.mesh.primitive_cylinder_add(vertices=3, radius=4.8, depth=7.4, location=(0, 0, 6.8))
    roof = bpy.context.active_object
    roof.rotation_euler = (math.radians(90), 0, 0)
    roof.scale = (1.0, 0.65, 1.0)
    roof.data.materials.append(roof_mat)
    roof.parent = root

    export_glb("medieval_houses")

if __name__ == "__main__":
    print("🚀 Re-generating Perfect Z-Up AAA Heroes, NPCs, Village in Blender 4.2...")
    generate_hero_arthur()
    generate_hero_raiden()
    generate_hero_ignis()
    generate_hero_lumina()
    generate_hero_tesla()
    generate_hero_boreas()
    generate_hero_sera()

    generate_npc_elder()
    generate_npc_blacksmith()
    generate_npc_alchemist()

    generate_medieval_houses()
    print("🎉 All 11 High-End AAA 3D Models Successfully Re-Generated in Blender!")
