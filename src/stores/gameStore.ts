import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  GameStore, 
  GameConfig, 
  TerrainCell,
  Vector2,
  Weather,
  GamePhase,
  Difficulty,
  GameMode,
  GodPowerType,
  BuildingType
} from '../types/game';
import { generateTerrain } from '../game/terrain/generator';
import { createCivilization } from '../game/civilization/factory';

export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Game state
        terrain: [],
        civilizations: [],
        weather: Weather.CLEAR,
        activeEffects: [],
        mapSize: { x: 128, y: 128 },
        turnNumber: 0,
        gameTime: 0,
        timeOfDay: 12,
        isPaused: false,
        gameSpeed: 1,
        speed: 1,
        waterLevel: 0.2,
        playerId: 'player',
        selectedPower: null,
        faith: 100,
        resources: {
          food: 100,
          wood: 50,
          stone: 30,
          gold: 20,
          faith: 100,
          knowledge: 0
        },
        cameraPosition: { x: 0, y: 0, z: 0 },
        selectedUnits: [],
        difficulty: Difficulty.normal,
        gameMode: GameMode.SANDBOX,
        victoryConditions: [],
        statistics: {
          totalTime: 0,
          terrainsModified: 0,
          civilizationsCreated: 0,
          buildingsConstructed: 0,
          unitsCreated: 0,
          disastersUnleashed: 0,
          miraclesPerformed: 0,
          highestPopulation: 0,
          totalFaithGenerated: 0
        },
        achievements: [],
        phase: GamePhase.MENU,

        // Actions
        initializeGame: async (config: GameConfig) => {
          set((state) => {
            // Generate terrain
            state.terrain = generateTerrain(config.mapSize, { seed: config.seed });
            state.mapSize = config.mapSize;
            state.difficulty = config.difficulty;
            
            // Create initial civilizations
            const playerCiv = createCivilization({
              id: 'player',
              name: 'Divine Empire',
              color: '#4fc3f7',
              isPlayer: true,
              startPosition: { x: config.mapSize.x / 2, y: 0, z: config.mapSize.y / 2 }
            });
            
            state.civilizations = [playerCiv];
            state.phase = GamePhase.PLAYING;
          });
        },

        setPhase: (phase: GamePhase) => set((state) => {
          state.phase = phase;
        }),

        modifyTerrain: (x: number, y: number, modification: Partial<TerrainCell>) => set((state) => {
          if (state.terrain[x] && state.terrain[x][y]) {
            Object.assign(state.terrain[x][y], modification);
            state.statistics.terrainsModified++;
          }
        }),

        setSelectedPower: (power: GodPowerType | null) => set((state) => {
          state.selectedPower = power;
        }),

        usePower: (power: GodPowerType, position: Vector2) => set((state) => {
          const powerCost = getPowerCost(power);
          if (state.faith >= powerCost) {
            state.faith -= powerCost;
            
            // Apply power effects
            switch (power) {
              case GodPowerType.RAISE_LAND:
                if (state.terrain[position.x] && state.terrain[position.x][position.y]) {
                  state.terrain[position.x][position.y].height += 10;
                }
                break;
              case GodPowerType.LOWER_LAND:
                if (state.terrain[position.x] && state.terrain[position.x][position.y]) {
                  state.terrain[position.x][position.y].height -= 10;
                }
                break;
              // Add more power implementations
            }
            
            // Add visual effect
            state.activeEffects.push({
              id: `effect_${Date.now()}`,
              type: power,
              position: { x: position.x, y: 0, z: position.y },
              intensity: 1,
              duration: 2,
              color: 0xffffff
            });
            
            state.statistics.miraclesPerformed++;
          }
        }),

        setSpeed: (speed: number) => set((state) => {
          state.speed = speed;
          state.gameSpeed = speed;
        }),

        togglePause: () => set((state) => {
          state.isPaused = !state.isPaused;
          if (state.isPaused) {
            state.speed = 0;
          } else {
            state.speed = state.gameSpeed;
          }
        }),

        update: (deltaTime: number) => set((state) => {
          if (!state.isPaused) {
            state.gameTime += deltaTime;
            state.timeOfDay = (state.timeOfDay + deltaTime * 0.01) % 24;
            
            // Update effects
            state.activeEffects = state.activeEffects.filter(effect => {
              effect.duration -= deltaTime;
              return effect.duration > 0;
            });
            
            // Update civilizations
            state.civilizations.forEach(civ => {
              // Generate faith
              const templeCount = civ.buildings.filter(b => b.type === BuildingType.TEMPLE && b.isCompleted).length;
              state.faith += templeCount * 0.1 * deltaTime;
            });
          }
        })
      }))
    )
  )
);

function getPowerCost(power: GodPowerType): number {
  const costs: Record<GodPowerType, number> = {
    [GodPowerType.RAISE_LAND]: 10,
    [GodPowerType.LOWER_LAND]: 10,
    [GodPowerType.CREATE_WATER]: 15,
    [GodPowerType.CREATE_FOREST]: 20,
    [GodPowerType.CREATE_MOUNTAIN]: 25,
    [GodPowerType.FLATTEN]: 15,
    [GodPowerType.RAIN]: 20,
    [GodPowerType.DROUGHT]: 25,
    [GodPowerType.STORM]: 30,
    [GodPowerType.SPAWN_CIVILIZATION]: 50,
    [GodPowerType.BLESS]: 30,
    [GodPowerType.CURSE]: 30,
    [GodPowerType.DIVINE_INSPIRATION]: 100,
    [GodPowerType.EARTHQUAKE]: 40,
    [GodPowerType.VOLCANO]: 60,
    [GodPowerType.METEOR]: 80,
    [GodPowerType.FLOOD]: 50,
    [GodPowerType.PLAGUE]: 70
  };
  return costs[power] || 10;
}