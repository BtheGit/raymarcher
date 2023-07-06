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

  subtract(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
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

  rotate(degrees: number) {
    const rads = toRadians(degrees);
    const cosTheta = Math.cos(rads);
    const sinTheta = Math.sin(rads);
    const newX = this.x * cosTheta - this.y * sinTheta;
    const newY = this.x * sinTheta + this.y * cosTheta;

    this.x = newX;
    this.y = newY;
  }
}

export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export const toDegrees = (radians) => (radians * 180) / Math.PI;

export const directionVectorFromRotation = (rotation: number) =>
  new Vector(Math.cos(toRadians(rotation)), Math.sin(toRadians(rotation)));

export const planeVectorFromRotation = (rotation: number) =>
  new Vector(-Math.sin(toRadians(rotation)), Math.cos(toRadians(rotation)));

export const apparentDirectionVector = (
  objectPosition: Vector,
  objectDirection: Vector,
  cameraPosition: Vector
): Vector => {
  const angle = apparentDirectionAngle(
    objectPosition,
    objectDirection,
    cameraPosition
  );

  // Calculate the rotated direction vector based on the angle
  const rotatedDirection = new Vector(Math.cos(angle), Math.sin(angle));

  return rotatedDirection;
};

export const apparentDirectionAngle = (
  objectPosition: Vector,
  objectDirection: Vector,
  cameraPosition: Vector
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
