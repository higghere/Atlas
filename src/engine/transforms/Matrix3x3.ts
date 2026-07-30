export class Matrix3x3 {
  // Elements: [a, c, tx, b, d, ty, 0, 0, 1] representing the standard 2D transform matrix
  public elements: Float32Array;

  constructor(elements?: Float32Array) {
    this.elements = elements || new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
  }

  public static identity(): Matrix3x3 {
    return new Matrix3x3();
  }

  public static translation(x: number, y: number): Matrix3x3 {
    return new Matrix3x3(new Float32Array([
      1, 0, x,
      0, 1, y,
      0, 0, 1
    ]));
  }

  public static rotation(angleInDegrees: number): Matrix3x3 {
    const radians = (angleInDegrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return new Matrix3x3(new Float32Array([
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1
    ]));
  }

  public static scaling(x: number, y: number): Matrix3x3 {
    return new Matrix3x3(new Float32Array([
      x, 0, 0,
      0, y, 0,
      0, 0, 1
    ]));
  }

  public multiply(other: Matrix3x3): Matrix3x3 {
    const ae = this.elements;
    const be = other.elements;

    const a00 = ae[0], a01 = ae[1], a02 = ae[2];
    const a10 = ae[3], a11 = ae[4], a12 = ae[5];
    const a20 = ae[6], a21 = ae[7], a22 = ae[8];

    const b00 = be[0], b01 = be[1], b02 = be[2];
    const b10 = be[3], b11 = be[4], b12 = be[5];
    const b20 = be[6], b21 = be[7], b22 = be[8];

    const out = new Float32Array(9);

    out[0] = a00 * b00 + a01 * b10 + a02 * b20;
    out[1] = a00 * b01 + a01 * b11 + a02 * b21;
    out[2] = a00 * b02 + a01 * b12 + a02 * b22;

    out[3] = a10 * b00 + a11 * b10 + a12 * b20;
    out[4] = a10 * b01 + a11 * b11 + a12 * b21;
    out[5] = a10 * b02 + a11 * b12 + a12 * b22;

    out[6] = a20 * b00 + a21 * b10 + a22 * b20;
    out[7] = a20 * b01 + a21 * b11 + a22 * b21;
    out[8] = a20 * b02 + a21 * b12 + a22 * b22;

    return new Matrix3x3(out);
  }

  // Projects a 2D coordinate through the transform matrix
  public transformPoint(x: number, y: number): { x: number; y: number } {
    const e = this.elements;
    const px = e[0] * x + e[1] * y + e[2];
    const py = e[3] * x + e[4] * y + e[5];
    return { x: px, y: py };
  }

  // Returns the CSS transform representation string "matrix(a, b, c, d, tx, ty)"
  public toCSSTransform(): string {
    const e = this.elements;
    return `matrix(${e[0]}, ${e[3]}, ${e[1]}, ${e[4]}, ${e[2]}, ${e[5]})`;
  }
}
