import { AnatomicalSystemConfig } from './AnatomyRegistry';

export class LayerManager {
  private systems: Map<string, AnatomicalSystemConfig> = new Map();

  constructor() {
    this.registerDefaultSystems();
  }

  private registerDefaultSystems() {
    const defaults: AnatomicalSystemConfig[] = [
      { id: 'skin', displayName: 'Skin Envelope', svgPath: '', visibility: true, opacity: 0.1, selectable: false, layerPriority: 1 },
      { id: 'muscular', displayName: 'Muscular System', svgPath: '', visibility: false, opacity: 0.8, selectable: true, layerPriority: 2 },
      { id: 'skeleton', displayName: 'Skeletal System', svgPath: '', visibility: true, opacity: 0.35, selectable: true, layerPriority: 3 },
      { id: 'cardiovascular', displayName: 'Cardiovascular System', svgPath: '', visibility: true, opacity: 0.85, selectable: true, layerPriority: 4 },
      { id: 'digestive', displayName: 'Digestive System', svgPath: '', visibility: false, opacity: 0.6, selectable: true, layerPriority: 5 },
      { id: 'endocrine', displayName: 'Endocrine System', svgPath: '', visibility: false, opacity: 0.6, selectable: true, layerPriority: 6 },
      { id: 'nervous', displayName: 'Nervous System', svgPath: '', visibility: false, opacity: 0.6, selectable: true, layerPriority: 7 },
    ];
    defaults.forEach(sys => this.systems.set(sys.id, sys));
  }

  public getSystem(id: string): AnatomicalSystemConfig | undefined {
    return this.systems.get(id);
  }

  public getAllSystems(): AnatomicalSystemConfig[] {
    return Array.from(this.systems.values()).sort((a, b) => a.layerPriority - b.layerPriority);
  }

  public setVisibility(id: string, visibility: boolean) {
    const sys = this.systems.get(id);
    if (sys) sys.visibility = visibility;
  }

  public setOpacity(id: string, opacity: number) {
    const sys = this.systems.get(id);
    if (sys) sys.opacity = opacity;
  }
}
