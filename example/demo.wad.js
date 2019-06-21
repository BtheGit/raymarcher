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
  './images/tiles/background_trees3.jpg',
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
  {
    type: 'image',
    name: 'floor_grass1',
    path: './images/tiles/floor_grass1.jpg',
  },
  {
    type: 'image',
    name: 'floor_carpet1',
    path: './images/tiles/floor_carpet1.jpg',
  },
  {
    type: 'image',
    name: 'floor2',
    path: './images/tiles/floor1.jpg',
  },
  {
    type: 'image',
    name: 'light_brick1',
    path: './images/tiles/light_brick1.jpg',
  },
  {
    type: 'image',
    name: 'marble1',
    path: './images/tiles/marble1.jpg',
  },
  {
    type: 'image',
    name: 'concrete1',
    path: './images/tiles/concrete1.jpg',
  },
  {
    type: 'image',
    name: 'rusted_steel1',
    path: './images/tiles/rusted_steel1.jpg',
  },
  {
    type: 'image',
    name: 'cliff1',
    path: './images/tiles/cliff1.jpg',
  },
  {
    type: 'image',
    name: 'hedge1',
    path: './images/tiles/hedge1.jpg',
  },
  {
    type: 'image',
    name: 'concrete_brick1',
    path: './images/tiles/concrete_brick1.jpg',
  },
  {
    type: 'image',
    name: 'concrete_brick2',
    path: './images/tiles/concrete_brick2.jpg',
  },
  {
    type: 'image',
    name: 'concrete_tile1',
    path: './images/tiles/concrete_tile1.jpg',
  },
  {
    type: 'image',
    name: 'concrete_tile2',
    path: './images/tiles/concrete_tile2.jpg',
  },
  {
    type: 'image',
    name: 'concrete_tile3',
    path: './images/tiles/concrete_tile3.jpg',
  },
  {
    type: 'image',
    name: 'concrete2',
    path: './images/tiles/concrete2.jpg',
  },
  {
    type: 'image',
    name: 'dots1',
    path: './images/tiles/dots1.jpg',
  },
  {
    type: 'image',
    name: 'fresco1',
    path: './images/tiles/fresco1.jpg',
  },
  {
    type: 'image',
    name: 'fur1',
    path: './images/tiles/fur1.jpg',
  },
  {
    type: 'image',
    name: 'fur2',
    path: './images/tiles/fur2.jpg',
  },
  {
    type: 'image',
    name: 'granite1',
    path: './images/tiles/granite1.jpg',
  },
  {
    type: 'image',
    name: 'alien1',
    path: './images/tiles/alien1.jpg',
  },
  {
    type: 'image',
    name: 'alien2',
    path: './images/tiles/alien2.jpg',
  },
  {
    type: 'image',
    name: 'alien3',
    path: './images/tiles/alien3.jpg',
  },
  {
    type: 'image',
    name: 'plaster1',
    path: './images/tiles/plaster1.jpg',
  },
  {
    type: 'image',
    name: 'rust1',
    path: './images/tiles/rust1.jpg',
  },
  {
    type: 'image',
    name: 'rust2',
    path: './images/tiles/rust2.jpg',
  },
  {
    type: 'image',
    name: 'stone2',
    path: './images/tiles/stone2.jpg',
  },
  {
    type: 'image',
    name: 'stripes_creamsicle1',
    path: './images/tiles/stripes_creamsicle1.jpg',
  },
  {
    type: 'image',
    name: 'tile_blue1',
    path: './images/tiles/tile_blue1.jpg',
  },
  {
    type: 'image',
    name: 'brendan_bald1',
    path: './images/tiles/me1.png',
  },
  {
    type: 'image',
    name: 'bokehfy1',
    path: './images/projects/bokehfy1.png'
  },
  {
    type: 'image',
    name: 'breakout1',
    path: './images/projects/breakout1.png'
  },
  {
    type: 'image',
    name: 'dd1',
    path: './images/projects/doodledetectives1.png'
  },
  {
    type: 'image',
    name: 'local_places1',
    path: './images/projects/localplaces1.jpg'
  },
  {
    type: 'image',
    name: 'sortable_tables1',
    path: './images/projects/sortabletables1.jpg'
  },
  {
    type: 'image',
    name: "tetris1",
    path: './images/projects/tetris1.png'
  },
  {
    type: 'link-image',
    name: 'link_github_personal',
    href: 'https://github.com/BtheGit',
    path: './images/tiles/github_logo1.png',
  },
  {
    type: 'image',
    name: "background_trees1",
    path: './images/tiles/background_trees3.jpg',
  },
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
  grid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,4,0,4,4,4,0,4,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,0,{ type: 'floor', texture: 1, },0,0,0,0,0,4,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
    [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,4,4,4,4,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,0,0,{ type: 'wall', texture: 3, faces: { north: 10, south: 11, east: 6, west: 15 }},0,3,3,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,2,2,2,2,2,2,12,2],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
    [1,0,0,0,0,0,0,0,3,3,0,3,{type: 'floor', texture: 13, ceiling: { texture: 13 } },3,0,3,2,0,0,2,0,2,0,2],
    [1,0,0,0,0,0,0,0,1,14,0,6,{type: 'floor', texture: 13, ceiling: { texture: 13 } },6,0,1,2,0,0,0,0,2,0,2],
    [1,0,0,0,0,0,0,0,14,{type: 'floor', texture: 13, ceiling: { texture: 13 } },{type: 'floor', texture: 11, ceiling: { texture: 11 } },{type: 'floor', texture: 11, ceiling: { texture: 11 } },{type: 'floor', texture: 11, ceiling: { texture: 11 } },{type: 'floor', texture: 11, ceiling: { texture: 11 } },0,0,1,2,0,0,0,2,0,2],
    [1,0,0,0,0,0,0,0,14,{type: 'floor', texture: 13, ceiling: { texture: 13 } },14,7,{ type: 'floor', texture: 7, ceiling: { texture: 7 } },7,0,0,0,1,2,2,2,2,0,2],
    [1,0,0,0,0,0,0,0,0,14,1,7,{ type: 'floor', texture: 7, ceiling: { texture: 7 } },7,0,0,0,0,1,1,1,2,0,2],
    [1,0,0,0,0,0,0,0,0,1,1,7,{ type: 'floor', texture: 7, ceiling: { texture: 7 } },7,1,0,0,0,0,0,0,0,0,11],
    [1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,1]  
  ],
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
  skyTexture: 'background_trees3',
  skyGradient: [
    {
      stop: 0,
      color: "purple"
    },
    {
      stop: 1,
      color: "red"
    },
  ],
  introText: {
    text: "Welcome!\n\nUse WASD to move and spacebar\nto interact with things.\n\n\nFeel free to walk around and enjoy the sights.\nMake yourself at home.\nJust don't look in the basement, ever.",
    displayLength: 3500,
  }
};

