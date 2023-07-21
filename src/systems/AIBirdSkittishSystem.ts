import { GridManager } from "../GridManager/GridManager";
import { AIType, CollisionLayer, EventMessageName } from "../enums";
import {
  BirdSkittishEntity,
  EntityStateComponent,
  GridNode,
  ObjectEntity,
  PlayerEntity,
} from "../raymarcher";
import { ECS } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { Vector2 } from "../utils/math";

/**
 * An npc that wanders around the ground (or stays still until I have walking animations (maybe I can twitch them)), in one small area until a player gets too near and then flies off.
 *
 * - Can switch between flying and walking periodically during wander stage.
 * - Add swarm behavior when I have math for that.
 * - For now, since birds don't land, I can have them always oscillating on a sine wave to mimc floating in air a bit
 *
 * TODO: Once I have one or two more AIs, look at redundancy and common code to refactor.
 */

// TODO: Make a generic of course that has the event system baked in
export class AIBirdSkittishSystem {
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
      EventMessageName.ProjectileCollision,
      this.handleProjectileCollision
    );
  }

  handleProjectileCollision = (e) => {
    // We only care about collisions with this ai.
    // TODO: Type all this later (though it's very hacky...)
    if (e.collidedWith?.ai?.aiType !== AIType.BirdSkittish) {
      return;
    }
    this.updateState(e.collidedWith, "state__hit");
    e.collidedWith.ai.seekTarget.target = null;
    e.collidedWith.ai.seekPath.path = null;
    e.collidedWith.velocity = new Vector2(0, 0);
  };

  // TODO: This is a stand-in for a generic state change mechanism, specifically in this case to allow us to reset time in state
  updateState = (entity, newState: string) => {
    const stateComponent: EntityStateComponent = entity.state;
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

    if (stateObject.bobbingMovement) {
      entity.bobbingMovement = {
        initialElevation: entity.transform.elevation,
        amplitude: stateObject.bobbingMovement.amplitude,
        frequency: stateObject.bobbingMovement.frequency,
        startTime: Date.now(),
      };
    } else {
      this.ecs.entityManager.removeComponentFromEntity(
        entity,
        "bobbingMovement"
      );
    }
  };

  setIdleState = (entity: BirdSkittishEntity) => {
    this.updateState(entity, "state__idle");
    entity.velocity = new Vector2(0, 0);
  };

  setFleeState = (entity: BirdSkittishEntity) => {
    // Clear the path and target, and switch to idle state

    // This is the math to face a player. Keep it for later, but it's not what we need
    // entity.ai.seekPath.path = null;
    // entity.ai.seekTarget.target = null;
    // const direction = Vector2.normalize(
    //   new Vector2(
    //     this.player.transform.position.x,
    //     this.player.transform.position.y
    //   ).subtract(entity.transform.position)
    // );

    // entity.transform.direction = direction;
    // entity.velocity = new Vector2(0, 0);
    this.updateState(entity, "state__flee");
    const newTarget = this.getFleeTarget(entity);
    if (!newTarget) {
      return;
    }

    // const direction = Vector2.normalize(
    //   new Vector2(target.x, target.y).subtract(entity.transform.position)
    // );
    // entity.transform.direction = direction;

    const newPath = this.gridManager.getPathAtoB(
      entity.transform.position,
      newTarget
    );

    // TODO: Returning null for no viable path is gonna be trouble. either empty array or null. but dont want a loop of constantly trying to path too often in closed spaces. Maybe should also be checking for viability when getting random target?
    entity.ai.seekTarget.target = newTarget;
    entity.ai.seekPath.path = newPath;
    entity.ai.seekPath.currentIndex = 0;

    entity.velocity = entity.transform.direction.scale(
      0.5 * entity.movement.speed
    );
  };

  // I'd lilke to generify this process and move it to the grid manager for other ai type to reuse
  getFleeTarget = (entity: BirdSkittishEntity) => {
    const FLEE_DISTANCE = 5;

    const maxAttempts = 10;
    const maxSampleRadius = 7;
    const reverseDistance = 10; // Distance threshold to start moving in the opposite direction

    const fleeDirection = Vector2.normalize(
      this.player.transform.position
        .add(this.player.velocity.scale(2))
        .subtract(entity.transform.position)
    );

    let fleeTarget = entity.transform.position.add(
      fleeDirection.scale(FLEE_DISTANCE)
    );

    if (!this.gridManager.isTileAccessible(fleeTarget.x, fleeTarget.y)) {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        for (let i = 0; i < 10; i++) {
          const sampleRadius = ((attempt + 1) * maxSampleRadius) / maxAttempts;
          const randomAngle = Math.random() * Math.PI * 2;
          const randomOffset = new Vector2(
            Math.cos(randomAngle),
            Math.sin(randomAngle)
          ).scale(sampleRadius);
          fleeTarget = entity.transform.position
            .add(fleeDirection.scale(FLEE_DISTANCE))
            .add(randomOffset);

          if (
            this.gridManager.isTileAccessible(
              Math.floor(fleeTarget.x),
              Math.floor(fleeTarget.y)
            )
          ) {
            return fleeTarget.map(Math.floor);
          }
        }

        // If the distance from the initial AI position exceeds reverseDistance, move in the opposite direction of the player
        if (
          entity.transform.position.subtract(fleeTarget).length() >
          reverseDistance
        ) {
          fleeDirection.scale(-1);
        }
      }

      // If no valid destination found after all attempts, return null
      return null;
    }

    return fleeTarget;
  };

  update = (dt: number, entity: BirdSkittishEntity) => {
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

      this.setIdleState(entity);
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

    // TODO: If the state is idle, switch back to wander, I'm going to make that discrete change now with a check so that later we can consider onStart specifics.
    if (currentState === "state__flee" && distanceToPlayer > 4) {
      // Make this a random chance to switch to create the effect of different flight paths
      if (Math.random() > 0.95) {
        this.setIdleState(entity);
      }
      // TODO: Reset animation (if it's a different one ... need a system to abstract that aspect away)
    }

    if (currentState === "state__flee") {
      if (!entity.ai.seekTarget.target) {
        // Whelp. Couldn't figure out where to go. Need to fix target algorithm. But lets quit.
        this.setIdleState(entity);
      } else {
        const distanceToTarget = calculateDistance(
          entity.transform.position,
          entity.ai.seekTarget.target
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
      }
    }

    if (currentState !== "state__flee" && distanceToPlayer <= 2) {
      this.setFleeState(entity);
      return;
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
