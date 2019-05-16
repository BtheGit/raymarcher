class Player {
  constructor(map, pos = new Vector(22, 12), dir = new Vector(-1, 0), plane = new Vector(0, 0.66)){
    this.map = map;
    this.pos = pos;
    this.dir = dir;
    this.plane = plane;
    this.walkSpeed = .1;
    this.rotationSpeed = .1;
    this.rays = [];
    this.cast();
  }

  cast(){
    const rays = [];
    // TODO: Create a raycaster class that Player calls. In the event we want to use the raycasting for non-player entities.
    // ----------------
    // The idea here is to use ray marching to save intersection computations (in a small world this is more expensive than just calculating
    // intersections with all objects, but in a massive world it's much cheaper (stable time in fact with a given limititation on drawdistance)).
    // This is made possible because the walls are only drawn on grid vertices, which are at regular, predictable intervals.
    // However, the player himself (and sprites later) will be at any valid vector (ie, not in a cell marked as a wall).
    // So, before we start marching our rays up the gridlines, we first need to calculate the player's dx and dy relative to the closest grid 
    // line in the player dir.
    for(let i = 0; i < screenWidth; i++){
      const cameraX = 2 * i / screenWidth - 1;
      const rayDir = this.plane.scale(cameraX).add(this.dir);
      const activeCell = this.pos.map(Math.floor);
      
      // The distance from the nearest cell walls
      const distanceDelta = rayDir.map((scalar) => Math.abs(1 / scalar));
      // Which way we're going.
      const stepX = rayDir.x < 0 ? -1 : 1;
      const stepY = rayDir.y < 0 ? -1 : 1;
      
      let sideDistX = (rayDir.x < 0 ? this.pos.x - activeCell.x : 1 + activeCell.x - this.pos.x) * distanceDelta.x;
      let sideDistY = (rayDir.y < 0 ? this.pos.y - activeCell.y : 1 + activeCell.y - this.pos.y) * distanceDelta.y;
      
      // This assumes infinite draw distance and that all spaces will be fully enclosed
      // TODO: Get rid of that assumption.
      let wall = null;
      let wallOrientation;
      while(!wall){
        if(sideDistX < sideDistY){
          sideDistX += distanceDelta.x;
          activeCell.x += stepX;
          wallOrientation = 0; // Vertical Wall
        }
        else {
          sideDistY += distanceDelta.y;
          activeCell.y += stepY;
          wallOrientation = 1; // Horizontal Wall
        }
        // TODO: Walls will be complex objects later to allow for complex textures
        // and interactions.
        const currentCell = this.map.grid[activeCell.x][activeCell.y];
        if(currentCell){
          wall = currentCell;
        }
      }
      
      const normalizedDistance = wallOrientation === 0
        ? (activeCell.x - this.pos.x + (1 - stepX) / 2) / rayDir.x
        : (activeCell.y - this.pos.y + (1 - stepY) / 2) / rayDir.y
      
      // Exact intersection point with wall
      const wallIntersection = wallOrientation === 0
        ? this.pos.y + normalizedDistance * rayDir.y
        : this.pos.x + normalizedDistance * rayDir.x;
              
      const ray = {
        normalizedDistance,
        wall,
        wallOrientation,
        wallIntersection,
        rayDir,
      }
      rays.push(ray);
    }
    this.rays = rays;
  }

  moveForward(){
    // For now, the rule will simply be that players can only move through empty cells.
    // In the future when cells become complex objects, we will need a traversable rule.
    // (Things like sprites that are traversable)

    const newPosX = this.pos.x + this.dir.x * this.walkSpeed;
    const newPosY = this.pos.y + this.dir.y * this.walkSpeed;
    const cellX = Math.floor(newPosX);
    const cellY = Math.floor(newPosY);
    
    // We split up moving along the axes to avoid getting stuck on walls
    const nextCellX = this.map.grid[cellX][Math.floor(this.pos.y)];
    if(nextCellX === 0){
      this.pos.x = newPosX;
    }
    const nextCellY = this.map.grid[Math.floor(this.pos.x)][cellY];
    if(nextCellY === 0){
      this.pos.y = newPosY;
    }

  }

  moveBack(){

    const newPosX = this.pos.x - this.dir.x * this.walkSpeed;
    const newPosY = this.pos.y - this.dir.y * this.walkSpeed;
    const cellX = Math.floor(newPosX);
    const cellY = Math.floor(newPosY);

    // We split up moving along the axes to avoid getting stuck on walls
    const nextCellX = this.map.grid[cellX][Math.floor(this.pos.y)];
    if(nextCellX === 0){
      this.pos.x = newPosX;
    }
    const nextCellY = this.map.grid[Math.floor(this.pos.x)][cellY];
    if(nextCellY === 0){
      this.pos.y = newPosY;
    }
  }

  rotate(rotation){
    const newDirX = this.dir.x * Math.cos(this.rotationSpeed * rotation) - this.dir.y * Math.sin(this.rotationSpeed * rotation);
    const newDirY = this.dir.x * Math.sin(this.rotationSpeed * rotation) + this.dir.y * Math.cos(this.rotationSpeed * rotation);
    const newPlaneX = this.plane.x * Math.cos(this.rotationSpeed * rotation) - this.plane.y * Math.sin(this.rotationSpeed * rotation);
    const newPlaneY = this.plane.x * Math.sin(this.rotationSpeed * rotation) + this.plane.y * Math.cos(this.rotationSpeed * rotation);
    this.dir = new Vector(newDirX, newDirY);
    this.plane = new Vector(newPlaneX, newPlaneY);
  }
}