class Player {
  constructor(map, pos = new Vector(5.5, 4.5), dir = new Vector(0,0)){
    this.map = map;
    this.pos = pos;
    this.dir = dir;
    this.walkSpeed = 2;
    this.rotateSpeed = 10;
  }

  move({ x, y } = {}){
    if(x != null) {
      const newPosX = clamp(this.pos.x + (x * this.walkSpeed), 1, MAP_WIDTH - 1); // The 1 offset is to prevent being in a boundary wall
      this.pos.x = newPosX;
    }
    if(y != null) {
      const newPosY = clamp(this.pos.y + (y * this.walkSpeed), 1, MAP_HEIGHT - 1);
      this.pos.y = newPosY;
    }
  }

  rotate(rotation){
    // Clamp the angle between 0 and 360;
    let newDir = this.dir + (rotation * this.rotateSpeed);
    if (newDir >= 360) {
      newDir %= 360;
    }
    else if (newDir < 0) {
      newDir = 360 - (Math.abs(newDir) % 360);
    }
    this.dir = newDir;
  }
}