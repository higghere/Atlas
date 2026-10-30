export const CANONICAL_WIDTH = 340;
export const CANONICAL_HEIGHT = 560;

export interface Point2D {
  x: number;
  y: number;
}

export interface TransformState {
  panX: number;
  panY: number;
  zoom: number;
  offsetY?: number;
  scaleMultiplier?: number;
}

export type GeometryType = 'ellipse' | 'rect' | 'polygon' | 'multi-region';

export interface SingleRegionGeometry {
  type: 'ellipse' | 'rect' | 'polygon';
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  points?: string;
}

export interface MultiRegionGeometry {
  type: 'multi-region';
  regions: SingleRegionGeometry[];
}

export type AnatomicalGeometry = SingleRegionGeometry | MultiRegionGeometry;

export interface AnatomicalHitbox {
  id: string;
  name: string;
  system: string;
  priority: number;
  geometry: AnatomicalGeometry;
}

/**
 * Universal Coordinate Transform Utility for Human Atlas
 */
export class AnatomyCoordinateTransform {
  /**
   * Convert canonical coordinate (0..340, 0..560) to normalized (0..1, 0..1)
   */
  static canonicalToNormalized(p: Point2D): Point2D {
    return {
      x: p.x / CANONICAL_WIDTH,
      y: p.y / CANONICAL_HEIGHT,
    };
  }

  /**
   * Convert normalized (0..1, 0..1) to canonical (0..340, 0..560)
   */
  static normalizedToCanonical(p: Point2D): Point2D {
    return {
      x: p.x * CANONICAL_WIDTH,
      y: p.y * CANONICAL_HEIGHT,
    };
  }

  /**
   * Convert canonical point to rendered SVG viewport pixel position given pan and zoom
   */
  static canonicalToViewport(
    p: Point2D,
    svgElement: SVGSVGElement | null,
    transform: TransformState = { panX: 0, panY: 0, zoom: 1 }
  ): Point2D {
    if (!svgElement) {
      return p;
    }
    const rect = svgElement.getBoundingClientRect();
    const scaleX = rect.width / CANONICAL_WIDTH;
    const scaleY = rect.height / CANONICAL_HEIGHT;

    return {
      x: p.x * scaleX,
      y: p.y * scaleY,
    };
  }

  /**
   * Convert mouse/touch event client coordinates into canonical 340x560 coordinates
   */
  static clientToCanonical(
    clientX: number,
    clientY: number,
    svgElement: SVGSVGElement
  ): Point2D {
    const rect = svgElement.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const canonicalX = (relativeX / rect.width) * CANONICAL_WIDTH;
    const canonicalY = (relativeY / rect.height) * CANONICAL_HEIGHT;

    return {
      x: Math.max(0, Math.min(CANONICAL_WIDTH, canonicalX)),
      y: Math.max(0, Math.min(CANONICAL_HEIGHT, canonicalY)),
    };
  }

  /**
   * Parse points string 'x1,y1 x2,y2 ...' into array of Point2D
   */
  static parsePoints(pointsStr: string): Point2D[] {
    if (!pointsStr) return [];
    return pointsStr
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [x, y] = pair.split(',').map(Number);
        return { x, y };
      })
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));
  }

  /**
   * Check if point (x, y) is inside polygon (ray-casting algorithm)
   */
  static isPointInPolygon(p: Point2D, polygon: Point2D[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect =
        yi > p.y !== yj > p.y &&
        p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Check if point is inside ellipse
   */
  static isPointInEllipse(p: Point2D, cx: number, cy: number, rx: number, ry: number): boolean {
    const dx = p.x - cx;
    const dy = p.y - cy;
    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
  }

  /**
   * Check if point is inside rectangle
   */
  static isPointInRect(p: Point2D, x: number, y: number, w: number, h: number): boolean {
    return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
  }

  /**
   * Check if point is inside a single region geometry
   */
  static isPointInSingleRegion(p: Point2D, geom: SingleRegionGeometry): boolean {
    if (geom.type === 'ellipse' && geom.cx !== undefined && geom.cy !== undefined && geom.rx && geom.ry) {
      return this.isPointInEllipse(p, geom.cx, geom.cy, geom.rx, geom.ry);
    }
    if (geom.type === 'rect' && geom.x !== undefined && geom.y !== undefined && geom.w && geom.h) {
      return this.isPointInRect(p, geom.x, geom.y, geom.w, geom.h);
    }
    if (geom.type === 'polygon' && geom.points) {
      const polygonPoints = this.parsePoints(geom.points);
      return this.isPointInPolygon(p, polygonPoints);
    }
    return false;
  }

  /**
   * Check if point is inside any region of an AnatomicalGeometry (supports MultiRegion)
   */
  static isPointInGeometry(p: Point2D, geom: AnatomicalGeometry): boolean {
    if (geom.type === 'multi-region') {
      return geom.regions.some((region) => this.isPointInSingleRegion(p, region));
    }
    return this.isPointInSingleRegion(p, geom);
  }

  /**
   * Perform deterministic priority-ordered hit test against list of AnatomicalHitbox items
   */
  static performHitTest(p: Point2D, hitboxes: AnatomicalHitbox[]): AnatomicalHitbox | null {
    const matching = hitboxes.filter((hb) => this.isPointInGeometry(p, hb.geometry));
    if (matching.length === 0) return null;
    matching.sort((a, b) => b.priority - a.priority);
    return matching[0];
  }
}
