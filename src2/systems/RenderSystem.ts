/**
 * NOTE: In the future, we may want to break up this into separate render pipelines for different entity types.
 * For now, to quickly transfer over more logic, we'll try and mash it all in here. Which means this system will have the bulk of our work. Especially all canvas and buffer references.
 *
 *Obviously all these buffers seem to want to be separate systems :)
 *
 */

import { EventManager } from "../EventManager/EventManager";
import { GridManager } from "../GridManager/GridManager";
import { TextureManager } from "../TextureManager/TextureManager";
import {
  CameraComponent,
  Entity,
  GameSettingsEntity,
  GameSettingsComponent,
  PlayerEntity,
  SkyboxEntity,
  ObjectEntity,
} from "../raymarcher";
import { ECS, System } from "../utils/ECS/ECS";
import { toDegrees } from "../utils/math";
import { hexToRGB } from "../utils/image";

export class RenderSystem implements System {
  ecs: ECS;
  textureManager: TextureManager;
  gridManager: GridManager;
  gameSettings: GameSettingsComponent;
  eventManager: EventManager;
  camera: PlayerEntity; // We need this for the non-world items (sky, hud) namely for direction, rotation... Ideally we can get that another way in the future. So much fun decoupling potential! (that'll I'll probably ignore for the next shiny project)
  currentRayFrame = -Infinity;
  skyboxEntity: SkyboxEntity;

  // TODO: Temporarily keeping a static list of sprites. Optimizations includes, live updated list, but also a filtered list based on visibiolity frustrum culled.
  objects: ObjectEntity[];

  // Precalculated Tables For quicker rendering (some may need to be recalculated when we start to handle screen size changes (if ever))
  private lookupCurrentDist: { [offset: number]: number };
  private lookupFloorBrightnessModifier: { [height: number]: number };

  // Visible Pixels
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // Offscreen Buffer To Combine all Other Buffers
  offscreenCanvas = document.createElement("canvas");
  offscreenCtx = this.offscreenCanvas.getContext("2d")!;

  // Individual Buffer for World
  worldCanvas = document.createElement("canvas");
  worldCtx = this.worldCanvas.getContext("2d", {
    willReadFrequently: true,
  })!;

  // Individual Buffer for Sprites
  spriteCanvas = document.createElement("canvas");
  spriteCtx = this.spriteCanvas.getContext("2d")!;

  // Individual Buffer for Text
  textCanvas = document.createElement("canvas");
  textCtx = this.textCanvas.getContext("2d")!;

  // Individual Buffer for Sky
  // (Because if we have a gradient, we don't need to update this on every ray cast)
  skyCanvas = document.createElement("canvas");
  skyCtx = this.skyCanvas.getContext("2d")!;

  // Individual Buffer for Floor
  // Not sure this is needed, but it might be because of legacy pixel manipulation code, so we'll figure it out later
  floorCeilingCanvas = document.createElement("canvas");
  floorCeilingCtx = this.floorCeilingCanvas.getContext("2d")!;
  // Since the floor is going to have brightness modifiers applied, we want to manipulate
  // pixel data directly. (TODO: reverse for ceiling). Keeping those values here is simplest.
  // TODO: Generate an array of all the modifiers precalced and simply merge the two. Floor and ceiling distance are consistent to y values (unlike walls), so we really only need to do it once. Yes the brightness modifier table mostly serves for this, but maybe there is a more efficient operation? Explore.
  floorCeilingPixelData: ImageData;

  constructor(
    ecs: ECS,
    gameSettings: GameSettingsEntity,
    textureManager: TextureManager,
    gridManager: GridManager,
    eventManager: EventManager,
    camera: PlayerEntity,
    skyboxEntity: SkyboxEntity
  ) {
    this.ecs = ecs;
    this.gameSettings = gameSettings.gameSettings;
    this.textureManager = textureManager;
    this.gridManager = gridManager;
    this.eventManager = eventManager;
    this.camera = camera;
    this.skyboxEntity = skyboxEntity;

    this.canvas = document.getElementById(
      this.gameSettings.canvasId
    ) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;

    this.canvas.width =
      this.offscreenCanvas.width =
      this.skyCanvas.width =
      this.floorCeilingCanvas.width =
      this.worldCanvas.width =
        this.gameSettings.width;
    this.canvas.height =
      this.offscreenCanvas.height =
      this.skyCanvas.height =
      this.floorCeilingCanvas.height =
      this.worldCanvas.height =
        this.gameSettings.height;

    this.generateCurrentDistLookupTable();
    this.generateFloorBrightnessModifierLookupTable();

    this.floorCeilingPixelData = this.floorCeilingCtx.createImageData(
      this.gameSettings.width,
      this.gameSettings.height
    );

    // TODO: Support animation
    this.objects = ecs.entityManager.with(["sprite", "transform"]);
  }

