/**
 * The goal of this system is to generate an array of rays that represent the necessary data to render the world.
 * Primarily distance to the nearest wall in the direction of the ray (relative to the player position). We are going to go a step further and include information about the wall as well, even though it's more the provenance of the renderer. The goal with that is to port the bulk of the rendering engine from the non-ECS immplementation.
 */

import { Vector2 } from "../utils/math";
import { GridManager } from "../GridManager/GridManager";
import {
  Entity,
  GridTileEntity,
  ObjectEntity,
  PlayerEntity,
  Ray,
} from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import { EventMessageName } from "../enums";
import {
  INTERACTION_DISTANCE_SQUARED,
  INTERACTION_TARGET_GENERIC_WIDTH,
} from "../constants";

export class RaycasterSystem implements System {
  private gridManager: GridManager;
  private broker: Broker;
  camera: PlayerEntity;
  width: number;
  rays: Ray[] = [];
  intersectedObjects: Set<ObjectEntity>;
  interactiveTarget: any;
  interactiveTargetDistance: number;

  constructor(
    gridManager: GridManager,
    broker: Broker,
    camera: PlayerEntity,
    width: number
  ) {
    this.gridManager = gridManager;
    this.broker = broker;
    // Could just pass int he player for now until we actually have a dynamic camera (read never)
    // this.camera = ecs.entityManager.with(["camera"])[0];
    // TODO: This makes the value undynamic and there's no reason not to just instantiate with it... so I will...until that changes...if ever.
    // this.width = ecs.entityManager.with(["gameSettings"])[0].gameSettings.width;
    this.camera = camera;
    this.width = width;
    this.intersectedObjects = new Set<ObjectEntity>();
    this.resetInteractiveTarget();
  }

  resetInteractiveTarget = () => {
    this.interactiveTarget = null;
    this.interactiveTargetDistance = Infinity;
  };

  rayToRectIntersection(object: ObjectEntity) {
    // Short term, I'm going to cheat hard and just use a standard width. This will make it harder at close distances.
    // Need a standard way to determine this with walls.
    const HALF_WIDTH = INTERACTION_TARGET_GENERIC_WIDTH / 2;
    const tminX =
      (object.transform.position.x -
        HALF_WIDTH -
        this.camera.transform.position.x) /
      this.camera.transform.direction.x;
    const tmaxX =
      (object.transform.position.x +
        INTERACTION_TARGET_GENERIC_WIDTH -
        this.camera.transform.position.x) /
      this.camera.transform.direction.x;
    const tminY =
      (object.transform.position.y -
        HALF_WIDTH -
        this.camera.transform.position.y) /
      this.camera.transform.direction.y;
    const tmaxY =
      (object.transform.position.y +
        INTERACTION_TARGET_GENERIC_WIDTH -
        this.camera.transform.position.y) /
      this.camera.transform.direction.y;

    const tmin = Math.max(Math.min(tminX, tmaxX), Math.min(tminY, tmaxY));
    const tmax = Math.min(Math.max(tminX, tmaxX), Math.max(tminY, tmaxY));

    // If the minimum intersection time is greater than the maximum intersection time,
    // then there's no intersection.
    if (tmin > tmax) {
      return false;
    }

    // If both tmin and tmax are positive or zero, the ray intersects with the rectangle.
    return tmin >= 0 && tmax >= 0;
  }

  addIntersectedObjects = (x, y, findInteractiveTarget) => {
    const objects = this.gridManager.getObjectEntitiesByGridLocation(x, y);
    for (const object of objects) {
      this.intersectedObjects.add(object);
      if (findInteractiveTarget) {
        if (object.hasOwnProperty("playerInteractions")) {
          const distanceSquared = this.camera.transform.position.distanceTo(
            object.transform.position
          );
          if (
            distanceSquared < this.interactiveTargetDistance &&
            distanceSquared < INTERACTION_DISTANCE_SQUARED &&
            this.rayToRectIntersection(object)
          ) {
            this.interactiveTarget = object;
            this.interactiveTargetDistance = distanceSquared;
          }
        }
      }
    }
  };

  // TODO: add in an early return for maximum cast distance
  castRay(cameraX, findInteractiveTarget: boolean, castDistance = Infinity) {
    const rayDirection = this.camera.plane
      .scale(cameraX)
      .add(this.camera.transform.direction);
    // NOTE: Interestingly Lode uses what looks like a round, not floor here. but taht doesnt work for me. Maybe its different in c++ and always casts ints with floor.
    const activeCell = this.camera.transform.position.map(Math.floor);
    this.addIntersectedObjects(
      activeCell.x,
      activeCell.y,
      findInteractiveTarget
    );

    // The distance from the nearest cell walls
    const distanceDelta = rayDirection.map((scalar) => Math.abs(1 / scalar));
    // Which way we're going.
    const stepX = rayDirection.x < 0 ? -1 : 1;
    const stepY = rayDirection.y < 0 ? -1 : 1;

    let sideDistX =
      (rayDirection.x < 0
        ? this.camera.transform.position.x - activeCell.x
        : 1 + activeCell.x - this.camera.transform.position.x) *
      distanceDelta.x;
    let sideDistY =
      (rayDirection.y < 0
        ? this.camera.transform.position.y - activeCell.y
        : 1 + activeCell.y - this.camera.transform.position.y) *
      distanceDelta.y;

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
      this.addIntersectedObjects(
        currentCell.gridLocation.x,
        currentCell.gridLocation.y,
        findInteractiveTarget
      );
    }

    const normalizedDistance =
      wallOrientation === "vertical"
        ? (activeCell.x - this.camera.transform.position.x + (1 - stepX) / 2) /
          rayDirection.x
        : (activeCell.y - this.camera.transform.position.y + (1 - stepY) / 2) /
          rayDirection.y;

    // Exact intersection point with wall
    const intersection =
      wallOrientation === "vertical"
        ? this.camera.transform.position.y + normalizedDistance * rayDirection.y
        : this.camera.transform.position.x +
          normalizedDistance * rayDirection.x;

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
    this.intersectedObjects = new Set<ObjectEntity>();
    this.resetInteractiveTarget();

    // For each pixel, cast a ray and push to a ray map.
    // TODO: Can I reverse this?
    for (let i = 0; i < this.width; i++) {
      const cameraX = (2 * i) / this.width - 1; // x-Coordinate in camera space
      const findInteractiveTarget = i === Math.floor(this.width / 2);
      const ray = this.castRay(cameraX, findInteractiveTarget);
      rays.push(ray);
    }
    this.rays = rays;
    this.broker.emit(EventMessageName.RaysUpdated, {
      name: EventMessageName.RaysUpdated,
      rays,
      timestamp: Date.now(),
      intersectedObjects: [...this.intersectedObjects],
      playerInteractionsTarget: this.interactiveTarget,
    });
  }
}
