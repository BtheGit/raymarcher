/**
 * The purpose of the Grid Manager is to sit alongside the regular ECS system and allow O(1) lookups of grid locations. To that end, we're just going to add grid locations through it so we maintain a separate index. (It's really just another layer of abstraction over the straight grid but with shared poitners to the entities in the ECS). Later I'd like to support more (like all entities with a grid location, not just one per location representing the map tile.)
 */

import { GridTileEntity, WADGrid } from "../raymarcher";
import { ECS } from "../utils/ECS/ECS";

export class GridManager {
  private grid: Map<string, GridTileEntity> = new Map();
  private ecs: ECS;
  private _rows = 0;
  private _columns = 0;

  constructor(ecs: ECS) {
    this.ecs = ecs;
  }

  private getGridIndexKeyFromEntity(entity: GridTileEntity): string {
    const { x, y } = entity.gridLocation;
    return `${x}:${y}`;
  }

  private getGridIndexKey(x: number, y: number): string {
    return `${x}:${y}`;
  }

  loadGrid(grid: WADGrid) {
    this.grid = new Map();
    this._rows = grid.length;
    this._columns = grid[0].length;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const gridCell = grid[y][x];
        const { type, accessible, texture, ceiling, faces } = gridCell;

        const entity: GridTileEntity = {
          type,
          gridLocation: { x, y },
          accessible,
        };

        if (type === "floor") {
          entity.floorTile = {
            surface: texture.type,
            texture: { name: texture.textureName! },
          };

          if (ceiling) {
            entity.floorTile.ceiling = {
              surface: ceiling.type,
              texture: { name: ceiling.textureName! },
            };
          }
        } else if (type === "wall") {
          entity.wallTile = {
            surface: texture.type,
            texture: { name: texture.textureName! },
          };

          // TODO: Faces
        }

        this.addEntity(entity);
      }
    }
  }

  get rows() {
    return this._rows;
  }

  get columns() {
    return this._columns;
  }

  isTileAccessible(x: number, y: number) {
    return this.getGridTile(x, y)?.accessible;
  }

  addEntity(entity: GridTileEntity) {
    const key = this.getGridIndexKeyFromEntity(entity);
    this.grid.set(key, entity);
    this.ecs.entityManager.add(entity);
  }

  getGridTile(x: number, y: number) {
    const key = this.getGridIndexKey(x, y);
    return this.grid.get(key);
  }

  getGridTileFromCoord(x: number, y: number) {
    return this.getGridTile(Math.floor(x), Math.floor(y));
  }

  // removeEntity() // TODO: Maybe later. But for now, since it's just grid tiles, we never remove anything. When we add in other things with grid location, maybe (like lights or effects or...I dunno.)
}
