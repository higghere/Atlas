import { describe, it, expect } from 'vitest';
import {
  AnatomyCoordinateTransform,
  CANONICAL_WIDTH,
  CANONICAL_HEIGHT,
  AnatomicalHitbox,
} from '../coordinateTransform';

describe('AnatomyCoordinateTransform Unit Tests', () => {
  it('should accurately convert canonical to normalized and back', () => {
    const canonicalPoint = { x: 170, y: 280 };
    const normalized = AnatomyCoordinateTransform.canonicalToNormalized(canonicalPoint);

    expect(normalized.x).toBeCloseTo(0.5, 5);
    expect(normalized.y).toBeCloseTo(0.5, 5);

    const backToCanonical = AnatomyCoordinateTransform.normalizedToCanonical(normalized);
    expect(backToCanonical.x).toBeCloseTo(170, 5);
    expect(backToCanonical.y).toBeCloseTo(280, 5);
  });

  it('should be invariant under simulated zoom and pan transforms', () => {
    const canonicalPoint = { x: 170, y: 82 };
    
    // Simulate SVG container element bounding box at 1.0x zoom
    const mockSvg1 = {
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        width: 340,
        height: 560,
      }),
    } as SVGSVGElement;

    const canonical1 = AnatomyCoordinateTransform.clientToCanonical(100 + 170, 50 + 82, mockSvg1);
    expect(canonical1.x).toBeCloseTo(170, 4);
    expect(canonical1.y).toBeCloseTo(82, 4);

    // Simulate 2.5x zoom and panned SVG container
    const mockSvgZoomed = {
      getBoundingClientRect: () => ({
        left: -150,
        top: -200,
        width: 340 * 2.5,
        height: 560 * 2.5,
      }),
    } as SVGSVGElement;

    // Client click point corresponding to canonical (170, 82) when zoomed 2.5x:
    // clientX = left + 170 * 2.5 = -150 + 425 = 275
    // clientY = top + 82 * 2.5 = -200 + 205 = 5
    const canonicalZoomed = AnatomyCoordinateTransform.clientToCanonical(275, 5, mockSvgZoomed);
    expect(canonicalZoomed.x).toBeCloseTo(170, 4);
    expect(canonicalZoomed.y).toBeCloseTo(82, 4);
  });

  it('should be invariant under browser resize (different width & height)', () => {
    // 4K monitor scaled SVG container
    const mockSvg4K = {
      getBoundingClientRect: () => ({
        left: 200,
        top: 100,
        width: 1020, // 340 * 3
        height: 1680, // 560 * 3
      }),
    } as SVGSVGElement;

    // Client click point corresponding to canonical (170, 280) on 4K screen:
    // clientX = 200 + 170 * 3 = 710
    // clientY = 100 + 280 * 3 = 940
    const canonical4K = AnatomyCoordinateTransform.clientToCanonical(710, 940, mockSvg4K);
    expect(canonical4K.x).toBeCloseTo(170, 4);
    expect(canonical4K.y).toBeCloseTo(280, 4);
  });

  it('should accurately evaluate points inside ellipse', () => {
    const ellipseGeom = { type: 'ellipse' as const, cx: 170, cy: 200, rx: 30, ry: 40 };

    expect(AnatomyCoordinateTransform.isPointInSingleRegion({ x: 170, y: 200 }, ellipseGeom)).toBe(true);
    expect(AnatomyCoordinateTransform.isPointInSingleRegion({ x: 180, y: 210 }, ellipseGeom)).toBe(true);
    expect(AnatomyCoordinateTransform.isPointInSingleRegion({ x: 250, y: 300 }, ellipseGeom)).toBe(false);
  });

  it('should accurately evaluate points inside polygon', () => {
    const polyGeom = { type: 'polygon' as const, points: '100,100 200,100 200,200 100,200' };

    expect(AnatomyCoordinateTransform.isPointInSingleRegion({ x: 150, y: 150 }, polyGeom)).toBe(true);
    expect(AnatomyCoordinateTransform.isPointInSingleRegion({ x: 50, y: 150 }, polyGeom)).toBe(false);
  });

  it('should evaluate multi-region bilateral structures correctly', () => {
    const multiGeom = {
      type: 'multi-region' as const,
      regions: [
        { type: 'ellipse' as const, cx: 100, cy: 300, rx: 15, ry: 25 }, // Left kidney
        { type: 'ellipse' as const, cx: 240, cy: 300, rx: 15, ry: 25 }, // Right kidney
      ],
    };

    expect(AnatomyCoordinateTransform.isPointInGeometry({ x: 100, y: 300 }, multiGeom)).toBe(true);
    expect(AnatomyCoordinateTransform.isPointInGeometry({ x: 240, y: 300 }, multiGeom)).toBe(true);
    expect(AnatomyCoordinateTransform.isPointInGeometry({ x: 170, y: 300 }, multiGeom)).toBe(false);
  });

  it('should resolve higher priority hitboxes when shapes overlap', () => {
    const lowPriorityVessels: AnatomicalHitbox = {
      id: 'lymphatic_vessels',
      name: 'Lymphatic Vessels',
      system: 'Lymphatic System',
      priority: 5,
      geometry: { type: 'polygon', points: '100,100 240,100 240,400 100,400' },
    };

    const highPrioritySpleen: AnatomicalHitbox = {
      id: 'spleen',
      name: 'Spleen',
      system: 'Immune & Lymphatic System',
      priority: 100,
      geometry: { type: 'polygon', points: '186,218 206,218 212,246 190,252 182,234' },
    };

    const hitboxes = [lowPriorityVessels, highPrioritySpleen];

    // Inside spleen (which is also inside vessels)
    const resultSpleen = AnatomyCoordinateTransform.performHitTest({ x: 195, y: 230 }, hitboxes);
    expect(resultSpleen?.id).toBe('spleen');

    // Outside spleen, but inside vessels
    const resultVessels = AnatomyCoordinateTransform.performHitTest({ x: 120, y: 150 }, hitboxes);
    expect(resultVessels?.id).toBe('lymphatic_vessels');
  });

  it('should return null when clicking empty space', () => {
    const hitboxes: AnatomicalHitbox[] = [
      {
        id: 'brain',
        name: 'Brain',
        system: 'Nervous System',
        priority: 50,
        geometry: { type: 'ellipse', cx: 170, cy: 40, rx: 25, ry: 20 },
      },
    ];

    expect(AnatomyCoordinateTransform.performHitTest({ x: 10, y: 10 }, hitboxes)).toBeNull();
  });
});
