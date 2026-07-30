import { Registry, Entity } from './Registry';
import { TransformComponent, TRS } from '../transforms/TRS';
import { RenderComponent } from '../renderer/RenderPipeline';

export class SceneInitializer {
  public static initialize(registry: Registry): void {
    registry.clear();

    // 1. Root Entity
    const body = registry.createEntity('body');
    registry.addComponent(body, new TransformComponent(new TRS({ x: 0, y: 0 }), null));

    // 2. Main Cavity/Region Compartments (Scene Graph Parents)
    const head = registry.createEntity('head');
    registry.addComponent(head, new TransformComponent(new TRS({ x: 0, y: -180 }), body));

    const neck = registry.createEntity('neck');
    registry.addComponent(neck, new TransformComponent(new TRS({ x: 0, y: -150 }), body));

    const thorax = registry.createEntity('thorax');
    registry.addComponent(thorax, new TransformComponent(new TRS({ x: 0, y: -85 }), body));

    const abdomen = registry.createEntity('abdomen');
    registry.addComponent(abdomen, new TransformComponent(new TRS({ x: 0, y: -20 }), body));

    const pelvis = registry.createEntity('pelvis');
    registry.addComponent(pelvis, new TransformComponent(new TRS({ x: 0, y: 20 }), body));

    const upperLimbs = registry.createEntity('upperLimbs');
    registry.addComponent(upperLimbs, new TransformComponent(new TRS({ x: 0, y: -70 }), body));

    const lowerLimbs = registry.createEntity('lowerLimbs');
    registry.addComponent(lowerLimbs, new TransformComponent(new TRS({ x: 0, y: 35 }), body));

    // 3. ORGANS REGISTRATION - REMOVED (ONLY SKELETON IS IMPLEMENTED)

    // 4. SKELETAL SYSTEM BONES REGISTRATION (All 47 Bone catalog IDs)

    // Cranium Group
    registry.addComponent(registry.createEntity('bone-frontal'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-frontal', {
      type: 'RenderComponent',
      name: 'Frontal Bone',
      svgPath: 'M -15 -5 C -25 -22, 0 -30, 0 -12 C 0 -5, -15 -5, -15 -5',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-parietal'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-parietal', {
      type: 'RenderComponent',
      name: 'Parietal Bones',
      svgPath: 'M 0 -30 C 25 -22, 15 -5, 0 -12',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-temporal'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-temporal', {
      type: 'RenderComponent',
      name: 'Temporal Bones',
      svgPath: 'M -20 -15 C -24 -15, -24 -5, -20 -5 M 20 -15 C 24 -15, 24 -5, 20 -5',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-occipital'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-occipital', {
      type: 'RenderComponent',
      name: 'Occipital Bone',
      svgPath: 'M -8 -28 C -14 -32, 14 -32, 8 -28',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-sphenoid'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-sphenoid', {
      type: 'RenderComponent',
      name: 'Sphenoid Bone',
      svgPath: 'M -10 -15 C -12 -18, 12 -18, 10 -15',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-ethmoid'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-ethmoid', {
      type: 'RenderComponent',
      name: 'Ethmoid Bone',
      svgPath: 'M -3 -18 C -5 -20, 5 -20, 3 -18',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-auditory-ossicles'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-auditory-ossicles', {
      type: 'RenderComponent',
      name: 'Auditory Ossicles',
      svgPath: 'M -16 -18 A 1 1 0 1 0 -14 -18 A 1 1 0 1 0 -16 -18 M 14 -18 A 1 1 0 1 0 16 -18 A 1 1 0 1 0 14 -18',
      lodMin: 2,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#64748b',
      baseStroke: '#475569',
      baseStrokeWidth: 0.5
    } as RenderComponent);

    // Facial Bones Group
    registry.addComponent(registry.createEntity('bone-mandible'), new TransformComponent(new TRS({ x: 0, y: 16 }), head));
    registry.addComponent('bone-mandible', {
      type: 'RenderComponent',
      name: 'Mandible (Jawbone)',
      svgPath: 'M -11 0 L -9 10 C -7 13, 7 13, 9 10 L 11 0 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-maxilla'), new TransformComponent(new TRS({ x: 0, y: 6 }), head));
    registry.addComponent('bone-maxilla', {
      type: 'RenderComponent',
      name: 'Maxillae',
      svgPath: 'M -10 -8 C -12 -2, 12 -2, 10 -8 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-zygomatic'), new TransformComponent(new TRS({ x: 0, y: 2 }), head));
    registry.addComponent('bone-zygomatic', {
      type: 'RenderComponent',
      name: 'Zygomatic Bones (Orbits)',
      svgPath: 'M -10 -2 A 4 5.5 0 1 0 -2 -2 A 4 5.5 0 1 0 -10 -2 M 2 -2 A 4 5.5 0 1 0 10 -2 A 4 5.5 0 1 0 2 -2',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#020617',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-nasal'), new TransformComponent(new TRS({ x: 0, y: 0 }), head));
    registry.addComponent('bone-nasal', {
      type: 'RenderComponent',
      name: 'Nasal Bones',
      svgPath: 'M -3 -12 L 3 -12 L 2 -4 L -2 -4 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-lacrimal'), new TransformComponent(new TRS({ x: 0, y: 0 }), head));
    registry.addComponent('bone-lacrimal', {
      type: 'RenderComponent',
      name: 'Lacrimal Bones',
      svgPath: 'M -9 -14 L -7 -14 L -7 -10 L -9 -10 Z M 7 -14 L 9 -14 L 9 -10 L 7 -10 Z',
      lodMin: 2,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-vomer'), new TransformComponent(new TRS({ x: 0, y: 8 }), head));
    registry.addComponent('bone-vomer', {
      type: 'RenderComponent',
      name: 'Vomer',
      svgPath: 'M 0 -12 L -3 -6 L 3 -6 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#020617',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-palatine'), new TransformComponent(new TRS({ x: 0, y: 6 }), head));
    registry.addComponent('bone-palatine', {
      type: 'RenderComponent',
      name: 'Palatine Bones',
      svgPath: 'M -6 0 L 6 0',
      lodMin: 2,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-inferior-conchae'), new TransformComponent(new TRS({ x: 0, y: 10 }), head));
    registry.addComponent('bone-inferior-conchae', {
      type: 'RenderComponent',
      name: 'Inferior Nasal Conchae',
      svgPath: 'M -4 -8 L -6 -6 M 4 -8 L 6 -6',
      lodMin: 2,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-hyoid'), new TransformComponent(new TRS({ x: 0, y: -8 }), neck));
    registry.addComponent('bone-hyoid', {
      type: 'RenderComponent',
      name: 'Hyoid Bone',
      svgPath: 'M -5 -8 Q 0 -5, 5 -8',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.5
    } as RenderComponent);

    // Spine Vertebrae row (Parented based on body region)
    registry.addComponent(registry.createEntity('bone-c1-atlas'), new TransformComponent(new TRS({ x: 0, y: 2 }), neck));
    registry.addComponent('bone-c1-atlas', {
      type: 'RenderComponent',
      name: 'C1 Vertebra (Atlas)',
      svgPath: 'M -2.5 2 H 2.5 V 6.5 H -2.5 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-c2-axis'), new TransformComponent(new TRS({ x: 0, y: 8 }), neck));
    registry.addComponent('bone-c2-axis', {
      type: 'RenderComponent',
      name: 'C2 Vertebra (Axis)',
      svgPath: 'M -2.5 8 H 2.5 V 12.5 H -2.5 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-cervical'), new TransformComponent(new TRS({ x: 0, y: 14 }), neck));
    registry.addComponent('bone-cervical', {
      type: 'RenderComponent',
      name: 'C3-C7 Cervical Vertebrae',
      svgPath: 'M -2.5 14 H 2.5 V 18.5 H -2.5 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-thoracic'), new TransformComponent(new TRS({ x: 0, y: -45 }), thorax));
    registry.addComponent('bone-thoracic', {
      type: 'RenderComponent',
      name: 'Thoracic Spine (T1-T12)',
      svgPath: 'M -3.5 -45 H 3.5 V 27 H -3.5 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-lumbar'), new TransformComponent(new TRS({ x: 0, y: -38 }), abdomen));
    registry.addComponent('bone-lumbar', {
      type: 'RenderComponent',
      name: 'Lumbar Spine (L1-L5)',
      svgPath: 'M -4.5 -38 H 4.5 V -14 H -4.5 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-sacrum'), new TransformComponent(new TRS({ x: 0, y: -48 }), pelvis));
    registry.addComponent('bone-sacrum', {
      type: 'RenderComponent',
      name: 'Sacrum',
      svgPath: 'M -4.5 -48 L 4.5 -48 L 3 -42 L 0 -38 L -3 -42 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-coccyx'), new TransformComponent(new TRS({ x: 0, y: -38 }), pelvis));
    registry.addComponent('bone-coccyx', {
      type: 'RenderComponent',
      name: 'Coccyx (Tailbone)',
      svgPath: 'M -2.5 -38 L 2.5 -38 L 0 -33 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    // Thoracic cage group
    registry.addComponent(registry.createEntity('bone-sternum-manubrium'), new TransformComponent(new TRS({ x: 0, y: -35 }), thorax));
    registry.addComponent('bone-sternum-manubrium', {
      type: 'RenderComponent',
      name: 'Manubrium (Sternum)',
      svgPath: 'M -2 -35 H 2.5 V -20 H -2 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-sternum-body'), new TransformComponent(new TRS({ x: 0, y: -20 }), thorax));
    registry.addComponent('bone-sternum-body', {
      type: 'RenderComponent',
      name: 'Sternum Body',
      svgPath: 'M -2 -20 H 2.5 V 10 H -2 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-sternum-xiphoid'), new TransformComponent(new TRS({ x: 0, y: 10 }), thorax));
    registry.addComponent('bone-sternum-xiphoid', {
      type: 'RenderComponent',
      name: 'Xiphoid Process',
      svgPath: 'M -1 10 H 1.5 V 17 H -1 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-ribs-true'), new TransformComponent(new TRS({ x: 0, y: -30 }), thorax));
    registry.addComponent('bone-ribs-true', {
      type: 'RenderComponent',
      name: 'True Ribs (1-7)',
      svgPath: 'M -4 -10 Q -38 -8, -42 12 M 4 -10 Q 38 -8, 42 12 M -4 -1 M 4 -1 M -4 8 M 4 8',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.5
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-ribs-false'), new TransformComponent(new TRS({ x: 0, y: 10 }), thorax));
    registry.addComponent('bone-ribs-false', {
      type: 'RenderComponent',
      name: 'False Ribs (8-10)',
      svgPath: 'M -4 2 Q -38 4, -42 18 M 4 2 Q 38 4, 42 18',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-ribs-floating'), new TransformComponent(new TRS({ x: 0, y: 28 }), thorax));
    registry.addComponent('bone-ribs-floating', {
      type: 'RenderComponent',
      name: 'Floating Ribs (11-12)',
      svgPath: 'M -4 2 Q -34 4, -38 12 M 4 2 Q 34 4, 38 12',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Pectoral Shoulder Girdle Group
    registry.addComponent(registry.createEntity('bone-clavicle'), new TransformComponent(new TRS({ x: 0, y: -37 }), thorax));
    registry.addComponent('bone-clavicle', {
      type: 'RenderComponent',
      name: 'Clavicles (Collarbones)',
      svgPath: 'M -4 0 Q -22 2, -42 8 M 4 0 Q 22 2, 42 8',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-scapula'), new TransformComponent(new TRS({ x: 0, y: -29 }), thorax));
    registry.addComponent('bone-scapula', {
      type: 'RenderComponent',
      name: 'Scapulae (Shoulder Blades)',
      svgPath: 'M -42 -114 L -28 -88 L -42 -92 Z M 42 -114 L 28 -88 L 42 -92 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#0f172a',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    // Upper Limbs arm & hand
    registry.addComponent(registry.createEntity('bone-humerus'), new TransformComponent(new TRS({ x: 0, y: -44 }), upperLimbs));
    registry.addComponent('bone-humerus', {
      type: 'RenderComponent',
      name: 'Humerus',
      svgPath: 'M -42 -44 L -75 30 M 42 -44 L 75 30',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-radius'), new TransformComponent(new TRS({ x: 0, y: 30 }), upperLimbs));
    registry.addComponent('bone-radius', {
      type: 'RenderComponent',
      name: 'Radius',
      svgPath: 'M -75 30 L -97 98 M 75 30 L 97 98',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.6
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-ulna'), new TransformComponent(new TRS({ x: 0, y: 30 }), upperLimbs));
    registry.addComponent('bone-ulna', {
      type: 'RenderComponent',
      name: 'Ulna',
      svgPath: 'M -73 30 L -93 98 M 73 30 L 93 98',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.6
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-carpals'), new TransformComponent(new TRS({ x: 0, y: 102 }), upperLimbs));
    registry.addComponent('bone-carpals', {
      type: 'RenderComponent',
      name: 'Carpals (Wrist)',
      svgPath: 'M -97.5 0 A 2.5 2.5 0 1 0 -92.5 0 A 2.5 2.5 0 1 0 -97.5 0 M 92.5 0 A 2.5 2.5 0 1 0 97.5 0 A 2.5 2.5 0 1 0 92.5 0',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-metacarpals'), new TransformComponent(new TRS({ x: 0, y: 102 }), upperLimbs));
    registry.addComponent('bone-metacarpals', {
      type: 'RenderComponent',
      name: 'Metacarpals (Palm)',
      svgPath: 'M -95 0 L -102 6 M -95 0 L -98 12 M -95 0 L -95 14 M -95 0 L -92 12 M -95 0 L -89 8 M 95 0 L 102 6 M 95 0 L 98 12 M 95 0 L 95 14 M 95 0 L 92 12 M 95 0 L 89 8',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-phalanges-hand'), new TransformComponent(new TRS({ x: 0, y: 102 }), upperLimbs));
    registry.addComponent('bone-phalanges-hand', {
      type: 'RenderComponent',
      name: 'Hand Phalanges (Fingers)',
      svgPath: 'M -102 6 L -106 10 M -98 12 L -100 22 M -95 14 L -95 25 M -92 12 L -91 22 M -89 8 L -87 17 M 102 6 L 106 10 M 98 12 L 100 22 M 95 14 L 95 25 M 92 12 L 91 22 M 89 8 L 87 17',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Pelvis hips
    registry.addComponent(registry.createEntity('bone-ilium'), new TransformComponent(new TRS({ x: 0, y: -4 }), pelvis));
    registry.addComponent('bone-ilium', {
      type: 'RenderComponent',
      name: 'Ilium (Pelvic Wings)',
      svgPath: 'M -28 -44 C -44 -44, -46 -22, -20 -12 C -16 -12, -20 -26, -24 -38 Z M 26 -44 C 44 -44, 46 -22, 20 -12 C 16 -12, 20 -26, 24 -38 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-ischium'), new TransformComponent(new TRS({ x: 0, y: -4 }), pelvis));
    registry.addComponent('bone-ischium', {
      type: 'RenderComponent',
      name: 'Ischium',
      svgPath: 'M -16 -14 C -20 -12, -18 -4, -10 -6 C -12 -10, -14 -14, -16 -14 Z M 16 -14 C 20 -12, 18 -4, 10 -6 C 12 -10, 14 -14, 16 -14 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#0f172a',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-pubis'), new TransformComponent(new TRS({ x: 0, y: -4 }), pelvis));
    registry.addComponent('bone-pubis', {
      type: 'RenderComponent',
      name: 'Pubis',
      svgPath: 'M -7 -42 L 7 -42 L 4 -16 L 0 -8 L -4 -16 Z',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#0f172a',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    // Lower Limbs leg & foot
    registry.addComponent(registry.createEntity('bone-femur'), new TransformComponent(new TRS({ x: 0, y: -31 }), lowerLimbs));
    registry.addComponent('bone-femur', {
      type: 'RenderComponent',
      name: 'Femur',
      svgPath: 'M -22 -31 L -35 85 M 22 -31 L 35 85',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 4.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-patella'), new TransformComponent(new TRS({ x: 0, y: 90 }), lowerLimbs));
    registry.addComponent('bone-patella', {
      type: 'RenderComponent',
      name: 'Patella',
      svgPath: 'M -38.2 0 A 3.2 3.2 0 1 0 -31.8 0 A 3.2 3.2 0 1 0 -38.2 0 M 31.8 0 A 3.2 3.2 0 1 0 38.2 0 A 3.2 3.2 0 1 0 31.8 0',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#475569',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-tibia'), new TransformComponent(new TRS({ x: 0, y: 95 }), lowerLimbs));
    registry.addComponent('bone-tibia', {
      type: 'RenderComponent',
      name: 'Tibia',
      svgPath: 'M -35 95 L -35 195 M 35 95 L 35 195',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-fibula'), new TransformComponent(new TRS({ x: 0, y: 95 }), lowerLimbs));
    registry.addComponent('bone-fibula', {
      type: 'RenderComponent',
      name: 'Fibula',
      svgPath: 'M -39 95 L -39 195 M 39 95 L 39 195',
      lodMin: 0,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-tarsals'), new TransformComponent(new TRS({ x: 0, y: 197 }), lowerLimbs));
    registry.addComponent('bone-tarsals', {
      type: 'RenderComponent',
      name: 'Tarsals',
      svgPath: 'M -39.8 0 A 2.8 2.8 0 1 0 -34.2 0 A 2.8 2.8 0 1 0 -39.8 0 M 34.2 0 A 2.8 2.8 0 1 0 39.8 0 A 2.8 2.8 0 1 0 34.2 0',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-metatarsals'), new TransformComponent(new TRS({ x: 0, y: 197 }), lowerLimbs));
    registry.addComponent('bone-metatarsals', {
      type: 'RenderComponent',
      name: 'Metatarsals',
      svgPath: 'M -39 1 L -44 10 M -38 2 L -41 12 M -37 2 L -37 13 M -36 2 L -33 12 M -35 1 L -29 9 M 39 1 L 44 10 M 38 2 L 41 12 M 37 2 L 37 13 M 36 2 L 33 12 M 35 1 L 29 9',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-phalanges-foot'), new TransformComponent(new TRS({ x: 0, y: 197 }), lowerLimbs));
    registry.addComponent('bone-phalanges-foot', {
      type: 'RenderComponent',
      name: 'Foot Phalanges',
      svgPath: 'M -44 10 L -47 14 M -41 12 L -43 17 M -37 13 L -37 19 M -33 12 L -32 17 M -29 9 L -26 13 M 44 10 L 47 14 M 41 12 L 43 17 M 37 13 L 37 19 M 33 12 L 32 17 M 29 9 L 26 13',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
  }
}
