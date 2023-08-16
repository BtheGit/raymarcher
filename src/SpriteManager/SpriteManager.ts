// https://zdoom.org/wiki/Sprite
// https://zdoom.org/wiki/Creating_new_sprite_graphics

import { TextureBuffer } from "../TextureManager/TextureBuffer";
import { TextureManager } from "../TextureManager/TextureManager";
import { SpritesheetData, SpriteFrameData } from "../types";

export interface SpriteData {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  spriteSourceSize: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  sourceSize: {
    w: number;
    h: number;
  };
  pivot: {
    x: number;
    y: number;
  };
  mirrored: boolean;
  texture: string;
  textureId: string;
  textureName: string;
}

export class SpriteManager {
  private textureManager: TextureManager;
  private sprites = {};
  private spritesheets = new Map<string, SpritesheetData["meta"]>();

  constructor(textureManager: TextureManager) {
    this.textureManager = textureManager;
  }

  public loadSprites = (spriteData: SpritesheetData) => {
    const { frames, meta } = spriteData;
    for (const frameId in frames) {
      // NOTE: Since doom wads (where I may find a lot of textures) use this weird system, for now, I'm going to expect it. Which means if a texture. So, we check if it's 2, 3, 4 and create a match 8, 7, 6 and also add a flag indicating it should be flipped.
      const frame = {
        ...frames[frameId],
        mirrored: false,
        texture: meta.image,
        textureId: meta.id,
        textureName: meta.name,
      };
      this.sprites[frameId] = frame;
      let mirroredFrameId;
      const directionIndex = frameId.slice(-1);
      if (directionIndex === "2") {
        mirroredFrameId = frameId.slice(0, -1) + "8";
      } else if (directionIndex === "3") {
        mirroredFrameId = frameId.slice(0, -1) + "7";
      } else if (directionIndex === "4") {
        mirroredFrameId = frameId.slice(0, -1) + "6";
      }

      if (mirroredFrameId) {
        this.sprites[mirroredFrameId] = { ...frame, mirrored: true };
      }
    }
  };

  public getSpriteTexture(frameId: string): TextureBuffer | null {
    const spriteFrame = this.getSpriteFrame(frameId);
    if (!spriteFrame) return null;

    const { textureName, frame, mirrored } = spriteFrame;
    return this.textureManager.getCroppedTexture(
      textureName,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      mirrored
    );
  }

  // public getSpriteTexture(
  //   frameId: string,
  //   brightnessLookupTable: number[]
  // ): Uint8ClampedArray | null {
  //   const spriteFrame = this.getSpriteFrame(frameId);
  //   if (!spriteFrame) return null;

  //   const { textureName, frame, mirrored } = spriteFrame;

  //   const pixelStrip = this.textureManager.getCroppedTexturePixels(
  //     textureName,
  //     frame.x,
  //     frame.y,
  //     frame.w,
  //     frame.h,
  //     mirrored
  //   );

  //   if (!pixelStrip) return null;

  //   // const adjustedPixelStrip = pixelStrip.map((value) => {
  //   //   // Perform brightness adjustment calculation using the lookup table.
  //   //   return brightnessLookupTable[value];
  //   // });

  //   return pixelStrip; // new Uint8ClampedArray(adjustedPixelStrip);
  // }

  public getSpriteFrame(frameId: string): SpriteData | null {
    return this.sprites[frameId] || null;
  }
}

export class SpriteFrame {
  public frameId: string;
  public frameData: SpriteFrameData;
  public texture: TextureBuffer;

  constructor(
    frameId: string,
    frameData: SpriteFrameData,
    texture: TextureBuffer
  ) {
    this.frameId = frameId;
    this.frameData = frameData;
    this.texture = texture;
  }
}
