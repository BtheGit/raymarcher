// This lets us share animations between entities, but also have a fallback for all entity states without one.

import { AnimationDefinition } from "../types";

export class AnimationManager {
  private animations = new Map<string, AnimationDefinition>();

  loadAnimations(animations: AnimationDefinition[]) {
    for (const animation of animations) {
      this.loadAnimation(animation);
    }
  }

  loadAnimation(animation: AnimationDefinition) {
    this.animations.set(animation.name, animation);
  }

  getAnimation(animationName: string) {
    // TODO: Add fallback animation
    return this.animations.get(animationName);
  }
}
