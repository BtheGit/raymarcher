import SpriteScientist from "./images/sprites/scientist.json" assert { type: "json" };
import SpriteTree_1 from "./images/sprites/tree_1.json" assert { type: "json" };

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

const sprites_old = [
  {
    // TODO: The type might be useless and ready for deprecation.
    type: "prop",
    name: "tree1",
    spritesheet: "sprite__tree_1",
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
    boundingBox: 0.2,

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
    type: "prop",
    name: "tree2",
    spritesheet: "sprite__tree_1",
    pos: {
      x: 12,
      y: 10.5,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: 0.2,
    verticalOffset: 1,
  },
  {
    type: "prop",
    name: "tree3",
    spritesheet: "sprite__tree_2_low",
    pos: {
      x: 12.5,
      y: 10.7,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: 0.4,
  },
  {
    type: "prop",
    name: "tree4",
    spritesheet: "sprite__tree_1",
    pos: {
      x: 12.75,
      y: 11.5,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: 0.2,
  },
  {
    type: "prop",
    name: "tree5",
    spritesheet: "sprite__tree_1",
    pos: {
      x: 11.5,
      y: 12,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: 0.2,
  },
  {
    type: "prop",
    name: "tree6",
    spritesheet: "sprite__palm_tree_1_high",
    pos: {
      x: 9.5,
      y: 10,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: 0.2,
    verticalOffset: 0.95,
  },
  {
    type: "prop",
    name: "spider-man1",
    spritesheet: "sprite__spider-man_static_1",
    pos: {
      x: 12,
      y: 16,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: 0.35,
  },
  {
    type: "prop",
    name: "spider-man2",
    spritesheet: "sprite__spider-man_static_1",
    pos: {
      x: 13,
      y: 16,
    },
    isAnimated: false,
    isMultifaceted: false,
    isSolid: true,
    boundingBox: 0.35,
    scale: 0.65,
    verticalOffset: 0.35,
    trigger: {
      type: "showText",
      text: "Hi!\n\nRemember to always respect the hyphen!",
    },
  },
];

// Maybe we don't need to define textures and animated textures separately? We'll see. Once we get back to par...
// Probably would be useful to have texture dimensions here too.  So really a loader that reads from the directory
// then generates this would be great since it would approximate an editor experience (which is what is really missing at this point).

const textures = {
  background__trees1: "./images/textures/background__trees1.jpg",
  hedge1: "./images/textures/hedge1.jpg",
  floor_grass1: "./images/textures/floor_grass1.jpg",
  floor_carpet1: "./images/textures/floor_carpet1.jpg",
  floor1: "./images/textures/floor1.jpg",
  light_brick1: "./images/textures/light_brick1.jpg",
  marble1: "./images/textures/marble1.jpg",
  concrete1: "./images/textures/concrete1.jpg",
  rusted_steel1: "./images/textures/rusted_steel1.jpg",
  cliff1: "./images/textures/cliff1.jpg",
  concrete_brick1: "./images/textures/concrete_brick1.jpg",
  concrete_brick2: "./images/textures/concrete_brick2.jpg",
  concrete_tile1: "./images/textures/concrete_tile1.jpg",
  concrete_tile2: "./images/textures/concrete_tile2.jpg",
  concrete_tile3: "./images/textures/concrete_tile3.jpg",
  concrete2: "./images/textures/concrete2.jpg",
  dots1: "./images/textures/dots1.jpg",
  fresco1: "./images/textures/fresco1.jpg",
  granite1: "./images/textures/granite1.jpg",
  plaster1: "./images/textures/plaster1.jpg",
  rust1: "./images/textures/rust1.jpg",
  rust2: "./images/textures/rust2.jpg",
  stone2: "./images/textures/stone2.jpg",
  tile_blue1: "./images/textures/tile_blue1.jpg",
  stripes_creamsicle1: "./images/textures/stripes_creamsicle1.jpg",
  // sprite__tree_1: "./images/sprites/sprite__tree_1.png",
  // sprite__tree_2: "./images/sprites/sprite__tree_2.png",
  // scientist: "./images/sprites/scientist.png",
};

const sprites = [SpriteScientist, SpriteTree_1];

const spriteMaps = sprites.reduce((acc, curr) => {
  acc[curr.meta.name] = curr;
  return acc;
}, {});

// Add spritesheets to textures
for (const sprite of sprites) {
  textures[sprite.meta.name] = `./images/sprites/${sprite.meta.image}`;
}

// TODO: Dynamically determining frames for animations based on naming system (doom is as good as any I guess, If i'm gonna use assets from those wads anyway). Right now I'm going to manually build the arrays just to save brain power and get more hands on.

// const sprites = {
// };

const floor_default = {
  type: "floor",
  texture: {
    type: "texture",
    textureName: "default",
  },
};

const wall_default = {
  type: "wall",
  texture: {
    type: "texture",
    textureName: "light_brick1",
  },
};

const wad = {
  textures,
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
          texture: {
            type: "texture",
            textureName: "marble1",
          },
          ceiling: {
            type: "texture",
            textureName: "marble1",
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
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
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
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        floor_default,
        {
          type: "floor",
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
          // faces: [],
        },
        {
          type: "floor",
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
      rotation: 30,
      fov: 130,
    },
    objects: [
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
          texture: "sprite__tree_1",
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
          texture: "sprite__tree_1",
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
        sprite: {
          texture: "scientist",
        },
        state: "idle",
        animation: {
          animations: {
            idle: {
              name: "idle",
              duration: 80,
              frames: {
                0: ["SCZAA1", "SCZAA2"],
              },
            },
          },
          currentAnimation: "idle",
          currentFrame: 0,
        },
      },
    ],
  },
};

export default wad;
