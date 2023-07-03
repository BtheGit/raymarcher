export class SingletonInputSystem {
  private static instance: SingletonInputSystem;
  private keysPressed: { [key: string]: boolean } = {};
  private mousePressed: boolean = false;

  private constructor() {
    // Add event listeners for key and mouse events
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    document.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  public static getInstance(): SingletonInputSystem {
    if (!SingletonInputSystem.instance) {
      SingletonInputSystem.instance = new SingletonInputSystem();
    }
    return SingletonInputSystem.instance;
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.keysPressed[event.key] = true;
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.keysPressed[event.key] = false;
  }

  private handleMouseDown(event: MouseEvent) {
    this.mousePressed = true;
  }

  private handleMouseUp(event: MouseEvent) {
    this.mousePressed = false;
  }

  // TODO: Support combinations and alternates
  public isKeyPressed(key: string): boolean {
    return this.keysPressed[key] || false;
  }

  public isMousePressed(): boolean {
    return this.mousePressed;
  }
}

export default SingletonInputSystem;
