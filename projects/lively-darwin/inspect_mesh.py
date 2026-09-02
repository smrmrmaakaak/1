import bpy
import os
import math
from mathutils import Vector, Euler

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'

obj_path = r"c:\Users\황태민\Documents\antigravity\lively-darwin\master_output\antique_neural.obj"
bpy.ops.wm.obj_import(filepath=obj_path)
obj = bpy.context.selected_objects[0]

# Check vertices
xs = [v.co.x for v in obj.data.vertices]
ys = [v.co.y for v in obj.data.vertices]
zs = [v.co.z for v in obj.data.vertices]
print(f"X span: {min(xs):.4f} .. {max(xs):.4f} (len={max(xs)-min(xs):.4f})")
print(f"Y span: {min(ys):.4f} .. {max(ys):.4f} (len={max(ys)-min(ys):.4f})")
print(f"Z span: {min(zs):.4f} .. {max(zs):.4f} (len={max(zs)-min(zs):.4f})")

# In TripoSR: Y is up/down, Z is front/back or X is side
# Let's test which axis corresponds to height:
# Figurines are taller in height than width/depth.
lengths = {'X': max(xs)-min(xs), 'Y': max(ys)-min(ys), 'Z': max(zs)-min(zs)}
print("Axis spans:", lengths)
