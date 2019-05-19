class ImageBuffer {
  constructor(image){
    this.rawImage = image;
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = this.rawImage.width;
    this.height = this.canvas.height = this.rawImage.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(this.rawImage, 0, 0);
  }

  getCanvas(){
    return this.canvas;
  }
  
  getImageData(){
    return(this.ctx.getImageData(0,0, this.width, this.height));
  }

  trigger(){
    return;
  }
}
