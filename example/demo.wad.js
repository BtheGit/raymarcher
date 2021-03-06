// We can explore preprocessing these files so the full gridCell objects don't have to be built, instead a function perhaps.

const BLANK_GRID = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  
];

// A 'WAD' file will have the list of texture assets, the maps, and the starting parameters for the player.
// Maps will include settings for static background colors.
// The WAD folder will also have a subfolder to hold image assets.

// We could load textures only by map, but I think with modern web capabilities, let's cheat and just load everything for
// now. If I come to regret it, I'm not worried, I'm sure there are plenty of other decisions I'll already be
// regretting more by that point.

// This is a weird way to do it. Having everything processed into a second lookup tree on load, but because of the 
// nature of having mixed assets, we're going to put off restructuring until a final tally of allowed texture types
// is created.

// Let's have a bare set of files In fact, there's no reason we can't do this with just scooping up all the files in the 
// directory and creating their names in the hash from there. Tiles too. But for now we'll still name the imports.
// For simplicity, we'll want all images in a folder to have a unique name even if they are different extensions, to avoid
// collisions.
// For that matter, there is no reason, all the texture files can't go in the same hash.
const textures = [
  './images/sprite__tree_1.png',
  './images/sprite__tree_2.png',
  './images/sprite__tree_2_low.png',
  './images/sprite__palm_tree_1_high.png',
  './images/sprite__palm_tree_1_low.png',
  './images/sprite__spider-man_static_1.png',
  './images/tiles/background__trees1.jpg',
  './images/tiles/hedge1.jpg',
  './images/tiles/floor_grass1.jpg',
  './images/tiles/floor_carpet1.jpg',
  './images/tiles/floor1.jpg',
  './images/tiles/light_brick1.jpg',
  './images/tiles/marble1.jpg',
  './images/tiles/concrete1.jpg',
  './images/tiles/rusted_steel1.jpg',
  './images/tiles/cliff1.jpg',
  './images/tiles/concrete_brick1.jpg',
  './images/tiles/concrete_brick2.jpg',
  './images/tiles/concrete_tile1.jpg',
  './images/tiles/concrete_tile2.jpg',
  './images/tiles/concrete_tile3.jpg',
  './images/tiles/concrete2.jpg',
  './images/tiles/dots1.jpg',
  './images/tiles/fresco1.jpg',
  './images/tiles/granite1.jpg',
  './images/tiles/plaster1.jpg',
  './images/tiles/rust1.jpg',
  './images/tiles/rust2.jpg',
  './images/tiles/stone2.jpg',
  './images/tiles/tile_blue1.jpg',
  './images/tiles/stripes_creamsicle1.jpg',
]

