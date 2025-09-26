export interface GUIElement {
  id: string;
  type: 'button' | 'slider' | 'toggle' | 'text' | 'input';
  label: string;
  value?: any;
  callback?: (value?: any) => void;
  min?: number;
  max?: number;
  step?: number;
}

export class GUIManager {
  private elements: Map<string, GUIElement> = new Map();
  private containers: Map<string, string[]> = new Map();
  private nextId = 0;

  constructor() {
    // Initialize default container
    this.containers.set('default', []);
  }

  private generateId(): string {
    return `gui-${++this.nextId}`;
  }

  public addButton(label: string, callback: () => void, container: string = 'default'): string {
    const id = this.generateId();
    const element: GUIElement = {
      id,
      type: 'button',
      label,
      callback,
    };

    this.elements.set(id, element);
    this.addToContainer(container, id);
    this.notifyUpdate();
    
    return id;
  }

  public addSlider(
    label: string,
    min: number,
    max: number,
    value: number,
    callback: (value: number) => void,
    step: number = 0.1,
    container: string = 'default'
  ): string {
    const id = this.generateId();
    const element: GUIElement = {
      id,
      type: 'slider',
      label,
      value,
      min,
      max,
      step,
      callback,
    };

    this.elements.set(id, element);
    this.addToContainer(container, id);
    this.notifyUpdate();
    
    return id;
  }

  public addToggle(
    label: string,
    value: boolean,
    callback: (value: boolean) => void,
    container: string = 'default'
  ): string {
    const id = this.generateId();
    const element: GUIElement = {
      id,
      type: 'toggle',
      label,
      value,
      callback,
    };

    this.elements.set(id, element);
    this.addToContainer(container, id);
    this.notifyUpdate();
    
    return id;
  }

  public addText(text: string, container: string = 'default'): string {
    const id = this.generateId();
    const element: GUIElement = {
      id,
      type: 'text',
      label: text,
    };

    this.elements.set(id, element);
    this.addToContainer(container, id);
    this.notifyUpdate();
    
    return id;
  }

  public addInput(
    label: string,
    value: string,
    callback: (value: string) => void,
    container: string = 'default'
  ): string {
    const id = this.generateId();
    const element: GUIElement = {
      id,
      type: 'input',
      label,
      value,
      callback,
    };

    this.elements.set(id, element);
    this.addToContainer(container, id);
    this.notifyUpdate();
    
    return id;
  }

  private addToContainer(container: string, elementId: string) {
    if (!this.containers.has(container)) {
      this.containers.set(container, []);
    }
    this.containers.get(container)!.push(elementId);
  }

  public removeElement(id: string) {
    this.elements.delete(id);
    
    // Remove from all containers
    for (const [, elements] of this.containers) {
      const index = elements.indexOf(id);
      if (index > -1) {
        elements.splice(index, 1);
      }
    }
    
    this.notifyUpdate();
  }

  public clearContainer(container: string = 'default') {
    const elements = this.containers.get(container) || [];
    elements.forEach(id => this.elements.delete(id));
    this.containers.set(container, []);
    this.notifyUpdate();
  }

  public clearAll() {
    this.elements.clear();
    this.containers.forEach(elements => elements.length = 0);
    this.notifyUpdate();
  }

  public getElements(container: string = 'default'): GUIElement[] {
    const elementIds = this.containers.get(container) || [];
    return elementIds.map(id => this.elements.get(id)!).filter(Boolean);
  }

  public getAllContainers(): string[] {
    return Array.from(this.containers.keys());
  }

  public updateElement(id: string, updates: Partial<GUIElement>) {
    const element = this.elements.get(id);
    if (element) {
      Object.assign(element, updates);
      this.notifyUpdate();
    }
  }

  public triggerElement(id: string, value?: any) {
    const element = this.elements.get(id);
    if (element && element.callback) {
      try {
        element.callback(value !== undefined ? value : element.value);
      } catch (error) {
        console.warn('GUI element callback error:', error);
      }
    }
  }

  private notifyUpdate() {
    // Emit custom event for UI updates
    window.dispatchEvent(new CustomEvent('gui-update', {
      detail: {
        containers: this.containers,
        elements: this.elements,
      }
    }));
  }
}