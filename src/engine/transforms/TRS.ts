import { Matrix3x3 } from './Matrix3x3';
import { IComponent } from '../ecs/Registry';

export class TRS {
  public position: { x: number; y: number };
  public rotation: number; // degrees
  public scale: { x: number; y: number };
  public pivot: { x: number; y: number };

  constructor(
    pos = { x: 0, y: 0 },
    rot = 0,
    scale = { x: 1, y: 1 },
    pivot = { x: 0, y: 0 }
  ) {
    this.position = pos;
    this.rotation = rot;
    this.scale = scale;
    this.pivot = pivot;
  }

  public getLocalMatrix(): Matrix3x3 {
    const t = Matrix3x3.translation(this.position.x, this.position.y);
    const tp = Matrix3x3.translation(this.pivot.x, this.pivot.y);
    const r = Matrix3x3.rotation(this.rotation);
    const s = Matrix3x3.scaling(this.scale.x, this.scale.y);
    const tpi = Matrix3x3.translation(-this.pivot.x, -this.pivot.y);

    // Order: Translation * PivotTranslation * Rotation * Scale * InvPivotTranslation
    return t.multiply(tp).multiply(r).multiply(s).multiply(tpi);
  }
}

export class TransformComponent implements IComponent {
  public readonly type = 'TransformComponent';
  public parentId: string | null = null;
  public trs: TRS;
  public worldMatrix: Matrix3x3 = Matrix3x3.identity();

  constructor(trs?: TRS, parentId: string | null = null) {
    this.trs = trs || new TRS();
    this.parentId = parentId;
  }
}
