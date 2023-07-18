import { GridManager } from "../GridManager/GridManager";
import { CollisionLayer } from "../enums";
import {
  FriendlyDogEntity,
  GridNode,
  ObjectEntity,
  PlayerEntity,
} from "../raymarcher";
import { ECS } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { Vector2 } from "../utils/math";

// TODO: Make a generic of course that has the event system baked in
export class AIFriendlyDogSystem {
  private ecs: ECS;
  private broker: Broker;
  private gridManager: GridManager;
  private player: PlayerEntity;

  constructor(
    ecs: ECS,
    broker: Broker,
    gridManager: GridManager,
    player: PlayerEntity
  ) {
    this.ecs = ecs;
    this.broker = broker;
    this.gridManager = gridManager;
    this.player = player;

    // TODO: shared constants for collision events.
    this.broker.subscribe(
      "projectile_collision",
      this.handleProjectileCollision
    );
  }

  handleProjectileCollision = (e) => {
    // We only care about collisions with this ai.
    // TODO: Type all this later (though it's very hacky...)
    if (e.collidedWith?.ai?.aiType !== "dog_friendly") {
      return;
    }
    this.updateState(e.collidedWith, "state__hit");
    e.collidedWith.ai.seekTarget.target = null;
    e.collidedWith.ai.seekPath.path = null;
    e.collidedWith.velocity = new Vector2(0, 0);
  };

  // TODO: This is a stand-in for a generic state change mechanism, specifically in this case to allow us to reset time in state
  updateState = (entity, newState: string) => {
    const stateComponent = entity.state;
    const { currentState, states } = stateComponent;

    if (newState === currentState) {
      return;
    }

    // We should really be broadcasting this so the AI isn't responsible for manipulating the transformation of the
    // object directly. But oh well. I want to be able to opt in height change by state. Since heights are currently attached to objects, I'm optionally adding a height property to state objects. It's opt-in, but will be set on intiialization. Let's stuff like a kooopa troopa retreating to his shell look better.
    const stateObject = states[newState];
    entity.transform.height = stateObject.height;

    entity.state.previousState = currentState;
    entity.state.currentState = newState;
    entity.state.lastStateChange = Date.now();
  };

  update = (dt: number, entity: FriendlyDogEntity) => {
    const stateComponent = entity.state;
    const { currentState, previousState, lastStateChange } = stateComponent;
    let target = entity.ai.seekTarget.target;
    const path = entity.ai.seekPath.path;
    const currentPathIndex = entity.ai.seekPath.currentIndex;

    if (currentState === "state__hit") {
      const elapsedTime = Date.now() - lastStateChange;
      // For fun and more visceral feedback, let's spin these fellas.
      entity.transform.direction.rotate(dt);
      if (elapsedTime < 2000) {
        return;
      }

      this.updateState(entity, "state__idle");
    }

    const distanceToPlayer = calculateDistance(
      this.player.transform.position,
      entity.transform.position
    );

    // TODO: Short term. If there are entity entity collisions. I really just want to reset the path and hope my system makes a new one. However, the bfs pathing doesn't take into account sprites. So really, the simplest thing to do is pick a new target and let that keep happening until we stop colliding. Not pretty, but the least amount of new processes until I figure out something better.
    if (entity.collisions?.length) {
      entity.collisions = [];
      entity.ai.seekTarget.target = null;
      entity.ai.seekPath.path = null;
    }

    if (distanceToPlayer <= 2) {
      // Clear the path and target, and switch to idle state
      entity.ai.seekPath.path = null;
      entity.ai.seekTarget.target = null;
      const direction = Vector2.normalize(
        new Vector2(
          this.player.transform.position.x,
          this.player.transform.position.y
        ).subtract(entity.transform.position)
      );

      entity.transform.direction = direction;
      entity.velocity = new Vector2(0, 0);
      this.updateState(entity, "state__idle");
      return;
    }

    // TODO: If the state is idle, switch back to wander, I'm going to make that discrete change now with a check so that later we can consider onStart specifics.
    if (currentState === "state__idle") {
      this.updateState(entity, "state__wander");
      // TODO: Reset animation (if it's a different one ... need a system to abstract that aspect away)
    }

    if (!target) {
      // Find a new random spot on the map that is accessible
      const newTarget = this.gridManager.getRandomAccessibleGridLocation();
      if (!newTarget) {
        // TODO: If no accessible locations on map we have trouble!
        throw new Error("Ahhh, map has no accessible locations!");
      }

      target = entity.ai.seekTarget.target = new Vector2(
        newTarget.gridLocation.x,
        newTarget.gridLocation.y
      );
    }

    // We have a target, but we need to make sure we have a path
    if (!path) {
      const newPath = this.gridManager.getPathAtoB(
        entity.transform.position,
        target
      );
      // TODO: Returning null for no viable path is gonna be trouble. either empty array or null. but dont want a loop of constantly trying to path too often in closed spaces. Maybe should also be checking for viability when getting random target?
      entity.ai.seekPath.path = newPath;
      entity.ai.seekPath.currentIndex = 0;
    } else {
      // We also need to ensure that the path is still for the current target
      //  TODO:
    }

    const distanceToTarget = calculateDistance(
      entity.transform.position,
      target
    );

    // TODO: We're going to fudge by a fair bit here.
    if (distanceToTarget < 1) {
      // Target 'reached'
      entity.ai.seekPath.path = null;
      entity.ai.seekPath.currentIndex = 0;
      entity.ai.seekTarget.target = null;
    }

    // Check if there is a target and a valid path
    if (target && path && currentPathIndex < path.length) {
      const destination = path[currentPathIndex];
      const distanceToDestination = calculateDistance(
        entity.transform.position,
        destination
      );

      if (distanceToDestination <= 1) {
        // Reached the current destination, move to the next one
        entity.ai.seekPath.currentIndex++;
      }

      // Calculate the direction towards the destination
      const direction = Vector2.normalize(
        // TODO: This is madness. When I have time clean up all this type transformation
        new Vector2(destination.x, destination.y).subtract(
          entity.transform.position
        )
      );

      // Update the velocity component to move towards the destination
      entity.velocity = direction.scale(entity.movement.speed);
      entity.transform.direction = direction;
    } else {
      // No valid target or path, clear the path
      // entity.ai.seekPath.path = [];
      // entity.ai.seekPath.currentIndex = 0;
      // TODO: Determine the behavior when there is no valid target or path
      // You can add logic here to handle the behavior when there is no valid target or path
    }
  };
}

function calculateDistance(
  positionA: Vector2 | GridNode,
  positionB: Vector2 | GridNode
): number {
  const dx = positionB.x - positionA.x;
  const dy = positionB.y - positionA.y;
  return Math.sqrt(dx * dx + dy * dy);
}
