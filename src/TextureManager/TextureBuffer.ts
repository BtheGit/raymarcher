import { loadImage } from "../utils/image";

export class TextureBuffer {
  private _canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private _imageData: ImageData;
  private _transposedBitmap: Uint8ClampedArray;
  private _width: number;
  private _height: number;

  protected constructor(image: HTMLImageElement | HTMLCanvasElement) {
    this._canvas = document.createElement("canvas");
    this._width = this._canvas.width = image.width;
    this._height = this._canvas.height = image.height;
    this.context = this._canvas.getContext("2d", { willReadFrequently: true })!;
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(image, 0, 0);
    this._imageData = this.context.getImageData(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );

    // I want to start using pixel data consistently, instead of a mix of direct pixel manipulation and also drawImage calls.
    // To that effect, I want to use a transposed bitmap to allow us to read column data sequentially for all textures since this is
    // a raycaster and that should help a bit in terms of memory cache access.
    this._transposedBitmap = TextureBuffer.transposeBitmap(
      this._imageData.data,
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

  static transposeBitmap(
    bitmap: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8ClampedArray {
    // Transpose the bitmap so that we can read column data sequentially.
    const transposedBitmap = new Uint8ClampedArray(bitmap.length);
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        const index = 4 * (width * y + x);
        const transposedIndex = 4 * (height * x + y);
        transposedBitmap[transposedIndex] = bitmap[index];
        transposedBitmap[transposedIndex + 1] = bitmap[index + 1];
        transposedBitmap[transposedIndex + 2] = bitmap[index + 2];
        transposedBitmap[transposedIndex + 3] = bitmap[index + 3];
      }
    }
    return transposedBitmap;
  }

  getImageData(): ImageData {
    return this._imageData;
  }

  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get canvas() {
    return this._canvas;
  }

  get transposedBitmap() {
    return this._transposedBitmap;
  }
}
