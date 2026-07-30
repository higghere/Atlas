import { MuscleGroup, FascialLayer } from '../entities/MuscleComponent';

// ─────────────────────────────────────────────────────────────
// Fascial Layer Ordering (superficial → deep → periosteum → bone)
// Layers mount/unmount rather than fade
// ─────────────────────────────────────────────────────────────
export const FASCIAL_LAYER_ORDER: FascialLayer[] = [
  'superficial',
  'intermediate',
  'deep',
  'intrinsic',
];

export const FASCIAL_LAYER_META: Record<FascialLayer, { label: string; emoji: string; color: string; description: string }> = {
  superficial:   { label: 'Superficial Muscles', emoji: '💪', color: '#f97316', description: 'Outermost muscle layer — visible through skin' },
  intermediate:  { label: 'Intermediate Muscles', emoji: '🫀', color: '#ec4899', description: 'Layer beneath superficial — accessed by removing top layer' },
  deep:          { label: 'Deep Muscles',          emoji: '🔴', color: '#8b5cf6', description: 'Deepest layer adjacent to bone — stabilizers and rotators' },
  intrinsic:     { label: 'Intrinsic Muscles',     emoji: '🦴', color: '#22d3ee', description: 'Small muscles within a body segment (hand, foot)' },
};

// ─────────────────────────────────────────────────────────────
// Muscle Group Metadata
// ─────────────────────────────────────────────────────────────
export const MUSCLE_GROUP_META: Record<MuscleGroup, { label: string; emoji: string; region: 'axial' | 'appendicular' }> = {
  'head-face':  { label: 'Head & Face',    emoji: '🧠', region: 'axial' },
  'neck':       { label: 'Neck',           emoji: '👤', region: 'axial' },
  'shoulder':   { label: 'Shoulder',       emoji: '🏋️', region: 'appendicular' },
  'thorax':     { label: 'Thorax',         emoji: '🫁', region: 'axial' },
  'back':       { label: 'Back',           emoji: '🔙', region: 'axial' },
  'abdomen':    { label: 'Abdomen',        emoji: '🎯', region: 'axial' },
  'pelvis':     { label: 'Pelvis & Hip',   emoji: '⬡', region: 'axial' },
  'upper-arm':  { label: 'Upper Arm',      emoji: '💪', region: 'appendicular' },
  'forearm':    { label: 'Forearm',        emoji: '🦾', region: 'appendicular' },
  'hand':       { label: 'Hand',           emoji: '🖐️', region: 'appendicular' },
  'hip':        { label: 'Hip',            emoji: '🦵', region: 'appendicular' },
  'thigh':      { label: 'Thigh',          emoji: '🦵', region: 'appendicular' },
  'leg':        { label: 'Leg',            emoji: '🦶', region: 'appendicular' },
  'foot':       { label: 'Foot',           emoji: '👣', region: 'appendicular' },
};

// ─────────────────────────────────────────────────────────────
// Axial vs Appendicular Classification
// ─────────────────────────────────────────────────────────────
export const AXIAL_GROUPS: MuscleGroup[] = ['head-face', 'neck', 'thorax', 'back', 'abdomen', 'pelvis'];
export const APPENDICULAR_GROUPS: MuscleGroup[] = ['shoulder', 'upper-arm', 'forearm', 'hand', 'hip', 'thigh', 'leg', 'foot'];
export const UPPER_LIMB_GROUPS: MuscleGroup[] = ['shoulder', 'upper-arm', 'forearm', 'hand'];
export const LOWER_LIMB_GROUPS: MuscleGroup[] = ['hip', 'thigh', 'leg', 'foot'];
