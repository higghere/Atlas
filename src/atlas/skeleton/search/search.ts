import { Registry } from '../../../engine/ecs/Registry';
import { BoneComponent } from '../../../engine/renderer/RenderPipeline';
import { clinicalBoneDatabase } from '../metadata/boneMetadata';

export interface SearchResult {
  id: string;
  name: string;
  latinName: string;
  region: string;
  type: string;
  matchType: 'name' | 'latin' | 'synonym' | 'clinical' | 'region';
}

export class SkeletalSearchIndex {
  /**
   * Search through registered bones in the ECS using English, Latin, synonyms, or regions.
   */
  public static query(registry: Registry, queryStr: string): SearchResult[] {
    const results: SearchResult[] = [];
    const normalizedQuery = queryStr.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const bones = registry.query(['BoneComponent']);

    for (const bId of bones) {
      const bone = registry.getComponent<BoneComponent>(bId, 'BoneComponent')!;
      const clinical = clinicalBoneDatabase[bId];

      const name = bone.displayName.toLowerCase();
      const latin = bone.latinName.toLowerCase();
      const region = bone.bodyRegion.toLowerCase();

      // Check 1: Direct name match
      if (name.includes(normalizedQuery)) {
        results.push({
          id: bId,
          name: bone.displayName,
          latinName: bone.latinName,
          region: bone.bodyRegion,
          type: clinical?.boneType || 'flat',
          matchType: 'name'
        });
        continue;
      }

      // Check 2: Latin name match
      if (latin.includes(normalizedQuery)) {
        results.push({
          id: bId,
          name: bone.displayName,
          latinName: bone.latinName,
          region: bone.bodyRegion,
          type: clinical?.boneType || 'flat',
          matchType: 'latin'
        });
        continue;
      }

      // Check 3: Synonyms match
      if (clinical) {
        let isSynonymMatch = false;
        for (const syn of clinical.synonyms) {
          if (syn.toLowerCase().includes(normalizedQuery)) {
            isSynonymMatch = true;
            break;
          }
        }
        if (isSynonymMatch) {
          results.push({
            id: bId,
            name: bone.displayName,
            latinName: bone.latinName,
            region: bone.bodyRegion,
            type: clinical.boneType,
            matchType: 'synonym'
          });
          continue;
        }
      }

      // Check 4: Region match
      if (region.includes(normalizedQuery)) {
        results.push({
          id: bId,
          name: bone.displayName,
          latinName: bone.latinName,
          region: bone.bodyRegion,
          type: clinical?.boneType || 'flat',
          matchType: 'region'
        });
        continue;
      }

      // Check 5: Clinical Notes or Fractures match
      if (clinical) {
        if (
          clinical.clinicalNotes.toLowerCase().includes(normalizedQuery) ||
          clinical.commonFractures.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: bId,
            name: bone.displayName,
            latinName: bone.latinName,
            region: bone.bodyRegion,
            type: clinical.boneType,
            matchType: 'clinical'
          });
        }
      }
    }

    return results;
  }
}
