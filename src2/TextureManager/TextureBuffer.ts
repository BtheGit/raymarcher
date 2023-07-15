import { loadImage } from "../utils/image";

export class TextureBuffer {
  private _canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private _imageData: ImageData;

  protected constructor(image: HTMLImageElement | HTMLCanvasElement) {
    this._canvas = document.createElement("canvas");
    this._canvas.width = image.width;
    this._canvas.height = image.height;
    this.context = this._canvas.getContext("2d", { willReadFrequently: true })!;
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(image, 0, 0);
    this._imageData = this.context.getImageData(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );
  }

  static async fromPath(path: string): Promise<TextureBuffer> {
    const image = await loadImage(path);
    return new TextureBuffer(image);
  }

  static fromImage(image: HTMLImageElement | HTMLCanvasElement): TextureBuffer {
    return new TextureBuffer(image);
  }

  getImageData(): ImageData {
    return this._imageData;
  }

  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get width() {
    return this._canvas.width;
  }

  get height() {
    return this._canvas.height;
  }

  get canvas() {
    return this._canvas;
  }
}
