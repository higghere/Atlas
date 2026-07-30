import { VASCULAR_CATALOG_MAP, ALL_CARDIOVASCULAR_NODES } from '../data/cardiovascularData';
import { VesselComponent, LODLevel } from '../entities/VesselComponent';

export class CirculationGraph {
  /**
   * Traces upstream supply pathway (e.g. Radial Artery -> Brachial -> Axillary -> Subclavian -> Arch -> Aorta -> Left Ventricle)
   */
  public static traceUpstreamSupply(vesselId: string): string[] {
    const pathway: string[] = [];
    let currentId: string | null = vesselId;
    const visited = new Set<string>();

    while (currentId && VASCULAR_CATALOG_MAP[currentId] && !visited.has(currentId)) {
      pathway.push(currentId);
      visited.add(currentId);
      currentId = VASCULAR_CATALOG_MAP[currentId].parent;
    }
    return pathway;
  }

  /**
   * Traces downstream flow loop from a given vessel down to terminal branches or heart chambers
   */
  public static traceDownstreamFlow(vesselId: string): string[] {
    const pathway: string[] = [];
    const queue: string[] = [vesselId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (visited.has(curr)) continue;
      visited.add(curr);
      pathway.push(curr);

      const vessel = VASCULAR_CATALOG_MAP[curr];
      if (vessel) {
        queue.push(...vessel.children);
        queue.push(...vessel.flowOut);
      }
    }
    return pathway;
  }

  /**
   * Filter vessels by Level of Detail (LOD 0 to 4)
   */
  public static filterByLOD(lod: LODLevel): VesselComponent[] {
    return ALL_CARDIOVASCULAR_NODES.filter(v => v.lodLevel <= lod);
  }

  /**
   * Search vessels by query (Name, Latin Name, Region, Organ)
   */
  public static search(query: string): VesselComponent[] {
    if (!query || !query.trim()) return ALL_CARDIOVASCULAR_NODES;
    const q = query.toLowerCase().trim();
    return ALL_CARDIOVASCULAR_NODES.filter(v =>
      v.displayName.toLowerCase().includes(q) ||
      v.latinName.toLowerCase().includes(q) ||
      v.region.toLowerCase().includes(q) ||
      v.connectedOrgans.some(o => o.toLowerCase().includes(q)) ||
      v.clinicalImportance.toLowerCase().includes(q)
    );
  }
}
