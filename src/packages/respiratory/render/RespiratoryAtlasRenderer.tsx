import React from 'react';
import { RESPIRATORY_STRUCTURES_CATALOG, RespiratoryStructureComponent } from '../data/respiratoryData';

interface RespiratoryAtlasRendererProps {
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  onHoverStructure: (structure: RespiratoryStructureComponent | null, x: number, y: number) => void;
}

export const RespiratoryAtlasRenderer: React.FC<RespiratoryAtlasRendererProps> = ({
  selectedStructureId,
  onSelectStructure,
  onHoverStructure,
}) => {
  return (
    <g className="respiratory-atlas-hitbox-layer" style={{ pointerEvents: 'auto' }}>
      {RESPIRATORY_STRUCTURES_CATALOG.map((struct) => {
        const isSelected = selectedStructureId === struct.id;

        const commonProps = {
          fill: isSelected ? '#38bdf855' : 'transparent',
          stroke: isSelected ? '#38bdf8' : 'transparent',
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
              key={`respiratory_hitbox_${struct.id}`}
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
            key={`respiratory_hitbox_${struct.id}`}
            points={struct.points || ''}
            {...commonProps}
          />
        );
      })}
    </g>
  );
};
