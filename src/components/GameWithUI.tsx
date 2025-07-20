import React, { useState, useEffect, useRef } from 'react';
import { PopulousIsometric } from '../game/rendering/PopulousIsometric';
import HUD from './HUD';
import './GameCanvas.css';
import { useGameStore } from '../stores/gameStore';

interface GameWithUIProps {
  width: number;
  height: number;
}

const GameWithUI: React.FC<GameWithUIProps> = ({ width, height }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { terrain, modifyTerrain, selectedPower, usePower } = useGameStore();

  // Handle canvas clicks through a transparent overlay
  const handleGameClick = (e: React.MouseEvent) => {
    // Get click position
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if we clicked on a UI element
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element?.tagName === 'BUTTON' || 
        element?.closest('button') || 
        element?.closest('.pointer-events-auto')) {
      // UI element was clicked, don't process game click
      return;
    }

    // Process game click - dispatch to canvas
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const event = new MouseEvent('mousedown', {
        clientX: e.clientX,
        clientY: e.clientY,
        button: e.button,
        bubbles: true
      });
      canvas.dispatchEvent(event);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Game Canvas Layer */}
      <div 
        ref={canvasContainerRef}
        className="game-canvas-wrapper"
        onMouseDown={handleGameClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="game-canvas">
          <PopulousIsometric width={width} height={height} />
        </div>
      </div>
      
      {/* UI Layer - ensure it's above canvas */}
      <div className="ui-layer">
        <HUD />
      </div>
    </div>
  );
};

export default GameWithUI;