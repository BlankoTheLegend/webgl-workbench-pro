export class InputManager {
  private keys: Set<string> = new Set();
  private keysPressed: Set<string> = new Set();
  private keysReleased: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private gamepads: Gamepad[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        this.keysPressed.add(e.code);
      }
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.keysReleased.add(e.code);
    });

    // Mouse events
    window.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
    });

    window.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  public update() {
    // Clear frame-specific input states
    this.keysPressed.clear();
    this.keysReleased.clear();

    // Update gamepads
    this.updateGamepads();
  }

  private updateGamepads() {
    const gamepads = navigator.getGamepads();
    this.gamepads = Array.from(gamepads).filter(gamepad => gamepad !== null) as Gamepad[];
  }

  // Keyboard input
  public isKeyDown(key: string): boolean {
    return this.keys.has(this.normalizeKey(key));
  }

  public wasKeyPressed(key: string): boolean {
    return this.keysPressed.has(this.normalizeKey(key));
  }

  public wasKeyReleased(key: string): boolean {
    return this.keysReleased.has(this.normalizeKey(key));
  }

  private normalizeKey(key: string): string {
    // Convert common key names to KeyboardEvent.code format
    const keyMap: { [key: string]: string } = {
      'ArrowLeft': 'ArrowLeft',
      'ArrowRight': 'ArrowRight',
      'ArrowUp': 'ArrowUp',
      'ArrowDown': 'ArrowDown',
      'Space': 'Space',
      'Enter': 'Enter',
      'Escape': 'Escape',
      'Shift': 'ShiftLeft',
      'Control': 'ControlLeft',
      'Alt': 'AltLeft',
      'Tab': 'Tab',
      'Backspace': 'Backspace',
    };

    // Handle letter keys
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      return `Key${key.toUpperCase()}`;
    }

    // Handle number keys
    if (key.length === 1 && /[0-9]/.test(key)) {
      return `Digit${key}`;
    }

    return keyMap[key] || key;
  }

  // Mouse input
  public isMouseDown(button: string | number): boolean {
    const buttonNum = typeof button === 'string' ? this.getMouseButtonNumber(button) : button;
    return this.mouseButtons.has(buttonNum);
  }

  private getMouseButtonNumber(button: string): number {
    const buttonMap: { [key: string]: number } = {
      'left': 0,
      'middle': 1,
      'right': 2,
    };
    return buttonMap[button.toLowerCase()] ?? 0;
  }

  public getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  // Gamepad input
  public getGamepadAxis(gamepadIndex: number, axis: string | number): number {
    if (gamepadIndex >= this.gamepads.length) return 0;
    
    const gamepad = this.gamepads[gamepadIndex];
    if (!gamepad) return 0;

    const axisIndex = typeof axis === 'string' ? this.getAxisIndex(axis) : axis;
    return gamepad.axes[axisIndex] || 0;
  }

  private getAxisIndex(axis: string): number {
    const axisMap: { [key: string]: number } = {
      'x': 0,
      'y': 1,
      'rx': 2,
      'ry': 3,
    };
    return axisMap[axis.toLowerCase()] ?? 0;
  }

  public getGamepadButton(gamepadIndex: number, button: string | number): boolean {
    if (gamepadIndex >= this.gamepads.length) return false;
    
    const gamepad = this.gamepads[gamepadIndex];
    if (!gamepad) return false;

    const buttonIndex = typeof button === 'string' ? this.getButtonIndex(button) : button;
    return gamepad.buttons[buttonIndex]?.pressed || false;
  }

  private getButtonIndex(button: string): number {
    const buttonMap: { [key: string]: number } = {
      'a': 0,
      'b': 1,
      'x': 2,
      'y': 3,
      'lb': 4,
      'rb': 5,
      'lt': 6,
      'rt': 7,
      'select': 8,
      'start': 9,
      'ls': 10,
      'rs': 11,
      'up': 12,
      'down': 13,
      'left': 14,
      'right': 15,
    };
    return buttonMap[button.toLowerCase()] ?? 0;
  }

  public dispose() {
    // Remove event listeners if needed
  }
}