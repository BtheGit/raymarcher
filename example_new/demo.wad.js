import SpriteScientist from "./images/sprites/scientist.json" assert { type: "json" };
import SpriteTree_1 from "./images/sprites/tree_1.json" assert { type: "json" };
import BananaMan from "./images/sprites/banana.json" assert { type: "json" };
import BlueCrystal from "./images/sprites/blue_crystal.json" assert { type: "json" };
import PurpleBall from "./images/sprites/purple_ball.json" assert { type: "json" };

// We can explore preprocessing these files so the full gridCell objects don't have to be built, instead a function perhaps.

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

// Maybe we don't need to define textures and animated textures separately? We'll see. Once we get back to par...
// Probably would be useful to have texture dimensions here too.  So really a loader that reads from the directory
// then generates this would be great since it would approximate an editor experience (which is what is really missing at this point).

const textures = {
  background__trees1: "./images/textures/background__trees1.jpg",
  grass1: "./images/textures/retro_texture_pack_9/GRASS_1A.png",
  // hedge1: "./images/textures/hedge1.jpg",
  // floor_grass1: "./images/textures/floor_grass1.jpg",
  // floor_carpet1: "./images/textures/floor_carpet1.jpg",
  // floor1: "./images/textures/floor1.jpg",
  light_brick1: "./images/textures/light_brick1_sm.jpg",
  // marble1: "./images/textures/marble1.jpg",
  // concrete1: "./images/textures/concrete1.jpg",
  // rusted_steel1: "./images/textures/rusted_steel1.jpg",
  // cliff1: "./images/textures/cliff1.jpg",
  // concrete_brick1: "./images/textures/concrete_brick1.jpg",
  // concrete_brick2: "./images/textures/concrete_brick2.jpg",
  // concrete_tile1: "./images/textures/concrete_tile1.jpg",
  // concrete_tile2: "./images/textures/concrete_tile2.jpg",
  // concrete_tile3: "./images/textures/concrete_tile3.jpg",
  // concrete2: "./images/textures/concrete2.jpg",
  dots1: "./images/textures/dots1_sm.jpg",
  // fresco1: "./images/textures/fresco1.jpg",
  // granite1: "./images/textures/granite1.jpg",
  // plaster1: "./images/textures/plaster1.jpg",
  // rust1: "./images/textures/rust1.jpg",
  // rust2: "./images/textures/rust2.jpg",
  // stone2: "./images/textures/stone2.jpg",
  // tile_blue1: "./images/textures/tile_blue1.jpg",
  // stripes_creamsicle1: "./images/textures/stripes_creamsicle1.jpg",
  lava: "./images/textures/lava.png",
  sparkle: "./images/textures/sparkle.png",
};

const spriteDatas = [
  SpriteScientist,
  SpriteTree_1,
  BananaMan,
  BlueCrystal,
  PurpleBall,
];

const spriteMaps = spriteDatas.reduce((acc, curr) => {
  acc[curr.meta.name] = curr;
  return acc;
}, {});

// Add spritesheets to textures (maybe we can just make this a texture again)
for (const spriteData of spriteDatas) {
  textures[spriteData.meta.name] = `./images/sprites/${spriteData.meta.image}`;
}

const animations = [
  // TODO: I haven't been smart enough to support static sprites/textures
  {
    name: "scientist__default",
    frames: [
      {
        frameId: "SCIENTIST__A",
        directions: 8,
      },
      {
        frameId: "SCIENTIST__B",
        directions: 8,
      },
      {
        frameId: "SCIENTIST__C",
        directions: 8,
      },
      {
        frameId: "SCIENTIST__D",
        directions: 8,
      },
    ],
    looping: true,
    frameDuration: 200,
    // Animation duration?
  },
  {
    name: "bananaman__stand",
    frames: [
      {
        frameId: "bananaman__STAND__A",
        directions: 8,
      },
    ],
    looping: true,
    frameDuration: 1000,
  },
  {
    name: "bananaman__wait",
    frames: [
      {
        frameId: "bananaman__WAIT__A",
        directions: 8,
      },
      {
        frameId: "bananaman__WAIT__B",
        directions: 8,
      },
    ],
    looping: true,
    frameDuration: 200,
  },
  {
    name: "bananaman__walk",
    frames: [
      {
        frameId: "bananaman__WALK__A",
        directions: 8,
      },
      {
        frameId: "bananaman__WALK__B",
        directions: 8,
      },
      {
        frameId: "bananaman__WALK__C",
        directions: 8,
      },
      {
        frameId: "bananaman__WALK__D",
        directions: 8,
      },
      {
        frameId: "bananaman__WALK__E",
        directions: 8,
      },
      {
        frameId: "bananaman__WALK__F",
        directions: 8,
      },
      {
        frameId: "bananaman__WALK__G",
        directions: 8,
      },
      {
        frameId: "bananaman__WALK__H",
        directions: 8,
      },
    ],
    looping: true,
    frameDuration: 125,
  },
];

