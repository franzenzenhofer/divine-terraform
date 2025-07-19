import { TerrainCell, TerrainType, Vector2 } from '../../types/game';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import seedrandom from 'seedrandom';

export interface TerrainConfig {
  seed?: number;
  octaves?: number;
  frequency?: number;
  amplitude?: number;
  persistence?: number;
  waterLevel?: number;
  mountainLevel?: number;
  forestDensity?: number;
}

interface TerrainGeneratorConfig {
  seed?: number;
  octaves?: number;
  frequency?: number;
  amplitude?: number;
  persistence?: number;
  waterLevel?: number;
  mountainLevel?: number;
  forestDensity?: number;
}

const defaultConfig: TerrainGeneratorConfig = {
  seed: Math.random() * 10000,
  octaves: 6,
  frequency: 0.02,
  amplitude: 40,
  persistence: 0.5,
  waterLevel: -5,
  mountainLevel: 20,
  forestDensity: 0.3,
};

export function generateTerrain(
  size: Vector2,
  config: TerrainConfig = {}
): TerrainCell[][] {
  const cfg = { ...defaultConfig, ...config };
  const terrain: TerrainCell[][] = [];
  
  // Create noise function with seed
  const rng = seedrandom(cfg.seed?.toString() || 'default');
  const noise2D = createNoise2D(rng);

  // Generate height map using Perlin noise
  for (let x = 0; x < size.x; x++) {
    terrain[x] = [];
    for (let y = 0; y < size.y; y++) {
      const height = generateHeight(x, y, cfg, noise2D);
      const moisture = generateMoisture(x, y, cfg, noise2D);
      const temperature = generateTemperature(x, y, size.y, cfg, noise2D);
      
      const terrainType = determineTerrainType(height, moisture, temperature, cfg);
      terrain[x][y] = {
        x,
        y,
        height,
        type: terrainType,
        moisture,
        temperature,
        fertility: calculateFertility(height, moisture, temperature),
        hasWater: height < cfg.waterLevel!,
        hasBuilding: false,
        walkable: isWalkable(terrainType),
        buildable: isBuildable(terrainType),
      };
    }
  }

  // Post-processing passes
  smoothTerrain(terrain, size, cfg);
  createRivers(terrain, size, cfg, rng);
  // addBiomeTransitions(terrain, size); // Disabled - has issues with deep copy

  return terrain;
}

function generateHeight(x: number, y: number, config: TerrainGeneratorConfig, noise2D: NoiseFunction2D): number {
  let height = 0;
  let amplitude = config.amplitude!;
  let frequency = config.frequency!;

  for (let i = 0; i < config.octaves!; i++) {
    height += noise2D(x * frequency, y * frequency) * amplitude;
    amplitude *= config.persistence!;
    frequency *= 2;
  }

  // Add some randomness (removed - using seeded noise only)

  // Create island effect (optional - makes edges lower)
  const centerX = 32;
  const centerY = 32;
  const maxDist = 32;
  const distX = Math.abs(x - centerX);
  const distY = Math.abs(y - centerY);
  const dist = Math.sqrt(distX * distX + distY * distY);
  const islandFactor = 1 - Math.min(dist / maxDist, 1);
  height *= 0.7 + islandFactor * 0.3;

  return height;
}

function generateMoisture(x: number, y: number, config: TerrainGeneratorConfig, noise2D: NoiseFunction2D): number {
  // Use different frequency for moisture
  let moisture = noise2D(
    x * config.frequency! * 1.5 + 1000,
    y * config.frequency! * 1.5 + 1000
  );
  
  // Normalize to 0-1
  moisture = (moisture + 1) * 0.5;
  
  return Math.max(0, Math.min(1, moisture));
}

