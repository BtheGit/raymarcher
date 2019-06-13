// CURRENTLY UNUSED

class WorldObject {
  // Sprites are images that have an x and y for location on the game map.
  // In the future they can have:
  // - a vertical offset for raising or lowering them
  // - a bounding box for collisions (my preference is a radius from the x,y position)

  // This is all very temporary and likely unsustainable. There are at multiple kinds of sprites: a static sprite with one angle,
  // a static sprite with 8 angles, a moveable sprite with one angle, a moveable sprite with 8 angles, a moveable sprite with one angle
  // and multiple animation states, a moveable sprite with 8 angles and multiple animation states.
  // The class breakdown
  constructor(pos, spritesheetBuffer, isSolid = false){
    this.pos = new Vector(pos.x, pos.y);
    this.dir = 
    this.spritesheet = spritesheetBuffer;
    this.boundingBox = isSolid ? this.spritesheet.width / 2 : null;
    // The spritesheet will be an imagebuffer already
  }
}

export default WorldObject;