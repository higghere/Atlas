import { describe, it, expect } from 'vitest';
import { AnatomicalHitTestingService } from '../anatomicalHitTesting';

describe('AnatomicalHitTestingService Unit Tests', () => {
  it('should select Spleen instead of Lymphatic Vessels when clicking upper left abdomen', () => {
    // Canonical spleen point: x: 195, y: 235
    const hit = AnatomicalHitTestingService.getHitboxForSystem({ x: 195, y: 235 }, 'immune_lymphatic');
    expect(hit).not.toBeNull();
    expect(hit?.id).toBe('spleen');
  });

  it('should select Thymus Gland when clicking anterior mediastinum', () => {
    // Canonical thymus point: x: 170, y: 140
    const hit = AnatomicalHitTestingService.getHitboxForSystem({ x: 170, y: 140 }, 'immune_lymphatic');
    expect(hit).not.toBeNull();
    expect(hit?.id).toBe('thymus');
  });

  it('should select Heart over systemic vessels in cardiovascular view', () => {
    // Canonical heart point: x: 170, y: 180
    const hit = AnatomicalHitTestingService.getHitboxForSystem({ x: 170, y: 180 }, 'cardiovascular');
    expect(hit).not.toBeNull();
    expect(hit?.id).toBe('heart');
  });

  it('should return null when clicking empty space', () => {
    const hit = AnatomicalHitTestingService.getHitboxForSystem({ x: 10, y: 10 }, 'immune_lymphatic');
    expect(hit).toBeNull();
  });
});
