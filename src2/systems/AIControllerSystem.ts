import { GridManager } from "../GridManager/GridManager";
import {
  AnimatedObjectEntity,
  FriendlyDogEntity,
  ObjectEntity,
  PlayerEntity,
} from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { friendlyDogAI } from "./AIFriendlyDogSystem";

// NOTE: This really only exists because we can't search by aiType directly. I could come up with a few solutions, but for now, I'm just going to have a bunch of AI system's plugged in that would otherwise be independent. But, to simplify, I will have each AISystem be a single update call for now.
export class AIControllerSystem implements System {
  private ecs: ECS;
  private intelligentEntities: ObjectEntity[];
  private playerEntity: PlayerEntity;
  private gridManager: GridManager;

  constructor(ecs: ECS, gridManager: GridManager) {
    this.ecs = ecs;
    this.gridManager = gridManager;
    // Hacky way to exclude the player entity while we sort out that state situation
    this.intelligentEntities = this.ecs.entityManager.with(["ai"]);

    // There's genuinely no good reason to use multiples here. The chances of multiplayer every coming are pretty much none. So, for now, we'll cheat and just take the first (and only) one. The player controller system
    this.playerEntity = this.ecs.entityManager.with([
      "camera",
    ])[0] as PlayerEntity;
  }

  update(dt: number) {
    for (const entity of this.intelligentEntities) {
      const { aiType } = entity.ai!;
      // TODO: Switch or Map or AI Manager or...
      if (aiType === "dog_friendly") {
        friendlyDogAI(
          dt,
          this.ecs,
          this.gridManager,
          entity as FriendlyDogEntity,
          this.playerEntity
        );
      }
    }
  }
}
