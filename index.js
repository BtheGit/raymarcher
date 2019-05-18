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
const MAP2 = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,4,0,4,4,4,0,4,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
  [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,4,0,0,0,0,4,4,4,4,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,3,3,0,9,0,3,3,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,2,2,2,2,2,2,12,2],
  [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [1,0,0,0,0,0,0,0,3,3,0,3,3,3,0,3,2,0,0,2,0,2,0,2],
  [1,0,0,0,0,0,0,0,1,1,0,1,7,1,0,1,2,0,0,0,0,2,0,2],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,2,0,0,0,2,0,2],
  [1,0,0,0,0,0,0,0,6,0,6,1,0,1,0,0,0,1,2,2,2,2,0,2],
  [1,0,0,0,0,0,0,0,0,10,1,1,0,1,0,0,0,0,1,1,1,2,0,2],
  [1,0,0,0,0,0,0,0,0,1,1,6,0,6,1,0,0,0,0,0,0,0,0,11],
  [1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1]
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

// TODO: Loading screen
const TILES = [
  {
    type: 'image',
    imagePath: './images/tiles/light_brick1.jpg',
  },
  {
    type: 'image',
    imagePath: './images/tiles/marble1.jpg',
  },
  {
    type: 'image',
    imagePath: './images/tiles/concrete1.jpg',
  },
  {
    type: 'image',
    imagePath: './images/tiles/rusted_steel1.jpg',
  },
  {
    type: 'image',
    imagePath: './images/tiles/red_brick1.jpg',
  },
  {
    type: 'image',
    imagePath: './images/tiles/hedge1.jpg',
  },
  {
    type: 'image',
    imagePath: './images/tiles/me1.png',
  },
  {
    type: 'bokeh',
  },
  {
    type: 'bokeh',
    bokehSettings: {
      color: 'purple',
      backgroundColor: '#afa195',
      dx: 5,
      dy: 5,
      density: 20,
      halfLife: 100,
      radius: 30,
      frameRate: 60,
    }
  },
  {
    type: 'image',
    imagePath: 'https://media.licdn.com/dms/image/C5603AQFDLAcoM7oa0w/profile-displayphoto-shrink_800_800/0?e=1563408000&v=beta&t=BbkkYW-9reSYz1TNvDhAjbv7rBfNlN9RN6KIkeLbYKo'
  },
  {
    type: 'image',
    imagePath: 'https://media.licdn.com/dms/image/C4E03AQF_rnt4a-2N4g/profile-displayphoto-shrink_800_800/0?e=1563408000&v=beta&t=gi6fY7WlyY5t71f4KYuRHjEkwurb5gRqA9hKlQ3PC_o',
  },
  {
    type: 'image',
    imagePath: 'https://scontent-iad3-1.xx.fbcdn.net/v/t31.0-8/11823034_10154226861255620_5773866248861672139_o.jpg?_nc_cat=107&_nc_ht=scontent-iad3-1.xx&oh=5b2423ed7c798b8ab75d39f9bc4353e1&oe=5D56DC9F'
  }
];

// TEST to create image buffers for optimizing
class ImageBuffer {
  constructor(image){
    this.rawImage = image;
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = this.rawImage.width;
    this.height = this.canvas.height = this.rawImage.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(this.rawImage, 0, 0);
  }

  getCanvas(){
    return this.canvas;
  }
  
  getImageData(){
    return(this.ctx.getImageData(0,0, this.width, this.height));
  }
}

// TEST to use bokehfy to create animated walls
// TODO: Resizing the window breaks this (the canvas size gets reset to 0)
// TODO: Don't let an opacity be set (no transparency)
// TODO: If I can add in support of background images for bokehfy, I can use it as
// an effect over normal game tiles!
class BokehImage {
  constructor(bokehSettings = {}, sideLength = 200){
    this.el = document.createElement('div');
    this.settings = { ...bokehSettings, parent: this.el}
    this.field = bokehfy(this.settings);
    this.canvas = this.field.canvas;
    this.width = this.canvas.width = sideLength;
    this.height = this.canvas.height = sideLength;
    this.ctx = this.canvas.getContext('2d');
    // document.addEventListener('resize', () => {
    //   this.width = this.canvas.width = 512;
    //   this.height = this.canvas.height = 192;
    // })
  }

  getCanvas(){
    // Because of the way bokehfy uses the parent of the bokeh field canvas as a barometer
    // on resize events. We need to manually update the size here if it is 0 (ie a resize event has
    // occured) before returning the image.
    if(!this.canvas.width || !this.canvas.height){
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    return this.canvas;
  }
  
  getImageData(){
    return(this.ctx.getImageData(0,0, this.width, this.height));
  }
}

const loadImagePromise = imagePath => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      const imageBuffer = new ImageBuffer(img);
      resolve(imageBuffer);
    })
    img.src = imagePath;
  })
}

const loadBokeh = bokehSettings => {
  return new BokehImage(bokehSettings);
}

const loadTiles = (tiles) => {
  return Promise.all(tiles.map(tile => {
    if(tile.type === 'image'){
      return loadImagePromise(tile.imagePath)
    }
    if(tile.type === 'bokeh'){
      return Promise.resolve(loadBokeh(tile.bokehSettings));
    }
  }));
}

const loadAssets = async () => {
  const tiles = await loadTiles(TILES);
  // If we abstract the API for images, we can use plain images and animated ones
  // interchangeably.
  // const imageBuffers = rawImages.map(rawImage => new ImageBuffer(rawImage));
  // imageBuffers.push(BOKEH_IMAGE); // TEST
  // TODO: Create Texture handling class
  const game = new Game(tiles, FRAMERATE);
  game.start();
}

loadAssets();