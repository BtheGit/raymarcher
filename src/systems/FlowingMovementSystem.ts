import { GridManager } from "../GridManager/GridManager";
import { BaseObjectEntity } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { Vector2 } from "../utils/math";
import { PI2 } from "../constants";

// TODO: Making this a generic system, means we probably want actors to indicate their swarm influence. IE, should they be subtly guided by it (like things floating in a light wind current - TODO: add in a perlin noise based flow field for wind currents.) or very influenced (like enemies pathfinding)

// Making this generic also means we need to indicate the target. Ie, which field. For now, we'll do staight targets, later we can worry about wind currents.

export class FlowingMovementSystem implements System {
  private ecs: ECS;
  private gridManager: GridManager;

  constructor(ecs: ECS, gridManager: GridManager) {
    this.ecs = ecs;
    this.gridManager = gridManager;
  }

  update(dt: number) {
    const flowerEntities: BaseObjectEntity[] = this.ecs.entityManager.with([
      "flowingMovement",
    ]);

    for (const flowerEntity of flowerEntities) {
      const { flowingMovement } = flowerEntity;
      if (!flowingMovement) {
        return;
      }
      const { target, weight, speed } = flowingMovement;

      const flowField = this.gridManager.generateFlowField(target);
      if (!flowField) {
        //This should mean it was impossible to create a route.
        // TODO:
        return;
      }

      // TODO: https://howtorts.github.io/2014/01/04/basic-flow-fields.html Mayeb the fix is here?
      // // Calculate the position within the current tile (0 to 1)
      // const positionInTileX = flowerEntity.transform.position.x % 1;
      // const positionInTileY = flowerEntity.transform.position.y % 1;

      // // Find the current tile's flow field vector
      // const currTile = flowerEntity.transform.position.map(Math.floor);
      // const currentTileVector = flowField[currTile.y][currTile.x];

      // // Find the four closest tiles
      // const tileTopLeft = flowField[currTile.y][currTile.x];
      // const tileTopRight = flowField[currTile.y][currTile.x + 1];
      // const tileBottomLeft = flowField[currTile.y + 1][currTile.x];
      // const tileBottomRight = flowField[currTile.y + 1][currTile.x + 1];

      // const isTopLeftValid =
      //   tileTopLeft &&
      //   tileTopLeft[0] !== undefined &&
      //   tileTopLeft[1] !== undefined;
      // const isTopRightValid =
      //   tileTopRight &&
      //   tileTopRight[0] !== undefined &&
      //   tileTopRight[1] !== undefined;
      // const isBottomLeftValid =
      //   tileBottomLeft &&
      //   tileBottomLeft[0] !== undefined &&
      //   tileBottomLeft[1] !== undefined;
      // const isBottomRightValid =
      //   tileBottomRight &&
      //   tileBottomRight[0] !== undefined &&
      //   tileBottomRight[1] !== undefined;

      // // Interpolate the flow field vectors between the four closest tiles
      // let interpolatedFlowField = new Vector2(0, 0);

      // // Use weighted interpolation only if all adjacent tiles are valid
      // if (
      //   isTopLeftValid &&
      //   isTopRightValid &&
      //   isBottomLeftValid &&
      //   isBottomRightValid
      // ) {
      //   interpolatedFlowField = Vector2.lerp(
      //     Vector2.lerp(
      //       { x: tileTopLeft[0], y: tileTopLeft[1] },
      //       { x: tileTopRight[0], y: tileTopRight[1] },
      //       positionInTileX
      //     ),
      //     Vector2.lerp(
      //       { x: tileBottomLeft[0], y: tileBottomLeft[1] },
      //       { x: tileBottomRight[0], y: tileBottomRight[1] },
      //       positionInTileX
      //     ),
      //     positionInTileY
      //   );
      // } else {
      //   // Handle the case when there are no valid adjacent tiles or tile is unreachable
      //   // For example, you can choose not to interpolate and just use the current tile's vector
      //   interpolatedFlowField = new Vector2(
      //     currentTileVector[0],
      //     currentTileVector[1]
      //   );
      // }
      // // Optionally, scale the interpolated flow field velocity to control the entity's movement speed
      // const scalingFactor = 1; // Adjust the scaling factor as needed

      // // Combine the current tile's vector and the interpolated vector using weighted interpolation
      // const combinedFlowField = Vector2.lerp(
      //   { x: currentTileVector[0], y: currentTileVector[1] },
      //   interpolatedFlowField,
      //   weight
      // );

      // // Add the combined flow field velocity to the entity's current velocity
      // flowerEntity.velocity = flowerEntity.velocity!.add(combinedFlowField);
      // // flowerEntity.velocity = combinedFlowField.subtract(
      // //   flowerEntity.velocity!
      // // );
      // flowerEntity.transform.direction = flowerEntity.velocity;

      const currTile = flowerEntity.transform.position.map(Math.floor);
      const fieldTile = flowField[currTile.y][currTile.x];

      flowerEntity.velocity = flowerEntity.velocity!.scale(speed).add({
        x: fieldTile[0],
        y: fieldTile[1],
      });
      flowerEntity.transform.direction = flowerEntity.velocity;
    }
  }
}
