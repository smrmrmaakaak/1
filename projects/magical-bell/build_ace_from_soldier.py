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

def build_ace_hero():
    print("🔥 [Blender 4.2] Upgrading High-Poly Base into AAA Portgas D. Ace...")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath("public/models/Soldier.glb"))

    # Find character mesh & armature
    armature = None
    vanguard_mesh = None
    for obj in bpy.data.objects:
        if obj.type == 'ARMATURE':
            armature = obj
        elif obj.name == 'vanguard_Mesh':
            vanguard_mesh = obj
        elif obj.name == 'vanguard_visor':
            # Hide or remove visor
            bpy.data.objects.remove(obj, do_unlink=True)

    # Materials
    mat_skin = create_pbr_material("AceSkin", (0.94, 0.74, 0.62, 1.0), roughness=0.35, specular=0.6)
    mat_hat = create_pbr_material("AceHatOrange", (0.90, 0.35, 0.03, 1.0), roughness=0.4, specular=0.5)
    mat_hat_band = create_pbr_material("AceHatBand", (0.08, 0.08, 0.08, 1.0), roughness=0.25)
    mat_bead_red = create_pbr_material("AceBeadRed", (0.90, 0.04, 0.04, 1.0), roughness=0.15, specular=0.95)
    mat_badge_cyan = create_pbr_material("AceBadgeCyan", (0.0, 0.85, 0.95, 1.0), roughness=0.2, specular=0.9, emissive=(0.0, 0.4, 0.5, 1.0), emissive_strength=0.5)
    mat_badge_red = create_pbr_material("AceBadgeRed", (0.95, 0.12, 0.12, 1.0), roughness=0.2, specular=0.9, emissive=(0.5, 0.05, 0.05, 1.0), emissive_strength=0.5)
    mat_hair = create_pbr_material("AceHair", (0.04, 0.04, 0.05, 1.0), roughness=0.2, specular=0.8)
    mat_leather = create_pbr_material("AceLeather", (0.32, 0.16, 0.07, 1.0), roughness=0.4)
    mat_gold = create_pbr_material("AceGold", (0.95, 0.78, 0.20, 1.0), roughness=0.18, metallic=0.9)

    # Apply heroic material to Vanguard body
    if vanguard_mesh:
        vanguard_mesh.data.materials.clear()
        vanguard_mesh.data.materials.append(mat_skin)

    # Let's add sculpted Ace Cowboy Hat and Beaded Necklace to the Armature's Head bone!
    head_bone = armature.data.bones.get('mixamorig:Head')
    head_world_pos = (0, 0, 1.70)
    
    # Create Hat
    bpy.ops.mesh.primitive_cylinder_add(location=(0, -0.05, 1.82), rotation=(-0.05, 0, 0))
    hat_brim = bpy.context.active_object
    hat_brim.name = "Ace_Hat_Brim"
    hat_brim.scale = (0.36, 0.38, 0.015)
    hat_brim.data.materials.append(mat_hat)
    bpy.ops.object.shade_smooth()

    bpy.ops.mesh.primitive_cylinder_add(location=(0, -0.04, 1.90), rotation=(-0.05, 0, 0))
    hat_crown = bpy.context.active_object
    hat_crown.name = "Ace_Hat_Crown"
    hat_crown.scale = (0.19, 0.21, 0.14)
    hat_crown.data.materials.append(mat_hat)
    bpy.ops.object.shade_smooth()

    bpy.ops.mesh.primitive_cylinder_add(location=(0, -0.04, 1.84), rotation=(-0.05, 0, 0))
    hat_band = bpy.context.active_object
    hat_band.name = "Ace_Hat_Band"
    hat_band.scale = (0.195, 0.215, 0.035)
    hat_band.data.materials.append(mat_hat_band)
    bpy.ops.object.shade_smooth()

    # Smile / Frown Badges
    bpy.ops.mesh.primitive_uv_sphere_add(location=(-0.09, -0.24, 1.84))
    badge_s = bpy.context.active_object
    badge_s.name = "Badge_Smile"
    badge_s.scale = (0.028, 0.015, 0.028)
    badge_s.data.materials.append(mat_badge_cyan)
    bpy.ops.object.shade_smooth()

    bpy.ops.mesh.primitive_uv_sphere_add(location=(0.09, -0.24, 1.84))
    badge_f = bpy.context.active_object
    badge_f.name = "Badge_Frown"
    badge_f.scale = (0.028, 0.015, 0.028)
    badge_f.data.materials.append(mat_badge_red)
    bpy.ops.object.shade_smooth()

    # Red Beaded Necklace
    neck_beads = []
    for ni in range(16):
        n_angle = (ni / 16) * math.pi * 2
        nx = math.cos(n_angle) * 0.16
        ny = math.sin(n_angle) * 0.14 - 0.02
        nz = 1.48 + (-0.03 if math.sin(n_angle) < 0 else 0.03)
        bpy.ops.mesh.primitive_uv_sphere_add(location=(nx, ny, nz))
        bead = bpy.context.active_object
        bead.name = f"NeckBead_{ni}"
        bead.scale = (0.025, 0.025, 0.025)
        bead.data.materials.append(mat_bead_red)
        bpy.ops.object.shade_smooth()
        neck_beads.append(bead)

    # Join accessories
    acc_list = [hat_brim, hat_crown, hat_band, badge_s, badge_f] + neck_beads
    bpy.ops.object.select_all(action='DESELECT')
    for a in acc_list:
        a.select_set(True)
    bpy.context.view_layer.objects.active = acc_list[0]
    bpy.ops.object.join()
    
    accessories = bpy.context.active_object
    accessories.name = "Ace_Accessories"

    # Parent accessories to Armature with bone weight / automatic weights
    armature.select_set(True)
    accessories.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')

    # Export to public/models/hero_ace_soldier.glb
    output_path = os.path.abspath("public/models/hero_ace_soldier.glb")
    print(f"📦 Exporting AAA Ace Soldier GLB to: {output_path}")

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

    print("🎉 [SUCCESS] Exported high-poly AAA Ace to hero_ace_soldier.glb!")

build_ace_hero()
