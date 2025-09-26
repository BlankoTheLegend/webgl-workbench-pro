import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Box, 
  Circle, 
  Plane, 
  Play, 
  Pause, 
  Code, 
  Save, 
  FolderOpen,
  RotateCcw,
  Move3D,
  RotateCw,
  Scale3D
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface ToolbarProps {
  onToggleCodeEditor: () => void;
}

export const Toolbar = ({ onToggleCodeEditor }: ToolbarProps) => {
  const { 
    addObject, 
    transformMode, 
    setTransformMode,
    isPlaying,
    togglePlayMode,
    saveProject,
    loadProject
  } = useEditorStore();

  return (
    <div className="h-12 bg-editor-toolbar border-b border-editor-border flex items-center px-4 gap-2">
      {/* File Operations */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={saveProject}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadProject}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover"
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          Load
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-editor-border" />

      {/* Object Creation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addObject('cube')}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover"
          title="Add Cube"
        >
          <Box className="h-4 w-4" />
        </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addObject('sphere')}
            className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover"
            title="Add Sphere"
          >
            <Circle className="h-4 w-4" />
          </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addObject('plane')}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover"
          title="Add Plane"
        >
          <Plane className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-editor-border" />

      {/* Transform Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={transformMode === 'translate' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setTransformMode('translate')}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover data-[state=on]:bg-editor-active"
          title="Move Tool (W)"
        >
          <Move3D className="h-4 w-4" />
        </Button>
        <Button
          variant={transformMode === 'rotate' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setTransformMode('rotate')}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover data-[state=on]:bg-editor-active"
          title="Rotate Tool (E)"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant={transformMode === 'scale' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setTransformMode('scale')}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover data-[state=on]:bg-editor-active"
          title="Scale Tool (R)"
        >
          <Scale3D className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-editor-border" />

      {/* Playback Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={isPlaying ? 'secondary' : 'ghost'}
          size="sm"
          onClick={togglePlayMode}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 mr-1" />
          ) : (
            <Play className="h-4 w-4 mr-1" />
          )}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      </div>

      <div className="flex-1"></div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCodeEditor}
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-editor-hover"
        >
          <Code className="h-4 w-4 mr-1" />
          Code
        </Button>
      </div>
    </div>
  );
};