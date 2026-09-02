import bpy
import os

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath("public/models/Xbot.glb"))

print("=== XBOT.GLB INSPECTION ===")
for obj in bpy.data.objects:
    print(f"Object: {obj.name} ({obj.type})")
    if obj.type == 'MESH':
        for m in obj.data.materials:
            print(f"  Material: {m.name if m else 'None'}")
    elif obj.type == 'ARMATURE':
        print(f"  Bones count: {len(obj.data.bones)}")

for anim in bpy.data.actions:
    print(f"Action: {anim.name}")
