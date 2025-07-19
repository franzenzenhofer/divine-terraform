import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

export const useInputHandler = () => {
  const { camera, raycaster } = useThree();
  const { 
    selectedPower, 
    usePower, 
    terrain, 
    mapSize 
  } = useGameStore();

  const getTerrainIntersection = useCallback((event: any) => {
    // Convert mouse position to normalized device coordinates
    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // Create a plane at y=0 for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(plane, intersection)) {
      // Convert world coordinates to terrain coordinates
      const terrainX = Math.floor(intersection.x);
      const terrainZ = Math.floor(intersection.z);

      if (terrainX >= 0 && terrainX < mapSize.x && 
          terrainZ >= 0 && terrainZ < mapSize.y) {
        return { x: terrainX, z: terrainZ, world: intersection };
      }
    }

    return null;
  }, [camera, raycaster, mapSize]);

  const handlePointerDown = useCallback((event: any) => {
    if (!selectedPower) return;

    const intersection = getTerrainIntersection(event);
    if (intersection) {
      usePower(selectedPower, { 
        x: intersection.x, 
        y: intersection.z 
      });
    }
  }, [selectedPower, usePower, getTerrainIntersection]);

  const handlePointerMove = useCallback((event: any) => {
    // Handle hover effects or preview
  }, []);

  const handlePointerUp = useCallback((event: any) => {
    // Handle pointer up
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
};