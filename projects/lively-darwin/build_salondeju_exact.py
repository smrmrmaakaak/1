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

def add_bevel(obj, width=0.015, segments=2):
    bev = obj.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = width
    bev.segments = segments
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35)
    for poly in obj.data.polygons:
        poly.use_smooth = True

def create_mat(name, color=(0.8, 0.8, 0.8, 1.0), roughness=0.5, metallic=0.0, transmission=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    if "Base Color" in node_bsdf.inputs:
        node_bsdf.inputs["Base Color"].default_value = color
    if "Roughness" in node_bsdf.inputs:
        node_bsdf.inputs["Roughness"].default_value = roughness
    if "Metallic" in node_bsdf.inputs:
        node_bsdf.inputs["Metallic"].default_value = metallic
    if "Alpha" in node_bsdf.inputs:
        node_bsdf.inputs["Alpha"].default_value = alpha
    if "Transmission Weight" in node_bsdf.inputs:
        node_bsdf.inputs["Transmission Weight"].default_value = transmission
    elif "Transmission" in node_bsdf.inputs:
        node_bsdf.inputs["Transmission"].default_value = transmission
        
    links.new(node_bsdf.outputs["BSDF"], node_out.inputs["Surface"])
    return mat

def build_salondeju_detailed():
    # Materials
    mat_floor = create_mat("Floor_BeigeLinen", color=(0.90, 0.88, 0.82, 1.0), roughness=0.7)
    mat_floor_edge = create_mat("Floor_SideProfile", color=(0.75, 0.72, 0.66, 1.0), roughness=0.6)
    mat_white = create_mat("Kiosk_WhitePaint", color=(0.97, 0.97, 0.96, 1.0), roughness=0.3)
    mat_black = create_mat("Logo_BlackMatte", color=(0.05, 0.05, 0.05, 1.0), roughness=0.4)
    mat_walnut = create_mat("WarmWalnut_Plinths", color=(0.52, 0.30, 0.16, 1.0), roughness=0.35)
    mat_light_oak = create_mat("LightOak_Shelving", color=(0.78, 0.58, 0.38, 1.0), roughness=0.4)
    mat_glass = create_mat("TemperedGlass", color=(0.95, 0.98, 1.0, 1.0), roughness=0.05, transmission=0.92, alpha=0.3)
    mat_metal_black = create_mat("BlackIronWire", color=(0.10, 0.10, 0.12, 1.0), roughness=0.4, metallic=0.85)
    mat_chrome = create_mat("ChromeBaseDisc", color=(0.88, 0.88, 0.90, 1.0), roughness=0.15, metallic=0.95)
    mat_wall = create_mat("Wall_CreamPanel", color=(0.93, 0.91, 0.86, 1.0), roughness=0.7)

    # 1. Floor Platform (7.2m x 5.2m x 0.15m)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.075))
    floor = bpy.context.active_object
    floor.name = "Floor_Base"
    floor.scale = (7.2, 5.2, 0.15)
    floor.data.materials.append(mat_floor)
    add_bevel(floor, 0.015, 2)

    # 2. Central Kiosk Tower (Back Center: X=0.3, Y=1.3)
    # Cylindrical Main Column
    bpy.ops.mesh.primitive_cylinder_add(radius=0.72, depth=3.0, location=(0.3, 1.3, 1.5 + 0.15), vertices=48)
    tower = bpy.context.active_object
    tower.name = "Central_Kiosk_Tower"
    tower.data.materials.append(mat_white)
    add_bevel(tower, 0.01, 2)

    # Overhead Fascia Ring (Top Header)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.76, depth=0.45, location=(0.3, 1.3, 2.75 + 0.15), vertices=48)
    fascia = bpy.context.active_object
    fascia.name = "Header_Fascia"
    fascia.data.materials.append(mat_white)
    add_bevel(fascia, 0.01, 2)

    # "SALONDEJU" Black Text
    bpy.ops.object.text_add(location=(-0.25, 0.52, 2.65 + 0.15), rotation=(math.radians(90), 0, 0))
    txt = bpy.context.active_object
    txt.name = "SALONDEJU_Text"
    txt.data.body = "SALONDEJU"
    txt.data.size = 0.14
    txt.data.extrude = 0.02
    txt.data.materials.append(mat_black)

    # Half-Cylinder Counter
    bpy.ops.mesh.primitive_cylinder_add(radius=0.65, depth=0.95, location=(0.3, 0.65, 0.475 + 0.15), vertices=48)
    cnt = bpy.context.active_object
    cnt.name = "Reception_Counter_Body"
    cnt.data.materials.append(mat_white)
    add_bevel(cnt, 0.015, 2)

    # Counter Wood Top
    bpy.ops.mesh.primitive_cylinder_add(radius=0.68, depth=0.04, location=(0.3, 0.65, 0.95 + 0.15), vertices=48)
    cnt_top = bpy.context.active_object
    cnt_top.name = "Reception_Counter_Top"
    cnt_top.data.materials.append(mat_walnut)
    add_bevel(cnt_top, 0.008, 2)

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

    # White Storage Box Back-Right
    bpy.ops.mesh.primitive_cube_add(size=1, location=(2.0, 1.7, 1.35 + 0.15))
    storage_box = bpy.context.active_object
    storage_box.name = "White_Fitting_Storage"
    storage_box.scale = (0.7, 0.75, 2.7)
    storage_box.data.materials.append(mat_white)
    add_bevel(storage_box, 0.015, 2)

    # 3. Small Black Wire Rack (Right of Counter: X=1.0, Y=0.7)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.0, 0.7, 0.6 + 0.15))
    wire = bpy.context.active_object
    wire.name = "Black_Wire_Stand"
    wire.scale = (0.35, 0.35, 1.2)
    wire.data.materials.append(mat_metal_black)
    add_bevel(wire, 0.01, 2)

    # 4. Left Zone (Exact 3-Bay Open Shelves & Showcase):
    # Vitrine Showcase (Front Left: X=-2.6, Y=-0.7)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.6, -0.7, 0.2 + 0.15))
    v_base = bpy.context.active_object
    v_base.name = "Vitrine_Base"
    v_base.scale = (1.3, 0.6, 0.4)
    v_base.data.materials.append(mat_walnut)
    add_bevel(v_base, 0.01, 2)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-2.6, -0.7, 0.75 + 0.15))
    v_glass = bpy.context.active_object
    v_glass.name = "Vitrine_Glass"
    v_glass.scale = (1.28, 0.58, 0.7)
    v_glass.data.materials.append(mat_glass)
    add_bevel(v_glass, 0.008, 2)

    # 3-Bay Open Wall Shelf Unit (Back Left: X=-2.1, Y=1.0)
    # Shelf Uprights & Horizontal Boards
    shelf_width = 2.1
    shelf_height = 1.7
    shelf_depth = 0.4
    for b in range(4): # 4 vertical upright dividers
        ux = -2.85 + b * 0.7
        bpy.ops.mesh.primitive_cube_add(size=1, location=(ux, 1.0, 0.85 + 0.15))
        upright = bpy.context.active_object
        upright.name = f"Shelf_Upright_{b}"
        upright.scale = (0.04, shelf_depth, shelf_height)
        upright.data.materials.append(mat_light_oak)
        add_bevel(upright, 0.005, 2)

    for h_idx in range(4): # 4 horizontal shelf tiers
        hz = 0.1 + h_idx * 0.5
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.8, 1.0, hz + 0.15))
        board = bpy.context.active_object
        board.name = f"Shelf_Board_{h_idx}"
        board.scale = (shelf_width, shelf_depth, 0.035)
        board.data.materials.append(mat_light_oak)
        add_bevel(board, 0.005, 2)

    # Low Wooden Storage Chest (X=-1.4, Y=1.6)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.4, 1.6, 0.3 + 0.15))
    chest = bpy.context.active_object
    chest.name = "Low_Storage_Chest"
    chest.scale = (0.8, 0.45, 0.6)
    chest.data.materials.append(mat_walnut)
    add_bevel(chest, 0.01, 2)

    # Low Round Display Drum (X=-1.4, Y=0.45)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.35, location=(-1.4, 0.45, 0.175 + 0.15), vertices=36)
    drum = bpy.context.active_object
    drum.name = "Round_Display_Drum"
    drum.data.materials.append(mat_walnut)
    add_bevel(drum, 0.01, 2)

    # Dark Rim on Drum
    bpy.ops.mesh.primitive_cylinder_add(radius=0.44, depth=0.04, location=(-1.4, 0.45, 0.33 + 0.15), vertices=36)
    drum_rim = bpy.context.active_object
    drum_rim.name = "Drum_Rim"
    drum_rim.data.materials.append(mat_black)

    # 5. Center-Front Display Plinths (Walnut Tables):
    # Main Big Square Plinth (Center-Left: X=-0.2, Y=-0.5)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.2, -0.5, 0.175 + 0.15))
    p1 = bpy.context.active_object
    p1.name = "Main_Square_Plinth"
    p1.scale = (1.6, 1.6, 0.35)
    p1.data.materials.append(mat_walnut)
    add_bevel(p1, 0.02, 2)

    # Sub Square Plinth (Front-Right: X=0.9, Y=-1.3)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.9, -1.3, 0.13 + 0.15))
    p2 = bpy.context.active_object
    p2.name = "Sub_Square_Plinth"
    p2.scale = (1.3, 1.3, 0.26)
    p2.data.materials.append(mat_walnut)
    add_bevel(p2, 0.02, 2)

    # 6. Right Zone (3 Poles + Tier Shelf + Side Cabinet):
    # 3 Vertical Wooden Pole Stands with Chrome Base (X=1.7, 2.0, 2.3, Y=-0.7)
    for idx, px in enumerate([1.7, 2.0, 2.3]):
        py = -0.55 - idx * 0.28
        # Chrome Disc Base
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=0.02, location=(px, py, 0.01 + 0.15), vertices=24)
        disc = bpy.context.active_object
        disc.name = f"Pole_Disc_{idx}"
        disc.data.materials.append(mat_chrome)

        # Wood Pole
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=1.65, location=(px, py, 0.825 + 0.15), vertices=20)
        pole = bpy.context.active_object
        pole.name = f"Wood_Pole_{idx}"
        pole.data.materials.append(mat_walnut)
        add_bevel(pole, 0.005, 2)

        # Chrome Hanger Bar Ring
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.04, location=(px, py, 1.4 + 0.15), vertices=16)
        hook = bpy.context.active_object
        hook.name = f"Pole_Hook_{idx}"
        hook.data.materials.append(mat_chrome)

    # Right Back 2-Tier Shelf (X=2.4, Y=1.0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(2.4, 1.0, 0.45 + 0.15))
    r_shelf = bpy.context.active_object
    r_shelf.name = "Right_2Tier_Shelf"
    r_shelf.scale = (1.5, 0.45, 0.9)
    r_shelf.data.materials.append(mat_walnut)
    add_bevel(r_shelf, 0.015, 2)

    # Right Side Cabinet (X=2.65, Y=0.15)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(2.65, 0.15, 0.35 + 0.15))
    r_cab = bpy.context.active_object
    r_cab.name = "Right_Side_Cabinet"
    r_cab.scale = (0.55, 0.55, 0.7)
    r_cab.data.materials.append(mat_walnut)
    add_bevel(r_cab, 0.015, 2)

    # 7. Lighting & Studio Environment
    sun_data = bpy.data.lights.new(name="Sun_Key", type='SUN')
    sun_data.energy = 3.8
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new(name="Sun_Obj", object_data=sun_data)
    sun_obj.rotation_euler = (math.radians(48), math.radians(22), math.radians(-45))
    bpy.context.collection.objects.link(sun_obj)

    sky_data = bpy.data.lights.new(name="Sky_Fill", type='SUN')
    sky_data.energy = 1.8
    sky_data.color = (0.92, 0.95, 1.0)
    sky_obj = bpy.data.objects.new(name="Sky_Obj", object_data=sky_data)
    sky_obj.rotation_euler = (math.radians(85), 0, 0)
    bpy.context.collection.objects.link(sky_obj)

