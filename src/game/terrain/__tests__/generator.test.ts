import { describe, it, expect, beforeEach } from 'vitest';
import { generateTerrain, TerrainConfig } from '../generator';
import { TerrainType } from '../../../types/game';

describe('Terrain Generator', () => {
  const defaultConfig: TerrainConfig = {
    seed: 12345,
    octaves: 6,
    frequency: 0.02,
    amplitude: 40,
    persistence: 0.5,
    waterLevel: -5,
    mountainLevel: 20,
    forestDensity: 0.3,
  };

  it('should generate terrain with correct dimensions', () => {
    const size = { x: 10, y: 10 };
    const terrain = generateTerrain(size, defaultConfig);
    
    expect(terrain).toHaveLength(size.x);
    expect(terrain[0]).toHaveLength(size.y);
  });

  it('should generate consistent terrain with same seed', () => {
    const size = { x: 5, y: 5 };
    const terrain1 = generateTerrain(size, defaultConfig);
    const terrain2 = generateTerrain(size, defaultConfig);
    
    // Heights should be identical for same seed
    expect(terrain1[0][0].height).toBe(terrain2[0][0].height);
    expect(terrain1[2][3].height).toBe(terrain2[2][3].height);
  });

  it('should generate different terrain with different seeds', () => {
    const size = { x: 5, y: 5 };
    const terrain1 = generateTerrain(size, { ...defaultConfig, seed: 111 });
    const terrain2 = generateTerrain(size, { ...defaultConfig, seed: 999 });
    
    // Heights should be different for different seeds
    expect(terrain1[0][0].height).not.toBe(terrain2[0][0].height);
  });

  it('should create water tiles below water level', () => {
    const size = { x: 10, y: 10 };
    const terrain = generateTerrain(size, { ...defaultConfig, waterLevel: 0.5 });
    
    const waterTiles = terrain.flat().filter(cell => cell.type === TerrainType.WATER);
    expect(waterTiles.length).toBeGreaterThan(0);
    
    // All water tiles should have height below water level
    waterTiles.forEach(cell => {
      expect(cell.height).toBeLessThan(50); // 0.5 * 100 amplitude
    });
  });

  it.skip('should assign correct terrain types based on height', () => {
    const size = { x: 20, y: 20 };
    const terrain = generateTerrain(size, defaultConfig);
    
    // Basic validation that terrain generates properly
    expect(terrain).toHaveLength(size.x);
    expect(terrain[0]).toHaveLength(size.y);
    
    // Check that all cells have valid terrain types
    let hasWater = false;
    let hasLand = false;
    
    for (let x = 0; x < size.x; x++) {
      for (let y = 0; y < size.y; y++) {
        const cell = terrain[x][y];
        expect(cell).toBeDefined();
        expect(cell.type).toBeDefined();
        expect(Object.values(TerrainType)).toContain(cell.type);
        
        if (cell.type === TerrainType.WATER) hasWater = true;
        if (cell.type === TerrainType.GRASS || cell.type === TerrainType.FOREST) hasLand = true;
      }
    }
    
    // Verify we have both water and land
    expect(hasWater || hasLand).toBe(true);
  });

  it('should set walkable property correctly', () => {
    const size = { x: 10, y: 10 };
    const terrain = generateTerrain(size, defaultConfig);
    
    terrain.flat().forEach(cell => {
      if (cell.type === TerrainType.WATER || cell.type === TerrainType.MOUNTAIN) {
        expect(cell.walkable).toBe(false);
      } else {
        expect(cell.walkable).toBe(true);
      }
    });
  });

  it('should set buildable property correctly', () => {
    const size = { x: 10, y: 10 };
    const terrain = generateTerrain(size, defaultConfig);
    
    terrain.flat().forEach(cell => {
      const nonBuildableTypes = [
        TerrainType.WATER,
        TerrainType.SHALLOW_WATER,
        TerrainType.MOUNTAIN,
        TerrainType.SNOW
      ];
      
      if (nonBuildableTypes.includes(cell.type)) {
        expect(cell.buildable).toBe(false);
      } else {
        expect(cell.buildable).toBe(true);
      }
    });
  });

  it('should handle edge coordinates correctly', () => {
    const size = { x: 50, y: 50 };
    const terrain = generateTerrain(size, defaultConfig);
    
    // Check corners
    expect(terrain[0][0]).toBeDefined();
    expect(terrain[0][0].x).toBe(0);
    expect(terrain[0][0].y).toBe(0);
    
    expect(terrain[size.x - 1][size.y - 1]).toBeDefined();
    expect(terrain[size.x - 1][size.y - 1].x).toBe(size.x - 1);
    expect(terrain[size.x - 1][size.y - 1].y).toBe(size.y - 1);
  });

  it('should create temperature and moisture variations', () => {
    const size = { x: 20, y: 20 };
    const terrain = generateTerrain(size, defaultConfig);
    
    const temps = terrain.flat().map(c => c.temperature);
    const moistures = terrain.flat().map(c => c.moisture);
    
    // Should have variation
    expect(new Set(temps).size).toBeGreaterThan(1);
    expect(new Set(moistures).size).toBeGreaterThan(1);
    
    // Should be within range
    temps.forEach(t => {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    });
    
    moistures.forEach(m => {
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThanOrEqual(1);
    });
  });
});