const textureAnimations = [
  {
    name: "anim_lava_1",
    animationType: "flat_warp",
    frameCount: 10,
    // frameDuration: 100,
    texture: "lava",
  },
];

// TODO: Dynamically determining frames for animations based on naming system (doom is as good as any I guess, If i'm gonna use assets from those wads anyway). Right now I'm going to manually build the arrays just to save brain power and get more hands on.

// const sprites = {
// };

const floor_default = {
  type: "floor",
  accessible: true,
  texture: {
    // type: "color",
    // color: {
    //   r: 0,
    //   g: 0,
    //   b: 200,
    // },
    type: "texture",
    textureName: "grass1",
  },
};

const wall_default = {
  type: "wall",
  accessible: false,
  texture: {
    // type: "color",
    // color: {
    //   r: 50,
    //   g: 200,
    //   b: 200,
    // },
    type: "texture",
    textureName: "light_brick1",
  },
};

const objects = [
  {
    transform: {
      position: {
        x: 7,
        y: 5,
      },
      rotation: 0,
      scale: {
        x: 1,
        y: 1,
      },
    },
    sprite: {
      name: "blue_crystal__A",
      directions: 8,
    },
    collider: {
      type: "aabb",
      width: 0.8,
      height: 0.8,
      solid: true,
    },
    // If no state, then no animation (default state)
  },
  {
    transform: {
      position: {
        x: 7,
        y: 3,
      },
      rotation: 0,
      scale: {
        x: 1,
        y: 1,
      },
    },
    sprite: {
      name: "tree_1__A",
      directions: 0,
    },
    collider: {
      type: "aabb",
      width: 0.8,
      height: 0.8,
      solid: true,
    },
    // If no state, then no animation (default state)
  },
  {
    transform: {
      position: {
        x: 15,
        y: 20,
      },
      rotation: 0,
      scale: {
        x: 1,
        y: 1,
      },
    },
    sprite: {
      name: "tree_1__A",
      directions: 0,
    },
    collider: {
      type: "aabb",
      width: 0.8,
      height: 0.8,
      solid: true,
    },
  },
  {
    transform: {
      position: {
        x: 10,
        y: 10,
      },
      rotation: 90,
      scale: {
        x: 1,
        y: 1,
      },
    },
    initialState: "state__idle",
    states: [
      {
        name: "state__idle",
        animation: "scientist__default",
      },
      {
        name: "state__wander",
        animation: "scientist__default",
      },
    ],
    collider: {
      type: "aabb",
      width: 0.5,
      height: 0.5,
      solid: true,
    },
    ai: {
      aiType: "dog_friendly",
      playRadius: 1,
      swarmRadius: 5,
      idleDurationRange: [1, 3],
      idleTimer: 0,
      seekTarget: {
        target: null,
      },
      seekPath: {
        path: null,
        currentIndex: 0,
      },
    },
  },
  {
    transform: {
      position: {
        x: 6,
        y: 8,
      },
      rotation: 120,
      scale: {
        x: 1,
        y: 1,
      },
    },
    initialState: "state__idle",
    states: [
      {
        name: "state__idle",
        animation: "scientist__default",
      },
      {
        name: "state__wander",
        animation: "scientist__default",
      },
    ],
    collider: {
      type: "aabb",
      width: 0.5,
      height: 0.5,
      solid: true,
    },
    ai: {
      aiType: "dog_friendly",
      playRadius: 1,
      swarmRadius: 5,
      idleDurationRange: [1, 3],
      idleTimer: 0,
      seekTarget: {
        target: null,
      },
      seekPath: {
        path: null,
        currentIndex: 0,
      },
    },
  },
  {
    transform: {
      position: {
        x: 5,
        y: 7,
      },
      rotation: 215,
      scale: {
        x: 1,
        y: 1,
      },
    },
    initialState: "state__idle",
    states: [
      {
        name: "state__idle",
        animation: "bananaman__wait",
      },
      {
        name: "state__wander",
        animation: "bananaman__walk",
      },
    ],
    collider: {
      type: "aabb",
      width: 0.4,
      height: 0.4,
      solid: true,
    },
    ai: {
      aiType: "dog_friendly",
      playRadius: 1,
      swarmRadius: 5,
      idleDurationRange: [1, 3],
      idleTimer: 0,
      seekTarget: {
        target: null,
      },
      seekPath: {
        path: null,
        currentIndex: 0,
      },
    },
  },
  {
    transform: {
      position: {
        x: 6,
        y: 10,
      },
      rotation: 0,
      scale: {
        x: 1,
        y: 1,
      },
    },
    initialState: "state__idle",
    states: [
      {
        name: "state__idle",
        animation: "bananaman__wait",
      },
      {
        name: "state__wander",
        animation: "bananaman__walk",
      },
    ],
    collider: {
      type: "aabb",
      width: 0.4,
      height: 0.4,
      solid: true,
    },
    ai: {
      aiType: "dog_friendly",
      playRadius: 1,
      swarmRadius: 5,
      idleDurationRange: [1, 3],
      idleTimer: 0,
      seekTarget: {
        target: null,
      },
      seekPath: {
        path: null,
        currentIndex: 0,
      },
    },
  },
  {
    transform: {
      position: {
        x: 4,
        y: 3,
      },
      rotation: 0,
      scale: {
        x: 1,
        y: 1,
      },
    },
    initialState: "state__idle",
    states: [
      {
        name: "state__idle",
        animation: "bananaman__wait",
      },
      {
        name: "state__wander",
        animation: "bananaman__walk",
      },
    ],
    collider: {
      type: "aabb",
      width: 0.4,
      height: 0.4,
      solid: true,
    },
    ai: {
      aiType: "dog_friendly",
      playRadius: 1,
      swarmRadius: 5,
      idleDurationRange: [1, 3],
      idleTimer: 0,
      seekTarget: {
        target: null,
      },
      seekPath: {
        path: null,
        currentIndex: 0,
      },
    },
  },
];

