import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Box, 
  Circle, 
  Plane, 
  Eye, 
  EyeOff, 
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SceneHierarchy = () => {
  const { objects, selectedObject, selectObject, deleteObject, updateObject } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'cube':
        return <Box className="h-4 w-4" />;
      case 'sphere':
        return <Circle className="h-4 w-4" />;
      case 'plane':
        return <Plane className="h-4 w-4" />;
      default:
        return <Box className="h-4 w-4" />;
    }
  };

  const handleNameChange = (objectId: string, newName: string) => {
    updateObject(objectId, { name: newName });
    setEditingId(null);
  };

  const toggleVisibility = (objectId: string, currentVisibility: boolean) => {
    updateObject(objectId, { visible: !currentVisibility });
  };

  return (
    <div className="p-2">
      {objects.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm py-8">
          No objects in scene.
          <br />
          Use the toolbar to add objects.
        </div>
      ) : (
        <div className="space-y-1">
          {objects.map((object) => (
            <div
              key={object.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                selectedObject?.id === object.id
                  ? 'bg-editor-selection text-primary-foreground'
                  : 'hover:bg-editor-hover'
              }`}
              onClick={() => selectObject(object)}
            >
              {/* Object Icon */}
              <div className="text-muted-foreground">
                {getObjectIcon(object.type)}
              </div>

              {/* Object Name */}
              <div className="flex-1 min-w-0">
                {editingId === object.id ? (
                  <Input
                    defaultValue={object.name}
                    className="h-6 text-sm"
                    autoFocus
                    onBlur={(e) => handleNameChange(object.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNameChange(object.id, e.currentTarget.value);
                      }
                      if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm truncate">{object.name}</span>
                )}
              </div>

              {/* Visibility Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(object.id, object.visible);
                }}
              >
                {object.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>

              {/* Object Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setEditingId(object.id)}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteObject(object.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};