import bpy, math, sys, os
argv = sys.argv[sys.argv.index('--') + 1:]
SHOT, OUT = int(argv[0]), argv[1]
A = '/tmp/claude-0/-home-user-Projeto-123/93fc9871-cab8-541f-93ff-8b74df86d993/scratchpad/blender/assets'
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(argv[2]) if len(argv) > 2 else 160
sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = .02; sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 6; sc.cycles.glossy_bounces = 3; sc.cycles.transmission_bounces = 2
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
sc.view_settings.exposure = .4
sc.render.filepath = OUT
W = bpy.data.worlds.new('w'); sc.world = W; W.use_nodes = True; W.node_tree.nodes['Background'].inputs['Strength'].default_value = 0

def pbr(name, tid, scale=1., rough_mul=1., tint=(1, 1, 1), nstr=1.):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale); L.new(tc.outputs['Object'], mp.inputs['Vector'])
    def img(key, col):
        p = os.path.join(A, f'{tid}_{key}.jpg'); t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(p); t.projection = 'BOX'; t.projection_blend = .25
        if not col: t.image.colorspace_settings.name = 'Non-Color'
        L.new(mp.outputs['Vector'], t.inputs['Vector']); return t
    d = img('diff', True); mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1
    L.new(d.outputs['Color'], mix.inputs[6]); mix.inputs[7].default_value = (*tint, 1); L.new(mix.outputs[2], b.inputs['Base Color'])
    r = img('rough', False); mm = N.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = rough_mul; L.new(r.outputs['Color'], mm.inputs[0]); L.new(mm.outputs[0], b.inputs['Roughness'])
    n = img('nor', False); nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nstr; L.new(n.outputs['Color'], nm.inputs['Color']); L.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m
def flat(name, col, rough=.5, metal=0., emit=None, estr=0.):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    return m
def box(loc, size, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot); o = bpy.context.object; o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(mat); return o

wall = pbr('parede', 'damaged_plaster', .9, 1., (.78, .8, .72), 1.2)
floor = pbr('piso', 'dirty_tiles', 1.2, .35, (.85, .82, .74), 1.)          # molhado: menos rugoso
ceil = pbr('teto', 'grey_plaster_02', .8, 1., (.7, .7, .68))
wood = pbr('madeira', 'distressed_painted_planks', 1.4, 1., (.55, .42, .32), 1.3)
metal = flat('metal', (.6, .55, .45), .35, 1.)
brass = flat('latao', (.7, .58, .32), .3, 1.)
Lc, Wd, Hh = 16., 2.4, 2.7
box((0, -Lc / 2, -.05), (Wd, Lc, .1), floor); box((0, -Lc / 2, Hh + .05), (Wd, Lc, .1), ceil)
box((-Wd / 2 - .05, -Lc / 2, Hh / 2), (.1, Lc, Hh), wall); box((Wd / 2 + .05, -Lc / 2, Hh / 2), (.1, Lc, Hh), wall)
box((0, -Lc - .05, Hh / 2), (Wd, .1, Hh), wall)
box((0, -.3, Hh / 2), (Wd + .4, .1, Hh), wall)   # parede atrás da câmera (rebate de luz)
# rodapé escuro
for s in (-1, 1): box((s * (Wd / 2 - .01), -Lc / 2, .06), (.02, Lc, .12), flat('rodape', (.08, .07, .06), .6))
def door(x, y, side, num):
    rot = (0, 0, 0)
    box((x + side * .015, y, 1.05), (.06, 1.02, 2.12), flat('batente', (.12, .1, .08), .7))
    box((x + side * .03, y, 1.03), (.05, .9, 2.05), wood)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.035, location=(x + side * .075, y + .34, 1.0)); bpy.context.object.data.materials.append(metal); bpy.ops.object.shade_smooth()
    box((x + side * .02, y, 2.25), (.02, .22, .14), brass)
    bpy.ops.object.text_add(location=(x + side * .035, y, 2.22), rotation=(math.radians(90), 0, math.radians(-90 * side))); t = bpy.context.object; t.data.body = str(num); t.data.size = .1; t.data.extrude = .004; t.data.align_x = 'CENTER'; t.data.materials.append(flat('num', (.03, .025, .02), .5))
for (s, y, n) in [(-1, -2.6, 41), (1, -4.2, 44), (-1, -6.8, 43), (1, -8.6, 45), (-1, -11, 46), (1, -12.8, 47)]:
    door(s * Wd / 2, y, -s, n)
# a porta 42 no fim, com a luz verde vazando por baixo
box((0, -Lc + .03, 1.05), (1.02, .06, 2.12), flat('batente', (.12, .1, .08), .7))
box((0, -Lc + .06, 1.05), (.9, .05, 2.05), wood)
box((0, -Lc + .04, 2.28), (.22, .02, .14), brass)
bpy.ops.object.text_add(location=(0, -Lc + .06, 2.25), rotation=(math.radians(90), 0, 0)); t = bpy.context.object; t.data.body = '42'; t.data.size = .1; t.data.extrude = .004; t.data.align_x = 'CENTER'; t.data.materials.append(flat('num', (.03, .025, .02), .5))
box((0, -Lc + .07, .012), (.88, .02, .02), flat('fresta', (0, 0, 0), .5, emit=(.35, 1, .5), estr=60))
bpy.ops.object.light_add(type='POINT', location=(0, -Lc + .25, .08)); g = bpy.context.object.data; g.energy = 25; g.color = (.4, 1, .55); g.shadow_soft_size = .4
# luminárias fluorescentes do Poly Haven; a do meio está apagada
gl = os.path.join(A, 'mounted_fluorescent_lights', 'mounted_fluorescent_lights.gltf')
for i, (y, on) in enumerate([(-2.0, 1.0), (-6.5, .0), (-11.0, .35)]):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=gl); new = [o for o in bpy.data.objects if o not in before]
    for o in new:
        if o.parent is None: o.location = (0, y, Hh - .02); o.rotation_euler = (0, 0, math.radians(90))
    if on > 0:
        bpy.ops.object.light_add(type='AREA', location=(0, y, Hh - .12)); L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size, L.size_y = .18, 1.2; L.energy = 160 * on; L.color = (1, .93, .82)
        bpy.context.object.rotation_euler = (0, 0, 0)
