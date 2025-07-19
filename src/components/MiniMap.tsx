import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { TerrainType } from '../types/game';

const MiniMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { terrain, mapSize, civilizations } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current || !terrain) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 128 / Math.max(mapSize.x, mapSize.y);
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 128, 128);

    // Draw terrain
    for (let x = 0; x < mapSize.x; x++) {
      for (let y = 0; y < mapSize.y; y++) {
        if (!terrain[x] || !terrain[x][y]) continue;
        
        const cell = terrain[x][y];
        ctx.fillStyle = getTerrainColor(cell.type);
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Draw civilizations
    civilizations.forEach(civ => {
      ctx.fillStyle = typeof civ.color === 'string' ? civ.color : `#${civ.color.toString(16).padStart(6, '0')}`;
      ctx.globalAlpha = 0.8;
      
      civ.buildings.forEach(building => {
        const x = Math.floor(building.position.x * scale);
        const y = Math.floor(building.position.z * scale);
        ctx.fillRect(x - 1, y - 1, 3, 3);
      });
    });

    ctx.globalAlpha = 1;
  }, [terrain, mapSize, civilizations]);

  function getTerrainColor(type: TerrainType): string {
    switch (type) {
      case TerrainType.WATER: return '#006994';
      case TerrainType.BEACH: return '#c2b280';
      case TerrainType.GRASS: return '#228b22';
      case TerrainType.FOREST: return '#0f4f0f';
      case TerrainType.MOUNTAIN: return '#8b7355';
      case TerrainType.SNOW: return '#ffffff';
      case TerrainType.DESERT: return '#edc9af';
      case TerrainType.TUNDRA: return '#9ea79e';
      case TerrainType.SWAMP: return '#4a5d3a';
      case TerrainType.VOLCANIC: return '#3c3c3c';
      default: return '#808080';
    }
  }

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-lg p-2">
      <canvas
        ref={canvasRef}
        width={128}
        height={128}
        className="rounded border border-white/20"
      />
    </div>
  );
};

export default MiniMap;