import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=r"c:\Users\황태민\Documents\antigravity\lively-darwin\ai_output\hero_3_4_mesh.obj")
obj = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]

print("COLOR ATTRIBUTES:")
for ca in obj.data.color_attributes:
    print(f"Name: {ca.name}, Data Type: {ca.data_type}, Domain: {ca.domain}")
    # Sample some values
    if ca.domain == 'POINT':
        for i in range(min(5, len(obj.data.vertices))):
            col = ca.data[i].color
            print(f"  Point {i}: R={col[0]:.3f}, G={col[1]:.3f}, B={col[2]:.3f}, A={col[3]:.3f}")
    elif ca.domain == 'CORNER':
        for i in range(min(5, len(obj.data.loops))):
            col = ca.data[i].color
            print(f"  Corner {i}: R={col[0]:.3f}, G={col[1]:.3f}, B={col[2]:.3f}, A={col[3]:.3f}")
