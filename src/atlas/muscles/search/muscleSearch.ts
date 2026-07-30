import { muscleDatabase, muscleDatabaseMap } from '../data/muscleData';
import { MuscleComponent, MuscleGroup, FascialLayer } from '../entities/MuscleComponent';

// ─────────────────────────────────────────────────────────────
// Muscle Search Index (autocomplete)
// ─────────────────────────────────────────────────────────────

interface SearchToken {
  muscleId: string;
  tokens: string[];
}

const buildSearchIndex = (): SearchToken[] => {
  return muscleDatabase.map(m => ({
    muscleId: m.id,
    tokens: [
      m.displayName.toLowerCase(),
      m.latinName.toLowerCase(),
      m.muscleGroup.toLowerCase(),
      m.primaryAction.toLowerCase(),
      m.innervation.toLowerCase(),
      m.bloodSupply.toLowerCase(),
      m.originDescription.toLowerCase(),
      m.insertionDescription.toLowerCase(),
      ...m.secondaryActions.map(a => a.toLowerCase()),
      ...m.crossesJoints.map(j => j.toLowerCase()),
      ...m.commonInjuries.toLowerCase().split(/[,;]/),
    ].map(t => t.trim()).filter(Boolean)
  }));
};

const SEARCH_INDEX: SearchToken[] = buildSearchIndex();

export class MuscleSearchIndex {
  public static query(term: string): MuscleComponent[] {
    if (!term.trim()) return muscleDatabase;
    const q = term.toLowerCase().trim();
    const results = SEARCH_INDEX
      .filter(entry => entry.tokens.some(t => t.includes(q)))
      .map(entry => muscleDatabaseMap.get(entry.muscleId))
      .filter((m): m is MuscleComponent => m !== undefined);
    return results;
  }

  /** Returns muscle IDs that match a search term */
  public static queryIds(term: string): Set<string> {
    return new Set(MuscleSearchIndex.query(term).map(m => m.id));
  }

  /** Returns all muscles in a given group */
  public static byGroup(group: MuscleGroup): MuscleComponent[] {
    return muscleDatabase.filter(m => m.muscleGroup === group);
  }

  /** Returns all muscles in a given fascial layer */
  public static byLayer(layer: FascialLayer): MuscleComponent[] {
    return muscleDatabase.filter(m => m.fascialLayer === layer);
  }

  /** Returns muscles attached to a given bone entity ID */
  public static byBone(boneId: string): MuscleComponent[] {
    return muscleDatabase.filter(m =>
      m.originBones.includes(boneId) || m.insertionBones.includes(boneId)
    );
  }
}
