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
    for (const entity of this.playerEntities) {
      if (!entity.userControl) {
        // Since this property might be flipped instead of removed.
        continue;
      }
      const position = new Vector(entity.position.x, entity.position.y);
      const direction = new Vector(entity.direction.x, entity.direction.y);
      const plane = new Vector(entity.plane.x, entity.plane.y);
      const { walkSpeed, rotationSpeed } = entity.movement;

      // TODO: NO COLLISION DETECTION PORTED YET
      if (
        this.inputSystem.isKeyPressed("ArrowUp") ||
        this.inputSystem.isKeyPressed("w")
      ) {
        position.x =
          entity.position.x +
          entity.direction.x * walkSpeed * incrementalModifier;
        position.y =
          entity.position.y +
          entity.direction.y * walkSpeed * incrementalModifier;
      }
      if (
        this.inputSystem.isKeyPressed("ArrowDown") ||
        this.inputSystem.isKeyPressed("s")
      ) {
        position.x =
          entity.position.x -
          entity.direction.x * walkSpeed * incrementalModifier;
        position.y =
          entity.position.y -
          entity.direction.y * walkSpeed * incrementalModifier;
      }
      if (
        this.inputSystem.isKeyPressed("ArrowLeft") ||
        this.inputSystem.isKeyPressed("a")
      ) {
        const rotation = -1;
        direction.x =
          entity.direction.x *
            Math.cos(rotationSpeed * rotation * incrementalModifier) -
          entity.direction.y *
            Math.sin(rotationSpeed * rotation * incrementalModifier);
        direction.y =
          entity.direction.x *
            Math.sin(rotationSpeed * rotation * incrementalModifier) +
          entity.direction.y *
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
      }
      if (
        this.inputSystem.isKeyPressed("ArrowRight") ||
        this.inputSystem.isKeyPressed("d")
      ) {
        const rotation = 1;
        direction.x =
          entity.direction.x *
            Math.cos(rotationSpeed * rotation * incrementalModifier) -
          entity.direction.y *
            Math.sin(rotationSpeed * rotation * incrementalModifier);
        direction.y =
          entity.direction.x *
            Math.sin(rotationSpeed * rotation * incrementalModifier) +
          entity.direction.y *
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
      }

      // Compare old and new vector. If nothing changed don't update.
      if (!direction.equals(entity.direction)) {
        this.ecs.entityManager.updateEntity(entity, { direction });
      }
      if (!plane.equals(entity.plane)) {
        this.ecs.entityManager.updateEntity(entity, { plane });
      }
      if (!position.equals(entity.position)) {
        this.ecs.entityManager.updateEntity(entity, { position });
      }
    }
  }
}
