/**
 * Responsible for overlay elements like mini map.
 * (Maybe even text?)
 */

import { GridManager } from "../GridManager/GridManager";
import { SpriteManager } from "../SpriteManager/SpriteManager";
import { TextureManager } from "../TextureManager/TextureManager";
import { EventMessageName, InteractionDirectiveName } from "../enums";
import {
  EventMessage,
  GameSettingsComponent,
  GameSettingsEntity,
  PlayerActorCollisionEvent,
  PlayerEntity,
} from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { Broker } from "../utils/events";
import SingletonInputSystem from "./SingletonInputSystem";
import { PI2 } from "../constants";

// TODO: Text Defaults so every message doesn't have to specify.

function drawRoundedRect(ctx, x, y, width, height, cornerRadius) {
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
  ctx.arcTo(
    x + width,
    y + height,
    x + width - cornerRadius,
    y + height,
    cornerRadius
  );
  ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
  ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
  ctx.closePath();
  ctx.fill();
}

export class HUDSystem implements System {
  private ecs: ECS;
  private textureManager: TextureManager;
  private spriteManager: SpriteManager;
  private gridManager: GridManager;
  private gameSettings: GameSettingsComponent;
  private camera: PlayerEntity;
  private inputSystem: SingletonInputSystem;
  private broker: Broker;

  private messageQueue: any = [];
  private messageTimeout: number | null = null;
  private activeMessage: string | null = null;

  // TODO: Placeholder for generic system. Liike so much here. Want to have the brief flash of doom for a pickup, but also be able to override it with a new pickup. Will check for existence of value, if it is, will use its state to render correct frame of animation. Self destruct at end.
  private flashEffect = null;

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

  // Message buffer
  textMessageCanvas = document.createElement("canvas");
  textMessageCtx = this.textMessageCanvas.getContext("2d")!;

