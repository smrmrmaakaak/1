import bpy
import bmesh
import math
from mathutils import Vector, Euler, Matrix
import os

print("=== STARTING AUTHENTIC MASTERPIECE ROYAL DOULTON 'PAST GLORY' 3D GENERATION ===")

# 1. Reset Scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# 2. Porcelain Enamel Glaze PBR Material Generator
def create_porcelain_material(name, base_color, roughness=0.04, metallic=0.0, coat_weight=1.0, coat_roughness=0.02):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_out.location = (300, 0)
    
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)
    
    def set_input(k, val):
        if k in node_bsdf.inputs:
            node_bsdf.inputs[k].default_value = val

    rgba = (*base_color[:3], 1.0) if len(base_color) == 3 else base_color
    set_input('Base Color', rgba)
    set_input('Roughness', roughness)
    set_input('Metallic', metallic)
    set_input('IOR', 1.52)
    set_input('Coat Weight', coat_weight)
    set_input('Coat Roughness', coat_roughness)
    set_input('Coat IOR', 1.52)
    
    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

# Materials Palette
mat_scarlet_coat = create_porcelain_material("Mat_ScarletCoat", (0.75, 0.03, 0.02), roughness=0.04, coat_weight=1.0)
mat_gloss_black = create_porcelain_material("Mat_GlossBlack", (0.012, 0.012, 0.015), roughness=0.03, coat_weight=1.0)
mat_trousers_black = create_porcelain_material("Mat_TrousersBlack", (0.022, 0.022, 0.028), roughness=0.08, coat_weight=0.8)
mat_flesh_skin = create_porcelain_material("Mat_FleshSkin", (0.86, 0.58, 0.46), roughness=0.08, coat_weight=0.8)
mat_vintage_brass = create_porcelain_material("Mat_VintageBrass", (0.88, 0.70, 0.28), roughness=0.08, metallic=0.92, coat_weight=0.9)
mat_gold_button = create_porcelain_material("Mat_GoldButton", (0.95, 0.80, 0.22), roughness=0.03, metallic=0.95, coat_weight=1.0)
mat_trunk_wood = create_porcelain_material("Mat_TrunkWood", (0.26, 0.11, 0.04), roughness=0.14, coat_weight=0.6)
mat_trunk_slate = create_porcelain_material("Mat_TrunkSlate", (0.16, 0.20, 0.26), roughness=0.14, coat_weight=0.6)
mat_medal_cyan = create_porcelain_material("Mat_MedalCyan", (0.15, 0.58, 0.82), roughness=0.06, coat_weight=0.9)
mat_medal_green = create_porcelain_material("Mat_MedalGreen", (0.12, 0.58, 0.26), roughness=0.06, coat_weight=0.9)
mat_medal_red = create_porcelain_material("Mat_MedalRed", (0.78, 0.08, 0.16), roughness=0.06, coat_weight=0.9)
mat_medal_silver = create_porcelain_material("Mat_MedalSilver", (0.84, 0.84, 0.86), roughness=0.08, metallic=0.90, coat_weight=0.9)
mat_white_trim = create_porcelain_material("Mat_WhiteTrim", (0.95, 0.94, 0.92), roughness=0.06, coat_weight=0.9)
mat_hair_grey = create_porcelain_material("Mat_HairGrey", (0.35, 0.35, 0.35), roughness=0.14, coat_weight=0.6)
mat_eye_dark = create_porcelain_material("Mat_EyeDark", (0.04, 0.03, 0.02), roughness=0.02, coat_weight=1.0)

col_model = bpy.data.collections.new("RoyalDoulton_PastGlory")
scene.collection.children.link(col_model)

def make_mesh_obj(name, create_bm_fn, mat=None, smooth=True, subsurf=0):
    bm = bmesh.new()
    create_bm_fn(bm)
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()
    
    if smooth:
        for p in mesh.polygons:
            p.use_smooth = True
            
    obj = bpy.data.objects.new(name, mesh)
    col_model.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
        
    if subsurf > 0:
        mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = subsurf
        mod.render_levels = subsurf
        
    return obj

