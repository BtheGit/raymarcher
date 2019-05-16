// This approach is going to use a different tack then the last one. Instead of using a direction angle we'll
// use a direction vector. We can then step along rays in increments of that vector.

// In addition, we'll also use a camera plane.


// # Constants

const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 786;

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
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,1],
  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1],
  [1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1],
  [1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
  [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,1],
  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];


// TODO: World size will be dynamically determined based on the grid unit size and the world map dimensions.
const MAP_WIDTH = MAP[0].length;
const MAP_HEIGHT = MAP.length;

// const WALL_HEIGHT = 50;

const STARTING_POSITION = new Vector(22, 12);
// const STARTING_DIRECTION = new Vector(-1, 0);
// const STARTING_CAMERA_PLANE = new Vector(0, 0.66);

// temp
const RAY_COUNT = SCREEN_WIDTH;
const map = MAP;
const position = STARTING_POSITION;
const screenWidth = RAY_COUNT;
const screenHeight = SCREEN_HEIGHT;
// const wallHeight = WALL_HEIGHT;

this.screen = new Screen(this, 'display-main');
this.screen.resizeCanvas(512,384);
const HUES = {
  1: '330',
  2: '160',
  3: '180',
  4: '200',
  5: '220',
}

// const WALL_HEIGHT = 100;
const VIEW_DISTANCE = 1000;
const FRAMERATE = 1000 / 30;
const PI2 = Math.PI * 2;

// TODO: Load textures before executing game loop
// TODO: Loading screen
const tiles = [
  './images/tiles/hedge1.jpg',
  './images/tiles/marble1.jpg',
  './images/tiles/mosaic1.jpg',
  './images/tiles/mosaic2.jpg',
  './images/tiles/red_brick1.jpg',
];

const loadImagePromise = imagePath => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      resolve(img);
    })
    img.src = imagePath;
  })
}

const loadImages = (tiles) => {
  return Promise.all(tiles.map(loadImagePromise));
}

const loadAssets = async () => {
  const images = await loadImages(tiles);
  // TODO: Create Texture handling class
  const game = new Game(images, FRAMERATE);
  game.start();
}

loadAssets();