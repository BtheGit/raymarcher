// This approach is going to use a different tack then the last one. Instead of using a direction angle we'll
// use a direction vector. We can then step along rays in increments of that vector.

// In addition, we'll also use a camera plane.


// # Constants

// const MAP1 = [
//   [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,4,0,4,4,4,0,4,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
//   [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
//   [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
//   [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,4,0,0,0,0,4,4,4,4,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,3,3,0,9,0,3,3,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,2,2,2,2,2,2,12,2],
//   [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
//   [1,0,0,0,0,0,0,0,3,3,0,3,3,3,0,3,2,0,0,2,0,2,0,2],
//   [1,0,0,0,0,0,0,0,1,1,0,1,7,1,0,1,2,0,0,0,0,2,0,2],
//   [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,2,0,0,0,2,0,2],
//   [1,0,0,0,0,0,0,0,6,0,6,1,0,1,0,0,0,1,2,2,2,2,0,2],
//   [1,0,0,0,0,0,0,0,0,10,1,1,0,1,0,0,0,0,1,1,1,2,0,2],
//   [1,0,0,0,0,0,0,0,0,1,1,6,0,6,1,0,0,0,0,0,0,0,0,11],
//   [1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1]
// ];

// const PORTFOLIO_MAP1 = [
//   [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,1,0,1,0,19,0,1,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
//   [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
// ]

// TODO: Have a starting position. And if none is found, the center of the first tile that returns
// empty.
// const NEW_MAP = [
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},0,{},{},undefined,{},{},{},{},{},{},null,{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
//   [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]
// ]



// TODO: Loading screen
// TODO: Create a name for any tiles that might not have one. Or is this necessary? Without
// a name, how can we specify them in the improved map anyway?

// TEST to create image buffers for optimizing
// Yes, at this point it's starting to be pretty obvious that I could stand to use a super class
// here. But until we know how these image buffers will shake out, I don't want to optimize.
// class FramedImageBuffer {
//   constructor(image){
//     this.rawImage = image;
//     this.canvas = document.createElement('canvas');
//     this.width = this.canvas.width = this.rawImage.width;
//     this.height = this.canvas.height = this.rawImage.height;
//     this.ctx = this.canvas.getContext('2d');
//     this.ctx.drawImage(this.rawImage, 0, 0);
//   }

//   getCanvas(){
//     return this.canvas;
//   }
  
//   getImageData(){
//     return(this.ctx.getImageData(0,0, this.width, this.height));
//   }
// }

const loadImageBuffer = async ({ path }) => {
  const img = await loadImage(path);
  const imageBuffer = new ImageBuffer(img);
  return imageBuffer;
}

const loadLinkImageBuffer = async ({ href, path }) => {
  const img = await loadImage(path);
  const linkImageBuffer = new LinkImageBuffer(href, img);
  return linkImageBuffer;
}

// // Again, obviously not dry. But let's see what works best before we optimize.
// // INCOMPLETE
// const loadFramedImageBuffer = async ({ imagePath, backgroundImagePath }) => {
//   const framedImage = await loadImage(imagePath);
//   const backgroundImage = await loadImage(backgroundImagePath);
//   const baseCanvas = document.createElement('canvas');
//   const baseCtx = baseCanvas.getContext('2d');
//   baseCanvas.width = backgroundImage.width;
//   baseCanvas.height = backgroundImage.height;
//   baseCtx.drawImage(backgroundImage, 0, 0);

//   // FAILED ATTEMPT TO FRAME AND ROTATE
//   // const frameCanvas = document.createElement('canvas');
//   // const frameCtx = baseCanvas.getContext('2d');
//   // frameCanvas.width = baseCanvas.width * .5 + 12;
//   // frameCanvas.height = baseCanvas.height * .5 + 6;
//   // frameCtx.fillStyle = 'black';
//   // frameCtx.fillRect(0,0,frameCanvas.width,frameCanvas.height)
//   // frameCtx.drawImage(framedImage, 6, 3, frameCanvas.width - 12, frameCanvas.height - 6)
//   // frameCtx.rotate(30);
//   // baseCtx.drawImage(frameCanvas, 100,100, 100, 100)
//   const frameWidthRatio = Math.floor(baseCanvas.width * .8);
//   const framedImageWidthRatio = Math.floor(baseCanvas.width * .7);
//   const framedImageHeight = (framedImage.width / baseCanvas.width) * framedImage.height;
//   baseCtx.fillStyle = 'black'
//   baseCtx.fillRect( 20, 20, frameWidthRatio, 100)

//   return new ImageBuffer(baseCanvas);
// }

const loadBokeh = ({ bokehSettings }) => {
  return new BokehImageBuffer(bokehSettings);
}

const loadTiles = (tiles) => {
  return Promise.all(tiles.map(tile => {
    switch(tile.type){
      case 'image':
        return loadImageBuffer(tile)
      case 'bokeh':
        return Promise.resolve(loadBokeh(tile));
      case 'framed-image':
        return loadFramedImageBuffer(tile);
      case 'link-image':
        return loadLinkImageBuffer(tile)
      default:
        break;
    }
  }));
}

// TODO: Create Texture handling class

const HUES = {
  1: '330',
  2: '160',
  3: '180',
  4: '200',
  5: '220',
}

const VIEW_DISTANCE = 1000;
const FRAMERATE = 1000 / 30;
const PI2 = Math.PI * 2;
const STORAGE_ID = 'bb_raymarcher'

const wad = PORTFOLIO_WAD;

// Instead of wrapping the game, we could wrap each level with a loader so that asset loads are lighter.
const loadAssets = async () => {
  const tiles = await loadTiles(wad.tiles);
  // const sprites = await loadSprites(wad.sprites);
  const sprites = null;
  const maps = wad.maps;
  const game = new Game(maps, tiles, sprites, FRAMERATE);
  game.start();
}

loadAssets();