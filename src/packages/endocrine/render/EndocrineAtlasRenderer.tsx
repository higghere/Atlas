import React from 'react';
import { ENDOCRINE_GLANDS_CATALOG, EndocrineGlandComponent } from '../data/endocrineData';

interface EndocrineAtlasRendererProps {
  selectedGlandId: string | null;
  onSelectGland: (id: string | null) => void;
  onHoverGland: (gland: EndocrineGlandComponent | null, x: number, y: number) => void;
}

export const EndocrineAtlasRenderer: React.FC<EndocrineAtlasRendererProps> = ({
  selectedGlandId,
  onSelectGland,
  onHoverGland,
}) => {
  return (
    <g className="endocrine-atlas-hitbox-layer" style={{ pointerEvents: 'auto' }}>
      {ENDOCRINE_GLANDS_CATALOG.map((gland) => {
        const isSelected = selectedGlandId === gland.id;

        const commonProps = {
          fill: isSelected ? '#a855f755' : 'transparent',
          stroke: isSelected ? '#a855f7' : 'transparent',
          strokeWidth: isSelected ? 2 : 0,
          filter: isSelected ? 'url(#hz-glow-selected)' : undefined,
          style: { cursor: 'pointer', transition: 'all 0.15s ease' },
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelectGland(isSelected ? null : gland.id);
          },
          onMouseEnter: (e: React.MouseEvent) => {
            const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
            if (bounds) {
              onHoverGland(gland, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
            }
          },
          onMouseMove: (e: React.MouseEvent) => {
            const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
            if (bounds) {
              onHoverGland(gland, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
            }
          },
          onMouseLeave: () => onHoverGland(null, 0, 0),
        };

        if (gland.shapeType === 'ellipse' && gland.cx !== undefined && gland.cy !== undefined) {
          return (
            <ellipse
              key={`endocrine_hitbox_${gland.id}`}
              cx={gland.cx}
              cy={gland.cy}
              rx={gland.rx || 10}
              ry={gland.ry || 10}
              {...commonProps}
            />
          );
        }

        return (
          <polygon
            key={`endocrine_hitbox_${gland.id}`}
            points={gland.points || ''}
            {...commonProps}
          />
        );
      })}
    </g>
  );
};
