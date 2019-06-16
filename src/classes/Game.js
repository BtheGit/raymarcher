
import Map from './Map';
import Screen from './Screen';
import TextDisplay from './TextDisplay';
import Player from './Player';
import Vector from './Vector';
import {
  loadStateFromSessionStorage,
  saveStatetoSessionStorage,
} from '../utilities';

class Game {
  constructor(settings, maps, images, sprites, textureMap){
    this.storageId = settings.storageId;
    this.editorMode = settings.editorMode;
    // We want to preserve the player's location when they are returning from an interaction
    // that caused them to navigate away to a link.
    const savedState = loadStateFromSessionStorage(this.storageId);
    this.images = images;
    this.interval = settings.framerate;
    this.animationFrame = null;

    this.textureMap = textureMap;
    this.sprites = sprites;
    this.maps = maps;
    // Gonna hardcode the first level for now. TODO: REMOVE
    this.currentMap = savedState ? savedState.currentMap : this.maps[0];
    this.grid = new Map(this.currentMap.grid);

    this.screen = new Screen(this, settings.displayId, settings.width, settings.height);

    this.textDisplay = new TextDisplay(Math.floor(settings.width * .75), Math.floor(settings.height * .75))
    const introText = this.currentMap.introText;
    if(introText){
      this.textDisplay.write(introText.text, introText.displayLength);
    }

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
        this.textDisplay.draw(this.screen);
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

}

export default Game;