import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '../../store/editorStore';

export const PropertiesPanel = () => {
  const { selectedObject, updateObject } = useEditorStore();
  const [colorInput, setColorInput] = useState('#ffffff');

  if (!selectedObject) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Select an object to view its properties
      </div>
    );
  }

  const handleTransformChange = (axis: string, component: string, value: number) => {
    const newTransform = { ...selectedObject };
    newTransform[component][axis === 'x' ? 0 : axis === 'y' ? 1 : 2] = value;
    updateObject(selectedObject.id, { [component]: newTransform[component] });
  };

  const handleMaterialChange = (property: string, value: any) => {
    updateObject(selectedObject.id, {
      material: {
        ...selectedObject.material,
        [property]: value
      }
    });
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  };

  const rgbToHex = (color: any) => {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Object Info */}
      <div>
        <Label className="text-sm font-semibold">Object</Label>
        <div className="mt-2 space-y-2">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={selectedObject.name}
              onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Input
              value={selectedObject.type}
              disabled
              className="h-8 bg-muted"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Transform */}
      <div>
        <Label className="text-sm font-semibold">Transform</Label>
        
        {/* Position */}
        <div className="mt-3">
          <Label className="text-xs text-muted-foreground">Position</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {['x', 'y', 'z'].map((axis, index) => (
              <div key={axis}>
                <Label className="text-xs text-muted-foreground uppercase">{axis}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={selectedObject.position[index].toFixed(2)}
                  onChange={(e) => handleTransformChange(axis, 'position', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="mt-3">
          <Label className="text-xs text-muted-foreground">Rotation</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {['x', 'y', 'z'].map((axis, index) => (
              <div key={axis}>
                <Label className="text-xs text-muted-foreground uppercase">{axis}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(selectedObject.rotation[index] * (180 / Math.PI)).toFixed(1)}
                  onChange={(e) => handleTransformChange(axis, 'rotation', (parseFloat(e.target.value) || 0) * (Math.PI / 180))}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="mt-3">
          <Label className="text-xs text-muted-foreground">Scale</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {['x', 'y', 'z'].map((axis, index) => (
              <div key={axis}>
                <Label className="text-xs text-muted-foreground uppercase">{axis}</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={selectedObject.scale[index].toFixed(2)}
                  onChange={(e) => handleTransformChange(axis, 'scale', Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Material */}
      <div>
        <Label className="text-sm font-semibold">Material</Label>
        
        <div className="mt-3 space-y-3">
          {/* Color */}
          <div>
            <Label className="text-xs text-muted-foreground">Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={rgbToHex(selectedObject.material.color)}
                onChange={(e) => {
                  const rgb = hexToRgb(e.target.value);
                  if (rgb) {
                    handleMaterialChange('color', rgb);
                  }
                }}
                className="w-12 h-8 rounded border border-input cursor-pointer"
              />
              <Input
                value={rgbToHex(selectedObject.material.color)}
                onChange={(e) => {
                  const rgb = hexToRgb(e.target.value);
                  if (rgb) {
                    handleMaterialChange('color', rgb);
                  }
                }}
                className="h-8 flex-1"
              />
            </div>
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">Opacity</Label>
              <span className="text-xs text-muted-foreground">{selectedObject.material.opacity.toFixed(2)}</span>
            </div>
            <Slider
              value={[selectedObject.material.opacity]}
              onValueChange={([value]) => handleMaterialChange('opacity', value)}
              max={1}
              min={0}
              step={0.01}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Script */}
      <div>
        <Label className="text-sm font-semibold">Script</Label>
        <div className="mt-2">
          <textarea
            value={selectedObject.script || ''}
            onChange={(e) => updateObject(selectedObject.id, { script: e.target.value })}
            placeholder="// Object script (JavaScript)
// Available variables: object, mesh, delta, time
// Example:
// mesh.rotation.y += delta;"
            className="w-full h-32 p-3 text-xs font-mono bg-input border border-input rounded resize-none"
          />
        </div>
      </div>
    </div>
  );
};