import bpy, math, sys, os
argv = sys.argv[sys.argv.index('--') + 1:]
SHOT, OUT = int(argv[0]), argv[1]
A = '/tmp/claude-0/-home-user-Projeto-123/93fc9871-cab8-541f-93ff-8b74df86d993/scratchpad/blender/assets'
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(argv[2]) if len(argv) > 2 else 160
sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = .02; sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 6; sc.cycles.glossy_bounces = 3; sc.cycles.transmission_bounces = 2
RES = float(argv[3]) if len(argv) > 3 else 1.0
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920; sc.render.resolution_percentage = int(RES * 100)
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
FIG_Y = -13.6 if SHOT == 0 else -10.6 if SHOT == 1 else -8.0
hum = HumanService.create_human()
for k, v in (('gender', 1.0), ('age', .62), ('muscle', .28), ('weight', .12), ('height', 1.0), ('proportions', .2), ('caucasian', 1.0), ('african', 0.0), ('asian', 0.0)):
    HOP.set_value(k, v, entity_reference=hum)
TargetService.reapply_macro_details(hum)
HumanService.set_character_skin(AssetService.find_asset_absolute_path('old_caucasian_male.mhmat', asset_subdir='skins'), hum, skin_type='ENHANCED_SSS')
rig = HumanService.add_builtin_rig(hum, 'default')
for sub, f, t in (('eyes', 'high-poly.mhclo', 'Eyes'), ('eyebrows', 'eyebrow001.mhclo', 'Eyebrows'), ('eyelashes', 'eyelashes01.mhclo', 'Eyelashes'), ('teeth', 'teeth_base.mhclo', 'Teeth'),
                  ('hair', 'short02.mhclo', 'Hair'), ('clothes', 'male_elegantsuit01.mhclo', 'Clothes'), ('clothes', 'shoes06.mhclo', 'Clothes')):
    p = AssetService.find_asset_absolute_path(f, asset_subdir=sub)
    if p: HumanService.add_mhclo_asset(p, hum, asset_type=t)
    else: print('FALTOU', f)
# olhos totalmente pretos e brilhantes
# pele mais pálida (puxa para o cinza-esverdeado)
for slot in hum.material_slots:
    if slot.material and slot.material.use_nodes:
        nt = slot.material.node_tree
        for n in nt.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Saturation'].default_value = .72; hsv.inputs['Value'].default_value = 1.04
                lk = n.inputs['Base Color'].links
                if lk: src_sock = lk[0].from_socket; nt.links.new(src_sock, hsv.inputs['Color']); nt.links.new(hsv.outputs['Color'], n.inputs['Base Color'])

