import { TextureManager } from "../TextureManager/TextureManager";
import { AnimatedObjectEntity } from "../types";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";

export class AnimationSystem implements System {
  private ecs: ECS;
  private textureManager: TextureManager;
  private broker: Broker;

  constructor(ecs: ECS, textureManager: TextureManager, broker: Broker) {
    this.ecs = ecs;
    this.textureManager = textureManager;
    this.broker = broker;
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

      // TODO: Could also just do a check for duration and if it's not there, treat it like infinity. Can stop using inifinty too and make the properties optional.
      if (!duration) {
        // This should let me skip state animations that are just one frame forever. They shouldn't have associated events either. I hope.??
        continue;
      }

      if (activeAnimation.timeSinceLastFrame >= duration) {
        const isLastFrame =
          activeAnimation.currentFrame >= activeAnimation.frames.length - 1;
        if (isLastFrame && !activeAnimation.looping) {
          // This should not be the first time we have gotten here, so if we dont' escape, we'll fire off events more than once.
          continue;
        } else if (isLastFrame && activeAnimation.looping) {
          activeAnimation.currentFrame = 0;
        } else {
          activeAnimation.currentFrame = activeAnimation.currentFrame + 1;
        }
        activeAnimation.timeSinceLastFrame = 0;
        // Now we look for any events associated with the current frame and play them (TODO: will be having events correlate to a frame in a looping animation only once. that's a trickier one. We ignore for now.)
        if (activeAnimation.events?.length) {
          const activeFrame =
            activeAnimation.frames[activeAnimation.currentFrame];
          for (const event of activeAnimation.events) {
            if (event.frameId === activeFrame.frameId) {
              // TODO: This won't be enough for positional sound if we need emitter. Should attach certain elements to all.
              this.broker.emit(event.eventType, {
                ...event.eventPayload,
                emitterEntity: entity,
              });
            }
          }
        }
      }
    }

    this.textureManager.update(dt);
  }
}
