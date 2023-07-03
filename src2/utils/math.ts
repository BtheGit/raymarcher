export class Vector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  equals(vector) {
    return this.x === vector.x && this.y === vector.y;
  }

  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  cross(vector) {}

  dot(vector) {}

  map(callback) {
    return new Vector(callback(this.x), callback(this.y));
  }
}

export const toDegrees = (radians) => radians / (Math.PI / 180);
