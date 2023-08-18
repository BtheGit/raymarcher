/**
 * This is really just going to be a placeholder for all interactions that are scripted. I'd like something more modular, but I really only can think of a few events I need to support. Destroying pickups on collision with player. And triggering portals. Portals themselves will have to be built to point at a specific level. Which is not ideal behavior, but so it goes. In addition, since I'm currently reseting most of the game when loading a level (and hoping to have the GC grab stale references, I'd rather not share an event handler directly between the outer loop and the level, so I'm going to use actual dom events to broadcast a level change.)
 */

import { GridManager } from "../GridManager/GridManager";
import {
  CustomEventType,
  EventMessageName,
  GameActorType,
  GameEvent,
} from "../enums";
import { BaseObjectEntity, Entity } from "../types";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";

export class InteractionSystem implements System {
  ecs: ECS;
  broker: Broker;
  gridManager: GridManager;

  constructor(ecs: ECS, broker: Broker, gridManager: GridManager) {
    this.ecs = ecs;
    this.broker = broker;
    this.gridManager = gridManager;

    this.broker.subscribe(
      EventMessageName.PlayerActorCollision,
      this.handlePlayerActorCollision
    );
  }

  handlePlayerActorCollision = (event) => {
    switch (event.actor) {
      case GameActorType.Portal:
      case GameActorType.Book:
      case GameActorType.Coin: {
        this.gridManager.removeObjectEntityGridTracking(
          event.collidedWithEntity
        );
        this.ecs.entityManager.remove(event.collidedWithEntity);
      }
    }
  };
  update(dt: number) {
    const portals: BaseObjectEntity[] = this.ecs.entityManager.queryEntities(
      (entity: Entity) => {
        return entity?.actor === GameActorType.Portal;
      }
    );

    for (const portal of portals) {
      // NOTE: There should be one for now, so we hard code the action (including the level change. Just to test)
      if (portal.collisions?.length) {
      }
    }
  }
}
