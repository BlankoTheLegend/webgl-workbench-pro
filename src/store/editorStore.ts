import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface SceneObject {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'plane';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  material: {
    color: { r: number; g: number; b: number };
    opacity: number;
  };
  script?: string;
}

interface EditorState {
  // Scene objects
  objects: SceneObject[];
  selectedObject: SceneObject | null;
  
  // Editor state
  transformMode: 'translate' | 'rotate' | 'scale';
  isPlaying: boolean;
  globalScript: string;
  
  // Actions
  addObject: (type: SceneObject['type']) => void;
  selectObject: (object: SceneObject) => void;
  deleteObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  togglePlayMode: () => void;
  setGlobalScript: (script: string) => void;
  saveProject: () => void;
  loadProject: () => void;
  clearScene: () => void;
}

const createDefaultObject = (type: SceneObject['type'], name: string): SceneObject => ({
  id: uuidv4(),
  name,
  type,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
  material: {
    color: { r: 0.7, g: 0.7, b: 0.7 },
    opacity: 1.0,
  },
  script: '',
});

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  objects: [],
  selectedObject: null,
  transformMode: 'translate',
  isPlaying: false,
  globalScript: '',

  // Actions
  addObject: (type) => {
    const objectNames = {
      cube: 'Cube',
      sphere: 'Sphere',
      plane: 'Plane',
    };
    
    const existingCount = get().objects.filter(obj => obj.type === type).length;
    const name = existingCount > 0 ? `${objectNames[type]} ${existingCount + 1}` : objectNames[type];
    
    const newObject = createDefaultObject(type, name);
    
    // Position new objects slightly offset if there are existing objects
    if (get().objects.length > 0) {
      newObject.position = [
        Math.random() * 4 - 2,
        0,
        Math.random() * 4 - 2
      ];
    }

    set((state) => ({
      objects: [...state.objects, newObject],
      selectedObject: newObject,
    }));
  },

  selectObject: (object) => {
    set({ selectedObject: object });
  },

  deleteObject: (id) => {
    set((state) => ({
      objects: state.objects.filter(obj => obj.id !== id),
      selectedObject: state.selectedObject?.id === id ? null : state.selectedObject,
    }));
  },

  updateObject: (id, updates) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === id ? { ...obj, ...updates } : obj
      ),
      selectedObject: state.selectedObject?.id === id 
        ? { ...state.selectedObject, ...updates } 
        : state.selectedObject,
    }));
  },

  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },

  togglePlayMode: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setGlobalScript: (script) => {
    set({ globalScript: script });
  },

  saveProject: () => {
    const state = get();
    const projectData = {
      objects: state.objects,
      globalScript: state.globalScript,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scene.json';
    link.click();
    
    URL.revokeObjectURL(url);
  },

  loadProject: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target?.result as string);
          set({
            objects: projectData.objects || [],
            globalScript: projectData.globalScript || '',
            selectedObject: null,
          });
        } catch (error) {
          console.error('Error loading project:', error);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  },

  clearScene: () => {
    set({
      objects: [],
      selectedObject: null,
      globalScript: '',
      isPlaying: false,
    });
  },
}));