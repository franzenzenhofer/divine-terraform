import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

const WaterPlane: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mapSize, waterLevel } = useGameStore();

  // Create water material with transparency
  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: 0x006994,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
      specular: 0x4488ff,
      side: THREE.DoubleSide
    });
  }, []);

  // Animate water
  useFrame((state) => {
    if (meshRef.current) {
      // Simple wave animation
      meshRef.current.position.y = waterLevel * 20 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[mapSize.x / 2, waterLevel * 20, mapSize.y / 2]}
      receiveShadow
    >
      <planeGeometry args={[mapSize.x * 1.5, mapSize.y * 1.5]} />
      <primitive object={material} />
    </mesh>
  );
};

export default WaterPlane;