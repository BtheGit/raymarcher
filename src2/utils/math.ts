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

  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  magnitudeProduct(vector) {
    return (
      Math.sqrt(this.x ** 2 + this.y ** 2) *
      Math.sqrt(vector.x ** 2 + vector.y ** 2)
    );
  }

  map(callback) {
    return new Vector(callback(this.x), callback(this.y));
  }

  angle(vector) {
    const dot = this.dot(vector);
    const magnitudeProduct = this.magnitudeProduct(vector);
    return Math.acos(dot / magnitudeProduct);
  }
}

export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export const toDegrees = (radians) => radians / (Math.PI / 180);

export const directionVectorFromRotation = (rotation: number) =>
  new Vector(Math.cos(toRadians(rotation)), Math.sin(toRadians(rotation)));

export const planeVectorFromRotation = (rotation: number) =>
  new Vector(-Math.sin(toRadians(rotation)), Math.cos(toRadians(rotation)));
