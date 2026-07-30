export type VesselType = 'artery' | 'vein' | 'heart_chamber' | 'heart_vessel' | 'lymphatic';
export type VascularRegion =
  | 'heart'
  | 'aorta'
  | 'coronary'
  | 'pulmonary'
  | 'head'
  | 'neck'
  | 'upper_limb'
  | 'thoracic'
  | 'abdominal'
  | 'pelvis'
  | 'lower_limb';

export type LODLevel = 0 | 1 | 2 | 3 | 4;

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface VesselNode {
  id: string;
  name: string;
  latinName: string;
  type: VesselType;

  // Bounding box for picking & validation
  boundingBox?: BoundingBox;

  // 1. Anatomical Hierarchy Tree (for rendering and visual grouping)
  renderParent: string | null;
  renderChildren: string[];

  // 2. Directed Circulatory Flow Graph (for blood flow & physiology simulation)
  flowIn: string[];   // Upstream incoming vessel/chamber IDs
  flowOut: string[];  // Downstream outgoing vessel/chamber IDs

  startLandmark: string;
  endLandmark: string;
  path: string;       // Precise SVG cubic Bezier curve matching reference blueprint
  width: number;      // Caliber / diameter in SVG units (Aorta ~18, Carotid ~10, Digital ~2)
  color: string;      // Color hex (Artery #e63946/#d43b3b, Vein #2a9d8f/#3a86ff, Heart #b71c1c)
  region: VascularRegion;
  lod: LODLevel;      // Level of detail (0=trunks, 4=micro/digital)

  supplies?: string[]; // Tissues/regions supplied (for arteries)
  drains?: string[];    // Tissues/regions drained (for veins)
  clinicalImportance: string;
  connectedOrgans: string[]; // IDs of organs connected (e.g. 'heart', 'brain', 'kidneys')
}

// Alias for strict component architecture specification
export type CardiovascularNode = VesselNode;

export interface OrganVascularConnection {
  organId: string;
  organName: string;
  arterialSupply: string[];
  venousDrainage: string[];
}
