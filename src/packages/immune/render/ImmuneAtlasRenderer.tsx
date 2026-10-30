import React from 'react';
import { IMMUNE_LYMPHATIC_STRUCTURES_CATALOG, ImmuneLymphaticStructureComponent } from '../data/immuneData';

interface ImmuneAtlasRendererProps {
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  onHoverStructure: (structure: ImmuneLymphaticStructureComponent | null, x: number, y: number) => void;
}

export const ImmuneAtlasRenderer: React.FC<ImmuneAtlasRendererProps> = ({
  selectedStructureId,
  onSelectStructure,
  onHoverStructure,
}) => {
  return (
    <g className="immune-atlas-hitbox-layer" style={{ pointerEvents: 'auto' }}>
      {[...IMMUNE_LYMPHATIC_STRUCTURES_CATALOG].sort((a, b) => (a.priority || 100) - (b.priority || 100)).map((struct) => {
        const isSelected = selectedStructureId === struct.id;

        const commonProps = {
          fill: isSelected ? '#10b98155' : 'transparent',
          stroke: isSelected ? '#10b981' : 'transparent',
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
              key={`immune_hitbox_${struct.id}`}
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
            key={`immune_hitbox_${struct.id}`}
            points={struct.points || ''}
            {...commonProps}
          />
        );
      })}
    </g>
  );
};
