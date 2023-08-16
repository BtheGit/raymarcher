import { Entity } from "../types";
import { ECS, System } from "../utils/ECS/ECS";
import { PI2 } from "../constants";

export class BobbingMovementSystem implements System {
  private ecs: ECS;

  constructor(ecs: ECS) {
    this.ecs = ecs;
  }

  update(dt: number) {
    const bobbers: Entity = this.ecs.entityManager.with(["bobbingMovement"]);

    for (const bobber of bobbers) {
      const elapsedTime =
        (Date.now() - bobber.bobbingMovement.startTime) / 1000;

      // Calculate the elevation using a sine wave (and don't go in the ground!)
      const elevation = Math.max(
        bobber.bobbingMovement.initialElevation +
          bobber.bobbingMovement.amplitude *
            Math.sin(PI2 * bobber.bobbingMovement.frequency * elapsedTime),
        0
      );
      bobber.transform.elevation = elevation;
    }
  }
}
