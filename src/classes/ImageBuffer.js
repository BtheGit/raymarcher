class ImageBuffer {
  constructor(image){
    this.rawImage = image;
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = this.rawImage.width;
    this.height = this.canvas.height = this.rawImage.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(this.rawImage, 0, 0);
    // Right now, getting the image data for textures on the fly can be really slow.
    // We might be able to better take advantage of memory by doing it for all textures
    // at the outset.
    // If that's too much memory, we could do a mix. Certain texture's image data could be loaded
    // up front and other's on the fly.
    this.imageData = this.ctx.getImageData(0,0, this.width, this.height);
  }

  getCanvas(){
    return this.canvas;
  }

  getImageData() {
    return this.imageData;
  }
  
  trigger(){
    return;
  }
}

export default ImageBuffer;