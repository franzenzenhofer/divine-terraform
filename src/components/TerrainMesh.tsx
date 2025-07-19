import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import { TerrainCell, TerrainType } from '../types/game';

const TerrainMesh: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { terrain, mapSize } = useGameStore();

  // Create terrain geometry
  const geometry = useMemo(() => {
    if (!terrain || terrain.length === 0) return null;

    const geo = new THREE.PlaneGeometry(
      mapSize.x,
      mapSize.y,
      mapSize.x - 1,
      mapSize.y - 1
    );

    const vertices = geo.attributes.position.array as Float32Array;
    const colors = new Float32Array(vertices.length);

    // Update vertices and colors
    for (let y = 0; y < mapSize.y; y++) {
      for (let x = 0; x < mapSize.x; x++) {
        const index = y * mapSize.x + x;
        const vertexIndex = index * 3;
        
        if (terrain[x] && terrain[x][y]) {
          const cell = terrain[x][y];
          
          // Set height
          vertices[vertexIndex + 2] = cell.height * 20; // Scale height
          
          // Set color based on terrain type
          const color = getTerrainColor(cell);
          colors[vertexIndex] = color.r;
          colors[vertexIndex + 1] = color.g;
          colors[vertexIndex + 2] = color.b;
        }
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    return geo;
  }, [terrain, mapSize]);

  // Create terrain material
  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      vertexColors: true,
      flatShading: false,
      side: THREE.DoubleSide,
      shininess: 5,
      specular: new THREE.Color(0x222222)
    });
  }, []);

  // Update mesh when terrain changes
  useEffect(() => {
    if (meshRef.current && geometry) {
      meshRef.current.geometry = geometry;
      meshRef.current.geometry.computeBoundingSphere();
    }
  }, [geometry]);

  // Get color based on terrain type and height
  function getTerrainColor(cell: TerrainCell): THREE.Color {
    switch (cell.type) {
      case TerrainType.WATER:
        return new THREE.Color(0x006994);
      case TerrainType.BEACH:
        return new THREE.Color(0xc2b280);
      case TerrainType.GRASS:
        return new THREE.Color(0x228b22);
      case TerrainType.FOREST:
        return new THREE.Color(0x0f4f0f);
      case TerrainType.MOUNTAIN:
        return new THREE.Color(0x8b7355);
      case TerrainType.SNOW:
        return new THREE.Color(0xffffff);
      case TerrainType.DESERT:
        return new THREE.Color(0xedc9af);
      case TerrainType.TUNDRA:
        return new THREE.Color(0x9ea79e);
      case TerrainType.SWAMP:
        return new THREE.Color(0x4a5d3a);
      case TerrainType.VOLCANIC:
        return new THREE.Color(0x3c3c3c);
      default:
        return new THREE.Color(0x808080);
    }
  }

  if (!geometry) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    />
  );
};

export default TerrainMesh;