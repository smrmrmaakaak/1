import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=r"c:\Users\황태민\Documents\antigravity\lively-darwin\ai_output\hero_3_4_mesh.obj")
obj = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]

mat = bpy.data.materials.new(name="TestMat")
mat.use_nodes = True
nodes = mat.node_tree.nodes
nodes.clear()

node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')

# In Blender 4.2, ShaderNodeColorAttribute is the dedicated node for Color Attributes
try:
    node_attr = nodes.new(type='ShaderNodeColorAttribute')
    node_attr.layer_name = "Color"
    print("Used ShaderNodeColorAttribute")
except Exception as e:
    node_attr = nodes.new(type='ShaderNodeAttribute')
    node_attr.attribute_type = 'GEOMETRY'
    node_attr.attribute_name = "Color"
    print(f"Used ShaderNodeAttribute: {e}")

mat.node_tree.links.new(node_attr.outputs['Color'], node_bsdf.inputs['Base Color'])
mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

obj.data.materials.clear()
obj.data.materials.append(mat)
print("Shader connected successfully!")
