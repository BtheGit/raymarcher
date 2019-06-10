const checkIsFloor = cell => {
  if(typeof cell === 'number' && cell === 0) {
    return true;
  }
  if(cell.isFloor) {
    return true;
  }
  return false;
}

class Player {
  constructor(game, pos, dir, plane){
    this.game = game;
    this.grid = this.game.grid;
    this.pos = pos;
    this.dir = dir;
    this.plane = plane;
    this.elevation = 1;
    this.walkSpeed = .1;
    this.rotationSpeed = .07;
    this.elevationStep = .035;
    // This only seems to be needed to be calculated once, unless the FOV changes.
    this.inverseDeterminate = 1.0 / (this.plane.x * this.dir.y - this.dir.x * this.plane.y);

    this.rays = [];
    this.cast();
  }
  // TODO: add in an early return for maximum cast distance
  castRay(cameraX, castDistance = Infinity){
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
      const currentCell = this.grid.getCell(activeCell.x, activeCell.y);
      if(currentCell == null){
        break;
      }
      const isBasicWall = typeof currentCell === 'number' && currentCell > 0;
      const isComplexWall = typeof currentCell === 'object' && currentCell != null && currentCell.isWall;
      if(isBasicWall || isComplexWall){
        wall = currentCell;
      }
    }
    
    const normalizedDistance = wallOrientation === 0
      ? (activeCell.x - this.pos.x + (1 - stepX) / 2) / rayDir.x
      : (activeCell.y - this.pos.y + (1 - stepY) / 2) / rayDir.y
    
    // Exact intersection point with wall
    const intersection = wallOrientation === 0
      ? this.pos.y + normalizedDistance * rayDir.y
      : this.pos.x + normalizedDistance * rayDir.x;

    // This gives us the intersection relative to one wall unit.
    const wallIntersection = intersection - Math.floor(intersection);
    
    const ray = {
      normalizedDistance,
      wall,
      wallOrientation,
      wallIntersection,
      rayDir,
      activeCell,
    }

