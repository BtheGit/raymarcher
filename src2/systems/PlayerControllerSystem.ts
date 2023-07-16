import { Vector } from "../utils/math";
import { Entity, PlayerEntity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import SingletonInputSystem from "./SingletonInputSystem";
import { Broker } from "../utils/events";

export class PlayerControllerSystem implements System {
  private inputSystem: SingletonInputSystem;
  private ecs: ECS;
  private broker: Broker;
  private playerEntities: PlayerEntity[];
  private player: PlayerEntity;
  // TEMP: Throttle balls to prevent system brainfartage.
  private lastBall = Date.now();
  private ballTimeout = 1000;

  constructor(
    ecs: ECS,
    broker: Broker,
    inputSystem: SingletonInputSystem,
    player: PlayerEntity
  ) {
    // TODO: As below, we don't need to store the world here if we have a query that is live updated without our knowledge. So ocne that exists, we're golden to stop holding this reference.
    this.ecs = ecs;
    this.broker = broker;
    this.inputSystem = inputSystem;

    // TODO: This is not live updated, so we get what we get when it's called until that time.
    // I could also add a simpler system that just tells systems that have a query, to rerun the query (since something has changed)
    this.playerEntities = this.ecs.entityManager.with([
      "userControl",
    ]) as PlayerEntity[];

    // TODO: I really think I should skip the above (controlling more than one entity at a time), so until I refactor, for the purposes of projectiles, I'm just going to get the player reference again. (But really I should be moving to true ECS and not passing entity objects but just references)
    this.player = player;
  }

  updatePlayerMovement = () => {
    const incrementalModifier = 1; // NOTE: NO need to artificially slow it down when we're barely chugging along as it is. dt / 1000;
    const mouseSensitivity = 0.05;
    // TODO: Base this on run or walk state (or key press)
    const walkSpeed = 0.01;
    // const runSpeed = 0.015;
    const rotationSpeed = 0.03;
    for (const entity of this.playerEntities) {
      if (!entity.userControl) {
        // Since this property might be flipped instead of removed.
        continue;
      }
      const direction = new Vector(
        entity.transform.direction.x,
        entity.transform.direction.y
      );
      const plane = new Vector(entity.plane.x, entity.plane.y);
      let velocity = new Vector(0, 0);

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
      this.lastBall = newTime;
      this.broker.emit("emit_projectile", {
        name: "emit_projectile",
        type: "ball",
        emitter: "player", // Probably shouldn't pass the whole entity. So going to break out all the relevant stuff. I do want to know who emitted it for collision resolutions. But can probably just use an enum value like player | npc.
        origin: this.player.transform.position,
        // Do we need this with velocity?
        direction: this.player.transform.direction,
        // We should probably determine velocity? Would it be conditional on the player or just the projectile type (well, press and hold to throw, definitely player).
        velocity: this.player.transform.direction.scale(5),
        speed: 100,
        sprite: {
          name: "purple_ball__A",
          directions: 0,
        }, // TODO: sprite type, and parameters, including any animations frame by frame (obviously better to do in wad))
        collider: {
          type: "aabb",
          height: 0.1,
          width: 0.1,
          solid: false,
        },
      });
    }
  };

  update(dt: number) {
    this.updatePlayerMovement();
    // Temp disable projectile while figuring out positioning bugs
    this.handlePlayerActions();
  }
}
