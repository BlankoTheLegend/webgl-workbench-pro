import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { SceneObjects } from './SceneObjects';
import { useEditorStore } from '../../store/editorStore';

export const SceneViewport = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { transformMode } = useEditorStore();

  return (
    <div className="h-full w-full relative">
      <Canvas
        ref={canvasRef}
        camera={{ position: [5, 5, 5], fov: 45 }}
        style={{ background: 'hsl(var(--viewport-bg))' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Camera Controls */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Grid */}
        <Grid 
          args={[20, 20]} 
          position={[0, 0, 0]}
          cellSize={1}
          cellThickness={0.8}
          cellColor="hsl(var(--viewport-grid))"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="hsl(var(--viewport-grid))"
          fadeDistance={25}
          fadeStrength={1}
          infiniteGrid
        />
        
        {/* Scene Objects */}
        <SceneObjects />
        
        {/* Gizmo Helper */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport 
            axisColors={[
              'hsl(var(--viewport-axis-x))', 
              'hsl(var(--viewport-axis-y))', 
              'hsl(var(--viewport-axis-z))'
            ]}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
      
      {/* Viewport Overlay */}
      <div className="absolute top-4 left-4 text-muted-foreground text-sm">
        <div>Mode: {transformMode.charAt(0).toUpperCase() + transformMode.slice(1)}</div>
        <div className="text-xs mt-1 opacity-70">
          W - Move | E - Rotate | R - Scale
        </div>
      </div>
    </div>
  );
};