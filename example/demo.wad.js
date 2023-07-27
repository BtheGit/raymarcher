import audioSpritemap from "./audio/sprites/spritemap.json" assert { type: "json" };
import SpriteScientist from "./images/sprites/scientist.json" assert { type: "json" };
import SpriteTree_1 from "./images/sprites/tree_1.json" assert { type: "json" };
import BananaMan from "./images/sprites/banana.json" assert { type: "json" };
import BlueCrystal from "./images/sprites/blue_crystal.json" assert { type: "json" };
import PurpleBall from "./images/sprites/purple_ball.json" assert { type: "json" };
import MagicShot from "./images/sprites/magic_shot.json" assert { type: "json" };
import GreenFlame from "./images/sprites/green_flame.json" assert { type: "json" };
import KoopaTroopa from "./images/sprites/koopa_troopa.json" assert { type: "json" };
import AnimatedWater1 from "./images/sprites/animated_water_1.json" assert { type: "json" };
import MagicHands from "./images/sprites/magic_hands.json" assert { type: "json" };
import MagicDust from "./images/sprites/magic_dust.json" assert { type: "json" };
import Bat from "./images/sprites/bat_1.json" assert { type: "json" };
import Pickups1 from "./images/sprites/pickups_1.json" assert { type: "json" };
import MusicPlayers from "./images/sprites/music_players.json" assert { type: "json" };

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

const sounds = {};

const textures = {
  background__clouds1: "./images/textures/background__clouds1.jpg",
  background__holographic_twilight_hills_sm:
    "./images/textures/background__holographic_twilight_hills_sm.jpg",
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
  brick_grass_edge: "./images/textures/retro_texture_pack_9/BRICK_3C.png",
};

const spriteDatas = [
  SpriteScientist,
  SpriteTree_1,
  BananaMan,
  BlueCrystal,
  PurpleBall,
  GreenFlame,
  KoopaTroopa,
  AnimatedWater1,
  MagicHands,
  MagicShot,
  MagicDust,
  Bat,
  Pickups1,
  MusicPlayers,
];

// const spriteMaps = spriteDatas.reduce((acc, curr) => {
//   acc[curr.meta.name] = curr;
//   return acc;
// }, {});

// Add spritesheets to textures (maybe we can just make this a texture again)
for (const spriteData of spriteDatas) {
  textures[spriteData.meta.name] = `./images/sprites/${spriteData.meta.image}`;
}