  // TODO: Memoize and make sure its rerun on screen size chagnes.
  private generateCurrentDistLookupTable() {
    const table: { [offset: number]: number } = {};
    for (
      let i = this.gameSettings.height / 2;
      i < this.gameSettings.height;
      i++
    ) {
      table[i] =
        this.gameSettings.height / (2.0 * i - this.gameSettings.height);
    }
    this.lookupCurrentDist = table;
    return table;
  }

  private generateFloorBrightnessModifierLookupTable() {
    const table: { [height: number]: number } = {};
    // Since we know dead center of the screen is the darkest possible and we want a fall off, we can use
    // an inverse square law.
    // Let's say that the maximum drop off is 50% brightness. That means brightness is 1 / dist.
    const screenCenter = Math.floor(this.gameSettings.height / 2);
    for (let i = screenCenter; i < this.gameSettings.height; i++) {
      // TODO: This is too linear, should be exponential for a nicer effect imho.
      const distanceFromPlayer =
        ((this.gameSettings.height - i) / screenCenter) * 1.2;
      const brightnessModifier = 1 / Math.pow(2, distanceFromPlayer);
      table[i] = brightnessModifier;
    }
    this.lookupFloorBrightnessModifier = table;
    return table;
  }

  // NOTE: Someday, If I have wall height or no outer walls, I'll regret only rendering half a skybox. :)
  renderSkybox() {
    // TODO: If surface is a color or gradient, we only need to render once and can reuse (until I implement live changes :) )

    // TODO: Stop storing it nested.
    const { skybox } = this.skyboxEntity;
    switch (skybox.surface) {
      case "color":
        const color = skybox.color;
        this.skyCtx.fillStyle = `#${color}`;
        this.skyCtx.fillRect(
          0,
          0,
          this.gameSettings.width,
          this.gameSettings.height / 2
        );
        break;
      case "texture":
        const textureName = skybox.texture!.name;
        const backgroundImage = this.textureManager.getTexture(textureName)!;
        // We need to have an origin for the image
        // We need to find the offset from that origin in the FOV and then sample 1/6 of the image
        // from that point then draw it to the background.
        // TODO: This bit of code might be the trick to stop using direction and start using rotation.
        const { x, y } = this.camera.direction;
        const angle = Math.atan2(x, y);
        let degrees = angle > 0 ? toDegrees(angle) : 360 + toDegrees(angle);
        // degrees = degrees - 30 >= 0 ? degrees - 30 : 360 + degrees - 30;
        const sampleWidth = backgroundImage.width / 6; // 1/3 of image because FOV / 180
        const currentSampleStart =
          ((360 - degrees) / 360) * backgroundImage.width;
        const willOverflow =
          backgroundImage.width - currentSampleStart < sampleWidth;
        if (willOverflow) {
          const overflowWidth =
            currentSampleStart + sampleWidth - backgroundImage.width;
          const nonOverflowWidth = sampleWidth - overflowWidth;
          const overflowRatio = nonOverflowWidth / sampleWidth;
          const seamPoint = overflowRatio * this.gameSettings.width;
          // We need to get the two pieces separately and stitch them together on a new canvas.
          // In the case where we are too close to the edges, we need to sample the overflow from the head or tail
          // to create the seam.
          this.skyCtx.drawImage(
            backgroundImage.canvas,
            currentSampleStart,
            0,
            nonOverflowWidth,
            backgroundImage.height,
            0,
            0,
            seamPoint,
            this.gameSettings.height / 2
          );
          this.skyCtx.drawImage(
            backgroundImage.canvas,
            0,
            0,
            overflowWidth,
            backgroundImage.height,
            seamPoint,
            0,
            this.gameSettings.width - seamPoint,
            this.gameSettings.height / 2
          );
        } else {
          this.skyCtx.drawImage(
            backgroundImage.canvas,
            currentSampleStart,
            0,
            sampleWidth,
            backgroundImage.height,
            0,
            0,
            this.gameSettings.width,
            this.gameSettings.height / 2
          );
        }

        break;
      // default:
      //   break;
    }
    this.offscreenCtx.drawImage(this.skyCanvas, 0, 0);
  }