# -------------------------------------------------------------
# 3. HIGH-PRECISION GEOMETRY BUILDER (Front = -Y)
# -------------------------------------------------------------

# 1. TRUNK BODY
def build_trunk(bm):
    res = bmesh.ops.create_cube(bm, size=1.0)
    for v in res['verts']:
        v.co.x *= 0.114
        v.co.y *= 0.088
        v.co.z *= 0.056
        v.co.z += 0.030
    bmesh.ops.bevel(bm, geom=bm.edges[:]+bm.verts[:], offset=0.0035, segments=2)

make_mesh_obj("Trunk_Body", build_trunk, mat_trunk_wood)

# 2. TRUNK SLATE IRON TRIM
def build_trunk_trim(bm):
    r_bot = bmesh.ops.create_cube(bm, size=1.0)
    for v in r_bot['verts']:
        v.co.x *= 0.118
        v.co.y *= 0.092
        v.co.z *= 0.006
        v.co.z += 0.003

    r_top = bmesh.ops.create_cube(bm, size=1.0)
    for v in r_top['verts']:
        v.co.x *= 0.116
        v.co.y *= 0.090
        v.co.z *= 0.005
        v.co.z += 0.057

    for cx in [-0.056, 0.056]:
        for cy in [-0.043, 0.043]:
            r_col = bmesh.ops.create_cube(bm, size=1.0)
            for v in r_col['verts']:
                v.co.x = v.co.x * 0.007 + cx
                v.co.y = v.co.y * 0.007 + cy
                v.co.z = v.co.z * 0.056 + 0.030

make_mesh_obj("Trunk_SlateTrim", build_trunk_trim, mat_trunk_slate)

# 3. TRUNK BRASS HARDWARE
def build_trunk_hardware(bm):
    for side in [-1, 1]:
        r_h = bmesh.ops.create_cube(bm, size=1.0)
        for v in r_h['verts']:
            v.co.x = v.co.x * 0.003 + side * 0.059
            v.co.y = v.co.y * 0.016
            v.co.z = v.co.z * 0.010 + 0.032
    r_l = bmesh.ops.create_cube(bm, size=1.0)
    for v in r_l['verts']:
        v.co.x *= 0.014
        v.co.y = v.co.y * 0.003 + 0.045
        v.co.z = v.co.z * 0.015 + 0.040

make_mesh_obj("Trunk_BrassHardware", build_trunk_hardware, mat_vintage_brass)

# 4. BOOTS
def build_boots(bm):
    for leg in [-0.024, 0.024]:
        r_f = bmesh.ops.create_cube(bm, size=1.0)
        for v in r_f['verts']:
            v.co.x = v.co.x * 0.016 + leg
            v.co.y = v.co.y * 0.030 - 0.054
            v.co.z = v.co.z * 0.010 + 0.005
        r_a = bmesh.ops.create_cube(bm, size=1.0)
        for v in r_a['verts']:
            v.co.x = v.co.x * 0.015 + leg
            v.co.y = v.co.y * 0.016 - 0.045
            v.co.z = v.co.z * 0.016 + 0.010
    bmesh.ops.bevel(bm, geom=bm.edges[:]+bm.verts[:], offset=0.0025, segments=2)

make_mesh_obj("Figure_Boots", build_boots, mat_gloss_black)

# 5. TROUSERS / SEATED LEGS
def build_trousers(bm):
    for leg in [-0.024, 0.024]:
        r_s = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.015, radius2=0.014, depth=0.048)
        for v in r_s['verts']:
            v.co.x += leg
            v.co.y -= 0.044
            v.co.z += 0.034
        r_t = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.018, radius2=0.016, depth=0.046)
        for v in r_t['verts']:
            y_old = v.co.y
            z_old = v.co.z
            v.co.y = z_old - 0.022
            v.co.z = y_old * 0.2 + 0.058
            v.co.x += leg

make_mesh_obj("Figure_Trousers", build_trousers, mat_trousers_black)