function generateTemperature(
  x: number,
  y: number,
  mapHeight: number,
  config: TerrainGeneratorConfig,
  noise2D: NoiseFunction2D
): number {
  // Temperature decreases from equator (center) to poles (top/bottom)
  const latitudeFactor = Math.abs(y - mapHeight / 2) / (mapHeight / 2);
  let baseTemp = 1 - latitudeFactor; // 1 at equator, 0 at poles
  
  // Add some noise
  const tempNoise = noise2D(
    x * config.frequency! * 2 + 2000,
    y * config.frequency! * 2 + 2000
  ) * 0.1;
  
  return Math.max(0, Math.min(1, baseTemp + tempNoise));
}

function determineTerrainType(
  height: number,
  moisture: number,
  temperature: number,
  config: TerrainGeneratorConfig
): TerrainType {
  // Water and shallow water
  if (height < config.waterLevel!) {
    return TerrainType.WATER;
  } else if (height < config.waterLevel! + 2) {
    return TerrainType.SHALLOW_WATER;
  }
  
  // Mountain
  if (height > config.mountainLevel!) {
    if (temperature < 0.2) {
      return TerrainType.SNOW;
    }
    return TerrainType.MOUNTAIN;
  }
  
  // Rock (high elevation but not mountain)
  if (height > config.mountainLevel! * 0.7) {
    return TerrainType.ROCK;
  }
  
  // Desert (hot and dry)
  if (temperature > 0.8 && moisture < 0.2) {
    return TerrainType.DESERT;
  }
  
  // Sand (beach or dry areas)
  if (height < config.waterLevel! + 5 || moisture < 0.3) {
    return TerrainType.SAND;
  }
  
  // Snow (cold)
  if (temperature < 0.1) {
    return TerrainType.SNOW;
  }
  
  // Forest (moderate temp and high moisture)
  if (moisture > 0.6 && temperature > 0.3 && temperature < 0.7) {
    return TerrainType.FOREST;
  }
  
  // Default to grass
  return TerrainType.GRASS;
}

function calculateFertility(
  height: number,
  moisture: number,
  temperature: number
): number {
  // Optimal conditions for fertility
  const optimalHeight = 5;
  const optimalMoisture = 0.7;
  const optimalTemp = 0.6;
  
  // Calculate distance from optimal conditions
  const heightFactor = 1 - Math.abs(height - optimalHeight) / 50;
  const moistureFactor = moisture;
  const tempFactor = 1 - Math.abs(temperature - optimalTemp);
  
  // Combine factors
  const fertility = (heightFactor + moistureFactor + tempFactor) / 3;
  
  return Math.max(0, Math.min(100, fertility * 100));
}

function smoothTerrain(terrain: TerrainCell[][], size: Vector2, config: TerrainGeneratorConfig): void {
  // Apply smoothing filter to reduce harsh transitions
  const newHeights: number[][] = [];
  
  for (let x = 0; x < size.x; x++) {
    newHeights[x] = [];
    for (let y = 0; y < size.y; y++) {
      let totalHeight = 0;
      let count = 0;
      
      // Average with neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < size.x && ny >= 0 && ny < size.y) {
            totalHeight += terrain[nx][ny].height;
            count++;
          }
        }
      }
      
      newHeights[x][y] = totalHeight / count;
    }
  }
  
  // Apply smoothed heights and update terrain types
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      const oldHeight = terrain[x][y].height;
      terrain[x][y].height = oldHeight * 0.7 + newHeights[x][y] * 0.3;
      
      // Recalculate terrain type if height changed significantly
      if (Math.abs(terrain[x][y].height - oldHeight) > 1) {
        const newType = determineTerrainType(
          terrain[x][y].height,
          terrain[x][y].moisture,
          terrain[x][y].temperature,
          config
        );
        terrain[x][y].type = newType;
        terrain[x][y].walkable = isWalkable(newType);
        terrain[x][y].buildable = isBuildable(newType);
      }
    }
  }
}

