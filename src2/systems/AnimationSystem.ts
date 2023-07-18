import { TextureManager } from "../TextureManager/TextureManager";
import { AnimatedObjectEntity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";

export class AnimationSystem implements System {
  private ecs: ECS;
  private textureManager: TextureManager;

  constructor(ecs: ECS, textureManager: TextureManager) {
    this.ecs = ecs;
    this.textureManager = textureManager;
  }

  update(dt: number) {
    // Hacky way to exclude the player entity while we sort out that state situation
    // Obviously not caching entities is a problem, but we should do the caching on the query side so the ECS can update the query when it knows entities have changed.
    const animatedEntities: AnimatedObjectEntity[] = this.ecs.entityManager
      .with(["state"])
      .filter((e) => e.objectType === "object__animated");

    for (const entity of animatedEntities) {
      const currentStateKey = entity.state.currentState;
      const currentState = entity.state.states[currentStateKey];
      const activeAnimation = currentState?.animation;
      if (!activeAnimation) {
        continue;
      }
      const { frameDuration, currentFrame } = activeAnimation;

      const activeFrame = activeAnimation.frames[currentFrame];

      activeAnimation.timeSinceLastFrame += dt;
      // NOTE: Animations have a base duration but frames can override that, need to check
      const duration = activeFrame.duration
        ? activeFrame.duration
        : frameDuration;

      // NOTE:
      // TODO: Implement non-looping. For now we ignore, but we'll need to handle. also need to
      // figure out what to do with a change in state based on animation flag.

      // TODO: Going to have to reset state frame counters since we are operating on teh original settings object... Should probably make a copy.

      if (activeAnimation.timeSinceLastFrame >= duration) {
        activeAnimation.currentFrame =
          (activeAnimation.currentFrame + 1) % activeAnimation.frames.length;
        activeAnimation.timeSinceLastFrame = 0;
      }
    }

    this.textureManager.update(dt);
  }
}
