import React from 'react';
import { NERVOUS_STRUCTURES_CATALOG, NervousStructureComponent } from '../data/nervousData';

interface NervousAtlasRendererProps {
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  onHoverStructure: (structure: NervousStructureComponent | null, x: number, y: number) => void;
}

export const NervousAtlasRenderer: React.FC<NervousAtlasRendererProps> = ({
  selectedStructureId,
  onSelectStructure,
  onHoverStructure,
}) => {
  return (
    <g className="nervous-atlas-hitbox-layer" style={{ pointerEvents: 'auto' }}>
      {NERVOUS_STRUCTURES_CATALOG.map((struct) => {
        const isSelected = selectedStructureId === struct.id;

        const commonProps = {
          fill: isSelected ? '#22d3ee55' : 'transparent',
          stroke: isSelected ? '#22d3ee' : 'transparent',
          strokeWidth: isSelected ? 2 : 0,
          filter: isSelected ? 'url(#hz-glow-selected)' : undefined,
          style: { cursor: 'pointer', transition: 'all 0.15s ease' },
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelectStructure(isSelected ? null : struct.id);
          },
          onMouseEnter: (e: React.MouseEvent) => {
            const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
            if (bounds) {
              onHoverStructure(struct, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
            }
          },
          onMouseMove: (e: React.MouseEvent) => {
            const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
            if (bounds) {
              onHoverStructure(struct, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
            }
          },
          onMouseLeave: () => onHoverStructure(null, 0, 0),
        };

        if (struct.shapeType === 'ellipse' && struct.cx !== undefined && struct.cy !== undefined) {
          return (
            <ellipse
              key={`nervous_hitbox_${struct.id}`}
              cx={struct.cx}
              cy={struct.cy}
              rx={struct.rx || 10}
              ry={struct.ry || 10}
              {...commonProps}
            />
          );
        }

        return (
          <polygon
            key={`nervous_hitbox_${struct.id}`}
            points={struct.points || ''}
            {...commonProps}
          />
        );
      })}
    </g>
  );
};
