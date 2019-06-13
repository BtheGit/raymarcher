/**
 * This will hopefully get a lot more refined as time goes on.
 * 
 * For now, the idea is for this class to have its own buffer. Events can be triggered that
 * will be written here and blitted to the screen at the end of a frame's render.
 * 
 * Temporary:
 *  - We're going to hard code a timer to self-expire the messages. 
 *  - New messages will blow away old ones and start a new timer.
 *  - Hard code the width of the text display.
 * 
 * Enhancements:
 *  - Create a quick fade out animation.
 *  - Create a flag that saves render cycles by only rendering when the text display is visible.
 */
class TextDisplay {
  constructor(width, height){
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.isVisible = false;
    this.timeout = null;
  }

  draw(screen){
    if(this.isVisible){
      const top = (screen.height / 2) - (this.height / 2);
      const left = (screen.width / 2) - (this.width / 2);
      screen.ctx.drawImage(this.canvas, 0, 0, this.width, this.height, left, top, this.width, this.height);
    }
  }

  clear(){
    this.isVisible = false;
  }
  
  write(text, time = 4000){
    // In case one write call happens before another expires.
    clearTimeout(this.timeout);
    this.isVisible = true;
    this._write(text);
    this.timeout = setTimeout(this.clear.bind(this), time);
  }
  
  _write(text = ''){
    this.ctx.clearRect(0,0,this.width, this.height);
    // We want to allow line breaks.
    const lines = text.split('\n');
    // We'll need to figure out how to calculate the right offset for positioning and line spacing.
    // For now we'll assume the 20px font size.
    const lineCount = lines.length;
    // Font properties should be on the class properties and be settable.
    const textSize = 30;

    const textBlockTop = (this.height / 2) - (Math.ceil(lineCount / 2) * textSize)
    for(let i = 0; i < lines.length; i++){
      const lineTop = textBlockTop + (textSize * i);
      const lineText = lines[i];
      this.ctx.fillStyle = 'white';
      this.ctx.font = `${textSize}px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillText(lineText, this.width / 2, lineTop);
    }
  }
}

export default TextDisplay;