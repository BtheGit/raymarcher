// TEST to use bokehfy to create animated walls
// TODO: Don't let an opacity be set (no transparency)
// TODO: If I can add in support of background images for bokehfy, I can use it as
// an effect over normal game tiles!
class BokehImageBuffer {
  el = document.createElement("div");
  field: any; // Some bokeh specific thing
  settings: any & { parent: HTMLDivElement }; // More bokeh specific stuff to be clarified later
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(bokehSettings = {}, sideLength = 200) {
    this.settings = { ...bokehSettings, parent: this.el };
    this.field = bokehfy(this.settings);
    this.canvas = this.field.canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.width = this.canvas.width = sideLength;
    this.height = this.canvas.height = sideLength;
    console.log("bokeh image buffer");
  }

  getCanvas() {
    // Because of the way bokehfy uses the parent of the bokeh field canvas as a barometer
    // on resize events. We need to manually update the size here if it is 0 (ie a resize event has
    // occured) before returning the image.
    if (!this.canvas.width || !this.canvas.height) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    return this.canvas;
  }

  getImageData() {
    console.log("get bokeh image data");
    return this.ctx.getImageData(0, 0, this.width, this.height);
  }

  trigger() {
    return;
  }
}

export default BokehImageBuffer;