# ELE: personagem humano do MakeHuman (MPFB2)
import importlib
def imp(pkg, key):
    for m in list(sys.modules):
        if m.endswith(pkg): return getattr(importlib.import_module(m), key)
    raise ValueError(pkg)
HumanService = imp('mpfb.services.humanservice', 'HumanService'); AssetService = imp('mpfb.services.assetservice', 'AssetService')
TargetService = imp('mpfb.services.targetservice', 'TargetService'); HOP = imp('mpfb.entities.objectproperties', 'HumanObjectProperties')
FIG_Y = -13.6 if SHOT == 0 else -10.6
hum = HumanService.create_human()
for k, v in (('gender', 1.0), ('age', .62), ('muscle', .28), ('weight', .12), ('height', 1.0), ('proportions', .2), ('caucasian', 1.0), ('african', 0.0), ('asian', 0.0)):
    HOP.set_value(k, v, entity_reference=hum)
TargetService.reapply_macro_details(hum)
HumanService.set_character_skin(AssetService.find_asset_absolute_path('old_caucasian_male.mhmat', asset_subdir='skins'), hum, skin_type='MAKESKIN')
rig = HumanService.add_builtin_rig(hum, 'default')
for sub, f, t in (('eyes', 'high-poly.mhclo', 'Eyes'), ('eyebrows', 'eyebrow001.mhclo', 'Eyebrows'), ('eyelashes', 'eyelashes01.mhclo', 'Eyelashes'), ('teeth', 'teeth_base.mhclo', 'Teeth'),
                  ('clothes', 'male_elegantsuit01.mhclo', 'Clothes'), ('clothes', 'shoes06.mhclo', 'Clothes')):
    p = AssetService.find_asset_absolute_path(f, asset_subdir=sub)
    if p: HumanService.add_mhclo_asset(p, hum, asset_type=t)
    else: print('FALTOU', f)
# olhos totalmente pretos e brilhantes
print('FILHOS', [o.name for o in bpy.data.objects if o.type == 'MESH'])
for o in bpy.data.objects:
    nm = o.name.lower()
    if o.type == 'MESH' and ('high-poly' in nm or 'highpoly' in nm or (nm.startswith('eye') and 'brow' not in nm and 'lash' not in nm)):
        m = bpy.data.materials.new('olho_preto'); m.use_nodes = True; bb = m.node_tree.nodes['Principled BSDF']; bb.inputs['Base Color'].default_value = (.005, .005, .006, 1); bb.inputs['Roughness'].default_value = .05
        o.data.materials.clear(); o.data.materials.append(m)
# pele mais pálida (puxa para o cinza-esverdeado)
for slot in hum.material_slots:
    if slot.material and slot.material.use_nodes:
        nt = slot.material.node_tree
        for n in nt.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Saturation'].default_value = .45; hsv.inputs['Value'].default_value = 1.12
                lk = n.inputs['Base Color'].links
                if lk: src_sock = lk[0].from_socket; nt.links.new(src_sock, hsv.inputs['Color']); nt.links.new(hsv.outputs['Color'], n.inputs['Base Color'])
# esqueleto para pôr os braços para baixo e inclinar a cabeça
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE')
names = [bn.name for bn in rig.pose.bones]
def rot(bone_like, euler):
    for n in names:
        if n.lower() == bone_like.lower():
            pb = rig.pose.bones[n]; pb.rotation_mode = 'XYZ'; pb.rotation_euler = euler; return True
    print('osso nao achado', bone_like); return False
rot('upperarm01.L', (0, 0, math.radians(-38))); rot('upperarm01.R', (0, 0, math.radians(38)))
for side in ('L', 'R'):
    for f in range(1, 6):
        for j in (2, 3):
            n = f'finger{f}-{j}.{side}'
            if n in names: pb = rig.pose.bones[n]; pb.rotation_mode = 'XYZ'; pb.rotation_euler = (math.radians(22), 0, 0)
rot('neck01', (math.radians(4), 0, math.radians(10))); rot('head', (math.radians(-6), math.radians(4), math.radians(14)))
bpy.ops.object.mode_set(mode='OBJECT')
print('OSSOS', [n for n in names if 'arm' in n.lower() or 'head' in n.lower() or 'neck' in n.lower()][:20])
root = rig if rig else hum
root.location = (.05, FIG_Y, 0); root.rotation_euler = (0, 0, math.radians(180 if SHOT == 1 else 180))
# câmera
cam_data = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_data); bpy.context.collection.objects.link(cam); sc.camera = cam
if SHOT == 0: cam.location = (-.35, -.6, 1.62); cam.rotation_euler = (math.radians(90.5), 0, math.radians(180 - 1.5)); cam_data.lens = 20
else:
    cam.location = (-.25, -7.6, 1.5); cam.rotation_euler = (math.radians(95), 0, math.radians(180 + 2)); cam_data.lens = 40
    cam_data.dof.use_dof = True; cam_data.dof.focus_distance = 3.0; cam_data.dof.aperture_fstop = 2.2
bpy.ops.render.render(write_still=True)
