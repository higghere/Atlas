export interface StructureMetadata {
  id: string;
  name: string;
  system: string;
  type: string;
  description: string;
  bloodSupply: string[];
  innervation: string[];
  parent?: string;
  children?: string[];
}

export interface AnatomicalSystemConfig {
  id: string;
  displayName: string;
  svgPath: string;
  visibility: boolean;
  opacity: number;
  selectable: boolean;
  layerPriority: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}
