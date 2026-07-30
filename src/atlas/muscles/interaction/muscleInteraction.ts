import { muscleDatabase } from '../data/muscleData';

// ─────────────────────────────────────────────────────────────
// Muscle Interaction Engine
// Supports: isolation, synergist/antagonist highlight, adjacent resolve
// ─────────────────────────────────────────────────────────────
export class MuscleInteraction {

  /** Returns the synergist muscle IDs for a selected muscle */
  public static getSynergists(muscleId: string): string[] {
    const m = muscleDatabase.find(x => x.id === muscleId);
    return m ? m.synergists : [];
  }

  /** Returns the antagonist muscle IDs for a selected muscle */
  public static getAntagonists(muscleId: string): string[] {
    const m = muscleDatabase.find(x => x.id === muscleId);
    return m ? m.antagonists : [];
  }

  /** Returns muscles that share a bone attachment with the given muscle */
  public static getAdjacentMuscles(muscleId: string): string[] {
    const source = muscleDatabase.find(x => x.id === muscleId);
    if (!source) return [];

    const sharedBones = new Set([...source.originBones, ...source.insertionBones]);
    return muscleDatabase
      .filter(m => m.id !== muscleId && (
        m.originBones.some(b => sharedBones.has(b)) ||
        m.insertionBones.some(b => sharedBones.has(b))
      ))
      .map(m => m.id);
  }

  /** Returns all bones involved in a muscle's origin + insertion */
  public static getAttachmentBones(muscleId: string): { origins: string[]; insertions: string[] } {
    const m = muscleDatabase.find(x => x.id === muscleId);
    return m
      ? { origins: m.originBones, insertionBones: m.insertionBones } as any
      : { origins: [], insertions: [] };
  }

  /** Returns muscles that cross a given joint name */
  public static getMusclesCrossingJoint(joint: string): string[] {
    const q = joint.toLowerCase();
    return muscleDatabase
      .filter(m => m.crossesJoints.some(j => j.toLowerCase().includes(q)))
      .map(m => m.id);
  }

  /** Returns muscles innervated by a given nerve */
  public static getMusclesByNerve(nerve: string): string[] {
    const q = nerve.toLowerCase();
    return muscleDatabase
      .filter(m => m.innervation.toLowerCase().includes(q))
      .map(m => m.id);
  }
}
