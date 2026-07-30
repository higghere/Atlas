// ─────────────────────────────────────────────────────────────
// Muscle Hit-Zones — SVG coordinate data
// Calibrated to 340×560 viewport (same as skeletal PNG)
// Anterior view only — posterior muscles (trapezius, glutes, hamstrings)
// are visible in the anterior view as partial shapes where applicable
// ─────────────────────────────────────────────────────────────

export type HitZoneShape = 'ellipse' | 'rect' | 'polygon';

export interface MuscleHitZone {
  id: string;              // muscle entity ID (must match muscleData.ts)
  label: string;           // display label for tooltip
  type: HitZoneShape;
  layer: 'superficial' | 'intermediate' | 'deep' | 'intrinsic';
  color: string;           // default fill color for this zone
  // Ellipse
  cx?: number; cy?: number; rx?: number; ry?: number;
  // Rect
  x?: number; y?: number; w?: number; h?: number;
  // Polygon
  points?: string;
}

// ─────────────────────────────────────────────────────────────
// All hit zones calibrated to 340×560 anterior view
// Colors follow a consistent scheme per region:
//   Head/neck:   #f59e0b (amber)
//   Shoulder:    #818cf8 (indigo)
//   Thorax:      #ec4899 (pink)
//   Back:        #8b5cf6 (purple)
//   Abdomen:     #10b981 (emerald)
//   Pelvis/Hip:  #f97316 (orange)
//   Upper arm:   #6366f1 (blue-violet)
//   Forearm:     #3b82f6 (blue)
//   Thigh:       #84cc16 (lime)
//   Leg:         #14b8a6 (teal)
// ─────────────────────────────────────────────────────────────
export const MUSCLE_HIT_ZONES: MuscleHitZone[] = [

  // ── HEAD & FACE ──────────────────────────────────────────
  { id: 'muscle-frontalis',       label: 'Frontalis',         type: 'ellipse', layer: 'superficial', color: '#f59e0b', cx: 170, cy: 30,  rx: 24, ry: 11 },
  { id: 'muscle-temporalis',      label: 'Temporalis',        type: 'ellipse', layer: 'deep',        color: '#f59e0b', cx: 148, cy: 48,  rx: 10, ry: 18 },
  { id: 'muscle-masseter',        label: 'Masseter',          type: 'ellipse', layer: 'superficial', color: '#f59e0b', cx: 148, cy: 72,  rx: 12, ry: 14 },
  { id: 'muscle-orbicularis-oculi', label: 'Orbicularis Oculi', type: 'ellipse', layer: 'superficial', color: '#f59e0b', cx: 156, cy: 56, rx: 10, ry: 5 },
  { id: 'muscle-orbicularis-oris',  label: 'Orbicularis Oris',  type: 'ellipse', layer: 'superficial', color: '#f59e0b', cx: 170, cy: 74, rx: 11, ry: 6 },

  // ── NECK ─────────────────────────────────────────────────
  { id: 'muscle-sternocleidomastoid', label: 'Sternocleidomastoid',
    type: 'polygon', layer: 'superficial', color: '#f59e0b',
    points: '148,88 160,100 165,126 156,130 148,108' },
  { id: 'muscle-sternocleidomastoid', label: 'Sternocleidomastoid (R)',
    type: 'polygon', layer: 'superficial', color: '#f59e0b',
    points: '192,88 180,100 175,126 184,130 192,108' },

  // ── SHOULDER ─────────────────────────────────────────────
  // Anterior deltoid (visible from front)
  { id: 'muscle-deltoid', label: 'Deltoid (Anterior)',
    type: 'polygon', layer: 'superficial', color: '#818cf8',
    points: '102,128 118,124 124,152 114,172 102,160' },
  { id: 'muscle-deltoid', label: 'Deltoid (Anterior, R)',
    type: 'polygon', layer: 'superficial', color: '#818cf8',
    points: '238,128 222,124 216,152 226,172 238,160' },
  // Trapezius (upper — visible anteriorly as neck-shoulder bridge)
  { id: 'muscle-trapezius', label: 'Trapezius (Upper)',
    type: 'polygon', layer: 'superficial', color: '#8b5cf6',
    points: '162,92 170,88 178,92 192,106 188,114 170,108 152,114 148,106' },

  // ── THORAX ───────────────────────────────────────────────
  // Pectoralis major
  { id: 'muscle-pectoralis-major', label: 'Pectoralis Major (L)',
    type: 'polygon', layer: 'superficial', color: '#ec4899',
    points: '134,130 158,128 168,148 162,180 140,185 120,170 118,148' },
  { id: 'muscle-pectoralis-major', label: 'Pectoralis Major (R)',
    type: 'polygon', layer: 'superficial', color: '#ec4899',
    points: '206,130 182,128 172,148 178,180 200,185 220,170 222,148' },
  // Serratus anterior (visible on lateral thorax)
  { id: 'muscle-serratus-anterior', label: 'Serratus Anterior (L)',
    type: 'polygon', layer: 'intermediate', color: '#ec4899',
    points: '118,172 130,162 134,195 128,210 116,200' },
  { id: 'muscle-serratus-anterior', label: 'Serratus Anterior (R)',
    type: 'polygon', layer: 'intermediate', color: '#ec4899',
    points: '222,172 210,162 206,195 212,210 224,200' },

  // ── ABDOMEN ──────────────────────────────────────────────
  // Rectus abdominis (central column)
  { id: 'muscle-rectus-abdominis', label: 'Rectus Abdominis',
    type: 'rect',    layer: 'superficial', color: '#10b981',
    x: 158, y: 190, w: 24, h: 92 },
  // External oblique (lateral)
  { id: 'muscle-external-oblique', label: 'External Oblique (L)',
    type: 'polygon', layer: 'superficial', color: '#10b981',
    points: '128,210 158,200 158,280 140,295 122,270 116,240' },
  { id: 'muscle-external-oblique', label: 'External Oblique (R)',
    type: 'polygon', layer: 'superficial', color: '#10b981',
    points: '212,210 182,200 182,280 200,295 218,270 224,240' },

  // ── UPPER ARM ────────────────────────────────────────────
  // Biceps brachii
  { id: 'muscle-biceps-brachii', label: 'Biceps Brachii (L)',
    type: 'ellipse', layer: 'superficial', color: '#6366f1', cx: 106, cy: 222, rx: 13, ry: 38 },
  { id: 'muscle-biceps-brachii', label: 'Biceps Brachii (R)',
    type: 'ellipse', layer: 'superficial', color: '#6366f1', cx: 234, cy: 222, rx: 13, ry: 38 },
  // Triceps (partially visible anteriorly — medial edge)
  { id: 'muscle-triceps-brachii', label: 'Triceps Brachii (L)',
    type: 'ellipse', layer: 'superficial', color: '#6366f1', cx: 96,  cy: 228, rx: 9,  ry: 35 },
  { id: 'muscle-triceps-brachii', label: 'Triceps Brachii (R)',
    type: 'ellipse', layer: 'superficial', color: '#6366f1', cx: 244, cy: 228, rx: 9,  ry: 35 },

  // ── FOREARM ──────────────────────────────────────────────
  { id: 'muscle-pronator-teres',        label: 'Pronator Teres (L)',  type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 94,  cy: 278, rx: 9,  ry: 12 },
  { id: 'muscle-pronator-teres',        label: 'Pronator Teres (R)',  type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 246, cy: 278, rx: 9,  ry: 12 },
  { id: 'muscle-flexor-carpi-radialis', label: 'Flexor Carpi Rad. (L)', type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 89,  cy: 305, rx: 7,  ry: 22 },
  { id: 'muscle-flexor-carpi-radialis', label: 'Flexor Carpi Rad. (R)', type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 251, cy: 305, rx: 7,  ry: 22 },
  { id: 'muscle-flexor-carpi-ulnaris',  label: 'Flexor Carpi Uln. (L)', type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 80,  cy: 305, rx: 7,  ry: 22 },
  { id: 'muscle-flexor-carpi-ulnaris',  label: 'Flexor Carpi Uln. (R)', type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 260, cy: 305, rx: 7,  ry: 22 },
  { id: 'muscle-extensor-digitorum',    label: 'Extensor Digitorum (L)', type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 86,  cy: 318, rx: 10, ry: 20 },
  { id: 'muscle-extensor-digitorum',    label: 'Extensor Digitorum (R)', type: 'ellipse', layer: 'superficial', color: '#3b82f6', cx: 254, cy: 318, rx: 10, ry: 20 },

  // ── PELVIS / HIP ─────────────────────────────────────────
  { id: 'muscle-gluteus-maximus', label: 'Gluteus Maximus (L)',
    type: 'ellipse', layer: 'superficial', color: '#f97316', cx: 146, cy: 330, rx: 22, ry: 16 },
  { id: 'muscle-gluteus-maximus', label: 'Gluteus Maximus (R)',
    type: 'ellipse', layer: 'superficial', color: '#f97316', cx: 194, cy: 330, rx: 22, ry: 16 },
  { id: 'muscle-tfl', label: 'Tensor Fasciae Latae (L)',
    type: 'ellipse', layer: 'superficial', color: '#f97316', cx: 128, cy: 338, rx: 10, ry: 18 },
  { id: 'muscle-tfl', label: 'Tensor Fasciae Latae (R)',
    type: 'ellipse', layer: 'superficial', color: '#f97316', cx: 212, cy: 338, rx: 10, ry: 18 },

  // ── THIGH ────────────────────────────────────────────────
  // Rectus femoris (central thigh)
  { id: 'muscle-rectus-femoris', label: 'Rectus Femoris (L)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 148, cy: 394, rx: 12, ry: 38 },
  { id: 'muscle-rectus-femoris', label: 'Rectus Femoris (R)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 192, cy: 394, rx: 12, ry: 38 },
  // Vastus lateralis
  { id: 'muscle-vastus-lateralis', label: 'Vastus Lateralis (L)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 132, cy: 400, rx: 12, ry: 34 },
  { id: 'muscle-vastus-lateralis', label: 'Vastus Lateralis (R)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 208, cy: 400, rx: 12, ry: 34 },
  // Vastus medialis
  { id: 'muscle-vastus-medialis', label: 'Vastus Medialis (L)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 158, cy: 424, rx: 10, ry: 20 },
  { id: 'muscle-vastus-medialis', label: 'Vastus Medialis (R)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 182, cy: 424, rx: 10, ry: 20 },
  // Sartorius (diagonal stripe)
  { id: 'muscle-sartorius', label: 'Sartorius (L)',
    type: 'polygon', layer: 'superficial', color: '#84cc16',
    points: '128,358 136,362 154,430 148,435 130,370' },
  { id: 'muscle-sartorius', label: 'Sartorius (R)',
    type: 'polygon', layer: 'superficial', color: '#84cc16',
    points: '212,358 204,362 186,430 192,435 210,370' },
  // Adductor longus
  { id: 'muscle-adductor-longus', label: 'Adductor Longus (L)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 158, cy: 376, rx: 10, ry: 28 },
  { id: 'muscle-adductor-longus', label: 'Adductor Longus (R)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 182, cy: 376, rx: 10, ry: 28 },
  // Gracilis (medial narrow strap)
  { id: 'muscle-gracilis', label: 'Gracilis (L)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 155, cy: 400, rx: 5, ry: 36 },
  { id: 'muscle-gracilis', label: 'Gracilis (R)',
    type: 'ellipse', layer: 'superficial', color: '#84cc16', cx: 185, cy: 400, rx: 5, ry: 36 },

  // ── LEG ──────────────────────────────────────────────────
  // Gastrocnemius (posterior calf — partially visible as medial bulk)
  { id: 'muscle-gastrocnemius', label: 'Gastrocnemius (L)',
    type: 'ellipse', layer: 'superficial', color: '#14b8a6', cx: 145, cy: 492, rx: 13, ry: 30 },
  { id: 'muscle-gastrocnemius', label: 'Gastrocnemius (R)',
    type: 'ellipse', layer: 'superficial', color: '#14b8a6', cx: 195, cy: 492, rx: 13, ry: 30 },
  // Tibialis anterior (lateral shin)
  { id: 'muscle-tibialis-anterior', label: 'Tibialis Anterior (L)',
    type: 'ellipse', layer: 'superficial', color: '#14b8a6', cx: 138, cy: 482, rx: 9, ry: 28 },
  { id: 'muscle-tibialis-anterior', label: 'Tibialis Anterior (R)',
    type: 'ellipse', layer: 'superficial', color: '#14b8a6', cx: 202, cy: 482, rx: 9, ry: 28 },
  // Fibularis longus
  { id: 'muscle-fibularis-longus', label: 'Fibularis Longus (L)',
    type: 'ellipse', layer: 'superficial', color: '#14b8a6', cx: 130, cy: 482, rx: 6, ry: 24 },
  { id: 'muscle-fibularis-longus', label: 'Fibularis Longus (R)',
    type: 'ellipse', layer: 'superficial', color: '#14b8a6', cx: 210, cy: 482, rx: 6, ry: 24 },
];