# 6. UNIFIED SCARLET OVERCOAT & TUNIC
def build_coat(bm):
    # Continuous Quad-Loft Torso from Neck to Flared Skirt Base
    rings = [
        # (z, radius_x, radius_y, y_offset)
        (0.122, 0.016, 0.015, -0.002), # Neckline
        (0.114, 0.035, 0.022, -0.002), # Shoulders / High Chest
        (0.100, 0.033, 0.024, -0.004), # Mid Chest
        (0.082, 0.031, 0.023, -0.005), # Waist
        (0.066, 0.039, 0.029, -0.006), # Hips
        (0.056, 0.046, 0.036, -0.008)  # Skirt Hem resting on Trunk
    ]
    
    num_seg = 20
    prev_verts = None
    for z_pos, rx, ry, y_off in rings:
        cur_verts = []
        for i in range(num_seg):
            th = 2.0 * math.pi * i / num_seg
            x = math.cos(th) * rx
            y = math.sin(th) * ry + y_off
            v = bm.verts.new((x, y, z_pos))
            cur_verts.append(v)
        if prev_verts:
            for i in range(num_seg):
                i_next = (i + 1) % num_seg
                bm.faces.new([prev_verts[i], prev_verts[i_next], cur_verts[i_next], cur_verts[i]])
        prev_verts = cur_verts

    # Cap bottom ring
    bm.faces.new(prev_verts)

make_mesh_obj("Figure_ScarletCoat", build_coat, mat_scarlet_coat, subsurf=2)

# 7. ARMS & SLEEVES
def build_arms(bm):
    r_la = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.012, radius2=0.010, depth=0.042)
    for v in r_la['verts']:
        x, y, z = v.co.x, v.co.y, v.co.z
        v.co.x = x * 0.8 - z * 0.5 - 0.024
        v.co.y = y - 0.016
        v.co.z = z * 0.8 + x * 0.5 + 0.104

    r_ra = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.012, radius2=0.010, depth=0.042)
    for v in r_ra['verts']:
        x, y, z = v.co.x, v.co.y, v.co.z
        v.co.x = x * 0.8 + z * 0.5 + 0.024
        v.co.y = y - 0.016
        v.co.z = z * 0.8 - x * 0.5 + 0.104

make_mesh_obj("Figure_Arms", build_arms, mat_scarlet_coat, subsurf=1)

# 8. BLACK MANDARIN COLLAR & GAUNTLET CUFFS
def build_collar_cuffs(bm):
    r_c = bmesh.ops.create_cone(bm, cap_ends=False, segments=20, radius1=0.016, radius2=0.015, depth=0.007)
    for v in r_c['verts']:
        v.co.z += 0.125
        v.co.y -= 0.002
    r_lc = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.012, radius2=0.011, depth=0.014)
    for v in r_lc['verts']:
        v.co.x -= 0.014
        v.co.y -= 0.032
        v.co.z += 0.096
    r_rc = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.012, radius2=0.011, depth=0.014)
    for v in r_rc['verts']:
        v.co.x += 0.014
        v.co.y -= 0.032
        v.co.z += 0.100

make_mesh_obj("Figure_CollarCuffs", build_collar_cuffs, mat_gloss_black)

# 9. GOLD BUTTONS
def build_gold_buttons(bm):
    for r in range(5):
        z_pos = 0.074 + r * 0.009
        y_pos = -0.021 - r * 0.002
        for col in [-0.006, 0.006]:
            r_b = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.0018)
            for v in r_b['verts']:
                v.co.x += col
                v.co.y += y_pos
                v.co.z += z_pos
    for side, sign in [("L", -1), ("R", 1)]:
        for b in range(2):
            r_cb = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.0020)
            for v in r_cb['verts']:
                v.co.x += sign * 0.020
                v.co.y += -0.034 - b * 0.004
                v.co.z += 0.096 + (0.004 if sign > 0 else 0.0)

make_mesh_obj("Figure_GoldButtons", build_gold_buttons, mat_gold_button)

# 10. WHITE CHEVRON STRIPE
def build_chevron(bm):
    r_ch = bmesh.ops.create_cube(bm, size=1.0)
    for v in r_ch['verts']:
        v.co.x = v.co.x * 0.003 - 0.032
        v.co.y = v.co.y * 0.012 - 0.005
        v.co.z = v.co.z * 0.008 + 0.112