const wad = {
  textures,
  sprites: spriteDatas,
  animations,
  textureAnimations,
  map: {
    grid: [
      [
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        {
          type: "floor",
          accessible: false,
          texture: {
            type: "texture",
            textureName: "sparkle",
          },
          ceiling: {
            type: "texture",
            textureName: "sparkle",
          },
        },
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        {
          type: "floor",
          accessible: false,
          texture: {
            type: "animatedTexture",
            textureName: "anim_lava_1",
          },
        },
        {
          type: "floor",
          accessible: false,
          texture: {
            type: "animatedTexture",
            textureName: "anim_lava_1",
          },
        },
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        {
          type: "floor",
          accessible: false,
          texture: {
            type: "animatedTexture",
            textureName: "anim_lava_1",
          },
        },
        {
          type: "floor",
          accessible: false,
          texture: {
            type: "animatedTexture",
            textureName: "anim_lava_1",
          },
        },
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        {
          type: "wall",
          texture: {
            type: "texture",
            textureName: "light_brick1",
          },
          wallFaces: [
            {
              wallFace: "north",
              surface: "texture",
              texture: {
                name: "dots1",
              },
            },
          ],
        },
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        {
          type: "floor",
          accessible: true,
          texture: {
            type: "texture",
            textureName: "default",
          },
          ceiling: {
            type: "texture",
            textureName: "default",
          },
        },
        floor_default,
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        wall_default,
      ],
      [
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
        wall_default,
      ],
    ],
    sky: {
      // TODO: Only support texture right now for everything
      type: "texture",
      texture: {
        name: "background__trees1",
      },
      color: "#7AA1D2",
      gradient: {
        stops: [
          {
            stop: 0,
            color: "#7AA1D2",
          },
          {
            stop: 0.8,
            color: "#DBD4B4",
          },
          {
            stop: 1,
            color: "#CC95C0",
          },
        ],
      },
    },
    start: {
      position: {
        x: 2,
        y: 2.5,
      },
      rotation: 0,
      fov: 130,
    },
    objects,
  },
};

export default wad;
