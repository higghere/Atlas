import { IComponent, Entity } from './Registry';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class BoneComponent implements IComponent {
  public readonly type = 'BoneComponent';
  public id: Entity;
  public displayName: string;
  public latinName: string;
  public bodyRegion: 'head' | 'neck' | 'thorax' | 'abdomen' | 'pelvis' | 'arms' | 'legs';
  public parentBone: Entity | null;
  public children: Entity[];
  public landmarks: string[];
  public boundingBox: BoundingBox;
  public pivot: { x: number; y: number };
  public rotation: number;
  public defaultVisibility: boolean;

  constructor(
    id: Entity,
    displayName: string,
    latinName: string,
    bodyRegion: 'head' | 'neck' | 'thorax' | 'abdomen' | 'pelvis' | 'arms' | 'legs',
    parentBone: Entity | null,
    children: Entity[],
    landmarks: string[],
    boundingBox: BoundingBox,
    pivot: { x: number; y: number },
    rotation: number,
    defaultVisibility: boolean = true
  ) {
    this.id = id;
    this.displayName = displayName;
    this.latinName = latinName;
    this.bodyRegion = bodyRegion;
    this.parentBone = parentBone;
    this.children = children;
    this.landmarks = landmarks;
    this.boundingBox = boundingBox;
    this.pivot = pivot;
    this.rotation = rotation;
    this.defaultVisibility = defaultVisibility;
  }
}

export class LandmarkComponent implements IComponent {
  public readonly type = 'LandmarkComponent';
  public id: string;
  public displayName: string;
  public localPosition: { x: number; y: number };

  constructor(
    id: string,
    displayName: string,
    localPosition: { x: number; y: number }
  ) {
    this.id = id;
    this.displayName = displayName;
    this.localPosition = localPosition;
  }
}
