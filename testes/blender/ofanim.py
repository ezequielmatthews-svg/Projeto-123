# Grimório Nº 1 · Ofanim em 3D realista (Blender 4.2, Cycles)
# uso: blender -b --python ofanim.py -- <SHOT A|B> <pasta_saida> [amostras] [escala]
import bpy, math, sys, random, mathutils
argv = sys.argv[sys.argv.index('--') + 1:]
SHOT, OUT = argv[0], argv[1]
SAMPLES = int(argv[2]) if len(argv) > 2 else 40
RES = float(argv[3]) if len(argv) > 3 else 1.0
random.seed(42)
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = .03
sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 5; sc.cycles.glossy_bounces = 3
sc.render.resolution_x, sc.render.resolution_y = 1080, 1100; sc.render.resolution_percentage = int(RES * 100)
sc.render.fps = 12
try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
sc.view_settings.exposure = .3
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 90
sc.render.filepath = OUT.rstrip('/') + '/f'
W = bpy.data.worlds.new('w'); sc.world = W; W.use_nodes = True
W.node_tree.nodes['Background'].inputs['Color'].default_value = (.012, .008, .005, 1); W.node_tree.nodes['Background'].inputs['Strength'].default_value = 1

def mat_gold():
    m = bpy.data.materials.new('ouro'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    b.inputs['Metallic'].default_value = 1; b.inputs['Base Color'].default_value = (1.0, .72, .32, 1)
    tc = N.new('ShaderNodeTexCoord')
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 18; nz.inputs['Detail'].default_value = 8; L.new(tc.outputs['Object'], nz.inputs['Vector'])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = .16; mr.inputs['To Max'].default_value = .42; L.new(nz.outputs['Fac'], mr.inputs['Value']); L.new(mr.outputs['Result'], b.inputs['Roughness'])
    # gravações finas em volta do aro
    wv = N.new('ShaderNodeTexWave'); wv.wave_type = 'RINGS'; wv.inputs['Scale'].default_value = 40; wv.inputs['Distortion'].default_value = 1.5; L.new(tc.outputs['Object'], wv.inputs['Vector'])
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .35; bump.inputs['Distance'].default_value = .004
    mx = N.new('ShaderNodeMath'); mx.operation = 'MULTIPLY_ADD'; L.new(wv.outputs['Fac'], mx.inputs[0]); mx.inputs[1].default_value = .6; L.new(nz.outputs['Fac'], mx.inputs[2])
    L.new(mx.outputs[0], bump.inputs['Height']); L.new(bump.outputs['Normal'], b.inputs['Normal'])
    # escurecido nas reentrâncias (ouro velho)
    ao = N.new('ShaderNodeAmbientOcclusion'); ao.inputs['Distance'].default_value = .08
    mc = N.new('ShaderNodeMix'); mc.data_type = 'RGBA'; L.new(ao.outputs['AO'], mc.inputs['Factor'])
    mc.inputs[6].default_value = (.35, .2, .07, 1); mc.inputs[7].default_value = (1.0, .72, .32, 1); L.new(mc.outputs[2], b.inputs['Base Color'])
    return m
def mat_eye():
    m = bpy.data.materials.new('olho'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); sx = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sx.inputs['Vector'])
    vl = N.new('ShaderNodeVectorMath'); vl.operation = 'NORMALIZE'; L.new(tc.outputs['Object'], vl.inputs[0])
    sz = N.new('ShaderNodeSeparateXYZ'); L.new(vl.outputs['Vector'], sz.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB'); L.new(sz.outputs['Z'], ramp.inputs['Fac'])
    E_ = ramp.color_ramp.elements; E_[0].position = .80; E_[0].color = (.86, .8, .74, 1); E_[1].position = .99; E_[1].color = (0, 0, 0, 1)
    e2 = E_.new(.915); e2.color = (.86, .8, .74, 1); e3 = E_.new(.925); e3.color = (.2, .27, .17, 1); e4 = E_.new(.965); e4.color = (.45, .55, .36, 1); e5 = E_.new(.978); e5.color = (.02, .02, .02, 1)
    # veias vermelhas na parte branca
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9; nz.inputs['Detail'].default_value = 10; nz.inputs['Distortion'].default_value = 2; L.new(tc.outputs['Object'], nz.inputs['Vector'])
    vr = N.new('ShaderNodeValToRGB'); vr.color_ramp.elements[0].position = .62; vr.color_ramp.elements[1].position = .7; L.new(nz.outputs['Fac'], vr.inputs['Fac'])
    mxv = N.new('ShaderNodeMix'); mxv.data_type = 'RGBA'; mxv.blend_type = 'MULTIPLY'
    gate = N.new('ShaderNodeMath'); gate.operation = 'LESS_THAN'; gate.inputs[1].default_value = .85; L.new(sz.outputs['Z'], gate.inputs[0])
    gm = N.new('ShaderNodeMath'); gm.operation = 'MULTIPLY'; L.new(gate.outputs[0], gm.inputs[0]); inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1; L.new(vr.outputs['Color'], inv.inputs[1]); L.new(inv.outputs[0], gm.inputs[1])
    gm2 = N.new('ShaderNodeMath'); gm2.operation = 'MULTIPLY'; gm2.inputs[1].default_value = .6; L.new(gm.outputs[0], gm2.inputs[0])
    L.new(gm2.outputs[0], mxv.inputs['Factor']); L.new(ramp.outputs['Color'], mxv.inputs[6]); mxv.inputs[7].default_value = (.75, .12, .1, 1)
    L.new(mxv.outputs[2], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = .35; b.inputs['Coat Weight'].default_value = 1; b.inputs['Coat Roughness'].default_value = .02
    b.inputs['Subsurface Weight'].default_value = .15; b.inputs['Subsurface Radius'].default_value = (.4, .15, .1)
    return m
GOLD, EYE = mat_gold(), mat_eye()
SOCK = bpy.data.materials.new('pele'); SOCK.use_nodes = True; sb = SOCK.node_tree.nodes['Principled BSDF']
sb.inputs['Base Color'].default_value = (.32, .16, .1, 1); sb.inputs['Roughness'].default_value = .55; sb.inputs['Subsurface Weight'].default_value = .3; sb.inputs['Subsurface Radius'].default_value = (.5, .2, .1)

cam_data = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_data); bpy.context.collection.objects.link(cam); sc.camera = cam
EYES = []
def make_ring(name, rot0):
    piv = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(piv); piv.rotation_mode = 'XYZ'; piv.rotation_euler = rot0
    bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=.12, major_segments=128, minor_segments=24)
    tor = bpy.context.object; tor.data.materials.append(GOLD); bpy.ops.object.shade_smooth(); tor.scale = (1, 1, .38); tor.parent = piv
    # filetes (dois aros finos de cada lado)
    for off in (-.135, .135):
        bpy.ops.mesh.primitive_torus_add(major_radius=1.0 + off, minor_radius=.018, major_segments=128, minor_segments=10)
        t2 = bpy.context.object; t2.data.materials.append(GOLD); bpy.ops.object.shade_smooth(); t2.parent = piv
    for i in range(24):
        a = (i % 12) / 12 * 2 * math.pi + (math.pi / 12 if i >= 12 else 0)
        holder = bpy.data.objects.new(f'{name}_h{i}', None); bpy.context.collection.objects.link(holder); holder.parent = piv
        holder.location = (math.cos(a), math.sin(a), .0); holder.rotation_euler = (0, 0, 0) if i < 12 else (math.pi, 0, 0)
        bpy.ops.mesh.primitive_torus_add(major_radius=.1, minor_radius=.026, major_segments=48, minor_segments=12)
        s = bpy.context.object; s.data.materials.append(SOCK); bpy.ops.object.shade_smooth(); s.parent = holder; s.location = (0, 0, .055)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.092, segments=48, ring_count=24)
        e = bpy.context.object; e.data.materials.append(EYE); bpy.ops.object.shade_smooth(); e.parent = holder; e.location = (0, 0, .045); e.rotation_mode = 'XYZ'
        EYES.append(e)
    return piv
