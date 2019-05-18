/**
 * 
 * @param {string} id The DOM id of the canvas element this screen instance wraps.
 */
class Screen {
  constructor(game, id){
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.mozImageSmoothingEnabled = true;
    this.ctx.webkitImageSmoothingEnabled = true;
    this.ctx.msImageSmoothingEnabled = true;
    this.backgroundColor = 'black';
    this.width = 0;
    this.height = 0;
    // Just to make sure the canvas is reset before beginning.
    // Might want to remove this.
    this.clear();
    // When this is true, draw minimap overlay.
    // Can have all conditional render options set as single object with getters/setters later. (HUD, etc)
    this.isMapActive = false;
    this.game = game;
    this.fov = 60;
    this.drawDistance = 500;
  }

  // Getters/Setters
  showMap(){
    this.isMapActive = true;
  }

  hideMap(){
    this.isMapActive = false;
  }

  toggleMap(){
    this.isMapActive = !this.isMapActive;
  }

  // Display Helpers
  resizeCanvas(width, height) {
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.clear();
  }

  setBackgroundColor(color) {
    this.backgroundColor = color;
  }

  clear(color = this.backgroundColor) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
  }

  // Main draw functions
  drawMapOverlay(){
    // TODO: Lots of hardcoded stuff to make dynamic.
    const emptyCellColor = 'rgba(5,5,5,0.3)';
    // TODO: For simplicity's sake, we'll hard code the placement and size of the minimap for now at the top left.
    // Probably would be nicer as a full screen overlay with transparency;
    const mapLeft = 0;
    const mapTop = 0;
    const mapWidth = 200;
    const mapHeight = 200;
    const mapXRatio = mapWidth / MAP_WIDTH;
    const mapYRatio = mapHeight / MAP_HEIGHT;
    // Get player position and direction
    const playerPos = this.game.player.pos;
    const playerDir = this.game.player.dir;
    const playerSize = 3;
    // Get current world map.
    // This will be a class with useful methods... later
    const world = this.game.map.grid;
    const GRID_UNIT = 1;
    const mapWidthUnit = mapXRatio * GRID_UNIT;
    const mapHeightUnit = mapYRatio * GRID_UNIT;

    // Render grid lines
    for (let i = 0; i <= world[0].length; i++){
      // VERTICAL
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.moveTo(0 + (i * mapWidthUnit), 0);
      this.ctx.lineTo(0 + (i * mapWidthUnit), mapHeight);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    
    for(let i = 0; i < world.length; i++){
      // HORIZONTAL
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.moveTo(0, 0 + (i * mapHeightUnit));
      this.ctx.lineTo(mapWidth, 0 + (i * mapHeightUnit));
      this.ctx.closePath();
      this.ctx.stroke();
    }
    // TODO: Fix the mirrored orientation.
    // Render grid elements, scaled.
    for(let i = 0; i < world.length; i++){
      const rowOffset = i;
      const row = world[i];
      for(let j = 0; j < row.length; j++){
        const columnOffset = j;
        const cell = world.getCell(i, j);
        const textureId = cell; // In the future the cell will have more data so this will require extracing the data
        const cellHue = HUES[textureId];
        const cellTexture = this.game.images[cell - 1] && this.game.images[cell - 1].getCanvas();
        // TODO: For simplicity's sake, we'll hard code the placement and size of the minimap for now at the top left.
        const cellLeft = 0 + (rowOffset * mapWidthUnit);
        const cellTop = 0 + (columnOffset * mapHeightUnit);
        if (cellTexture){
          this.ctx.drawImage(cellTexture, 0, 0, cellTexture.width, cellTexture.height, cellLeft, cellTop, mapWidthUnit, mapHeightUnit);
        }
        else {
          this.ctx.beginPath();
          this.ctx.fillStyle = cellHue ? `hsla(${cellHue}, 100%, 80%, .9)` : emptyCellColor;
          this.ctx.fillRect(cellLeft, cellTop, mapWidthUnit, mapHeightUnit);
          this.ctx.closePath();
        }
      } 
    }
    // Render player dot
    const playerPosXOnMap = playerPos.x * mapXRatio;
    const playerPosYOnMap = playerPos.y * mapYRatio;
    this.ctx.beginPath();
    this.ctx.fillStyle = 'red';
    this.ctx.arc(playerPosXOnMap, playerPosYOnMap, playerSize, 0, PI2);
    this.ctx.fill();

  }

  drawPOVBackground(){
    // TODO: Each level should specify it's background colors (TODO: TODO: texture mapping ceilings and floors)
    // Until then, this can be drawn once on an offscreen canvas and reused instead of redrawn each frame.
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    const skyGradient = this.ctx.createLinearGradient(0,0,0, this.height / 2);
    skyGradient.addColorStop(0, "#68d8f2")
    skyGradient.addColorStop(1, "#0844a5")
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    const floorGradient = this.ctx.createLinearGradient(0, this.height / 2 ,0, this.height);
    floorGradient.addColorStop(0, "#333");
    // floorGradient.addColorStop(0.2, "#14300e")
    // floorGradient.addColorStop(1, "#1c660a")
    this.ctx.fillStyle = floorGradient;
    this.ctx.fillRect(0, (this.height / 2), this.width, (this.height / 2));
  }

  drawPlayerPOV(){
    const { rays, elevation: playerElevation } = this.game.player;
    if(!rays){
      return;
    }
    // console.log(rays[0])
    for(let i = 0; i < rays.length; i++){
      const ray = rays[i];
      // TODO: Make ray class to abstract and use getters.
      const { normalizedDistance, wall, wallOrientation, wallIntersection, rayDir, activeCell } = ray;
      const columnHeight = screenHeight / normalizedDistance;
      const top = (screenHeight / 2) - (columnHeight / 2) * playerElevation;
      const VIEW_DISTANCE = 25;
      const brightnessMultiplier = 1.3;
      const darknessMultiplier = 0.9;
      const brightness = (((VIEW_DISTANCE - (normalizedDistance * brightnessMultiplier)) / VIEW_DISTANCE) * 40) + 10; // clamps the brightness between 10 and 50.
      // If a texture doesn't exist, use a fallback color
      const wallTexture = this.game.images[wall - 1] && this.game.images[wall - 1].getCanvas();
      if(wallTexture){
        const textureWidth = wallTexture.width;
        const wallIntersectionOffset = wallIntersection - Math.floor(wallIntersection);
        let textureStripLeft = Math.floor(wallIntersectionOffset * textureWidth);
        this.ctx.drawImage(wallTexture, textureStripLeft, 0, 1, wallTexture.height, i, top, 1, columnHeight);
        this.ctx.fillStyle = 'black';
        this.ctx.globalAlpha = 1 - (VIEW_DISTANCE - (normalizedDistance * darknessMultiplier)) / VIEW_DISTANCE;
        this.ctx.fillRect(i, top, 1, columnHeight);
        this.ctx.globalAlpha = 1;
      }
      else {
        const wallHue = HUES[wall] || 0; // Anything without a fallback hue will be crazy red and obvious.
        const hsl = `hsl(${ wallHue }, 100%, ${ brightness }%)`;
        this.ctx.fillStyle = hsl;
        this.ctx.beginPath();
        this.ctx.fillRect(i,top, 1, columnHeight);
        this.ctx.closePath();
      }
      // This creates artificial shading on half the vertices to give them extra three dimensional feel.
      if(wallOrientation === 1){
        this.ctx.globalAlpha = .2;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(i, top, 1, columnHeight);
        this.ctx.globalAlpha = 1;
      }

      //FLOOR CASTING
      let floorXWall;
      let floorYWall; //x, y position of the floor texel at the bottom of the wall

      //4 different wall directions possible
      if(wallOrientation === 0 && rayDir.x > 0) {
        floorXWall = activeCell.x;
        floorYWall = activeCell.y + wallIntersection.x;
      }
      else if(wallOrientation === 0 && rayDir.x < 0) {
        floorXWall = activeCell.x + 1.0;
        floorYWall = activeCell.y + wallIntersection.x;
      }
      else if(wallOrientation === 1 && rayDir.y > 0) {
        floorXWall = activeCell.x + wallIntersection.x;
        floorYWall = activeCell.y;
      }
      else {
        floorXWall = activeCell.x + wallIntersection.x;
        floorYWall = activeCell.y + 1.0;
      }
      let drawEnd = top + columnHeight;
      let distWall, distPlayer, currentDist;

      distWall = normalizedDistance;
      distPlayer = 0.0;

      if (drawEnd < 0) {
        drawEnd = screenHeight; //becomes < 0 when the integer overflows
      }
      //draw the floor from drawEnd to the bottom of the screen
      for(let y = drawEnd + 1; y < screenHeight; y++){
        currentDist = screenHeight / (2.0 * y - screenHeight); //you could make a small lookup table for this instead

        const weight = currentDist / distWall;

        const currentFloorX = weight * floorXWall + (1.0 - weight) * this.game.player.pos.x;
        const currentFloorY = weight * floorYWall + (1.0 - weight) * this.game.player.pos.y;
        const floorTexture = this.game.images[0];
        let floorTexX, floorTexY;
        floorTexX = Math.floor(currentFloorX * floorTexture.width) % floorTexture.width;
        floorTexY = Math.floor(currentFloorY * floorTexture.height) % floorTexture.height;
        // this.ctx.fillStyle = 'purple';
        // this.ctx.fillRect(i,y, 1, 1)
        // this.ctx.drawImage(floorTexture,floorTexX,floorTexY,floorTexX + 1, floorTexY + 1, i, y, 1, 1);
        // console.log(currentDist)
        //floor
        // buffer[y][i] = (texture[3][texWidth * floorTexY + floorTexX] >> 1) & 8355711;
        //ceiling (symmetrical!)
        // buffer[screenHeight - y][i] = texture[6][texWidth * floorTexY + floorTexX];
      }
      
    }
  }

  draw() {
    this.clear();
    this.drawPOVBackground();
    this.drawPlayerPOV();
    if(this.isMapActive){
      this.drawMapOverlay();
    }
  }
}