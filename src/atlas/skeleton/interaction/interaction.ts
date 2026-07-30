import { Registry } from '../../../engine/ecs/Registry';
import { BoneComponent } from '../../../engine/renderer/RenderPipeline';
import { JointComponent } from '../joints/joints';

export class SkeletalInteraction {
  /**
   * Retrieves all bones that directly articulate with the selected bone
   * by querying the JointComponent relationships in the registry.
   */
  public static getAdjacentBones(registry: Registry, boneId: string): string[] {
    const adjacent: string[] = [];
    const joints = registry.query(['JointComponent']);

    // Check joints in the registry
    for (const jId of joints) {
      const joint = registry.getComponent<JointComponent>(jId, 'JointComponent');
      if (joint && joint.connectedBones.includes(boneId)) {
        const otherBone = joint.connectedBones.find(id => id !== boneId);
        if (otherBone && !adjacent.includes(otherBone)) {
          adjacent.push(otherBone);
        }
      }
    }

    // Also include parent-child nodes in the scene graph hierarchy
    const bone = registry.getComponent<BoneComponent>(boneId, 'BoneComponent');
    if (bone) {
      if (bone.parentBone && !adjacent.includes(bone.parentBone)) {
        adjacent.push(bone.parentBone);
      }
      for (const childId of bone.children) {
        if (!adjacent.includes(childId)) {
          adjacent.push(childId);
        }
      }
    }

    return adjacent;
  }
}
