import { GridManager } from "../GridManager/GridManager";
import { KineticEntity, ObjectEntity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { Vector } from "../utils/math";

export class PhysicsSystem implements System {
  // private playerEntity: Entity;
  // private collidableEntities: Entity[];
  private ecs: ECS;
  private gridManager: GridManager;
  private kineticEntities: KineticEntity[];
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

    this.kineticEntities = this.ecs.entityManager.with([
      "velocity",
      "transform",
    ]);
  }

  update(dt: number) {
    for (const entity of this.kineticEntities) {
      const { velocity } = entity;
      const { position } = entity.transform;
      if (velocity.x === 0 && velocity.y === 0) continue;

      // TODO: Base this on running or walking.
      const maxSpeed = 0.003;
      const decelerationRate = this.deceleration * dt;

      // Limit velocity to maximum speed
      let newVelocity = velocity.clampMagnitude(0, maxSpeed);

      // Apply velocity to update position
      const deltaPosition = newVelocity.scale(dt);

      // NOTE: If delta position is zero. We skip collision detection for this entity.
      if (deltaPosition.equals({ x: 0, y: 0 })) {
        continue;
      }

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
      const nextXTile = this.gridManager.getGridTileFromCoord(
        potentialPosition.x,
        position.y
      )!;

      const nextYTile = this.gridManager.getGridTileFromCoord(
        position.x,
        potentialPosition.y
      )!;

      let nextX = nextXTile.accessible ? potentialPosition.x : position.x;
      let nextY = nextYTile.accessible ? potentialPosition.y : position.y;

      const newPosition = new Vector(nextX, nextY);

      // Perform entity collision detection against other colliders
      // TODO: Cache this value (not the filtered list though)
      if (!entity.collider) continue;

      const collidingEntities: ObjectEntity[] = this.ecs.entityManager
        .with(["collider"])
        .filter((e) => e !== entity);

      for (const axis of ["x", "y"]) {
        for (const collidingEntity of collidingEntities) {
          const collidingPosition = collidingEntity.transform.position!;
          const collidingCollider = collidingEntity.collider!;

          // THe following logic is only for AABB to AABB collisions
          if (
            collidingCollider.type !== "aabb" ||
            entity.collider.type !== "aabb"
          )
            continue;

          if (
            newPosition.x < collidingPosition.x + collidingCollider.width! &&
            newPosition.x + entity.collider.width! > collidingPosition.x &&
            newPosition.y < collidingPosition.y + collidingCollider.height! &&
            newPosition.y + entity.collider.height! > collidingPosition.y
          ) {
            // Handle collision
            const xOverlap = Math.min(
              newPosition.x + entity.collider.width! - collidingPosition.x,
              collidingPosition.x + collidingCollider.width! - newPosition.x
            );
            const yOverlap = Math.min(
              newPosition.y + entity.collider.height! - collidingPosition.y,
              collidingPosition.y + collidingCollider.height! - newPosition.y
            );

            // Determine the axis with the smallest overlap
            if (xOverlap < yOverlap) {
              // Resolve collision along the X axis
              newPosition.x +=
                newPosition.x < collidingPosition.x ? -xOverlap : xOverlap;

              if (entity.collisions) {
                entity.collisions.push({
                  entity: entity,
                  collidedWith: collidingEntity,
                  axis: "x",
                  overlap: xOverlap,
                  timestamp: Date.now(),
                });
              }
            } else {
              // Resolve collision along the Y axis
              newPosition.y +=
                newPosition.y < collidingPosition.y ? -yOverlap : yOverlap;

              if (entity.collisions) {
                entity.collisions.push({
                  entity: entity,
                  collidedWith: collidingEntity,
                  axis: "y",
                  overlap: yOverlap,
                  timestamp: Date.now(),
                });
              }
            }
          }
        }
      }

      // And now we have "collision" again!!
      this.ecs.entityManager.updateEntity(entity, {
        transform: {
          ...entity.transform,
          position: new Vector(newPosition.x, newPosition.y),
        },
      });
    }
    // Collision check all entities with a velocity against other colliders. Mark collisions with current velocity.
    // However, instead of bouncing, maybe we should arrest movement on that plane similarly to above, then any extra things can occur. Or we can have collider types
  }
}
