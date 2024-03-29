import SingletonInputSystem from "./systems/SingletonInputSystem";
import { WeaponAssetManger } from "./WeaponAssetManager/WeaponAssetManager";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem";
import { RaycasterSystem } from "./systems/RaycasterSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { AudioSystem } from "./systems/AudioSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { AIControllerSystem } from "./systems/AIControllerSystem";
import { ProjectileSystem } from "./systems/ProjectileSystem";
import { InteractionSystem } from "./systems/InteractionSystem";
import { BobbingMovementSystem } from "./systems/BobbingMovementSystem";
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
} from "./types";
import {
  CollisionLayer,
  CustomEventType,
  EquipableWeapon,
  EquipableWeaponState,
  EventMessageName,
  GameEvent,
} from "./enums";
// TO Allay future confusion, event manager is not an event system. Ideally it shoudl be replaced with an event system though.
import { AnimationSystem } from "./systems/AnimationSystem";
import { SpriteManager } from "./SpriteManager/SpriteManager";
import { AnimationManager } from "./AnimationManager/AnimationManager";
import { AudioManager } from "./AudioManager/AudioManager";
import { Broker } from "./utils/events";
import { FlowingMovementSystem } from "./systems/FlowingMovementSystem";
import { Howler } from "howler";
import { TILE_SIZE, DEFAULT_SETTINGS } from "./constants";

// TODO: Default Wad

