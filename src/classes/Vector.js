class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
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

export default Vector;