function createRivers(
  terrain: TerrainCell[][],
  size: Vector2,
  config: TerrainGeneratorConfig,
  rng: seedrandom.PRNG
): void {
  // Simple river generation - start from mountains and flow downhill
  const riverSources: Vector2[] = [];
  
  // Find potential river sources (high elevation points)
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      if (terrain[x][y].height > config.mountainLevel! * 0.8 && rng() < 0.1) {
        riverSources.push({ x, y });
      }
    }
  }
  
  // Flow rivers from sources
  riverSources.forEach((source) => {
    let current = { ...source };
    const riverPath: Vector2[] = [current];
    const maxSteps = 100;
    let steps = 0;
    
    while (steps < maxSteps) {
      // Find lowest neighbor
      let lowestNeighbor = null;
      let lowestHeight = terrain[current.x][current.y].height;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          
          const nx = current.x + dx;
          const ny = current.y + dy;
          
          if (nx >= 0 && nx < size.x && ny >= 0 && ny < size.y) {
            const neighborHeight = terrain[nx][ny].height;
            if (neighborHeight < lowestHeight) {
              lowestHeight = neighborHeight;
              lowestNeighbor = { x: nx, y: ny };
            }
          }
        }
      }
      
      if (!lowestNeighbor || lowestHeight < config.waterLevel!) {
        break; // Reached water or no lower point
      }
      
      current = lowestNeighbor;
      riverPath.push(current);
      steps++;
    }
    
    // Create river
    riverPath.forEach((point) => {
      terrain[point.x][point.y].hasWater = true;
      terrain[point.x][point.y].moisture = 1; // Max moisture
      terrain[point.x][point.y].type = TerrainType.WATER;
      terrain[point.x][point.y].walkable = false;
      terrain[point.x][point.y].buildable = false;
      
      // Increase moisture around river
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = point.x + dx;
          const ny = point.y + dy;
          
          if (nx >= 0 && nx < size.x && ny >= 0 && ny < size.y) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            const moistureBonus = (1 - dist / 3) * 0.3;
            terrain[nx][ny].moisture = Math.min(1, terrain[nx][ny].moisture + moistureBonus);
          }
        }
      }
    });
  });
}

function isWalkable(type: TerrainType): boolean {
  return type !== TerrainType.WATER && type !== TerrainType.MOUNTAIN;
}

function isBuildable(type: TerrainType): boolean {
  const nonBuildableTypes = [
    TerrainType.WATER,
    TerrainType.SHALLOW_WATER,
    TerrainType.MOUNTAIN,
    TerrainType.SNOW
  ];
  return !nonBuildableTypes.includes(type);
}

function addBiomeTransitions(terrain: TerrainCell[][], size: Vector2): void {
  // Skip biome transitions for now - the JSON stringify/parse is causing issues with undefined values
  return;
  
  const transitionMap: TerrainCell[][] = JSON.parse(JSON.stringify(terrain));
  
  for (let x = 1; x < size.x - 1; x++) {
    for (let y = 1; y < size.y - 1; y++) {
      const currentType = terrain[x][y].type;
      const neighborTypes = new Map<TerrainType, number>();
      
      // Count neighbor types
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          
          const neighborType = terrain[x + dx][y + dy].type;
          neighborTypes.set(neighborType, (neighborTypes.get(neighborType) || 0) + 1);
        }
      }
      
      // If surrounded by different biome, consider transition
      neighborTypes.forEach((count, type) => {
        if (type !== currentType && count >= 5) {
          // Blend properties
          transitionMap[x][y].moisture = (terrain[x][y].moisture + terrain[x - 1][y].moisture) / 2;
          transitionMap[x][y].temperature = (terrain[x][y].temperature + terrain[x - 1][y].temperature) / 2;
        }
      });
    }
  }
  
  // Apply transitions
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      terrain[x][y].moisture = transitionMap[x][y].moisture;
      terrain[x][y].temperature = transitionMap[x][y].temperature;
    }
  }
}