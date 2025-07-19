import React from 'react';
import { useGameStore } from '../stores/gameStore';
import WeatherEffects from './WeatherEffects';
import GodPowerEffects from './GodPowerEffects';

const EffectsRenderer: React.FC = () => {
  const { weather, activeEffects } = useGameStore();

  return (
    <group name="effects">
      <WeatherEffects weather={weather} />
      <GodPowerEffects effects={activeEffects} />
    </group>
  );
};

export default EffectsRenderer;