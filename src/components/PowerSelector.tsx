import React from 'react';
import { GodPowerType } from '../types/game';

interface PowerSelectorProps {
  selectedPower: GodPowerType | null;
  onSelectPower: (power: GodPowerType | null) => void;
  faith: number;
}

const powers = [
  { type: GodPowerType.RAISE_LAND, name: 'Raise Land', icon: '⛰️', cost: 10 },
  { type: GodPowerType.LOWER_LAND, name: 'Lower Land', icon: '⬇️', cost: 10 },
  { type: GodPowerType.CREATE_WATER, name: 'Create Water', icon: '💧', cost: 15 },
  { type: GodPowerType.CREATE_FOREST, name: 'Create Forest', icon: '🌲', cost: 20 },
  { type: GodPowerType.CREATE_MOUNTAIN, name: 'Create Mountain', icon: '🏔️', cost: 25 },
  { type: GodPowerType.SPAWN_CIVILIZATION, name: 'Spawn Civilization', icon: '🏘️', cost: 50 },
  { type: GodPowerType.BLESS, name: 'Bless', icon: '✨', cost: 30 },
  { type: GodPowerType.CURSE, name: 'Curse', icon: '💀', cost: 30 },
  { type: GodPowerType.RAIN, name: 'Rain', icon: '🌧️', cost: 20 },
  { type: GodPowerType.DROUGHT, name: 'Drought', icon: '☀️', cost: 25 },
  { type: GodPowerType.EARTHQUAKE, name: 'Earthquake', icon: '🌍', cost: 40 },
  { type: GodPowerType.VOLCANO, name: 'Volcano', icon: '🌋', cost: 60 },
  { type: GodPowerType.METEOR, name: 'Meteor', icon: '☄️', cost: 80 },
  { type: GodPowerType.DIVINE_INSPIRATION, name: 'Divine Inspiration', icon: '💡', cost: 100 },
];

const PowerSelector: React.FC<PowerSelectorProps> = ({ selectedPower, onSelectPower, faith }) => {
  return (
    <div className="bg-black/50 backdrop-blur-md rounded-t-2xl p-4" style={{ position: 'relative', zIndex: 1100 }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">Divine Powers</h3>
        <div className="text-yellow-400 font-bold">
          ⚡ {faith.toFixed(0)} Faith
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {powers.map((power) => {
          const canAfford = faith >= power.cost;
          const isSelected = selectedPower === power.type;
          
          return (
            <button
              key={power.type}
              onClick={() => onSelectPower(isSelected ? null : power.type)}
              disabled={!canAfford}
              className={`
                relative p-3 rounded-lg transition-all duration-200
                ${isSelected 
                  ? 'bg-yellow-500 scale-110 shadow-lg' 
                  : canAfford
                    ? 'bg-white/20 hover:bg-white/30 hover:scale-105'
                    : 'bg-white/10 opacity-50 cursor-not-allowed'
                }
              `}
              title={`${power.name} (${power.cost} Faith)`}
            >
              <div className="text-2xl">{power.icon}</div>
              <div className="text-xs text-white mt-1">{power.cost}</div>
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
      
      {selectedPower && (
        <div className="mt-3 text-center text-white text-sm">
          Click on the terrain to use {powers.find(p => p.type === selectedPower)?.name}
        </div>
      )}
    </div>
  );
};

export default PowerSelector;