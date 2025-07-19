import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Weather } from '../types/game';

interface WeatherEffectsProps {
  weather: Weather;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weather }) => {
  const rainRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);

  // Animate weather particles
  useFrame((state, delta) => {
    if (rainRef.current && weather === Weather.RAIN) {
      rainRef.current.rotation.y += delta * 0.1;
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 20;
        if (positions[i] < -50) {
          positions[i] = 50;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (snowRef.current && weather === Weather.SNOW) {
      snowRef.current.rotation.y += delta * 0.05;
      const positions = snowRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 2;
        if (positions[i] < -50) {
          positions[i] = 50;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Create particle geometry
  const createParticleGeometry = (count: number, spread: number) => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * spread;
      positions[i + 1] = Math.random() * 100 - 50;
      positions[i + 2] = (Math.random() - 0.5) * spread;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  };

  return (
    <>
      {weather === Weather.RAIN && (
        <points ref={rainRef}>
          <bufferGeometry attach="geometry" {...createParticleGeometry(1000, 200)} />
          <pointsMaterial
            attach="material"
            color={0x4488ff}
            size={0.1}
            transparent
            opacity={0.6}
          />
        </points>
      )}
      
      {weather === Weather.SNOW && (
        <points ref={snowRef}>
          <bufferGeometry attach="geometry" {...createParticleGeometry(500, 200)} />
          <pointsMaterial
            attach="material"
            color={0xffffff}
            size={0.3}
            transparent
            opacity={0.8}
          />
        </points>
      )}
      
      {weather === Weather.STORM && (
        <>
          <ambientLight intensity={0.1} />
          <fog attach="fog" args={['#333333', 50, 200]} />
        </>
      )}
    </>
  );
};

export default WeatherEffects;