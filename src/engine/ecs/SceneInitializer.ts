import { Registry, Entity } from './Registry';
import { TransformComponent, TRS } from '../transforms/TRS';
import { RenderComponent, BoneComponent, Landmark } from '../renderer/RenderPipeline';
import { majorJointsList, JointComponent } from '../../atlas/skeleton/joints/joints';
import { muscleDatabase } from '../../atlas/muscles/data/muscleData';

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

    // 3. ORGANS REGISTRATION - DELETED (Bones Only Foundation Prompt 1)

    // 4. SKELETAL SYSTEM BONES REGISTRATION (All 47 Bone catalog IDs mapped with landmarks and multi-view paths)

    // --- CRANIUM BONES ---
    
    // Frontal Bone
    const frontal = 'bone-frontal';
    registry.createEntity(frontal);
    registry.addComponent(frontal, new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent(frontal, {
      type: 'RenderComponent',
      name: 'Frontal Bone',
      svgPaths: {
        anterior: 'M -15 -5 C -25 -22, 0 -30, 0 -12 C 0 -5, -15 -5, -15 -5',
        posterior: 'M 15 -5 C 25 -22, 0 -30, 0 -12 C 0 -5, 15 -5, 15 -5',
        leftLateral: 'M -18 -22 C -32 -22, -32 2, -18 6 C -12 6, -8 2, -8 -6 Z',
        rightLateral: 'M 18 -22 C 32 -22, 32 2, 18 6 C 12 6, 8 2, 8 -6 Z',
        superior: 'M -18 -22 C -24 -32, 24 -32, 18 -22 Z',
        inferior: 'M -10 -15 C -15 -20, 15 -20, 10 -15 Z'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(frontal, {
      type: 'BoneComponent',
      id: frontal,
      displayName: 'Frontal Bone',
      latinName: 'Os frontale',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [
        { name: 'Glabella', localPosition: { x: 0, y: -10 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -15, minY: -30, maxX: 15, maxY: 0 },
      pivot: { x: 0, y: -12 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Parietal Bones
    const parietal = 'bone-parietal';
    registry.createEntity(parietal);
    registry.addComponent(parietal, new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent(parietal, {
      type: 'RenderComponent',
      name: 'Parietal Bones',
      svgPaths: {
        anterior: 'M 0 -30 C 25 -22, 15 -5, 0 -12',
        posterior: 'M 0 -30 C -25 -22, -15 -5, 0 -12',
        leftLateral: 'M -15 -30 C 10 -30, 20 -15, 0 -22',
        rightLateral: 'M 15 -30 C -10 -30, -20 -15, 0 -22',
        superior: 'M -15 -30 C 0 -45, 15 -30, 0 -22',
        inferior: 'M -10 -25 L 10 -25 L 0 -12 Z'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(parietal, {
      type: 'BoneComponent',
      id: parietal,
      displayName: 'Parietal Bones',
      latinName: 'Ossa parietalia',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [
        { name: 'Vertex', localPosition: { x: 0, y: -32 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -25, minY: -30, maxX: 25, maxY: -5 },
      pivot: { x: 0, y: -20 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Temporal Bones
    const temporal = 'bone-temporal';
    registry.createEntity(temporal);
    registry.addComponent(temporal, new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent(temporal, {
      type: 'RenderComponent',
      name: 'Temporal Bones',
      svgPaths: {
        anterior: 'M -20 -15 C -24 -15, -24 -5, -20 -5 M 20 -15 C 24 -15, 24 -5, 20 -5',
        posterior: 'M 20 -15 C 24 -15, 24 -5, 20 -5 M -20 -15 C -24 -15, -24 -5, -20 -5',
        leftLateral: 'M -22 -16 C -26 -16, -26 -8, -22 -8',
        rightLateral: 'M 22 -16 C 26 -16, 26 -8, 22 -8',
        superior: 'M -18 -18 L 18 -18',
        inferior: 'M -14 -10 L 14 -10'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(temporal, {
      type: 'BoneComponent',
      id: temporal,
      displayName: 'Temporal Bones',
      latinName: 'Ossa temporalia',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -24, minY: -15, maxX: 24, maxY: -5 },
      pivot: { x: 0, y: -10 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Occipital Bone
    const occipital = 'bone-occipital';
    registry.createEntity(occipital);
    registry.addComponent(occipital, new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent(occipital, {
      type: 'RenderComponent',
      name: 'Occipital Bone',
      svgPaths: {
        anterior: 'M -8 -28 C -14 -32, 14 -32, 8 -28',
        posterior: 'M -8 -28 C -18 -32, 18 -32, 8 -28',
        leftLateral: 'M -24 -28 C -28 -28, -26 -20, -22 -20',
        rightLateral: 'M 24 -28 C 28 -28, 26 -20, 22 -20',
        superior: 'M -12 -32 C -18 -34, 18 -34, 12 -32',
        inferior: 'M -10 -22 L 10 -22'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(occipital, {
      type: 'BoneComponent',
      id: occipital,
      displayName: 'Occipital Bone',
      latinName: 'Os occipitale',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [
        { name: 'External Occipital Protuberance', localPosition: { x: 0, y: -26 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -14, minY: -32, maxX: 14, maxY: -20 },
      pivot: { x: 0, y: -26 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Sphenoid Bone
    const sphenoid = 'bone-sphenoid';
    registry.createEntity(sphenoid);
    registry.addComponent(sphenoid, new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent(sphenoid, {
      type: 'RenderComponent',
      name: 'Sphenoid Bone',
      svgPaths: {
        anterior: 'M -10 -15 C -12 -18, 12 -18, 10 -15',
        posterior: 'M -10 -15 C -12 -18, 12 -18, 10 -15',
        leftLateral: 'M -12 -15 L -10 -15',
        rightLateral: 'M 12 -15 L 10 -15',
        superior: 'M -8 -16 L 8 -16',
        inferior: 'M -6 -14 L 6 -14'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(sphenoid, {
      type: 'BoneComponent',
      id: sphenoid,
      displayName: 'Sphenoid Bone',
      latinName: 'Os sphenoidale',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -12, minY: -18, maxX: 12, maxY: -15 },
      pivot: { x: 0, y: -16 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Ethmoid Bone
    const ethmoid = 'bone-ethmoid';
    registry.createEntity(ethmoid);
    registry.addComponent(ethmoid, new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent(ethmoid, {
      type: 'RenderComponent',
      name: 'Ethmoid Bone',
      svgPaths: {
        anterior: 'M -3 -18 C -5 -20, 5 -20, 3 -18',
        posterior: 'M -3 -18 C -5 -20, 5 -20, 3 -18',
        leftLateral: 'M -4 -18 L -2 -18',
        rightLateral: 'M 4 -18 L 2 -18',
        superior: 'M -2 -19 L 2 -19',
        inferior: 'M -2 -17 L 2 -17'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(ethmoid, {
      type: 'BoneComponent',
      id: ethmoid,
      displayName: 'Ethmoid Bone',
      latinName: 'Os ethmoidale',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -5, minY: -20, maxX: 5, maxY: -17 },
      pivot: { x: 0, y: -18 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Auditory Ossicles
    const ossicles = 'bone-auditory-ossicles';
    registry.createEntity(ossicles);
    registry.addComponent(ossicles, new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent(ossicles, {
      type: 'RenderComponent',
      name: 'Auditory Ossicles',
      svgPaths: {
        anterior: 'M -16 -18 A 1 1 0 1 0 -14 -18 A 1 1 0 1 0 -16 -18 M 14 -18 A 1 1 0 1 0 16 -18 A 1 1 0 1 0 14 -18',
        posterior: 'M -16 -18 A 1 1 0 1 0 -14 -18 A 1 1 0 1 0 -16 -18 M 14 -18 A 1 1 0 1 0 16 -18 A 1 1 0 1 0 14 -18',
        leftLateral: 'M -15 -18 A 1 1 0 1 0 -13 -18 A 1 1 0 1 0 -15 -18',
        rightLateral: 'M 15 -18 A 1 1 0 1 0 17 -18 A 1 1 0 1 0 15 -18',
        superior: 'M -15 -18 H -13',
        inferior: 'M -15 -18 H -13'
      },
      lodMin: 2,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#64748b',
      baseStroke: '#475569',
      baseStrokeWidth: 0.5
    } as RenderComponent);
    registry.addComponent(ossicles, {
      type: 'BoneComponent',
      id: ossicles,
      displayName: 'Auditory Ossicles',
      latinName: 'Ossicula auditus',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -17, minY: -19, maxX: 17, maxY: -17 },
      pivot: { x: 0, y: -18 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // --- FACIAL BONES ---

    // Mandible
    const mandible = 'bone-mandible';
    registry.createEntity(mandible);
    registry.addComponent(mandible, new TransformComponent(new TRS({ x: 0, y: 16 }), head));
    registry.addComponent(mandible, {
      type: 'RenderComponent',
      name: 'Mandible (Jawbone)',
      svgPaths: {
        anterior: 'M -11 0 L -9 10 C -7 13, 7 13, 9 10 L 11 0 Z',
        posterior: 'M -11 0 L -9 10 C -7 13, 7 13, 9 10 L 11 0 Z',
        leftLateral: 'M -12 0 L -8 10 L -4 6',
        rightLateral: 'M 12 0 L 8 10 L 4 6',
        superior: 'M -10 6 C -6 10, 6 10, 10 6 Z',
        inferior: 'M -10 8 L 10 8'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(mandible, {
      type: 'BoneComponent',
      id: mandible,
      displayName: 'Mandible',
      latinName: 'Mandibula',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -11, minY: 0, maxX: 11, maxY: 13 },
      pivot: { x: 0, y: 0 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Maxillae
    const maxilla = 'bone-maxilla';
    registry.createEntity(maxilla);
    registry.addComponent(maxilla, new TransformComponent(new TRS({ x: 0, y: 6 }), head));
    registry.addComponent(maxilla, {
      type: 'RenderComponent',
      name: 'Maxillae',
      svgPaths: {
        anterior: 'M -10 -8 C -12 -2, 12 -2, 10 -8 Z',
        posterior: 'M -10 -8 C -12 -2, 12 -2, 10 -8 Z',
        leftLateral: 'M -10 -6 L -6 -2',
        rightLateral: 'M 10 -6 L 6 -2',
        superior: 'M -8 -4 L 8 -4',
        inferior: 'M -8 -2 L 8 -2'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(maxilla, {
      type: 'BoneComponent',
      id: maxilla,
      displayName: 'Maxillae',
      latinName: 'Maxillae',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -12, minY: -8, maxX: 12, maxY: -2 },
      pivot: { x: 0, y: -5 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Zygomatic Bones
    const zygomatic = 'bone-zygomatic';
    registry.createEntity(zygomatic);
    registry.addComponent(zygomatic, new TransformComponent(new TRS({ x: 0, y: 2 }), head));
    registry.addComponent(zygomatic, {
      type: 'RenderComponent',
      name: 'Zygomatic Bones (Orbits)',
      svgPaths: {
        anterior: 'M -10 -2 A 4 5.5 0 1 0 -2 -2 A 4 5.5 0 1 0 -10 -2 M 2 -2 A 4 5.5 0 1 0 10 -2 A 4 5.5 0 1 0 2 -2',
        posterior: 'M -10 -2 A 4 5.5 0 1 0 -2 -2 A 4 5.5 0 1 0 -10 -2 M 2 -2 A 4 5.5 0 1 0 10 -2 A 4 5.5 0 1 0 2 -2',
        leftLateral: 'M -10 -4 C -12 -4, -12 2, -10 2',
        rightLateral: 'M 10 -4 C 12 -4, 12 2, 10 2',
        superior: 'M -8 -2 H 8 -2',
        inferior: 'M -8 -2 H 8 -2'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#020617',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(zygomatic, {
      type: 'BoneComponent',
      id: zygomatic,
      displayName: 'Zygomatic Bones',
      latinName: 'Ossa zygomatica',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -10, minY: -7.5, maxX: 10, maxY: 3.5 },
      pivot: { x: 0, y: -2 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Nasal Bones
    const nasal = 'bone-nasal';
    registry.createEntity(nasal);
    registry.addComponent(nasal, new TransformComponent(new TRS({ x: 0, y: 0 }), head));
    registry.addComponent(nasal, {
      type: 'RenderComponent',
      name: 'Nasal Bones',
      svgPaths: {
        anterior: 'M -3 -12 L 3 -12 L 2 -4 L -2 -4 Z',
        posterior: 'M -3 -12 L 3 -12 L 2 -4 L -2 -4 Z',
        leftLateral: 'M -4 -10 L -2 -4',
        rightLateral: 'M 4 -10 L 2 -4',
        superior: 'M -2 -11 H 2',
        inferior: 'M -2 -5 H 2'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(nasal, {
      type: 'BoneComponent',
      id: nasal,
      displayName: 'Nasal Bones',
      latinName: 'Ossa nasalia',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -3, minY: -12, maxX: 3, maxY: -4 },
      pivot: { x: 0, y: -8 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Lacrimal Bones
    const lacrimal = 'bone-lacrimal';
    registry.createEntity(lacrimal);
    registry.addComponent(lacrimal, new TransformComponent(new TRS({ x: 0, y: 0 }), head));
    registry.addComponent(lacrimal, {
      type: 'RenderComponent',
      name: 'Lacrimal Bones',
      svgPaths: {
        anterior: 'M -9 -14 L -7 -14 L -7 -10 L -9 -10 Z M 7 -14 L 9 -14 L 9 -10 L 7 -10 Z',
        posterior: 'M -9 -14 L -7 -14 L -7 -10 L -9 -10 Z M 7 -14 L 9 -14 L 9 -10 L 7 -10 Z',
        leftLateral: 'M -8 -13 L -6 -13',
        rightLateral: 'M 8 -13 L 6 -13',
        superior: 'M -8 -12 H -6',
        inferior: 'M -8 -11 H -6'
      },
      lodMin: 2,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(lacrimal, {
      type: 'BoneComponent',
      id: lacrimal,
      displayName: 'Lacrimal Bones',
      latinName: 'Ossa lacrimalia',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -9, minY: -14, maxX: 9, maxY: -10 },
      pivot: { x: 0, y: -12 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Vomer
    const vomer = 'bone-vomer';
    registry.createEntity(vomer);
    registry.addComponent(vomer, new TransformComponent(new TRS({ x: 0, y: 8 }), head));
    registry.addComponent(vomer, {
      type: 'RenderComponent',
      name: 'Vomer',
      svgPaths: {
        anterior: 'M 0 -12 L -3 -6 L 3 -6 Z',
        posterior: 'M 0 -12 L -3 -6 L 3 -6 Z',
        leftLateral: 'M -2 -10 L 0 -6',
        rightLateral: 'M 2 -10 L 0 -6',
        superior: 'M -1 -11 H 1',
        inferior: 'M -1 -7 H 1'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#020617',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(vomer, {
      type: 'BoneComponent',
      id: vomer,
      displayName: 'Vomer',
      latinName: 'Vomer',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -3, minY: -12, maxX: 3, maxY: -6 },
      pivot: { x: 0, y: -9 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Palatine Bones
    const palatine = 'bone-palatine';
    registry.createEntity(palatine);
    registry.addComponent(palatine, new TransformComponent(new TRS({ x: 0, y: 6 }), head));
    registry.addComponent(palatine, {
      type: 'RenderComponent',
      name: 'Palatine Bones',
      svgPaths: {
        anterior: 'M -6 0 L 6 0',
        posterior: 'M -6 0 L 6 0',
        leftLateral: 'M -4 0 L -2 0',
        rightLateral: 'M 4 0 L 2 0',
        superior: 'M -4 0 H 4',
        inferior: 'M -4 0 H 4'
      },
      lodMin: 2,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(palatine, {
      type: 'BoneComponent',
      id: palatine,
      displayName: 'Palatine Bones',
      latinName: 'Ossa palatina',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -6, minY: 0, maxX: 6, maxY: 0 },
      pivot: { x: 0, y: 0 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Inferior Nasal Conchae
    const conchae = 'bone-inferior-conchae';
    registry.createEntity(conchae);
    registry.addComponent(conchae, new TransformComponent(new TRS({ x: 0, y: 10 }), head));
    registry.addComponent(conchae, {
      type: 'RenderComponent',
      name: 'Inferior Nasal Conchae',
      svgPaths: {
        anterior: 'M -4 -8 L -6 -6 M 4 -8 L 6 -6',
        posterior: 'M -4 -8 L -6 -6 M 4 -8 L 6 -6',
        leftLateral: 'M -5 -7 L -4 -6',
        rightLateral: 'M 5 -7 L 4 -6',
        superior: 'M -4 -7 H -3',
        inferior: 'M -4 -7 H -3'
      },
      lodMin: 2,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(conchae, {
      type: 'BoneComponent',
      id: conchae,
      displayName: 'Inferior Nasal Conchae',
      latinName: 'Conchae nasales inferiores',
      bodyRegion: 'head',
      parentBone: 'head',
      children: [],
      landmarks: [],
      boundingBox: { minX: -6, minY: -8, maxX: 6, maxY: -6 },
      pivot: { x: 0, y: -7 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Hyoid Bone
    const hyoid = 'bone-hyoid';
    registry.createEntity(hyoid);
    registry.addComponent(hyoid, new TransformComponent(new TRS({ x: 0, y: -8 }), neck));
    registry.addComponent(hyoid, {
      type: 'RenderComponent',
      name: 'Hyoid Bone',
      svgPaths: {
        anterior: 'M -5 -8 Q 0 -5, 5 -8',
        posterior: 'M -5 -8 Q 0 -5, 5 -8',
        leftLateral: 'M -4 -7 Q -2 -6, 0 -7',
        rightLateral: 'M 4 -7 Q 2 -6, 0 -7',
        superior: 'M -4 -8 H 4',
        inferior: 'M -4 -8 H 4'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.5
    } as RenderComponent);
    registry.addComponent(hyoid, {
      type: 'BoneComponent',
      id: hyoid,
      displayName: 'Hyoid Bone',
      latinName: 'Os hyoideum',
      bodyRegion: 'neck',
      parentBone: 'neck',
      children: [],
      landmarks: [],
      boundingBox: { minX: -5, minY: -8, maxX: 5, maxY: -5 },
      pivot: { x: 0, y: -6.5 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // --- SPINE VERTEBRAE ---

    // C1 Atlas
    const c1 = 'bone-c1-atlas';
    registry.createEntity(c1);
    registry.addComponent(c1, new TransformComponent(new TRS({ x: 0, y: 2 }), neck));
    registry.addComponent(c1, {
      type: 'RenderComponent',
      name: 'C1 Vertebra (Atlas)',
      svgPaths: {
        anterior: 'M -2.5 2 H 2.5 V 6.5 H -2.5 Z',
        posterior: 'M -2.5 2 H 2.5 V 6.5 H -2.5 Z',
        leftLateral: 'M -2.5 3 H 0 V 6 H -2.5 Z',
        rightLateral: 'M 2.5 3 H 0 V 6 H 2.5 Z',
        superior: 'M -3 3 H 3 V 5 H -3 Z',
        inferior: 'M -3 3 H 3 V 5 H -3 Z'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(c1, {
      type: 'BoneComponent',
      id: c1,
      displayName: 'C1 Vertebra (Atlas)',
      latinName: 'Atlas',
      bodyRegion: 'neck',
      parentBone: 'neck',
      children: [],
      landmarks: [],
      boundingBox: { minX: -2.5, minY: 2, maxX: 2.5, maxY: 6.5 },
      pivot: { x: 0, y: 4.25 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // C2 Axis
    const c2 = 'bone-c2-axis';
    registry.createEntity(c2);
    registry.addComponent(c2, new TransformComponent(new TRS({ x: 0, y: 8 }), neck));
    registry.addComponent(c2, {
      type: 'RenderComponent',
      name: 'C2 Vertebra (Axis)',
      svgPaths: {
        anterior: 'M -2.5 8 H 2.5 V 12.5 H -2.5 Z',
        posterior: 'M -2.5 8 H 2.5 V 12.5 H -2.5 Z',
        leftLateral: 'M -2.5 9 H 0 V 12 H -2.5 Z',
        rightLateral: 'M 2.5 9 H 0 V 12 H 2.5 Z',
        superior: 'M -3 9 H 3 V 11 H -3 Z',
        inferior: 'M -3 9 H 3 V 11 H -3 Z'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(c2, {
      type: 'BoneComponent',
      id: c2,
      displayName: 'C2 Vertebra (Axis)',
      latinName: 'Axis',
      bodyRegion: 'neck',
      parentBone: 'neck',
      children: [],
      landmarks: [],
      boundingBox: { minX: -2.5, minY: 8, maxX: 2.5, maxY: 12.5 },
      pivot: { x: 0, y: 10.25 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // C3-C7 Cervical Vertebrae
    const cervical = 'bone-cervical';
    registry.createEntity(cervical);
    registry.addComponent(cervical, new TransformComponent(new TRS({ x: 0, y: 14 }), neck));
    registry.addComponent(cervical, {
      type: 'RenderComponent',
      name: 'C3-C7 Cervical Vertebrae',
      svgPaths: {
        anterior: 'M -2.5 14 H 2.5 V 18.5 H -2.5 Z',
        posterior: 'M -2.5 14 H 2.5 V 18.5 H -2.5 Z',
        leftLateral: 'M -2.5 15 H 0 V 18 H -2.5 Z',
        rightLateral: 'M 2.5 15 H 0 V 18 H 2.5 Z',
        superior: 'M -3 15 H 3 V 17 H -3 Z',
        inferior: 'M -3 15 H 3 V 17 H -3 Z'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(cervical, {
      type: 'BoneComponent',
      id: cervical,
      displayName: 'C3-C7 Cervical Vertebrae',
      latinName: 'Vertebrae cervicales',
      bodyRegion: 'neck',
      parentBone: 'neck',
      children: [],
      landmarks: [],
      boundingBox: { minX: -2.5, minY: 14, maxX: 2.5, maxY: 18.5 },
      pivot: { x: 0, y: 16.25 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Thoracic Spine T1-T12
    const thoracic = 'bone-thoracic';
    registry.createEntity(thoracic);
    registry.addComponent(thoracic, new TransformComponent(new TRS({ x: 0, y: -45 }), thorax));
    registry.addComponent(thoracic, {
      type: 'RenderComponent',
      name: 'Thoracic Spine (T1-T12)',
      svgPaths: {
        anterior: 'M -3.5 -45 H 3.5 V 27 H -3.5 Z',
        posterior: 'M -3.5 -45 H 3.5 V 27 H -3.5 Z',
        leftLateral: 'M -3.5 -40 Q -10 -10, -3.5 20 L 0 20 L -3.5 -40 Z',
        rightLateral: 'M 3.5 -40 Q 10 -10, 3.5 20 L 0 20 L 3.5 -40 Z',
        superior: 'M -4 -40 H 4 V -35 H -4 Z',
        inferior: 'M -4 20 H 4 V 25 H -4 Z'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(thoracic, {
      type: 'BoneComponent',
      id: thoracic,
      displayName: 'Thoracic Spine (T1-T12)',
      latinName: 'Vertebrae thoracicae',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [],
      boundingBox: { minX: -3.5, minY: -45, maxX: 3.5, maxY: 27 },
      pivot: { x: 0, y: -9 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Lumbar Spine L1-L5
    const lumbar = 'bone-lumbar';
    registry.createEntity(lumbar);
    registry.addComponent(lumbar, new TransformComponent(new TRS({ x: 0, y: -38 }), abdomen));
    registry.addComponent(lumbar, {
      type: 'RenderComponent',
      name: 'Lumbar Spine (L1-L5)',
      svgPaths: {
        anterior: 'M -4.5 -38 H 4.5 V -14 H -4.5 Z',
        posterior: 'M -4.5 -38 H 4.5 V -14 H -4.5 Z',
        leftLateral: 'M -4.5 -35 H -1 V -17 H -4.5 Z',
        rightLateral: 'M 4.5 -35 H 1 V -17 H 4.5 Z',
        superior: 'M -5 -35 H 5 V -31 H -5 Z',
        inferior: 'M -5 -18 H 5 V -14 H -5 Z'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(lumbar, {
      type: 'BoneComponent',
      id: lumbar,
      displayName: 'Lumbar Spine (L1-L5)',
      latinName: 'Vertebrae lumbales',
      bodyRegion: 'abdomen',
      parentBone: 'abdomen',
      children: [],
      landmarks: [
        { name: 'Umbilicus', localPosition: { x: 0, y: -42 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -4.5, minY: -38, maxX: 4.5, maxY: -14 },
      pivot: { x: 0, y: -26 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Sacrum
    const sacrum = 'bone-sacrum';
    registry.createEntity(sacrum);
    registry.addComponent(sacrum, new TransformComponent(new TRS({ x: 0, y: -48 }), pelvis));
    registry.addComponent(sacrum, {
      type: 'RenderComponent',
      name: 'Sacrum',
      svgPaths: {
        anterior: 'M -4.5 -48 L 4.5 -48 L 3 -42 L 0 -38 L -3 -42 Z',
        posterior: 'M -4.5 -48 L 4.5 -48 L 3 -42 L 0 -38 L -3 -42 Z',
        leftLateral: 'M -3.5 -48 Q -6 -44, -1 -38 Z',
        rightLateral: 'M 3.5 -48 Q 6 -44, 1 -38 Z',
        superior: 'M -4 -48 H 4 V -46 H -4 Z',
        inferior: 'M -2 -39 H 2 V -37 H -2 Z'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(sacrum, {
      type: 'BoneComponent',
      id: sacrum,
      displayName: 'Sacrum',
      latinName: 'Os sacrum',
      bodyRegion: 'pelvis',
      parentBone: 'pelvis',
      children: [],
      landmarks: [],
      boundingBox: { minX: -4.5, minY: -48, maxX: 4.5, maxY: -38 },
      pivot: { x: 0, y: -43 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Coccyx
    const coccyx = 'bone-coccyx';
    registry.createEntity(coccyx);
    registry.addComponent(coccyx, new TransformComponent(new TRS({ x: 0, y: -38 }), pelvis));
    registry.addComponent(coccyx, {
      type: 'RenderComponent',
      name: 'Coccyx (Tailbone)',
      svgPaths: {
        anterior: 'M -2.5 -38 L 2.5 -38 L 0 -33 Z',
        posterior: 'M -2.5 -38 L 2.5 -38 L 0 -33 Z',
        leftLateral: 'M -2 -38 L -0.5 -33 L -2.5 -38 Z',
        rightLateral: 'M 2 -38 L 0.5 -33 L 2.5 -38 Z',
        superior: 'M -2 -38 H 2',
        inferior: 'M -1 -34 H 1'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(coccyx, {
      type: 'BoneComponent',
      id: coccyx,
      displayName: 'Coccyx',
      latinName: 'Os coccygis',
      bodyRegion: 'pelvis',
      parentBone: 'pelvis',
      children: [],
      landmarks: [],
      boundingBox: { minX: -2.5, minY: -38, maxX: 2.5, maxY: -33 },
      pivot: { x: 0, y: -35.5 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // --- THORACIC CAGE ---

    // Manubrium
    const manubrium = 'bone-sternum-manubrium';
    registry.createEntity(manubrium);
    registry.addComponent(manubrium, new TransformComponent(new TRS({ x: 0, y: -35 }), thorax));
    registry.addComponent(manubrium, {
      type: 'RenderComponent',
      name: 'Manubrium (Sternum)',
      svgPaths: {
        anterior: 'M -2 -35 H 2.5 V -20 H -2 Z',
        posterior: 'M -2 -35 H 2.5 V -20 H -2 Z',
        leftLateral: 'M -5 -33 L -4 -22',
        rightLateral: 'M 5 -33 L 4 -22',
        superior: 'M -3 -35 H 3',
        inferior: 'M -2 -21 H 2'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(manubrium, {
      type: 'BoneComponent',
      id: manubrium,
      displayName: 'Manubrium',
      latinName: 'Manubrium sterni',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [
        { name: 'Jugular Notch', localPosition: { x: 0, y: -35 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -2, minY: -35, maxX: 2.5, maxY: -20 },
      pivot: { x: 0, y: -27.5 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Sternum Body
    const sternumBody = 'bone-sternum-body';
    registry.createEntity(sternumBody);
    registry.addComponent(sternumBody, new TransformComponent(new TRS({ x: 0, y: -20 }), thorax));
    registry.addComponent(sternumBody, {
      type: 'RenderComponent',
      name: 'Sternum Body',
      svgPaths: {
        anterior: 'M -2 -20 H 2.5 V 10 H -2 Z',
        posterior: 'M -2 -20 H 2.5 V 10 H -2 Z',
        leftLateral: 'M -4 -18 L -3 8',
        rightLateral: 'M 4 -18 L 3 8',
        superior: 'M -2 -20 H 2',
        inferior: 'M -2 10 H 2'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(sternumBody, {
      type: 'BoneComponent',
      id: sternumBody,
      displayName: 'Sternum Body',
      latinName: 'Corpus sterni',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [],
      boundingBox: { minX: -2, minY: -20, maxX: 2.5, maxY: 10 },
      pivot: { x: 0, y: -5 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Xiphoid Process
    const xiphoid = 'bone-sternum-xiphoid';
    registry.createEntity(xiphoid);
    registry.addComponent(xiphoid, new TransformComponent(new TRS({ x: 0, y: 10 }), thorax));
    registry.addComponent(xiphoid, {
      type: 'RenderComponent',
      name: 'Xiphoid Process',
      svgPaths: {
        anterior: 'M -1 10 H 1.5 V 17 H -1 Z',
        posterior: 'M -1 10 H 1.5 V 17 H -1 Z',
        leftLateral: 'M -3 11 L -2 16',
        rightLateral: 'M 3 11 L 2 16',
        superior: 'M -1 10 H 1',
        inferior: 'M -1 17 H 1'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(xiphoid, {
      type: 'BoneComponent',
      id: xiphoid,
      displayName: 'Xiphoid Process',
      latinName: 'Processus xiphoideus',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [
        { name: 'Xiphoid Process', localPosition: { x: 0, y: 16 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -1, minY: 10, maxX: 1.5, maxY: 17 },
      pivot: { x: 0, y: 13.5 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // True Ribs
    const trueRibs = 'bone-ribs-true';
    registry.createEntity(trueRibs);
    registry.addComponent(trueRibs, new TransformComponent(new TRS({ x: 0, y: -30 }), thorax));
    registry.addComponent(trueRibs, {
      type: 'RenderComponent',
      name: 'True Ribs (1-7)',
      svgPaths: {
        anterior: 'M -4 -10 Q -38 -8, -42 12 M 4 -10 Q 38 -8, 42 12 M -4 -1 M 4 -1 M -4 8 M 4 8',
        posterior: 'M -4 -10 Q -38 -8, -42 12 M 4 -10 Q 38 -8, 42 12',
        leftLateral: 'M -6 -10 Q -24 0, -22 12 H -6',
        rightLateral: 'M 6 -10 Q 24 0, 22 12 H 6',
        superior: 'M -25 -10 H 25',
        inferior: 'M -28 12 H 28'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.5
    } as RenderComponent);
    registry.addComponent(trueRibs, {
      type: 'BoneComponent',
      id: trueRibs,
      displayName: 'True Ribs (1-7)',
      latinName: 'Costae verae (I-VII)',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [],
      boundingBox: { minX: -42, minY: -10, maxX: 42, maxY: 12 },
      pivot: { x: 0, y: 1 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // False Ribs
    const falseRibs = 'bone-ribs-false';
    registry.createEntity(falseRibs);
    registry.addComponent(falseRibs, new TransformComponent(new TRS({ x: 0, y: 10 }), thorax));
    registry.addComponent(falseRibs, {
      type: 'RenderComponent',
      name: 'False Ribs (8-10)',
      svgPaths: {
        anterior: 'M -4 2 Q -38 4, -42 18 M 4 2 Q 38 4, 42 18',
        posterior: 'M -4 2 Q -38 4, -42 18 M 4 2 Q 38 4, 42 18',
        leftLateral: 'M -8 2 Q -22 8, -20 16 H -8',
        rightLateral: 'M 8 2 Q 22 8, 20 16 H 8',
        superior: 'M -25 2 H 25',
        inferior: 'M -22 18 H 22'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(falseRibs, {
      type: 'BoneComponent',
      id: falseRibs,
      displayName: 'False Ribs (8-10)',
      latinName: 'Costae spuriae (VIII-X)',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [],
      boundingBox: { minX: -42, minY: 2, maxX: 42, maxY: 18 },
      pivot: { x: 0, y: 10 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Floating Ribs
    const floatRibs = 'bone-ribs-floating';
    registry.createEntity(floatRibs);
    registry.addComponent(floatRibs, new TransformComponent(new TRS({ x: 0, y: 28 }), thorax));
    registry.addComponent(floatRibs, {
      type: 'RenderComponent',
      name: 'Floating Ribs (11-12)',
      svgPaths: {
        anterior: 'M -4 2 Q -34 4, -38 12 M 4 2 Q 34 4, 38 12',
        posterior: 'M -4 2 Q -34 4, -38 12 M 4 2 Q 34 4, 38 12',
        leftLateral: 'M -6 2 Q -18 6, -16 10 H -6',
        rightLateral: 'M 6 2 Q 18 6, 16 10 H 6',
        superior: 'M -18 2 H 18',
        inferior: 'M -16 12 H 16'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(floatRibs, {
      type: 'BoneComponent',
      id: floatRibs,
      displayName: 'Floating Ribs (11-12)',
      latinName: 'Costae fluctuantes (XI-XII)',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [],
      boundingBox: { minX: -38, minY: 2, maxX: 38, maxY: 12 },
      pivot: { x: 0, y: 7 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // --- SHOULDER GIRDLE ---

    // Clavicle
    const clavicle = 'bone-clavicle';
    registry.createEntity(clavicle);
    registry.addComponent(clavicle, new TransformComponent(new TRS({ x: 0, y: -37 }), thorax));
    registry.addComponent(clavicle, {
      type: 'RenderComponent',
      name: 'Clavicles (Collarbones)',
      svgPaths: {
        anterior: 'M -4 0 Q -22 2, -42 8 M 4 0 Q 22 2, 42 8',
        posterior: 'M -4 0 Q -22 2, -42 8 M 4 0 Q 22 2, 42 8',
        leftLateral: 'M -6 2 L -18 6',
        rightLateral: 'M 6 2 L 18 6',
        superior: 'M -42 8 H 42',
        inferior: 'M -42 8 H 42'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.2
    } as RenderComponent);
    registry.addComponent(clavicle, {
      type: 'BoneComponent',
      id: clavicle,
      displayName: 'Clavicles',
      latinName: 'Claviculae',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [],
      boundingBox: { minX: -42, minY: 0, maxX: 42, maxY: 8 },
      pivot: { x: 0, y: 4 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Scapulae
    const scapula = 'bone-scapula';
    registry.createEntity(scapula);
    registry.addComponent(scapula, new TransformComponent(new TRS({ x: 0, y: -29 }), thorax));
    registry.addComponent(scapula, {
      type: 'RenderComponent',
      name: 'Scapulae (Shoulder Blades)',
      svgPaths: {
        anterior: 'M -42 -114 L -28 -88 L -42 -92 Z M 42 -114 L 28 -88 L 42 -92 Z',
        posterior: 'M -42 -114 L -28 -88 L -42 -92 Z M 42 -114 L 28 -88 L 42 -92 Z',
        leftLateral: 'M -38 -100 L -36 -90 Z',
        rightLateral: 'M 38 -100 L 36 -90 Z',
        superior: 'M -42 -114 H -28 M 28 -114 H 42',
        inferior: 'M -42 -92 H -28 M 28 -92 H 42'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#0f172a',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(scapula, {
      type: 'BoneComponent',
      id: scapula,
      displayName: 'Scapulae',
      latinName: 'Scapulae',
      bodyRegion: 'thorax',
      parentBone: 'thorax',
      children: [],
      landmarks: [
        { name: 'Acromion (Left)', localPosition: { x: -42, y: -114 }, worldPosition: { x: 0, y: 0 } },
        { name: 'Acromion (Right)', localPosition: { x: 42, y: -114 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -42, minY: -114, maxX: 42, maxY: -88 },
      pivot: { x: 0, y: -101 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // --- UPPER LIMB ---

    // Humerus
    const humerus = 'bone-humerus';
    registry.createEntity(humerus);
    registry.addComponent(humerus, new TransformComponent(new TRS({ x: 0, y: -44 }), upperLimbs));
    registry.addComponent(humerus, {
      type: 'RenderComponent',
      name: 'Humerus',
      svgPaths: {
        anterior: 'M -42 -44 L -75 30 M 42 -44 L 75 30',
        posterior: 'M -42 -44 L -75 30 M 42 -44 L 75 30',
        leftLateral: 'M -42 -44 L -45 30',
        rightLateral: 'M 42 -44 L 45 30',
        superior: 'M -45 -44 H -39',
        inferior: 'M -78 30 H -72'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.8
    } as RenderComponent);
    registry.addComponent(humerus, {
      type: 'BoneComponent',
      id: humerus,
      displayName: 'Humerus',
      latinName: 'Humerus',
      bodyRegion: 'arm',
      parentBone: 'upperLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -75, minY: -44, maxX: 75, maxY: 30 },
      pivot: { x: 0, y: -7 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Radius
    const radius = 'bone-radius';
    registry.createEntity(radius);
    registry.addComponent(radius, new TransformComponent(new TRS({ x: 0, y: 30 }), upperLimbs));
    registry.addComponent(radius, {
      type: 'RenderComponent',
      name: 'Radius',
      svgPaths: {
        anterior: 'M -75 30 L -97 98 M 75 30 L 97 98',
        posterior: 'M -75 30 L -97 98 M 75 30 L 97 98',
        leftLateral: 'M -47 30 L -53 98',
        rightLateral: 'M 47 30 L 53 98',
        superior: 'M -77 30 H -73',
        inferior: 'M -99 98 H -95'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.6
    } as RenderComponent);
    registry.addComponent(radius, {
      type: 'BoneComponent',
      id: radius,
      displayName: 'Radius',
      latinName: 'Radius',
      bodyRegion: 'arm',
      parentBone: 'upperLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -97, minY: 30, maxX: 97, maxY: 98 },
      pivot: { x: 0, y: 64 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Ulna
    const ulna = 'bone-ulna';
    registry.createEntity(ulna);
    registry.addComponent(ulna, new TransformComponent(new TRS({ x: 0, y: 30 }), upperLimbs));
    registry.addComponent(ulna, {
      type: 'RenderComponent',
      name: 'Ulna',
      svgPaths: {
        anterior: 'M -73 30 L -93 98 M 73 30 L 93 98',
        posterior: 'M -73 30 L -93 98 M 73 30 L 93 98',
        leftLateral: 'M -45 30 L -51 98',
        rightLateral: 'M 45 30 L 51 98',
        superior: 'M -75 30 H -71',
        inferior: 'M -95 98 H -91'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.6
    } as RenderComponent);
    registry.addComponent(ulna, {
      type: 'BoneComponent',
      id: ulna,
      displayName: 'Ulna',
      latinName: 'Ulna',
      bodyRegion: 'arm',
      parentBone: 'upperLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -93, minY: 30, maxX: 93, maxY: 98 },
      pivot: { x: 0, y: 64 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Carpals
    const carpals = 'bone-carpals';
    registry.createEntity(carpals);
    registry.addComponent(carpals, new TransformComponent(new TRS({ x: 0, y: 102 }), upperLimbs));
    registry.addComponent(carpals, {
      type: 'RenderComponent',
      name: 'Carpals (Wrist)',
      svgPaths: {
        anterior: 'M -97.5 0 A 2.5 2.5 0 1 0 -92.5 0 A 2.5 2.5 0 1 0 -97.5 0 M 92.5 0 A 2.5 2.5 0 1 0 97.5 0 A 2.5 2.5 0 1 0 92.5 0',
        posterior: 'M -97.5 0 A 2.5 2.5 0 1 0 -92.5 0 A 2.5 2.5 0 1 0 -97.5 0 M 92.5 0 A 2.5 2.5 0 1 0 97.5 0 A 2.5 2.5 0 1 0 92.5 0',
        leftLateral: 'M -51 0 A 2.5 2.5 0 1 0 -46 0 Z',
        rightLateral: 'M 51 0 A 2.5 2.5 0 1 0 46 0 Z',
        superior: 'M -95 0 H -93',
        inferior: 'M -95 0 H -93'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(carpals, {
      type: 'BoneComponent',
      id: carpals,
      displayName: 'Carpals',
      latinName: 'Ossa carpi',
      bodyRegion: 'hand',
      parentBone: 'upperLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -97.5, minY: -2.5, maxX: 97.5, maxY: 2.5 },
      pivot: { x: 0, y: 0 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Metacarpals
    const metacarpals = 'bone-metacarpals';
    registry.createEntity(metacarpals);
    registry.addComponent(metacarpals, new TransformComponent(new TRS({ x: 0, y: 102 }), upperLimbs));
    registry.addComponent(metacarpals, {
      type: 'RenderComponent',
      name: 'Metacarpals (Palm)',
      svgPaths: {
        anterior: 'M -95 0 L -102 6 M -95 0 L -98 12 M -95 0 L -95 14 M -95 0 L -92 12 M -95 0 L -89 8 M 95 0 L 102 6 M 95 0 L 98 12 M 95 0 L 95 14 M 95 0 L 92 12 M 95 0 L 89 8',
        posterior: 'M -95 0 L -102 6 M -95 0 L -98 12 M -95 0 L -95 14 M -95 0 L -92 12 M -95 0 L -89 8 M 95 0 L 102 6 M 95 0 L 98 12 M 95 0 L 95 14 M 95 0 L 92 12 M 95 0 L 89 8',
        leftLateral: 'M -50 0 L -53 14',
        rightLateral: 'M 50 0 L 53 14',
        superior: 'M -95 0 H -89',
        inferior: 'M -102 6 H -89'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(metacarpals, {
      type: 'BoneComponent',
      id: metacarpals,
      displayName: 'Metacarpals',
      latinName: 'Ossa metacarpalia',
      bodyRegion: 'hand',
      parentBone: 'upperLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -102, minY: 0, maxX: 102, maxY: 14 },
      pivot: { x: 0, y: 7 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Hand Phalanges
    const phalHand = 'bone-phalanges-hand';
    registry.createEntity(phalHand);
    registry.addComponent(phalHand, new TransformComponent(new TRS({ x: 0, y: 102 }), upperLimbs));
    registry.addComponent(phalHand, {
      type: 'RenderComponent',
      name: 'Hand Phalanges (Fingers)',
      svgPaths: {
        anterior: 'M -102 6 L -106 10 M -98 12 L -100 22 M -95 14 L -95 25 M -92 12 L -91 22 M -89 8 L -87 17 M 102 6 L 106 10 M 98 12 L 100 22 M 95 14 L 95 25 M 92 12 L 91 22 M 89 8 L 87 17',
        posterior: 'M -102 6 L -106 10 M -98 12 L -100 22 M -95 14 L -95 25 M -92 12 L -91 22 M -89 8 L -87 17 M 102 6 L 106 10 M 98 12 L 100 22 M 95 14 L 95 25 M 92 12 L 91 22 M 89 8 L 87 17',
        leftLateral: 'M -53 14 L -56 25',
        rightLateral: 'M 53 14 L 56 25',
        superior: 'M -106 10 H -87',
        inferior: 'M -106 10 H -87'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(phalHand, {
      type: 'BoneComponent',
      id: phalHand,
      displayName: 'Hand Phalanges',
      latinName: 'Phalanges digitorum manus',
      bodyRegion: 'hand',
      parentBone: 'upperLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -106, minY: 6, maxX: 106, maxY: 25 },
      pivot: { x: 0, y: 15 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // --- PELVIS GIRDLE ---

    // Ilium
    const ilium = 'bone-ilium';
    registry.createEntity(ilium);
    registry.addComponent(ilium, new TransformComponent(new TRS({ x: 0, y: -4 }), pelvis));
    registry.addComponent(ilium, {
      type: 'RenderComponent',
      name: 'Ilium (Pelvic Wings)',
      svgPaths: {
        anterior: 'M -28 -44 C -44 -44, -46 -22, -20 -12 C -16 -12, -20 -26, -24 -38 Z M 26 -44 C 44 -44, 46 -22, 20 -12 C 16 -12, 20 -26, 24 -38 Z',
        posterior: 'M -28 -44 C -44 -44, -46 -22, -20 -12 C -16 -12, -20 -26, -24 -38 Z M 26 -44 C 44 -44, 46 -22, 20 -12 C 16 -12, 20 -26, 24 -38 Z',
        leftLateral: 'M -26 -44 C -36 -44, -36 -22, -20 -12 Z',
        rightLateral: 'M 26 -44 C 44 -44, 46 -22, 20 -12 Z',
        superior: 'M -28 -44 H 28',
        inferior: 'M -20 -12 H 20'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(ilium, {
      type: 'BoneComponent',
      id: ilium,
      displayName: 'Ilium',
      latinName: 'Os ilium',
      bodyRegion: 'pelvis',
      parentBone: 'pelvis',
      children: [],
      landmarks: [
        { name: 'ASIS (Left)', localPosition: { x: -28, y: -28 }, worldPosition: { x: 0, y: 0 } },
        { name: 'ASIS (Right)', localPosition: { x: 28, y: -28 }, worldPosition: { x: 0, y: 0 } },
        { name: 'PSIS (Left)', localPosition: { x: -20, y: -30 }, worldPosition: { x: 0, y: 0 } },
        { name: 'PSIS (Right)', localPosition: { x: 20, y: -30 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -46, minY: -44, maxX: 46, maxY: -12 },
      pivot: { x: 0, y: -28 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Ischium
    const ischium = 'bone-ischium';
    registry.createEntity(ischium);
    registry.addComponent(ischium, new TransformComponent(new TRS({ x: 0, y: -4 }), pelvis));
    registry.addComponent(ischium, {
      type: 'RenderComponent',
      name: 'Ischium',
      svgPaths: {
        anterior: 'M -16 -14 C -20 -12, -18 -4, -10 -6 C -12 -10, -14 -14, -16 -14 Z M 16 -14 C 20 -12, 18 -4, 10 -6 C 12 -10, 14 -14, 16 -14 Z',
        posterior: 'M -16 -14 C -20 -12, -18 -4, -10 -6 C -12 -10, -14 -14, -16 -14 Z M 16 -14 C 20 -12, 18 -4, 10 -6 C 12 -10, 14 -14, 16 -14 Z',
        leftLateral: 'M -14 -14 C -18 -12, -16 -4, -10 -6 Z',
        rightLateral: 'M 14 -14 C 18 -12, 16 -4, 10 -6 Z',
        superior: 'M -16 -14 H 16',
        inferior: 'M -16 -4 H 16'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#0f172a',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(ischium, {
      type: 'BoneComponent',
      id: ischium,
      displayName: 'Ischium',
      latinName: 'Os ischii',
      bodyRegion: 'pelvis',
      parentBone: 'pelvis',
      children: [],
      landmarks: [],
      boundingBox: { minX: -20, minY: -14, maxX: 20, maxY: -4 },
      pivot: { x: 0, y: -9 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Pubis
    const pubis = 'bone-pubis';
    registry.createEntity(pubis);
    registry.addComponent(pubis, new TransformComponent(new TRS({ x: 0, y: -4 }), pelvis));
    registry.addComponent(pubis, {
      type: 'RenderComponent',
      name: 'Pubis',
      svgPaths: {
        anterior: 'M -7 -42 L 7 -42 L 4 -16 L 0 -8 L -4 -16 Z',
        posterior: 'M -7 -42 L 7 -42 L 4 -16 L 0 -8 L -4 -16 Z',
        leftLateral: 'M -4 -42 L 0 -8 L -2 -16 Z',
        rightLateral: 'M 4 -42 L 0 -8 L 2 -16 Z',
        superior: 'M -7 -42 H 7',
        inferior: 'M -4 -16 H 4'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#0f172a',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(pubis, {
      type: 'BoneComponent',
      id: pubis,
      displayName: 'Pubis',
      latinName: 'Os pubis',
      bodyRegion: 'pelvis',
      parentBone: 'pelvis',
      children: [],
      landmarks: [
        { name: 'Pubic Symphysis', localPosition: { x: 0, y: -12 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -7, minY: -42, maxX: 7, maxY: -8 },
      pivot: { x: 0, y: -25 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // --- LOWER LIMB ---

    // Femur
    const femur = 'bone-femur';
    registry.createEntity(femur);
    registry.addComponent(femur, new TransformComponent(new TRS({ x: 0, y: -31 }), lowerLimbs));
    registry.addComponent(femur, {
      type: 'RenderComponent',
      name: 'Femur (Thigh bone)',
      svgPaths: {
        anterior: 'M -22 -31 L -35 85 M 22 -31 L 35 85',
        posterior: 'M -22 -31 L -35 85 M 22 -31 L 35 85',
        leftLateral: 'M -24 -31 L -28 85',
        rightLateral: 'M 24 -31 L 28 85',
        superior: 'M -24 -31 H -20',
        inferior: 'M -37 85 H -33'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 4.2
    } as RenderComponent);
    registry.addComponent(femur, {
      type: 'BoneComponent',
      id: femur,
      displayName: 'Femur',
      latinName: 'Femur',
      bodyRegion: 'leg',
      parentBone: 'lowerLimbs',
      children: [],
      landmarks: [
        { name: 'Greater Trochanter (Left)', localPosition: { x: -24, y: -30 }, worldPosition: { x: 0, y: 0 } },
        { name: 'Greater Trochanter (Right)', localPosition: { x: 24, y: -30 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -35, minY: -31, maxX: 35, maxY: 85 },
      pivot: { x: 0, y: 27 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Patella
    const patella = 'bone-patella';
    registry.createEntity(patella);
    registry.addComponent(patella, new TransformComponent(new TRS({ x: 0, y: 90 }), lowerLimbs));
    registry.addComponent(patella, {
      type: 'RenderComponent',
      name: 'Patella (Kneecap)',
      svgPaths: {
        anterior: 'M -38.2 0 A 3.2 3.2 0 1 0 -31.8 0 A 3.2 3.2 0 1 0 -38.2 0 M 31.8 0 A 3.2 3.2 0 1 0 38.2 0 A 3.2 3.2 0 1 0 31.8 0',
        posterior: 'M -38.2 0 A 3.2 3.2 0 1 0 -31.8 0 A 3.2 3.2 0 1 0 -38.2 0 M 31.8 0 A 3.2 3.2 0 1 0 38.2 0 A 3.2 3.2 0 1 0 31.8 0',
        leftLateral: 'M -37 0 A 3.2 3.2 0 1 0 -34 0 Z',
        rightLateral: 'M 37 0 A 3.2 3.2 0 1 0 34 0 Z',
        superior: 'M -38 0 H -32',
        inferior: 'M -38 0 H -32'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#475569',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(patella, {
      type: 'BoneComponent',
      id: patella,
      displayName: 'Patella',
      latinName: 'Patella',
      bodyRegion: 'leg',
      parentBone: 'lowerLimbs',
      children: [],
      landmarks: [
        { name: 'Patella (Left)', localPosition: { x: -35, y: 0 }, worldPosition: { x: 0, y: 0 } },
        { name: 'Patella (Right)', localPosition: { x: 35, y: 0 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -38.2, minY: -3.2, maxX: 38.2, maxY: 3.2 },
      pivot: { x: 0, y: 0 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Tibia
    const tibia = 'bone-tibia';
    registry.createEntity(tibia);
    registry.addComponent(tibia, new TransformComponent(new TRS({ x: 0, y: 95 }), lowerLimbs));
    registry.addComponent(tibia, {
      type: 'RenderComponent',
      name: 'Tibia (Shin bone)',
      svgPaths: {
        anterior: 'M -35 95 L -35 195 M 35 95 L 35 195',
        posterior: 'M -35 95 L -35 195 M 35 95 L 35 195',
        leftLateral: 'M -33 95 L -33 195',
        rightLateral: 'M 33 95 L 33 195',
        superior: 'M -37 95 H -33',
        inferior: 'M -37 195 H -33'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.8
    } as RenderComponent);
    registry.addComponent(tibia, {
      type: 'BoneComponent',
      id: tibia,
      displayName: 'Tibia',
      latinName: 'Tibia',
      bodyRegion: 'leg',
      parentBone: 'lowerLimbs',
      children: [],
      landmarks: [
        { name: 'Medial Malleolus (Left)', localPosition: { x: -35, y: 195 }, worldPosition: { x: 0, y: 0 } },
        { name: 'Medial Malleolus (Right)', localPosition: { x: 35, y: 195 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -35, minY: 95, maxX: 35, maxY: 195 },
      pivot: { x: 0, y: 145 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Fibula
    const fibula = 'bone-fibula';
    registry.createEntity(fibula);
    registry.addComponent(fibula, new TransformComponent(new TRS({ x: 0, y: 95 }), lowerLimbs));
    registry.addComponent(fibula, {
      type: 'RenderComponent',
      name: 'Fibula (Calf bone)',
      svgPaths: {
        anterior: 'M -39 95 L -39 195 M 39 95 L 39 195',
        posterior: 'M -39 95 L -39 195 M 39 95 L 39 195',
        leftLateral: 'M -37 95 L -37 195',
        rightLateral: 'M 37 95 L 37 195',
        superior: 'M -41 95 H -37',
        inferior: 'M -41 195 H -37'
      },
      lodMin: 0,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 0.8
    } as RenderComponent);
    registry.addComponent(fibula, {
      type: 'BoneComponent',
      id: fibula,
      displayName: 'Fibula',
      latinName: 'Fibula',
      bodyRegion: 'leg',
      parentBone: 'lowerLimbs',
      children: [],
      landmarks: [
        { name: 'Lateral Malleolus (Left)', localPosition: { x: -39, y: 195 }, worldPosition: { x: 0, y: 0 } },
        { name: 'Lateral Malleolus (Right)', localPosition: { x: 39, y: 195 }, worldPosition: { x: 0, y: 0 } }
      ],
      boundingBox: { minX: -39, minY: 95, maxX: 39, maxY: 195 },
      pivot: { x: 0, y: 145 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Tarsals
    const tarsals = 'bone-tarsals';
    registry.createEntity(tarsals);
    registry.addComponent(tarsals, new TransformComponent(new TRS({ x: 0, y: 197 }), lowerLimbs));
    registry.addComponent(tarsals, {
      type: 'RenderComponent',
      name: 'Tarsals (Ankle)',
      svgPaths: {
        anterior: 'M -39.8 0 A 2.8 2.8 0 1 0 -34.2 0 A 2.8 2.8 0 1 0 -39.8 0 M 34.2 0 A 2.8 2.8 0 1 0 39.8 0 A 2.8 2.8 0 1 0 34.2 0',
        posterior: 'M -39.8 0 A 2.8 2.8 0 1 0 -34.2 0 A 2.8 2.8 0 1 0 -39.8 0 M 34.2 0 A 2.8 2.8 0 1 0 39.8 0 A 2.8 2.8 0 1 0 34.2 0',
        leftLateral: 'M -37 0 A 2.8 2.8 0 1 0 -32 0 Z',
        rightLateral: 'M 37 0 A 2.8 2.8 0 1 0 32 0 Z',
        superior: 'M -39 0 H -35',
        inferior: 'M -39 0 H -35'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(tarsals, {
      type: 'BoneComponent',
      id: tarsals,
      displayName: 'Tarsals',
      latinName: 'Ossa tarsi',
      bodyRegion: 'foot',
      parentBone: 'lowerLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -39.8, minY: -2.8, maxX: 39.8, maxY: 2.8 },
      pivot: { x: 0, y: 0 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Metatarsals
    const metatarsals = 'bone-metatarsals';
    registry.createEntity(metatarsals);
    registry.addComponent(metatarsals, new TransformComponent(new TRS({ x: 0, y: 197 }), lowerLimbs));
    registry.addComponent(metatarsals, {
      type: 'RenderComponent',
      name: 'Metatarsals (Instep)',
      svgPaths: {
        anterior: 'M -39 1 L -44 10 M -38 2 L -41 12 M -37 2 L -37 13 M -36 2 L -33 12 M -35 1 L -29 9 M 39 1 L 44 10 M 38 2 L 41 12 M 37 2 L 37 13 M 36 2 L 33 12 M 35 1 L 29 9',
        posterior: 'M -39 1 L -44 10 M -38 2 L -41 12 M -37 2 L -37 13 M -36 2 L -33 12 M -35 1 L -29 9 M 39 1 L 44 10 M 38 2 L 41 12 M 37 2 L 37 13 M 36 2 L 33 12 M 35 1 L 29 9',
        leftLateral: 'M -36 1 L -40 12',
        rightLateral: 'M 36 1 L 40 12',
        superior: 'M -39 1 H -29',
        inferior: 'M -44 10 H -29'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);
    registry.addComponent(metatarsals, {
      type: 'BoneComponent',
      id: metatarsals,
      displayName: 'Metatarsals',
      latinName: 'Ossa metatarsalia',
      bodyRegion: 'foot',
      parentBone: 'lowerLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -44, minY: 1, maxX: 44, maxY: 13 },
      pivot: { x: 0, y: 7 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Foot Phalanges
    const phalFoot = 'bone-phalanges-foot';
    registry.createEntity(phalFoot);
    registry.addComponent(phalFoot, new TransformComponent(new TRS({ x: 0, y: 197 }), lowerLimbs));
    registry.addComponent(phalFoot, {
      type: 'RenderComponent',
      name: 'Foot Phalanges (Toes)',
      svgPaths: {
        anterior: 'M -44 10 L -47 14 M -41 12 L -43 17 M -37 13 L -37 19 M -33 12 L -32 17 M -29 9 L -26 13 M 44 10 L 47 14 M 41 12 L 43 17 M 37 13 L 37 19 M 33 12 L 32 17 M 29 9 L 26 13',
        posterior: 'M -44 10 L -47 14 M -41 12 L -43 17 M -37 13 L -37 19 M -33 12 L -32 17 M -29 9 L -26 13 M 44 10 L 47 14 M 41 12 L 43 17 M 37 13 L 37 19 M 33 12 L 32 17 M 29 9 L 26 13',
        leftLateral: 'M -40 12 L -43 17',
        rightLateral: 'M 40 12 L 43 17',
        superior: 'M -47 14 H -26',
        inferior: 'M -47 14 H -26'
      },
      lodMin: 1,
      lodMax: 4,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.0
    } as RenderComponent);
    registry.addComponent(phalFoot, {
      type: 'BoneComponent',
      id: phalFoot,
      displayName: 'Foot Phalanges',
      latinName: 'Phalanges digitorum pedis',
      bodyRegion: 'foot',
      parentBone: 'lowerLimbs',
      children: [],
      landmarks: [],
      boundingBox: { minX: -47, minY: 9, maxX: 47, maxY: 19 },
      pivot: { x: 0, y: 14 },
      rotation: 0,
      defaultVisibility: true
    } as BoneComponent);

    // Resolve children lists topologically for BoneComponents
    const bones = registry.query(['BoneComponent']);
    for (const boneId of bones) {
      const bone = registry.getComponent<BoneComponent>(boneId, 'BoneComponent')!;
      if (bone.parentBone && registry.hasComponent(bone.parentBone, 'BoneComponent')) {
        const parentBone = registry.getComponent<BoneComponent>(bone.parentBone, 'BoneComponent')!;
        if (!parentBone.children.includes(boneId)) {
          parentBone.children.push(boneId);
        }
      }
    }

    // Register Joint entities
    for (const joint of majorJointsList) {
      const jEntity = registry.createEntity(joint.id);
      registry.addComponent(jEntity, joint);
    }

    // ══════════════════════════════════════════════════════════
    // PHASE 2: MUSCULAR SYSTEM REGISTRATION
    // Every muscle entity added to the ECS registry.
    // TransformComponent is set relative to the muscle's primary origin bone.
    // ══════════════════════════════════════════════════════════
    for (const muscle of muscleDatabase) {
      // Use the first origin bone as the scene-graph parent
      const parentBone = muscle.originBones[0] || 'body';
      const mEntity = registry.createEntity(muscle.id);
      registry.addComponent(mEntity, new TransformComponent(
        new TRS({ x: 0, y: 0 }),
        parentBone
      ));
      registry.addComponent(mEntity, muscle);
    }
  }
}
