import SingletonInputSystem from "./systems/SingletonInputSystem";
import { WeaponAssetManger } from "./WeaponAssetManager/WeaponAssetManager";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem";
import { RaycasterSystem } from "./systems/RaycasterSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { AIControllerSystem } from "./systems/AIControllerSystem";
import { ProjectileSystem } from "./systems/ProjectileSystem";
import { HUDSystem } from "./systems/HUDSystem";
import { ECS } from "./utils/ECS/ECS";
import {
  Vector2,
  directionVectorFromRotation,
  planeVectorFromRotation,
  toRadians,
} from "./utils/math";
import { TextureManager } from "./TextureManager/TextureManager";
import { GridManager } from "./GridManager/GridManager";
import {
  AnimatedObjectEntity,
  AnimationState,
  EntityState,
  GameSettingsEntity,
  ObjectEntity,
  PlayerEntity,
  SkyboxEntity,
  StaticObjectEntity,
  WADGridCell,
  WADObjectEntity,
  WAD,
  WADTextureAnimationSprite,
} from "./raymarcher";
import { CollisionLayer, EquipableWeapon, EquipableWeaponState } from "./enums";
// TO Allay future confusion, event manager is not an event system. Ideally it shoudl be replaced with an event system though.
import { EventManager } from "./EventManager/EventManager";
import { AnimationSystem } from "./systems/AnimationSystem";
import { SpriteManager } from "./SpriteManager/SpriteManager";
import { AnimationManager } from "./AnimationManager/AnimationManager";
import { Broker } from "./utils/events";

const DEFAULT_SETTINGS = {
  width: 768,
  height: 512,
  canvasId: "raymarcher-display",
  tileSize: 256, // TODO: Make this defined in the WAD (since the wad will define world objects relative to this... or, just use this forever since this is a toy project after all. :) )
};

// TODO: Default Wad

