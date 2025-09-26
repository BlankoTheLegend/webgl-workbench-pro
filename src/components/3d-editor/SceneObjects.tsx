import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';

export const SceneObjects = () => {
  const { objects, selectedObject, selectObject, updateObject, transformMode, isPlaying } = useEditorStore();

  return (
    <group>
      {objects.map((object) => (
        <SceneObject
          key={object.id}
          object={object}
          isSelected={selectedObject?.id === object.id}
          transformMode={transformMode}
          isPlaying={isPlaying}
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
  onSelect: () => void;
  onTransform: (transform: any) => void;
}

const SceneObject = ({ object, isSelected, transformMode, isPlaying, onSelect, onTransform }: SceneObjectProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Handle object animations during play mode
  useFrame((state, delta) => {
    if (isPlaying && meshRef.current && object.script) {
      try {
        // Execute object script during play mode
        const scriptFunction = new Function('object', 'mesh', 'delta', 'time', object.script);
        scriptFunction(object, meshRef.current, delta, state.clock.elapsedTime);
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