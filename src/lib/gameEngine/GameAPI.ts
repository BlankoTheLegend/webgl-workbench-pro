import * as THREE from 'three';
import { InputManager } from './InputManager';
import { GUIManager } from './GUIManager';
import { AnimationManager } from './AnimationManager';
import { MessageManager } from './MessageManager';
import { TimerManager } from './TimerManager';

export interface GameEngineAPI {
  // Core engine
  engine: {
    playSound: (url: string, volume?: number) => void;
    setGravity: (x: number, y: number, z: number) => void;
    spawn: (type: string, options?: any) => void;
    setTimeout: (callback: () => void, delay: number) => number;
    setInterval: (callback: () => void, interval: number) => number;
    clearTimeout: (id: number) => void;
    clearInterval: (id: number) => void;
    wait: (ms: number) => Promise<void>;
  };

  // Scene management
  scene: {
    getObjectByName: (name: string) => any;
    findObjectsByTag: (tag: string) => any[];
    sendMessage: (targetId: string, message: string, data?: any) => void;
    sendMessageToTag: (tag: string, message: string, data?: any) => void;
    restart: () => void;
    onStart?: () => void;
    onUpdate?: (delta: number, time: number) => void;
  };

  // Input system
  input: InputManager;

  // GUI system
  gui: GUIManager;

  // Current object context (injected per script)
  object?: any;
  mesh?: THREE.Mesh;
  time?: number;
  delta?: number;
}

export class GameEngine {
  private inputManager: InputManager;
  private guiManager: GUIManager;
  private animationManager: AnimationManager;
  private messageManager: MessageManager;
  private timerManager: TimerManager;
  private audioContext: AudioContext | null = null;
  private objects: any[] = [];
  private sceneCallbacks: any = {};

  constructor() {
    this.inputManager = new InputManager();
    this.guiManager = new GUIManager();
    this.animationManager = new AnimationManager();
    this.messageManager = new MessageManager();
    this.timerManager = new TimerManager();
    
    // Initialize audio context on first user interaction
    document.addEventListener('click', this.initAudio.bind(this), { once: true });
  }

  private initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  public setObjects(objects: any[]) {
    this.objects = objects;
  }

  public createAPI(object?: any, mesh?: THREE.Mesh, time?: number, delta?: number): GameEngineAPI {
    return {
      engine: {
        playSound: this.playSound.bind(this),
        setGravity: this.setGravity.bind(this),
        spawn: this.spawn.bind(this),
        setTimeout: this.timerManager.setTimeout.bind(this.timerManager),
        setInterval: this.timerManager.setInterval.bind(this.timerManager),
        clearTimeout: this.timerManager.clearTimeout.bind(this.timerManager),
        clearInterval: this.timerManager.clearInterval.bind(this.timerManager),
        wait: this.timerManager.wait.bind(this.timerManager),
      },
      scene: {
        getObjectByName: this.getObjectByName.bind(this),
        findObjectsByTag: this.findObjectsByTag.bind(this),
        sendMessage: this.messageManager.sendMessage.bind(this.messageManager),
        sendMessageToTag: this.messageManager.sendMessageToTag.bind(this.messageManager),
        restart: this.restart.bind(this),
        onStart: this.sceneCallbacks.onStart,
        onUpdate: this.sceneCallbacks.onUpdate,
      },
      input: this.inputManager,
      gui: this.guiManager,
      object,
      mesh,
      time,
      delta,
    };
  }

  private async playSound(url: string, volume: number = 1.0) {
    if (!this.audioContext) {
      console.warn('Audio context not initialized');
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  private setGravity(x: number, y: number, z: number) {
    // This would integrate with physics engine
    console.log('Setting gravity:', { x, y, z });
  }

  private spawn(type: string, options: any = {}) {
    // This would integrate with the object creation system
    console.log('Spawning object:', type, options);
  }

  private getObjectByName(name: string) {
    return this.objects.find(obj => obj.name === name);
  }

  private findObjectsByTag(tag: string) {
    return this.objects.filter(obj => obj.tags && obj.tags.includes(tag));
  }

  private restart() {
    // This would restart the scene
    console.log('Restarting scene');
  }

  public update(delta: number, time: number) {
    this.inputManager.update();
    this.animationManager.update(delta);
    this.timerManager.update(delta);
    
    // Call global scene update
    if (this.sceneCallbacks.onUpdate) {
      try {
        this.sceneCallbacks.onUpdate(delta, time);
      } catch (error) {
        console.warn('Scene update error:', error);
      }
    }
  }

  public setSceneCallbacks(callbacks: any) {
    this.sceneCallbacks = callbacks;
  }

  public dispose() {
    this.inputManager.dispose();
    this.timerManager.dispose();
  }
}