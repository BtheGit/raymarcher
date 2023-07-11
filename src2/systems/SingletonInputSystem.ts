export class SingletonInputSystem {
  private static instance: SingletonInputSystem;
  private keysPressed: { [key: string]: boolean } = {};
  private mousePressed: MouseEvent | null = null;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private mouseDeltaX: number = 0;
  private mouseDeltaY: number = 0;
  private canvasFocused: boolean = false;
  private canvas: HTMLCanvasElement;
  private pointerLockEnabled: boolean = false;

  private constructor(canvasId: string) {
    // Add event listeners for key and mouse events
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    document.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));

    // Add event listeners for canvas focus
    const canvas = document.getElementById(canvasId)!;
    this.canvas = canvas as HTMLCanvasElement;
    canvas?.addEventListener("click", () => {
      if (this.pointerLockEnabled) return;

      this.canvas.requestPointerLock();
    });

    document.addEventListener(
      "pointerlockchange",
      this.handlePointerLockChange.bind(this)
    );
  }

  public static getInstance(canvasId: string): SingletonInputSystem {
    if (!SingletonInputSystem.instance) {
      SingletonInputSystem.instance = new SingletonInputSystem(canvasId);
    }
    return SingletonInputSystem.instance;
  }

  private handlePointerLockChange = () => {
    try {
      if (document.pointerLockElement === this.canvas) {
        this.handleCanvasFocus();
        this.pointerLockEnabled = true;
      } else {
        this.handleCanvasBlur();
        this.pointerLockEnabled = false;
      }
    } catch (err) {
      // TODO: This could be an infinite loop
      setTimeout(this.handlePointerLockChange, 2000);
    }
  };

  private handleCanvasFocus() {
    this.canvasFocused = true;
    this.canvas.style.cursor = "none";
  }

  private handleCanvasBlur() {
    this.canvasFocused = false;
    this.canvas.style.cursor = "auto";
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.pointerLockEnabled) return;
    this.keysPressed[event.key] = true;
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (!this.pointerLockEnabled) return;
    this.keysPressed[event.key] = false;
  }

  private handleMouseDown(event: MouseEvent) {
    if (!this.pointerLockEnabled) return;
    this.mousePressed = event;
  }

  private handleMouseUp(event: MouseEvent) {
    if (!this.pointerLockEnabled) return;
    this.mousePressed = null;
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.pointerLockEnabled) return;

    const movementX = event.movementX ?? 0;
    const movementY = event.movementY ?? 0;

    this.mouseDeltaX += movementX;
    this.mouseDeltaY += movementY;
  }

  // TODO: Support combinations and alternates
  public isKeyPressed(key: string): boolean {
    if (!this.pointerLockEnabled) return false;
    return this.keysPressed[key] || false;
  }

  public activeMousedownEvent() {
    if (!this.pointerLockEnabled) return null;
    return this.mousePressed;
  }

  public getMouseDelta(): { movementX: number; movementY: number } {
    if (!this.pointerLockEnabled) return { movementX: 0, movementY: 0 };

    const deltaX = this.mouseDeltaX;
    const deltaY = this.mouseDeltaY;

    // Reset the mouse delta values
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;

    return { movementX: deltaX, movementY: deltaY };
  }
}

export default SingletonInputSystem;
