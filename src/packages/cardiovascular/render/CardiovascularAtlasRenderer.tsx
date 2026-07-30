import React from 'react';

export interface CardiactHitZone {
  id: string;
  name: string;
  latinName: string;
  type: 'Heart' | 'Artery' | 'Vein';
  points: string; // SVG polygon hit zone coordinates
  description: string;
}

// Invisible hitboxes calibrated to InnerBody cardiovascular anatomy (340x560 canvas)
export const CARDIO_HIT_ZONES: CardiactHitZone[] = [
  // Mediastinum & Heart
  { id: 'heart', name: 'Heart & Coronary Vessels', latinName: 'Cor', type: 'Heart', points: '158,162 178,160 184,180 178,212 162,204 156,182', description: 'Central muscular pump in mediastinum supplying systemic & pulmonary circulation.' },
  { id: 'ascending_aorta', name: 'Ascending Aorta & Arch', latinName: 'Arcus aortae', type: 'Artery', points: '166,122 176,122 174,152 166,152', description: 'Primary high-pressure arterial arch emerging from Left Ventricle.' },
  { id: 'svc', name: 'Superior Vena Cava (SVC)', latinName: 'Vena cava superior', type: 'Vein', points: '156,120 164,120 164,165 156,165', description: 'Major venous trunk draining head, neck, and upper limbs into Right Atrium.' },
  { id: 'ivc', name: 'Inferior Vena Cava (IVC)', latinName: 'Vena cava inferior', type: 'Vein', points: '170,210 178,210 178,300 170,300', description: 'Largest venous trunk draining abdomen and lower extremity return.' },
  
  // Head & Neck
  { id: 'left_carotid', name: 'Left Common Carotid Artery', latinName: 'Arteria carotis communis sinistra', type: 'Artery', points: '160,54 168,54 168,120 160,120', description: 'Ascends left neck to supply left cerebral cortex.' },
  { id: 'right_carotid', name: 'Right Common Carotid Artery', latinName: 'Arteria carotis communis dextra', type: 'Artery', points: '176,54 184,54 184,110 176,110', description: 'Ascends right neck to supply right cerebral hemisphere.' },
  
  // Upper Limbs
  { id: 'left_arm_vessels', name: 'Left Upper Limb Vessels (Brachial/Radial)', latinName: 'Vasa membri superioris sinistri', type: 'Artery', points: '96,126 120,126 104,276 76,390 92,390 114,276', description: 'Arterial & venous chain following humerus, radius, and ulna down to left hand.' },
  { id: 'right_arm_vessels', name: 'Right Upper Limb Vessels (Brachial/Radial)', latinName: 'Vasa membri superioris dextri', type: 'Artery', points: '220,126 244,126 264,390 248,390 228,276', description: 'Arterial & venous chain following humerus, radius, and ulna down to right hand.' },

  // Abdomen & Renal
  { id: 'abdominal_aorta', name: 'Abdominal Aorta & Visceral Branches', latinName: 'Aorta abdominalis', type: 'Artery', points: '162,210 172,210 172,284 162,284', description: 'Abdominal arterial trunk giving off celiac, mesenteric, and renal arteries.' },

  // Lower Limbs
  { id: 'left_femoral', name: 'Left Lower Limb Vessels (Femoral/Tibial)', latinName: 'Arteria femoralis sinistra', type: 'Artery', points: '144,306 158,306 150,558 138,558', description: 'Femoral and popliteal vascular chain following left femur and tibia down to foot.' },
  { id: 'right_femoral', name: 'Right Lower Limb Vessels (Femoral/Tibial)', latinName: 'Arteria femoralis dextra', type: 'Artery', points: '182,306 196,306 198,558 186,558', description: 'Femoral and popliteal vascular chain following right femur and tibia down to foot.' },
];

interface CardiovascularAtlasRendererProps {
  selectedVesselId: string | null;
  onSelectVessel: (id: string | null) => void;
  onHoverVessel: (vessel: { id: string; name: string } | null, x: number, y: number) => void;
}

export const CardiovascularAtlasRenderer: React.FC<CardiovascularAtlasRendererProps> = ({
  selectedVesselId,
  onSelectVessel,
  onHoverVessel,
}) => {
  return (
    <g className="cardiovascular-atlas-hitbox-layer" style={{ pointerEvents: 'auto' }}>
      {CARDIO_HIT_ZONES.map((zone) => {
        const isSelected = selectedVesselId === zone.id;
        return (
          <polygon
            key={`cardio_hitbox_${zone.id}`}
            points={zone.points}
            fill={isSelected ? '#38bdf833' : 'transparent'}
            stroke={isSelected ? '#38bdf8' : 'transparent'}
            strokeWidth={isSelected ? 1.5 : 0}
            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectVessel(isSelected ? null : zone.id);
            }}
            onMouseEnter={(e) => {
              const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
              if (bounds) {
                onHoverVessel({ id: zone.id, name: zone.name }, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
              }
            }}
            onMouseMove={(e) => {
              const bounds = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
              if (bounds) {
                onHoverVessel({ id: zone.id, name: zone.name }, e.clientX - bounds.left + 15, e.clientY - bounds.top - 10);
              }
            }}
            onMouseLeave={() => onHoverVessel(null, 0, 0)}
          />
        );
      })}
    </g>
  );
};