  // TODO FLASH BUFFER

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    ecs: ECS,
    gameSettings: GameSettingsEntity,
    textureManager: TextureManager,
    spriteManager: SpriteManager,
    gridManager: GridManager,
    camera: PlayerEntity,
    inputSystem: SingletonInputSystem,
    broker: Broker
  ) {
    this.ecs = ecs;
    this.gameSettings = gameSettings.gameSettings;
    this.textureManager = textureManager;
    this.spriteManager = spriteManager;
    this.gridManager = gridManager;
    this.camera = camera;
    this.inputSystem = inputSystem;
    this.broker = broker;

    this.canvas = canvas;
    this.ctx = ctx;

    this.textMessageCanvas.width = this.offscreenCanvas.width =
      this.canvas.width;
    this.textMessageCanvas.height = this.offscreenCanvas.height =
      this.canvas.height;

    this.minimapLayer0Canvas.width = this.minimapLayer1Canvas.width = 200;
    this.minimapLayer0Canvas.height = this.minimapLayer1Canvas.height = 200;

    this.bufferMiniMap();

    // I'm going to cheat hard hear and move special effects to this component until I build that into its own system.
    // At first a generic effect made sense but in fact, I'd rather the emitter not know how the data will be used, and only focus on what happened.
    this.broker.subscribe(
      EventMessageName.PlayerActorCollision,
      this.handleItemPickup
    );

    this.broker.subscribe(
      EventMessageName.InteractionDirective,
      this.handleInteractionDirectiveEvent
    );
  }

  handleInteractionDirectiveEvent = (e) => {
    this.handleInteractionDirective(e);
  };

  handleInteractionDirective = (directive) => {
    switch (directive.type) {
      case InteractionDirectiveName.ShowMessage: {
        this.queueTextMessage(directive.body, directive.priority);
        break;
      }
      case InteractionDirectiveName.PlayAudio: {
        this.broker.emit(EventMessageName.PlaySound, {
          name: directive.name,
          // volume: directive.volume, // Not being used right now (Nor is priority with this mechanism that is just passing it on.)
        });
      }
    }
  };

  handleItemPickup = (event: PlayerActorCollisionEvent) => {
    if (!event.collidedWithEntity?.interactionDirectives?.length) {
      return;
    }

    for (const directive of event.collidedWithEntity.interactionDirectives) {
      this.handleInteractionDirective(directive);
    }
  };

  // Let's use a priority system to evacuate queued messages in favor of higher priority messages.
  queueTextMessage = (body: string, priority = 5) => {
    const message = {
      body,
      priority,
      timestamp: Date.now(), // For later doing cleanup of stale or stuck messages.
    };

    this.messageQueue.push(message);
    if (!this.activeMessage) {
      this.bufferTextMessage();
    }

    // TODO: Instead of just pushing, let's sort this into priority order ( or just expel anything lower priority in front of it)
  };

  clearTextMessage = () => {
    this.textMessageCtx.clearRect(
      0,
      0,
      this.textMessageCanvas.width,
      this.textMessageCanvas.height
    );
    this.activeMessage = null;
  };

  // todoFlash = () => {
  //   this.textMessageCtx.globalAlpha = 0.3;
  //   this.textMessageCtx.fillStyle = "rgba(150, 50, 50, 30)";
  //   this.textMessageCtx.fillRect(
  //     0,
  //     0,
  //     this.textMessageCanvas.width,
  //     this.textMessageCanvas.height
  //   );
  //   this.messageTimeout = setTimeout(() => {
  //     this.clearTextMessage();
  //   }, 60);
  // };

  bufferTextMessage = () => {
    this.clearTextMessage();

    if (!this.messageQueue.length) {
      return;
    }

    const nextMessage = this.messageQueue.shift();
    this.activeMessage = nextMessage.body;
    this.messageTimeout = setTimeout(() => {
      // TODO: Let each mesage set its own on screen length.
      this.bufferTextMessage();
    }, 2000);
  };

  renderTextMessages = () => {
    if (!this.activeMessage) {
      return;
    }
    // TODO: Can use this to line split and justify etc.
    // TODO: Make box optional and color a setting.
    // console.log(this.textMessageCtx.measureText(nextMessage.body));
    this.textMessageCtx.font = "24px serif";
    this.textMessageCtx.textAlign = "center";
    this.textMessageCtx.textBaseline = "middle";

    // Support for line breaks.
    // Simple implementation. We expect them to be given to us manually for now.
    // Figure out the text width this time by finding the longest string and assuming it's the longest once rendered
    const textLines = this.activeMessage.split("\n");
    let longestLine = "";
    for (const line of textLines) {
      longestLine = longestLine.length > line.length ? longestLine : line;
    }

    const BOX_PADDING = 20;
    const LINE_HEIGHT = 45;
    const textCenterX = this.textMessageCanvas.width / 2;
    const textCenterY = this.textMessageCanvas.height / 2;
    const textMeasure = this.textMessageCtx.measureText(longestLine);

    // const baseLineHeight =
    //   textMeasure.fontBoundingBoxAscent + textMeasure.fontBoundingBoxDescent;
    const lineWidth =
      textMeasure.actualBoundingBoxLeft + textMeasure.actualBoundingBoxRight;

    // const textLineStep = baseLineHeight + LINE_MARGIN;

    const textHeight = textLines.length * LINE_HEIGHT;

    const containerX =
      textCenterX - textMeasure.actualBoundingBoxLeft - BOX_PADDING;
    const containerY = textCenterY - textHeight / 2 - BOX_PADDING;

    const containerWidth = lineWidth + BOX_PADDING * 2;
    const containerHeight = textHeight + BOX_PADDING * 2;

    this.textMessageCtx.clearRect(
      0,
      0,
      this.textMessageCanvas.width,
      this.textMessageCanvas.height
    );

    this.textMessageCtx.globalAlpha = 0.5;
    this.textMessageCtx.fillStyle = "black";
    drawRoundedRect(
      this.textMessageCtx,
      containerX,
      containerY,
      containerWidth,
      containerHeight,
      5
    );

    // this.textMessageCtx.fillRect(
    //   containerX,
    //   containerY,
    //   containerWidth,
    //   containerHeight,
    // );
    this.textMessageCtx.globalAlpha = 1;
    this.textMessageCtx.fillStyle = "white";

    let textTopY = containerY + BOX_PADDING + LINE_HEIGHT / 2;
    for (const line in textLines) {
      const text = textLines[line];
      this.textMessageCtx.fillText(text, textCenterX, textTopY);
      textTopY += LINE_HEIGHT;
    }

    this.offscreenCtx.drawImage(this.textMessageCanvas, 0, 0);
  };

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
    this.offscreenCtx.clearRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );
    // TODO: Render HUD (MapOverlay, Text, etc)

    this.renderTextMessages();

    if (this.inputSystem.isKeyPressed("`")) {
      this.renderMiniMap();
    }
    this.draw();
  }
}
