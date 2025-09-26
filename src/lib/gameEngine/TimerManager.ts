interface TimerCallback {
  id: number;
  callback: () => void;
  delay: number;
  elapsed: number;
  isInterval: boolean;
  active: boolean;
}

export class TimerManager {
  private timers: Map<number, TimerCallback> = new Map();
  private nextId = 1;

  public setTimeout(callback: () => void, delay: number): number {
    const id = this.nextId++;
    const timer: TimerCallback = {
      id,
      callback,
      delay,
      elapsed: 0,
      isInterval: false,
      active: true,
    };
    
    this.timers.set(id, timer);
    return id;
  }

  public setInterval(callback: () => void, interval: number): number {
    const id = this.nextId++;
    const timer: TimerCallback = {
      id,
      callback,
      delay: interval,
      elapsed: 0,
      isInterval: true,
      active: true,
    };
    
    this.timers.set(id, timer);
    return id;
  }

  public clearTimeout(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      timer.active = false;
      this.timers.delete(id);
    }
  }

  public clearInterval(id: number): void {
    this.clearTimeout(id); // Same implementation
  }

  public async wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.setTimeout(resolve, ms);
    });
  }

  public update(delta: number): void {
    const deltaMs = delta * 1000; // Convert to milliseconds
    const completedTimers: number[] = [];

    this.timers.forEach((timer, id) => {
      if (!timer.active) return;

      timer.elapsed += deltaMs;

      if (timer.elapsed >= timer.delay) {
        try {
          timer.callback();
        } catch (error) {
          console.warn(`Timer callback error (ID: ${id}):`, error);
        }

        if (timer.isInterval) {
          // Reset for next interval
          timer.elapsed = timer.elapsed - timer.delay;
        } else {
          // Mark for removal (setTimeout)
          completedTimers.push(id);
        }
      }
    });

    // Remove completed timeouts
    completedTimers.forEach(id => this.timers.delete(id));
  }

  public dispose(): void {
    this.timers.clear();
  }

  public getActiveTimerCount(): number {
    return this.timers.size;
  }
}