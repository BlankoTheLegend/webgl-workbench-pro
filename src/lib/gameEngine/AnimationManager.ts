import * as THREE from 'three';

export interface AnimationOptions {
  property: string;
  to: number | THREE.Vector3 | THREE.Euler;
  duration: number;
  easing?: string;
  onComplete?: () => void;
  onUpdate?: (value: any) => void;
}

export interface AnimationSequenceItem extends AnimationOptions {
  delay?: number;
}

export class AnimationManager {
  private animations: Map<string, Animation> = new Map();
  private nextId = 0;

  public animate(target: any, options: AnimationOptions): string {
    const id = `anim-${++this.nextId}`;
    const animation = new Animation(target, options);
    this.animations.set(id, animation);
    return id;
  }

  public animateSequence(target: any, sequence: AnimationSequenceItem[]): string[] {
    const ids: string[] = [];
    let totalDelay = 0;

    sequence.forEach((item, index) => {
      const delay = item.delay || 0;
      totalDelay += delay;

      const id = `seq-${++this.nextId}-${index}`;
      const animation = new Animation(target, {
        ...item,
        startDelay: totalDelay,
      });
      
      this.animations.set(id, animation);
      ids.push(id);

      totalDelay += item.duration;
    });

    return ids;
  }

  public stopAnimation(id: string) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.stop();
      this.animations.delete(id);
    }
  }

  public stopAllAnimations() {
    this.animations.forEach(animation => animation.stop());
    this.animations.clear();
  }

  public update(delta: number) {
    const completedAnimations: string[] = [];

    this.animations.forEach((animation, id) => {
      animation.update(delta);
      if (animation.isComplete()) {
        completedAnimations.push(id);
      }
    });

    // Clean up completed animations
    completedAnimations.forEach(id => this.animations.delete(id));
  }
}

class Animation {
  private target: any;
  private options: AnimationOptions & { startDelay?: number };
  private startTime: number = 0;
  private isStarted: boolean = false;
  private isStopped: boolean = false;
  private initialValue: any;
  private targetValue: any;

  constructor(target: any, options: AnimationOptions & { startDelay?: number }) {
    this.target = target;
    this.options = options;
    this.parsePropertyPath();
  }

  private parsePropertyPath() {
    const path = this.options.property.split('.');
    let current = this.target;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const finalProperty = path[path.length - 1];
    this.initialValue = current[finalProperty];
    this.targetValue = this.options.to;
  }

  public update(delta: number) {
    if (this.isStopped) return;

    if (!this.isStarted) {
      if (this.options.startDelay && this.startTime < this.options.startDelay) {
        this.startTime += delta * 1000; // Convert to milliseconds
        return;
      }
      this.isStarted = true;
      this.startTime = 0;
    }

    this.startTime += delta * 1000; // Convert to milliseconds
    const progress = Math.min(this.startTime / this.options.duration, 1);
    const easedProgress = this.applyEasing(progress);

    this.updateProperty(easedProgress);

    if (this.options.onUpdate) {
      this.options.onUpdate(this.getCurrentValue());
    }

    if (progress >= 1) {
      if (this.options.onComplete) {
        this.options.onComplete();
      }
    }
  }

  private updateProperty(progress: number) {
    const path = this.options.property.split('.');
    let current = this.target;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const finalProperty = path[path.length - 1];
    const value = this.interpolate(this.initialValue, this.targetValue, progress);
    current[finalProperty] = value;
  }

  private interpolate(start: any, end: any, progress: number): any {
    if (typeof start === 'number' && typeof end === 'number') {
      return start + (end - start) * progress;
    }

    if (start instanceof THREE.Vector3 && end instanceof THREE.Vector3) {
      return new THREE.Vector3().lerpVectors(start, end, progress);
    }

    if (start instanceof THREE.Euler && end instanceof THREE.Euler) {
      const startQuat = new THREE.Quaternion().setFromEuler(start);
      const endQuat = new THREE.Quaternion().setFromEuler(end);
      const resultQuat = new THREE.Quaternion().slerpQuaternions(startQuat, endQuat, progress);
      return new THREE.Euler().setFromQuaternion(resultQuat);
    }

    return progress < 0.5 ? start : end;
  }

  private applyEasing(progress: number): number {
    switch (this.options.easing) {
      case 'easeInQuad':
        return progress * progress;
      case 'easeOutQuad':
        return progress * (2 - progress);
      case 'easeInOutQuad':
        return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      case 'easeInCubic':
        return progress * progress * progress;
      case 'easeOutCubic':
        return (--progress) * progress * progress + 1;
      case 'easeInOutCubic':
        return progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
      default:
        return progress; // Linear
    }
  }

  private getCurrentValue(): any {
    const path = this.options.property.split('.');
    let current = this.target;
    
    for (const prop of path) {
      current = current[prop];
    }

    return current;
  }

  public isComplete(): boolean {
    return this.isStarted && this.startTime >= this.options.duration;
  }

  public stop() {
    this.isStopped = true;
  }
}