import { Vector2 } from "../utils/math";
import {
  AnimationState,
  Entity,
  PlayerActorCollisionEvent,
  PlayerEntity,
} from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import SingletonInputSystem from "./SingletonInputSystem";
import { Broker } from "../utils/events";
import { WeaponAssetManger } from "../WeaponAssetManager/WeaponAssetManager";
import {
  EquipableWeapon,
  EquipableWeaponState,
  EventMessageName,
  GameActorType,
} from "../enums";

export class PlayerControllerSystem implements System {
  private inputSystem: SingletonInputSystem;
  private ecs: ECS;
  private broker: Broker;
  private weaponAssetManager: WeaponAssetManger;
  private playerEntities: PlayerEntity[];
  private player: PlayerEntity;
  // TEMP: Throttle balls to prevent system brainfartage.
  private lastBall = Date.now();
  private ballTimeout = 1000;

  constructor(
    ecs: ECS,
    broker: Broker,
    inputSystem: SingletonInputSystem,
    player: PlayerEntity,
    weaponAssetManager: WeaponAssetManger
  ) {
    // TODO: As below, we don't need to store the world here if we have a query that is live updated without our knowledge. So ocne that exists, we're golden to stop holding this reference.
    this.ecs = ecs;
    this.broker = broker;
    this.inputSystem = inputSystem;
    this.weaponAssetManager = weaponAssetManager;

    // TODO: This is not live updated, so we get what we get when it's called until that time.
    // I could also add a simpler system that just tells systems that have a query, to rerun the query (since something has changed)
    this.playerEntities = this.ecs.entityManager.with([
      "userControl",
    ]) as PlayerEntity[];

    // TODO: I really think I should skip the above (controlling more than one entity at a time), so until I refactor, for the purposes of projectiles, I'm just going to get the player reference again. (But really I should be moving to true ECS and not passing entity objects but just references)
    this.player = player;

    // 1) Set the correct equipped weapon based on the state and add the appropriate animation setup.
    this.switchWeapon(this.player.equippedWeapon.type);
  }

  /**
   * Note: This function allows us to instantiate teh animationcomponent on load as well.
   */
  switchWeapon = (weaponType: EquipableWeapon) => {
    // TODO: Check if weapon is available based on inventory
    this.player.equippedWeapon.type = weaponType;
    const assets = this.weaponAssetManager.getWeaponAssets(weaponType);
    const animationAssets = assets?.[EquipableWeaponState.Idle];
    if (!animationAssets) {
      console.error("Uh. Missing weapon assets...");
      return;
    }

    // Initialize to default state always
    const equippedWeaponAnimation: AnimationState = {
      name: animationAssets.name,
      frames: animationAssets.frames,
      events: animationAssets.events, // TODO: Add this to this type
      frameDuration: 40, // TODO: Deprecate this being needed for this type
      looping: false, // Still not used...
      currentFrame: 0,
      timeSinceLastFrame: 0,
    };

    const equippedWeaponSprite = assets.sprite;

    this.player.equippedWeaponAnimation = equippedWeaponAnimation;
    this.player.equippedWeaponSprite = equippedWeaponSprite;
  };

  switchWeaponState = (newState: EquipableWeaponState) => {
    if (this.player.equippedWeapon.state === newState) {
      // We don't want to reset animations because a player accidentally tried switching to the same state.
      return;
    }

    // TODO: I really should just cache this (I know it's just references getting passed around, but still)
    const assets = this.weaponAssetManager.getWeaponAssets(
      this.player.equippedWeapon.type
    )!;
    const animationAssets = assets[newState];

    this.player.equippedWeapon.state = newState;
    this.player.equippedWeaponAnimation = {
      name: animationAssets.name,
      frames: animationAssets.frames,
      events: animationAssets.events,
      frameDuration: 40,
      looping: false,
      currentFrame: 0,
      timeSinceLastFrame: 0,
    };
  };