# ---- PELE: poros, rugosidade variável e manchas (quebra o aspecto de plástico)
def skin_detail(nt):
    N = nt.nodes; L = nt.links
    bs = [n for n in N if n.type == 'BSDF_PRINCIPLED']
    if not bs: return
    geo = N.new('ShaderNodeNewGeometry')
    vor = N.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 1400; vor.feature = 'DISTANCE_TO_EDGE' if False else 'F1'
    L.new(geo.outputs['Position'], vor.inputs['Vector'])
    noi = N.new('ShaderNodeTexNoise'); noi.inputs['Scale'].default_value = 420; noi.inputs['Detail'].default_value = 8
    L.new(geo.outputs['Position'], noi.inputs['Vector'])
    big = N.new('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = 28; big.inputs['Detail'].default_value = 4
    L.new(geo.outputs['Position'], big.inputs['Vector'])
    mixh = N.new('ShaderNodeMath'); mixh.operation = 'MULTIPLY_ADD'; L.new(vor.outputs['Distance'], mixh.inputs[0]); mixh.inputs[1].default_value = .7; L.new(noi.outputs['Fac'], mixh.inputs[2])
    for b in bs:
        bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .12; bump.inputs['Distance'].default_value = .0004
        L.new(mixh.outputs[0], bump.inputs['Height'])
        nl = b.inputs['Normal'].links
        if nl: L.new(nl[0].from_socket, bump.inputs['Normal'])
        L.new(bump.outputs['Normal'], b.inputs['Normal'])
        rr = N.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = .36; rr.inputs['To Max'].default_value = .58
        L.new(big.outputs['Fac'], rr.inputs['Value']); L.new(rr.outputs['Result'], b.inputs['Roughness'])
        # manchas leves de vermelhidão
        bl = b.inputs['Base Color'].links
        if bl:
            mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'
            ramp = N.new('ShaderNodeMapRange'); ramp.inputs['From Min'].default_value = .45; ramp.inputs['From Max'].default_value = .75; ramp.inputs['To Max'].default_value = .18
            L.new(big.outputs['Fac'], ramp.inputs['Value']); L.new(ramp.outputs['Result'], mx.inputs['Factor'])
            L.new(bl[0].from_socket, mx.inputs[6]); mx.inputs[7].default_value = (1, .78, .74, 1); L.new(mx.outputs[2], b.inputs['Base Color'])
_g = [n for n in hum.material_slots[0].material.node_tree.nodes if n.type == 'GROUP'][0]; print('DBG skin', _g.node_tree.name, [(i.name, i.type, (tuple(i.default_value) if hasattr(i.default_value, '__len__') else i.default_value) if hasattr(i, 'default_value') else None, bool(i.links)) for i in _g.inputs]); print('DBG inner', sorted({n.type for n in _g.node_tree.nodes}))
for _n, _v in (('Pore strength', .45), ('Pore scale', 2200.), ('SSS strength', .32), ('Roughness', .5), ('Clearcoat', .05), ('colorMixInStrength', .09)):
    _g.inputs[_n].default_value = _v
skin_detail(_g.node_tree)

# ---- CABELO DE FIOS: curvas penteadas sobre o couro cabeludo (marcado pelo cabelo de malha)
import random, bmesh, mathutils
from mathutils.kdtree import KDTree
from mathutils.bvhtree import BVHTree
random.seed(7)
hairmesh = [o for o in bpy.data.objects if o.type == 'MESH' and 'short02' in o.name.lower()]
if hairmesh:
    hm = hairmesh[0]; dg = bpy.context.evaluated_depsgraph_get(); he = hm.evaluated_get(dg).to_mesh()
    kd = KDTree(len(he.vertices))
    for i, v in enumerate(he.vertices): kd.insert(hm.matrix_world @ v.co, i)
    kd.balance()
    zs = [(hm.matrix_world @ v.co).z for v in he.vertices]; zmin, ztop = min(zs), max(zs)
    ys = [(hm.matrix_world @ v.co).y for v in he.vertices]
    print('DBG objs', [o.name for o in bpy.data.objects if o.type == 'MESH' and o.parent in (hum, rig)])
    eyes = [o for o in bpy.data.objects if o.type == 'MESH' and o.name.lower().endswith('high-poly')]
    hcen = sum((hm.matrix_world @ v.co for v in hm.data.vertices), mathutils.Vector()) / len(hm.data.vertices)
    ecen = sum((eyes[0].matrix_world @ v.co for v in eyes[0].data.vertices), mathutils.Vector()) / len(eyes[0].data.vertices)
    fw = ecen - hcen; fw.z = 0; fw.normalize(); print('DBG frente', tuple(fw), 'ecen', tuple(ecen), 'hcen', tuple(hcen), 'zmin', zmin, 'ztop', ztop)
    F = hcen + fw * .4; F.z = ecen.z - .02
    _masks = [md for md in hum.modifiers if md.type == 'MASK']
    for md in _masks: md.show_viewport = False
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
    hum_e = hum.evaluated_get(dg); body = hum_e.to_mesh(); MW = hum.matrix_world.copy()
    print('DBG nverts', len(body.vertices), len(hum.data.vertices), [m.name for m in _masks], [g.name for g in hum.vertex_groups][:8])
    _bg = hum.vertex_groups.get('body')
    _inbody = set(v.index for v in hum.data.vertices if any(g.group == _bg.index for g in v.groups)) if _bg else None
    wts = {}
    for v in body.vertices:
        p = MW @ v.co; dist = kd.find(p)[2]
        fr = (p - hcen).dot(fw)
        if fr > .05 and p.z < ecen.z + .075: continue
        if p.z < ecen.z + (.0 if fr > -.06 else -.07): continue
        if _inbody is not None and v.index not in _inbody: continue
        if dist < .045 and p.z > zmin + .025:
            w = min(1., (.045 - dist) / .02) * min(1., (p.z - zmin - .025) / .04)
            if w > .05: wts[v.index] = w
    vg = hum.vertex_groups.new(name='couro')
    for i, w in wts.items(): vg.add([i], w, 'REPLACE')
    fa = hum.data.attributes.new('couro_f', 'FLOAT', 'POINT'); vals = [0.] * len(hum.data.vertices)
    for i, w in wts.items():
        if i < len(vals): vals[i] = min(1., w * 1.6)
    fa.data.foreach_set('value', vals)
    bm = bmesh.new(); bm.from_mesh(body); bm.transform(MW); bm.faces.ensure_lookup_table()
    bvh = BVHTree.FromBMesh(bm)
    faces = [f for f in bm.faces if all(v.index in wts for v in f.verts)]
    areas = [f.calc_area() * sum(wts[v.index] for v in f.verts) / len(f.verts) for f in faces]
    tot = sum(areas); print('DBG couro', len(wts), 'faces', len(faces), 'area cm2', tot * 1e4)
    NS = int(argv[4]) if len(argv) > 4 else 50000; SEG = 6
    pts, rad = [], []
    import itertools
    cum = list(itertools.accumulate(areas))
    import bisect
    for s_ in range(NS):
        f = faces[min(len(faces) - 1, bisect.bisect_left(cum, random.random() * tot))]
        vs = [v.co for v in f.verts]; r1, r2 = random.random(), random.random()
        if r1 + r2 > 1: r1, r2 = 1 - r1, 1 - r2
        p = vs[0] + (vs[1] - vs[0]) * r1 + (vs[-1] - vs[0]) * r2
        n = f.normal.copy(); _h = max(0., min(1., (p.z - ecen.z) / .13)); L_ = random.uniform(.8, 1.15) * (.014 + .042 * _h); step = L_ / SEG
        comb = (p - F); comb.z *= .6; comb = (comb.normalized() + mathutils.Vector((0, 0, -.35))).normalized()
        jit = mathutils.Vector((random.gauss(0, .25), random.gauss(0, .12), random.gauss(0, .12)))
        q = p + n * .0008; strand = [q.copy()]
        for k in range(SEG):
            loc, nn, _, d = bvh.find_nearest(q)
            nn = nn if nn is not None else n
            dvec = comb + jit; dvec = dvec - nn * dvec.dot(nn); dvec = (dvec.normalized() + nn * (.45 if k == 0 else .12)).normalized()
            q = q + dvec * step
            loc, nn2, _, d = bvh.find_nearest(q)
            if loc is not None:
                off = .002 + k * .0009
                if (q - loc).length < off or (q - loc).dot(nn2) < 0: q = loc + nn2 * off
            strand.append(q.copy())
        pts.append(strand)
    bm.free(); hum_e.to_mesh_clear(); hm.evaluated_get(dg).to_mesh_clear()
    for md in _masks: md.show_viewport = True
    cv = bpy.data.hair_curves.new('fios') if hasattr(bpy.data, 'hair_curves') else bpy.data.curves.new('fios', 'CURVE')
    cv.add_curves([SEG + 1] * NS)
    flatp = [c for st in pts for p in st for c in p]
    cv.position_data.foreach_set('vector', flatp)
    rads = [(.00009 * (1 - k / SEG) + .000025) for _ in range(NS) for k in range(SEG + 1)]
    ra = cv.attributes.new('radius', 'FLOAT', 'POINT') if 'radius' not in cv.attributes else cv.attributes['radius']
    ra.data.foreach_set('value', rads)
    co = bpy.data.objects.new('Fios', cv); bpy.context.collection.objects.link(co)
    hairmat = bpy.data.materials.new('fios'); hairmat.use_nodes = True; nt = hairmat.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
    hb = nt.nodes.new('ShaderNodeBsdfHairPrincipled'); hb.parametrization = 'MELANIN'
    hb.inputs['Melanin'].default_value = .86; hb.inputs['Melanin Redness'].default_value = .45; hb.inputs['Roughness'].default_value = .3; hb.inputs['Random Roughness'].default_value = .25
    hb.inputs['Random Color'].default_value = .2
    nt.links.new(hb.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    cv.materials.append(hairmat)
    # preso ao osso da cabeça, para acompanhar a pose
    co.parent = rig; co.parent_type = 'BONE'; co.parent_bone = 'head'
    bpy.context.view_layer.update()
    hb_ = rig.pose.bones['head']; Mb = rig.matrix_world @ hb_.matrix @ mathutils.Matrix.Translation((0, hb_.length, 0))
    co.matrix_parent_inverse = Mb.inverted()
    hm.hide_render = True; hm.hide_viewport = True
    # couro cabeludo escuro por baixo dos fios
    nt = _g.node_tree
    at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_type = 'GEOMETRY'; at.attribute_name = 'couro_f'
    for bsdf in [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED']:
        bl = bsdf.inputs['Base Color'].links
        if bl:
            mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'
            nt.links.new(at.outputs['Fac'], mx.inputs['Factor']); nt.links.new(bl[0].from_socket, mx.inputs[6]); mx.inputs[7].default_value = (.03, .022, .016, 1)
            nt.links.new(mx.outputs[2], bsdf.inputs['Base Color'])
else: print('SEM CABELO DE MALHA')
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
        for j, ang in ((1, 14), (2, 30), (3, 24)):
            n = f'finger{f}-{j}.{side}'
            if n in names: pb = rig.pose.bones[n]; pb.rotation_mode = 'XYZ'; pb.rotation_euler = (math.radians(ang if f > 1 else ang * .5), 0, 0)
rot('neck01', (math.radians(4), 0, math.radians(10))); rot('head', (math.radians(-6), math.radians(4), math.radians(14)))
bpy.ops.object.mode_set(mode='OBJECT')
print('OSSOS', [n for n in names if 'arm' in n.lower() or 'head' in n.lower() or 'neck' in n.lower()][:20])
for o in bpy.data.objects:
    for md in getattr(o, 'modifiers', []):
        if md.type == 'SUBSURF': md.levels = 1; md.render_levels = 2
    if o.type == 'MESH' and (o == hum or o.parent in (hum, rig)) and not any(md.type == 'SUBSURF' for md in o.modifiers):
        md = o.modifiers.new('suave', 'SUBSURF'); md.levels = 1; md.render_levels = 2
root = rig if rig else hum
root.location = (.05, FIG_Y, 0); root.rotation_euler = (0, 0, math.radians(180 if SHOT == 1 else 180))
# câmera
cam_data = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_data); bpy.context.collection.objects.link(cam); sc.camera = cam
if SHOT == 2:
    bpy.context.view_layer.update()
    hb = rig.pose.bones['head']; hp = rig.matrix_world @ ((hb.head + hb.tail) / 2)
    cam.location = (hp.x - .18, hp.y + 1.55, hp.z - .06)
    import mathutils; aim = hp + mathutils.Vector((0, 0, -.1)); d = aim - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); cam_data.lens = 70
    cam_data.dof.use_dof = True; cam_data.dof.focus_distance = d.length; cam_data.dof.aperture_fstop = 2.0
    bpy.ops.object.light_add(type='AREA', location=(hp.x - .7, hp.y + .9, hp.z + .35)); k = bpy.context.object; k.data.energy = 35; k.data.size = .6; k.data.color = (1, .9, .8)
    k.rotation_euler = (hp - k.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.ops.object.light_add(type='AREA', location=(hp.x + .6, hp.y - .6, hp.z + .3)); r2 = bpy.context.object; r2.data.energy = 30; r2.data.size = .4; r2.data.color = (.45, 1, .6)
    r2.rotation_euler = (hp - r2.location).to_track_quat('-Z', 'Y').to_euler()
elif SHOT == 0: cam.location = (-.35, -.6, 1.62); cam.rotation_euler = (math.radians(90.5), 0, math.radians(180 - 1.5)); cam_data.lens = 20
else:
    cam.location = (-.25, -7.6, 1.5); cam.rotation_euler = (math.radians(95), 0, math.radians(180 + 2)); cam_data.lens = 40
    cam_data.dof.use_dof = True; cam_data.dof.focus_distance = 3.0; cam_data.dof.aperture_fstop = 2.2
import sys as _s
if '--dry' in _s.argv: raise SystemExit
bpy.ops.render.render(write_still=True)
