import { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';
import { SCRIPT_TEMPLATES, SCRIPT_CATEGORIES, getTemplatesByCategory } from '../../lib/gameEngine/ScriptTemplates';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export const CodeEditor = () => {
  const { selectedObject, updateObject, globalScript, setGlobalScript } = useEditorStore();
  const editorRef = useRef<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Animation');

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
        'editor.background': '#1a1e2e',
        'editor.selectionBackground': '#0066cc33',
      }
    });
    
    monaco.editor.setTheme('3d-editor-dark');

    // Add autocompletion for game API
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          // Engine API
          {
            label: 'engine.playSound',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'engine.playSound("${1:sound.wav}", ${2:1.0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Play a sound file with optional volume'
          },
          {
            label: 'engine.setTimeout',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'engine.setTimeout(() => {\n\t${1:// code}\n}, ${2:1000})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Execute code after a delay (milliseconds)'
          },
          {
            label: 'engine.setInterval',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'engine.setInterval(() => {\n\t${1:// code}\n}, ${2:1000})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Execute code repeatedly at intervals'
          },
          {
            label: 'engine.wait',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'await engine.wait(${1:1000})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Wait for specified milliseconds (async)'
          },
          // Input API
          {
            label: 'input.isKeyDown',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'input.isKeyDown("${1:Space}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Check if key is currently pressed'
          },
          {
            label: 'input.wasKeyPressed',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'input.wasKeyPressed("${1:Space}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Check if key was just pressed this frame'
          },
          {
            label: 'input.isMouseDown',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'input.isMouseDown("${1:left}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Check if mouse button is pressed'
          },
          {
            label: 'input.getMousePosition',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'input.getMousePosition()',
            documentation: 'Get current mouse position'
          },
          // GUI API
          {
            label: 'gui.addButton',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'gui.addButton("${1:Button Text}", () => {\n\t${2:// action}\n})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Add a button to the GUI'
          },
          {
            label: 'gui.addSlider',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'gui.addSlider("${1:Label}", ${2:0}, ${3:10}, ${4:5}, (value) => {\n\t${5:// callback}\n})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Add a slider to the GUI'
          },
          {
            label: 'gui.addToggle',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'gui.addToggle("${1:Label}", ${2:false}, (enabled) => {\n\t${3:// callback}\n})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Add a toggle switch to the GUI'
          },
          // Scene API
          {
            label: 'scene.getObjectByName',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'scene.getObjectByName("${1:ObjectName}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Find object by name'
          },
          {
            label: 'scene.sendMessage',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'scene.sendMessage("${1:ObjectId}", "${2:message}", ${3:data})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Send message to specific object'
          },
          // Object API
          {
            label: 'object.onClick',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'object.onClick = () => {\n\t${1:// action}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Set click handler for object'
          },
          {
            label: 'object.onHoverEnter',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'object.onHoverEnter = () => {\n\t${1:// action}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Set hover enter handler'
          },
          {
            label: 'object.animate',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'object.animate({\n\tproperty: "${1:position.y}",\n\tto: ${2:5},\n\tduration: ${3:1000}\n})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Animate object property'
          },
        ];

        return { suggestions };
      }
    });
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
// Available: object, mesh, delta, time, engine, scene, input, gui

// Event handlers
object.onClick = () => {
  mesh.material.color.setHex(0x00ff00);
};

// Animation example
mesh.rotation.y += delta * 2;

// Input handling
if (input.isKeyDown('ArrowLeft')) {
  mesh.position.x -= delta * 5;
}

// GUI controls
gui.addButton('Jump', () => {
  object.animate({
    property: 'position.y',
    to: mesh.position.y + 3,
    duration: 500
  });
});
`;
    } else {
      return globalScript || `// Global Scene Script
// Available: engine, scene, input, gui, delta, time

// Scene setup
scene.onStart = () => {
  console.log('Scene started!');
};

// Global update loop
scene.onUpdate = (delta, time) => {
  // Global logic here
  if (input.wasKeyPressed('r')) {
    scene.restart();
  }
};

// Global GUI
gui.addButton('Reset Scene', () => {
  scene.restart();
});
`;
    }
  };

  const insertTemplate = (template: any) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };
      
      editor.executeEdits('template-insert', [{
        range,
        text: '\n' + template.code + '\n'
      }]);
      
      editor.focus();
    }
    setShowTemplates(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Template Panel */}
      {showTemplates && (
        <Card className="m-2 bg-editor-panel border-editor-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Script Templates</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTemplates(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full mb-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCRIPT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ScrollArea className="h-40">
              <div className="space-y-2">
                {getTemplatesByCategory(selectedCategory).map((template, index) => (
                  <div key={index} className="p-2 border border-editor-border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertTemplate(template)}
                        className="text-xs"
                      >
                        Insert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-editor-border bg-editor-panel">
        <div className="text-xs text-muted-foreground">
          {selectedObject ? (
            <>Editing script for: <span className="text-foreground font-mono">{selectedObject.name}</span></>
          ) : (
            <>Editing: <span className="text-foreground font-mono">Global Scene Script</span></>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-xs"
        >
          Templates
        </Button>
      </div>

      {/* Code Editor */}
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
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
          }}
        />
      </div>
    </div>
  );
};