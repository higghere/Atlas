import { StructureMetadata } from './AnatomyRegistry';

export class AnatomyLoader {
  private static metadataCache: Map<string, Record<string, StructureMetadata>> = new Map();

  public static async loadSVG(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load SVG from ${url}`);
    return await res.text();
  }

  public static async loadMetadata(systemId: string, metadataUrl: string): Promise<Record<string, StructureMetadata>> {
    if (this.metadataCache.has(systemId)) {
      return this.metadataCache.get(systemId)!;
    }
    try {
      const res = await fetch(metadataUrl);
      if (!res.ok) return {};
      const data = await res.json();
      const map: Record<string, StructureMetadata> = {};
      if (Array.isArray(data.structures)) {
        data.structures.forEach((item: StructureMetadata) => {
          map[item.id] = item;
        });
      }
      this.metadataCache.set(systemId, map);
      return map;
    } catch {
      return {};
    }
  }
}
