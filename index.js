// This approach is going to use a different tack then the last one. Instead of using a direction angle we'll
// use a direction vector. We can then step along rays in increments of that vector.

// In addition, we'll also use a camera plane.

// TODO: Loading screen
// TODO: Create a name for any tiles that might not have one. Or is this necessary? Without
// a name, how can we specify them in the improved map anyway?

const loadImageBuffer = async ({ path }) => {
  const img = await loadImage(path);
  const imageBuffer = new ImageBuffer(img);
  return imageBuffer;
}

const loadImageBuffer2 = async (path) => {
  const img = await loadImage(path);
  const imageBuffer = new ImageBuffer(img);
  return imageBuffer;
}

const loadLinkImageBuffer = async ({ href, path }) => {
  const img = await loadImage(path);
  const linkImageBuffer = new LinkImageBuffer(href, img);
  return linkImageBuffer;
}

const loadBokeh = ({ bokehSettings }) => {
  return new BokehImageBuffer(bokehSettings);
}

const loadTiles = tiles => {
  return Promise.all(tiles.map(tile => {
    switch(tile.type){
      case 'image':
        return loadImageBuffer(tile)
      case 'bokeh':
        return Promise.resolve(loadBokeh(tile));
      case 'link-image':
        return loadLinkImageBuffer(tile)
      default:
        break;
    }
  }));
}

const loadTextures = async (texturePaths) => {
  const textureMap = {};
  for(let i = 0; i < texturePaths.length; i++){
    const path = texturePaths[i];
    const pathParts = path.split('/');
    const fileNameAndExtension = pathParts[pathParts.length - 1];
    const fileName = fileNameAndExtension.split('.')[0];

    const texture = await loadImageBuffer2(path);
    
    textureMap[fileName] = texture;
  }
  return textureMap;
}

// The sprite textures will be stored in a hash for named reference.
const loadSprites = sprites => Promise.all(sprites.map((sprite) => {
  return loadImageBuffer(sprite);
  // This will change soon of course to support a unique sprite class.
}))

// Depending on how things shake out, instead of putting these into a map, we might just want
// to create a map of several arrays based on the sprite type (object, NPC etc.) since 
// certain operations will be called on each depending on that. So, solid sprites will be
// called for collision detection, animated sprites will be called for updating in the game loop, etc.
const loadSprites2 = textureMap => spriteConfigs => {
  const sprites = spriteConfigs.map(config => new Sprite(textureMap, config));
  return sprites;
}

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
  const textureMap = await loadTextures(wad.textures);
  const sprites = loadSprites2(textureMap)(wad.sprites);
  const tiles = await loadTiles(wad.tiles);
  const maps = wad.maps;
  const game = new Game(maps, tiles, sprites, FRAMERATE);
  game.start();
}

loadAssets();