    return ray;
  }

  cast(){
    const rays = [];
    // TODO: Create a raycaster class that Player calls. In the event we want to use the raycasting for non-player entities.
    // TODO: Also so we can cast individual rays for things like shooting or triggering
    // ----------------
    // The idea here is to use ray marching to save intersection computations (in a small world this is more expensive than just calculating
    // intersections with all objects, but in a massive world it's much cheaper (stable time in fact with a given limititation on drawdistance)).
    // This is made possible because the walls are only drawn on grid vertices, which are at regular, predictable intervals.
    // However, the player himself (and sprites later) will be at any valid vector (ie, not in a cell marked as a wall).
    // So, before we start marching our rays up the gridlines, we first need to calculate the player's dx and dy relative to the closest grid 
    // line in the player dir.
    const screenWidth = this.game.screen.width;
    for(let i = 0; i < screenWidth; i++){
      const cameraX = 2 * i / screenWidth - 1;
      const ray = this.castRay(cameraX);
      rays.push(ray);
    }
    this.rays = rays;
  }

  checkSpritesForCollisions(x,y){
    const collisionDetected = this.game.sprites.some(sprite => {
      if(!sprite.isSolid){
        return false;
      }

      // TODO: We should move this calculating to a sprite method with just the player position passed.
      const spriteX = sprite.pos.x;
      const spriteY = sprite.pos.y;
      const spriteBoundingBox = sprite.boundingBox;
      // There will have to be a check for a bounding box, but for now we will assume there is and it is .2
      const distance = Math.sqrt(Math.pow(x - spriteX, 2) + Math.pow(y - spriteY, 2));
      const isColliding = (distance - spriteBoundingBox) < 0;
      return isColliding;
    });
    return collisionDetected;
  }

  moveForward(modifier = 1){
    // For now, the rule will simply be that players can only move through empty cells.
    // In the future when cells become complex objects, we will need a traversable rule.
    // (Things like sprites that are traversable)
    // In fact, because sprites are likely going to be cell agnostic, until a better system is implemented,
    // we'll likely have to iterate through all or most of them to check for collisions, regardless of their distance.
    // Perhaps we can at least sort and filter them (only sprites that are x distance away).
    // We likely won't use completely separate bounding boxes but instead draw a radius from the center of the sprite. 
    // So just checking if a sprite is within distancetosprite - spriteboundingboxradius is close to enough (there are of course
    // issues with various angles of approach.)

    // We need to check for collisions with sprite bounding boxes.
    // For now, we are going to do this in a very dumb way.
    // Per axis to allow sliding as above (though double the work!)
    // a) For x movement, calculate new position.
    // 1. Iterate through all sprites 
    // 2. For all sprites with isSolid: true, calculate distance to player. (non-normalized)
    // 3. Determine if the distance is less than the sprites bounding box
    // 4. If not, set new player pos.
    // 5. Repeat for y.
    
    const newPosX = this.pos.x + this.dir.x * (this.walkSpeed * modifier);
    const newPosY = this.pos.y + this.dir.y * (this.walkSpeed * modifier);
    const cellX = Math.floor(newPosX);
    const cellY = Math.floor(newPosY);
    
    // We split up moving along the axes to avoid getting stuck on walls
    const nextCellX = this.grid.getCell(cellX, Math.floor(this.pos.y));
    if(checkIsFloor(nextCellX)){
      const collisionDetected = this.checkSpritesForCollisions(newPosX, this.pos.y);
      if(!collisionDetected){
        this.pos.x = newPosX;
      }
    }
    const nextCellY = this.grid.getCell(Math.floor(this.pos.x), cellY);
    if(checkIsFloor(nextCellY)){
      const collisionDetected = this.checkSpritesForCollisions(this.pos.x, newPosY);
      if(!collisionDetected){
        this.pos.y = newPosY;
      }
    }
  }

  moveBack(){

    const newPosX = this.pos.x - this.dir.x * this.walkSpeed;
    const newPosY = this.pos.y - this.dir.y * this.walkSpeed;
    const cellX = Math.floor(newPosX);
    const cellY = Math.floor(newPosY);

    // We split up moving along the axes to avoid getting stuck on walls
    const nextCellX = this.grid.getCell(cellX, Math.floor(this.pos.y));
    if(checkIsFloor(nextCellX)){
      const collisionDetected = this.checkSpritesForCollisions(newPosX, this.pos.y);
      if(!collisionDetected){
        this.pos.x = newPosX;
      }
    }
    const nextCellY = this.grid.getCell(Math.floor(this.pos.x), cellY);
    if(checkIsFloor(nextCellY)){
      const collisionDetected = this.checkSpritesForCollisions(this.pos.x, newPosY);
      if(!collisionDetected){
        this.pos.y = newPosY;
      }
    }
  }

  rotate(rotation){
    // TODO: There's no reason these calls can't be lookup tables. The lookup tables can even be recalculated if the rotation
    // speed changes.
    const newDirX = this.dir.x * Math.cos(this.rotationSpeed * rotation) - this.dir.y * Math.sin(this.rotationSpeed * rotation);
    const newDirY = this.dir.x * Math.sin(this.rotationSpeed * rotation) + this.dir.y * Math.cos(this.rotationSpeed * rotation);
    const newPlaneX = this.plane.x * Math.cos(this.rotationSpeed * rotation) - this.plane.y * Math.sin(this.rotationSpeed * rotation);
    const newPlaneY = this.plane.x * Math.sin(this.rotationSpeed * rotation) + this.plane.y * Math.cos(this.rotationSpeed * rotation);
    this.dir = new Vector(newDirX, newDirY);
    this.plane = new Vector(newPlaneX, newPlaneY);
  }

  trigger(){
    const cameraX = 0; // Middle of the screen.w
    const ray = this.castRay(cameraX);
    const wallDistance = ray.normalizedDistance;
    // The following would be to abstract into a separate sprite manager service. In a more-perfect world.
    // Find closest sprite directly in front of player.
    // Call it's trigger function.
    // We'll need to sort for distance and check the zbuffer (just like with rendering and clipping) to get the closest sprite
    // that is not behind a wall.
    // Ideally we would check the strip of the sprite at the ceenter column and determine if all the pixels were transparent,
    // but this is certainly overkill for now.
    const sprites = this.game.sprites;
    if(sprites.length > 0){
      // Sort nearest to farthest, filtering any that are further away than the closest wall ($distance).
      const closestUnobstructedSpriteWithTrigger = sprites.reduce((acc, sprite) => {
        const spriteDistance = Math.pow(this.pos.x - sprite.pos.x, 2) + Math.pow(this.pos.y - sprite.pos.y, 2);
        if(spriteDistance < wallDistance) {
          const spriteX = sprite.pos.x;
          const spriteY = sprite.pos.y;
          const spriteX_relativeToPlayer = spriteX - this.pos.x;
          const spriteY_relativeToPlayer = spriteY - this.pos.y;
          
          const transformX = this.inverseDeterminate * (this.dir.y * spriteX_relativeToPlayer - this.dir.x * spriteY_relativeToPlayer);
          const transformY = Math.max(this.inverseDeterminate * (-this.plane.y * spriteX_relativeToPlayer + this.plane.x * spriteY_relativeToPlayer), 0);
          
          const spriteScreenX = Math.floor((this.game.screen.width / 2) * (1 + transformX / transformY));
          // spriteScreenX gives us the center of the sprite on screen. But we also need to know the start and end. If the center of the screen is within that range
          // then we have a potential target.
          const widthRatio = (sprite.width / sprite.height) * sprite.scale;
          const spriteWidth = Math.abs(Math.floor((this.game.screen.height / transformY * widthRatio)));
          const drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
          const drawEndX = spriteWidth / 2 + spriteScreenX;
          const centerOfScreen = this.game.screen.width / 2;
          if (centerOfScreen >= drawStartX && centerOfScreen <= drawEndX){
            // Finally, we want to only take the closest, so we're going to cache that.
            if(!acc.spriteDistance ){
              // First match.
              acc = {
                spriteDistance,
                sprite
              }
            }
            else {
              if(spriteDistance < acc.spriteDistance){
                acc = {
                  spriteDistance,
                  sprite,
                }
              }
            }
          }
        }
        return acc;
      }, {});

      if(closestUnobstructedSpriteWithTrigger.sprite && closestUnobstructedSpriteWithTrigger.sprite.trigger != null){
        // TODO: We can figure out what to pass it later. Possibly dynamically. For now, we'll give it the whole game instance!
        closestUnobstructedSpriteWithTrigger.sprite.callTrigger(this.game);
        // We don't want to trigger anything else, so let's hightail it.
        return
      }
    
    }

    // This will be used for commands. For now, we'll have a rudimentary approach that just checks the cell directly
    // in front of the player's direction to a very small maximum distance and call it's trigger function.
    if(wallDistance < 1){
      const wall = this.game.images[ray.wall - 1];
      wall.trigger(this.game);
    }
  }
}