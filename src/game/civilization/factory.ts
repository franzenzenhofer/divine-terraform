import { Civilization, Building, Unit, Vector3, BuildingType, UnitType, UnitState, CivilizationAlignment } from '../../types/game';

interface CivilizationConfig {
  id: string;
  name: string;
  color: string;
  isPlayer: boolean;
  startPosition: Vector3;
  alignment?: CivilizationAlignment;
}

export function createCivilization(config: CivilizationConfig): Civilization {
  const isPlayer = config.isPlayer;
  return {
    id: config.id,
    name: config.name,
    color: config.color,
    isPlayer: config.isPlayer,
    resources: {
      food: 100,
      wood: 50,
      stone: 30,
      gold: 20,
      faith: isPlayer ? 50 : 0,
      knowledge: 0
    },
    population: 10,
    maxPopulation: 20,
    faith: isPlayer ? 50 : 0,
    technology: [],
    buildings: [],
    units: [],
    happiness: 50,
    culture: 0,
    military: 0,
    alignment: config.alignment || CivilizationAlignment.NEUTRAL
  };
}

interface BuildingConfig {
  type: BuildingType;
  position: Vector3;
  civilizationId: string;
}

export function createBuilding(config: BuildingConfig): Building {
  return {
    id: `building_${Date.now()}_${Math.random()}`,
    type: config.type,
    position: config.position,
    level: 1,
    health: 100,
    maxHealth: 100,
    civilizationId: config.civilizationId,
    constructionProgress: 0,
    isActive: false,
    isCompleted: false,
    workforce: 0,
    maxWorkforce: getMaxWorkforce(config.type)
  };
}

interface UnitConfig {
  type: UnitType;
  position: Vector3;
  civilizationId: string;
}

export function createUnit(config: UnitConfig): Unit {
  return {
    id: `unit_${Date.now()}_${Math.random()}`,
    type: config.type,
    position: config.position,
    health: 100,
    maxHealth: 100,
    civilizationId: config.civilizationId,
    state: UnitState.IDLE,
    targetPosition: null,
    currentAction: null,
    level: 1,
    experience: 0,
    path: []
  };
}

function getMaxWorkforce(type: BuildingType): number {
  switch (type) {
    case BuildingType.FARM:
      return 4;
    case BuildingType.MINE:
    case BuildingType.QUARRY:
      return 6;
    case BuildingType.WORKSHOP:
      return 3;
    case BuildingType.TEMPLE:
      return 2;
    default:
      return 0;
  }
}