import SingletonInputSystem from "./systems/SingletonInputSystem";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem";
import { RaycasterSystem } from "./systems/RaycasterSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { ECS } from "./utils/ECS/ECS";
import {
  Vector,
  directionVectorFromRotation,
  planeVectorFromRotation,
  toRadians,
} from "./utils/math";
import { TextureManager } from "./TextureManager/TextureManager";
import { GridManager } from "./GridManager/GridManager";
import {
  FloorTileComponent,
  GameSettingsEntity,
  GridTileEntity,
  ObjectEntity,
  PlayerEntity,
  SkyboxEntity,
} from "./raymarcher";
import { EventManager } from "./EventManager/EventManager";
import { AnimationSystem } from "./systems/AnimationSystem";
import { SpriteManager } from "./SpriteManager/SpriteManager";

const DEFAULT_SETTINGS = {
  width: 1024,
  height: 768,
  canvasId: "raymarcher-display",
};

// TODO: Default Wad

const main = async (wad, settings = DEFAULT_SETTINGS) => {
  const ecs = new ECS();
  const textureManager = new TextureManager();
  const spriteManager = new SpriteManager(textureManager);
  const gridManager = new GridManager(ecs);

  // I don't love the idea of modeling everything as an entity, but since it's easier to revert that than implement it... yolo.
  const gameSettingsEntity: GameSettingsEntity = {
    gameSettings: {
      width: settings.width,
      height: settings.height,
      canvasId: settings.canvasId,
    },
  };

  ecs.entityManager.add(gameSettingsEntity);

  // TODO: Load all texture and sprite image resources from the wad (containing file paths)
  const textureMap: { [key: string]: string } = wad.textures ?? [];

  // TODO: Blocking texture load for now just in case there are issues with lazy loading.
  // First minor optimization can be going through the map grid and seeing all referenced textures and only loading those.
  // Sprites will also be textures...
  await Promise.allSettled(
    Object.entries(textureMap).map(([key, path]) => {
      return textureManager.loadTexture(key, path);
    })
  );

  wad.sprites.forEach((spriteData) => spriteManager.loadSprites(spriteData));

  // TODO: Type the wad files.
  type GridCell = {
    type: "floor" | "wall";
    texture: {
      type: "texture";
      textureName?: string;
    };
    ceiling?: {
      type: "texture";
      textureName?: string;
    };
    faces?: [];
  };
  // TODO: Some kind of default fallback map and textures.
  const grid: GridCell[][] = wad.map.grid!;
  // Loop through the map and add all the grid locations as entities. We need a grid location entity factory
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const gridCell = grid[y][x];
      const { type, texture, ceiling, faces } = gridCell;

      const entity: GridTileEntity = {
        type,
        gridLocation: { x, y },
        // We are cheating the radius for now. We'll have to figure out how to model this properly since grid locations work differently.
      };

      // TODO: Allow floor types to be collidable.
      if (type === "wall") {
        // NOTE: Radius is arbitrary since we'll process this differently (fingers crossed).
        entity.collision = { radius: 1 };
      }

      if (type === "floor") {
        entity.floorTile = {
          surface: texture.type,
          texture: { name: texture.textureName! },
        };

        if (ceiling) {
          entity.floorTile.ceiling = {
            surface: ceiling.type,
            texture: { name: ceiling.textureName! },
          };
        }
      } else if (type === "wall") {
        entity.wallTile = {
          surface: texture.type,
          texture: { name: texture.textureName! },
        };

        // TODO: Faces
      }

      gridManager.addEntity(entity);
    }
  }

  // TODO: We'll hard code the sky in the renderer until we figure out how to model that.

  // ## Player/CAMERA
  const startingPosition = wad.map.start;
  const fovRadians = toRadians(startingPosition.fov);
  const fov = Math.abs(Math.atan(fovRadians));
  const direction = directionVectorFromRotation(
    startingPosition.rotation
  ).scale(fov);
  const plane = planeVectorFromRotation(startingPosition.rotation);
  const playerEntity: PlayerEntity = {
    camera: {
      inverseDeterminate: 1.0 / (plane.x * direction.y - direction.x * plane.y),
      fov: fov,
    },
    userControl: {
      isControlled: true,
    },
    position: new Vector(
      startingPosition.position.x,
      startingPosition.position.y
    ),
    direction,
    plane,
    // rotation: startingPosition.rotation,
    collision: { radius: 1 },
    collisionResult: {
      collidedWith: [],
    },
    // For now velocity is not used
    velocity: new Vector(0, 0),
    // TODO: Use movement speed to port old code.
    // FUTURE: Just change velocity with keys and let collision detection reconcile movement?
    movement: {
      walkSpeed: 0.15,
      rotationSpeed: 0.12,
    },
    state: {
      isStanding: true,
      isWalking: false,
    },
  };
  ecs.entityManager.add(playerEntity);

  // ## Objects and NPCS
  // TODO:
  // NOTE: Textures are not added to the wad with dimensions. That is a mistake and with an editor would be fine. So we load the boot process and get all those values now. (We ignored it for tiles since those would always be the same size and stretched.)
  type MapObject = {
    transform: {
      position: {
        x: number;
        y: number;
      };
      rotation: number;
      scale: {
        x: number;
        y: number;
      };
    };
    texture?: string;
    state?: string;
    animation?: {
      animations: {
        [key: string]: {
          name: string;
          duration: number;
          frames: string[];
          directions: 0 | 8;
        };
      };
      currentAnimation: string;
      currentFrame: number;
    };
  };
  const objects: MapObject[] = wad.map.objects ?? [];
  objects.forEach((object) => {
    const { transform, texture, state, animation } = object;

    const objectEntity: ObjectEntity = {
      transform: {
        position: new Vector(transform.position.x, transform.position.y),
        // TODO: Deprecate roation if the math is more work
        rotation: transform.rotation,
        direction: directionVectorFromRotation(transform.rotation),
        scale: new Vector(transform.scale.x, transform.scale.y),
      },
      // TODO: I don't really think objects should directly reference a spritesheet texture now, since they could reference multiple sheets.
      // sprite: {
      //   texture: sprite.texture,
      //   // TODO: Not sure dimensions are helpful since this is the entire spritesheet, not the object or a frame.
      //   width: textureDimensions.width,
      //   height: textureDimensions.height,
      // },
    };

    if (texture) {
      objectEntity.texture = {
        name: texture,
      };
    }

    // TODO: There may be a case for state without animations, but never animations without state.
    if (state) {
      objectEntity.state = {
        currentState: state,
      };

      if (animation) {
        objectEntity.animation = {
          ...animation,
          timeSinceLastFrame: 0,
        };
      }
    }

    ecs.entityManager.add(objectEntity);
  });

  const UserInputSystem = SingletonInputSystem.getInstance();

  ecs.systems.add(new PlayerControllerSystem(ecs, UserInputSystem));

  // TODO:
  // Once again, I don't know the ideal way to separate concerns here (without huge time overhead for good event stuff), so I'm going to short term undo all my good efforts and hard connect systems. Namely the renderer and the raycaster in this case. In fact, until I get smarter, they really shouldn't be two systems at all. But oh well, the renderer will at least have other concerns like text and a HUD that have nothing to do with raycasting. So I'm going to make a very fake eventBus to pass stuff along short term.
  const eventManager = new EventManager();
  ecs.systems.add(
    new RaycasterSystem(gridManager, eventManager, playerEntity, settings.width)
  );

  ecs.systems.add(new AnimationSystem(ecs));

  // Once again, we're cheating a bit to avoid extra lookups until we have a better ECS system. I'm going to persist a skybox reference here.
  const skyboxEntity: SkyboxEntity = {
    skybox: {
      surface: wad.map.sky.type,
      texture: wad.map.sky.texture,
    },
  };

  ecs.entityManager.add(skyboxEntity);

  ecs.systems.add(
    new RenderSystem(
      ecs,
      gameSettingsEntity,
      textureManager,
      spriteManager,
      gridManager,
      eventManager,
      playerEntity,
      skyboxEntity
    )
  );

  // TODO: Performance.now gives me ever increasing numbers versus the delta between times, which I need for modifying calculations between frames.
  let lastTime = Date.now(); // performance.now();
  const tick = () => {
    /* Determine deltatime */
    const time = Date.now(); // performance.now();
    const dt = time - lastTime; // / 1000;
    lastTime = time;

    ecs.update(dt);

    requestAnimationFrame(tick);
  };

  tick();
};

export default main;
