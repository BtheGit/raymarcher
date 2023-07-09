import { GridManager } from "../GridManager/GridManager";
import {
  FriendlyDogEntity,
  GridNode,
  ObjectEntity,
  PlayerEntity,
} from "../raymarcher";
import { ECS } from "../utils/ECS/ECS";
import { Vector } from "../utils/math";

const WALK_SPEED = 0.05;

export const friendlyDogAI = (
  dt: number,
  ecs: ECS,
  gridManager: GridManager,
  entity: FriendlyDogEntity,
  player: PlayerEntity
) => {
  const stateComponent = entity.state;
  const { currentState, previousState } = stateComponent;
  let target = entity.ai.seekTarget.target;
  const path = entity.ai.seekPath.path;
  const currentPathIndex = entity.ai.seekPath.currentIndex;

  const distanceToPlayer = calculateDistance(
    player.transform.position,
    entity.transform.position
  );

  if (distanceToPlayer <= 4) {
    // Clear the path and target, and switch to idle state
    entity.ai.seekPath.path = null;
    entity.ai.seekTarget.target = null;
    entity.state.currentState = "state__idle";
    return;
  }

  // TODO: If the state is idle, switch back to wander, I'm going to make that discrete change now with a check so that later we can consider onStart specifics.
  if (currentState === "state__idle") {
    entity.state.currentState = "state__wander";
    // TODO: Reset animation (if it's a different one ... need a system to abstract that aspect away)
  }

  // TODO: Short term. If there are entity entity collisions. I really just want to reset the path and hope my system makes a new one. However, the bfs pathing doesn't take into account sprites. So really, the simplest thing to do is pick a new target and let that keep happening until we stop colliding. Not pretty, but the least amount of new processes until I figure out something better.
  if (entity.collisions?.length) {
    entity.collisions = [];
    entity.ai.seekTarget.target = null;
    entity.ai.seekPath.path = null;
  }

  if (!target) {
    // Find a new random spot on the map that is accessible
    const newTarget = gridManager.getRandomAccessibleGridLocation();
    if (!newTarget) {
      // TODO: If no accessible locations on map we have trouble!
      throw new Error("Ahhh, map has no accessible locations!");
    }

    target = entity.ai.seekTarget.target = new Vector(
      newTarget.gridLocation.x,
      newTarget.gridLocation.y
    );
  }

  // We have a target, but we need to make sure we have a path
  if (!path) {
    const newPath = gridManager.getPathAtoB(entity.transform.position, target);
    // TODO: Returning null for no viable path is gonna be trouble. either empty array or null. but dont want a loop of constantly trying to path too often in closed spaces. Maybe should also be checking for viability when getting random target?
    entity.ai.seekPath.path = newPath;
    entity.ai.seekPath.currentIndex = 0;
  } else {
    // We also need to ensure that the path is still for the current target
    //  TODO:
  }

  const distanceToTarget = calculateDistance(entity.transform.position, target);

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
    const direction = Vector.normalize(
      // TODO: This is madness. When I have time clean up all this type transformation
      new Vector(destination.x, destination.y).subtract(
        entity.transform.position
      )
    );

    // Update the velocity component to move towards the destination
    entity.velocity = direction.scale(WALK_SPEED);
    entity.transform.direction = direction;
  } else {
    // No valid target or path, clear the path
    // entity.ai.seekPath.path = [];
    // entity.ai.seekPath.currentIndex = 0;
    // TODO: Determine the behavior when there is no valid target or path
    // You can add logic here to handle the behavior when there is no valid target or path
  }
};

function calculateDistance(
  positionA: Vector | GridNode,
  positionB: Vector | GridNode
): number {
  const dx = positionB.x - positionA.x;
  const dy = positionB.y - positionA.y;
  return Math.sqrt(dx * dx + dy * dy);
}
