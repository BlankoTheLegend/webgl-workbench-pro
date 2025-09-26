import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';

export const CodeEditor = () => {
  const { selectedObject, updateObject, globalScript, setGlobalScript } = useEditorStore();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      fontSize: 13,
      fontFamily: 'var(--font-mono)',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });

    // Add custom theme
    monaco.editor.defineTheme('3d-editor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': 'hsl(var(--code-editor-bg))',
        'editor.selectionBackground': 'hsl(var(--code-editor-selection))',
      }
    });
    
    monaco.editor.setTheme('3d-editor-dark');
  };

  const handleScriptChange = (value: string | undefined) => {
    if (selectedObject && value !== undefined) {
      updateObject(selectedObject.id, { script: value });
    } else if (!selectedObject && value !== undefined) {
      setGlobalScript(value);
    }
  };

  const getEditorContent = () => {
    if (selectedObject) {
      return selectedObject.script || `// Script for ${selectedObject.name}
// Available variables: object, mesh, delta, time

// Example: Rotate the object
// mesh.rotation.y += delta * 0.5;

// Example: Move the object
// mesh.position.y = Math.sin(time) * 0.5;

// Example: Change color based on time
// const hue = (time * 0.1) % 1;
// mesh.material.color.setHSL(hue, 1, 0.5);
`;
    } else {
      return globalScript || `// Global Scene Script
// This script runs for the entire scene

// Available variables: scene, camera, renderer, delta, time

// Example: Global lighting changes
// scene.traverse((child) => {
//   if (child.isMesh) {
//     child.material.opacity = 0.5 + Math.sin(time) * 0.5;
//   }
// });
`;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={getEditorContent()}
          onChange={handleScriptChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
          }}
        />
      </div>
      
      <div className="p-2 border-t border-editor-border bg-editor-panel">
        <div className="text-xs text-muted-foreground">
          {selectedObject ? (
            <>Editing script for: <span className="text-foreground font-mono">{selectedObject.name}</span></>
          ) : (
            <>Editing: <span className="text-foreground font-mono">Global Scene Script</span></>
          )}
        </div>
      </div>
    </div>
  );
};