make_mesh_obj("Figure_Chevron", build_chevron, mat_white_trim)

# 11. CHEST MEDALS
for r_name, x_off, r_mat in [("Medal_Cyan", -0.015, mat_medal_cyan), ("Medal_Green", -0.010, mat_medal_green), ("Medal_Red", -0.005, mat_medal_red)]:
    def make_ribbon(bm, x=x_off):
        r_rib = bmesh.ops.create_cube(bm, size=1.0)
        for v in r_rib['verts']:
            v.co.x = v.co.x * 0.0030 + x
            v.co.y = v.co.y * 0.0025 - 0.023
            v.co.z = v.co.z * 0.006 + 0.114
    make_mesh_obj(r_name, make_ribbon, r_mat)

def build_medal_discs(bm):
    for x_off in [-0.015, -0.010, -0.005]:
        r_md = bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.0024, radius2=0.0024, depth=0.0010)
        for v in r_md['verts']:
            y, z = v.co.y, v.co.z
            v.co.y = z - 0.024
            v.co.z = y + 0.108
            v.co.x += x_off

make_mesh_obj("Figure_MedalDiscs", build_medal_discs, mat_medal_silver)

# 12. SCULPTED HEAD & FACE
def build_head(bm):
    r_n = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.013, radius2=0.012, depth=0.010)
    for v in r_n['verts']:
        v.co.z += 0.128
        v.co.y -= 0.002
    r_h = bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=14, radius=0.015)
    for v in r_h['verts']:
        v.co.x *= 0.94
        v.co.y = v.co.y * 1.02 - 0.004
        v.co.z = v.co.z * 1.08 + 0.140
    r_nose = bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.0030, radius2=0.001, depth=0.006)
    for v in r_nose['verts']:
        y, z = v.co.y, v.co.z
        v.co.y = z - 0.019
        v.co.z = y + 0.138
    for side in [-1, 1]:
        r_chk = bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=8, radius=0.004)
        for v in r_chk['verts']:
            v.co.x = v.co.x * 0.8 + side * 0.008
            v.co.y = v.co.y * 0.6 - 0.015
            v.co.z = v.co.z * 0.8 + 0.136

make_mesh_obj("Figure_HeadFace", build_head, mat_flesh_skin, subsurf=1)

def build_eyes(bm):
    for side in [-1, 1]:
        r_e = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=0.0018)
        for v in r_e['verts']:
            v.co.x = v.co.x + side * 0.006
            v.co.y = v.co.y * 0.4 - 0.017
            v.co.z = v.co.z * 0.6 + 0.141

make_mesh_obj("Figure_Eyes", build_eyes, mat_eye_dark)

# 13. MUSTACHE & SIDEBURNS
def build_hair_mustache(bm):
    for side, sign in [("L", -1), ("R", 1)]:
        r_m = bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.0028, radius2=0.0010, depth=0.010)
        for v in r_m['verts']:
            x, y, z = v.co.x, v.co.y, v.co.z
            v.co.x = z * sign + sign * 0.005
            v.co.z = -x * 0.3 + 0.133
            v.co.y = y - 0.017
    for side in [-1, 1]:
        r_sb = bmesh.ops.create_cube(bm, size=1.0)
        for v in r_sb['verts']:
            v.co.x = v.co.x * 0.003 + side * 0.014
            v.co.y = v.co.y * 0.006 - 0.002
            v.co.z = v.co.z * 0.010 + 0.138

make_mesh_obj("Figure_HairMustache", build_hair_mustache, mat_hair_grey)

# 14. MILITARY PEAKED CAP & GOLD BADGE
def build_cap(bm):
    r_cc = bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=0.017, radius2=0.018, depth=0.014)
    for v in r_cc['verts']:
        v.co.y -= 0.003
        v.co.z += 0.152
    r_vp = bmesh.ops.create_cube(bm, size=1.0)
    for v in r_vp['verts']:
        v.co.x *= 0.022
        v.co.y = v.co.y * 0.010 - 0.015
        v.co.z = v.co.z * 0.003 + 0.147

make_mesh_obj("Figure_MilitaryCap", build_cap, mat_gloss_black)

