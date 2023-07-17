import { AnimatedTexture } from "./AnimatedTexture";
import { WADTextureAnimation } from "../raymarcher";
import { TextureBuffer } from "./TextureBuffer";
export class TextureManager {
  private textureBuffers: Record<string, TextureBuffer> = {};
  private textureMap: Record<string, string> = {};
  private defaultTexture: TextureBuffer;
  private animatedTextures = new Map<string, AnimatedTexture>();
  private lastFrameTime = Date.now();

  // TODO: Support adding textures after. For now, we need them on load and that's it.
  /// TODO:  Support lazy loading textures. Right now we want it blocking just in case. And we want it to load
  // everything up front. (though maybe we can tell it which ones to load immediately.)
  // constructor(
  //   textureMap: Record<string, string> = {},
  //   preloadList: string[] = []
  // ) {
  //   this.textureMap = textureMap;

  //   for (const textureName of preloadList) {
  //     this.loadTexture(textureName, textureMap[textureName]);
  //   }
  // }

  // loadTextures()

  constructor() {
    this.defaultTexture = this.generateDefaultTexture();
  }

  private generateDefaultTexture = () => {
    const fallBackTextureCanvas_Rainbow = document.createElement("canvas");
    fallBackTextureCanvas_Rainbow.width = 64;
    fallBackTextureCanvas_Rainbow.height = 64;
    const fallbackTextureCtx = fallBackTextureCanvas_Rainbow.getContext("2d")!;
    for (let i = 0; i < fallBackTextureCanvas_Rainbow.width; i += 8) {
      fallbackTextureCtx.fillStyle = `hsl(${i * 5}, 100%, 80%)`;
      fallbackTextureCtx.fillRect(i, 0, 8, 64);
    }
    return TextureBuffer.fromImage(fallBackTextureCanvas_Rainbow);
  };

  async loadTexture(key: string, path: string): Promise<void> {
    try {
      const buffer = await TextureBuffer.fromPath(path);
      this.textureMap[key] = path; // This line lets us add in ones in later
      this.textureBuffers[key] = buffer;
    } catch {
      console.log("Error loading texture, " + key);
    }
  }

  public getTexture(key: string): TextureBuffer | null {
    if (key === "default") return this.defaultTexture;

    let texture = this.textureBuffers[key];

    if (!texture) {
      const path = this.textureMap[key]; // || this.defaultTexturePath;
      if (path) {
        this.loadTexture(key, path);
      }
      // The above will lazily load in the texture for the next time it gets looked up.
    }

    // TODO: Always return at least the default texture buffer
    return texture || null;
  }

  public getTextureDimensions(
    key: string
  ): { width: number; height: number } | undefined {
    const texture = this.getTexture(key);
    if (!texture) {
      return;
    }
    return { width: texture.width, height: texture.height };
  }

  // Going to try this for sprite frames. But might want to simply create Imagebuffers for each frame instead. Not sure.
  public getCroppedTexture(
    key: string,
    x: number,
    y: number,
    width: number,
    height: number,
    mirrored = false
  ): TextureBuffer | null {
    const texture = this.getTexture(key);
    if (!texture) return null;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const ctx = croppedCanvas.getContext("2d");
    if (!ctx) return null;

    ctx.save();
    if (mirrored) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      texture.getCanvas(),
      x,
      y,
      width,
      height,
      mirrored ? -width : 0,
      0,
      width,
      height
    );

    ctx.restore();

    return TextureBuffer.fromImage(croppedCanvas);
  }

  public getCroppedTexturePixels(
    key: string,
    x: number,
    y: number,
    width: number,
    height: number,
    mirrored = false
  ): Uint8ClampedArray | null {
    const textureBuffer = this.textureBuffers[key];
    if (!textureBuffer) return null;

    const imageData = textureBuffer.getImageData();
    const croppedPixelData = new Uint8ClampedArray(width * height * 4);
    const targetIndexOffset = mirrored ? width - 1 : 0;

    for (let offsetY = 0; offsetY < height; offsetY++) {
      const sourceIndex =
        ((y + offsetY) * textureBuffer.canvas.width + x + targetIndexOffset) *
        4;
      const targetIndex = offsetY * width * 4;

      for (let offsetX = 0; offsetX < width; offsetX++) {
        const sourcePixelIndex =
          sourceIndex + (mirrored ? -offsetX : offsetX) * 4;
        const targetPixelIndex = targetIndex + offsetX * 4;

        croppedPixelData[targetPixelIndex] = imageData.data[sourcePixelIndex]; // Red channel
        croppedPixelData[targetPixelIndex + 1] =
          imageData.data[sourcePixelIndex + 1]; // Green channel
        croppedPixelData[targetPixelIndex + 2] =
          imageData.data[sourcePixelIndex + 2]; // Blue channel
        croppedPixelData[targetPixelIndex + 3] =
          imageData.data[sourcePixelIndex + 3]; // Alpha channel
      }
    }

    return croppedPixelData;
  }

  // TODO: This is bad. We should be able to get any texture, animated or otherwise without knowing the difference.
  // For now though, since it's late but I haven't run out of excuses, I'm going to make it incumbent ont he render call to decide which type of texture to grab (extra yuck). FIX LATER PLEASE
  getAnimatedTexture = (name: string) => {
    return this.animatedTextures.get(name);
  };

  loadTextureAnimation = (wadTileAnimation: WADTextureAnimation) => {
    // MVP, only support one type, which is preloaded texture based.
    // Also, temporarily, only going to support flat warping :)
    const { frameCount, name, texture, animationType } = wadTileAnimation;
    // Get the pixel data from the original texture buffer.
    const textureBuffer = this.getTexture(texture);
    if (!textureBuffer) {
      throw new Error("Texture buffer does not exist");
    }

    const animatedTile = new AnimatedTexture(
      textureBuffer,
      animationType,
      name,
      frameCount
    );
    this.animatedTextures.set(name, animatedTile);
  };

  loadTextureAnimations = (wadTextureAnimations: WADTextureAnimation[]) => {
    for (const wadTextureAnimation of wadTextureAnimations) {
      this.loadTextureAnimation(wadTextureAnimation);
    }
  };

  update(_dt: number) {
    const time = Date.now();
    const dt = time - this.lastFrameTime;
    if (dt >= 1000 / 10) {
      this.lastFrameTime = time;
    } else {
      return;
    }
    for (const animatedTexture of this.animatedTextures) {
      animatedTexture[1].advanceFrame();
    }
  }

  // public setDefaultTexturePath(path: string): void {
  //   this.defaultTexturePath = path;
  // }

  // public unloadTexture(key: string): void {
  //   delete this.textureBuffers[key];
  //   delete this.textureMap[key];
  // }

  // public clearTextures(): void {
  //   this.textureBuffers = {};
  //   this.textureMap = {};
  //   // this.defaultTexturePath = null;
  // }
}
