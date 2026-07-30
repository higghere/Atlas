import { Registry, Entity } from './Registry';
import { TransformComponent, TRS } from '../transforms/TRS';
import { RenderComponent } from '../renderer/RenderPipeline';

export class SceneInitializer {
  public static initialize(registry: Registry): void {
    registry.clear();

    // 1. Root Entity
    const body = registry.createEntity('body');
    registry.addComponent(body, new TransformComponent(new TRS({ x: 0, y: 0 }), null));

    // 2. Main Cavity/Region Compartments (Scene Graph)
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

    // 3. ORGANS REGISTRATION
    // Brain
    registry.addComponent(registry.createEntity('brain'), new TransformComponent(new TRS({ x: 0, y: -25 }), head));
    registry.addComponent('brain', {
      type: 'RenderComponent',
      name: 'Brain',
      svgPath: 'M -22 -25 C -30 -40, -10 -55, 0 -55 C 10 -55, 30 -40, 22 -25 C 24 0, -24 0, -22 -25 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'nerves',
      baseFill: 'url(#grad-brain)',
      baseStroke: '#9f1239',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Heart
    registry.addComponent(registry.createEntity('heart'), new TransformComponent(new TRS({ x: 0, y: -5 }), thorax));
    registry.addComponent('heart', {
      type: 'RenderComponent',
      name: 'Heart',
      svgPath: 'M 0 -15 C -15 -25, -22 0, 0 16 C 22 0, 15 -25, 0 -15 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'cardio',
      baseFill: 'url(#grad-heart)',
      baseStroke: '#b91c1c',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Lungs
    registry.addComponent(registry.createEntity('lungs'), new TransformComponent(new TRS({ x: 0, y: 0 }), thorax));
    registry.addComponent('lungs', {
      type: 'RenderComponent',
      name: 'Lungs',
      svgPath: 'M -3 -27 C -12 -27, -22 -17, -22 3 C -22 23, -10 34, -3 34 C -8 24, -6 3, -3 -6 C -1 -15, -3 -23, -3 -27 Z M 3 -27 C 12 -27, 22 -17, 22 3 C 22 23, 10 34, 3 34 C 8 17, 4 -14, 4 -27 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'respiratory',
      baseFill: 'url(#grad-lungs)',
      baseStroke: '#0891b2',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Liver
    registry.addComponent(registry.createEntity('liver'), new TransformComponent(new TRS({ x: 0, y: -15 }), abdomen));
    registry.addComponent('liver', {
      type: 'RenderComponent',
      name: 'Liver',
      svgPath: 'M -34 -17 C -32 -20, 4 -17, 8 -5 C 8 5, -8 13, -32 0 C -38 -4, -36 -14, -34 -17 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'digestive',
      baseFill: 'url(#grad-liver)',
      baseStroke: '#854d0e',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Stomach
    registry.addComponent(registry.createEntity('stomach'), new TransformComponent(new TRS({ x: 0, y: -15 }), abdomen));
    registry.addComponent('stomach', {
      type: 'RenderComponent',
      name: 'Stomach',
      svgPath: 'M 3 -17 C 10 -17, 25 -20, 27 -7 C 29 5, 20 17, 10 13 C 1 10, 1 -5, 3 -17 Z',
      lodMin: 2,
      lodMax: 6,
      layerType: 'digestive',
      baseFill: 'url(#grad-stomach)',
      baseStroke: '#b91c1c',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    // Kidneys
    registry.addComponent(registry.createEntity('kidney'), new TransformComponent(new TRS({ x: 0, y: -15 }), abdomen));
    registry.addComponent('kidney', {
      type: 'RenderComponent',
      name: 'Kidneys',
      svgPath: 'M 16 -16 C 20 -20, 26 -10, 24 2 C 22 8, 18 4, 16 0 T 16 -16 Z M -16 -10 C -20 -14, -28 -4, -26 8 C -24 14, -20 10, -16 6 T -16 -10 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'urinary',
      baseFill: 'url(#grad-kidneys)',
      baseStroke: '#047857',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Pancreas
    registry.addComponent(registry.createEntity('pancreas'), new TransformComponent(new TRS({ x: 0, y: 15 }), abdomen));
    registry.addComponent('pancreas', {
      type: 'RenderComponent',
      name: 'Pancreas',
      svgPath: 'M -15 -8 C 15 -14, 18 -2, -10 -4 Z',
      lodMin: 2,
      lodMax: 6,
      layerType: 'endocrine',
      baseFill: 'url(#grad-pancreas)',
      baseStroke: '#ca8a04',
      baseStrokeWidth: 1.0
    } as RenderComponent);

    // Bladder
    registry.addComponent(registry.createEntity('bladder'), new TransformComponent(new TRS({ x: 0, y: 18 }), pelvis));
    registry.addComponent('bladder', {
      type: 'RenderComponent',
      name: 'Urinary Bladder',
      svgPath: 'M -10 0 C -16 0, -16 14, 0 20 C 16 14, 16 0, 10 0 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'urinary',
      baseFill: '#eab308',
      baseStroke: '#ca8a04',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    // SKELETAL BONES REGISTRATION
    // Skull
    registry.addComponent(registry.createEntity('bone-frontal'), new TransformComponent(new TRS({ x: 0, y: -5 }), head));
    registry.addComponent('bone-frontal', {
      type: 'RenderComponent',
      name: 'Frontal Bone',
      svgPath: 'M -15 -5 C -25 -22, 0 -30, 0 -12 C 0 -5, -15 -5, -15 -5',
      lodMin: 1,
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
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-mandible'), new TransformComponent(new TRS({ x: 0, y: 16 }), head));
    registry.addComponent('bone-mandible', {
      type: 'RenderComponent',
      name: 'Mandible (Jawbone)',
      svgPath: 'M -11 0 L -9 10 C -7 13, 7 13, 9 10 L 11 0 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    // Clavicles
    registry.addComponent(registry.createEntity('bone-clavicle'), new TransformComponent(new TRS({ x: 0, y: -37 }), thorax));
    registry.addComponent('bone-clavicle', {
      type: 'RenderComponent',
      name: 'Clavicles (Collarbones)',
      svgPath: 'M -4 0 Q -22 2, -42 8 M 4 0 Q 22 2, 42 8',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.2
    } as RenderComponent);

    // Rib cage
    registry.addComponent(registry.createEntity('bone-ribs-true'), new TransformComponent(new TRS({ x: 0, y: -10 }), thorax));
    registry.addComponent('bone-ribs-true', {
      type: 'RenderComponent',
      name: 'True Ribs (1-7)',
      svgPath: 'M -4 -10 Q -38 -8, -42 12 M 4 -10 Q 38 -8, 42 12',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.5
    } as RenderComponent);

    // Pelvis
    registry.addComponent(registry.createEntity('bone-ilium'), new TransformComponent(new TRS({ x: 0, y: -4 }), pelvis));
    registry.addComponent('bone-ilium', {
      type: 'RenderComponent',
      name: 'Ilium (Pelvic Wings)',
      svgPath: 'M -28 -44 C -44 -44, -46 -22, -20 -12 C -16 -12, -20 -26, -24 -38 Z M 26 -44 C 44 -44, 46 -22, 20 -12 C 16 -12, 20 -26, 24 -38 Z',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: '#1e293b',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.2
    } as RenderComponent);

    // Limbs
    registry.addComponent(registry.createEntity('bone-humerus'), new TransformComponent(new TRS({ x: 0, y: -44 }), upperLimbs));
    registry.addComponent('bone-humerus', {
      type: 'RenderComponent',
      name: 'Humerus (L/R)',
      svgPath: 'M -42 -44 L -75 30 M 42 -44 L 75 30',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.8
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-radius'), new TransformComponent(new TRS({ x: 0, y: 30 }), upperLimbs));
    registry.addComponent('bone-radius', {
      type: 'RenderComponent',
      name: 'Radius (L/R)',
      svgPath: 'M -75 30 L -97 98 M 75 30 L 97 98',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.6
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-ulna'), new TransformComponent(new TRS({ x: 0, y: 30 }), upperLimbs));
    registry.addComponent('bone-ulna', {
      type: 'RenderComponent',
      name: 'Ulna (L/R)',
      svgPath: 'M -73 30 L -93 98 M 73 30 L 93 98',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 1.6
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-femur'), new TransformComponent(new TRS({ x: 0, y: -31 }), lowerLimbs));
    registry.addComponent('bone-femur', {
      type: 'RenderComponent',
      name: 'Femur (L/R Thigh)',
      svgPath: 'M -22 -31 L -35 85 M 22 -31 L 35 85',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 4.2
    } as RenderComponent);

    registry.addComponent(registry.createEntity('bone-tibia'), new TransformComponent(new TRS({ x: 0, y: 95 }), lowerLimbs));
    registry.addComponent('bone-tibia', {
      type: 'RenderComponent',
      name: 'Tibia (L/R Shin)',
      svgPath: 'M -35 95 L -35 195 M 35 95 L 35 195',
      lodMin: 1,
      lodMax: 6,
      layerType: 'skeleton',
      baseFill: 'none',
      baseStroke: '#64748b',
      baseStrokeWidth: 2.8
    } as RenderComponent);
  }
}
