class Game {
  constructor(framerate){
    this.interval = framerate;
    this.animationFrame = null;
    // Use one canvas but have display modes (or a map overlay when tabv is pressed).
    this.screen = new Screen(this, 'display-main');
    this.screen.resizeCanvas(1000,550);
    this.player = new Player();
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
      this.player.rotate(-1);
    }
    if(this.keyState.d){
      this.player.rotate(1);
    }
    if(this.keyState.w){
      this.player.move(getMovementDelta({ angle: this.player.dir }))
    }
    if(this.keyState.s){
      this.player.move(getMovementDelta({ angle: this.player.dir, forward: false }))
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