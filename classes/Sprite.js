/**
 * A sprite defines a wrapper around a spritesheet
 * and the wrapping object. To be later separated.
 */
class Sprite {
  constructor(textureMap, spriteConfig){
    // This class was originally going to wrap the spritesheet (to make
    // it easier to pull off specific locations and handle issues with proportional scaling.)
    // TODO: Create spritesheet class.
    this.spritesheet = textureMap[spriteConfig.spritesheet];
    this.pos = new Vector(spriteConfig.pos.x, spriteConfig.pos.y);
    this.type = spriteConfig.type;
    this.isSolid = spriteConfig.isSolid;
    this.isMultifaceted = spriteConfig.isMultifaceted;
    this.isAnimated = spriteConfig.isAnimated;

    // TODO: The height might need to be calculated dynimcally. For now we'll just
    // use the spritesheet dimensions (since we only have single frame sprites as of now)
    this.scale = spriteConfig.scale ? spriteConfig.scale : 1;
    this.height = this.spritesheet.height;
    this.width = this.spritesheet.width;

    this.verticalOffset = spriteConfig.verticalOffset ? spriteConfig.verticalOffset : 1;

    // TODO: The dynamic setups should be done more dynamically, natch.
    if(this.isSolid){
      this.boundingBox = spriteConfig.boundingBox;
    }
    if(this.isMultifaceted){
      // Load faces etc.
      this.dir = new Vector(spriteConfig.dir);
    }
    if(this.isAnimated){
      // Deal with controllers, paths, subscribe to animation loops etc.
    }
  }

  getFrame(){
    // TODO: When we start having multifaceted sprites, there will have to be
    // additional calculations. For now we can just return the full imagebuffer of the spritesheet.
    return this.spritesheet.getCanvas();
  }

  showText(){
    console.log('I am a sprite')
  }
}