const PI2 = Math.PI * 2;

class TouchScreen {
  constructor(width, height){
    // For visibility (TODO: For listeners as well (will need to self-destruct on resize))
    this.isVisible = false;
    // This needs to manually be in sync with the CSS for now. Not great.
    this.mediaQuery = window.matchMedia('screen and (max-width: 768px)');
    // TODO: resample on resize. For now this only runs once.
    // There is a problem with the first instantiation. But enough will change in pass 2, it's ok for now.
    this.mediaQuery.addListener(e => {
      this.isVisible = true;
    });
    // We'll need to either listen for resize events or have them passed in to rebuild the
    // canvas buffer on changes.
    this.width = width;
    this.height = height;
    this.color = "rgba(255,255,255,0.5)";
    this.buttonBaseRadius = 25;
    // Create a canvas buffer for main controls (this is static and should be cached
    // Possible future changes could see visual feedback for touches.
    this.canvasBuffer = document.createElement('canvas');
    this.canvasBuffer.width = this.width;
    this.canvasBuffer.height = this.height;
    this.ctxBuffer = this.canvasBuffer.getContext('2d');
    // We're going to want to store the controls and their dimensions in an array, so that we can 
    // share them between the rendering and touch detection logic.
    // They are all circles for now, so the type is irrelevant. 
    this.elements = [
      {
        keyName: ' ',
        type: 'arc',
        x: this.width - 75,
        y: this.height - 125,
        radius: this.buttonBaseRadius * 1.25,
        color: this.color,
        thickness: 3,
      },
      {
        keyName: 'a',
        type: 'arc',
        x: 50,
        y: this.height - 125,
        radius: this.buttonBaseRadius,
        color: this.color,
        thickness: 3,
      },
      {
        keyName: 'w',
        type: 'arc',
        x: 100,
        y: this.height - 175,
        radius: this.buttonBaseRadius,
        color: this.color,
        thickness: 3,
      },
      {
        keyName: 'd',
        type: 'arc',
        x: 150,
        y: this.height - 125,
        radius: this.buttonBaseRadius,
        color: this.color,
        thickness: 3,
      },
      {
        keyName: 's',
        type: 'arc',
        x: 100,
        y: this.height - 75,
        radius: this.buttonBaseRadius,
        color: this.color,
        thickness: 3,
      },
    ];
    this.renderBaseControls();

    // TODO: We may want a flag to draw or not based on a media query here rather than above.
  }

  renderArc(arc){
    this.ctxBuffer.strokeStyle = arc.color;
    this.ctxBuffer.lineWidth = arc.thickness;
    this.ctxBuffer.beginPath();
    this.ctxBuffer.arc(arc.x, arc.y, arc.radius, 0, PI2);
    this.ctxBuffer.stroke();
    this.ctxBuffer.closePath();
    this.ctxBuffer.lineWidth = 1;
  }

  renderBaseControls(){
    // We'll need to dynamically size the controls. But with a minimum (and maximum) size and spacing.
    // For now, let's hardcode it for a phone size.
    for(let i = 0; i < this.elements.length; i++){
      const element = this.elements[i];
      switch(element.type){
        case 'arc':
          this.renderArc(element);
          break;
        default:
          break;
      }
    }
  }

  checkForCircleCollision(target, el, x, y) {
    // The canvas is likely to be skewed at this point, so we need to get the real location on the element
    const targetHeightRatio = target.clientHeight / target.height;
    const targetWidthRatio = target.clientWidth / target.width;
    const targetX = el.x * targetWidthRatio;
    const targetY = el.y * targetHeightRatio;
    // There is a problem where the skews are not the same so just using the radius is inaccurate (we should
    // also be getting the relative location) but we'll allow that for an MVP.
    const targetRadius = el.radius * targetWidthRatio;
    
    const dx = x - targetX;
    const dy = y - targetY;
    const isInCircle = (dx * dx + dy * dy) < (targetRadius * targetRadius);
    return isInCircle;
  }

  handleTouchStart(e, keyState){
    // Start fresh with all keys off.
    Object.keys(keyState).map(key => {
      keyState[key] = false;
    })
    const touches = e.changedTouches;
    for(let i = 0; i < touches.length; i++){
      const touch = touches[i];
      const target = touch.target; // The canvas ideally. We'll need it's offsets, just in case (though it should be zero for all cases)

      const touchX = touch.clientX - target.offsetLeft;
      const touchY = touch.clientY - target.offsetTop;
      
      // Now we need to see if the touch was in an existing element.
      for(let j = 0; j < this.elements.length; j++){
        const element = this.elements[j];
        // We'll have to have different calculations for each element (it would make sense to define them as classes that could
        // contain their own 'collision' detection, but we'll do it with a switch for now).
        switch(element.type){
          case 'arc':
            const isInCircle = this.checkForCircleCollision(target, element, touchX, touchY);
            if(isInCircle){
              const keyName = element.keyName;
              keyState[keyName] = true;
            }
            break;
          default:
            break;
        }
      }
    }
    return keyState;
  }
  
  handleTouchEnd(e, keyState){
    // TODO: Allow for multi-touch.
    // The current implementation only allows one button to be pressed at a time.
    Object.keys(keyState).map(key => {
      keyState[key] = false;
    })
    if(e.changedTouches){

    }
    return keyState;
  }

  // TODO: Multi-touch support.
  handleTouchMove(e, keyState){
    // We need to figure out where the finger was and where it went. If it was in a button and
    // now is not, we need to 'turn off' that button;
    return keyState;
  }

  draw(screen){
    if(this.isVisible){
      screen.ctx.drawImage(this.canvasBuffer, 0, 0, this.width, this.height);
    }
  }
}

export default TouchScreen;