const animations = [
  // TODO: I haven't been smart enough to support static sprites/textures
  {
    name: "coin__idle",
    looping: true,
    frameDuration: 65,
    frames: [
      {
        frameId: "COINA",
        directions: 0,
      },
      {
        frameId: "COINB",
        directions: 0,
      },
      {
        frameId: "COINC",
        directions: 0,
      },
      {
        frameId: "COIND",
        directions: 0,
      },
      {
        frameId: "COINE",
        directions: 0,
      },
      {
        frameId: "COINF",
        directions: 0,
      },
      {
        frameId: "COING",
        directions: 0,
      },
      {
        frameId: "COINH",
        directions: 0,
      },
      {
        frameId: "COINI",
        directions: 0,
      },
      {
        frameId: "COINJ",
        directions: 0,
      },
      {
        frameId: "COINK",
        directions: 0,
      },
      {
        frameId: "COINL",
        directions: 0,
      },
      {
        frameId: "COINM",
        directions: 0,
      },
      {
        frameId: "COINN",
        directions: 0,
      },
      {
        frameId: "COINO",
        directions: 0,
      },
      {
        frameId: "COINP",
        directions: 0,
      },
    ],
  },
  {
    name: "scroll__idle",
    looping: true,
    frameDuration: 65,
    frames: [
      {
        frameId: "HRADA",
        directions: 0,
      },
      {
        frameId: "HRADB",
        directions: 0,
      },
      {
        frameId: "HRADC",
        directions: 0,
      },
      {
        frameId: "HRADD",
        directions: 0,
      },
      {
        frameId: "HRADE",
        directions: 0,
      },
      {
        frameId: "HRADF",
        directions: 0,
      },
      {
        frameId: "HRADG",
        directions: 0,
      },
      {
        frameId: "HRADH",
        directions: 0,
      },
      {
        frameId: "HRADI",
        directions: 0,
      },
      {
        frameId: "HRADJ",
        directions: 0,
      },
      {
        frameId: "HRADK",
        directions: 0,
      },
      {
        frameId: "HRADL",
        directions: 0,
      },
      {
        frameId: "HRADM",
        directions: 0,
      },
      {
        frameId: "HRADN",
        directions: 0,
      },
      {
        frameId: "HRADO",
        directions: 0,
      },
      {
        frameId: "HRADP",
        directions: 0,
      },
    ],
  },
  {
    name: "bat__idle",
    looping: true,
    frameDuration: 125,
    frames: [
      {
        frameId: "ABATA",
        directions: 8,
      },
    ],
  },
  {
    name: "bat__fly",
    looping: true,
    frameDuration: 125,
    frames: [
      {
        frameId: "ABATA",
        directions: 8,
      },
      {
        frameId: "ABATB",
        directions: 8,
      },
      {
        frameId: "ABATC",
        directions: 8,
      },
    ],
  },
  {
    name: "koopa_troopa__idle",
    looping: true,
    frameDuration: 125,
    frames: [
      {
        frameId: "MKOPA",
        directions: 8,
      },
    ],
  },
  {
    name: "koopa_troopa__walk",
    looping: true,
    frameDuration: 250,
    frames: [
      {
        frameId: "MKOPA",
        directions: 8,
      },
      {
        frameId: "MKOPB",
        directions: 8,
      },
      {
        frameId: "MKOPC",
        directions: 8,
      },
      {
        frameId: "MKOPD",
        directions: 8,
      },
    ],
  },
  {
    name: "koopa_troopa__shell",
    looping: true,
    frameDuration: 1000,
    frames: [
      {
        frameId: "SHLLA",
        directions: 8,
      },
    ],
  },
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
    name: "scientist__hit",
    looping: false,
    frameDuration: 1000,
    frames: [
      {
        frameId: "SCIENTIST__A",
        directions: 8,
      },
    ],
  },
  {
    name: "bananaman__stand",
    frames: [
      {
        frameId: "bananaman__STAND__A",
        directions: 8,
      },
    ],
    looping: false,
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
  {
    name: "magic_dust_portal",
    looping: true,
    frameDuration: 125,
    frames: [
      {
        frameId: "TSMKA",
        directions: 0,
      },
      {
        frameId: "TSMKB",
        directions: 0,
      },
      {
        frameId: "TSMKC",
        directions: 0,
      },
      {
        frameId: "TSMKD",
        directions: 0,
      },
      {
        frameId: "TSMKE",
        directions: 0,
      },
      {
        frameId: "TSMKF",
        directions: 0,
      },
      {
        frameId: "TSMKG",
        directions: 0,
      },
      {
        frameId: "TSMKH",
        directions: 0,
      },
      {
        frameId: "TSMKI",
        directions: 0,
      },
      {
        frameId: "TSMKJ",
        directions: 0,
      },
      {
        frameId: "TSMKK",
        directions: 0,
      },
      {
        frameId: "TSMKL",
        directions: 0,
      },
      {
        frameId: "TSMKM",
        directions: 0,
      },
      {
        frameId: "TSMKN",
        directions: 0,
      },
      {
        frameId: "TSMKO",
        directions: 0,
      },
      {
        frameId: "TSMKP",
        directions: 0,
      },
      {
        frameId: "TSMKQ",
        directions: 0,
      },
      {
        frameId: "TSMKR",
        directions: 0,
      },
      {
        frameId: "TSMKS",
        directions: 0,
      },
      {
        frameId: "TSMKT",
        directions: 0,
      },
      {
        frameId: "TSMKU",
        directions: 0,
      },
      {
        frameId: "TSMKV",
        directions: 0,
      },
      {
        frameId: "TSMKW",
        directions: 0,
      },
      {
        frameId: "TSMKX",
        directions: 0,
      },
      {
        frameId: "TSMKY",
        directions: 0,
      },
      {
        frameId: "TSMKZ",
        directions: 0,
      },
    ],
  },
  {
    name: "green_flame_default",
    looping: true,
    frameDuration: 125,
    frames: [
      {
        frameId: "TONWA",
        directions: 0,
      },
      {
        frameId: "TONWB",
        directions: 0,
      },
      {
        frameId: "TONWC",
        directions: 0,
      },
      {
        frameId: "TONWD",
        directions: 0,
      },
      {
        frameId: "TONWE",
        directions: 0,
      },
      {
        frameId: "TONWF",
        directions: 0,
      },
      {
        frameId: "TONWH",
        directions: 0,
      },
      {
        frameId: "TONWI",
        directions: 0,
      },
      {
        frameId: "TONWJ",
        directions: 0,
      },
      {
        frameId: "TONWK",
        directions: 0,
      },
      {
        frameId: "TONWL",
        directions: 0,
      },
      {
        frameId: "TONWM",
        directions: 0,
      },
      {
        frameId: "TONWN",
        directions: 0,
      },
      {
        frameId: "TONWO",
        directions: 0,
      },
      {
        frameId: "TONWP",
        directions: 0,
      },
    ],
  },
];