  renderWorld() {
    // We may still render non world things (like a hud) on a different cycle. But no need to rerender the world (should be stored in a buffer separate from anything else)
    const nextRayFrame = this.eventManager.nextRays;
    if (nextRayFrame.id === this.currentRayFrame) {
      return;
    }
    this.worldCtx.clearRect(
      0,
      0,
      this.worldCanvas.width,
      this.worldCanvas.height
    );
    this.currentRayFrame = nextRayFrame.id;
    // We'll need to record the perpendicular distance of each column for sprite clipping later.
    for (let i = 0; i < nextRayFrame.rays.length; i++) {
      const ray = nextRayFrame.rays[i];
      const {
        normalizedDistance,
        wall,
        wallOrientation,
        wallIntersection,
        rayDirection,
        activeCell,
        wallFace,
      } = ray;

      const columnHeight = Math.ceil(
        this.gameSettings.height / normalizedDistance
      );
      const top = this.gameSettings.height / 2 - columnHeight / 2;
      const VIEW_DISTANCE = 25;
      const brightnessMultiplier = 1.3;
      const darknessMultiplier = 0.9;
      const brightness =
        ((VIEW_DISTANCE - normalizedDistance * brightnessMultiplier) /
          VIEW_DISTANCE) *
          40 +
        10; // clamps the brightness between 10 and 50.

      // ## WALL
      try {
        // Check if there is a face specific config (Bjorn Strastroup says this is better than a map of directions)
        const face = wall!.wallTile?.wallFaces?.find(
          (face) => face.wallFace === wallFace
        );

        const wallTextureConfig = face ? face : wall!.wallTile!;
        const { surface, color, texture } = wallTextureConfig;

        // TODO: I tried to support brightness for wall colors previously, but I don't think I actually did the calculation correctly. Should try again soon.
        switch (surface) {
          case "color":
            this.worldCtx.fillStyle = color!.color;
            this.worldCtx.beginPath();
            this.worldCtx.fillRect(i, top, 1, columnHeight);
            this.worldCtx.closePath();
            break;
          case "texture":
            const wallTextureImageBuffer = this.textureManager.getTexture(
              texture!.name
            );
            const wallTexture = wallTextureImageBuffer!.canvas;
            const textureWidth = wallTexture.width;

            let wallIntersectionOffset;
            if (wallOrientation === "horizontal") {
              if (this.camera.direction.y > 0) {
                wallIntersectionOffset =
                  wallIntersection - Math.floor(wallIntersection);
              } else {
                wallIntersectionOffset =
                  1 - (wallIntersection - Math.floor(wallIntersection));
              }
            } else {
              if (this.camera.direction.x < 0) {
                wallIntersectionOffset =
                  wallIntersection - Math.floor(wallIntersection);
              } else {
                wallIntersectionOffset =
                  1 - (wallIntersection - Math.floor(wallIntersection));
              }
            }
            let textureStripLeft = Math.floor(
              wallIntersectionOffset * textureWidth
            );
            this.worldCtx.drawImage(
              wallTexture,
              textureStripLeft,
              0,
              1,
              wallTexture.height,
              i,
              top,
              1,
              columnHeight
            );

            // TODO: Change this to color shift the pixels directly instead of messing with a semi-opaque overlay.
            this.worldCtx.fillStyle = "black";
            this.worldCtx.globalAlpha =
              1 -
              (VIEW_DISTANCE - normalizedDistance * darknessMultiplier) /
                VIEW_DISTANCE;
            this.worldCtx.fillRect(i, top, 1, columnHeight);
            this.worldCtx.globalAlpha = 1;
            break;
        }
      } catch (err) {
        console.warn(err);
        console.warn("Error loading wall texture, using fallback");
        const wallHue = 0; // Anything without a fallback hue will be crazy red and obvious.
        const hsl = `hsl(${wallHue}, 100%, ${brightness}%)`;
        this.worldCtx.fillStyle = hsl;
        this.worldCtx.beginPath();
        this.worldCtx.fillRect(i, top, 1, columnHeight);
        this.worldCtx.closePath();
      }

      // This creates artificial shading on half the vertices to give them extra three dimensional feel.
      if (wallOrientation === "horizontal") {
        this.worldCtx.globalAlpha = 0.2;
        this.worldCtx.fillStyle = "black";
        this.worldCtx.fillRect(i, top, 1, columnHeight);
        this.worldCtx.globalAlpha = 1;
      }

      // ## Floor
      // TODO: Figure out what is happening here.
      let floorXWall;
      let floorYWall;
      //4 different wall directions possible
      if (wallOrientation === "vertical" && rayDirection.x > 0) {
        floorXWall = activeCell.x;
        floorYWall = activeCell.y + wallIntersection;
      } else if (wallOrientation === "vertical" && rayDirection.x < 0) {
        floorXWall = activeCell.x + 1.0;
        floorYWall = activeCell.y + wallIntersection;
      } else if (wallOrientation === "horizontal" && rayDirection.y > 0) {
        floorXWall = activeCell.x + wallIntersection;
        floorYWall = activeCell.y;
      } else {
        floorXWall = activeCell.x + wallIntersection;
        floorYWall = activeCell.y + 1.0;
      }

      // draw the floor from columnBottom to the bottom of the screen
      // TODO: Uh, man, I need to find the original ideas here. It's not complicated, but it's a bit confusing at a glance.
      const columnBottom =
        Math.floor(top + columnHeight) >= 0
          ? Math.floor(top + columnHeight)
          : this.gameSettings.height;
      const floorColumnHeight = this.gameSettings.height - columnBottom;

      if (floorColumnHeight > 0) {
        // Column bottom here I think means visually the highest point on the screen since y increments downwards. So we start at the bottom of the wall and move to the bottom of the screen.
        for (let y = columnBottom; y < this.gameSettings.height; y++) {
          const x = i;
          const currentDist = this.lookupCurrentDist[y];
          const weight = currentDist / normalizedDistance;

          const currentFloorX =
            weight * floorXWall + (1.0 - weight) * this.camera.position.x;
          const currentFloorY =
            weight * floorYWall + (1.0 - weight) * this.camera.position.y;

          // TODO: Would it be more efficient for this to be an array of cell references already retrieved before the render pass?
          const gridCell = this.gridManager.getGridTile(
            Math.floor(currentFloorX),
            Math.floor(currentFloorY)
          );

          // TODO: can Probably just break the loop completely since I don't know a scenario where there would be a gap in the floor so to speak.
          if (gridCell == undefined || gridCell.floorTile == undefined) {
            continue;
          }

          // Let's dim the floor
          // TODO: Better dropoff curve.
          const brightnessModifier = this.lookupFloorBrightnessModifier[y];

          const { surface } = gridCell.floorTile;

          switch (surface) {
            case "color":
              // TODO: This is going to be a bit of a slow down. We should require floors to be hex?
              // const color = getWallColor(gridCell.textureConfig, brightness);

              // TODO: Here is a big breaking assumption. ALL floor colors are hex!
              // TODO: Preprocess wads to coerce all color values into RGB (or require it from the get go, to save stuff like this). Can do this immediately.
              const color = gridCell.floorTile.color;
              const { r, g, b } = hexToRGB(color);

              const index = (y * this.gameSettings.width + x) * 4;
              this.floorCeilingPixelData.data[index] = r * brightnessModifier;
              this.floorCeilingPixelData.data[index + 1] =
                g * brightnessModifier;
              this.floorCeilingPixelData.data[index + 2] =
                b * brightnessModifier;
              this.floorCeilingPixelData.data[index + 3] = 255;
              break;
            case "texture":
              // TODO: Handle gradients. This will fail on gradients.
              const textureName = gridCell.floorTile.texture!.name;
              const floorTexture = this.textureManager.getTexture(textureName)!;

              // // TODO: Temp, to have a floor while textures are missing
              // if (floorTextureName === undefined || floorTexture == null) {
              //   floorTexture = fallBackTexture_Rainbow;
              // }

              // ### DRAW FLOOR
              if (floorTexture != null) {
                const floorTexturePixels = floorTexture.getImageData();

                const floorTexX =
                  Math.floor(currentFloorX * floorTexture.width) %
                  floorTexture.width;
                const floorTexY =
                  Math.floor(currentFloorY * floorTexture.height) %
                  floorTexture.height;
                const textureIndex =
                  (floorTexY * floorTexture.width + floorTexX) * 4;

                const red =
                  floorTexturePixels.data[textureIndex] * brightnessModifier;
                const green =
                  floorTexturePixels.data[textureIndex + 1] *
                  brightnessModifier;
                const blue =
                  floorTexturePixels.data[textureIndex + 2] *
                  brightnessModifier;
                const alpha = floorTexturePixels.data[textureIndex + 3];

                const index = (y * this.gameSettings.width + x) * 4;
                this.floorCeilingPixelData.data[index] = red;
                this.floorCeilingPixelData.data[index + 1] = green;
                this.floorCeilingPixelData.data[index + 2] = blue;
                this.floorCeilingPixelData.data[index + 3] = alpha;
              }

              break;
          }

          // ### DRAW CEILING

          // TODO: Add config bool to specify ceiling. Have fallback color when no ceiling config exists?

          // For now, just check if ceilingConfig exists and assume it is valid.
          const ceiling = gridCell.floorTile.ceiling;
          if (!ceiling) continue;

          // Let's dim the ceiling more than the floor.
          // TODO: Better dropoff curve.
          const ceilingBrightnessModifier = brightnessModifier - 0.2;

          const ceilingSurface = ceiling.surface;
          switch (ceilingSurface) {
            case "color":
              const ceilingColor = ceiling.color!.color;
              // TODO: Here is a big breaking assumption. ALL floor colors are hex!
              const { r, g, b } = hexToRGB(ceilingColor);

              const index =
                ((this.gameSettings.height - y) * this.gameSettings.width + x) *
                4;
              this.floorCeilingPixelData.data[index] =
                r * ceilingBrightnessModifier;
              this.floorCeilingPixelData.data[index + 1] =
                g * ceilingBrightnessModifier;
              this.floorCeilingPixelData.data[index + 2] =
                b * ceilingBrightnessModifier;
              this.floorCeilingPixelData.data[index + 3] = 255;
              break;
            case "texture":
              // TODO: Handle gradients.
              const ceilingTextureName = ceiling.texture!.name;
              let ceilingTexture =
                this.textureManager.getTexture(ceilingTextureName)!;

              if (ceilingTexture != null) {
                const ceilingTexturePixels = ceilingTexture.getImageData();

                const ceilTexX =
                  Math.floor(currentFloorX * ceilingTexture.width) %
                  ceilingTexture.width;
                const ceilTexY =
                  Math.floor(
                    (this.gameSettings.height - currentFloorY) *
                      ceilingTexture.height
                  ) % ceilingTexture.height;
                const textureIndex =
                  (ceilTexY * ceilingTexture.width + ceilTexX) * 4;

                const red =
                  ceilingTexturePixels.data[textureIndex] *
                  ceilingBrightnessModifier;
                const green =
                  ceilingTexturePixels.data[textureIndex + 1] *
                  ceilingBrightnessModifier;
                const blue =
                  ceilingTexturePixels.data[textureIndex + 2] *
                  ceilingBrightnessModifier;
                const alpha = ceilingTexturePixels.data[textureIndex + 3];

                const index =
                  ((this.gameSettings.height - y) * this.gameSettings.width +
                    x) *
                  4;
                this.floorCeilingPixelData.data[index] = red;
                this.floorCeilingPixelData.data[index + 1] = green;
                this.floorCeilingPixelData.data[index + 2] = blue;
                this.floorCeilingPixelData.data[index + 3] = alpha;
              }

              break;
          }
        }
      }
    }

    // ## Floor Rendering.
    // We don't need to put image data on each ray, it makes sense to blit once per frame. We're just calculating on the same pass as the wall.
    this.floorCeilingCtx.putImageData(this.floorCeilingPixelData, 0, 0);
    this.offscreenCtx.drawImage(this.floorCeilingCanvas, 0, 0);
    // TODO: This is a very inefficient way to clear the pixel data I think.
    this.floorCeilingPixelData = this.floorCeilingCtx.createImageData(
      this.gameSettings.width,
      this.gameSettings.height
    );
    this.offscreenCtx.drawImage(this.worldCanvas, 0, 0);
  }

