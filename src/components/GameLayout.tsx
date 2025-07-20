import React from 'react';
import { PopulousIsometric } from '../game/rendering/PopulousIsometric';
import HUD from './HUD';

interface GameLayoutProps {
  width: number;
  height: number;
}

const GameLayout: React.FC<GameLayoutProps> = ({ width, height }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Canvas background - pointer-events-none so UI can be clicked */}
      <div className="absolute inset-0 pointer-events-none">
        <PopulousIsometric width={width} height={height} />
      </div>
      
      {/* Interaction layer for canvas clicks */}
      <div 
        className="absolute inset-0" 
        style={{ zIndex: 1 }}
        onClick={(e) => {
          // Check if we clicked on UI
          const target = e.target as HTMLElement;
          if (target.closest('.pointer-events-auto')) {
            return;
          }
          
          // Otherwise, send click to canvas
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const event = new MouseEvent('mousedown', {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true
            });
            canvas.dispatchEvent(event);
          }
        }}
      />
      
      {/* HUD overlay */}
      <HUD />
    </div>
  );
};

export default GameLayout;