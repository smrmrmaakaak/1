import bpy
import math

# 1. 기존 기본 씬 오브젝트 정리
bpy.ops.wm.read_factory_settings(use_empty=True)

# 2. 원목 상판 (Wooden Countertop with precise cutout)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
countertop = bpy.context.active_object
countertop.name = "Countertop_Wood"
countertop.scale = (2.4, 1.4, 0.08) # 2.4m x 1.4m x 8cm

# 원목 재질 생성
mat_wood = bpy.data.materials.new(name="Material_Walnut_Wood")
mat_wood.use_nodes = True
nodes = mat_wood.node_tree.nodes
bsdf = nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.28, 0.16, 0.09, 1.0) # 웜 월넛
    bsdf.inputs['Roughness'].default_value = 0.35
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = 0.0
countertop.data.materials.append(mat_wood)

# 3. 프리미엄 사각싱크볼 (Stainless Steel Rectangular Sink)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.22))
sink_body = bpy.context.active_object
sink_body.name = "Premium_Sink_Bellago"
sink_body.scale = (1.1, 0.75, 0.45) # 1100mm x 750mm x 450mm 사각싱크볼

mat_steel = bpy.data.materials.new(name="Material_Brushed_Stainless_Steel")
mat_steel.use_nodes = True
nodes = mat_steel.node_tree.nodes
bsdf = nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.85, 0.86, 0.88, 1.0) # 실버 메탈
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = 0.95
    bsdf.inputs['Roughness'].default_value = 0.22
sink_body.data.materials.append(mat_steel)

# 4. 거위목 고급 수전 (Gooseneck Faucet)
bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.4, location=(0, 0.38, 0.25))
faucet_base = bpy.context.active_object
faucet_base.name = "Faucet_Gooseneck"
faucet_base.data.materials.append(mat_steel)

# 수전 곡선부 (Torus)
bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.025, location=(0, 0.26, 0.45), rotation=(math.radians(90), 0, 0))
faucet_curve = bpy.context.active_object
faucet_curve.data.materials.append(mat_steel)

# 5. 올스텐 배수구 커버 (Drain Cover)
bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.03, location=(0, 0, -0.44))
drain_cover = bpy.context.active_object
drain_cover.name = "Drain_Cover_Stainless"
drain_cover.data.materials.append(mat_steel)

# 6. GLB 익스포트
export_path = r"c:\Users\황태민\Documents\antigravity\wonderful-mendel\assets\models\kitchen_sink.glb"
bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    export_materials='EXPORT',
    use_selection=False
)
print("Successfully generated and exported 3D Sink model to:", export_path)