const NEW_MAP = {
  grid: [
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } }],
    [{ type: 'wall', textureType: 'color', textureConfig: { colorType: 'hsl', color: { h: 100 } } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'floor', textureType: 'image', textureConfig: { name: 'default' }, },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } }],
    [{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } },{ type: 'wall', textureType: 'image', textureConfig: { name: 'default' } }],
  ],
  playerPos: {
    x: 3,
    y: 3,
  },
  playerDir: {
    x: 0,
    y: -1
  },
  playerPlane: {
    x: -0.66,
    Y: 0
  },
  skyGradient: [
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

const MAP2 = {
  grid: [
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
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,0,0,0,0,5],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,0,0,0,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,5,0,0,5,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,5,0,5,5,5,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,0,5,0,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,5,0,5,5,5,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,5,5,5,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,5,5,5,0,5,5,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,7,1,1,5,0,5,1,6,1,1],  
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1]  
  ],
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
  skyGradient: [
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
};

const MAP_TILETEST = {
  grid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,39,0,0,0,0,0,0,36,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,38,0,0,0,0,0,0,35,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,0,0,0,37,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,34,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,33,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,32,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,31,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,30,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,29,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,28,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,27,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,26,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,25,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,24,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,23,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,22,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,34,3,0,0,21,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,20,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  
  ],
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
  skyGradient: [
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
};


const map = [
  NEW_MAP,
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