/**
 * The purpose of the Grid Manager is to sit alongside the regular ECS system and allow O(1) lookups of grid locations. To that end, we're just going to add grid locations through it so we maintain a separate index. (It's really just another layer of abstraction over the straight grid but with shared poitners to the entities in the ECS). Later I'd like to support more (like all entities with a grid location, not just one per location representing the map tile.)
 */

import { GridCoord, GridTileEntity, WADGrid } from "../raymarcher";
import { ECS } from "../utils/ECS/ECS";
import { shortestPathBFS } from "../utils/bfs";
import { LRUCache } from "../utils/cache";
import { Vector2 } from "../utils/math";

const CACHE_LIMIT = 20;

export class GridManager {
  private grid: Map<string, GridTileEntity> = new Map();
  private ecs: ECS;
  private _rows = 0;
  private _columns = 0;

  private flowFields = new LRUCache<string, [number, number][][]>(CACHE_LIMIT); // TODO: Determine memory usage and valid size limit. Probably pretty high.

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
        const { type, accessible, texture, ceiling, wallFaces } = gridCell;

        const entity: GridTileEntity = {
          type,
          gridLocation: { x, y },
          accessible,
        };

        if (type === "floor") {
          if (texture.type === "color") {
            entity.floorTile = {
              surface: texture.type,
              color: texture.color,
            };
          } else {
            entity.floorTile = {
              surface: texture.type,
              texture: { name: texture.textureName! },
            };
          }

          if (ceiling) {
            if (ceiling.type === "color") {
              entity.floorTile.ceiling = {
                surface: ceiling.type,
                color: ceiling.color,
              };
            } else {
              entity.floorTile.ceiling = {
                surface: ceiling.type,
                texture: { name: ceiling.textureName! },
              };
            }
          }
        } else if (type === "wall") {
          if (texture.type === "color") {
            entity.wallTile = {
              surface: texture.type,
              color: texture.color,
            };
          } else {
            entity.wallTile = {
              surface: texture.type,
              texture: { name: texture.textureName! },
            };
          }

          // TODO: wallFaces
          if (wallFaces && wallFaces.length) {
            entity.wallTile.wallFaces = wallFaces;
          }
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

  get height() {
    return this._rows;
  }

  get width() {
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

  getRandomAccessibleGridLocation() {
    const maxAttempts = this._columns * this._rows; // Maximum number of attempts to find an accessible location
    const possibleLocations: GridTileEntity[] = [];

    // Populate the set with all possible locations
    for (let x = 0; x < this._columns; x++) {
      for (let y = 0; y < this._rows; y++) {
        const location = this.getGridTile(x, y);
        if (location?.accessible) {
          possibleLocations.push(location);
        }
      }
    }

    for (let i = maxAttempts - 1; i > 0; i--) {
      if (possibleLocations.length === 0) {
        break; // No accessible locations left, exit the loop
      }

      const randomIndex = Math.floor(Math.random() * possibleLocations.length);
      const location = possibleLocations[randomIndex];

      possibleLocations.splice(randomIndex, 1); // Remove the selected location from the set

      // TODO: Why is it erroring? How is this not a valid location?
      if (location?.accessible) {
        return location;
      }
    }

    return null; // Return null if no accessible location is found or all locations have been exhausted
  }

  getPathAtoB(start: GridCoord, target: GridCoord) {
    return shortestPathBFS(this, start, target);
  }

  // TODO: Floor the vector for grid tile?
  generateFlowField = (
    targetTile: Vector2 | { x: number; y: number }
  ): [number, number][][] | undefined => {
    if (!this.isTileAccessible(targetTile.x, targetTile.y)) return;

    const cacheKey = `${targetTile.x}-${targetTile.y}`;

    // We are going to use a cache that cant account for changes to the environment. So need to keep that in mind if I start adding doors and moving walls. Can use those as signals to clear the LRU cache (not ideal but simpler)
    const cachedFlowField = this.flowFields.get(cacheKey);
    if (cachedFlowField) {
      return cachedFlowField;
    }

    const flowField: [number, number][][] = new Array(this.height)
      .fill([])
      .map(() => new Array(this.width).fill([0, 0]));

    const visited: boolean[][] = new Array(this.height)
      .fill([])
      .map(() => new Array(this.width).fill(false));

    // Queue for Dijkstra's algorithm
    const queue: [number, number][] = [[targetTile.x, targetTile.y]];

    // Set the target cell's vector to [0, 0]
    flowField[targetTile.y][targetTile.x] = [0, 0];
    while (queue.length > 0) {
      const [x, y] = queue.shift()!;

      const neighbors: [number, number][] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];

      for (const [nx, ny] of neighbors) {
        // Check if the neighbor is within bounds and not a wall
        if (
          nx >= 0 &&
          nx < this.width &&
          ny >= 0 &&
          ny < this.height &&
          this.isTileAccessible(nx, ny) &&
          !visited[ny][nx]
        ) {
          // Calculate the vector to the neighbor from the current cell
          const dx = x - nx;
          const dy = y - ny;
          const vector: [number, number] = [dx, dy];

          // If the vector is different from the existing vector, update it
          if (
            vector[0] !== flowField[ny][nx][0] ||
            vector[1] !== flowField[ny][nx][1]
          ) {
            flowField[ny][nx] = vector;
            visited[ny][nx] = true;
            queue.push([nx, ny]);
          }
        }
      }
    }
    this.flowFields.set(cacheKey, flowField);
    return flowField;
  };

  // removeEntity() // TODO: Maybe later. But for now, since it's just grid tiles, we never remove anything. When we add in other things with grid location, maybe (like lights or effects or...I dunno.)
}
