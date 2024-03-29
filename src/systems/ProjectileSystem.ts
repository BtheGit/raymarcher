import {
  MagicShotProjectileEntity,
  EmitProjectileEvent,
  DestroyProjectileEvent,
  ProjectileEntity,
} from "../types";
import { CollisionLayer, EventMessageName, ProjectileState } from "../enums";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { Vector2 } from "../utils/math";
import { GridManager } from "../GridManager/GridManager";

export class ProjectileSystem implements System {
  private ecs: ECS;
  private broker: Broker;
  private gridManager: GridManager;

  constructor(ecs: ECS, broker: Broker, gridManager: GridManager) {
    this.ecs = ecs;
    this.broker = broker;
    this.gridManager = gridManager;
    this.broker.subscribe(
      EventMessageName.EmitProjectile,
      this.handleEmitProjectile
    );
    this.broker.subscribe(
      EventMessageName.DestroyProjectile,
      this.handleDestroyProjectile
    );
  }

  handleEmitProjectile = (event: EmitProjectileEvent) => {
    // TODO: Switch on types of projectiles. For now, only handling ball.
    const { projectileType } = event;
    switch (projectileType) {
      // TODO: Replace with enum
      case "magic_shot":
        this.newMagicShot(event);
        break;
    }
  };

  handleDestroyProjectile = (e) => {
    // For now, blindly remove the entity.
    this.removeProjectile(e.projectile);
  };

  removeProjectile = (entity) => {
    this.gridManager.removeObjectEntityGridTracking(entity);
    this.ecs.entityManager.remove(entity);
  };

  emitCollisionEvent = (projectile, collision) => {
    this.broker.emit(EventMessageName.ProjectileCollision, {
      name: EventMessageName.ProjectileCollision,
      projectileType: "magic_shot",
      emitter: "player",
      entityEmitter: projectile,
      timestamp: Date.now(), // Since this isn't the same exact event as the initial collision, probabl ya  new timestamp?
      collidedWith: collision.collidedWith, // This reference shoudl still be there, but the ball won't be, so we need to include pertinent information. If there were physics we'd include that kind of stuff, but not right now.
      collisionLayer: CollisionLayer.PlayerProjectile, // TODO: Support NPC projectiles?
    });
  };

  updateProjectileState = (
    projectileEntity: MagicShotProjectileEntity,
    newState: ProjectileState
  ) => {
    if (projectileEntity.state.currentState === newState) {
      return;
    }

    // TODO: I could deep clone instead of transfering references. Maybe better for GC.

    projectileEntity.state.previousState = projectileEntity.state.currentState;
    projectileEntity.state.lastStateChange = Date.now();
    projectileEntity.state.currentState = newState;

    // TODO: My big issue is that it's not reseting frame information inside the animations. I should move the entity into an asset manager like the weapons so that every time I switch state, I'm guaranteed initial state again without having to manually go in and clear it all.
  };

  newMagicShot = (event: EmitProjectileEvent) => {
    // TODO: I'm cheating here since I'm sadly using an entity reference to find and delete the entity. So I need a reference to it, which is not available if I declar it in one pass. I of course should be using ids.
    // I won't be able to do this anyway, if animations are defined in the wad. So, this is just a short term thing (read: permanent) so I can get features (read, pragmatic and never gonna change)
    const newEntity: MagicShotProjectileEntity = this.ecs.entityManager.add({
      objectType: "object__animated",
      projectileType: "magic_shot",
      transform: {
        position: event.origin,
        direction: event.direction, // I think this is unnecessary with projectiles, they should always have a velocity
        height: 32,
        elevation: 96,
      },
      velocity: event.velocity,
      state: {
        currentState: ProjectileState.Active,
        previousState: null,
        initialState: ProjectileState.Active,
        lastStateChange: Date.now(),
        states: {
          [ProjectileState.Active]: {
            name: "ms_state_active", // TODO: Names for what?
            animation: {
              name: "ms_anim_active", // TODO: Names for what?
              frames: [
                {
                  frameId: "D2FXA",
                  directions: 8,
                },
                {
                  frameId: "D2FXB",
                  directions: 8,
                },
                {
                  frameId: "D2FXC",
                  directions: 8,
                },
                {
                  frameId: "D2FXD",
                  directions: 8,
                },
                {
                  frameId: "D2FXE",
                  directions: 8,
                },
              ],
              frameDuration: 100,
              looping: true,
              events: [],
              currentFrame: 0,
              timeSinceLastFrame: 0,
            },
          },
          [ProjectileState.Destroying]: {
            name: "ms_state_destroying",
            animation: {
              name: "ms_anim_destroying",
              frames: [
                {
                  frameId: "D2FXG",
                  directions: 0,
                },
                {
                  frameId: "D2FXH",
                  directions: 0,
                },
                {
                  frameId: "D2FXI",
                  directions: 0,
                },
                {
                  frameId: "D2FXJ",
                  directions: 0,
                },
                {
                  frameId: "D2FXK",
                  directions: 0,
                },
                {
                  frameId: "D2FXL",
                  directions: 0,
                },
              ],
              frameDuration: 50,
              looping: false,
              events: [],
              currentFrame: 0,
              timeSinceLastFrame: 0,
            },
          },
        },
      },
      lifetime: 2000,
      movement: {
        speed: event.speed,
      },
      collider: event.collider,
      collisions: [],
      collisionLayer: {
        layer: CollisionLayer.PlayerProjectile,
      },
      spatialPartitioningSettings: {
        // These are fudge values since figuring out the width is annoying. 30 should be plenty.
        width: 30,
        gridLocations: new Set(),
      },
    });
    newEntity.state.states[ProjectileState.Destroying].animation.events!.push({
      frameId: "D2FXL",
      eventType: EventMessageName.DestroyProjectile,
      eventPayload: {
        projectile: newEntity,
      },
    });
    this.gridManager.updateObjectEntityGridTracking(newEntity);
  };