const loadLevel = async (
  wad: WAD,
  settings = DEFAULT_SETTINGS,
  levelName: string
) => {
  const levelMap = wad.maps[levelName];
  const screenCanvas = document.getElementById(
    settings.canvasId
  ) as HTMLCanvasElement;
  screenCanvas.width = settings.width;
  screenCanvas.height = settings.height;
  // Under teh hood, every call to get context after the first one returns the same reference, but I prefer the explicitness of doing it this way since that may not be known to many.
  const screenContext = screenCanvas.getContext("2d", {
    willReadFrequently: true,
  })!;

  const ecs = new ECS();
  const broker = new Broker();
  const textureManager = new TextureManager();
  const spriteManager = new SpriteManager(textureManager);
  const audioManager = new AudioManager();
  const animationManager = new AnimationManager();
  const gridManager = new GridManager(ecs);
  const weaponAssetManager = WeaponAssetManger.getInstance();

  // I don't love the idea of modeling everything as an entity, but since it's easier to revert that than implement it... yolo.
  const gameSettingsEntity: GameSettingsEntity = {
    gameSettings: {
      width: settings.width,
      height: settings.height,
      canvasId: settings.canvasId,
      tileSize: TILE_SIZE,
    },
  };

  ecs.entityManager.add(gameSettingsEntity);

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

  // audioManager.loadSounds(wad.sounds);
  audioManager.loadSpritemap(wad.audioSpritemap);

  const grid: WADGridCell[][] = levelMap.grid!;
  gridManager.loadGrid(grid);

  // TODO: Starting with hardcoded weapons, then moving to wad and more complex start up.
  // SO, a second big thing to consider is my animation manager. It's very basic, and barely serves a purposes, and maybe shouldn't be so generic. Let different object types manage their own? Or come up with a better system and reextend that?
  // Eitehr way, I'm going to ignore it completely for weapons, so that I can try out a slightly different interface.
  // TODO: I also want to determine the width values from the longest frame, that's it's own task. I'll do it manually for now. Dynamically loading stuff is quite the headache.
  weaponAssetManager.registerWeaponAssets(EquipableWeapon.None, {
    [EquipableWeaponState.Idle]: {
      name: "default", // TODO: Defined separately again like other animations?
      frames: [],
      events: [],
    },
    [EquipableWeaponState.Firing]: {
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
      events: [
        {
          frameId: "CONEC0",
          eventType: EventMessageName.PlaySound,
          eventPayload: {
            name: "swoosh1",
          },
        },
      ],
    },
    sprite: {
      width: 228,
      // TODO: Scale?
    },
  });

  // ## Player/CAMERA
  const startingPosition = levelMap.start;
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
      radius: 0.2,
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
  const objects: WADObjectEntity[] = levelMap.objects ?? [];
  objects.forEach((object) => {
    const {
      transform,
      sprite,
      states,
      initialState,
      collider,
      collisionLayer,
      ai,
      movementSettings,
      actor,
      interactionDirectives,
      bobbingMovement,
      audioSource,
      playerInteractions,
    } = object;

    let objectEntity = {
      actor,
      transform: {
        position: new Vector2(transform.position.x, transform.position.y),
        // TODO: Deprecate roation if the math is more work
        direction: directionVectorFromRotation(transform.rotation),
        height: transform.height,
        elevation: transform.elevation,
      },
      velocity: new Vector2(0, 0),
      spatialPartitioningSettings: {
        width: 0,
        gridLocations: new Set<string>(),
      },
    };

    if (movementSettings) {
      (objectEntity as ObjectEntity).movement = {
        speed: 0,
        settings: { ...movementSettings },
      };
    }

    if (collider) {
      (objectEntity as ObjectEntity).collider = { ...collider };
      (objectEntity as ObjectEntity).collisions = [];
    }

    if (collisionLayer) {
      (objectEntity as ObjectEntity).collisionLayer = { ...collisionLayer };
    }

    if (ai) {
      // TODO: Move derived value instantiation out of the wad (stuff like idleTimer)
      // For now, we'll just force the wad to match the component shape so we can fry bigger fish.
      (objectEntity as ObjectEntity).ai = { ...ai };
    }

    if (audioSource) {
      (objectEntity as ObjectEntity).audioSource = { ...audioSource };
    }

    // TODO: Right now, we don't have an initializer per actor type, so lots of rules gonna be shoved together. That means, birds are going to spawn in idle state without a bobbingMovement component set. Could do it in the wad too, or just have something do the check here. WADs are pretty overloadeed as it is.
    if (bobbingMovement) {
      (objectEntity as ObjectEntity).bobbingMovement = {
        ...bobbingMovement,
        startTime: Date.now(),
      };
    }

    if (interactionDirectives) {
      (objectEntity as ObjectEntity).interactionDirectives = [
        ...interactionDirectives,
      ];
    }

    if (playerInteractions) {
      (objectEntity as ObjectEntity).playerInteractions = {
        ...playerInteractions,
      };
    }

    if (sprite) {
      (objectEntity as StaticObjectEntity) = {
        ...objectEntity,
        objectType: "object__static",
        sprite: { ...sprite },
      };

      // Set the spatial partitioning width to the sprite width
      const spriteName = `${sprite.name}${sprite.directions === 0 ? "0" : "1"}`;
      objectEntity.spatialPartitioningSettings.width =
        spriteManager.getSpriteFrame(spriteName)!.spriteSourceSize.w;
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
        const {
          name,
          animation: animationKey,
          sound,
          height,
          bobbingMovement,
        } = state;
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
          animation: {
            ...animation,
          },
        };

        if (sound) {
          entityState.sound = { ...sound };
        }

        if (bobbingMovement) {
          entityState.bobbingMovement = { ...bobbingMovement };
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
          lastStateChange: Date.now(),
          states: entityStates,
        },
      };

      // We want to determine the widest possible sprite (erring on the side of caution).
      // We'll need to iterate through all the sprite frames of all the states for this object and use the largest one.
      // NOTE: The way I set all this up to allow arbitrary sprite frames for animations is cool, but way too extensible. This would be so simpler if every object was associated with one sprite sheet (which has the width value already easily accessible). In addition, because I was trying to adhere to doom's sprite id conventions, I now have to imperatively find every associated frame based on directions.
      for (const state of states) {
        const animation = animationManager.getAnimation(state.animation);
        if (animation) {
          const { frames } = animation;
          for (const frame of frames) {
            const { frameId, directions } = frame;
            const textureName = `${frameId}${directions === 0 ? "0" : "1"}`;
            const sprite = spriteManager.getSpriteFrame(textureName);
            if (sprite) {
              objectEntity.spatialPartitioningSettings.width = Math.max(
                objectEntity.spatialPartitioningSettings.width,
                sprite.spriteSourceSize.w
              );
            }
          }
        }
      }
    }

    ecs.entityManager.add(objectEntity);
    gridManager.updateObjectEntityGridTracking(objectEntity as ObjectEntity);
  });

  // Once again, we're cheating a bit to avoid extra lookups until we have a better ECS system. I'm going to persist a skybox reference here.
  const skyboxEntity: SkyboxEntity = {
    skybox: {
      surface: levelMap.sky.type,
      texture: levelMap.sky.texture,
    },
  };
  ecs.entityManager.add(skyboxEntity);

  // ##### Systems

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

  ecs.systems.add(new BobbingMovementSystem(ecs));

  ecs.systems.add(new FlowingMovementSystem(ecs, gridManager));

  ecs.systems.add(new ProjectileSystem(ecs, broker, gridManager));

  ecs.systems.add(new PhysicsSystem(ecs, broker, gridManager));

  ecs.systems.add(new InteractionSystem(ecs, broker, gridManager));

  // TODO:
  // Once again, I don't know the ideal way to separate concerns here (without huge time overhead for good event stuff), so I'm going to short term undo all my good efforts and hard connect systems. Namely the renderer and the raycaster in this case. In fact, until I get smarter, they really shouldn't be two systems at all. But oh well, the renderer will at least have other concerns like text and a HUD that have nothing to do with raycasting. So I'm going to make a very fake eventBus to pass stuff along short term.
  ecs.systems.add(
    new RaycasterSystem(gridManager, broker, playerEntity, settings.width)
  );

  // There's no huge reason to pass this here except maybe to eventually sync the frame rates for all animations.
  // The animation system is just going to do us a solid of calling update on the tile manager per tick (and later) frame.
  ecs.systems.add(new AnimationSystem(ecs, textureManager, broker));

  ecs.systems.add(new AudioSystem(ecs, audioManager, broker, playerEntity));

  ecs.systems.add(
    new RenderSystem(
      screenCanvas,
      screenContext!,
      ecs,
      gameSettingsEntity,
      textureManager,
      spriteManager,
      gridManager,
      broker,
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
      playerEntity,
      UserInputSystem,
      broker
    )
  );

  // ######### Level Lifecycle: LOAD

  // Short term, just going to reuse interaction directives as intended for playeractor collisions. Since those are about the same. Deeper scripting would come later, if ever. We just want text and audio stuff for now.
  if (levelMap.settings?.onLoad?.length) {
    for (const directive of levelMap.settings.onLoad) {
      broker.emit(EventMessageName.InteractionDirective, directive);
    }
  }

  // ########## LOOP

  let animationFrame;

  // TODO: Performance.now gives me ever increasing numbers versus the delta between times, which I need for modifying calculations between frames.
  let lastTime = Date.now(); // performance.now();
  const tick = () => {
    animationFrame = requestAnimationFrame(tick);
    /* Determine deltatime */
    const time = Date.now(); // performance.now();
    const dt = time - lastTime; // / 1000;
    if (dt >= 1000 / 60) {
      lastTime = time;

      ecs.update(dt);
    }
  };

  tick();

  return {
    levelName,
    unload: () => {
      cancelAnimationFrame(animationFrame);
      Howler.stop();
    },
  };
};