  renderSprites() {
    // Sort the sprites by distance from the camera
    const sortedSprites = this.objects.sort((a, b) => {
      const aDistance =
        Math.pow(this.camera.position.x - a.transform.position.x, 2) +
        Math.pow(this.camera.position.y - a.transform.position.y, 2);
      const bDistance =
        Math.pow(this.camera.position.x - b.transform.position.x, 2) +
        Math.pow(this.camera.position.y - b.transform.position.y, 2);
      return bDistance - aDistance;
    });

    if (!sortedSprites.length) return;

    const zBuffer = this.eventManager.nextRays.rays.map(
      (nextRay) => nextRay.normalizedDistance
    );

    // Render each sprite
    for (const object of sortedSprites) {
      if (object.transform && object.sprite) {
        // if (object.transform && object.sprite && object.animation) {
        // Calculate the screen position and size of the sprite
        const spriteXRelativeToCamera =
          object.transform.position.x - this.camera.position.x;
        const spriteYRelativeToCamera =
          object.transform.position.y - this.camera.position.y;

        const transformX =
          this.camera.camera.inverseDeterminate *
          (this.camera.direction.x * spriteYRelativeToCamera -
            this.camera.direction.y * spriteXRelativeToCamera);
        const transformY = Math.max(
          this.camera.camera.inverseDeterminate *
            (-this.camera.plane.y * spriteXRelativeToCamera +
              this.camera.plane.x * spriteYRelativeToCamera),
          0
        );
        const spriteScreenX = Math.floor(
          (this.gameSettings.width / 2) * (1 + transformX / transformY)
        );

        // using "transformY" instead of the real distance prevents fisheye
        const scale = object.transform.scale;
        const spriteHeight = Math.abs(
          Math.floor(this.gameSettings.height / transformY) * scale.y
        );

        // calculate lowest and highest pixel to fill in current stripe
        const drawStartY = Math.floor(
          -spriteHeight / 2 + this.gameSettings.height / 2
        );
        const drawEndY = spriteHeight + drawStartY;

        //calculate width of the sprite
        // The width ratio ensures the sprite is not stretched horizontally.
        const widthRatio =
          (object.sprite.width / object.sprite.height) * scale.x;
        const spriteWidth = Math.abs(
          Math.floor((this.gameSettings.height / transformY) * widthRatio)
        );
        const drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
        const drawEndX = spriteWidth / 2 + spriteScreenX;

        const texture = this.textureManager.getTexture(object.sprite.texture);

        // Draw sprite in vertical strips.
        for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
          const texX =
            Math.floor(
              (256 *
                (stripe - (-spriteWidth / 2 + spriteScreenX)) *
                object.sprite.width) /
                spriteWidth
            ) / 256;
          //the conditions in the if are:
          //1) it's in front of camera plane so you don't see things behind you
          //2) it's on the screen (left)
          //3) it's on the screen (right)
          //4) ZBuffer, with perpendicular distance
          if (
            transformY > 0 &&
            stripe > 0 &&
            stripe < this.gameSettings.width &&
            transformY < zBuffer[stripe]
          ) {
            // TODO: When sprites are multifaceted, we'll need to pass in player pos/dir to calculate the face;
            this.offscreenCtx.drawImage(
              texture!.canvas,
              texX,
              0,
              1,
              object.sprite.height,
              stripe,
              drawStartY,
              1,
              drawEndY - drawStartY
            );
          }
        }
      }
    }
  }

  draw() {
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  // TODO: Framerate limit this.
  update(dt: number) {
    // TODO: Can we break up rendering to each layer into separate threads with offscreen canvas? Yes, but later.

    // TODO: Render Sky
    this.renderSkybox();
    // TODO: Render World (Walls, Floors, Ceilings, Sprites)
    this.renderWorld();
    this.renderSprites();
    // TODO: Render HUD (MapOverlay, Text, etc)

    // TODO: Combine all the buffers into a single offscreen buffer.
    // I'd like to look into options. Maybe layered canvases. Maybe manipulating pixels directly...
    // Right now we're doing this slow by copying over each buffer onto one buffer in the draw call itself.

    // TODO: Render offscreen buffer to the screen. Clear offscreen buffer for next pass (double buffer)
    this.draw();
  }
}
