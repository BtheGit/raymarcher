import { SpriteManager } from "../SpriteManager/SpriteManager";
import { TextureBuffer } from "./TextureBuffer";

export class SpriteTexture {
  private spriteManager: SpriteManager;
  private currentFrame: TextureBuffer;
  private currentFrameIndex = 0;
  private frames: string[];

  constructor(spriteManager: SpriteManager, name: string, frames: string[]) {
    if (!frames.length) {
      throw new Error("Cannot load a sprite texture with no frames");
    }
    this.spriteManager = spriteManager;
    this.frames = frames;
    this.currentFrame = this.spriteManager.getSpriteTexture(
      this.frames[this.currentFrameIndex]
    )!;
  }

  advanceFrame = () => {
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    this.currentFrame = this.spriteManager.getSpriteTexture(
      this.frames[this.currentFrameIndex]
    )!;
  };

  getImageData() {
    return this.currentFrame.getImageData();
  }

  get width() {
    return this.currentFrame.width;
  }

  get height() {
    return this.currentFrame.height;
  }

  get canvas() {
    return this.currentFrame.canvas;
  }
}
