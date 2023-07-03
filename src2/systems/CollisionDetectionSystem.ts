import { Entity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";

export class CollisionDetectionSystem implements System {
  private playerEntity: Entity;
  private collidableEntities: Entity[];
  private ecs: ECS;

  constructor(ecs: ECS) {
    this.ecs = ecs;
    // For now only allowing one player controlled entity and it will be the camera
    this.playerEntity = this.ecs.entityManager.with(["camera"])[0];
    this.collidableEntities = this.ecs.entityManager.with([
      "position",
      "collision",
    ]);
  }

  update(dt: number) {
    // Check for all collisions between player and grid tiles.
    // Check for all collisions between player and collidable entities.
    // Check for all collisions between collidable entities and grid tiles.
    // Check for all collisions between collidable entities and themselves (if either has moved)
  }
}
