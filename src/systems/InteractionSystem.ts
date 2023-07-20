/**
 * This is really just going to be a placeholder for all interactions that are scripted. I'd like something more modular, but I really only can think of a few events I need to support. Destroying pickups on collision with player. And triggering portals. Portals themselves will have to be built to point at a specific level. Which is not ideal behavior, but so it goes. In addition, since I'm currently reseting most of the game when loading a level (and hoping to have the GC grab stale references, I'd rather not share an event handler directly between the outer loop and the level, so I'm going to use actual dom events to broadcast a level change.)
 */

import { GameActorType } from "../enums";
import { BaseObjectEntity, Entity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";

export class InteractionSystem implements System {
  ecs: ECS;
  broker: Broker;

  constructor(ecs: ECS, broker: Broker) {
    this.ecs = ecs;
    this.broker = broker;

    this.broker.subscribe(
      "player_actor_collision",
      this.handlePlayerActorCollision
    );
  }

  handlePlayerActorCollision = (event) => {
    console.log(event);
    switch (event.actor) {
      case GameActorType.Portal: {
        // Prevent any more collisions before anything else.
        this.ecs.entityManager.remove(event.entity);
        // Emit level change action. (Hard coding this behavior for now.)
        // TODO: add level specification.
        // TODO: Generify portal to allow other actions? Or make a trigger instead and forget portal, it's just one trigger behavior?
        document.dispatchEvent(
          new CustomEvent("game_event", {
            detail: {
              type: "load_level",
              // TODO: Support specifying data later.
              // data: {
              //   level: 'fsdfsdf'
              // }
            },
          })
        );
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
        console.log(portal.collisions);
      }
    }
  }
}
