
import Map from './Map';
import Screen from './Screen';
import TextDisplay from './TextDisplay';
import Player from './Player';
import Vector from './Vector';
import TouchScreen from './TouchScreen';
import {
  loadStateFromSessionStorage,
  saveStatetoSessionStorage,
} from '../utilities';

class Game {
  constructor(settings, map, images, sprites, textureMap){
    this.editorMode = settings.editorMode;

    this.storageId = settings.storageId;
    const savedState = loadStateFromSessionStorage(this.storageId);

    this.images = images;
    this.interval = settings.framerate;
    this.animationFrame = null;

    this.textureMap = textureMap;
    this.sprites = sprites;
    this.currentMap = map;

    if(!this.editorMode && savedState){
      // We want to preserve the player's location when they are returning from an interaction
      // that caused them to navigate away to a link.
      // This won't be used in Editor Mode.
      this.currentMap = savedState.currentMap;
    }

    // Ugh I need to find all the places I call this and rename it to map!!
    this.grid = new Map(this.currentMap.grid);

    this.screen = new Screen(this, settings.displayId, settings.width, settings.height);

    this.touchScreen = new TouchScreen(settings.width, settings.height);

    this.textDisplay = new TextDisplay(Math.floor(settings.width * .75), Math.floor(settings.height * .75))
    const introText = this.currentMap.introText;
    if(introText){
      this.textDisplay.write(introText.text, introText.displayLength);
    }

    this.player = new Player(
      this, 
      new Vector(this.currentMap.playerPos.x, this.currentMap.playerPos.y), 
      new Vector(this.currentMap.playerDir.x, this.currentMap.playerDir.y),
      new Vector(this.currentMap.playerPlane.x, this.currentMap.playerPlane.y)
    );

    if(!this.editorMode && savedState) {
      this.player = new Player(
        this,
        new Vector(savedState.playerPos.x, savedState.playerPos.y), 
        new Vector(savedState.playerDir.x, savedState.playerDir.y),
        new Vector(savedState.playerPlane.x, savedState.playerPlane.y)
      )
    }
    
    this.canvas = document.getElementById(settings.displayId);
    this.keyState = {}; // Active store of keypresses
    document.addEventListener('keydown', ({ key }) => {
      this.keyState[key] = true;
    });
    document.addEventListener('keyup', ({ key }) => {
      this.keyState[key] = false;
    });
    // We want to add the listeners here rather than in the touchscreen itself so that
    // we can share logic with the keypress events.
    this.canvas.addEventListener('touchstart', e => {
      const newKeyState = this.touchScreen.handleTouchStart(e, this.keyState);
      this.keyState = newKeyState;
    })
    // TODO: For multi-touch support
    // this.canvas.addEventListener('touchmove', e => {
    //   const newKeyState = this.touchScreen.handleTouchMove(e, this.keyState);
    //   this.keyState = newKeyState;
    // })
    this.canvas.addEventListener('touchend', e => {
      const newKeyState = this.touchScreen.handleTouchEnd(e, this.keyState);
      this.keyState = newKeyState;
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
        this.touchScreen.draw(this.screen);
        this.textDisplay.draw(this.screen);
        /* END Game Loop */
        then = now - (delta % this.interval)
      }
      this.animationFrame = requestAnimationFrame(draw);
    }
    this.animationFrame = requestAnimationFrame(draw)
  }

  updatePlayerPositioning(){
    if(!this.editorMode || (this.editorMode && document.activeElement === this.canvas)){
      if(this.keyState['`']){
        this.screen.showMap();
      }
      else {
        this.screen.hideMap();
      }
      if(this.keyState.a){
        this.player.rotate(-1);
      }
      if(this.keyState.d){
        this.player.rotate(1);
      }
      if(this.keyState.w){
        // if(this.keyState.Shift){
        //   this.player.moveForward(1.5);
        // }
        // else {
          this.player.moveForward();
        // }
      }
      if(this.keyState.s){
        this.player.moveBack();
      }
      if(this.keyState[' ']){
        this.keyState[' '] = false;
        this.player.trigger();
      }
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
    saveStatetoSessionStorage(this.storageId, state);
  }

  // Methods for hot updating game assets.
  updateMap(newMap){
    // TODO: Better setters and a handler for map struct
    this.currentMap = newMap;
    this.grid.updateGrid(newMap.grid);
  }

  getTextureMap(){
    return this.textureMap;
  }

  getTextureList(){
    return Object.keys(this.textureMap);
  }

  getPlayerPos(){
    const { pos: playerPos, dir: playerDir, plane: playerPlane } = this.player;
    return {
      playerPos,
      playerDir,
      playerPlane,
    }
  }
}

export default Game;