def build_cap_gold(bm):
    r_gb = bmesh.ops.create_cone(bm, cap_ends=False, segments=24, radius1=0.0175, radius2=0.0175, depth=0.0025)
    for v in r_gb['verts']:
        v.co.y -= 0.003
        v.co.z += 0.148
    r_rh = bmesh.ops.create_cube(bm, size=1.0)
    for v in r_rh['verts']:
        v.co.x *= 0.006
        v.co.y = v.co.y * 0.002 - 0.016
        v.co.z = v.co.z * 0.005 + 0.154

make_mesh_obj("Figure_CapGoldTrim", build_cap_gold, mat_gold_button)

# 15. HANDS & BRASS BUGLE HORN
def build_hands(bm):
    r_lh = bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=0.007)
    for v in r_lh['verts']:
        v.co.x = v.co.x * 1.1 - 0.006
        v.co.y = v.co.y * 0.8 - 0.036
        v.co.z = v.co.z * 0.7 + 0.094
    r_rh = bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=0.007)
    for v in r_rh['verts']:
        v.co.x = v.co.x * 1.1 + 0.006
        v.co.y = v.co.y * 0.8 - 0.036
        v.co.z = v.co.z * 0.7 + 0.102

make_mesh_obj("Figure_Hands", build_hands, mat_flesh_skin)

def build_bugle_horn(bm):
    r_b = bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=0.014, radius2=0.0045, depth=0.024)
    for v in r_b['verts']:
        y, z = v.co.y, v.co.z
        v.co.y = z * 0.4 + y * 0.8 - 0.040
        v.co.z = -y * 0.4 + z * 0.8 + 0.088
        v.co.x -= 0.004
    r_t1 = bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=0.0030, radius2=0.0030, depth=0.042)
    for v in r_t1['verts']:
        x, y, z = v.co.x, v.co.y, v.co.z
        v.co.x = z
        v.co.z = x + 0.104
        v.co.y = y - 0.038
    r_t2 = bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=0.0026, radius2=0.0026, depth=0.034)
    for v in r_t2['verts']:
        x, y, z = v.co.x, v.co.y, v.co.z
        v.co.x = z * 0.7 + 0.008
        v.co.z = -x * 0.5 + 0.094
        v.co.y = y - 0.036
    r_mp = bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.0020, radius2=0.0016, depth=0.018)
    for v in r_mp['verts']:
        v.co.x += 0.004
        v.co.y -= 0.026
        v.co.z += 0.120

make_mesh_obj("Figure_BugleHorn", build_bugle_horn, mat_vintage_brass, subsurf=1)

def build_tassels(bm):
    r_tc = bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.0016, radius2=0.0016, depth=0.026)
    for v in r_tc['verts']:
        v.co.x += 0.018
        v.co.y -= 0.035
        v.co.z += 0.090
    for t_off in [-0.0022, 0.0022]:
        r_ts = bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.0035, radius2=0.0012, depth=0.015)
        for v in r_ts['verts']:
            v.co.x = v.co.x + 0.020 + t_off
            v.co.y -= 0.033
            v.co.z = v.co.z + 0.076

make_mesh_obj("Figure_BugleTassels", build_tassels, mat_gloss_black)

# -------------------------------------------------------------
# 4. STUDIO LIGHTING & CAMERA RIG
# -------------------------------------------------------------
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
world.use_nodes = True
w_bg = world.node_tree.nodes.get("Background")
if w_bg:
    w_bg.inputs['Color'].default_value = (0.94, 0.92, 0.90, 1.0)
    w_bg.inputs['Strength'].default_value = 0.45

col_lights = bpy.data.collections.new("Studio_Lighting")
scene.collection.children.link(col_lights)

def add_studio_light(name, l_type, energy, color, location, target=(0, -0.01, 0.090)):
    light_data = bpy.data.lights.new(name=name, type=l_type)
    light_data.energy = energy
    light_data.color = color
    if l_type == 'AREA':
        light_data.size = 0.5
    
    obj_l = bpy.data.objects.new(name=name, object_data=light_data)
    obj_l.location = location
    col_lights.objects.link(obj_l)
    
    dir_vec = Vector(target) - Vector(location)
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    obj_l.rotation_euler = rot_quat.to_euler()
    return obj_l

