import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import TerrainMesh from './TerrainMesh';
import WaterPlane from './WaterPlane';
import CivilizationRenderer from './CivilizationRenderer';
import EffectsRenderer from './EffectsRenderer';
import { useInputHandler } from '../hooks/useInputHandler';

const GameWorld: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { camera } = useThree();
  
  const { terrain, mapSize, timeOfDay, weather } = useGameStore();
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useInputHandler();

  // Calculate sun position based on time of day
  const sunPosition = useMemo(() => {
    const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    return [
      Math.cos(angle) * 100,
      Math.sin(angle) * 100,
      0
    ] as [number, number, number];
  }, [timeOfDay]);

  // Set up initial camera position
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(mapSize.x / 2, 50, mapSize.y / 2 + 50);
      cameraRef.current.lookAt(mapSize.x / 2, 0, mapSize.y / 2);
    }
  }, [mapSize]);

  // Update controls target
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(mapSize.x / 2, 0, mapSize.y / 2);
      controlsRef.current.minDistance = 20;
      controlsRef.current.maxDistance = 200;
      controlsRef.current.maxPolarAngle = Math.PI / 2.2;
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
    }
  }, [mapSize]);

  // Handle frame updates
  useFrame((state, delta) => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={60}
        near={0.1}
        far={1000}
      />
      
      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.5}
        panSpeed={0.5}
        rotateSpeed={0.5}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={sunPosition}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={sunPosition}
        inclination={0}
        azimuth={0.25}
        rayleigh={2}
        turbidity={10}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#87CEEB', 100, 300]} />
      
      {/* Game World Components */}
      <group
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <TerrainMesh />
        <WaterPlane />
        <CivilizationRenderer />
        <EffectsRenderer />
      </group>
    </>
  );
};

export default GameWorld;