const textureAnimations = [
  {
    name: "anim_lava_1",
    animationType: "flat_warp",
    // Zero frameCount stops animation
    frameCount: 1,
    // frameDuration: 100,
    texture: "lava",
  },
  {
    name: "animated_water_1",
    animationType: "sprite",
    frames: [
      "animated_water_1__1",
      "animated_water_1__2",
      "animated_water_1__3",
      "animated_water_1__4",
      "animated_water_1__5",
      "animated_water_1__6",
      "animated_water_1__7",
      "animated_water_1__8",
      "animated_water_1__9",
      "animated_water_1__10",
      "animated_water_1__11",
      "animated_water_1__12",
      "animated_water_1__13",
      "animated_water_1__14",
      "animated_water_1__15",
      "animated_water_1__16",
    ],
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
    textureName: "brick_grass_edge",
  },
};

const map_1 = {
  settings: {},
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
      {
        type: "floor",
        accessible: false,
        texture: {
          type: "animatedTexture",
          textureName: "animated_water_1",
        },
      },
      {
        type: "floor",
        accessible: false,
        texture: {
          type: "animatedTexture",
          textureName: "animated_water_1",
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
      {
        type: "floor",
        accessible: false,
        texture: {
          type: "animatedTexture",
          textureName: "animated_water_1",
        },
      },
      {
        type: "floor",
        accessible: false,
        texture: {
          type: "animatedTexture",
          textureName: "animated_water_1",
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
    // TODO: Add gradients and colors for sky
    type: "texture",
    texture: {
      name: "background__holographic_twilight_hills_sm",
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
    rotation: 45,
    fov: 130,
    elevation: 0,
    walkSpeed: 0.003, // TODO: Uh, can I use less fractional units?
  },
  objects: [
    {
      transform: {
        position: {
          x: 5,
          y: 2.75,
        },
        rotation: 0,

        height: 32,
        elevation: 64,
      },
      actor: "Coin",
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "coin__idle",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
    },
    {
      transform: {
        position: {
          x: 5,
          y: 7,
        },
        rotation: 0,

        height: 32,
        elevation: 64,
      },
      actor: "Coin",
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "coin__idle",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
    },
    {
      transform: {
        position: {
          x: 5,
          y: 2.75,
        },
        rotation: 0,

        height: 32,
        elevation: 64,
      },
      actor: "Coin",
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "coin__idle",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
    },
    {
      transform: {
        position: {
          x: 5,
          y: 7.25,
        },
        rotation: 0,

        height: 32,
        elevation: 64,
      },
      actor: "Coin",
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "coin__idle",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
    },
    {
      transform: {
        position: {
          x: 5,
          y: 7.75,
        },
        rotation: 0,

        height: 32,
        elevation: 64,
      },
      actor: "Coin",
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "coin__idle",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
    },
    {
      transform: {
        position: {
          x: 7,
          y: 5,
        },
        rotation: 0,
        // scale: {
        //   x: 1,
        //   y: 1,
        // },
        height: 64,
        elevation: 0,
      },
      actor: "Prop",
      sprite: {
        name: "blue_crystal__A",
        directions: 8,
      },
      collider: {
        type: "aabb",
        radius: 0.8,
        width: 0.8,
        height: 0.8,
        solid: true,
      },
    },
    {
      transform: {
        position: {
          x: 5.5,
          y: 4.5,
        },
        rotation: 0,

        height: 256,
        elevation: 0,
      },
      actor: "Portal",
      initialState: "state__on",
      states: [
        {
          name: "state__on",
          animation: "magic_dust_portal",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
      audioSource: {
        name: "looping_groaning",
        looping: true,
        fullVolumeRadius: 1,
        anyVolumeRadius: 4,
        volume: 1,
        isPlaying: false,
      },
    },
    {
      transform: {
        position: {
          x: 5.5,
          y: 2.5,
        },
        rotation: 0,

        height: 192,
        elevation: 0,
      },
      actor: "Prop",
      initialState: "state__on",
      states: [
        {
          name: "state__on",
          animation: "green_flame_default",
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.8,
        width: 0.8,
        height: 0.8,
        solid: true,
      },
    },
    {
      transform: {
        position: {
          x: 20,
          y: 12,
        },
        rotation: 0,
        // scale: {
        //   x: 1,
        //   y: 1,
        // },
        height: 128,
        elevation: 0,
      },
      actor: "Prop",
      sprite: {
        name: "victorola",
        directions: 0,
      },
      collider: {
        type: "aabb",
        radius: 0.2,
        width: 0.1,
        height: 0.1,
        solid: true,
      },
      audioSource: {
        name: "ragtime_piano_2",
        looping: true,
        fullVolumeRadius: 0.5,
        anyVolumeRadius: 5,
        volume: 0.4,
        isPlaying: false,
      },
    },
    {
      transform: {
        position: {
          x: 3,
          y: 12,
        },
        rotation: 0,
        // scale: {
        //   x: 1,
        //   y: 1,
        // },
        height: 64,
        elevation: 0,
      },
      actor: "Prop",
      sprite: {
        name: "boombox",
        directions: 0,
      },
      collider: {
        type: "aabb",
        radius: 0.2,
        width: 0.1,
        height: 0.1,
        solid: true,
      },
      audioSource: {
        name: "disco_2",
        looping: true,
        fullVolumeRadius: 0.5,
        anyVolumeRadius: 5,
        volume: 0.4,
        isPlaying: false,
      },
    },
    {
      transform: {
        position: {
          x: 7,
          y: 3,
        },
        rotation: 0,
        // scale: {
        //   x: 1,
        //   y: 1,
        // },
        height: 256,
        elevation: 0,
      },
      actor: "Prop",
      sprite: {
        name: "tree_1__A",
        directions: 0,
      },
      collider: {
        type: "aabb",
        radius: 0.8,
        width: 0.8,
        height: 0.8,
        solid: true,
      },
    },
    {
      transform: {
        position: {
          x: 15,
          y: 20,
        },
        rotation: 0,
        height: 256,
        elevation: 0,
      },
      actor: "Prop",
      sprite: {
        name: "tree_1__A",
        directions: 0,
      },
      collider: {
        type: "aabb",
        radius: 0.8,
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
        height: 192,
        elevation: 0,
      },
      movementSettings: {
        walkSpeed: 0.001,
        runSpeed: 0.0015,
      },
      actor: "NPC",
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
        {
          name: "state__hit",
          animation: "scientist__hit",
        },
        {
          name: "state__swarm",
          animation: "scientist__default",
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.5,
        width: 0.5,
        height: 0.5,
        solid: true,
      },
      ai: {
        aiType: "DogFriendly",
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
        height: 192,
        elevation: 0,
      },
      movementSettings: {
        walkSpeed: 0.001,
        runSpeed: 0.0015,
      },
      actor: "NPC",
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
        {
          name: "state__hit",
          animation: "scientist__hit",
        },
        {
          name: "state__swarm",
          animation: "scientist__default",
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.5,
        width: 0.5,
        height: 0.5,
        solid: true,
      },
      ai: {
        aiType: "DogFriendly",
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
        height: 192,
        elevation: 0,
      },
      movementSettings: {
        walkSpeed: 0.003,
        runSpeed: 0.005,
      },
      actor: "NPC",
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
        {
          name: "state__hit",
          animation: "bananaman__stand",
          sound: {
            name: "pbjtime1",
          },
        },
        {
          name: "state__swarm",
          animation: "bananaman__walk",
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.4,
        width: 0.4,
        height: 0.4,
        solid: true,
      },
      ai: {
        aiType: "DogFriendly",
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
        height: 64,
        elevation: 0,
      },
      movementSettings: {
        walkSpeed: 0.0001,
        runSpeed: 0.0005,
      },
      actor: "NPC",
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
        {
          name: "state__hit",
          animation: "bananaman__stand",
          sound: {
            name: "pbjtime1",
          },
        },
        {
          name: "state__swarm",
          animation: "bananaman__walk",
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.4,
        width: 0.4,
        height: 0.4,
        solid: true,
      },
      ai: {
        aiType: "DogFriendly",
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
        height: 128,
        elevation: 0,
      },
      movementSettings: {
        walkSpeed: 0.001,
        runSpeed: 0.003,
      },
      actor: "NPC",
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
        {
          name: "state__hit",
          animation: "bananaman__stand",
          sound: {
            name: "pbjtime1",
          },
        },
        {
          name: "state__swarm",
          animation: "bananaman__walk",
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.4,
        width: 0.4,
        height: 0.4,
        solid: true,
      },
      ai: {
        aiType: "DogFriendly",
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
          y: 4,
        },
        rotation: 0,
        height: 128,
        elevation: 0,
      },
      movementSettings: {
        walkSpeed: 0.001,
        runSpeed: 0.002,
      },
      actor: "NPC",
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "koopa_troopa__idle",
        },
        {
          name: "state__wander",
          animation: "koopa_troopa__walk",
        },
        {
          name: "state__swarm",
          animation: "koopa_troopa__walk",
        },
        {
          name: "state__hit",
          animation: "koopa_troopa__shell",
          height: 64,
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.4,
        width: 0.4,
        height: 0.2,
        solid: true,
      },
      ai: {
        aiType: "DogFriendly",
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
  ],
};

const map_2 = {
  settings: {},
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
    // TODO: Add gradients and colors for sky
    type: "texture",
    texture: {
      name: "background__holographic_twilight_hills_sm",
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
    elevation: 0,
    walkSpeed: 0.003, // TODO: Uh, can I use less fractional units?
  },
  objects: [
    {
      transform: {
        position: {
          x: 8,
          y: 2.5,
        },
        rotation: 0,

        height: 256,
        elevation: 0,
      },
      actor: "Portal",
      initialState: "state__on",
      states: [
        {
          name: "state__on",
          animation: "magic_dust_portal",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.2,
        height: 0.8,
        solid: false,
      },
      audioSource: {
        name: "looping_groaning",
        looping: true,
        fullVolumeRadius: 1,
        anyVolumeRadius: 4,
        volume: 1,
        isPlaying: false,
      },
    },
    {
      transform: {
        position: {
          x: 5,
          y: 2.75,
        },
        rotation: 0,

        height: 32,
        elevation: 64,
      },
      bobbingMovement: {
        amplitude: 2,
        frequency: 0.4,
        initialElevation: 32,
      },
      actor: "Coin",
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "coin__idle",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
    },
    {
      transform: {
        position: {
          x: 3,
          y: 1.75,
        },
        rotation: 0,

        height: 64,
        elevation: 32,
      },
      bobbingMovement: {
        amplitude: 3,
        frequency: 0.5,
        initialElevation: 32,
      },
      actor: "Book",
      interactionDirectives: [
        {
          type: "ShowMessage",
          priority: 5,
          body: "What did the solipsist say when he\nbroke up with his girlfriend?",
        },
        {
          type: "ShowMessage",
          priority: 5,
          body: "It's not you, it's me.",
        },
      ],
      initialState: "state__idle",
      states: [
        {
          name: "state__idle",
          animation: "scroll__idle",
        },
      ],
      collider: {
        type: "aabb",
        width: 0.15,
        height: 0.8,
        solid: false,
      },
    },
    {
      transform: {
        position: {
          x: 4,
          y: 2,
        },
        rotation: 0,
        height: 64,
        elevation: 128,
      },
      movementSettings: {
        walkSpeed: 0.005,
        runSpeed: 0.008,
      },
      actor: "NPC",
      initialState: "state__idle",
      bobbingMovement: {
        amplitude: 4,
        frequency: 0.75,
        initialElevation: 128,
      },
      states: [
        {
          name: "state__idle",
          animation: "bat__idle",
          bobbingMovement: {
            amplitude: 4,
            frequency: 0.75,
          },
        },
        {
          name: "state__flee",
          animation: "bat__fly",
        },
        {
          name: "state__hit",
          animation: "bat__idle",
        },
      ],
      collider: {
        type: "aabb",
        radius: 0.4,
        width: 0.4,
        height: 0.4,
        solid: false,
      },
      ai: {
        aiType: "BirdSkittish",
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
  ],
};

const wadSettings = {
  firstMap: "map_1",
};

const wad = {
  textures,
  sounds,
  audioSpritemap,
  sprites: spriteDatas,
  animations,
  textureAnimations,
  wadSettings,
  maps: { map_1, map_2 },
};

export default wad;