add_studio_light("Key_Softbox", 'AREA', 2.8, (1.0, 0.97, 0.94), (0.35, -0.45, 0.35))
add_studio_light("Fill_Softbox", 'AREA', 1.4, (0.92, 0.95, 1.0), (-0.40, -0.35, 0.28))
add_studio_light("Rim_Light_1", 'AREA', 2.2, (1.0, 1.0, 1.0), (0.25, 0.40, 0.30))
add_studio_light("Rim_Light_2", 'AREA', 1.8, (1.0, 0.98, 0.95), (-0.30, 0.35, 0.25))
add_studio_light("Top_Fill", 'AREA', 1.2, (1.0, 1.0, 1.0), (0.0, -0.10, 0.50))

cam_data = bpy.data.cameras.new(name="StudioCamera")
cam_data.lens = 70
cam_data.dof.use_dof = False
obj_cam = bpy.data.objects.new(name="Main_Camera", object_data=cam_data)
col_model.objects.link(obj_cam)
scene.camera = obj_cam

try:
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
except:
    try:
        scene.render.engine = 'BLENDER_EEVEE'
    except:
        pass

scene.render.resolution_x = 1920
scene.render.resolution_y = 1920
scene.render.image_settings.file_format = 'PNG'

try:
    scene.view_settings.view_transform = 'AgX'
except:
    try:
        scene.view_settings.view_transform = 'Filmic'
    except:
        pass

try:
    scene.view_settings.look = 'Medium High Contrast'
except:
    pass

def set_camera_view(pos, target=(0, -0.01, 0.090)):
    obj_cam.location = pos
    dir_vec = Vector(target) - Vector(pos)
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    obj_cam.rotation_euler = rot_quat.to_euler()

# -------------------------------------------------------------
# 5. MULTI-ANGLE STUDIO RENDERING
# -------------------------------------------------------------
workspace_dir = r"c:\Users\황태민\Documents\antigravity\lively-darwin"

renders = [
    ("antique_past_glory_hero.png", (0.26, -0.34, 0.18), (0, -0.01, 0.088)),     # 3/4 Hero View
    ("antique_past_glory_front.png", (0.0, -0.38, 0.095), (0, -0.01, 0.088)),    # Front Portrait View
    ("antique_past_glory_side.png", (-0.38, 0.0, 0.095), (0, -0.01, 0.088)),     # Left Side Profile
    ("antique_past_glory_top.png", (0.0, -0.06, 0.38), (0, -0.01, 0.080)),       # Top Bird's Eye
    ("antique_past_glory_back.png", (0.0, 0.38, 0.095), (0, -0.01, 0.088))       # Rear Trunk & Coat View
]

for filename, cam_pos, cam_target in renders:
    out_path = os.path.join(workspace_dir, filename)
    print(f"Rendering: {filename} ...")
    set_camera_view(cam_pos, cam_target)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Saved: {out_path}")

# -------------------------------------------------------------
# 6. ASSET EXPORT (GLB, BLEND, FBX, OBJ)
# -------------------------------------------------------------
blend_path = os.path.join(workspace_dir, "antique_past_glory.blend")
glb_path = os.path.join(workspace_dir, "antique_past_glory.glb")
fbx_path = os.path.join(workspace_dir, "antique_past_glory.fbx")
obj_path = os.path.join(workspace_dir, "antique_past_glory.obj")

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(f"Saved .blend: {blend_path}")

bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_materials='EXPORT'
)
print(f"Exported .glb: {glb_path}")

try:
    bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False, apply_scale_options='FBX_SCALE_ALL')
    print(f"Exported .fbx: {fbx_path}")
except Exception as e:
    print(f"FBX export: {e}")

try:
    bpy.ops.wm.obj_export(filepath=obj_path)
    print(f"Exported .obj: {obj_path}")
except Exception as e:
    print(f"OBJ export: {e}")

print("=== COMPLETE: ROYAL DOULTON 'PAST GLORY' HN 2484 CREATED SUCCESSFULLY ===")
