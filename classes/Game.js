

const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 768;

class Game {
  constructor(maps, images, sprites, framerate){
    // We want to preserve the player's location when they are returning from an interaction
    // that caused them to navigate away to a link.
    const savedState = loadStateFromSessionStorage(STORAGE_ID);
    this.images = images;
    this.sprites = sprites;
    this.interval = framerate;
    this.animationFrame = null;

    // Gonna hardcode the first level for now. TODO: REMOVE
    this.maps = maps;
    this.currentMap = savedState ? savedState.currentMap : this.maps[0];
    this.grid = new Map(this.currentMap.grid);

    this.screen = new Screen(this, 'display-main', SCREEN_WIDTH, SCREEN_HEIGHT);

    this.player = savedState 
      ? new Player(
          this,
          new Vector(savedState.playerPos.x, savedState.playerPos.y), 
          new Vector(savedState.playerDir.x, savedState.playerDir.y),
          new Vector(savedState.playerPlane.x, savedState.playerPlane.y)
        )
      : new Player(
          this, 
          new Vector(this.currentMap.playerPos.x, this.currentMap.playerPos.y), 
          new Vector(this.currentMap.playerDir.x, this.currentMap.playerDir.y),
          new Vector(this.currentMap.playerPlane.x, this.currentMap.playerPlane.y)
        );

    this.keyState = {}; // Active store of keypresses
    document.addEventListener('keydown', ({ key }) => {
      this.keyState[key] = true;
    })
    document.addEventListener('keyup', ({ key }) => {
      this.keyState[key] = false;
    })
  }

  start() {
    let then = Date.now()
    let delta;

    const draw = timestamp => {
      const now = Date.now(timestamp);
      delta = now - then;
      if(delta > this.interval) {
        /* BEGIN Game Loop */
        this.updatePlayerPositioning();
        this.player.cast();      
        this.drawScreen();
        /* END Game Loop */
        then = now - (delta % this.interval)
      }
      this.animationFrame = requestAnimationFrame(draw);
    }
    this.animationFrame = requestAnimationFrame(draw)
  }

  updatePlayerPositioning(){
    if(this.keyState['`']){
      this.screen.showMap();
    }
    else {
      this.screen.hideMap();
    }
    if(this.keyState.a){
      this.player.rotate(1);
    }
    if(this.keyState.d){
      this.player.rotate(-1);
    }
    if(this.keyState.w){
      this.player.moveForward();
    }
    if(this.keyState.s){
      this.player.moveBack();
    }
    if(this.keyState[' ']){
      this.keyState[' '] = false;
      this.player.trigger();
    }
  }

  stop() {
    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null;
  }

  drawScreen(){
    this.screen.draw();
  }

  saveStateToSessionStorageOnUnload(){
    // We need a few things to restore the game (in its current form)
    const state = {
      playerPos: {
        x: this.player.pos.x,
        y: this.player.pos.y
      },
      playerDir: {
        x: this.player.dir.x,
        y: this.player.dir.y
      },
      playerPlane: {
        x: this.player.plane.x,
        y: this.player.plane.y
      },
      currentMap: this.currentMap
    };
    saveStatetoSessionStorage(STORAGE_ID, state);
  }

}