import { Civilization, TerrainCell, Position3D, BuildingType, CivilizationAlignment } from '../../types/game';
import { createCivilization } from './factory';

export interface SpawnConfig {
  minDistance: number;
  maxCivilizations: number;
  startingPopulation: number;
  startingBuildings: BuildingType[];
  alignmentWeights: Record<CivilizationAlignment, number>;
}

export interface SpawnLocation {
  position: Position3D;
  quality: number;
  biome: string;
}

export class CivilizationSpawner {
  private config: SpawnConfig;
  private terrain: TerrainCell[][];
  private worldSize: number;

  constructor(terrain: TerrainCell[][], config: Partial<SpawnConfig> = {}) {
    this.terrain = terrain;
    this.worldSize = terrain.length;
    
    this.config = {
      minDistance: 50,
      maxCivilizations: 4,
      startingPopulation: 20,
      startingBuildings: [BuildingType.HUT, BuildingType.HUT, BuildingType.TEMPLE],
      alignmentWeights: {
        [CivilizationAlignment.GOOD]: 0.3,
        [CivilizationAlignment.NEUTRAL]: 0.5,
        [CivilizationAlignment.EVIL]: 0.2,
      },
      ...config
    };
  }

  public findSpawnLocations(): SpawnLocation[] {
    const locations: SpawnLocation[] = [];
    const gridSize = 10;
    
    // Divide world into grid for initial search
    for (let gx = 0; gx < this.worldSize; gx += gridSize) {
      for (let gz = 0; gz < this.worldSize; gz += gridSize) {
        const quality = this.evaluateArea(gx, gz, gridSize);
        
        if (quality > 0.6) {
          const bestSpot = this.findBestSpotInArea(gx, gz, gridSize);
          if (bestSpot) {
            locations.push(bestSpot);
          }
        }
      }
    }
    
    // Sort by quality and filter by minimum distance
    locations.sort((a, b) => b.quality - a.quality);
    const filtered = this.filterByDistance(locations);
    
    return filtered.slice(0, this.config.maxCivilizations);
  }

  private evaluateArea(startX: number, startZ: number, size: number): number {
    let totalQuality = 0;
    let cellCount = 0;
    
    for (let x = startX; x < Math.min(startX + size, this.worldSize); x++) {
      for (let z = startZ; z < Math.min(startZ + size, this.worldSize); z++) {
        const cell = this.terrain[x][z];
        const quality = this.evaluateCell(cell);
        totalQuality += quality;
        cellCount++;
      }
    }
    
    return cellCount > 0 ? totalQuality / cellCount : 0;
  }

  private evaluateCell(cell: TerrainCell): number {
    let quality = 0;
    
    // Prefer grass and forest biomes
    if (cell.biome === 'grassland') quality += 0.4;
    else if (cell.biome === 'forest') quality += 0.3;
    else if (cell.biome === 'desert') quality += 0.1;
    else if (cell.biome === 'tundra') quality += 0.05;
    
    // Prefer moderate heights
    const idealHeight = 0.5;
    const heightDiff = Math.abs(cell.height - idealHeight);
    quality += (1 - heightDiff) * 0.3;
    
    // Prefer flat areas
    quality += (1 - cell.slope) * 0.3;
    
    // Avoid water
    if (cell.type === 'water') quality = 0;
    
    return Math.max(0, Math.min(1, quality));
  }

  private findBestSpotInArea(startX: number, startZ: number, size: number): SpawnLocation | null {
    let bestSpot: SpawnLocation | null = null;
    let bestQuality = 0;
    
    for (let x = startX; x < Math.min(startX + size, this.worldSize); x++) {
      for (let z = startZ; z < Math.min(startZ + size, this.worldSize); z++) {
        const cell = this.terrain[x][z];
        const quality = this.evaluateCell(cell);
        
        if (quality > bestQuality && this.hasEnoughFlatLand(x, z, 5)) {
          bestQuality = quality;
          bestSpot = {
            position: { x, y: cell.height * 10, z },
            quality,
            biome: cell.biome
          };
        }
      }
    }
    
    return bestSpot;
  }

