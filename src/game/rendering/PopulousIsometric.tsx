import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface Props {
  width: number;
  height: number;
}

// WebPopulous exact isometric projection
function calcPos(x: number, y: number, height: number, canvasWidth: number, canvasHeight: number): [number, number] {
  return [
    canvasWidth / 2 + x * 16 - y * 16,
    100 + x * 8 + y * 8 - height * 8  // Start from top with padding
  ];
}

// Convert screen coordinates to logical tile coordinates
function screenToLogical(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): [number, number] {
  const x = screenX - canvasWidth / 2;
  const y = screenY - (canvasHeight - 16 * 20 - 16);
  
  return [
    Math.floor((x / 2 + y) / 16),
    Math.floor((y - x / 2) / 16)
  ];
}

export const PopulousIsometric: React.FC<Props> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { terrain, units, buildings } = useGameStore();
  const [viewportOrigin, setViewportOrigin] = useState([0, 0]);
  const viewportWidth = Math.floor(width / 32) + 10;  // Dynamic viewport based on screen size
  const viewportHeight = Math.floor(height / 16) + 10;
  
  // Colors for different terrain types (WebPopulous style)
  const terrainColors = {
    land: '#007F00',
    ocean: '#0E27D6',
    left: '#009F00',
    right: '#005B00',
    up: '#00BF00',
    down: '#003F00'
  };
  
  // Calculate slope ID based on neighboring heights (from WebPopulous)
  const getSlopeId = (x: number, y: number): number => {
    if (!terrain || x < 0 || x >= terrain.length || y < 0 || y >= terrain[0].length) return 0;
    
    const h = terrain[x][y].height;
    const neighbors = {
      left: x > 0 ? terrain[x-1][y].height : h,
      right: x < terrain.length - 1 ? terrain[x+1][y].height : h,
      up: y > 0 ? terrain[x][y-1].height : h,
      down: y < terrain[0].length - 1 ? terrain[x][y+1].height : h
    };
    
    // WebPopulous slope calculation
    let slopeId = 0;
    if (neighbors.down > h) slopeId |= 1;
    if (neighbors.left > h) slopeId |= 2;
    if (neighbors.right > h) slopeId |= 4;
    if (neighbors.up > h) slopeId |= 8;
    
    return slopeId;
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !terrain) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw terrain tiles in isometric order (back to front)
    for (let y = 0; y < viewportHeight; y++) {
      for (let x = 0; x < viewportWidth; x++) {
        const worldX = x + viewportOrigin[0];
        const worldY = y + viewportOrigin[1];
        
        if (worldX >= 0 && worldX < terrain.length && worldY >= 0 && worldY < terrain[0].length) {
          const cell = terrain[worldX][worldY];
          const [screenX, screenY] = calcPos(x, y, cell.height, width, height);
          
          // Draw diamond tile (WebPopulous style)
          ctx.save();
          ctx.translate(screenX, screenY);
          
          // Get terrain color based on slope
          const slopeId = getSlopeId(worldX, worldY);
          let color = terrainColors.land;
          
          if (cell.type === 'water' || cell.height === 0) {
            color = terrainColors.ocean;
          } else if (slopeId !== 0) {
            // Use slope-based coloring
            const slopeColors = [
              terrainColors.land, terrainColors.down, terrainColors.left, terrainColors.down,
              terrainColors.right, terrainColors.down, terrainColors.right, terrainColors.down,
              terrainColors.up, terrainColors.left, terrainColors.up, terrainColors.left,
              terrainColors.up, terrainColors.right, terrainColors.up, terrainColors.land
            ];
            color = slopeColors[slopeId];
          }
          
          // Draw diamond shape
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -8);     // Top
          ctx.lineTo(16, 0);     // Right
          ctx.lineTo(0, 8);      // Bottom
          ctx.lineTo(-16, 0);    // Left
          ctx.closePath();
          ctx.fill();
          
          // Draw height shading
          if (cell.height > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, 8);      // Bottom
            ctx.lineTo(-16, 0);    // Left
            ctx.lineTo(-16, cell.height * 8);
            ctx.lineTo(0, 8 + cell.height * 8);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, 8);      // Bottom
            ctx.lineTo(16, 0);     // Right
            ctx.lineTo(16, cell.height * 8);
            ctx.lineTo(0, 8 + cell.height * 8);
            ctx.closePath();
            ctx.fill();
          }
          
          ctx.restore();
        }
      }
    }
    
    // Draw buildings
    buildings.forEach(building => {
      const x = building.position[0] - viewportOrigin[0];
      const y = building.position[1] - viewportOrigin[1];
      
      if (x >= 0 && x < viewportWidth && y >= 0 && y < viewportHeight) {
        const [screenX, screenY] = calcPos(x, y, terrain[building.position[0]][building.position[1]].height, width, height);
        
        ctx.fillStyle = building.civilizationId === 'player' ? '#FF4444' : '#4444FF';
        ctx.fillRect(screenX - 8, screenY - 16, 16, 16);
        
        // Draw flag
        ctx.fillStyle = building.civilizationId === 'player' ? '#FF0000' : '#0000FF';
        ctx.fillRect(screenX + 4, screenY - 24, 4, 8);
      }
    });
    
    // Draw units
    units.forEach(unit => {
      const x = unit.position[0] - viewportOrigin[0];
      const y = unit.position[1] - viewportOrigin[1];
      
      if (x >= 0 && x < viewportWidth && y >= 0 && y < viewportHeight) {
        const [screenX, screenY] = calcPos(x, y, terrain[unit.position[0]][unit.position[1]].height, width, height);
        
        ctx.fillStyle = unit.civilizationId === 'player' ? '#FF8888' : '#8888FF';
        ctx.beginPath();
        ctx.arc(screenX, screenY - 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw minimap
    const minimapSize = 100;
    const minimapX = 20;
    const minimapY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(minimapX - 2, minimapY - 2, minimapSize + 4, minimapSize + 4);
    
    // Draw minimap terrain
    for (let y = 0; y < terrain[0].length; y++) {
      for (let x = 0; x < terrain.length; x++) {
        const cell = terrain[x][y];
        const px = minimapX + (x / terrain.length) * minimapSize;
        const py = minimapY + (y / terrain[0].length) * minimapSize;
        
        ctx.fillStyle = cell.type === 'water' ? terrainColors.ocean : 
                       cell.height > 5 ? '#00FF00' :
                       cell.height > 2 ? '#00AA00' : '#007700';
        ctx.fillRect(px, py, Math.ceil(minimapSize / terrain.length), Math.ceil(minimapSize / terrain[0].length));
      }
    }
    
    // Draw viewport indicator on minimap
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      minimapX + (viewportOrigin[0] / terrain.length) * minimapSize,
      minimapY + (viewportOrigin[1] / terrain[0].length) * minimapSize,
      (viewportWidth / terrain.length) * minimapSize,
      (viewportHeight / terrain[0].length) * minimapSize
    );
    
  }, [terrain, units, buildings, viewportOrigin, width, height]);
  
  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on minimap
    if (x >= 20 && x <= 120 && y >= 20 && y <= 120) {
      const minimapX = x - 20;
      const minimapY = y - 20;
      const newX = Math.floor((minimapX / 100) * terrain.length - viewportWidth / 2);
      const newY = Math.floor((minimapY / 100) * terrain[0].length - viewportHeight / 2);
      
      setViewportOrigin([
        Math.max(0, Math.min(terrain.length - viewportWidth, newX)),
        Math.max(0, Math.min(terrain[0].length - viewportHeight, newY))
      ]);
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ 
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
      onMouseDown={handleMouseDown}
    />
  );
};