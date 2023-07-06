import { GridManager } from "../GridManager/GridManager";
import { Entity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { Vector } from "../utils/math";

export class PhysicsSystem implements System {
  // private playerEntity: Entity;
  // private collidableEntities: Entity[];
  private ecs: ECS;
  private gridManager: GridManager;
  private kineticEntities: Entity[];
  private deceleration = 10;

  constructor(ecs: ECS, gridManager: GridManager) {
    this.ecs = ecs;
    this.gridManager = gridManager;
    // For now only allowing one player controlled entity and it will be the camera
    // this.playerEntity = this.ecs.entityManager.with(["camera"])[0];
    // this.collidableEntities = this.ecs.entityManager.with([
    //   "position",
    //   "collision",
    // ]);

    this.kineticEntities = this.ecs.entityManager.with(["velocity"]);
  }

  update(dt: number) {
    for (const entity of this.kineticEntities) {
      const { velocity, position } = entity;
      if (velocity.x === 0 && velocity.y === 0) continue;

      // TODO: Base this on running or walking.
      const maxSpeed = 0.003;
      const decelerationRate = this.deceleration * dt;

      // Limit velocity to maximum speed
      let newVelocity = velocity.clampMagnitude(0, maxSpeed);

      // Apply velocity to update position
      const deltaPosition = newVelocity.scale(dt);

      const potentialPosition = position.add(deltaPosition);

      // Slow down!
      if (newVelocity.magnitude(newVelocity) > 0) {
        const clampedMagnitude = Math.max(
          0,
          newVelocity.magnitude(newVelocity) - decelerationRate
        );
        newVelocity = newVelocity.clampMagnitude(
          clampedMagnitude,
          clampedMagnitude
        );
      }

      // TODO: Collision detection. And movement one plane at a time.
      // I'm going to replicate my previous approach to wall collisions that let me slide along them by only applying one directional change at a time.
      // We may want to revisit.
      // May also want to generate collisions as well so that I can start applying scripts and materials to walls to cause stuff like bouncing or teleporting.
      // In fact, collisions are goign to be separate from positional updates. So we can collide with passable walls and impassable walls. First can be a teleport/portal, second can be a bounce effect.

      //For now, very basic. No radius or anything.
      const nextX = this.gridManager.getGridTileFromCoord(
        potentialPosition.x,
        position.y
      )!.accessible
        ? potentialPosition.x
        : position.x;
      const nextY = this.gridManager.getGridTileFromCoord(
        position.x,
        potentialPosition.y
      )!.accessible
        ? potentialPosition.y
        : position.y;

      // And now we have "collision" again!!
      this.ecs.entityManager.updateEntity(entity, {
        position: new Vector(nextX, nextY),
      });
    }
    // Check for all collisions between player and grid tiles.
    // Check for all collisions between player and collidable entities.
    // Check for all collisions between collidable entities and grid tiles.
    // Check for all collisions between collidable entities and themselves (if either has moved)
  }
}
