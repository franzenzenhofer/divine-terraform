import React from 'react';
import { useGameStore } from '../stores/gameStore';
import BuildingMesh from './BuildingMesh';
import UnitMesh from './UnitMesh';

const CivilizationRenderer: React.FC = () => {
  const { civilizations } = useGameStore();

  return (
    <group name="civilizations">
      {civilizations.map((civ) => (
        <group key={civ.id} name={`civilization-${civ.id}`}>
          {/* Render buildings */}
          {civ.buildings.map((building) => (
            <BuildingMesh key={building.id} building={building} civilization={civ} />
          ))}
          
          {/* Render units */}
          {civ.units.map((unit) => (
            <UnitMesh key={unit.id} unit={unit} civilization={civ} />
          ))}
        </group>
      ))}
    </group>
  );
};

export default CivilizationRenderer;