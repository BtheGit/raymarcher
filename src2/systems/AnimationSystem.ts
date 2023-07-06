import { AnimationComponent, Entity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";

export class AnimationSystem implements System {
  private ecs: ECS;
  private animatedEntities: Entity[];
  constructor(ecs: ECS) {
    this.ecs = ecs;
    this.animatedEntities = this.ecs.entityManager.with(["animation", "state"]);
  }

  update(dt: number) {
    for (const entity of this.animatedEntities) {
      const activeAnimation = (entity.animation as AnimationComponent)
        .animations[entity.state.currentState];
      if (activeAnimation) {
        entity.animation.timeSinceLastFrame += dt;

        if (entity.animation.timeSinceLastFrame >= activeAnimation.duration) {
          // TODO: Do I need to be setting this everytime?? Seems odd
          entity.animation.currentAnimation = activeAnimation.name;
          // entity.transform.direction.rotate(10); // Just for testing rotations
          entity.animation.currentFrame =
            (entity.animation.currentFrame + 1) % activeAnimation.frames.length;
          entity.animation.timeSinceLastFrame = 0;
        }
      }
    }
  }
}
