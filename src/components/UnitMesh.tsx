import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Unit, Civilization, UnitType } from '../types/game';

interface UnitMeshProps {
  unit: Unit;
  civilization: Civilization;
}

const UnitMesh: React.FC<UnitMeshProps> = ({ unit, civilization }) => {
  const meshRef = useRef<THREE.Group>(null);

  // Animate unit movement
  useFrame((state, delta) => {
    if (meshRef.current && unit.path && unit.path.length > 0) {
      // Simple movement animation
      const speed = unit.type === UnitType.SCOUT ? 5 : 3;
      const target = unit.path[0];
      
      const dx = target.x - unit.position.x;
      const dz = target.z - unit.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 0.1) {
        const moveX = (dx / distance) * speed * delta;
        const moveZ = (dz / distance) * speed * delta;
        
        meshRef.current.position.x += moveX;
        meshRef.current.position.z += moveZ;
        
        // Update rotation to face movement direction
        meshRef.current.lookAt(target.x, meshRef.current.position.y, target.z);
      }
    }
  });

  // Get unit size and color based on type
  const getUnitAppearance = () => {
    switch (unit.type) {
      case UnitType.VILLAGER:
        return { scale: 0.3, color: civilization.color };
      case UnitType.WARRIOR:
        return { scale: 0.4, color: 0xff0000 };
      case UnitType.SCOUT:
        return { scale: 0.35, color: 0x00ff00 };
      case UnitType.PRIEST:
        return { scale: 0.35, color: 0xffd700 };
      case UnitType.MERCHANT:
        return { scale: 0.35, color: 0x0000ff };
      default:
        return { scale: 0.3, color: civilization.color };
    }
  };

  const { scale, color } = getUnitAppearance();

  return (
    <group
      ref={meshRef}
      position={[unit.position.x, unit.position.y + scale, unit.position.z]}
    >
      {/* Body */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[scale * 0.5, scale * 1.5, 4, 8]} />
        <meshPhongMaterial 
          color={typeof color === 'number' ? color : parseInt(color.replace('#', '0x'))} 
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, scale * 1.2, 0]} castShadow>
        <sphereGeometry args={[scale * 0.3, 8, 6]} />
        <meshPhongMaterial color={0xfdbcb4} />
      </mesh>
      
      {/* Special indicators */}
      {unit.type === UnitType.PRIEST && (
        <mesh position={[0, scale * 2, 0]}>
          <torusGeometry args={[scale * 0.4, scale * 0.1, 8, 16]} />
          <meshPhongMaterial color={0xffd700} emissive={0xffd700} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default UnitMesh;