  updatePlayerMovement = () => {
    const incrementalModifier = 1; // NOTE: NO need to artificially slow it down when we're barely chugging along as it is. dt / 1000;
    const mouseSensitivity = 0.05;
    // TODO: Base this on run or walk state (or key press)
    const walkSpeed = this.player.movement.speed;
    // const runSpeed = 0.015;
    const rotationSpeed = 0.03;
    for (const entity of this.playerEntities) {
      if (!entity.userControl) {
        // Since this property might be flipped instead of removed.
        continue;
      }
      const direction = new Vector2(
        entity.transform.direction.x,
        entity.transform.direction.y
      );
      const plane = new Vector2(entity.plane.x, entity.plane.y);
      let velocity = new Vector2(0, 0);

      // TODO: NO COLLISION DETECTION PORTED YET
      if (
        this.inputSystem.isKeyPressed("ArrowUp") ||
        this.inputSystem.isKeyPressed("w")
      ) {
        velocity = velocity.add(direction.scale(walkSpeed));
      }
      if (
        this.inputSystem.isKeyPressed("ArrowDown") ||
        this.inputSystem.isKeyPressed("s")
      ) {
        velocity = velocity.subtract(direction.scale(walkSpeed));
      }
      if (
        this.inputSystem.isKeyPressed("ArrowLeft") ||
        this.inputSystem.isKeyPressed("a")
      ) {
        velocity = velocity.subtract(plane.scale(walkSpeed * 0.5));
      }
      if (
        this.inputSystem.isKeyPressed("ArrowRight") ||
        this.inputSystem.isKeyPressed("d")
      ) {
        velocity = velocity.add(plane.scale(walkSpeed * 0.5));
      }

      const { movementX, movementY } = this.inputSystem.getMouseDelta();
      const rotation = movementX * mouseSensitivity;

      direction.x =
        entity.transform.direction.x *
          Math.cos(rotationSpeed * rotation * incrementalModifier) -
        entity.transform.direction.y *
          Math.sin(rotationSpeed * rotation * incrementalModifier);
      direction.y =
        entity.transform.direction.x *
          Math.sin(rotationSpeed * rotation * incrementalModifier) +
        entity.transform.direction.y *
          Math.cos(rotationSpeed * rotation * incrementalModifier);

      plane.x =
        entity.plane.x *
          Math.cos(rotationSpeed * rotation * incrementalModifier) -
        entity.plane.y *
          Math.sin(rotationSpeed * rotation * incrementalModifier);
      plane.y =
        entity.plane.x *
          Math.sin(rotationSpeed * rotation * incrementalModifier) +
        entity.plane.y *
          Math.cos(rotationSpeed * rotation * incrementalModifier);

      // Compare old and new vector. If nothing changed don't update.
      if (!direction.equals(entity.transform.direction)) {
        this.ecs.entityManager.updateEntity(entity, {
          transform: { ...entity.transform, direction },
        });
      }
      if (!plane.equals(entity.plane)) {
        this.ecs.entityManager.updateEntity(entity, { plane });
      }
      if (!velocity.equals(entity.velocity)) {
        this.ecs.entityManager.updateEntity(entity, { velocity });
      }
    }
  };

