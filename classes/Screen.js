/**
 * 
 * @param {string} id The DOM id of the canvas element this screen instance wraps.
 */
class Screen {
  constructor(game, id){
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');
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
    const world = MAP;
    const GRID_UNIT = 1;
    const mapWidthUnit = mapXRatio * GRID_UNIT;
    const mapHeightUnit = mapYRatio * GRID_UNIT;

    // Render grid lines
    for (let i = 0; i <= MAP[0].length; i++){
      // VERTICAL
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.moveTo(0 + (i * mapWidthUnit), 0);
      this.ctx.lineTo(0 + (i * mapWidthUnit), mapHeight);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    
    for(let i = 0; i < MAP.length; i++){
      // HORIZONTAL
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.moveTo(0, 0 + (i * mapHeightUnit));
      this.ctx.lineTo(mapWidth, 0 + (i * mapHeightUnit));
      this.ctx.closePath();
      this.ctx.stroke();
    }

    // Render grid elements, scaled.
    for(let i = 0; i < world.length; i++){
      const columnOffset = i;
      const row = world[i];
      for(let j = 0; j < row.length; j++){
        const rowOffset = j;
        const cell = row[j];
        const textureId = cell; // In the future the cell will have more data so this will require extracing the data
        const cellTexture = TEXTURES[textureId];
        
        // TODO: For simplicity's sake, we'll hard code the placement and size of the minimap for now at the top left.
        const cellLeft = 0 + (rowOffset * mapWidthUnit);
        const cellTop = 0 + (columnOffset * mapHeightUnit);
        this.ctx.beginPath();
        this.ctx.fillStyle = cellTexture ? cellTexture : emptyCellColor;
        this.ctx.fillRect(cellLeft, cellTop, mapWidthUnit, mapHeightUnit);
        this.ctx.closePath();
      } 
    }
    // Render player and dir (use arrow or triangle)
    const playerPosXOnMap = playerPos.x * mapXRatio;
    const playerPosYOnMap = playerPos.y * mapYRatio;
    this.ctx.beginPath();
    this.ctx.fillStyle = 'red';
    this.ctx.arc(playerPosXOnMap, playerPosYOnMap, playerSize, 0, PI2);
    this.ctx.fill();

    const lengthOfPlayerSight = playerSize * 3;
    const playerViewDirX = (Math.cos(toRadians(playerDir)) * lengthOfPlayerSight) + playerPosXOnMap;
    const playerViewDirY = (Math.sin(toRadians(playerDir)) * lengthOfPlayerSight) + playerPosYOnMap;
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'red';
    this.ctx.moveTo(playerPosXOnMap, playerPosYOnMap);
    this.ctx.lineTo(playerViewDirX, playerViewDirY);
    this.ctx.stroke();
  }

  drawPlayerPOV(){
    const { rays } = this.game.player;
    if(!rays){
      return;
    }
    // console.log(rays[0])
    for(let i = 0; i < rays.length; i++){
      const ray = rays[i];
      // TODO: Make ray class to abstract and use getters.
      const { normalizedDistance, intersectingCell } = ray;
      const columnHeight = clamp(screenHeight / normalizedDistance, 0, screenHeight);
      const top = (screenHeight / 2) - (columnHeight / 2);
      const VIEW_DISTANCE = 25;
      const wallHue = TEXTURES[intersectingCell];
      const brightness = (((VIEW_DISTANCE - normalizedDistance) / VIEW_DISTANCE) * 40) + 10; // clamps the brightness between 10 and 50.
      const hsl = `hsl(${ wallHue }, 100%, ${ brightness }%)`;
      this.ctx.fillStyle = hsl;
      // this.ctx.strokeStyle = hsl;
      this.ctx.beginPath();
      this.ctx.fillRect(i,top, 1, columnHeight);
      // this.ctx.strokeRect(i,top, 1, columnHeight);
      this.ctx.closePath();
    }
  }

  draw() {
    this.clear();
    this.drawPlayerPOV();
    if(this.isMapActive){
      this.drawMapOverlay();
    }
  }
}