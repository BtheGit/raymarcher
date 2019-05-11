// This approach is going to use a different tack then the last one. Instead of using a direction angle we'll
// use a direction vector. We can then step along rays in increments of that vector.

// In addition, we'll also use a camera plane.


// # Constants

const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 384;

const MAP = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,0,0,0,0,0,1],
  [1,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,2,0,0,0,1],
  [1,0,0,0,2,2,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];

// TODO: World size will be dynamically determined based on the grid unit size and the world map dimensions.
const MAP_WIDTH = MAP[0].length;
const MAP_HEIGHT = MAP.length;


const STARTING_POS = new Vector(4.5, 3.5);
const STARTING_DIRECTION = new Vector(-1, 0);

const WALL_HEIGHT = 100;
const VIEW_DISTANCE = 1000;
const FRAMERATE = 1000 / 30;
const PI2 = Math.PI * 2;

// TODO:
const TEXTURES = {
  1: 'indigo',
  2: 'violet',
}

const game = new Game(FRAMERATE);
game.start();