  // TODO: I don't think the best way to do this is checking keypresses necessarily. Especially for single press actions. But, for now, we'll just do it.
  // It does give us the opportunity to throttle things (like firing a projectile)
  // MVP have a short lived projectile fire out constantly while mouse is pressed.
  // TODO: What happens on buttons press probably shouldn't be hard coded long term. But for now, yeah... not worth the effort. So this raycaster becomes less and less of a generic renderer :) .
  handlePlayerActions = () => {
    // This system should be reponsible for determining what action to emit based on the player's state.
    const activeMousedownEvent = this.inputSystem.activeMousedownEvent();
    const newTime = Date.now();
    const timeLapsed = newTime - this.lastBall;
    if (timeLapsed < this.ballTimeout) {
      return;
    }
    if (activeMousedownEvent?.button === 0) {
      this.switchWeaponState(EquipableWeaponState.Firing);
      this.lastBall = newTime;
      // TODO: Go associate projectiles (as separate entitys with weapons (and weapon actions), simply reference that here.)
      this.broker.emit(EventMessageName.EmitProjectile, {
        name: EventMessageName.EmitProjectile,
        type: "magic_shot",
        emitter: "player", // Probably shouldn't pass the whole entity. So going to break out all the relevant stuff. I do want to know who emitted it for collision resolutions. But can probably just use an enum value like player | npc.
        origin: this.player.transform.position,
        // Do we need this with velocity?
        direction: this.player.transform.direction,
        // We should probably determine velocity? Would it be conditional on the player or just the projectile type (well, press and hold to throw, definitely player).
        velocity: this.player.transform.direction,
        speed: 0.004,
        collider: {
          type: "aabb",
          height: 0.1,
          width: 0.1,
          solid: false,
        },
      });
    }
  };

  animateEquippedWeapon = () => {
    // For now, we're going to assume all equipped weapons have only one frame in their idle state. Maybe later we can support more?
    const weaponState = this.player.equippedWeapon.state;
    if (weaponState === EquipableWeaponState.Idle) {
      return;
    }

    // Otherwise, we want to advance the animation and look for any events. Now, my original thought was that this would be generic. But I think in the case of weapons, that is very much overkill and we can look for specific weapon events and let this controller be hardcoded with how to handle them, since the primary use case is going to be firing projectiles (and sounds) and otherwise interacting with objects.

    // NOTE: this needs to be constrained to a frame rate, but we don't want that constraint in the update call since we want to respond immediately to a fire press, rather than wait x frames (since the weapon framerate will be lowish).

    const animation = this.player.equippedWeaponAnimation;
    const { currentFrame, frames, events, timeSinceLastFrame } = animation;
    const time = Date.now();
    const delta = time - timeSinceLastFrame;
    if (delta < 1000 / 15) {
      return;
    }
    // Short term, I'm not going to treat any animation as looping, and I'm going to simply return to idle state
    const nextFrame = currentFrame + 1;
    if (nextFrame >= frames.length) {
      this.switchWeaponState(EquipableWeaponState.Idle);
    } else {
      animation.currentFrame = nextFrame;
      animation.timeSinceLastFrame = time;
    }
  };

  // I'm in the endgame with this toy and I'm starting to want to pull back a bit to get stuff in quick. More and more I want to move responsibility into controllers. In terms of collisions, I'm starting to feel more and more I want that to be reconciled in actor controllers to reduce footprint and brain pain.

  // So more most prop interactions, we'll simply have the player reconcile the action, broadcast the event (let's hope we don't have to deal with duplicates (can throttle on the prop side for a few ticks if need be)) and have the interaction system (which is really the prop controller at the moment) listen for events instead of polling entities.
  handleCollisions = () => {
    const collisions = this.player.collisions;
    if (!collisions.length) {
      return;
    }
    // Short term, we're going to reconcile one event and let others be ignored. So we pop and clear.
    const collision = collisions.shift()!;
    this.player.collisions = [];

    // Handle Objects. Deal with walls later. Which will be fun if we change color when we touch them or something!)
    if (collision.collidedWith?.actor) {
      switch (collision.collidedWith.actor) {
        case GameActorType.Book:
        case GameActorType.Coin:
        case GameActorType.Portal: {
          this.broker.emit(EventMessageName.PlayerActorCollision, {
            name: EventMessageName.PlayerActorCollision,
            actor: collision.collidedWith.actor,
            entity: collision.collidedWith,
          } as PlayerActorCollisionEvent);
        }
      }
    }
  };

  update(dt: number) {
    this.handleCollisions();
    this.updatePlayerMovement();
    // Temp disable projectile while figuring out positioning bugs
    this.handlePlayerActions();
    this.animateEquippedWeapon();
  }
}