  update(dt: number): void {
    const projectiles: MagicShotProjectileEntity[] =
      this.ecs.entityManager.with(["projectileType"]);
    for (const projectile of projectiles) {
      if (projectile.collisions?.length) {
        // TODO: ? Ok, so I've been having trouble resolving projectile collisions with enemies because the enemies lose their reference to the projectile when it's removed, before they act on it. There are lots of solutions. But really, I like event systems anyway, so I'd rather move in that direction. Even if it's not appropriate. So we're going to publish an event on projectile collision with an entity. Later we can worry about layers, but right now, meh. Let the different controllers listen and determine if they care. Now, because I'm doing it this way, I can just pass the entity reference. Not ideal but, stop me. I'm sleepy and I want this feature. :) I could be doing this right in the physics system as well of course... But this preserves order of operations at least I guess. As in, the bullet detects the hit and then hits the character in turn.
        for (const collision of projectile.collisions) {
          this.emitCollisionEvent(projectile, collision);
        }

        // I want projectile animations (like explosions) to render in front of what it collided with, so I need to move the projectile back along the plane to just before the point of intersection. I'm guessing this will be painful, but I'm going to take a rough first stab.
        // Here's my dumb approach.
        // use the first reported collision. That's presumably the closest.
        // Look at recorded overlap . Unfortunately we can't just walk back the position on that axis, it's too broad. In fact we just want to reverse the direction and move in that reversed direction
        const collision = projectile.collisions[0]; // If I want other systems to listen I should emit a sound event probably and pop this, for now, just going to peek

        const overlap = collision.overlap - 0.2; // 0.2 is just from playing around. This is very fidgety.
        projectile.transform.direction =
          projectile.transform.direction.scale(-1);
        const reverseVector = projectile.transform.direction.scale(overlap);

        // TODO: If there's a bug with projectiles not rendering when they explode, it's probably because I'm not updating their spatial partition tracking after this little adjustment (to avoid going in walls).
        projectile.transform.position =
          projectile.transform.position.subtract(reverseVector);
        // now, all we do is walk back the position as much as the overlap, and add a fraction for padding. Issue is going to be negative or positive first.

        // We want to change this. Instead we are going to change the entity state
        projectile.lifetime = Infinity;
        projectile.movement.speed = 0;

        // We don't want any new collisions being generated.
        delete projectile.collider;
        delete projectile.collisions;
        this.updateProjectileState(projectile, ProjectileState.Destroying);
        // this.ecs.entityManager.remove(projectile);
        continue;
      }
      // TODO: Different animation played at destroy (will need to make stationary, remove collider, and play animation before destroying entity. (or just particle effect entity?))
      if (projectile.projectileType === "magic_shot") {
        if (projectile.lifetime < 0) {
          // Simply remove the entity, no animations.
          this.removeProjectile(projectile);
          continue;
        }
        // Short term, destroy on collision with anything. (Obviously lots of issues with short sprites and such. Someday a z axis...)
        // NOTE: This barely works, entity's bounding boxes are all over teh place. will need to figure out how to visualize those.

        projectile.lifetime -= dt;
        const velocity = new Vector2(0, 0).add(
          projectile.transform.direction.scale(projectile.movement.speed)
        );
        if (!velocity.equals(projectile.velocity)) {
          this.ecs.entityManager.updateEntity(projectile, { velocity });
        }
      }
    }
  }
}
