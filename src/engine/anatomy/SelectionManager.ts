import { BoundingBox } from './AnatomyRegistry';

export class SelectionManager {
  private selectedId: string | null = null;
  private listeners: Array<(id: string | null) => void> = [];

  public select(id: string | null) {
    this.selectedId = id;
    this.listeners.forEach(fn => fn(id));
  }

  public getSelectedId(): string | null {
    return this.selectedId;
  }

  public subscribe(fn: (id: string | null) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public static getBoundingBox(element: SVGElement): BoundingBox | null {
    try {
      const bbox = (element as SVGGraphicsElement).getBBox();
      return {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
        centerX: bbox.x + bbox.width / 2,
        centerY: bbox.y + bbox.height / 2,
      };
    } catch {
      return null;
    }
  }
}
