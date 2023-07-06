/**
 * The goal of this system is to generate an array of rays that represent the necessary data to render the world.
 * Primarily distance to the nearest wall in the direction of the ray (relative to the player position). We are going to go a step further and include information about the wall as well, even though it's more the provenance of the renderer. The goal with that is to port the bulk of the rendering engine from the non-ECS immplementation.
 */

import { Vector } from "../utils/math";
import { EventManager } from "../EventManager/EventManager";
import { GridManager } from "../GridManager/GridManager";
import { Entity, GridTileEntity, PlayerEntity, Ray } from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";

export class RaycasterSystem implements System {
  gridManager: GridManager;
  eventManager: EventManager;
  camera: PlayerEntity;
  width: number;
  rays: Ray[] = [];

  constructor(
    gridManager: GridManager,
    eventManager: EventManager,
    camera: PlayerEntity,
    width: number
  ) {
    this.gridManager = gridManager;
    this.eventManager = eventManager;
    // Could just pass int he player for now until we actually have a dynamic camera (read never)
    // this.camera = ecs.entityManager.with(["camera"])[0];
    // TODO: This makes the value undynamic and there's no reason not to just instantiate with it... so I will...until that changes...if ever.
    // this.width = ecs.entityManager.with(["gameSettings"])[0].gameSettings.width;
    this.camera = camera;
    this.width = width;
  }

  // TODO: add in an early return for maximum cast distance
  castRay(cameraX, castDistance = Infinity) {
    const rayDirection = this.camera.plane
      .scale(cameraX)
      .add(this.camera.direction);
    // NOTE: Interestingly Lode uses what looks like a round, not floor here. but taht doesnt work for me. Maybe its different in c++ and always casts ints with floor.
    const activeCell = this.camera.position.map(Math.floor);

    // The distance from the nearest cell walls
    // Lode uses the following. I would like to verify its the same:
    // double deltaDistX = sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX));
    // double deltaDistY = sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY));
    const distanceDelta = rayDirection.map((scalar) => Math.abs(1 / scalar));
    // Which way we're going.
    const stepX = rayDirection.x < 0 ? -1 : 1;
    const stepY = rayDirection.y < 0 ? -1 : 1;

    let sideDistX =
      (rayDirection.x < 0
        ? this.camera.position.x - activeCell.x
        : 1 + activeCell.x - this.camera.position.x) * distanceDelta.x;
    let sideDistY =
      (rayDirection.y < 0
        ? this.camera.position.y - activeCell.y
        : 1 + activeCell.y - this.camera.position.y) * distanceDelta.y;

    // This assumes infinite draw distance and that all spaces will be fully enclosed
    // TODO: Get rid of that assumption.
    let wall: GridTileEntity | null = null;
    // We don't really need the wall orientation since we can derive it from the face, but for now, we'll leave it in.
    let wallOrientation;
    // Where as for texture rendering, we just need to know if the wall is oriented horizontally
    // or vertically, in order to do unique faces, we need to specify the wall orientation more granularly. ie cardinal.
    // The orientation and the step direction should give this to us.
    // There is no real cardinality to the map, but for now we'll use up === north, left === west. (where 0,0 is top left).
    let wallFace;
    // NOT SURE HOW THIS WORKS IF WE NEVER GET A WALL
    while (!wall) {
      if (sideDistX < sideDistY) {
        sideDistX += distanceDelta.x;
        activeCell.x += stepX;
        wallOrientation = "vertical"; // Vertical Wall
        wallFace = stepX > 0 ? "west" : "east";
      } else {
        sideDistY += distanceDelta.y;
        activeCell.y += stepY;
        wallOrientation = "horizontal"; // Horizontal Wall
        wallFace = stepY > 0 ? "north" : "south";
      }

      const currentCell = this.gridManager.getGridTile(
        activeCell.x,
        activeCell.y
      );
      if (currentCell == null) {
        break;
      }
      if (currentCell.type === "wall") {
        wall = currentCell;
      }
    }

    const normalizedDistance =
      wallOrientation === "vertical"
        ? (activeCell.x - this.camera.position.x + (1 - stepX) / 2) /
          rayDirection.x
        : (activeCell.y - this.camera.position.y + (1 - stepY) / 2) /
          rayDirection.y;

    // Exact intersection point with wall
    const intersection =
      wallOrientation === "vertical"
        ? this.camera.position.y + normalizedDistance * rayDirection.y
        : this.camera.position.x + normalizedDistance * rayDirection.x;

    // This gives us the intersection relative to one wall unit.
    const wallIntersection = intersection - Math.floor(intersection);

    const ray = {
      normalizedDistance,
      wall,
      wallOrientation,
      wallIntersection,
      rayDirection,
      activeCell, // DO WE NEED THIS? It's the grid location of the wall (only an issue if we never find a wall)
      wallFace,
    };

    return ray;
  }

  // TODO: probably should only run this on a framerate tick. The game can do what it wants, but the render stuff should be less frequent.
  update(dt: number) {
    const rays: Ray[] = [];

    // For each pixel, cast a ray and push to a ray map.
    // TODO: Can I reverse this?
    for (let i = 0; i < this.width; i++) {
      const cameraX = (2 * i) / this.width - 1; // x-Coordinate in camera space
      const ray = this.castRay(cameraX);
      rays.push(ray);
    }
    this.rays = rays;
    this.eventManager.rays = rays;
  }
}