  private hasEnoughFlatLand(centerX: number, centerZ: number, radius: number): boolean {
    let flatCells = 0;
    const requiredFlat = radius * radius * 0.6;
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const x = centerX + dx;
        const z = centerZ + dz;
        
        if (x >= 0 && x < this.worldSize && z >= 0 && z < this.worldSize) {
          const cell = this.terrain[x][z];
          if (cell.type !== 'water' && cell.slope < 0.3) {
            flatCells++;
          }
        }
      }
    }
    
    return flatCells >= requiredFlat;
  }

  private filterByDistance(locations: SpawnLocation[]): SpawnLocation[] {
    const filtered: SpawnLocation[] = [];
    
    for (const location of locations) {
      let tooClose = false;
      
      for (const existing of filtered) {
        const dx = location.position.x - existing.position.x;
        const dz = location.position.z - existing.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < this.config.minDistance) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        filtered.push(location);
      }
    }
    
    return filtered;
  }

  private selectAlignment(): CivilizationAlignment {
    const weights = this.config.alignmentWeights;
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let random = Math.random() * total;
    
    for (const [alignment, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return alignment as CivilizationAlignment;
      }
    }
    
    return CivilizationAlignment.NEUTRAL;
  }

  public spawnCivilizations(existingCivilizations: Civilization[]): Civilization[] {
    const locations = this.findSpawnLocations();
    const newCivilizations: Civilization[] = [];
    
    locations.forEach((location, index) => {
      const alignment = this.selectAlignment();
      const id = `civ_${Date.now()}_${index}`;
      
      const civilization = createCivilization({
        id,
        name: this.generateCivilizationName(location.biome, alignment),
        isPlayer: false,
        startingPopulation: this.config.startingPopulation,
        color: this.generateColor(alignment),
        alignment
      });
      
      // Set spawn position
      civilization.centerPosition = location.position;
      
      newCivilizations.push(civilization);
    });
    
    return newCivilizations;
  }

  private generateCivilizationName(biome: string, alignment: CivilizationAlignment): string {
    const prefixes = {
      [CivilizationAlignment.GOOD]: ['Blessed', 'Holy', 'Divine', 'Radiant'],
      [CivilizationAlignment.NEUTRAL]: ['Ancient', 'Mystic', 'Elder', 'Wise'],
      [CivilizationAlignment.EVIL]: ['Dark', 'Shadow', 'Cursed', 'Forsaken']
    };
    
    const suffixes = {
      grassland: ['Plains', 'Fields', 'Meadows', 'Pastures'],
      forest: ['Woods', 'Grove', 'Glade', 'Thicket'],
      desert: ['Sands', 'Dunes', 'Oasis', 'Wastes'],
      tundra: ['Frost', 'Ice', 'Snow', 'Glacier'],
      mountain: ['Peak', 'Summit', 'Heights', 'Cliffs']
    };
    
    const alignmentPrefixes = prefixes[alignment];
    const biomeSuffixes = suffixes[biome] || suffixes.grassland;
    
    const prefix = alignmentPrefixes[Math.floor(Math.random() * alignmentPrefixes.length)];
    const suffix = biomeSuffixes[Math.floor(Math.random() * biomeSuffixes.length)];
    
    return `${prefix} ${suffix}`;
  }

  private generateColor(alignment: CivilizationAlignment): string {
    const colors = {
      [CivilizationAlignment.GOOD]: [
        '#4fc3f7', '#29b6f6', '#03a9f4', '#039be5',
        '#81c784', '#66bb6a', '#4caf50', '#43a047'
      ],
      [CivilizationAlignment.NEUTRAL]: [
        '#ffd54f', '#ffca28', '#ffc107', '#ffb300',
        '#bcaaa4', '#a1887f', '#8d6e63', '#795548'
      ],
      [CivilizationAlignment.EVIL]: [
        '#ef5350', '#f44336', '#e53935', '#d32f2f',
        '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2'
      ]
    };
    
    const alignmentColors = colors[alignment];
    return alignmentColors[Math.floor(Math.random() * alignmentColors.length)];
  }
}