const sprites = [
  {
    // TODO: The type might be useless and ready for deprecation.
    type: 'prop',
    name: 'tree1',
    spritesheet: 'sprite__tree_1',
    pos: {
      x: 13,
      y: 10,
    },
    isAnimated: false,
    // If a sprite is multifaceted, it needs to have both a store of the locations of the 
    // textures for the various faces on the spritesheet and a separate key for direction (to calculate which
    // face to show based on player position).
    isMultifaceted: false,
    isSolid: true,
    // boundingBox is the radius from the center of the sprite that is impassable by collidable players and NPCs.
    boundingBox: .2,

    // EVERY sprite should have a defaultFace
    // defaultFace: [0,0],
    // The coordinates on the spritesheet image where the face starts.
    // On single faceted sprites, the image should be equal to the width and height.
    // faces: {
    // },
    // This is the pixels on the spritesheet to extract
    // // TODO: For now we are just going to focus on non-relative bounding boxes.
    // faceWidth: 100,
    // faceHeight: 100,
    // // This will be used to control the in-game scaling.
    // // But we still lack an in-world unit of measurement (except grid cells). This needs to be reconsidered.
    // spriteWidth: 1,
    // spriteHeight: 1,
  },
  {
    type: 'prop',
    name: 'tree2',
    spritesheet: 'sprite__tree_1',
    pos: {
      x: 12,
      y: 10.5,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: .2,
    verticalOffset: 1,
  },
  {
    type: 'prop',
    name: 'tree3',
    spritesheet: 'sprite__tree_2_low',
    pos: {
      x: 12.5,
      y: 10.7,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: .4,
  },
  {
    type: 'prop',
    name: 'tree4',
    spritesheet: 'sprite__tree_1',
    pos: {
      x: 12.75,
      y: 11.5,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: .2,
  },
  {
    type: 'prop',
    name: 'tree5',
    spritesheet: 'sprite__tree_1',
    pos: {
      x: 11.5,
      y: 12,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: .2,
  },
  {
    type: 'prop',
    name: 'tree6',
    spritesheet: 'sprite__palm_tree_1_high',
    pos: {
      x: 9.5,
      y: 10,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: .2,
    verticalOffset: .95,
  },
  {
    type: 'prop',
    name: 'spider-man1',
    spritesheet: 'sprite__spider-man_static_1',
    pos: {
      x: 12,
      y: 16,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: .35,
  },
  {
    type: 'prop',
    name: 'spider-man2',
    spritesheet: 'sprite__spider-man_static_1',
    pos: {
      x: 13,
      y: 16,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: .35,
    scale: .65,
    verticalOffset: .35,
    trigger: {
      type: 'showText',
      text: "Hi!\n\nRemember to always respect the hyphen!",
    }
  }
];


const tiles = [
  // {
  //   type: 'bokeh',
  //   name: 'bokeh_default',
  // },
  // {
  //   type: 'bokeh',
  //   name: 'bokeh_purple_on_tan',
  //   bokehSettings: {
  //     color: 'white',
  //     backgroundColor: 'orangered',
  //     dx: 1,
  //     dy: 10,
  //     density: 20,
  //     halfLife: 50,
  //     radius: 30,
  //     frameRate: 60,
  //   }
  // },
  // {
  //   type: 'bokeh',
  //   name: 'bokeh_purple_on_tan',
  //   bokehSettings: {
  //     color: 'purple',
  //     backgroundColor: 'white',
  //     dx: 10,
  //     dy: 5,
  //     density: 10,
  //     halfLife: 50,
  //     radius: 10,
  //     frameRate: 60,
  //   }
  // },
];

// A map needs 
// - a grid
// - a starting tile and direction
// - background colors

const MAP1 = {
  grid: [],
  playerPos: {
    x: 12.5,
    y: 22
  },
  playerDir: {
    x: 0,
    y: -1
  },
  playerPlane: {
    x: -0.66,
    Y: 0
  },
  sky: {
    textureType: 'image',
    textureConfig: {
      name: 'background__trees1'
    }
  },
  introText: {
    text: "Welcome!\n\nUse WASD to move and spacebar\nto interact with things.\n\n\nFeel free to walk around and enjoy the sights.\nMake yourself at home.\nJust don't look in the basement, ever.",
    displayLength: 3500,
  }
};

const DEV_MAP = {
  grid: [
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'color', textureConfig: { colorType: 'hex', color: 'AABB55'} },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'image', textureConfig: { name: 'default' } } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'color', textureConfig: { colorType: 'hex', color: '49426d'} } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'color', textureConfig: { colorType: 'hex', color: '49426d'} } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'color', textureConfig: { colorType: 'hex', color: '49426d'} } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' }, faces: { north: 2, south: 3, east: 4, west: 5 }},{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'color', textureConfig: { colorType: 'hex', color: '49426d'} } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'color', textureConfig: { colorType: 'hex', color: '49426d'} } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'color', textureConfig: { colorType: 'hex', color: '49426d'} } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, ceilingConfig: { textureType: 'color', textureConfig: { colorType: 'hex', color: '49426d'} } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'color', textureConfig: { colorType: 'hex', color: 'AABB55'} },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'light_brick1' } }],    
  ],
  player: {
    pos: {
      x: 2,
      y: 4.5,
    },
    dir: {
      x: 0,
      y: -1
    },
    plane: {
      x: -0.66,
      Y: 0
    },
  },
  sky: {
    textureType: 'gradient',
    textureConfig: {
      stops: [
        {
          stop: 0,
          color: "#7AA1D2"
        },
        {
          stop: .8,
          color: "#DBD4B4"
        },
        {
          stop: 1,
          color: "#CC95C0"
        }
      ],
    }
  },
}

const MAP2 = {
  grid: [],
  playerPos: {
    x: 18.5,
    y: 23
  },
  playerDir: {
    x: 0,
    y: -1
  },
  playerPlane: {
    x: -0.66,
    Y: 0
  },
  sky: {
    textureType: 'gradient',
    textureConfig: {
      stops: [
        {
          stop: 0,
          color: "#7AA1D2"
        },
        {
          stop: .8,
          color: "#DBD4B4"
        },
        {
          stop: 1,
          color: "#CC95C0"
        }
      ],
    }
  },
};

const MAP_TILETEST = {
  grid: [],
  playerPos: {
    x: 18.5,
    y: 23
  },
  playerDir: {
    x: 0,
    y: -1
  },
  playerPlane: {
    x: -0.66,
    Y: 0
  },
  sky: {
    textureType: 'gradient',
    textureConfig: {
      stops: [
        {
          stop: 0,
          color: "#7AA1D2"
        },
        {
          stop: .8,
          color: "#DBD4B4"
        },
        {
          stop: 1,
          color: "#CC95C0"
        }
      ],
    }
  },
};


const map = [
  DEV_MAP,
  MAP1,
  MAP_TILETEST,
  MAP2,
][0];

window.WAD = {
  map,
  tiles,
  sprites,
  textures,
}