import { muscleDatabase } from '../data/muscleData';
import { Registry } from '../../../engine/ecs/Registry';

// ─────────────────────────────────────────────────────────────
// Muscle Validation Engine
// Validates anatomical integrity of the muscle database
// ─────────────────────────────────────────────────────────────
export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalMuscles: number;
    superficial: number;
    intermediate: number;
    deep: number;
    intrinsic: number;
    byGroup: Record<string, number>;
  };
}

export class MuscularValidator {
  public static validate(registry: Registry): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stats = {
      totalMuscles: muscleDatabase.length,
      superficial: 0,
      intermediate: 0,
      deep: 0,
      intrinsic: 0,
      byGroup: {} as Record<string, number>,
    };

    for (const muscle of muscleDatabase) {
      // Count by fascial layer
      stats[muscle.fascialLayer]++;

      // Count by group
      stats.byGroup[muscle.muscleGroup] = (stats.byGroup[muscle.muscleGroup] || 0) + 1;

      // Validate origin bones exist in ECS
      for (const boneId of muscle.originBones) {
        const hasTransform = registry.hasComponent(boneId, 'TransformComponent');
        if (!hasTransform) {
          warnings.push(`Muscle '${muscle.displayName}': origin bone '${boneId}' not found in ECS registry`);
        }
      }

      // Validate insertion bones exist in ECS
      for (const boneId of muscle.insertionBones) {
        const hasTransform = registry.hasComponent(boneId, 'TransformComponent');
        if (!hasTransform) {
          warnings.push(`Muscle '${muscle.displayName}': insertion bone '${boneId}' not found in ECS registry`);
        }
      }

      // Validate required fields
      if (!muscle.displayName) errors.push(`Muscle '${muscle.id}' is missing displayName`);
      if (!muscle.latinName)   errors.push(`Muscle '${muscle.id}' is missing latinName`);
      if (!muscle.innervation) errors.push(`Muscle '${muscle.id}' is missing innervation`);
      if (!muscle.bloodSupply) errors.push(`Muscle '${muscle.id}' is missing bloodSupply`);
      if (!muscle.primaryAction) errors.push(`Muscle '${muscle.id}' is missing primaryAction`);
      if (muscle.originBones.length === 0) errors.push(`Muscle '${muscle.id}' has no origin bones`);
      if (muscle.insertionBones.length === 0) errors.push(`Muscle '${muscle.id}' has no insertion bones`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      stats,
    };
  }
}
