import { GridManager } from "../GridManager/GridManager";
import { AIType } from "../enums";
import {
  AnimatedObjectEntity,
  DogFriendlyEntity,
  ObjectEntity,
  PlayerEntity,
} from "../types";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { AIDogFriendlySystem } from "./AIDogFriendlySystem";
import { AIBirdSkittishSystem } from "./AIBirdSkittishSystem";

// NOTE: This really only exists because we can't search by aiType directly. I could come up with a few solutions, but for now, I'm just going to have a bunch of AI system's plugged in that would otherwise be independent. But, to simplify, I will have each AISystem be a single update call for now.
export class AIControllerSystem implements System {
  private ecs: ECS;
  private broker: Broker;
  private intelligentEntities: ObjectEntity[];
  private playerEntity: PlayerEntity;
  private gridManager: GridManager;
  private aiSystems = new Map<string, any>();

  constructor(ecs: ECS, broker: Broker, gridManager: GridManager) {
    this.ecs = ecs;
    this.broker = broker;
    this.gridManager = gridManager;
    // Hacky way to exclude the player entity while we sort out that state situation
    this.intelligentEntities = this.ecs.entityManager.with(["ai"]);

    // There's genuinely no good reason to use multiples here. The chances of multiplayer every coming are pretty much none. So, for now, we'll cheat and just take the first (and only) one. The player controller system
    this.playerEntity = this.ecs.entityManager.with([
      "camera",
    ])[0] as PlayerEntity;

    this.aiSystems.set(
      AIType.DogFriendly,
      new AIDogFriendlySystem(
        this.ecs,
        this.broker,
        this.gridManager,
        this.playerEntity
      )
    );

    this.aiSystems.set(
      AIType.BirdSkittish,
      new AIBirdSkittishSystem(
        this.ecs,
        this.broker,
        this.gridManager,
        this.playerEntity
      )
    );
  }

  update(dt: number) {
    for (const entity of this.intelligentEntities) {
      const { aiType } = entity.ai!;
      const aiSystem = this.aiSystems.get(aiType);
      if (aiSystem) {
        aiSystem.update(dt, entity);
      }
    }
  }
}
