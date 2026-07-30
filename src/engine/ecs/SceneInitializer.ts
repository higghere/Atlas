import { Registry, Entity } from './Registry';
import { TransformComponent, TRS } from '../transforms/TRS';
import { RenderComponent } from '../renderer/RenderPipeline';
import { BoneComponent, LandmarkComponent, BoundingBox } from './components';

export class SceneInitializer {
  public static initialize(registry: Registry): void {
    registry.clear();

    // 1. Root Entity
    const body = registry.createEntity('body');
    registry.addComponent(body, new TransformComponent(new TRS({ x: 0, y: 0 }), null));

    // 2. Main Compartments
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

    // 3. Register Bones
    // Cranium
    this.registerBone(registry, 'bone-frontal', 'Frontal Bone', 'Os frontale', 'head', head,
      'M -15 -5 C -25 -22, 0 -30, 0 -12 C 0 -5, -15 -5, -15 -5', 0, 6,
      { minX: -25, minY: -30, maxX: 0, maxY: -5 }, { x: 0, y: -5 }, ['landmark-glabella']);

    this.registerBone(registry, 'bone-parietal', 'Parietal Bones', 'Ossa parietalia', 'head', head,
      'M 0 -30 C 25 -22, 15 -5, 0 -12', 0, 6,
      { minX: 0, minY: -30, maxX: 25, maxY: -5 }, { x: 0, y: -5 }, ['landmark-vertex']);

    this.registerBone(registry, 'bone-temporal', 'Temporal Bones', 'Ossa temporalia', 'head', head,
      'M -20 -15 C -24 -15, -24 -5, -20 -5 M 20 -15 C 24 -15, 24 -5, 20 -5', 1, 6,
      { minX: -24, minY: -15, maxX: 24, maxY: -5 }, { x: 0, y: -5 });

    this.registerBone(registry, 'bone-occipital', 'Occipital Bone', 'Os occipitale', 'head', head,
      'M -8 -28 C -14 -32, 14 -32, 8 -28', 1, 6,
      { minX: -14, minY: -32, maxX: 14, maxY: -28 }, { x: 0, y: -5 }, ['landmark-eop']);

    this.registerBone(registry, 'bone-sphenoid', 'Sphenoid Bone', 'Os sphenoidale', 'head', head,
      'M -10 -15 C -12 -18, 12 -18, 10 -15', 1, 6,
      { minX: -12, minY: -18, maxX: 12, maxY: -15 }, { x: 0, y: -5 });

    this.registerBone(registry, 'bone-ethmoid', 'Ethmoid Bone', 'Os ethmoidale', 'head', head,
      'M -3 -18 C -5 -20, 5 -20, 3 -18', 1, 6,
      { minX: -5, minY: -20, maxX: 5, maxY: -18 }, { x: 0, y: -5 });

    this.registerBone(registry, 'bone-auditory-ossicles', 'Auditory Ossicles', 'Ossicula auditus', 'head', head,
      'M -16 -18 A 1 1 0 1 0 -14 -18 A 1 1 0 1 0 -16 -18 M 14 -18 A 1 1 0 1 0 16 -18 A 1 1 0 1 0 14 -18', 2, 6,
      { minX: -16, minY: -19, maxX: 16, maxY: -17 }, { x: 0, y: -5 });

    // Facial
    this.registerBone(registry, 'bone-mandible', 'Mandible (Jawbone)', 'Mandibula', 'head', head,
      'M -11 0 L -9 10 C -7 13, 7 13, 9 10 L 11 0 Z', 0, 6,
      { minX: -11, minY: 0, maxX: 11, maxY: 13 }, { x: 0, y: 16 });

    this.registerBone(registry, 'bone-maxilla', 'Maxillae', 'Maxillae', 'head', head,
      'M -10 -8 C -12 -2, 12 -2, 10 -8 Z', 1, 6,
      { minX: -12, minY: -8, maxX: 12, maxY: -2 }, { x: 0, y: 6 });

    this.registerBone(registry, 'bone-zygomatic', 'Zygomatic Bones (Orbits)', 'Ossa zygomatica', 'head', head,
      'M -10 -2 A 4 5.5 0 1 0 -2 -2 A 4 5.5 0 1 0 -10 -2 M 2 -2 A 4 5.5 0 1 0 10 -2 A 4 5.5 0 1 0 2 -2', 0, 6,
      { minX: -10, minY: -7.5, maxX: 10, maxY: 3.5 }, { x: 0, y: 2 });

    this.registerBone(registry, 'bone-nasal', 'Nasal Bones', 'Ossa nasalia', 'head', head,
      'M -3 -12 L 3 -12 L 2 -4 L -2 -4 Z', 1, 6,
      { minX: -3, minY: -12, maxX: 3, maxY: -4 }, { x: 0, y: 0 });

    this.registerBone(registry, 'bone-lacrimal', 'Lacrimal Bones', 'Ossa lacrimalia', 'head', head,
      'M -9 -14 L -7 -14 L -7 -10 L -9 -10 Z M 7 -14 L 9 -14 L 9 -10 L 7 -10 Z', 2, 6,
      { minX: -9, minY: -14, maxX: 9, maxY: -10 }, { x: 0, y: 0 });

    this.registerBone(registry, 'bone-vomer', 'Vomer', 'Vomer', 'head', head,
      'M 0 -12 L -3 -6 L 3 -6 Z', 0, 6,
      { minX: -3, minY: -12, maxX: 3, maxY: -6 }, { x: 0, y: 8 });

    this.registerBone(registry, 'bone-palatine', 'Palatine Bones', 'Ossa palatina', 'head', head,
      'M -6 0 L 6 0', 2, 6,
      { minX: -6, minY: 0, maxX: 6, maxY: 0 }, { x: 0, y: 6 });

    this.registerBone(registry, 'bone-inferior-conchae', 'Inferior Nasal Conchae', 'Conchae nasales inferiores', 'head', head,
      'M -4 -8 L -6 -6 M 4 -8 L 6 -6', 2, 6,
      { minX: -6, minY: -8, maxX: 6, maxY: -6 }, { x: 0, y: 10 });

    // Neck
    this.registerBone(registry, 'bone-hyoid', 'Hyoid Bone', 'Os hyoideum', 'neck', neck,
      'M -5 -8 Q 0 -5, 5 -8', 0, 6,
      { minX: -5, minY: -8, maxX: 5, maxY: -5 }, { x: 0, y: -8 });

    // Spine
    this.registerBone(registry, 'bone-c1-atlas', 'C1 Vertebra (Atlas)', 'Atlas', 'neck', neck,
      'M -2.5 2 H 2.5 V 6.5 H -2.5 Z', 1, 6,
      { minX: -2.5, minY: 2, maxX: 2.5, maxY: 6.5 }, { x: 0, y: 2 });

    this.registerBone(registry, 'bone-c2-axis', 'C2 Vertebra (Axis)', 'Axis', 'neck', neck,
      'M -2.5 8 H 2.5 V 12.5 H -2.5 Z', 1, 6,
      { minX: -2.5, minY: 8, maxX: 2.5, maxY: 12.5 }, { x: 0, y: 8 });

    this.registerBone(registry, 'bone-cervical', 'C3-C7 Cervical Vertebrae', 'Vertebrae cervicales', 'neck', neck,
      'M -2.5 14 H 2.5 V 18.5 H -2.5 Z', 1, 6,
      { minX: -2.5, minY: 14, maxX: 2.5, maxY: 18.5 }, { x: 0, y: 14 });

    this.registerBone(registry, 'bone-thoracic', 'Thoracic Spine (T1-T12)', 'Vertebrae thoracicae', 'thorax', thorax,
      'M -3.5 -45 H 3.5 V 27 H -3.5 Z', 1, 6,
      { minX: -3.5, minY: -45, maxX: 3.5, maxY: 27 }, { x: 0, y: -45 });

    this.registerBone(registry, 'bone-lumbar', 'Lumbar Spine (L1-L5)', 'Vertebrae lumbales', 'abdomen', abdomen,
      'M -4.5 -38 H 4.5 V -14 H -4.5 Z', 1, 6,
      { minX: -4.5, minY: -38, maxX: 4.5, maxY: -14 }, { x: 0, y: -38 });

    this.registerBone(registry, 'bone-sacrum', 'Sacrum', 'Os sacrum', 'pelvis', pelvis,
      'M -4.5 -48 L 4.5 -48 L 3 -42 L 0 -38 L -3 -42 Z', 1, 6,
      { minX: -4.5, minY: -48, maxX: 4.5, maxY: -38 }, { x: 0, y: -48 });

    this.registerBone(registry, 'bone-coccyx', 'Coccyx (Tailbone)', 'Os coccygis', 'pelvis', pelvis,
      'M -2.5 -38 L 2.5 -38 L 0 -33 Z', 1, 6,
      { minX: -2.5, minY: -38, maxX: 2.5, maxY: -33 }, { x: 0, y: -38 });

    // Thorax Cage
    this.registerBone(registry, 'bone-sternum-manubrium', 'Manubrium (Sternum)', 'Manubrium sterni', 'thorax', thorax,
      'M -2 -35 H 2.5 V -20 H -2 Z', 0, 6,
      { minX: -2, minY: -35, maxX: 2.5, maxY: -20 }, { x: 0, y: -35 }, ['landmark-jugular-notch']);

    this.registerBone(registry, 'bone-sternum-body', 'Sternum Body', 'Corpus sterni', 'thorax', thorax,
      'M -2 -20 H 2.5 V 10 H -2 Z', 0, 6,
      { minX: -2, minY: -20, maxX: 2.5, maxY: 10 }, { x: 0, y: -20 });

    this.registerBone(registry, 'bone-sternum-xiphoid', 'Xiphoid Process', 'Processus xiphoideus', 'thorax', thorax,
      'M -1 10 H 1.5 V 17 H -1 Z', 0, 6,
      { minX: -1, minY: 10, maxX: 1.5, maxY: 17 }, { x: 0, y: 10 }, ['landmark-xiphoid']);

    this.registerBone(registry, 'bone-ribs-true', 'True Ribs (1-7)', 'Costae verae', 'thorax', thorax,
      'M -4 -10 Q -38 -8, -42 12 M 4 -10 Q 38 -8, 42 12', 0, 6,
      { minX: -42, minY: -10, maxX: 42, maxY: 12 }, { x: 0, y: -30 });

    this.registerBone(registry, 'bone-ribs-false', 'False Ribs (8-10)', 'Costae spuriae', 'thorax', thorax,
      'M -4 2 Q -38 4, -42 18 M 4 2 Q 38 4, 42 18', 0, 6,
      { minX: -42, minY: 2, maxX: 42, maxY: 18 }, { x: 0, y: 10 });

    this.registerBone(registry, 'bone-ribs-floating', 'Floating Ribs (11-12)', 'Costae fluctuantes', 'thorax', thorax,
      'M -4 2 Q -34 4, -38 12 M 4 2 Q 34 4, 38 12', 0, 6,
      { minX: -38, minY: 2, maxX: 38, maxY: 12 }, { x: 0, y: 28 });

    // Shoulder/Shoulder Girdle
    this.registerBone(registry, 'bone-clavicle', 'Clavicles', 'Claviculae', 'thorax', thorax,
      'M -4 0 Q -22 2, -42 8 M 4 0 Q 22 2, 42 8', 0, 6,
      { minX: -42, minY: 0, maxX: 42, maxY: 8 }, { x: 0, y: -37 });

    this.registerBone(registry, 'bone-scapula', 'Scapulae', 'Scapulae', 'thorax', thorax,
      'M -42 -114 L -28 -88 L -42 -92 Z M 42 -114 L 28 -88 L 42 -92 Z', 0, 6,
      { minX: -42, minY: -114, maxX: 42, maxY: -88 }, { x: 0, y: -29 }, ['landmark-acromion-left', 'landmark-acromion-right']);

    // Arms
    this.registerBone(registry, 'bone-humerus', 'Humerus', 'Humerus', 'arms', upperLimbs,
      'M -42 -44 L -75 30 M 42 -44 L 75 30', 0, 6,
      { minX: -75, minY: -44, maxX: 75, maxY: 30 }, { x: 0, y: -44 });

    this.registerBone(registry, 'bone-radius', 'Radius', 'Radius', 'arms', upperLimbs,
      'M -75 30 L -97 98 M 75 30 L 97 98', 0, 6,
      { minX: -97, minY: 30, maxX: 97, maxY: 98 }, { x: 0, y: 30 });

    this.registerBone(registry, 'bone-ulna', 'Ulna', 'Ulna', 'arms', upperLimbs,
      'M -73 30 L -93 98 M 73 30 L 93 98', 0, 6,
      { minX: -93, minY: 30, maxX: 93, maxY: 98 }, { x: 0, y: 30 });

    this.registerBone(registry, 'bone-carpals', 'Carpals', 'Ossa carpi', 'arms', upperLimbs,
      'M -97.5 0 A 2.5 2.5 0 1 0 -92.5 0 A 2.5 2.5 0 1 0 -97.5 0 M 92.5 0 A 2.5 2.5 0 1 0 97.5 0 A 2.5 2.5 0 1 0 92.5 0', 1, 6,
      { minX: -97.5, minY: -2.5, maxX: 97.5, maxY: 2.5 }, { x: 0, y: 102 });

    this.registerBone(registry, 'bone-metacarpals', 'Metacarpals', 'Ossa metacarpi', 'arms', upperLimbs,
      'M -95 0 L -102 6 M -95 0 L -98 12 M -95 0 L -95 14 M -95 0 L -92 12 M -95 0 L -89 8 M 95 0 L 102 6 M 95 0 L 98 12 M 95 0 L 95 14 M 95 0 L 92 12 M 95 0 L 89 8', 1, 6,
      { minX: -102, minY: 0, maxX: 102, maxY: 14 }, { x: 0, y: 102 });

    this.registerBone(registry, 'bone-phalanges-hand', 'Hand Phalanges', 'Phalanges digitorum manus', 'arms', upperLimbs,
      'M -102 6 L -106 10 M -98 12 L -100 22 M -95 14 L -95 25 M -92 12 L -91 22 M -89 8 L -87 17 M 102 6 L 106 10 M 98 12 L 100 22 M 95 14 L 95 25 M 92 12 L 91 22 M 89 8 L 87 17', 1, 6,
      { minX: -106, minY: 6, maxX: 106, maxY: 25 }, { x: 0, y: 102 });

    // Pelvis
    this.registerBone(registry, 'bone-ilium', 'Ilium', 'Os ilium', 'pelvis', pelvis,
      'M -28 -44 C -44 -44, -46 -22, -20 -12 C -16 -12, -20 -26, -24 -38 Z M 26 -44 C 44 -44, 46 -22, 20 -12 C 16 -12, 20 -26, 24 -38 Z', 0, 6,
      { minX: -46, minY: -44, maxX: 46, maxY: -12 }, { x: 0, y: -4 }, ['landmark-asis-left', 'landmark-asis-right', 'landmark-psis-left', 'landmark-psis-right']);

    this.registerBone(registry, 'bone-ischium', 'Ischium', 'Os ischii', 'pelvis', pelvis,
      'M -16 -14 C -20 -12, -18 -4, -10 -6 C -12 -10, -14 -14, -16 -14 Z M 16 -14 C 20 -12, 18 -4, 10 -6 C 12 -10, 14 -14, 16 -14 Z', 0, 6,
      { minX: -20, minY: -14, maxX: 20, maxY: -4 }, { x: 0, y: -4 });

    this.registerBone(registry, 'bone-pubis', 'Pubis', 'Os pubis', 'pelvis', pelvis,
      'M -7 -42 L 7 -42 L 4 -16 L 0 -8 L -4 -16 Z', 0, 6,
      { minX: -7, minY: -42, maxX: 7, maxY: -8 }, { x: 0, y: -4 }, ['landmark-pubic-symphysis']);

    // Legs
    this.registerBone(registry, 'bone-femur', 'Femur', 'Femur', 'legs', lowerLimbs,
      'M -22 -31 L -35 85 M 22 -31 L 35 85', 0, 6,
      { minX: -35, minY: -31, maxX: 35, maxY: 85 }, { x: 0, y: -31 }, ['landmark-trochanter-left', 'landmark-trochanter-right']);

    this.registerBone(registry, 'bone-patella', 'Patella', 'Patella', 'legs', lowerLimbs,
      'M -38.2 0 A 3.2 3.2 0 1 0 -31.8 0 A 3.2 3.2 0 1 0 -38.2 0 M 31.8 0 A 3.2 3.2 0 1 0 38.2 0 A 3.2 3.2 0 1 0 31.8 0', 1, 6,
      { minX: -38.2, minY: -3.2, maxX: 38.2, maxY: 3.2 }, { x: 0, y: 90 }, ['landmark-patella-left', 'landmark-patella-right']);

    this.registerBone(registry, 'bone-tibia', 'Tibia', 'Tibia', 'legs', lowerLimbs,
      'M -35 95 L -35 195 M 35 95 L 35 195', 0, 6,
      { minX: -35, minY: 95, maxX: 35, maxY: 195 }, { x: 0, y: 95 }, ['landmark-medial-malleolus-left', 'landmark-medial-malleolus-right']);

    this.registerBone(registry, 'bone-fibula', 'Fibula', 'Fibula', 'legs', lowerLimbs,
      'M -39 95 L -39 195 M 39 95 L 39 195', 0, 6,
      { minX: -39, minY: 95, maxX: 39, maxY: 195 }, { x: 0, y: 95 }, ['landmark-lateral-malleolus-left', 'landmark-lateral-malleolus-right']);

    this.registerBone(registry, 'bone-tarsals', 'Tarsals', 'Ossa tarsi', 'legs', lowerLimbs,
      'M -39.8 0 A 2.8 2.8 0 1 0 -34.2 0 A 2.8 2.8 0 1 0 -39.8 0 M 34.2 0 A 2.8 2.8 0 1 0 39.8 0 A 2.8 2.8 0 1 0 34.2 0', 1, 6,
      { minX: -39.8, minY: -2.8, maxX: 39.8, maxY: 2.8 }, { x: 0, y: 197 });

    this.registerBone(registry, 'bone-metatarsals', 'Metatarsals', 'Ossa metatarsi', 'legs', lowerLimbs,
      'M -39 1 L -44 10 M -38 2 L -41 12 M -37 2 L -37 13 M -36 2 L -33 12 M -35 1 L -29 9 M 39 1 L 44 10 M 38 2 L 41 12 M 37 2 L 37 13 M 36 2 L 33 12 M 35 1 L 29 9', 1, 6,
      { minX: -44, minY: 1, maxX: 44, maxY: 13 }, { x: 0, y: 197 });

    this.registerBone(registry, 'bone-phalanges-foot', 'Foot Phalanges', 'Phalanges digitorum pedis', 'legs', lowerLimbs,
      'M -44 10 L -47 14 M -41 12 L -43 17 M -37 13 L -37 19 M -33 12 L -32 17 M -29 9 L -26 13 M 44 10 L 47 14 M 41 12 L 43 17 M 37 13 L 37 19 M 33 12 L 32 17 M 29 9 L 26 13', 1, 6,
      { minX: -47, minY: 9, maxX: 47, maxY: 19 }, { x: 0, y: 197 });

    // 5. ANATOMICAL LANDMARKS REGISTRATION
    this.registerLandmark(registry, 'landmark-vertex', 'Vertex (Skull Apex)', 'bone-parietal', { x: 0, y: -15 });
    this.registerLandmark(registry, 'landmark-glabella', 'Glabella', 'bone-frontal', { x: 0, y: -5 });
    this.registerLandmark(registry, 'landmark-eop', 'External Occipital Protuberance', 'bone-occipital', { x: 0, y: 5 });
    this.registerLandmark(registry, 'landmark-jugular-notch', 'Jugular Notch', 'bone-sternum-manubrium', { x: 0, y: -7 });
    this.registerLandmark(registry, 'landmark-acromion-left', 'Acromion (L)', 'bone-scapula', { x: -42, y: -5 });
    this.registerLandmark(registry, 'landmark-acromion-right', 'Acromion (R)', 'bone-scapula', { x: 42, y: -5 });
    this.registerLandmark(registry, 'landmark-xiphoid', 'Xiphoid Process Apex', 'bone-sternum-xiphoid', { x: 0, y: 3 });
    this.registerLandmark(registry, 'landmark-umbilicus', 'Umbilicus', body, { x: 0, y: -28 });
    this.registerLandmark(registry, 'landmark-asis-left', 'ASIS (L)', 'bone-ilium', { x: -28, y: -38 });
    this.registerLandmark(registry, 'landmark-asis-right', 'ASIS (R)', 'bone-ilium', { x: 28, y: -38 });
    this.registerLandmark(registry, 'landmark-psis-left', 'PSIS (L)', 'bone-ilium', { x: -24, y: -42 });
    this.registerLandmark(registry, 'landmark-psis-right', 'PSIS (R)', 'bone-ilium', { x: 24, y: -42 });
    this.registerLandmark(registry, 'landmark-pubic-symphysis', 'Pubic Symphysis Joint', 'bone-pubis', { x: 0, y: -22 });
    this.registerLandmark(registry, 'landmark-trochanter-left', 'Greater Trochanter (L)', 'bone-femur', { x: -30, y: -20 });
    this.registerLandmark(registry, 'landmark-trochanter-right', 'Greater Trochanter (R)', 'bone-femur', { x: 30, y: -20 });
    this.registerLandmark(registry, 'landmark-patella-left', 'Patella Anchor (L)', 'bone-patella', { x: -35, y: 0 });
    this.registerLandmark(registry, 'landmark-patella-right', 'Patella Anchor (R)', 'bone-patella', { x: 35, y: 0 });
    this.registerLandmark(registry, 'landmark-medial-malleolus-left', 'Medial Malleolus (L)', 'bone-tibia', { x: -35, y: 195 });
    this.registerLandmark(registry, 'landmark-medial-malleolus-right', 'Medial Malleolus (R)', 'bone-tibia', { x: 35, y: 195 });
    this.registerLandmark(registry, 'landmark-lateral-malleolus-left', 'Lateral Malleolus (L)', 'bone-fibula', { x: -39, y: 195 });
    this.registerLandmark(registry, 'landmark-lateral-malleolus-right', 'Lateral Malleolus (R)', 'bone-fibula', { x: 39, y: 195 });
  }

