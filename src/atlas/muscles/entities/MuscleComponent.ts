import { IComponent } from '../../../engine/ecs/Registry';

// ─────────────────────────────────────────────────────────────
// Fascial Layer Enum
// ─────────────────────────────────────────────────────────────
export type FascialLayer =
  | 'superficial'
  | 'intermediate'
  | 'deep'
  | 'intrinsic';

// ─────────────────────────────────────────────────────────────
// Muscle Group Enum
// ─────────────────────────────────────────────────────────────
export type MuscleGroup =
  | 'head-face'
  | 'neck'
  | 'shoulder'
  | 'thorax'
  | 'back'
  | 'abdomen'
  | 'pelvis'
  | 'upper-arm'
  | 'forearm'
  | 'hand'
  | 'hip'
  | 'thigh'
  | 'leg'
  | 'foot';

// ─────────────────────────────────────────────────────────────
// Muscle Component (ECS)
// ─────────────────────────────────────────────────────────────
export class MuscleComponent implements IComponent {
  public readonly type = 'MuscleComponent';

  public id: string;
  public displayName: string;
  public latinName: string;
  public muscleGroup: MuscleGroup;
  public fascialLayer: FascialLayer;

  // Skeletal attachment — references Phase 1 bone entity IDs
  public originBones: string[];
  public insertionBones: string[];
  public originDescription: string;
  public insertionDescription: string;

  // Neurovascular
  public innervation: string;
  public bloodSupply: string;

  // Actions
  public primaryAction: string;
  public secondaryActions: string[];

  // Relationships — muscle entity IDs
  public synergists: string[];
  public antagonists: string[];
  public stabilizers: string[];

  // Clinical
  public clinicalNotes: string;
  public commonInjuries: string;

  // Anatomy
  public fiberDirection: string;
  public crossesJoints: string[];

  // ── Future hooks (reserved, never implemented here) ──────────
  // AnimationComponent, PhysiologyComponent, InjuryComponent,
  // BloodFlowComponent, NeuralComponent, FatigueComponent, EMGComponent
  // ─────────────────────────────────────────────────────────────

  constructor(data: {
    id: string;
    displayName: string;
    latinName: string;
    muscleGroup: MuscleGroup;
    fascialLayer: FascialLayer;
    originBones: string[];
    insertionBones: string[];
    originDescription: string;
    insertionDescription: string;
    innervation: string;
    bloodSupply: string;
    primaryAction: string;
    secondaryActions: string[];
    synergists: string[];
    antagonists: string[];
    stabilizers: string[];
    clinicalNotes: string;
    commonInjuries: string;
    fiberDirection: string;
    crossesJoints: string[];
  }) {
    this.id = data.id;
    this.displayName = data.displayName;
    this.latinName = data.latinName;
    this.muscleGroup = data.muscleGroup;
    this.fascialLayer = data.fascialLayer;
    this.originBones = data.originBones;
    this.insertionBones = data.insertionBones;
    this.originDescription = data.originDescription;
    this.insertionDescription = data.insertionDescription;
    this.innervation = data.innervation;
    this.bloodSupply = data.bloodSupply;
    this.primaryAction = data.primaryAction;
    this.secondaryActions = data.secondaryActions;
    this.synergists = data.synergists;
    this.antagonists = data.antagonists;
    this.stabilizers = data.stabilizers;
    this.clinicalNotes = data.clinicalNotes;
    this.commonInjuries = data.commonInjuries;
    this.fiberDirection = data.fiberDirection;
    this.crossesJoints = data.crossesJoints;
  }
}
