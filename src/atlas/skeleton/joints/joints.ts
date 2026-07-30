import { IComponent } from '../../../engine/ecs/Registry';

export interface JointRangeOfMotion {
  flexionExtension?: [number, number]; // in degrees [min, max]
  rotation?: [number, number];
  abductionAdduction?: [number, number];
}

export class JointComponent implements IComponent {
  public readonly type = 'JointComponent';
  public id: string;
  public displayName: string;
  public connectedBones: [string, string];
  public jointType: 'ball-and-socket' | 'hinge' | 'pivot' | 'condyloid' | 'saddle' | 'gliding';
  public degreesOfFreedom: number;
  public rangeOfMotion: JointRangeOfMotion;

  constructor(
    id: string,
    displayName: string,
    connectedBones: [string, string],
    jointType: 'ball-and-socket' | 'hinge' | 'pivot' | 'condyloid' | 'saddle' | 'gliding',
    degreesOfFreedom: number,
    rangeOfMotion: JointRangeOfMotion
  ) {
    this.id = id;
    this.displayName = displayName;
    this.connectedBones = connectedBones;
    this.jointType = jointType;
    this.degreesOfFreedom = degreesOfFreedom;
    this.rangeOfMotion = rangeOfMotion;
  }
}

export const majorJointsList: JointComponent[] = [
  new JointComponent(
    'joint-shoulder-left',
    'Left Shoulder Joint (Glenohumeral)',
    ['bone-scapula', 'bone-humerus'],
    'ball-and-socket',
    3,
    { flexionExtension: [-50, 180], rotation: [-90, 90], abductionAdduction: [-50, 180] }
  ),
  new JointComponent(
    'joint-shoulder-right',
    'Right Shoulder Joint (Glenohumeral)',
    ['bone-scapula', 'bone-humerus'],
    'ball-and-socket',
    3,
    { flexionExtension: [-50, 180], rotation: [-90, 90], abductionAdduction: [-50, 180] }
  ),
  new JointComponent(
    'joint-elbow-left',
    'Left Elbow Joint (Humeroulnar/Humeroradial)',
    ['bone-humerus', 'bone-ulna'],
    'hinge',
    1,
    { flexionExtension: [0, 150] }
  ),
  new JointComponent(
    'joint-elbow-right',
    'Right Elbow Joint (Humeroulnar/Humeroradial)',
    ['bone-humerus', 'bone-ulna'],
    'hinge',
    1,
    { flexionExtension: [0, 150] }
  ),
  new JointComponent(
    'joint-radioulnar-left',
    'Left Radioulnar Joint',
    ['bone-radius', 'bone-ulna'],
    'pivot',
    1,
    { rotation: [-90, 90] }
  ),
  new JointComponent(
    'joint-radioulnar-right',
    'Right Radioulnar Joint',
    ['bone-radius', 'bone-ulna'],
    'pivot',
    1,
    { rotation: [-90, 90] }
  ),
  new JointComponent(
    'joint-radiocarpal-left',
    'Left Radiocarpal Joint (Wrist)',
    ['bone-radius', 'bone-carpals'],
    'condyloid',
    2,
    { flexionExtension: [-70, 80], abductionAdduction: [-20, 30] }
  ),
  new JointComponent(
    'joint-radiocarpal-right',
    'Right Radiocarpal Joint (Wrist)',
    ['bone-radius', 'bone-carpals'],
    'condyloid',
    2,
    { flexionExtension: [-70, 80], abductionAdduction: [-20, 30] }
  ),
  new JointComponent(
    'joint-hip-left',
    'Left Hip Joint (Acetabulofemoral)',
    ['bone-ilium', 'bone-femur'],
    'ball-and-socket',
    3,
    { flexionExtension: [-30, 120], rotation: [-45, 45], abductionAdduction: [-30, 45] }
  ),
  new JointComponent(
    'joint-hip-right',
    'Right Hip Joint (Acetabulofemoral)',
    ['bone-ilium', 'bone-femur'],
    'ball-and-socket',
    3,
    { flexionExtension: [-30, 120], rotation: [-45, 45], abductionAdduction: [-30, 45] }
  ),
  new JointComponent(
    'joint-knee-left',
    'Left Knee Joint (Tibiofemoral)',
    ['bone-femur', 'bone-tibia'],
    'hinge',
    1,
    { flexionExtension: [0, 140] }
  ),
  new JointComponent(
    'joint-knee-right',
    'Right Knee Joint (Tibiofemoral)',
    ['bone-femur', 'bone-tibia'],
    'hinge',
    1,
    { flexionExtension: [0, 140] }
  ),
  new JointComponent(
    'joint-ankle-left',
    'Left Ankle Joint (Talocrural)',
    ['bone-tibia', 'bone-tarsals'],
    'hinge',
    1,
    { flexionExtension: [-50, 20] }
  ),
  new JointComponent(
    'joint-ankle-right',
    'Right Ankle Joint (Talocrural)',
    ['bone-tibia', 'bone-tarsals'],
    'hinge',
    1,
    { flexionExtension: [-50, 20] }
  ),
  new JointComponent(
    'joint-sacroiliac',
    'Sacroiliac Joint',
    ['bone-sacrum', 'bone-ilium'],
    'gliding',
    0,
    {}
  ),
  new JointComponent(
    'joint-tmj',
    'Temporomandibular Joint (TMJ)',
    ['bone-temporal', 'bone-mandible'],
    'condyloid',
    2,
    { flexionExtension: [0, 30], rotation: [-10, 10] }
  )
];
