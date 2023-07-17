import { BallProjectileEntity, EmitProjectileEvent } from "../raymarcher";
import { CollisionLayer } from "../enums";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { Vector2 } from "../utils/math";

export class ProjectileSystem implements System {
  private ecs: ECS;
  private broker: Broker;

  constructor(ecs: ECS, broker: Broker) {
    this.ecs = ecs;
    this.broker = broker;
    this.broker.subscribe("emit_projectile", this.handleEmitProjectile);
  }

  handleEmitProjectile = (event: EmitProjectileEvent) => {
    // TODO: Switch on types of projectiles. For now, only handling ball.
    const { type } = event;
    switch (type) {
      // TODO: Add gravity, etc?
      case "ball":
        this.newBallEntity(event);
        break;
    }
  };

  emitCollisionEvent = (collision) => {
    this.broker.emit("projectile_collision", {
      name: "projectile_collision",
      projectileType: "ball",
      emitter: "player",
      timestamp: Date.now(), // Since this isn't the same exact event as the initial collision, probabl ya  new timestamp?
      collidedWith: collision.collidedWith, // This reference shoudl still be there, but the ball won't be, so we need to include pertinent information. If there were physics we'd include that kind of stuff, but not right now.
      collisionLayer: CollisionLayer.PlayerProjectile, // TODO: Support NPC projectiles?
    });
  };

  newBallEntity = (event: EmitProjectileEvent) => {
    const newEntity: BallProjectileEntity = {
      objectType: "object__static",
      projectileType: "ball",
      transform: {
        position: event.origin,
        direction: event.direction, // I think this is unnecessary with projectiles, they should always have a velocity
        height: 32,
        elevation: 96,
      },
      velocity: event.velocity,
      sprite: event.sprite,
      lifetime: 2000,
      movement: {
        speed: event.speed,
      },
      collider: event.collider,
      collisions: [],
      collisionLayer: {
        layer: CollisionLayer.PlayerProjectile,
      },
    };
    this.ecs.entityManager.add(newEntity);
  };

  update(dt: number): void {
    const projectiles: BallProjectileEntity[] = this.ecs.entityManager.with([
      "projectileType",
    ]);
    for (const projectile of projectiles) {
      if (projectile.collisions.length) {
        // TODO: ? Ok, so I've been having trouble resolving projectile collisions with enemies because the enemies lose their reference to the projectile when it's removed, before they act on it. There are lots of solutions. But really, I like event systems anyway, so I'd rather move in that direction. Even if it's not appropriate. So we're going to publish an event on projectile collision with an entity. Later we can worry about layers, but right now, meh. Let the different controllers listen and determine if they care. Now, because I'm doing it this way, I can just pass the entity reference. Not ideal but, stop me. I'm sleepy and I want this feature. :) I could be doing this right in the physics system as well of course... But this preserves order of operations at least I guess. As in, the bullet detects the hit and then hits the character in turn.
        for (const collision of projectile.collisions) {
          this.emitCollisionEvent(collision);
        }

        // Destroy the entity.
        this.ecs.entityManager.remove(projectile);
        continue;
      }
      // TODO: I'd lvoe to bounce off walls (and ground), but short term I'm just going to destroy on collision.
      // TODO: Different animation played at destroy (will need to make stationary, remove collider, and play animation before destroying entity. (or just particle effect entity?))
      if (projectile.projectileType === "ball") {
        if (projectile.lifetime < 0) {
          // Destroy the entity.
          this.ecs.entityManager.remove(projectile);
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
