import { Vector } from "../utils/math";
import { Entity, PlayerEntity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import SingletonInputSystem from "./SingletonInputSystem";

export class PlayerControllerSystem implements System {
  private inputSystem: SingletonInputSystem;
  private ecs: ECS;
  private playerEntities: PlayerEntity[];

  constructor(ecs: ECS, inputSystem: SingletonInputSystem) {
    // TODO: As below, we don't need to store the world here if we have a query that is live updated without our knowledge. So ocne that exists, we're golden to stop holding this reference.
    this.ecs = ecs;
    this.inputSystem = inputSystem;

    // TODO: This is not live updated, so we get what we get when it's called until that time.
    // I could also add a simpler system that just tells systems that have a query, to rerun the query (since something has changed)
    this.playerEntities = this.ecs.entityManager.with([
      "userControl",
    ]) as PlayerEntity[];
  }

  update(dt: number) {
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
  }
}