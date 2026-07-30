import React from 'react';
import { DIGESTIVE_ORGANS_CATALOG, DigestiveOrganComponent } from '../data/digestiveData';

interface DigestiveAtlasRendererProps {
  selectedOrganId: string | null;
  onSelectOrgan: (id: string | null) => void;
  onHoverOrgan: (organ: DigestiveOrganComponent | null, x: number, y: number) => void;
}

export const DigestiveAtlasRenderer: React.FC<DigestiveAtlasRendererProps> = ({
  selectedOrganId,
  onSelectOrgan,
  onHoverOrgan,
}) => {
  return (
    <g className="digestive-atlas-hitbox-layer" style={{ pointerEvents: 'auto' }}>
      {DIGESTIVE_ORGANS_CATALOG.map((organ) => {
        const isSelected = selectedOrganId === organ.id;
        return (
          <polygon
            key={`digestive_hitbox_${organ.id}`}
            points={organ.points}
            fill={isSelected ? '#10b98144' : 'transparent'}
            stroke={isSelected ? '#10b981' : 'transparent'}
            strokeWidth={isSelected ? 2 : 0}
            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOrgan(isSelected ? null : organ.id);
            }}
            onMouseEnter={(e) => {
              const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
              if (bounds) {
                onHoverOrgan(organ, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
              }
            }}
            onMouseMove={(e) => {
              const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
              if (bounds) {
                onHoverOrgan(organ, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
              }
            }}
            onMouseLeave={() => onHoverOrgan(null, 0, 0)}
          />
        );
      })}
    </g>
  );
};
