import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GUIElement } from '../../lib/gameEngine/GUIManager';

export const DynamicGUI = () => {
  const [guiData, setGuiData] = useState<{
    containers: Map<string, string[]>;
    elements: Map<string, GUIElement>;
  }>({
    containers: new Map(),
    elements: new Map(),
  });

  useEffect(() => {
    const handleGUIUpdate = (event: CustomEvent) => {
      setGuiData({
        containers: new Map(event.detail.containers),
        elements: new Map(event.detail.elements),
      });
    };

    window.addEventListener('gui-update', handleGUIUpdate as EventListener);
    
    return () => {
      window.removeEventListener('gui-update', handleGUIUpdate as EventListener);
    };
  }, []);

  const renderElement = (element: GUIElement) => {
    const triggerElement = (value?: any) => {
      // Trigger the element callback
      window.dispatchEvent(new CustomEvent('gui-trigger', {
        detail: { id: element.id, value }
      }));
    };

    switch (element.type) {
      case 'button':
        return (
          <Button
            key={element.id}
            onClick={() => triggerElement()}
            className="w-full mb-2"
            variant="outline"
          >
            {element.label}
          </Button>
        );

      case 'slider':
        return (
          <div key={element.id} className="mb-4">
            <Label className="text-sm text-foreground">{element.label}</Label>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">{element.min}</span>
              <Slider
                min={element.min}
                max={element.max}
                step={element.step || 0.1}
                value={[element.value]}
                onValueChange={(values) => triggerElement(values[0])}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">{element.max}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Value: {element.value?.toFixed(2)}
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div key={element.id} className="flex items-center justify-between mb-3">
            <Label className="text-sm text-foreground">{element.label}</Label>
            <Switch
              checked={element.value}
              onCheckedChange={triggerElement}
            />
          </div>
        );

      case 'text':
        return (
          <div key={element.id} className="mb-2">
            <p className="text-sm text-foreground">{element.label}</p>
          </div>
        );

      case 'input':
        return (
          <div key={element.id} className="mb-3">
            <Label className="text-sm text-foreground">{element.label}</Label>
            <Input
              value={element.value}
              onChange={(e) => triggerElement(e.target.value)}
              className="mt-1"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const containerNames = Array.from(guiData.containers.keys()).filter(name => 
    (guiData.containers.get(name)?.length || 0) > 0
  );

  if (containerNames.length === 0) {
    return null;
  }

  // Setup GUI element trigger listener
  useEffect(() => {
    const handleGUITrigger = (event: CustomEvent) => {
      const { id, value } = event.detail;
      // Find and trigger the element
      // This would be handled by the GUIManager in practice
      console.log('Triggering GUI element:', id, value);
    };

    window.addEventListener('gui-trigger', handleGUITrigger as EventListener);
    
    return () => {
      window.removeEventListener('gui-trigger', handleGUITrigger as EventListener);
    };
  }, []);

  if (containerNames.length === 1) {
    // Single container - render directly
    const containerName = containerNames[0];
    const elementIds = guiData.containers.get(containerName) || [];
    const elements = elementIds.map(id => guiData.elements.get(id)!).filter(Boolean);

    return (
      <Card className="bg-editor-panel border-editor-border">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-foreground">Game Controls</h3>
        </CardHeader>
        <CardContent>
          {elements.map(renderElement)}
        </CardContent>
      </Card>
    );
  }

  // Multiple containers - use tabs
  return (
    <Card className="bg-editor-panel border-editor-border">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-foreground">Game Controls</h3>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={containerNames[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {containerNames.slice(0, 2).map(name => (
              <TabsTrigger key={name} value={name} className="text-xs">
                {name === 'default' ? 'General' : name}
              </TabsTrigger>
            ))}
          </TabsList>
          {containerNames.map(containerName => {
            const elementIds = guiData.containers.get(containerName) || [];
            const elements = elementIds.map(id => guiData.elements.get(id)!).filter(Boolean);

            return (
              <TabsContent key={containerName} value={containerName} className="mt-3">
                {elements.map(renderElement)}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};