R1 = make_ring('roda1', (math.radians(20), math.radians(-35), 0))
R2 = make_ring('roda2', (math.radians(80), math.radians(25), math.radians(30)))
for r in (R1, R2): r.location = (0, 0, 0)

# luz de vela (duas fontes quentes que tremem) + recorte frio fraco
def candle(loc, energy, size):
    bpy.ops.object.light_add(type='POINT', location=loc); L_ = bpy.context.object; L_.data.energy = energy; L_.data.color = (1, .62, .3); L_.data.shadow_soft_size = size
    L_.data.keyframe_insert('energy', frame=1); fc = L_.data.animation_data.action.fcurves[0]; md = fc.modifiers.new('NOISE'); md.scale = 2.5; md.strength = energy * .35
    return L_
candle((-1.6, -1.2, -1.4), 260, .25); candle((1.4, -.9, -1.8), 120, .2)
bpy.ops.object.light_add(type='AREA', location=(-.6, -3.2, -.9)); fl = bpy.context.object; fl.data.energy = 90; fl.data.size = 1.2; fl.data.color = (1, .7, .45)
fl.rotation_euler = (mathutils.Vector((0, 0, 0)) - fl.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.light_add(type='AREA', location=(1.2, 2.2, 2.0)); r = bpy.context.object; r.data.energy = 60; r.data.size = 2; r.data.color = (.6, .75, 1)
r.rotation_euler = (mathutils.Vector((0, 0, 0)) - r.location).to_track_quat('-Z', 'Y').to_euler()

def key_rot(obj, frame, eul): obj.rotation_euler = eul; obj.keyframe_insert('rotation_euler', frame=frame)
def linear_all():
    for o in bpy.data.objects:
        if o.animation_data and o.animation_data.action:
            for fc in o.animation_data.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'
if SHOT == 'A':
    sc.frame_start, sc.frame_end = 1, 37
    cam.location = (0, -4.4, .25); cam_data.lens = 50
    cam.rotation_euler = (mathutils.Vector((0, 0, 0)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.keyframe_insert('location', frame=1); cam.location = (0, -3.8, .2); cam.keyframe_insert('location', frame=37)
    for r_, sp in ((R1, 1), (R2, -1.3)):
        e0 = r_.rotation_euler.copy(); key_rot(r_, 1, e0); key_rot(r_, 37, (e0.x + sp * .5, e0.y + sp * .9, e0.z + sp * .7))
    # os olhos "acordam": começam virados para dentro (só o branco) e rolam para fora, um de cada vez
    for i, e in enumerate(EYES):
        f0 = 2 + (i * 7) % 12
        key_rot(e, 1, (math.radians(170), math.radians(random.uniform(-20, 20)), 0)); key_rot(e, f0, (math.radians(170), 0, 0))
        key_rot(e, f0 + 4, (math.radians(random.uniform(-25, 25)), math.radians(random.uniform(-30, 30)), 0))
        key_rot(e, f0 + 14, (math.radians(random.uniform(-30, 30)), math.radians(random.uniform(-35, 35)), 0))
        key_rot(e, 37, (math.radians(random.uniform(-30, 30)), math.radians(random.uniform(-35, 35)), 0))
else:
    sc.frame_start, sc.frame_end = 1, 49
    cam.location = (.1, -3.3, .1); cam_data.lens = 50
    cam.rotation_euler = (mathutils.Vector((0, 0, 0)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.keyframe_insert('location', frame=1); cam.location = (.05, -2.75, .05); cam.keyframe_insert('location', frame=49)
    for r_, sp in ((R1, 1), (R2, -1.3)):
        e0 = r_.rotation_euler.copy(); key_rot(r_, 1, e0); key_rot(r_, 22, (e0.x + sp * .12, e0.y + sp * .2, e0.z + sp * .15)); key_rot(r_, 49, (e0.x + sp * .14, e0.y + sp * .23, e0.z + sp * .17))
    # olham para todo lado… e então param e encaram a câmera; um deles continua olhando para o lado
    target = cam; ODD = 4
    for i, e in enumerate(EYES):
        for fr in (1, 6, 11, 16, 21): key_rot(e, fr, (math.radians(random.uniform(-40, 40)), math.radians(random.uniform(-45, 45)), 0))
        if i == ODD:
            key_rot(e, 30, (math.radians(10), math.radians(55), 0)); key_rot(e, 49, (math.radians(12), math.radians(58), 0)); continue
        cn = e.constraints.new('DAMPED_TRACK'); cn.target = target; cn.track_axis = 'TRACK_Z'
        cn.influence = 0; cn.keyframe_insert('influence', frame=23 + (i % 3)); cn.influence = 1; cn.keyframe_insert('influence', frame=26 + (i % 3))
    cam_data.dof.use_dof = True; cam_data.dof.focus_distance = 2.9; cam_data.dof.aperture_fstop = 4
if SHOT == 'A': cam_data.dof.use_dof = True; cam_data.dof.focus_distance = 4.0; cam_data.dof.aperture_fstop = 5
linear_all()
if '--still' in argv:
    sc.frame_set(int(argv[argv.index('--still') + 1])); sc.render.filepath = OUT; bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
