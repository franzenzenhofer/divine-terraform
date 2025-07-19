import React from 'react';
import { Effect } from '../types/game';

interface GodPowerEffectsProps {
  effects: Effect[];
}

const GodPowerEffects: React.FC<GodPowerEffectsProps> = ({ effects }) => {
  return (
    <>
      {effects.map((effect) => (
        <group key={effect.id} position={[effect.position.x, effect.position.y, effect.position.z]}>
          {/* Placeholder for various effect types */}
          <mesh>
            <sphereGeometry args={[effect.radius || 1, 16, 16]} />
            <meshBasicMaterial
              color={effect.color || 0xffffff}
              transparent
              opacity={effect.intensity}
            />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default GodPowerEffects;