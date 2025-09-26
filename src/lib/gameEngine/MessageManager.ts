export interface MessageHandler {
  (message: string, data?: any): void;
}

export class MessageManager {
  private handlers: Map<string, Map<string, MessageHandler[]>> = new Map();
  private globalHandlers: Map<string, MessageHandler[]> = new Map();
  private objectTagMap: Map<string, string[]> = new Map();

  public registerObject(objectId: string, tags: string[] = []) {
    this.objectTagMap.set(objectId, tags);
    if (!this.handlers.has(objectId)) {
      this.handlers.set(objectId, new Map());
    }
  }

  public unregisterObject(objectId: string) {
    this.handlers.delete(objectId);
    this.objectTagMap.delete(objectId);
  }

  public addMessageHandler(objectId: string, messageType: string, handler: MessageHandler) {
    if (!this.handlers.has(objectId)) {
      this.handlers.set(objectId, new Map());
    }
    
    const objectHandlers = this.handlers.get(objectId)!;
    if (!objectHandlers.has(messageType)) {
      objectHandlers.set(messageType, []);
    }
    
    objectHandlers.get(messageType)!.push(handler);
  }

  public addGlobalMessageHandler(messageType: string, handler: MessageHandler) {
    if (!this.globalHandlers.has(messageType)) {
      this.globalHandlers.set(messageType, []);
    }
    
    this.globalHandlers.get(messageType)!.push(handler);
  }

  public sendMessage(targetId: string, messageType: string, data?: any) {
    // Send to specific object
    const objectHandlers = this.handlers.get(targetId);
    if (objectHandlers) {
      const messageHandlers = objectHandlers.get(messageType);
      if (messageHandlers) {
        messageHandlers.forEach(handler => {
          try {
            handler(messageType, data);
          } catch (error) {
            console.warn(`Message handler error for ${targetId}:${messageType}:`, error);
          }
        });
      }
    }

    // Also send to global handlers
    this.sendGlobalMessage(messageType, data, targetId);
  }

  public sendMessageToTag(tag: string, messageType: string, data?: any) {
    // Find all objects with the specified tag
    const targetObjects: string[] = [];
    
    this.objectTagMap.forEach((tags, objectId) => {
      if (tags.includes(tag)) {
        targetObjects.push(objectId);
      }
    });

    // Send message to all matching objects
    targetObjects.forEach(objectId => {
      this.sendMessage(objectId, messageType, data);
    });
  }

  public broadcast(messageType: string, data?: any) {
    // Send to all registered objects
    this.handlers.forEach((_, objectId) => {
      this.sendMessage(objectId, messageType, data);
    });

    // Send to global handlers
    this.sendGlobalMessage(messageType, data);
  }

  private sendGlobalMessage(messageType: string, data?: any, sourceId?: string) {
    const globalHandlers = this.globalHandlers.get(messageType);
    if (globalHandlers) {
      globalHandlers.forEach(handler => {
        try {
          handler(messageType, { ...data, sourceId });
        } catch (error) {
          console.warn(`Global message handler error for ${messageType}:`, error);
        }
      });
    }
  }

  public removeMessageHandler(objectId: string, messageType: string, handler: MessageHandler) {
    const objectHandlers = this.handlers.get(objectId);
    if (objectHandlers) {
      const messageHandlers = objectHandlers.get(messageType);
      if (messageHandlers) {
        const index = messageHandlers.indexOf(handler);
        if (index > -1) {
          messageHandlers.splice(index, 1);
        }
      }
    }
  }

  public removeAllHandlers(objectId: string) {
    this.handlers.delete(objectId);
  }

  public clear() {
    this.handlers.clear();
    this.globalHandlers.clear();
    this.objectTagMap.clear();
  }
}