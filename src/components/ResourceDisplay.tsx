import React from 'react';
import { useGameStore } from '../stores/gameStore';

const ResourceDisplay: React.FC = () => {
  const { resources } = useGameStore();

  const resourceIcons = {
    food: '🌾',
    wood: '🪵',
    stone: '⛏️',
    faith: '⚡',
    knowledge: '📚',
    gold: '💰'
  };

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-lg p-3">
      <div className="flex gap-4 text-white">
        {Object.entries(resources).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="text-lg">{resourceIcons[key as keyof typeof resourceIcons]}</span>
            <span className="font-bold">{value.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceDisplay;