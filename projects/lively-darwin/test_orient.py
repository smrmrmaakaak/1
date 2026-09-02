import bpy
import os
import math
from mathutils import Vector, Euler

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 512
scene.render.resolution_y = 512

obj_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural.obj"
bpy.ops.wm.obj_import(filepath=obj_path)
obj = bpy.context.selected_objects[0]

# Rotate to stand upright
# If height was X:
obj.rotation_euler = Euler((0, math.radians(-90), math.radians(90)), 'XYZ')
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

# Re-check spans
xs = [v.co.x for v in obj.data.vertices]
ys = [v.co.y for v in obj.data.vertices]
zs = [v.co.z for v in obj.data.vertices]
print(f"NEW X span: {min(xs):.4f} .. {max(xs):.4f} (len={max(xs)-min(xs):.4f})")
print(f"NEW Y span: {min(ys):.4f} .. {max(ys):.4f} (len={max(ys)-min(ys):.4f})")
print(f"NEW Z span: {min(zs):.4f} .. {max(zs):.4f} (len={max(zs)-min(zs):.4f})")

# Setup quick cam and light
bpy.ops.object.light_add(type='SUN', location=(1, -2, 3))
cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (0, -2.5, 0)
cam.rotation_euler = (math.radians(90), 0, 0)

scene.render.filepath = r"c:\Users\황태민\Documents\antigravity\lively-darwin\test_orient.png"
bpy.ops.render.render(write_still=True)
print("Rendered test_orient.png")
