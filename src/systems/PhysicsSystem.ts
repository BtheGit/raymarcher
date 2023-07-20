import { GridManager } from "../GridManager/GridManager";
import { Entity, KineticEntity, ObjectEntity } from "../raymarcher";
import { CollisionLayer } from "../enums";

import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { Vector2 } from "../utils/math";

export class PhysicsSystem implements System {
  // private playerEntity: Entity;
  // private collidableEntities: Entity[];
  private ecs: ECS;
  private broker: Broker;
  private gridManager: GridManager;
  private kineticEntities: KineticEntity[];
  private deceleration = 10;

  constructor(ecs: ECS, broker: Broker, gridManager: GridManager) {
    this.ecs = ecs;
    this.broker = broker;
    this.gridManager = gridManager;
    // For now only allowing one player controlled entity and it will be the camera
    // this.playerEntity = this.ecs.entityManager.with(["camera"])[0];
    // this.collidableEntities = this.ecs.entityManager.with([
    //   "position",
    //   "collision",
    // ]);
  }

  update(dt: number) {
    // TODO: Ensure player is first in this order. Simplifies things a lot.
    const kineticEntities: KineticEntity[] = this.ecs.entityManager.with([
      "velocity",
      "transform",
    ]);
    const decelerationRate = this.deceleration * dt;

    for (const entity of kineticEntities) {
      const { velocity } = entity;
      const { position } = entity.transform;
      const { speed } = entity.movement;

      if (velocity.x === 0 && velocity.y === 0) continue;

      // Limit velocity to maximum speed
      // TODO: Instead of maxSpeed, maybe base speed. Dunno.
      let newVelocity = velocity.clampMagnitude(0, speed);

      // Apply velocity to update position
      const deltaPosition = newVelocity.scale(dt);

      // NOTE: If delta position is zero. We skip collision detection for this entity.
      if (deltaPosition.equals({ x: 0, y: 0 })) {
        continue;
      }

      const potentialPosition = position.add(deltaPosition);

      // Slow down!
      if (Vector2.magnitude(newVelocity) > 0) {
        const clampedMagnitude = Math.max(
          0,
          Vector2.magnitude(newVelocity) - decelerationRate
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

      // SO: Right now I'm not actually detecting wall collisions.
      if (entity.collisions && nextXTile && !nextXTile.accessible) {
        // Hit the wall.
        entity.collisions.push({
          entity: entity,
          collidedWith: nextXTile,
          axis: "x",
          overlap: 0,
          timestamp: Date.now(),
        });

        // TODO: We are still seeing projectiles skid off walls and sprites for a few frames before they react to teh collision. We need to stop updating the position immediately. Probably a friction thing in other games. Here I think I want to create materials, bounce, stop, slide... to simplify the wall interactions. Short term though. We'll just check if it's a projectile and early exit to prevent position updates.
        if (entity?.collisionLayer?.layer === CollisionLayer.PlayerProjectile) {
          continue;
        }
      }
      if (entity.collisions && nextYTile && !nextYTile.accessible) {
        // Hit the wall.
        entity.collisions.push({
          entity: entity,
          collidedWith: nextYTile,
          axis: "y",
          overlap: 0,
          timestamp: Date.now(),
        });
        if (entity?.collisionLayer?.layer === CollisionLayer.PlayerProjectile) {
          continue;
        }
      }

      const nextX = nextXTile?.accessible ? potentialPosition.x : position.x;
      const nextY = nextYTile?.accessible ? potentialPosition.y : position.y;

      const newPosition = new Vector2(nextX, nextY);

      // Perform entity collision detection against other colliders
      // TODO: Add collision information that would support bounce effect (angle of attack namely I think).
      if (entity.collider) {
        const collisionLayer =
          entity.collisionLayer?.layer ?? CollisionLayer.None; // Just in case for now, fall back to no layer.
        const collidingEntities: ObjectEntity[] = this.ecs.entityManager
          .with(["collider"])
          .filter((e) => e !== entity);

        // TODO: Why is it checking axis and then not doing it?
        // for (const axis of ["x", "y"]) {
        for (const collidingEntity of collidingEntities) {
          const collidingCollisionLayer =
            collidingEntity.collisionLayer?.layer ?? CollisionLayer.None;

          // Player Projectiles should not hit player.
          if (
            collisionLayer === CollisionLayer.PlayerProjectile &&
            collidingCollisionLayer === CollisionLayer.Player
          ) {
            continue;
          }
          if (
            collisionLayer === CollisionLayer.Player &&
            collidingCollisionLayer === CollisionLayer.PlayerProjectile
          ) {
            continue;
          }

          const collidingPosition = collidingEntity.transform.position!;
          const collidingCollider = collidingEntity.collider!;

          // THe following logic is only for AABB to AABB collisions
          if (
            collidingCollider.type !== "aabb" ||
            entity.collider.type !== "aabb"
          )
            continue;

          // Vertical collision check. Fun to feel like it's not all on a flat plane. Wait till we have birds! oooh

          const isOverhead =
            entity.transform.elevation >
            collidingEntity.transform.elevation +
              collidingEntity.transform.height;
          const isUnderfoot =
            entity.transform.elevation + entity.transform.height <
            collidingEntity.transform.elevation;

          if (isOverhead || isUnderfoot) {
            continue;
          }

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

            console.log(entity, collidingEntity);

            // Determine the axis with the smallest overlap
            if (xOverlap < yOverlap) {
              // Resolve collision along the X axis
              // These really need to be events so that either entity's controller can be subscribed and the physics system goes back to reporting. (With maybe some mechanism for whitelisting certain entity entity collisions)
              if (entity.collisions) {
                entity.collisions.push({
                  entity: entity,
                  collidedWith: collidingEntity,
                  axis: "x",
                  overlap: xOverlap,
                  timestamp: Date.now(),
                });
              }
              // TODO: Static objects are having their collisions array filling up with no handlers. Should start emiting events, can then look at sound handler that look for collisions and read sound based on entity sound component (from wad)
              // if (collidingEntity.collisions) {
              //   collidingEntity.collisions.push({
              //     entity: collidingEntity,
              //     collidedWith: entity,
              //     axis: "x",
              //     overlap: xOverlap,
              //     timestamp: Date.now(),
              //   });
              // }
              if (
                entity?.collisionLayer?.layer ===
                CollisionLayer.PlayerProjectile
              ) {
                continue;
              }

              // Don't be affected by things that aren't solid.
              // TODO: We are going to collide with it continuously if we're not careful
              if (!entity.collider.solid || !collidingEntity.collider?.solid) {
                continue;
              }

              newPosition.x +=
                newPosition.x < collidingPosition.x ? -xOverlap : xOverlap;
            } else {
              // Resolve collision along the Y axis
              if (entity.collisions) {
                entity.collisions.push({
                  entity: entity,
                  collidedWith: collidingEntity,
                  axis: "y",
                  overlap: yOverlap,
                  timestamp: Date.now(),
                });
              }
              // if (collidingEntity.collisions) {
              //   collidingEntity.collisions.push({
              //     entity: collidingEntity,
              //     collidedWith: entity,
              //     axis: "y",
              //     overlap: xOverlap,
              //     timestamp: Date.now(),
              //   });
              // }
              if (
                entity?.collisionLayer?.layer ===
                CollisionLayer.PlayerProjectile
              ) {
                continue;
              }

              // Don't be affected by things that aren't solid.
              // TODO: We are going to collide with it continuously if we're not careful
              if (!entity.collider.solid || !collidingEntity.collider?.solid) {
                continue;
              }

              newPosition.y +=
                newPosition.y < collidingPosition.y ? -yOverlap : yOverlap;
            }
          }
          // }
        }
      }

      // And now we have "collision" again!!
      this.ecs.entityManager.updateEntity(entity, {
        transform: {
          ...entity.transform,
          position: new Vector2(newPosition.x, newPosition.y),
        },
      });
    }
    // Collision check all entities with a velocity against other colliders. Mark collisions with current velocity.
    // However, instead of bouncing, maybe we should arrest movement on that plane similarly to above, then any extra things can occur. Or we can have collider types
  }
}