const main = async (wad: WAD, settings = DEFAULT_SETTINGS) => {
  const screenCanvas = document.getElementById(
    settings.canvasId
  ) as HTMLCanvasElement;
  screenCanvas.width = settings.width;
  screenCanvas.height = settings.height;
  // Under teh hood, every call to get context after the first one returns the same reference, but I prefer the explicitness of doing it this way since that may not be known to many.
  const screenContext = screenCanvas.getContext("2d", {
    willReadFrequently: true,
  })!;
  // screenContext.imageSmoothingEnabled = false;

  const ecs = new ECS();
  const broker = new Broker();
  const textureManager = new TextureManager();
  const spriteManager = new SpriteManager(textureManager);
  const animationManager = new AnimationManager();
  const gridManager = new GridManager(ecs);
  const weaponAssetManager = WeaponAssetManger.getInstance();

  // I don't love the idea of modeling everything as an entity, but since it's easier to revert that than implement it... yolo.
  const gameSettingsEntity: GameSettingsEntity = {
    gameSettings: {
      width: settings.width,
      height: settings.height,
      canvasId: settings.canvasId,
      tileSize: settings.tileSize,
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
  textureManager.loadTextureAnimations(
    wad.textureAnimations.filter((e) => e.animationType !== "sprite")
  );

  wad.sprites.forEach((spriteData) => spriteManager.loadSprites(spriteData));
  textureManager.loadSpriteTextures(
    spriteManager,
    wad.textureAnimations.filter(
      (e) => e.animationType === "sprite"
    ) as WADTextureAnimationSprite[]
  );
  animationManager.loadAnimations(wad.animations);

  // TODO: Some kind of default fallback map and textures.
  const grid: WADGridCell[][] = wad.map.grid!;
  gridManager.loadGrid(grid);

  // TODO: Starting with hardcoded weapons, then moving to wad and more complex start up.
  // SO, a second big thing to consider is my animation manager. It's very basic, and barely serves a purposes, and maybe shouldn't be so generic. Let different object types manage their own? Or come up with a better system and reextend that?
  // Eitehr way, I'm going to ignore it completely for weapons, so that I can try out a slightly different interface.
  // TODO: I also want to determine the width values from the longest frame, that's it's own task. I'll do it manually for now. Dynamically loading stuff is quite the headache.
  weaponAssetManager.registerWeaponAssets(EquipableWeapon.None, {
    defaultAnimation: {
      name: "default", // TODO: Defined separately again like other animations?
      frames: [],
      events: [],
    },
    firingAnimation: {
      name: "firing",
      frames: [],
      events: [],
    },
    sprite: {
      width: 0,
    },
  });

  weaponAssetManager.registerWeaponAssets(EquipableWeapon.MagicHands, {
    [EquipableWeaponState.Idle]: {
      name: "magic_hands__default",
      frames: [
        {
          frameId: "CONEA0",
          duration: Infinity,
          directions: 0, // I want to make this optional so I don't need it for hud animations ideally.
        },
      ],
      events: [],
    },
    [EquipableWeaponState.Firing]: {
      name: "firing",
      frames: [
        {
          frameId: "CONEB0",
          duration: 40, // TODO: Fixed duration for weapon animations?
          directions: 0, // I want to make this optional so I don't need it for hud animations ideally.
        },
        {
          frameId: "CONEC0",
          duration: 40,
          directions: 0, // I want to make this optional so I don't need it for hud animations ideally.
        },
        {
          frameId: "CONED0",
          duration: 40,
          directions: 0, // I want to make this optional so I don't need it for hud animations ideally.
        },
        {
          frameId: "CONEE0",
          duration: 40,
          directions: 0, // I want to make this optional so I don't need it for hud animations ideally.
        },
        {
          frameId: "CONEF0",
          duration: 40,
          directions: 0, // I want to make this optional so I don't need it for hud animations ideally.
        },
        {
          frameId: "CONEG0",
          duration: 40,
          directions: 0, // I want to make this optional so I don't need it for hud animations ideally.
        },
      ],
      events: [],
    },
    sprite: {
      width: 228,
      // TODO: Scale?
    },
  });

  // ## Player/CAMERA
  const startingPosition = wad.map.start;
  const fovRadians = toRadians(startingPosition.fov);
  const fov = Math.abs(Math.atan(fovRadians));
  const direction = directionVectorFromRotation(
    startingPosition.rotation
  ).scale(fov);
  const plane = planeVectorFromRotation(startingPosition.rotation);
  const playerEntity: PlayerEntity = {
    equippedWeapon: {
      type: EquipableWeapon.MagicHands,
      state: EquipableWeaponState.Idle,
    },
    // TODO: We want this to be set up in the player controller on start, so we keep referential integrity with the component in the weaponAssetManager when possible. Typescript will complain for a bit until I sort that out.
    // equippedWeaponAnimation: {
    //   name: "default",
    //   frames: [],
    //   frameDuration: Infinity,
    //   looping: false,
    //   currentFrame: 0,
    //   timeSinceLastFrame: Date.now(),
    // },
    camera: {
      inverseDeterminate: 1.0 / (plane.x * direction.y - direction.x * plane.y),
      fov: fov,
    },
    userControl: {
      isControlled: true,
    },
    transform: {
      position: new Vector2(
        startingPosition.position.x,
        startingPosition.position.y
      ),
      elevation: startingPosition.elevation,
      direction,
      height: 192, // I hope this isnt being used right now
      // scale: new Vector(1, 1),
    },
    plane,
    collider: {
      type: "aabb",
      width: 0.8,
      height: 0.8,
      solid: true,
    },
    collisions: [],
    collisionLayer: {
      layer: CollisionLayer.Player,
    },
    velocity: new Vector2(0, 0),
    // TODO: Use movement speed to port old code.
    // FUTURE: Just change velocity with keys and let collision detection reconcile movement?
    // TODO: Not using right now. Main player settings should really be a base setting.
    movement: {
      speed: startingPosition.walkSpeed,
      // walkSpeed: 0.15,
      // rotationSpeed: 0.12,
    },
    state: {
      // TODO: For the main player, we'll have to worry about this later. I'm more concerned with NPCs
      currentState: "todo",
    },
  };
  ecs.entityManager.add(playerEntity);

  // ## Objects and NPCS
  // TODO:
  // NOTE: Textures are not added to the wad with dimensions. That is a mistake and with an editor would be fine. So we load the boot process and get all those values now. (We ignored it for tiles since those would always be the same size and stretched.)
  const objects: WADObjectEntity[] = wad.map.objects ?? [];
  objects.forEach((object) => {
    const { transform, sprite, states, initialState, collider, ai, movement } =
      object;

    let objectEntity = {
      transform: {
        position: new Vector2(transform.position.x, transform.position.y),
        // TODO: Deprecate roation if the math is more work
        direction: directionVectorFromRotation(transform.rotation),
        height: transform.height,
        elevation: transform.elevation,
      },
      velocity: new Vector2(0, 0),
      movement: movement ?? {
        speed: 0,
      },
    };

    if (collider) {
      (objectEntity as ObjectEntity).collider = collider;
      (objectEntity as ObjectEntity).collisions = [];
    }

    if (ai) {
      // TODO: Move derived value instantiation out of the wad (stuff like idleTimer)
      // For now, we'll just force the wad to match the component shape so we can fry bigger fish.
      (objectEntity as ObjectEntity).ai = ai;
    }

    if (sprite) {
      (objectEntity as StaticObjectEntity) = {
        ...objectEntity,
        objectType: "object__static",
        sprite,
      };
    } else {
      if (!states || !states.length || !initialState) {
        throw new Error(
          "Animated Object is missing required state properties. Can not load"
        );
      }

      // TODO: Anything that has a velocity should have a collisions component.

      // NOTE: I've considered separating the definition of states from animations and sounds.
      // But, on reflection, I'm going to, fornow, assume that each object, of a certain type (tbd how to implement, currently only aiType exists to differentiate but things that are not self-motivated will also have states), should have all the provided states

      const entityStates = states.reduce((acc, state) => {
        // TODO: Here we are doing what should be a world object initialization/spawn bit. Need to move this to a spawner
        // or something.
        const { name, animation: animationKey, sound, height } = state;
        // TODO: Animation Manager has no real purpose at this juncture
        const animationConfiguration =
          animationManager.getAnimation(animationKey)!; // TODO: Handle missing animation
        const animation: AnimationState = {
          ...animationConfiguration,
          currentFrame: 0,
          timeSinceLastFrame: 0,
        };

        const entityState: EntityState = {
          name,
          animation,
        };

        if (sound) {
          entityState.sound = sound;
        }

        entityState.height = height ?? objectEntity.transform.height;

        acc[name] = entityState;
        return acc;
      }, {});

      (objectEntity as AnimatedObjectEntity) = {
        ...objectEntity,
        objectType: "object__animated",
        state: {
          currentState: initialState,
          previousState: null,
          initialState,
          lastStateChange: 0,
          states: entityStates,
        },
      };
    }

    ecs.entityManager.add(objectEntity);
  });

  const UserInputSystem = SingletonInputSystem.getInstance(settings.canvasId);

  ecs.systems.add(
    new PlayerControllerSystem(
      ecs,
      broker,
      UserInputSystem,
      playerEntity,
      weaponAssetManager
    )
  );

  ecs.systems.add(new AIControllerSystem(ecs, broker, gridManager));

  ecs.systems.add(new ProjectileSystem(ecs, broker));

  ecs.systems.add(new PhysicsSystem(ecs, broker, gridManager));

  // TODO:
  // Once again, I don't know the ideal way to separate concerns here (without huge time overhead for good event stuff), so I'm going to short term undo all my good efforts and hard connect systems. Namely the renderer and the raycaster in this case. In fact, until I get smarter, they really shouldn't be two systems at all. But oh well, the renderer will at least have other concerns like text and a HUD that have nothing to do with raycasting. So I'm going to make a very fake eventBus to pass stuff along short term.
  const eventManager = new EventManager();
  ecs.systems.add(
    new RaycasterSystem(gridManager, eventManager, playerEntity, settings.width)
  );

  // There's no huge reason to pass this here except maybe to eventually sync the frame rates for all animations.
  // The animation system is just going to do us a solid of calling update on the tile manager per tick (and later) frame.
  ecs.systems.add(new AnimationSystem(ecs, textureManager));

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
      screenCanvas,
      screenContext!,
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

  // One kind of thing very convenient about my barebones ECS implementation is that the order in which systems are added
  // is the order in which they are called during the update pipeline. So, i can simply run the HUD after the game (since I want everything in the hud to overlay the world).
  // All that means is that the main screen canvas will need to be initialized here instead of in the render system, so it can be shared.
  // I could do all of this more cleanly sharing components or with an event system or ... but I want to start over on the next one with a more robust system. So I'm going to consider this walkawayable soon. And the next time I come back to it, I can worry about refactoring and making it better. All code is debt!
  ecs.systems.add(
    new HUDSystem(
      screenCanvas,
      screenContext!,
      ecs,
      gameSettingsEntity,
      textureManager,
      spriteManager,
      gridManager,
      eventManager,
      playerEntity,
      UserInputSystem
    )
  );

  // TODO: Performance.now gives me ever increasing numbers versus the delta between times, which I need for modifying calculations between frames.
  let lastTime = Date.now(); // performance.now();
  const tick = () => {
    requestAnimationFrame(tick);
    /* Determine deltatime */
    const time = Date.now(); // performance.now();
    const dt = time - lastTime; // / 1000;
    if (dt >= 1000 / 60) {
      lastTime = time;

      ecs.update(dt);
    }
  };

  tick();
};

export default main;
