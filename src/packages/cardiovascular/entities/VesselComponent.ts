import { IComponent } from '../../../engine/ecs/Registry';

export type VesselType = 'artery' | 'vein' | 'heart_chamber';

export type VascularRegion =
  | 'heart'
  | 'coronary'
  | 'pulmonary'
  | 'head'
  | 'neck'
  | 'thorax'
  | 'abdomen'
  | 'pelvis'
  | 'upper_limb'
  | 'lower_limb';

export type LODLevel = 0 | 1 | 2 | 3 | 4;

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface OrganVascularConnection {
  organId: string;
  organName: string;
  arterialSupply: string[];
  venousDrainage: string[];
}

export class VesselComponent implements IComponent {
  public readonly type = 'VesselComponent';

  public id: string;
  public displayName: string;
  public latinName: string;
  public vesselType: VesselType;
  public region: VascularRegion;
  public lodLevel: LODLevel;

  public parent: string | null;
  public children: string[];
  public flowIn: string[];
  public flowOut: string[];
  public connectedOrgans: string[];

  public startLandmark: string;
  public endLandmark: string;
  public svgPath: string;
  public diameter: number; // in mm
  public depth: number; // 0 (superficial) to 1 (deep)
  public strokeColor: string;

  public clinicalImportance: string;
  public commonDiseases: string[];

  constructor(data: {
    id: string;
    displayName: string;
    latinName: string;
    vesselType: VesselType;
    region: VascularRegion;
    lodLevel?: LODLevel;
    parent?: string | null;
    children?: string[];
    flowIn?: string[];
    flowOut?: string[];
    connectedOrgans?: string[];
    startLandmark: string;
    endLandmark: string;
    svgPath: string;
    diameter: number;
    depth?: number;
    strokeColor?: string;
    clinicalImportance?: string;
    commonDiseases?: string[];
  }) {
    this.id = data.id;
    this.displayName = data.displayName;
    this.latinName = data.latinName;
    this.vesselType = data.vesselType;
    this.region = data.region;
    this.lodLevel = data.lodLevel ?? 1;

    this.parent = data.parent ?? null;
    this.children = data.children ?? [];
    this.flowIn = data.flowIn ?? [];
    this.flowOut = data.flowOut ?? [];
    this.connectedOrgans = data.connectedOrgans ?? [];

    this.startLandmark = data.startLandmark;
    this.endLandmark = data.endLandmark;
    this.svgPath = data.svgPath;
    this.diameter = data.diameter;
    this.depth = data.depth ?? 0.5;
    this.strokeColor = data.strokeColor ?? (data.vesselType === 'artery' ? '#e11d48' : '#2563eb');

    this.clinicalImportance = data.clinicalImportance ?? 'Essential vascular conduit';
    this.commonDiseases = data.commonDiseases ?? ['Atherosclerosis', 'Thrombosis', 'Aneurysm'];
  }
}
