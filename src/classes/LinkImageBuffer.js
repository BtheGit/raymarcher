import ImageBuffer from "./ImageBuffer";

class LinkImageBuffer extends ImageBuffer {
  constructor(href, image) {
    super(image);
    this.href = href;
  }

  trigger(game) {
    // Instead of having to pass in the game object like this, we could broadcast events
    game.saveStateToSessionStorageOnUnload();
    window.location.href = this.href;
    // We should also add in a highlight effect on elements that have a trigger function when in range, indicating they can
    // be triggered.
  }
}

export default LinkImageBuffer;
