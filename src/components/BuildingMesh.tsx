import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Building, Civilization, BuildingType } from '../types/game';

interface BuildingMeshProps {
  building: Building;
  civilization: Civilization;
}

const BuildingMesh: React.FC<BuildingMeshProps> = ({ building, civilization }) => {
  // Get building dimensions and color based on type
  const { geometry, material } = useMemo(() => {
    let width = 1, height = 1, depth = 1;
    let color = civilization.color;

    switch (building.type) {
      case BuildingType.HUT:
        width = 0.8; height = 0.6; depth = 0.8;
        break;
      case BuildingType.HOUSE:
        width = 1; height = 0.8; depth = 1;
        break;
      case BuildingType.FARM:
        width = 1.5; height = 0.5; depth = 1.5;
        color = 0x8b4513;
        break;
      case BuildingType.TEMPLE:
        width = 1.2; height = 1.5; depth = 1.2;
        color = 0xffd700;
        break;
      case BuildingType.WORKSHOP:
        width = 1.2; height = 0.9; depth = 1.4;
        break;
      case BuildingType.MARKET:
        width = 1.5; height = 0.7; depth = 1.5;
        break;
      case BuildingType.BARRACKS:
        width = 1.3; height = 1; depth = 1.3;
        color = 0x696969;
        break;
      case BuildingType.WALL:
        width = 0.3; height = 1.2; depth = 1;
        color = 0x808080;
        break;
      case BuildingType.TOWER:
        width = 0.8; height = 1.8; depth = 0.8;
        color = 0x696969;
        break;
      case BuildingType.PALACE:
        width = 2; height = 1.5; depth = 2;
        color = 0xffd700;
        break;
    }

    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshPhongMaterial({ 
      color: typeof color === 'number' ? color : parseInt(color.replace('#', '0x')),
      emissive: building.isCompleted ? 0x000000 : 0x444444,
      emissiveIntensity: building.isCompleted ? 0 : 0.3
    });

    return { geometry: geo, material: mat };
  }, [building.type, building.isCompleted, civilization.color]);

  // Calculate position with height offset
  const position: [number, number, number] = [
    building.position.x,
    building.position.y + (geometry.parameters.height / 2),
    building.position.z
  ];

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      castShadow
      receiveShadow
    >
      {/* Add a simple roof for houses and temples */}
      {(building.type === BuildingType.HOUSE || 
        building.type === BuildingType.HUT || 
        building.type === BuildingType.TEMPLE) && (
        <mesh position={[0, geometry.parameters.height / 2 + 0.2, 0]}>
          <coneGeometry args={[
            geometry.parameters.width * 0.7,
            0.4,
            4
          ]} />
          <meshPhongMaterial color={0x8b4513} />
        </mesh>
      )}
    </mesh>
  );
};

export default BuildingMesh;