const main = async (wad: WAD, settings = DEFAULT_SETTINGS) => {
  const screenCanvas = document.getElementById(
    settings.canvasId
  ) as HTMLCanvasElement;
  const screenContext = screenCanvas.getContext("2d", {
    willReadFrequently: true,
  })!;

  // TODO: Short term I'm going to reload everything to change map. Being stateful is more hassle than it's worth until I have a reason. For my portfolio, I'm just making a one way path, no back tracking.
  // Stuff like animated textures though, should only be loaded based on level. And in fact we lose some efficiencies by completely unloading all textures. Browser caching will help there. Definitely would be best not to run animations in the background like flatWarp if we don't need to.

  // To that end, everything is getting pushed into a loadLevel
  // We'll want to have a cleanup function for everything that needs it for when this is called in the game (event based)
  const wadSettings = wad.wadSettings;
  let level = await loadLevel(wad, settings, wadSettings.firstMap);

  const handleGameEvent = async (e: Event) => {
    const detail = (<CustomEvent>e).detail;
    const { type } = detail;

    if (type === GameEvent.LoadLevel) {
      // Just for testing, choose a random level that's not the current one and switch
      const levels = Object.keys(wad.maps);
      const otherLevels = levels.filter((name) => name !== level.levelName);
      const newLevel =
        otherLevels[Math.floor(Math.random() * otherLevels.length)];

      // This is just for fun to try out an interlevel screen. Just black flash for now.

      level.unload();

      level = await loadLevel(wad, settings, newLevel);
    }
  };

  document.addEventListener(CustomEventType.GameEvent, handleGameEvent);
};

export default main;