  private static registerBone(
    registry: Registry,
    id: string,
    displayName: string,
    latinName: string,
    bodyRegion: 'head' | 'neck' | 'thorax' | 'abdomen' | 'pelvis' | 'arms' | 'legs',
    parent: Entity | null,
    svgPath: string,
    lodMin: number,
    lodMax: number,
    boundingBox: BoundingBox,
    pivot: { x: number; y: number },
    landmarks: string[] = []
  ): void {
    const entity = registry.createEntity(id);
    registry.addComponent(entity, new TransformComponent(new TRS({ x: pivot.x, y: pivot.y }), parent));
    registry.addComponent(entity, {
      type: 'RenderComponent',
      name: displayName,
      svgPath,
      lodMin,
      lodMax,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(entity, new BoneComponent(
      entity,
      displayName,
      latinName,
      bodyRegion,
      parent,
      [],
      landmarks,
      boundingBox,
      pivot,
      0,
      true
    ));
  }

  private static registerLandmark(
    registry: Registry,
    id: string,
    displayName: string,
    parentBone: Entity,
    offset: { x: number; y: number }
  ): void {
    const entity = registry.createEntity(id);
    registry.addComponent(entity, new TransformComponent(new TRS({ x: offset.x, y: offset.y }), parentBone));
    registry.addComponent(entity, new LandmarkComponent(id, displayName, offset));
  }
}
