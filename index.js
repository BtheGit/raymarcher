// This approach is going to use a different tack then the last one. Instead of using a direction angle we'll
// use a direction vector. We can then step along rays in increments of that vector.

// In addition, we'll also use a camera plane.


// # Constants

const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 384;

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// TODO: World size will be dynamically determined based on the grid unit size and the world map dimensions.
const MAP_WIDTH = MAP[0].length;
const MAP_HEIGHT = MAP.length;

const WALL_HEIGHT = 50;


const STARTING_POSITION = new Vector(15, 9);
const STARTING_DIRECTION = new Vector(-1, 0);
const STARTING_CAMERA_PLANE = new Vector(0, 0.66);

// temp
const RAY_COUNT = 512;
const map = MAP;
const position = STARTING_POSITION;
const screenWidth = RAY_COUNT;
const screenHeight = SCREEN_HEIGHT;
const wallHeight = WALL_HEIGHT;

this.screen = new Screen(this, 'display-main');
this.screen.resizeCanvas(512,384);
const TEXTURES = {
  1: 'red',
  2: 'yellow',
  3: 'blue',
  4: 'green',
  5: 'purple',
}

for(let i = 0; i < screenWidth; i++){
  const cameraX = 2 * i / screenWidth - 1;
  const rayDir = STARTING_CAMERA_PLANE.scale(cameraX).add(STARTING_DIRECTION);
  const activeCell = position.map(Math.floor);
  
  // The distance from the nearest cell walls
  const distanceDelta = rayDir.map((scalar) => Math.abs(1 / scalar));
  // Which way we're going.
  const stepX = rayDir.x < 0 ? -1 : 1;
  const stepY = rayDir.y < 0 ? -1 : 1;
  
  let sideDistX = (rayDir.x < 0 ? position.x - activeCell.x : 1 + activeCell.x - position.x) * distanceDelta.x;
  let sideDistY = (rayDir.y < 0 ? position.y - activeCell.y : 1 + activeCell.y - position.y) * distanceDelta.y;
  
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
    const currentCell = map[activeCell.x][activeCell.y];
    if(currentCell){
      wall = currentCell;
    }
  }
  
  const normalizedDistance = wallOrientation === 0
    ? (activeCell.x - position.x + (1 - stepX) / 2) / rayDir.x
    : (activeCell.y - position.y + (1 - stepY) / 2) / rayDir.y
  
  const columnHeight = clamp(screenHeight / normalizedDistance, 0, screenHeight);
  // Draw columns on screen instance


  // TODO: DELETE
  const top = (screenHeight / 2) - (columnHeight / 2);
  // To draw the columns, we need  
  // console.table({normalizedDistance, screenHeight, wallHeight, columnOffset})
  // console.log(columnHeight)
  this.screen.ctx.fillStyle = TEXTURES[MAP[activeCell.x][activeCell.y]];
  this.screen.ctx.beginPath();
  this.screen.ctx.fillRect(i,top, 1, columnHeight);
  this.screen.ctx.closePath();
}



// const WALL_HEIGHT = 100;
const VIEW_DISTANCE = 1000;
const FRAMERATE = 1000 / 30;
const PI2 = Math.PI * 2;

// TODO:


// const game = new Game(FRAMERATE);
// game.start();
