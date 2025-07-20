import React, { useState, useEffect } from 'react';
import { PopulousIsometric } from '../game/rendering/PopulousIsometric';
import HUD from './HUD';
import { useGameStore } from '../stores/gameStore';

const GameContainer: React.FC = () => {
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  
  const { phase, usePower, faith, selectedPower } = useGameStore();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle canvas interaction with proper power usage
  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if we clicked on a UI element
    if (target.closest('.pointer-events-auto')) {
      return; // Let UI handle it
    }
    
    // The canvas will handle power usage through its own click handler
    // This is just for the container-level interaction
  };
  
  const getPointerCost = (power: string): number => {
    const costs: Record<string, number> = {
      'raise_land': 10,
      'lower_land': 10,
      'create_water': 15,
      'create_forest': 20,
      'create_mountain': 25,
      'spawn_civilization': 50,
      'bless': 30,
      'curse': 30,
      'rain': 20,
      'sunshine': 25,
      'earthquake': 40,
      'volcano': 60,
      'meteor': 80,
      'divine_inspiration': 100
    };
    return costs[power] || 0;
  };
  
  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      onMouseDown={handleCanvasClick}
      onTouchStart={handleCanvasClick}
    >
      {/* Canvas Layer - pointer-events only for canvas area */}
      <div className="absolute inset-0 z-0">
        <PopulousIsometric width={dimensions.width} height={dimensions.height} />
      </div>
      
      {/* HUD Layer - above canvas with proper pointer events */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <HUD />
      </div>
    </div>
  );
};

export default GameContainer;