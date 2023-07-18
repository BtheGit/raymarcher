import { TextureBuffer } from "./TextureBuffer";
import { sine } from "../utils/flatWarp";
// NOTE: This is a dynamically (math) animated texture. Sprites are a different class.

// TODO: I may have gone a bit in several directions on textures, sprites, animations...
// To that end, I want to keep the code for this as far to a leaf as possible so we can reorganize easier as needed. (Stuff like even frustum culling if off screen etc is not gonna be a consideration).
// I have no idea before implementation what the system drain is going to be for these, so no constraints. But I may find scaling to pretty small textures would be useful.
// I'm also going to avoid even reusing the texture buffer so i can figure out how to combine all the systems later with less initial cross-dependency to unravel. But there will be a lot of redundant code!
// Next, there are a lot of ways to recalculate frames. The animation system (though right now it acts only on entities), the texture manager... I'm going to try out a way, but it's not for lack of thought towards other ideas. Consider this trial too as long as the comment is alive.
// Finally, how to do animation. Whether completely functionally based on parameters to allow caching responses (which should then be limited to x amount of total frames for memory considerations), or not cached, or on it's own animation frame loop so that no matter what animations are happening.
// I think what I'll do starting out is to have a consistent frame rate for all animated textures (I should probably have done this for sprites too - I think doom does this), no matter what, we'll keep advancing the current frame index for each animation (why not just keep one? so that different animations can have different lengths), but not actually do a new frame render calculation until requested (so the on screen camera can do some of that frustum culling for us).
// TODO: Once I've verified, this really should be merged witht he base texturemanager. To that end, I will connect them so much as letting texture manager do the initial texture loading, such that I intake a texture buffer, extract the pixels and dimensions and go from there.

// TODO: Extend base TextureBuffer with shared methods like get canvas

export class AnimatedTexture {
  private currentFrame = 0;
  private frameCount = 0; // Since frames are not prerendered, this gives us a way to do looping based on a frame ratio (framecount = 100%)
  // To make this simple, even though it may be a waste, for now, even a simple color will first be rendered into a canvas texture. And to be even more simple, we'll use an existing texturebuffer. If we modify one that is being used for static purpsoes as well we might have trouble, obviosuly that can simply be avoided by not doing it. Alternately, we could copy the pixels to have a new texture buffer.
  private baseTexture: TextureBuffer;
  private baseData: number[];
  private tileBufferCanvas: HTMLCanvasElement;
  private tileBuffer: CanvasRenderingContext2D;
  private imageData: ImageData;
  // private imageDataArray: Uint8ClampedArray;
  private animationType = "";
  private name = "";
  // TODO: Image Data Array of pixels should always be on hand
  // TODO: A cache of previously rendered frame based on frame count - so eventually we don't have to recalculate (but only if the frame count stays low, otherwise memory leak)

  // TODO: Enum for animation types
  constructor(
    textureBuffer: TextureBuffer,
    animationType: string,
    name: string,
    frameCount: number
  ) {
    this.baseTexture = textureBuffer;
    // TODO: Use offscreeen canvas??
    this.tileBufferCanvas = document.createElement("canvas")!;
    this.tileBufferCanvas.width = this.baseTexture.width;
    this.tileBufferCanvas.height = this.baseTexture.height;
    this.tileBuffer = (this.tileBufferCanvas as HTMLCanvasElement).getContext(
      "2d"
    )!;
    this.tileBuffer.drawImage(this.baseTexture.canvas, 0, 0);
    this.imageData = this.tileBuffer!.getImageData(
      0,
      0,
      this.tileBufferCanvas.width,
      this.tileBufferCanvas.height
    );
    this.baseData = Array.from(this.imageData.data);
    this.name = name;
    this.frameCount = frameCount;
  }

  // TODO: Keeping this here short term while I come to grips with understanding. After break up instantiation variables into options and pass in what it needs to run. Break it into util with rest of its functions. (From https://fdossena.com/?p=quakeFluids/i.md) https://fdossena.com/quakeFluids/LavaDemo/index.html

  // TODO: Not seamless. Would probably need to sample also based on world offset (complicated and different depending on wall, floor etc?) to have something relational between different tiles?
  // The answer may be here, which I should have looked up sooner:
  // TODO: https://github.com/rheit/zdoom/blob/d44976175256f3db8ec61cca40f1267cca68967d/src/textures/warptexture.cpp#L44
  private flatWarp = () => {
    const SPEED = 1;
    const RESOLUTION = 1;
    const SCALE = 1;
    const CLOSENESS = 1;
    const INTENSITY = 1;
    let t = ~~(new Date().getTime() * SPEED);
    let compScale = CLOSENESS * RESOLUTION * 2;
    let xOff, yOff, yM, xM, txM;
    for (let y = 0; y < this.height; y++) {
      yM = y * this.width;
      for (let x = 0; x < this.width; x++) {
        xM = 4 * (yM + x);
        yOff =
          ~~(
            (y / compScale + INTENSITY * sine(t / 16 + (x / compScale) * 2)) *
            SCALE
          ) % this.height;
        yOff = yOff >= 0 ? yOff : this.height + yOff;
        xOff =
          ~~(
            (x / compScale + INTENSITY * sine(t / 16 + (y / compScale) * 2)) *
            SCALE
          ) % this.width;
        xOff = xOff >= 0 ? xOff : this.width + xOff;
        txM = 4 * (yOff * this.width + xOff);
        this.imageData.data[xM] = this.baseData[txM];
        this.imageData.data[xM + 1] = this.baseData[txM + 1];
        this.imageData.data[xM + 2] = this.baseData[txM + 2];
        this.imageData.data[xM + 3] = this.baseData[txM + 3];
      }
    }
    this.tileBuffer.putImageData(this.imageData, 0, 0);
  };

  // TODO: Should I support multiple frame advancing?
  advanceFrame = () => {
    if (this.frameCount) {
      // TODO: Right now the animation loop is based on time, so this does nothing. We'll try and sort out how to change that presently
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;

      // NOTE: This call is very heavy, don't do it often or with very small textures.
      // TODO: Also, these aren't seamless. Win some, lose some for now.
      this.flatWarp();
    }
  };

  getImageData(): ImageData {
    return this.imageData;
  }

  get width() {
    return this.tileBufferCanvas.width;
  }

  get height() {
    return this.tileBufferCanvas.height;
  }

  get canvas() {
    return this.tileBufferCanvas;
  }
}
