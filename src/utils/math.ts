export class Vector2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static normalize(vector: Vector2) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) {
      return new Vector2(0, 0);
    }
    return new Vector2(vector.x / magnitude, vector.y / magnitude);
  }

  static magnitude(vector): number {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
  }

  static lerp(
    start: Vector2 | { x: number; y: number },
    target: Vector2 | { x: number; y: number },
    t: number
  ): Vector2 {
    const newX = start.x + t * (target.x - start.x);
    const newY = start.y + t * (target.y - start.y);
    return new Vector2(newX, newY);
  }

  static distance = (vector1, vector2) => {
    const dx = vector1.x - vector2.x;
    const dy = vector1.y - vector2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  normalize() {
    return Vector2.normalize(this);
  }

  equals(vector) {
    return this.x === vector.x && this.y === vector.y;
  }

  add(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  scale(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  cross(vector) {}

  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  magnitudeProduct(vector) {
    return Vector2.magnitude(this) * Vector2.magnitude(vector);
  }

  map(callback) {
    return new Vector2(callback(this.x), callback(this.y));
  }

  length = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  distanceTo = (vector) => {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  angle(vector) {
    const dot = this.dot(vector);
    const magnitudeProduct = this.magnitudeProduct(vector);
    return Math.acos(dot / magnitudeProduct);
  }

  rotate(degrees: number) {
    const rads = toRadians(degrees);
    const cosTheta = Math.cos(rads);
    const sinTheta = Math.sin(rads);
    const newX = this.x * cosTheta - this.y * sinTheta;
    const newY = this.x * sinTheta + this.y * cosTheta;

    this.x = newX;
    this.y = newY;
  }

  clampMagnitude(min: number, max: number): Vector2 {
    const currentMagnitude = Vector2.magnitude(this);
    if (currentMagnitude < min) {
      return this.scale(min / currentMagnitude);
    } else if (currentMagnitude > max) {
      return this.scale(max / currentMagnitude);
    }
    return this;
  }
}

export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export const toDegrees = (radians) => (radians * 180) / Math.PI;

export const directionVectorFromRotation = (rotation: number) =>
  new Vector2(Math.cos(toRadians(rotation)), Math.sin(toRadians(rotation)));

export const planeVectorFromRotation = (rotation: number) =>
  new Vector2(-Math.sin(toRadians(rotation)), Math.cos(toRadians(rotation)));

export const apparentDirectionVector = (
  objectPosition: Vector2,
  objectDirection: Vector2,
  cameraPosition: Vector2
): Vector2 => {
  const angle = apparentDirectionAngle(
    objectPosition,
    objectDirection,
    cameraPosition
  );

  // Calculate the rotated direction vector based on the angle
  const rotatedDirection = new Vector2(Math.cos(angle), Math.sin(angle));

  return rotatedDirection;
};

export const apparentDirectionAngle = (
  objectPosition: Vector2,
  objectDirection: Vector2,
  cameraPosition: Vector2
) => {
  // Calculate the vector from the object to the camera
  const cameraToObject = objectPosition.subtract(cameraPosition);

  // Calculate the angle between the object's direction and the vector to the camera
  const angle =
    Math.atan2(cameraToObject.y, cameraToObject.x) -
    Math.atan2(objectDirection.y, objectDirection.x);

  // Normalize the angle to be within -180 to 180 range
  const normalizedAngle = (toDegrees(angle) + 360) % 360;

  // Convert the angle back to the -180 to 180 range
  const finalAngle =
    normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle;

  return finalAngle;
};

export const lerp = (a: number, b: number, t: number) => {
  return a + (b - a) * t;
};
