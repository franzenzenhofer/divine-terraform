import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useGameStore } from '../gameStore';
import { GamePhase, Difficulty, GodPowerType, TerrainType, Weather } from '../../types/game';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
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
      phase: GamePhase.MENU,
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
    });
  });

  describe('initializeGame', () => {
    it('should initialize game with correct config', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.initializeGame({
          mapSize: { x: 64, y: 64 },
          playerName: 'Test Player',
          difficulty: Difficulty.hard,
          seed: 42
        });
      });

      expect(result.current.mapSize).toEqual({ x: 64, y: 64 });
      expect(result.current.difficulty).toBe(Difficulty.hard);
      expect(result.current.phase).toBe(GamePhase.PLAYING);
      expect(result.current.terrain).toHaveLength(64);
      expect(result.current.terrain[0]).toHaveLength(64);
    });

    it('should create player civilization', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.initializeGame({
          mapSize: { x: 32, y: 32 },
          playerName: 'Divine Player',
          difficulty: Difficulty.normal
        });
      });

      expect(result.current.civilizations).toHaveLength(1);
      expect(result.current.civilizations[0].id).toBe('player');
      expect(result.current.civilizations[0].isPlayer).toBe(true);
      expect(result.current.civilizations[0].name).toBe('Divine Empire');
    });
  });

  describe('setPhase', () => {
    it('should update game phase', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPhase(GamePhase.PLAYING);
      });

      expect(result.current.phase).toBe(GamePhase.PLAYING);
      
      act(() => {
        result.current.setPhase(GamePhase.VICTORY);
      });

      expect(result.current.phase).toBe(GamePhase.VICTORY);
    });
  });

  describe('modifyTerrain', () => {
    it('should modify terrain cell properties', async () => {
      const { result } = renderHook(() => useGameStore());
      
      // Initialize game first
      await act(async () => {
        await result.current.initializeGame({
          mapSize: { x: 10, y: 10 },
          playerName: 'Test',
          difficulty: Difficulty.normal
        });
      });

      const originalHeight = result.current.terrain[5][5].height;
      
      act(() => {
        result.current.modifyTerrain(5, 5, { 
          height: 75,
          type: TerrainType.MOUNTAIN 
        });
      });

      expect(result.current.terrain[5][5].height).toBe(75);
      expect(result.current.terrain[5][5].type).toBe(TerrainType.MOUNTAIN);
      expect(result.current.statistics.terrainsModified).toBe(1);
    });

    it('should handle out of bounds coordinates gracefully', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.initializeGame({
          mapSize: { x: 10, y: 10 },
          playerName: 'Test',
          difficulty: Difficulty.normal
        });
      });

      // Should not throw
      act(() => {
        result.current.modifyTerrain(100, 100, { height: 50 });
        result.current.modifyTerrain(-1, -1, { height: 50 });
      });

      expect(result.current.statistics.terrainsModified).toBe(0);
    });
  });

  describe('God Powers', () => {
    it('should select and deselect god power', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setSelectedPower(GodPowerType.RAISE_LAND);
      });

      expect(result.current.selectedPower).toBe(GodPowerType.RAISE_LAND);
      
      act(() => {
        result.current.setSelectedPower(null);
      });

      expect(result.current.selectedPower).toBeNull();
    });

    it('should use god power and consume faith', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.initializeGame({
          mapSize: { x: 10, y: 10 },
          playerName: 'Test',
          difficulty: Difficulty.normal
        });
      });

      const initialFaith = result.current.faith;
      const initialHeight = result.current.terrain[5][5].height;
      
      act(() => {
        result.current.usePower(GodPowerType.RAISE_LAND, { x: 5, y: 5 });
      });

      expect(result.current.faith).toBeLessThan(initialFaith);
      expect(result.current.terrain[5][5].height).toBeGreaterThan(initialHeight);
      expect(result.current.statistics.miraclesPerformed).toBe(1);
      expect(result.current.activeEffects).toHaveLength(1);
    });

    it('should not use power if insufficient faith', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.initializeGame({
          mapSize: { x: 10, y: 10 },
          playerName: 'Test',
          difficulty: Difficulty.normal
        });
      });

      // Set faith to 0 and reset statistics
      act(() => {
        useGameStore.setState({ 
          faith: 0,
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
          }
        });
      });

      const initialHeight = result.current.terrain[5][5].height;
      
      act(() => {
        result.current.usePower(GodPowerType.RAISE_LAND, { x: 5, y: 5 });
      });

      expect(result.current.faith).toBe(0);
      expect(result.current.terrain[5][5].height).toBe(initialHeight);
      expect(result.current.statistics.miraclesPerformed).toBe(0);
    });
  });

  describe('Game Speed and Pause', () => {
    it('should set game speed', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setSpeed(2);
      });

      expect(result.current.speed).toBe(2);
      expect(result.current.gameSpeed).toBe(2);
    });

    it('should toggle pause', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.isPaused).toBe(false);
      
      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.speed).toBe(0);
      
      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(false);
      expect(result.current.speed).toBe(result.current.gameSpeed);
    });
  });

  describe('update', () => {
    it('should update game time when not paused', () => {
      const { result } = renderHook(() => useGameStore());
      
      const initialTime = result.current.gameTime;
      
      act(() => {
        result.current.update(16); // 16ms frame
      });

      expect(result.current.gameTime).toBeGreaterThan(initialTime);
    });

    it('should not update when paused', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.togglePause();
      });

      const pausedTime = result.current.gameTime;
      
      act(() => {
        result.current.update(16);
      });

      expect(result.current.gameTime).toBe(pausedTime);
    });

    it('should remove expired effects', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Add effect with short duration
      act(() => {
        useGameStore.setState({
          activeEffects: [{
            id: 'test-effect',
            type: GodPowerType.RAISE_LAND,
            position: { x: 0, y: 0, z: 0 },
            intensity: 1,
            duration: 0.5,
            color: 0xffffff
          }]
        });
      });

      expect(result.current.activeEffects).toHaveLength(1);
      
      // Update with enough time to expire effect
      act(() => {
        result.current.update(1000); // 1 second
      });

      expect(result.current.activeEffects).toHaveLength(0);
    });
  });
});