import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GodPowerType } from '../types/game';
import PowerSelector from './PowerSelector';
import ResourceDisplay from './ResourceDisplay';
import MiniMap from './MiniMap';

const HUD: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { 
    selectedPower, 
    setSelectedPower, 
    faith, 
    civilizations,
    timeOfDay,
    speed,
    setSpeed,
    togglePause
  } = useGameStore();

  const totalPopulation = civilizations.reduce((sum, civ) => sum + civ.population, 0);

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4" style={{ zIndex: 1001 }}>
        <div className="flex justify-between items-start">
          {/* Resources */}
          <div className="pointer-events-auto">
            <ResourceDisplay />
          </div>
          
          {/* Time Controls */}
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 pointer-events-auto">
            <div className="flex items-center gap-3 text-white">
              <button
                onClick={togglePause}
                className="min-w-[44px] min-h-[44px] p-3 hover:bg-white/20 rounded transition-colors text-xl"
                title={speed === 0 ? "Play" : "Pause"}
              >
                {speed === 0 ? '▶️' : '⏸️'}
              </button>
              
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded transition-colors ${
                      speed === s ? 'bg-white/30' : 'hover:bg-white/20'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              
              <div className="ml-3 text-sm">
                <div>Day {Math.floor(timeOfDay / 24) + 1}</div>
                <div className="text-xs opacity-75">
                  {Math.floor(timeOfDay % 24)}:00
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Button */}
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="min-w-[44px] min-h-[44px] bg-black/50 backdrop-blur-md rounded-lg p-3 text-white hover:bg-black/60 transition-colors text-xl"
            >
              ☰
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom UI */}
      <div className="absolute bottom-0 left-0 right-0 p-4" style={{ zIndex: 1001 }}>
        <div className="flex justify-between items-end">
          {/* MiniMap */}
          <div className="pointer-events-auto">
            <MiniMap />
          </div>
          
          {/* Power Selector */}
          <div className="pointer-events-auto">
            <PowerSelector 
              selectedPower={selectedPower}
              onSelectPower={setSelectedPower}
              faith={faith}
            />
          </div>
          
          {/* Stats */}
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 text-white pointer-events-auto">
            <div className="text-sm space-y-1">
              <div className="flex justify-between gap-4">
                <span className="opacity-75">Population:</span>
                <span className="font-bold">{totalPopulation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="opacity-75">Civilizations:</span>
                <span className="font-bold">{civilizations.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="opacity-75">Faith/min:</span>
                <span className="font-bold text-yellow-400">
                  +{civilizations.reduce((sum, civ) => 
                    sum + civ.buildings.filter(b => b.isCompleted).length * 10, 
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Side Menu */}
      {showMenu && (
        <div className="absolute top-16 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white pointer-events-auto" style={{ zIndex: 1002 }}>
          <h3 className="text-lg font-bold mb-3">Menu</h3>
          <div className="space-y-2">
            <button className="block w-full text-left p-2 hover:bg-white/20 rounded transition-colors">
              Save Game
            </button>
            <button className="block w-full text-left p-2 hover:bg-white/20 rounded transition-colors">
              Load Game
            </button>
            <button className="block w-full text-left p-2 hover:bg-white/20 rounded transition-colors">
              Settings
            </button>
            <button className="block w-full text-left p-2 hover:bg-white/20 rounded transition-colors">
              Help
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="block w-full text-left p-2 hover:bg-white/20 rounded transition-colors text-red-400"
            >
              Exit to Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HUD;