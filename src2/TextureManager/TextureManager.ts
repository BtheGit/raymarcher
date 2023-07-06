import { TextureBuffer } from "./TextureBuffer";
export class TextureManager {
  private textureBuffers: Record<string, TextureBuffer> = {};
  private textureMap: Record<string, string> = {};
  private defaultTexture: TextureBuffer;

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
