// This will be for the most bare bones implementation and playing around.
// If this goes on long enough, we'll modularize and add in a build system.

// I'm mixing angles and radians. I should probably store the dir as radians to save recalculations.

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
const toRadians = degrees => degrees * (Math.PI / 180);
const toDegrees = radians => radians / (Math.PI/ 180);
const vectorDistance = (vector1, vector2) => Math.sqrt((vector1.x - vector2.x) ** 2 + (vector1.y - vector2.y) ** 2);
const random = (upper = 100, lower = 0) => Math.max(Math.floor(Math.random() * (upper + 1)), lower);
const clamp = (number, min, max) => Math.max(min, Math.min(number, max));
const getMovementDelta = ({angle, forward = true, speed = .5 }) => {
  const rads = toRadians(angle);
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

    // Render grid lines
    for (let i = 0; i <= WORLD_MAP[0].length; i++){
      // VERTICAL
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.moveTo(0 + (i * mapWidthUnit), 0);
      this.ctx.lineTo(0 + (i * mapWidthUnit), mapHeight);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    
    for(let i = 0; i < WORLD_MAP.length; i++){
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
    const playerViewDirX = (Math.cos(toRadians(playerDir)) * lengthOfPlayerSight) + playerPosXOnMap;
    const playerViewDirY = (Math.sin(toRadians(playerDir)) * lengthOfPlayerSight) + playerPosYOnMap;
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'red';
    this.ctx.moveTo(playerPosXOnMap, playerPosYOnMap);
    this.ctx.lineTo(playerViewDirX, playerViewDirY);
    this.ctx.stroke();
  }

  drawScreen(){
    // The idea here is to use ray marching to save intersection computations (in a small world this is more expensive than just calculating
    // intersections with all objects, but in a massive world it's much cheaper (stable time in fact with a given limititation on drawdistance)).
    // This is made possible because the walls are only drawn on grid vertices, which are at regular, predictable intervals.
    // However, the player himself (and sprites later) will be at any valid vector (ie, not in a cell marked as a wall).
    // So, before we start marching our rays up the gridlines, we first need to calculate the player's dx and dy relative to the closest grid 
    // line in the player dir.

    // const degrees = this.game.player.dir;
    const degrees = 30;
    const rads = toRadians(degrees);
    const posX = this.game.player.pos.x;
    const posY = this.game.player.pos.y;
    
    // Let's experiment with one ray.
    // TODO: If we can't guarantee the rays direction are clamped, we should clamp the value here.
    const cos = Math.cos(rads);
    const sin = Math.sin(rads);
    const slope = sin / cos; // Same as Math.tan(rads)
    const gridUnit = GRID_UNIT;

    // Values used for the initial calculation.
    const offsetX = posX % gridUnit;
    const offsetY = posY % gridUnit;



    // There are a few things conditional on the direction we are facing.
    // So we need to know:
    // a) whether The slope is pointing in such a way that it will only intercept one axis (ie 0, 90, 180, 270)
    // b) which quadrant the slope is in. (ie is it -dx -dy, dx dy, dx -dy, -dx dy)
    // let dx, dy;
    // let dirX, dirY;

    // For one direction, the delta will be 1 or -1.
    // The other direction it will be 
    // if(degrees === 0){

    // }
    // else if(degrees === 90){

    // }
    // else if(degrees === 180){

    // }
    // else if(degrees === 270){

    // }
    // else if(degrees > 0 && degrees < 90){
    //   dirX = 1;
    //   dirY = 1;
    // }
    // else if(degrees > 90 && degrees < 180){
    //   dirX = -1;
    //   dirY = 1;
    // }
    // else if(degrees > 180 && degrees < 270){
    //   dirX = -1;
    //   dirY = -1;
    // }
    // else if(degrees > 270 && degrees < 360){
    //   dirX = 1;
    //   dirY = -1;
    // }
    // else {
    //   throw new Error('How do you have an angle that is not clamped between 0 and 360???');
    // }

    // Then we need to calculate the first intercept (which could be x or y)
    // We'll keep marching along the ray at x or y intercepts. Once we have an intercept step distance we can just use multiples
    // However, bear in mind that it may not be alternating between x and y evenly. An angle like 10 will intercept along the y axis
    // many times before intercepting an x axis.


    // How do we know which direction we are going (ie, whether to use dx or (gridunit - dx))?
    // For the experiment, let's just assume it is in the direction we already know.
    let dx = gridUnit - offsetX;
    let dy = gridUnit - offsetY;

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

class Game {
  constructor(){
    this.interval = FRAMERATE;
    this.animationFrame = null;
    // Use one canvas but have display modes (or a map overlay when tabv is pressed).
    this.screen = new Screen(this, 'display-main');
    this.screen.resizeCanvas(1000,550);
    this.player = new Player();
    this.keyState = {}; // Active store of keypresses

    document.addEventListener('keydown', ({ key }) => {
      this.keyState[key] = true;
    })
    document.addEventListener('keyup', ({ key }) => {
      this.keyState[key] = false;
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
        this.updatePlayerPositioning();      
        this.drawScreen();
        /* END Game Loop */
        then = now - (delta % this.interval)
      }
      this.animationFrame = requestAnimationFrame(draw);
    }
    this.animationFrame = requestAnimationFrame(draw)
  }

  updatePlayerPositioning(){
    if(this.keyState['`']){
      this.screen.showMap();
    }
    else {
      this.screen.hideMap();
    }
    if(this.keyState.a){
      this.player.rotate(-1);
    }
    if(this.keyState.d){
      this.player.rotate(1);
    }
    if(this.keyState.w){
      this.player.move(getMovementDelta({ angle: this.player.dir }))
    }
    if(this.keyState.s){
      this.player.move(getMovementDelta({ angle: this.player.dir, forward: false }))
    }
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
