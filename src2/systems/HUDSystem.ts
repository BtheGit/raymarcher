/**
 * Responsible for overlay elements like mini map.
 * (Maybe even text?)
 */

import { EventManager } from "../EventManager/EventManager";
import { GridManager } from "../GridManager/GridManager";
import { SpriteManager } from "../SpriteManager/SpriteManager";
import { TextureManager } from "../TextureManager/TextureManager";
import {
  GameSettingsComponent,
  GameSettingsEntity,
  PlayerEntity,
} from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import SingletonInputSystem from "./SingletonInputSystem";

const PI2 = Math.PI * 2;

export class HUDSystem implements System {
  private ecs: ECS;
  private textureManager: TextureManager;
  private spriteManager: SpriteManager;
  private gridManager: GridManager;
  private eventManager: EventManager;
  private gameSettings: GameSettingsComponent;
  private camera: PlayerEntity;
  private inputSystem: SingletonInputSystem;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // Offscreen Buffer To Combine all Other Buffers
  offscreenCanvas = document.createElement("canvas");
  offscreenCtx = this.offscreenCanvas.getContext("2d")!;

  // Individual Buffer for Minimap (shoudl not update (until destructible environments! (can memoize grid maybe)))
  minimapLayer0Canvas = document.createElement("canvas");
  minimapLayer0Ctx = this.minimapLayer0Canvas.getContext("2d")!;

