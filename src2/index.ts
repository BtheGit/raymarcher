import SingletonInputSystem from "./systems/SingletonInputSystem";
import { PlayerControllerSystem } from "./systems/PlayerControllerSystem";
import { RaycasterSystem } from "./systems/RaycasterSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { AIControllerSystem } from "./systems/AIControllerSystem";
import { ProjectileSystem } from "./systems/ProjectileSystem";
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
} from "./raymarcher";
import { CollisionLayer } from "./enums";
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
};

// TODO: Default Wad

const main = async (wad: WAD, settings = DEFAULT_SETTINGS) => {
  const ecs = new ECS();
  const broker = new Broker();
  const textureManager = new TextureManager();
  const spriteManager = new SpriteManager(textureManager);
  const animationManager = new AnimationManager();
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
  textureManager.loadTextureAnimations(wad.textureAnimations);

  wad.sprites.forEach((spriteData) => spriteManager.loadSprites(spriteData));
  animationManager.loadAnimations(wad.animations);

  // TODO: Some kind of default fallback map and textures.
  const grid: WADGridCell[][] = wad.map.grid!;
  gridManager.loadGrid(grid);

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
    transform: {
      position: new Vector(
        startingPosition.position.x,
        startingPosition.position.y
      ),
      direction,
      rotation: startingPosition.rotation, // TODO: Get rid of
      scale: new Vector(1, 1),
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
    velocity: new Vector(0, 0),
    // TODO: Use movement speed to port old code.
    // FUTURE: Just change velocity with keys and let collision detection reconcile movement?
    // TODO: Not using right now. Main player settings should really be a base setting.
    movement: {
      walkSpeed: 0.15,
      rotationSpeed: 0.12,
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
    const { transform, sprite, states, initialState, collider, ai } = object;

    let objectEntity = {
      transform: {
        position: new Vector(transform.position.x, transform.position.y),
        // TODO: Deprecate roation if the math is more work
        rotation: transform.rotation,
        direction: directionVectorFromRotation(transform.rotation),
        scale: new Vector(transform.scale.x, transform.scale.y),
      },
      velocity: new Vector(0, 0),
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
        const { name, animation: animationKey, sound } = state;
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
          timeElapsedInState: 0,
          states: entityStates,
        },
      };
    }

    ecs.entityManager.add(objectEntity);
  });

  const UserInputSystem = SingletonInputSystem.getInstance(settings.canvasId);

  ecs.systems.add(
    new PlayerControllerSystem(ecs, broker, UserInputSystem, playerEntity)
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
