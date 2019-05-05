// This will be for the most bare bones implementation and playing around.
// If this goes on long enough, we'll modularize and add in a build system.

// # Constants

const STARTING_POSX = 200;
const STARTING_POSY = 200;
const STARTING_DIR = 0; // Angle in degrees.
const WALL_HEIGHT = 100;
const VIEW_DISTANCE = 1000;
const FRAMERATE = 1000 / 30;
const GRID_UNIT = 10;
const PI2 = Math.PI * 2;
// TODO: Hard coded for now
const WORLD_MAP = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,0,0,0,0,0,1],
  [1,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,0,0,0,1],
  [1,0,0,0,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];
// TODO:
const TEXTURES = {
  1: 'indigo',
}
// TODO: World size will be dynamically determined based on the grid unit size and the world map dimensions.
const WORLD_WIDTH = WORLD_MAP[0].length * GRID_UNIT;
const WORLD_HEIGHT = WORLD_MAP.length * GRID_UNIT;

// # Helper functions
const radians = degrees => degrees * (Math.PI / 180);
const degrees = radians => radians / (Math.PI/ 180);
const vectorDistance = (vector1, vector2) => Math.sqrt((vector1.x - vector2.x) ** 2 + (vector1.y - vector2.y) ** 2);
const random = (upper = 100, lower = 0) => Math.max(Math.floor(Math.random() * (upper + 1)), lower);
const clamp = (number, min, max) => Math.max(min, Math.min(number, max));
const getMovementDelta = ({angle, forward = true, speed = 1 }) => {
  const rads = radians(angle);
  const xDelta = Math.cos(rads) * speed;
  const yDelta = Math.sin(rads) * speed;
  const x = forward ? xDelta : -xDelta;
  const y = forward ? yDelta : -yDelta;
  return { x, y };
}
const scaleToScreen = (vector, screen) => {
  const scaleX = screen.width / WORLD_WIDTH;
  const scaleY = screen.height / WORLD_HEIGHT;
  const scaledX = vector.x * scaleX;
  const scaledY = vector.y * scaleY;
  return { x: scaledX, y: scaledY };
}
const getRandomWallColor = () => {
  const WALL_COLORS = [200, 220, 240, 260];
  return WALL_COLORS[ Math.floor((Math.random() * WALL_COLORS.length))];
}

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

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
    this.clear();
    // When this is true, draw minimap overlay.
    // Can have all conditional render options set as single object with getters/setters later. (HUD, etc)
    this.isMapActive = false;
    this.game = game;
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
    const mapXRatio = mapWidth / WORLD_WIDTH;
    const mapYRatio = mapHeight / WORLD_HEIGHT;
    // Get player position and direction
    const playerPos = this.game.player.pos;
    const playerDir = this.game.player.dir;
    const playerSize = 5;
    // Get current world map.
    // This will be a class with useful methods... later
    const world = WORLD_MAP;
    const gridUnit = GRID_UNIT;
    const mapWidthUnit = mapXRatio * GRID_UNIT;
    const mapHeightUnit = mapYRatio * GRID_UNIT;
    // Render grid, scaled.
    for(let i = 0; i < world.length; i++){
      const rowOffset = i;
      const row = world[i];
      for(let j = 0; j < row.length; j++){
        const columnOffset = j;
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
    const playerViewDirX = (Math.cos(radians(playerDir)) * lengthOfPlayerSight) + playerPosXOnMap;
    const playerViewDirY = (Math.sin(radians(playerDir)) * lengthOfPlayerSight) + playerPosYOnMap;
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'red';
    this.ctx.moveTo(playerPosXOnMap, playerPosYOnMap);
    this.ctx.lineTo(playerViewDirX, playerViewDirY);
    this.ctx.stroke();
  }

  drawScreen(){

  }

  draw() {
    this.clear();
    this.drawScreen();
    if(this.isMapActive){
      this.drawMapOverlay();
    }
  }
}

class Player {
  constructor(){
    this.pos = new Vector(50,30);
    this.dir = 0;
    this.walkSpeed = 2;
    this.rotateSpeed = 10;
  }

  move({ x, y } = {}){
    if(x != null) {
      const newPosX = clamp(this.pos.x + (x * this.walkSpeed), 1, WORLD_WIDTH - 1); // The 1 offset is to prevent being in a boundary wall
      this.pos.x = newPosX;
    }
    if(y != null) {
      const newPosY = clamp(this.pos.y + (y * this.walkSpeed), 1, WORLD_HEIGHT - 1);
      this.pos.y = newPosY;
    }
  }

  rotate(rotation){
    const newDir = this.dir + (rotation * this.rotateSpeed);
    this.dir = newDir;
  }
}

class Game {
  constructor(){
    this.interval = FRAMERATE;
    this.animationFrame = null;
    // Use one canvas but have display modes (or a map overlay when tabv is pressed).
    this.screen = new Screen(this, 'display-main');
    this.screen.resizeCanvas(1200,550);
    this.player = new Player();

    document.addEventListener('keydown', ({ key }) => {
      switch(key){
        case '`':
          this.screen.toggleMap();
          break;
        case 'a':
          this.player.rotate(-1);
          break;
        case 'd':
          this.player.rotate(1);
          break;
        case 'w':
          this.player.move(getMovementDelta({ angle: this.player.dir }))
          break;
        case 's':
          this.player.move(getMovementDelta({ angle: this.player.dir, forward: false }))
          break;
      }      
    })

  }

  start() {
    let then = Date.now()
    let delta;

    const draw = timestamp => {
      const now = Date.now(timestamp);
      delta = now - then;
      if(delta > this.interval) {
        /* BEGIN Game Loop */      
        this.drawScreen();
        /* END Game Loop */
        then = now - (delta % this.interval)
      }
      this.animationFrame = requestAnimationFrame(draw);
    }
    this.animationFrame = requestAnimationFrame(draw)
  }

  stop() {
    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null;
  }

  drawScreen(){
    this.screen.draw();
  }

}

const game = new Game();
game.start();
