import { BallProjectileEntity, EmitProjectileEvent } from "../raymarcher";
import { CollisionLayer } from "../enums";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { Vector } from "../utils/math";

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

  newBallEntity = (event: EmitProjectileEvent) => {
    const newEntity: BallProjectileEntity = {
      objectType: "object__static",
      projectileType: "ball",
      transform: {
        position: event.origin,
        direction: event.direction, // I think this is unnecessary with projectiles, they should always have a velocity
        scale: new Vector(0.1, 0.1),
      },
      velocity: event.velocity,
      sprite: event.sprite,
      lifetime: 2000,
      speed: event.speed,
      collider: event.collider,
      collisions: [],
      collisionLayer: {
        layer: CollisionLayer.Player,
      },
    };
    this.ecs.entityManager.add(newEntity);
  };

  update(dt: number): void {
    const projectiles: BallProjectileEntity[] = this.ecs.entityManager.with([
      "projectileType",
    ]);
    for (const projectile of projectiles) {
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
        // if (projectile.collisions.length) {
        //   // Destroy the entity.
        //   this.ecs.entityManager.remove(projectile);
        //   continue;
        // }
        projectile.lifetime -= dt;
        const velocity = new Vector(0, 0).add(
          projectile.transform.direction.scale(projectile.speed)
        );
        if (!velocity.equals(projectile.velocity)) {
          this.ecs.entityManager.updateEntity(projectile, { velocity });
        }
      }
    }
  }
}
