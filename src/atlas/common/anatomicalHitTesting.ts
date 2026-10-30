import {
  AnatomyCoordinateTransform,
  AnatomicalHitbox,
  Point2D,
} from './coordinateTransform';

import { DIGESTIVE_ORGANS_CATALOG } from '../../packages/digestive/data/digestiveData';
import { ENDOCRINE_GLANDS_CATALOG } from '../../packages/endocrine/data/endocrineData';
import { NERVOUS_STRUCTURES_CATALOG } from '../../packages/nervous/data/nervousData';
import { RESPIRATORY_STRUCTURES_CATALOG } from '../../packages/respiratory/data/respiratoryData';
import { IMMUNE_LYMPHATIC_STRUCTURES_CATALOG } from '../../packages/immune/data/immuneData';
import { CARDIO_HIT_ZONES } from '../../packages/cardiovascular/render/CardiovascularAtlasRenderer';

export class AnatomicalHitTestingService {
  /**
   * Universal hit test function for any given point in canonical 340x560 space
   */
  static getHitboxForSystem(
    p: Point2D,
    systemId: string
  ): { id: string; name: string } | null {
    const hitboxes: AnatomicalHitbox[] = [];

    if (systemId === 'digestive') {
      DIGESTIVE_ORGANS_CATALOG.forEach((item) => {
        hitboxes.push({
          id: item.id,
          name: item.name,
          system: 'Digestive',
          priority: item.id === 'appendix' ? 100 : 80,
          geometry: { type: 'polygon', points: item.points },
        });
      });
    } else if (systemId === 'endocrine') {
      ENDOCRINE_GLANDS_CATALOG.forEach((item) => {
        hitboxes.push({
          id: item.id,
          name: item.name,
          system: 'Endocrine',
          priority: item.id === 'parathyroids' ? 120 : 100,
          geometry:
            item.shapeType === 'ellipse' && item.cx !== undefined && item.cy !== undefined
              ? { type: 'ellipse', cx: item.cx, cy: item.cy, rx: item.rx || 10, ry: item.ry || 10 }
              : { type: 'polygon', points: item.points || '' },
        });
      });
    } else if (systemId === 'nervous') {
      NERVOUS_STRUCTURES_CATALOG.forEach((item) => {
        hitboxes.push({
          id: item.id,
          name: item.name,
          system: 'Nervous',
          priority: item.region === 'Central Nervous System' ? 90 : 70,
          geometry:
            item.shapeType === 'ellipse' && item.cx !== undefined && item.cy !== undefined
              ? { type: 'ellipse', cx: item.cx, cy: item.cy, rx: item.rx || 10, ry: item.ry || 10 }
              : { type: 'polygon', points: item.points || '' },
        });
      });
    } else if (systemId === 'respiratory') {
      RESPIRATORY_STRUCTURES_CATALOG.forEach((item) => {
        hitboxes.push({
          id: item.id,
          name: item.name,
          system: 'Respiratory',
          priority: item.id === 'trachea' || item.id === 'diaphragm' ? 100 : 80,
          geometry:
            item.shapeType === 'ellipse' && item.cx !== undefined && item.cy !== undefined
              ? { type: 'ellipse', cx: item.cx, cy: item.cy, rx: item.rx || 10, ry: item.ry || 10 }
              : { type: 'polygon', points: item.points || '' },
        });
      });
    } else if (systemId === 'immune_lymphatic') {
      IMMUNE_LYMPHATIC_STRUCTURES_CATALOG.forEach((item) => {
        hitboxes.push({
          id: item.id,
          name: item.name,
          system: 'Immune & Lymphatic',
          priority: item.priority || (item.id === 'lymphatic_vessels' ? 10 : 100),
          geometry:
            item.shapeType === 'ellipse' && item.cx !== undefined && item.cy !== undefined
              ? { type: 'ellipse', cx: item.cx, cy: item.cy, rx: item.rx || 10, ry: item.ry || 10 }
              : { type: 'polygon', points: item.points || '' },
        });
      });
    } else if (systemId === 'cardiovascular') {
      CARDIO_HIT_ZONES.forEach((item) => {
        hitboxes.push({
          id: item.id,
          name: item.name,
          system: 'Cardiovascular',
          priority: item.id === 'heart' ? 100 : 80,
          geometry: { type: 'polygon', points: item.points },
        });
      });
    }

    const match = AnatomyCoordinateTransform.performHitTest(p, hitboxes);
    return match ? { id: match.id, name: match.name } : null;
  }
}