def render_and_export(output_dir):
    scene = bpy.context.scene
    scene.render.resolution_x = 2048
    scene.render.resolution_y = 2048
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    
    # Clean studio background
    scene.world = bpy.data.worlds.new("StudioWorld")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.96, 0.96, 0.96, 1.0)

    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except:
        scene.render.engine = 'BLENDER_EEVEE'

    # Enable Freestyle line rendering for crisp SketchUp edges if available
    try:
        scene.render.use_freestyle = True
        freestyle = scene.view_layers["ViewLayer"].freestyle_settings
        freestyle.linesets[0].select_silhouette = True
        freestyle.linesets[0].select_border = True
        freestyle.linesets[0].select_crease = True
        freestyle.linesets[0].crease_angle = math.radians(135)
        freestyle.linesets[0].linestyle.color = (0.15, 0.15, 0.15)
        freestyle.linesets[0].linestyle.thickness = 1.5
    except Exception as e:
        print("Freestyle config skipped:", e)

    cameras = {
        "salondeju_iso_render.png": {
            "loc": (8.6, -9.6, 8.0),
            "rot": (math.radians(56), 0, math.radians(42)),
            "ortho": False,
            "lens": 46
        },
        "salondeju_floorplan_render.png": {
            "loc": (0.0, 0.0, 12.0),
            "rot": (0, 0, 0),
            "ortho": True,
            "ortho_scale": 7.6
        }
    }

    for filename, cfg in cameras.items():
        cam_data = bpy.data.cameras.new(name=f"Cam_{filename}")
        cam_data.lens = cfg.get("lens", 50)
        if cfg.get("ortho", False):
            cam_data.type = 'ORTHO'
            cam_data.ortho_scale = cfg.get("ortho_scale", 7.6)
        else:
            cam_data.type = 'PERSP'

        cam_obj = bpy.data.objects.new(name=f"CamObj_{filename}", object_data=cam_data)
        cam_obj.location = cfg["loc"]
        cam_obj.rotation_euler = cfg["rot"]
        scene.collection.objects.link(cam_obj)
        scene.camera = cam_obj

        filepath = os.path.join(output_dir, filename)
        scene.render.filepath = filepath
        print(f"Rendering: {filepath}")
        bpy.ops.render.render(write_still=True)
        scene.collection.objects.unlink(cam_obj)

    # Export
    blend_path = os.path.join(output_dir, "salondeju_booth_exact.blend")
    glb_path = os.path.join(output_dir, "salondeju_booth_exact.glb")
    fbx_path = os.path.join(output_dir, "salondeju_booth_exact.fbx")

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB', use_selection=False, export_materials='EXPORT', export_apply=True)
    bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False, apply_unit_scale=True, apply_scale_options='FBX_SCALE_ALL')
    print("Export complete!")

if __name__ == "__main__":
    out_dir = r"C:\Users\황태민\Documents\antigravity\lively-darwin"
    reset_scene()
    build_salondeju_detailed()
    render_and_export(out_dir)
