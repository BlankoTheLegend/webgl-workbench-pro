import { useState } from 'react';
import { Toolbar } from './Toolbar';
import { SceneViewport } from './SceneViewport';
import { SceneHierarchy } from './SceneHierarchy';
import { PropertiesPanel } from './PropertiesPanel';
import { CodeEditor } from './CodeEditor';
import { DynamicGUI } from './DynamicGUI';
import { useEditorStore } from '../../store/editorStore';

export const EditorLayout = () => {
  const { selectedObject } = useEditorStore();
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar onToggleCodeEditor={() => setShowCodeEditor(!showCodeEditor)} />
      
      {/* Main Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Scene Hierarchy */}
        <div className="w-80 bg-editor-panel border-r border-editor-border flex flex-col">
          <div className="p-3 border-b border-editor-border">
            <h2 className="text-sm font-semibold text-foreground">Hierarchy</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <SceneHierarchy />
          </div>
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 bg-viewport-bg relative">
          <SceneViewport />
        </div>

        {/* Right Panel - Properties & GUI */}
        <div className="w-80 bg-editor-panel border-l border-editor-border flex flex-col">
          {/* Properties Section */}
          <div className="h-1/2 border-b border-editor-border">
            <div className="p-3 border-b border-editor-border">
              <h2 className="text-sm font-semibold text-foreground">
                {selectedObject ? `Properties - ${selectedObject.name}` : 'Properties'}
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              <PropertiesPanel />
            </div>
          </div>
          
          {/* Dynamic GUI Section */}
          <div className="h-1/2 p-2 overflow-y-auto">
            <DynamicGUI />
          </div>
        </div>
      </div>

      {/* Bottom Code Editor Panel (Collapsible) */}
      {showCodeEditor && (
        <div className="h-80 bg-editor-panel border-t border-editor-border">
          <div className="p-3 border-b border-editor-border flex justify-between items-center">
            <h2 className="text-sm font-semibold text-foreground">Code Editor</h2>
            <button
              onClick={() => setShowCodeEditor(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="h-full">
            <CodeEditor />
          </div>
        </div>
      )}
    </div>
  );
};