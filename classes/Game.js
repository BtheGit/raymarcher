

class Game {
  constructor(images, framerate){
    this.images = images;
    this.interval = framerate;
    this.animationFrame = null;
    // Use one canvas but have display modes (or a map overlay when tabv is pressed).
    this.screen = new Screen(this, 'display-main');
    this.screen.resizeCanvas(SCREEN_WIDTH,SCREEN_HEIGHT);
    this.map = new Map(MAP2);
    this.player = new Player(this.map);
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
    if(this.keyState.q){
      this.player.ascend();
    }
    if(this.keyState.e){
      this.player.descend();
    }
  }

  stop() {
    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null;
  }

  drawScreen(){
    this.screen.draw();
  }

}