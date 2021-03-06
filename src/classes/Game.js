
import Map from './Map';
import Screen from './Screen';
import TextDisplay from './TextDisplay';
import Player from './Player';
import Vector from './Vector';
import TouchScreen from './TouchScreen';
import {
  loadStateFromSessionStorage,
  saveStatetoSessionStorage,
  createEventHandler,
} from '../utilities';

class Game {
  constructor(settings, map, images, sprites, textureMap){
    this.eventHandler = createEventHandler();
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
      new Vector(this.currentMap.player.pos.x, this.currentMap.player.pos.y), 
      new Vector(this.currentMap.player.dir.x, this.currentMap.player.dir.y),
      new Vector(this.currentMap.player.plane.x, this.currentMap.player.plane.y)
    );

    if(!this.editorMode && savedState) {
      this.player = new Player(
        this,
        new Vector(savedState.player.pos.x, savedState.player.pos.y), 
        new Vector(savedState.player.dir.x, savedState.player.dir.y),
        new Vector(savedState.player.plane.x, savedState.player.plane.y)
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
      player: {
        pos: {
          x: this.player.pos.x,
          y: this.player.pos.y
        },
        dir: {
          x: this.player.dir.x,
          y: this.player.dir.y
        },
        plane: {
          x: this.player.plane.x,
          y: this.player.plane.y
        },
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

  updateSprites(newSpriteConfigs){
    // We need to update the old sprite instances with the new config properties.
    // However, this is a N^2 operation at best. 
    // TODO: Start using IDs for sprites so we can do this with cross lookups instead of
    // nested array loops. 
    // For now we are going to act under the very dangerous assumption that names are unique. We will have
    // to enforce that later. Or just generate a unique ID dynamically.
    this.sprites.map(oldSprite => {
      newSpriteConfigs.forEach(newSpriteConfig => {
        if(oldSprite.name === newSpriteConfig.name){
          oldSprite.update(newSpriteConfig);
        }
      })
    })
  }

  getTextureMap(){
    return this.textureMap;
  }

  getTextureList(){
    return Object.keys(this.textureMap);
  }

  getPlayerPos(){
    const { pos, dir, plane } = this.player;
    return {
      pos,
      dir,
      plane,
    }
  }

  subscribe(listener){
    return this.eventHandler.subscribe(listener);
  }
}

export default Game;