  // Individual Buffer Things that change frequently on mini map
  minimapLayer1Canvas = document.createElement("canvas");
  minimapLayer1Ctx = this.minimapLayer1Canvas.getContext("2d")!;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    ecs: ECS,
    gameSettings: GameSettingsEntity,
    textureManager: TextureManager,
    spriteManager: SpriteManager,
    gridManager: GridManager,
    eventManager: EventManager,
    camera: PlayerEntity,
    inputSystem: SingletonInputSystem
  ) {
    this.ecs = ecs;
    this.gameSettings = gameSettings.gameSettings;
    this.textureManager = textureManager;
    this.spriteManager = spriteManager;
    this.gridManager = gridManager;
    this.eventManager = eventManager;
    this.camera = camera;
    this.inputSystem = inputSystem;

    this.canvas = canvas;
    this.ctx = ctx;

    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    this.minimapLayer0Canvas.width = this.minimapLayer1Canvas.width = 200;
    this.minimapLayer0Canvas.height = this.minimapLayer1Canvas.height = 200;

    this.bufferMiniMap();
  }

  // For now, this is really going to be called once. Later, if it supports zoom or map tiles are able to change, we'll need
  // to decide how to rerender.
  // Alot of stuff is going to be hardcoded until I decide what features I like
  private bufferMiniMap = () => {
    // TODO: Lots of hardcoded stuff to make dynamic.
    const emptyCellColor = "rgba(5,5,5,0.7)";
    // TODO: For simplicity's sake, we'll hard code the placement and size of the minimap for now at the top left.
    // Probably would be nicer as a full screen overlay with transparency;
    const gridWidth = this.gridManager.width;
    const gridHeight = this.gridManager.height;
    const mapLeft = 0;
    const mapTop = 0;
    const mapWidth = this.minimapLayer0Canvas.width;
    const mapHeight = this.minimapLayer0Canvas.height;
    const mapXRatio = mapWidth / gridWidth;
    const mapYRatio = mapHeight / gridHeight;
    const GRID_UNIT = 1;
    const mapWidthUnit = Math.floor(mapXRatio * GRID_UNIT);
    const mapHeightUnit = Math.floor(mapYRatio * GRID_UNIT);

    for (let rowOffset = 0; rowOffset < gridWidth; rowOffset++) {
      for (let columnOffset = 0; columnOffset < gridHeight; columnOffset++) {
        const gridTile = this.gridManager.getGridTileFromCoord(
          rowOffset,
          columnOffset
        )!;
        const cellLeft = rowOffset * mapWidthUnit;
        const cellTop = columnOffset * mapHeightUnit;
        const { type } = gridTile; // In the future the cell will have more data so this will require extracing the data

        const textureSettings =
          type === "wall" ? gridTile.wallTile! : gridTile.floorTile!;
        const textureType = textureSettings.surface;

        if (textureType === "color") {
          const color = textureSettings.color;
          this.minimapLayer0Ctx.beginPath();
          this.minimapLayer0Ctx.fillStyle = color
            ? `rgb(${color.r}, ${color.g}, ${color.b})`
            : emptyCellColor;
          this.minimapLayer0Ctx.fillRect(
            cellLeft,
            cellTop,
            mapWidthUnit,
            mapHeightUnit
          );
          this.minimapLayer0Ctx.closePath();
        } else {
          const cellTexture = this.textureManager.getTexture(
            textureSettings.texture!.name,
            textureSettings.surface
          )!;
          this.minimapLayer0Ctx.drawImage(
            cellTexture.canvas,
            0,
            0,
            cellTexture.width,
            cellTexture.height,
            cellLeft,
            cellTop,
            mapWidthUnit,
            mapHeightUnit
          );
        }
      }
    }

    // for (let i = 0; i <= gridWidth; i++) {
    //   // VERTICAL
    //   this.minimapLayer0Ctx.beginPath();
    //   this.minimapLayer0Ctx.lineWidth = 0.2;
    //   this.minimapLayer0Ctx.strokeStyle = "rgba(255,255,255,0.3)";
    //   this.minimapLayer0Ctx.moveTo(i * mapWidthUnit, 0);
    //   this.minimapLayer0Ctx.lineTo(i * mapWidthUnit, mapHeight);
    //   this.minimapLayer0Ctx.closePath();
    //   this.minimapLayer0Ctx.stroke();
    // }

    // for (let i = 0; i <= gridHeight; i++) {
    //   // HORIZONTAL
    //   this.minimapLayer0Ctx.beginPath();
    //   this.minimapLayer0Ctx.lineWidth = 0.2;
    //   this.minimapLayer0Ctx.strokeStyle = "rgba(255,255,255,0.3)";
    //   this.minimapLayer0Ctx.moveTo(0, 0 + i * mapHeightUnit);
    //   this.minimapLayer0Ctx.lineTo(mapWidth, 0 + i * mapHeightUnit);
    //   this.minimapLayer0Ctx.closePath();
    //   this.minimapLayer0Ctx.stroke();
    // }
  };
  private bufferMiniMapObjects = () => {
    const PLAYER_SIZE = 3;
    const gridWidth = this.gridManager.width;
    const gridHeight = this.gridManager.height;

    const mapWidth = this.minimapLayer1Canvas.width;
    const mapHeight = this.minimapLayer1Canvas.height;

    // TODO: Can cache these of course since this is called more often
    const mapXRatio = mapWidth / gridWidth;
    const mapYRatio = mapHeight / gridHeight;

    const playerPosXOnMap = this.camera.transform.position.x * mapXRatio;
    const playerPosYOnMap = this.camera.transform.position.y * mapYRatio;

    const relativePlayerDirX =
      (this.camera.transform.position.x + this.camera.transform.direction.x) *
      mapXRatio;
    const relativePlayerDirY =
      (this.camera.transform.position.y + this.camera.transform.direction.y) *
      mapYRatio;

    this.minimapLayer1Ctx.clearRect(0, 0, mapWidth, mapHeight);
    this.minimapLayer1Ctx.beginPath();
    this.minimapLayer1Ctx.fillStyle = "white";
    this.minimapLayer1Ctx.arc(
      playerPosXOnMap,
      playerPosYOnMap,
      PLAYER_SIZE,
      0,
      PI2
    );

    this.minimapLayer1Ctx.fill();
    this.minimapLayer1Ctx.closePath();
    this.minimapLayer1Ctx.beginPath();
    this.minimapLayer1Ctx.moveTo(playerPosXOnMap, playerPosYOnMap);
    this.minimapLayer1Ctx.strokeStyle = "white";
    this.minimapLayer1Ctx.lineTo(relativePlayerDirX, relativePlayerDirY);
    this.minimapLayer1Ctx.closePath();
    this.minimapLayer1Ctx.stroke();
  };

  private renderMiniMap = () => {
    this.bufferMiniMapObjects();
    this.offscreenCtx.drawImage(this.minimapLayer0Canvas, 0, 0);
    this.offscreenCtx.drawImage(this.minimapLayer1Canvas, 0, 0);
  };

  draw() {
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }
  update(dt: number) {
    // TODO: Render HUD (MapOverlay, Text, etc)

    if (this.inputSystem.isKeyPressed("`")) {
      this.renderMiniMap();

      this.draw();
    }
  }
}
