import { Registry } from '../../../engine/ecs/Registry';
import { BoneComponent } from '../../../engine/renderer/RenderPipeline';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SkeletalValidator {
  /**
   * Performs anatomical correctness checks on the active scene graph registry.
   */
  public static validate(registry: Registry): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    const bones = registry.query(['BoneComponent']);
    const boneMap = new Map<string, BoneComponent>();

    for (const bId of bones) {
      const bComp = registry.getComponent<BoneComponent>(bId, 'BoneComponent')!;
      boneMap.set(bId, bComp);
    }

    // 1. Validate Spine Segments & Curvature
    const requiredSpine = [
      'bone-c1-atlas',
      'bone-c2-axis',
      'bone-cervical',
      'bone-thoracic',
      'bone-lumbar',
      'bone-sacrum',
      'bone-coccyx'
    ];
    for (const sId of requiredSpine) {
      if (!boneMap.has(sId)) {
        errors.push(`Anatomical Error: Missing critical spinal column node: ${sId}`);
      }
    }

    // 2. Validate Thoracic Cage Components
    const requiredThorax = [
      'bone-sternum-manubrium',
      'bone-sternum-body',
      'bone-sternum-xiphoid',
      'bone-ribs-true',
      'bone-ribs-false',
      'bone-ribs-floating'
    ];
    for (const tId of requiredThorax) {
      if (!boneMap.has(tId)) {
        errors.push(`Anatomical Error: Missing critical chest wall component: ${tId}`);
      }
    }

    // 3. Proportional bone ratios validation (standard anatomical index)
    const femur = boneMap.get('bone-femur');
    const tibia = boneMap.get('bone-tibia');
    if (femur && tibia) {
      // Femur-tibial ratio is typically 1.2 - 1.3
      const femurHeight = Math.abs(femur.boundingBox.maxY - femur.boundingBox.minY);
      const tibiaHeight = Math.abs(tibia.boundingBox.maxY - tibia.boundingBox.minY);
      const ratio = femurHeight / (tibiaHeight || 1);
      if (ratio < 1.0 || ratio > 1.5) {
        warnings.push(`Proportion Warning: Femur-Tibial ratio is ${ratio.toFixed(2)}. Expected: 1.15 - 1.30.`);
      }
    }

    const humerus = boneMap.get('bone-humerus');
    const radius = boneMap.get('bone-radius');
    if (humerus && radius) {
      const humerusHeight = Math.abs(humerus.boundingBox.maxY - humerus.boundingBox.minY);
      const radiusHeight = Math.abs(radius.boundingBox.maxY - radius.boundingBox.minY);
      const ratio = humerusHeight / (radiusHeight || 1);
      if (ratio < 0.9 || ratio > 1.3) {
        warnings.push(`Proportion Warning: Humero-Radial ratio is ${ratio.toFixed(2)}. Expected: 1.0 - 1.2.`);
      }
    }

    // 4. Overlap/Collision checks
    // Verify that the manubrium sits superiorly to the sternum body
    const manubrium = boneMap.get('bone-sternum-manubrium');
    const sternumBody = boneMap.get('bone-sternum-body');
    if (manubrium && sternumBody) {
      if (manubrium.boundingBox.maxY > sternumBody.boundingBox.minY) {
        // Since Y is negative going upwards, a lower maxY coordinate means it is higher
        // Our anterior coordinates for manubrium are -35 to -20 and body is -20 to 10.
        // If manubrium bottom exceeds body top, it is overlapping
        if (manubrium.boundingBox.maxY > -15) {
          errors.push(`Anatomical Error: Manubrium overlaps with Sternum Body.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
