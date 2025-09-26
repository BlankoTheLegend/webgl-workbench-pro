import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { useEditorStore } from '../../store/editorStore';
import { GameEngine } from '../../lib/gameEngine/GameAPI';
import * as THREE from 'three';

// Global game engine instance
let gameEngine: GameEngine | null = null;

export const SceneObjects = () => {
  const { objects, selectedObject, selectObject, updateObject, transformMode, isPlaying, globalScript } = useEditorStore();

  // Initialize game engine
  useEffect(() => {
    if (!gameEngine) {
      gameEngine = new GameEngine();
    }

    // Update objects in game engine
    gameEngine.setObjects(objects);

    // Setup global script
    if (globalScript && isPlaying) {
      try {
        const api = gameEngine.createAPI();
        const globalFunction = new Function('engine', 'scene', 'input', 'gui', 'time', 'delta', globalScript);
        
        // Execute global script setup
        globalFunction(api.engine, api.scene, api.input, api.gui, 0, 0);
        
        // Set scene callbacks if defined
        gameEngine.setSceneCallbacks({
          onStart: (globalFunction as any).onStart,
          onUpdate: (globalFunction as any).onUpdate,
        });
      } catch (error) {
        console.warn('Global script error:', error);
      }
    }

    return () => {
      if (gameEngine && !isPlaying) {
        gameEngine.dispose();
        gameEngine = null;
      }
    };
  }, [objects, isPlaying, globalScript]);

  // Update game engine
  useFrame((state, delta) => {
    if (gameEngine && isPlaying) {
      gameEngine.update(delta, state.clock.elapsedTime);
    }
  });

  return (
    <group>
      {objects.map((object) => (
        <SceneObject
          key={object.id}
          object={object}
          isSelected={selectedObject?.id === object.id}
          transformMode={transformMode}
          isPlaying={isPlaying}
          gameEngine={gameEngine}
          onSelect={() => selectObject(object)}
          onTransform={(newTransform) => updateObject(object.id, newTransform)}
        />
      ))}
    </group>
  );
};

interface SceneObjectProps {
  object: any;
  isSelected: boolean;
  transformMode: string;
  isPlaying: boolean;
  gameEngine: GameEngine | null;
  onSelect: () => void;
  onTransform: (transform: any) => void;
}

const SceneObject = ({ object, isSelected, transformMode, isPlaying, gameEngine, onSelect, onTransform }: SceneObjectProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const objectAPI = useRef<any>(null);

  // Setup object event handlers and API
  useEffect(() => {
    if (gameEngine && meshRef.current) {
      // Register object with message manager
      gameEngine['messageManager']?.registerObject(object.id, object.tags || []);
      
      // Create object API wrapper with event handlers
      objectAPI.current = {
        ...object,
        animate: (options: any) => gameEngine['animationManager']?.animate(meshRef.current, options),
        animateSequence: (sequence: any[]) => gameEngine['animationManager']?.animateSequence(meshRef.current, sequence),
        onClick: null,
        onHoverEnter: null,
        onHoverExit: null,
        onMessage: null,
      };
    }
  }, [object.id, gameEngine]);

  // Handle object animations and scripts during play mode
  useFrame((state, delta) => {
    if (isPlaying && meshRef.current && gameEngine && object.script) {
      try {
        // Create comprehensive API for the script
        const api = gameEngine.createAPI(objectAPI.current, meshRef.current, state.clock.elapsedTime, delta);
        
        // Execute object script with full API
        const scriptFunction = new Function(
          'object', 'mesh', 'delta', 'time', 'engine', 'scene', 'input', 'gui',
          object.script
        );
        scriptFunction(
          api.object, 
          api.mesh, 
          api.delta, 
          api.time, 
          api.engine, 
          api.scene, 
          api.input, 
          api.gui
        );
      } catch (error) {
        console.warn('Script execution error:', error);
      }
    }
  });

  const renderGeometry = () => {
    switch (object.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'plane':
        return <planeGeometry args={[1, 1]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const handleTransform = () => {
    if (meshRef.current) {
      const mesh = meshRef.current;
      onTransform({
        position: [mesh.position.x, mesh.position.y, mesh.position.z],
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
        scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
      });
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
          
          // Trigger object's onClick handler if in play mode
          if (isPlaying && objectAPI.current?.onClick) {
            objectAPI.current.onClick();
          }
        }}
        onPointerEnter={(e) => {
          if (isPlaying && objectAPI.current?.onHoverEnter) {
            objectAPI.current.onHoverEnter();
          }
        }}
        onPointerLeave={(e) => {
          if (isPlaying && objectAPI.current?.onHoverExit) {
            objectAPI.current.onHoverExit();
          }
        }}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial 
          color={object.material.color}
          transparent={object.material.opacity < 1}
          opacity={object.material.opacity}
        />
      </mesh>
      
      {isSelected && !isPlaying && (
        <TransformControls
          object={meshRef}
          mode={transformMode as any}
          onObjectChange={handleTransform}
          showX
          showY
          showZ
        />
      )}
    </group>
  );
};