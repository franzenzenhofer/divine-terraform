// Modern TypeScript implementation of the WebPopulous game engine
// Forked from https://github.com/msakuta/WebPopulous

import { TerrainCell, Unit, Building, Civilization, TerrainType, UnitType } from '../../types/game';

export interface PopulousCell extends TerrainCell {
  farms?: number;
  amount?: number; // Population amount for houses
  growthRate?: number;
}

export interface PopulousUnit extends Omit<Unit, 'destination' | 'state'> {
  destination: [number, number] | null;
  state: 'idle' | 'moving' | 'building' | 'gathering';
  direction: 'forward' | 'back' | 'left' | 'right' | 'stand';
}

export class PopulousEngine {
  private cells: PopulousCell[][];
  private units: PopulousUnit[] = [];
  private frameCount: number = 0;
  private time: number = 0;
  private paused: boolean = false;
  
  // Random number generator (xorshift from WebPopulous)
  private rng: XorShift;
  
  constructor(private width: number, private height: number) {
    this.rng = new XorShift();
    this.cells = this.initializeTerrain();
  }
  
  private initializeTerrain(): PopulousCell[][] {
    const cells: PopulousCell[][] = [];
    
    for (let x = 0; x < this.width; x++) {
      cells[x] = [];
      for (let y = 0; y < this.height; y++) {
        let h = this.rng.nextInt() % 16 - 8;
        
        // Smooth terrain by constraining to neighbors (from WebPopulous)
        if (x > 0) {
          h = this.clamp(h, cells[x-1][y].height + 1, cells[x-1][y].height - 1);
        }
        if (y > 0) {
          h = this.clamp(h, cells[x][y-1].height + 1, cells[x][y-1].height - 1);
        }
        if (x > 0 && y + 1 < this.height) {
          h = this.clamp(h, cells[x-1][y+1].height + 1, cells[x-1][y+1].height - 1);
        }
        if (x > 0 && y > 0) {
          h = this.clamp(h, cells[x-1][y-1].height + 1, cells[x-1][y-1].height - 1);
        }
        
        cells[x][y] = {
          x,
          y,
          height: h / 16, // Normalize to 0-1 range
          type: h < -3 ? TerrainType.WATER : TerrainType.LAND,
          biome: h > 5 ? 'mountain' : h > 2 ? 'grassland' : h > -2 ? 'forest' : 'desert',
          slope: 0,
          temperature: 0.5,
          moisture: 0.5,
          vegetation: 0.5,
          fertility: 0.5,
          hasWater: h < -3,
          hasBuilding: false,
          walkable: h >= -3,
          buildable: h >= -3,
          farms: 0
        };
      }
    }
    
    return cells;
  }
  
  // Update cell (house growth from WebPopulous)
  private updateCell(cell: PopulousCell, x: number, y: number, dt: number): void {
    if (cell.type === TerrainType.BUILDING && cell.amount !== undefined) {
      const growth = this.getGrowthRate(cell) * dt / 1000;
      cell.amount = this.clamp(cell.amount + growth, this.getCapacity(cell), 0);
      
      // Spawn unit when house is full
      if (cell.amount >= this.getCapacity(cell)) {
        this.spawnUnit(x, y, cell.amount / 2);
        cell.amount /= 2;
      }
    }
  }
  
  // Calculate growth rate based on farms (from WebPopulous)
  private getGrowthRate(cell: PopulousCell): number {
    return this.getCapacity(cell) / 25;
  }
  
  // Calculate capacity based on farms (from WebPopulous formula)
  private getCapacity(cell: PopulousCell): number {
    const farms = cell.farms || 0;
    if (farms === 48) return 4500;
    if (farms > 24) return 100 * farms - 650;
    if (farms > 8) return 75 * farms + 50;
    return 50 * (farms + 3);
  }
  
  // Update unit movement and behavior (from WebPopulous)
  private updateUnit(unit: PopulousUnit, dt: number): boolean {
    const ix = Math.floor(unit.position.x);
    const iy = Math.floor(unit.position.z);
    
    // Merge units if they meet
    for (const other of this.units) {
      if (other !== unit && 
          Math.floor(other.position.x) === ix && 
          Math.floor(other.position.z) === iy) {
        other.health += unit.health;
        return false; // Remove this unit
      }
    }
    
    // Environment damage
    const damage = unit.health < 500 ? 5 : unit.health / 100;
    unit.health -= damage * dt / 1000;
    if (unit.health <= 0) return false;
    
    // Movement logic
    if (unit.destination) {
      const [destX, destY] = unit.destination;
      if (ix === destX && iy === destY) {
        unit.destination = null;
      } else {
        // Move towards destination
        const dx = destX + 0.5 - unit.position.x;
        const dy = destY + 0.5 - unit.position.z;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        unit.position.x += (dx / len) * dt / 1000;
        unit.position.z += (dy / len) * dt / 1000;
        
        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
          unit.direction = dx > 0 ? 'right' : 'left';
        } else {
          unit.direction = dy > 0 ? 'forward' : 'back';
        }
      }
    } else {
      // Find place to build house
      const vacancy = this.findVacancy(ix, iy);
      if (vacancy) {
        unit.destination = vacancy;
      } else {
        // Random walk
        unit.destination = [
          Math.floor(unit.position.x + 2 * (this.rng.next() - 0.5)),
          Math.floor(unit.position.z + 2 * (this.rng.next() - 0.5))
        ];
      }
    }
    
    // Try to build house
    const cell = this.cells[ix]?.[iy];
    if (cell && this.isFlat(ix, iy) && cell.height > 0 && cell.type === TerrainType.LAND) {
      cell.type = TerrainType.BUILDING;
      cell.amount = unit.health;
      this.updateHouseFarms(ix, iy);
      return false; // Remove unit
    }
    
    return true;
  }
  
  // Find suitable building location (from WebPopulous)
  private findVacancy(centerX: number, centerY: number): [number, number] | null {
    let best = 10 * 10;
    let vacancy: [number, number] | null = null;
    
    this.forAdjacents(centerX, centerY, 3 * 2, (x, y) => {
      const cell = this.cells[x]?.[y];
      if (cell && this.isFlat(x, y) && cell.height > 0 && cell.type === TerrainType.LAND) {
        const dist = Math.sqrt((centerX - x) ** 2 + (centerY - y) ** 2);
        if (dist < best) {
          best = dist;
          vacancy = [x, y];
        }
      }
      return true;
    });
    
    return vacancy;
  }
  
  // Check if terrain is flat (from WebPopulous)
  private isFlat(x: number, y: number): boolean {
    if (x < 1 || x >= this.width - 1 || y < 1 || y >= this.height - 1) {
      return false;
    }
    
    const centerHeight = this.cells[x][y].height;
    const tolerance = 0.1;
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const adjHeight = this.cells[x + dx][y + dy].height;
        if (Math.abs(adjHeight - centerHeight) > tolerance) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // Iterate adjacent cells (from WebPopulous)
  private forAdjacents(
    centerX: number, 
    centerY: number, 
    radius: number,
    callback: (x: number, y: number) => boolean
  ): void {
    const minX = Math.max(0, centerX - radius);
    const minY = Math.max(0, centerY - radius);
    const maxX = Math.min(this.width - 2, centerX + radius);
    const maxY = Math.min(this.height - 2, centerY + radius);
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (!callback(x, y)) return;
      }
    }
  }
  
  // Update farms around house (from WebPopulous)
  private updateHouseFarms(houseX: number, houseY: number): void {
    let farms = 0;
    
    this.forAdjacents(houseX, houseY, 3, (x, y) => {
      const cell = this.cells[x]?.[y];
      if (cell && cell.type === TerrainType.LAND && this.isFlat(x, y)) {
        farms++;
      }
      return true;
    });
    
    const houseCell = this.cells[houseX][houseY];
    if (houseCell) {
      houseCell.farms = farms;
    }
  }
  
  // Spawn a new unit
  private spawnUnit(x: number, y: number, health: number): void {
    const unit: PopulousUnit = {
      id: `unit_${Date.now()}_${this.units.length}`,
      civilizationId: 'player', // TODO: Support multiple civilizations
      type: UnitType.WALKER,
      position: { x: x + 0.5, y: 0, z: y + 0.5 },
      health,
      maxHealth: 1000,
      speed: 1,
      attackPower: 10,
      state: 'idle',
      destination: null,
      direction: 'stand',
      level: 1,
      targetPosition: null,
      currentAction: null,
      experience: 0
    };
    
    this.units.push(unit);
  }
  
  // Main update loop
  public update(dt: number): void {
    if (this.paused) return;
    
    this.time += dt;
    this.frameCount++;
    
    // Update all cells
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.updateCell(this.cells[x][y], x, y, dt);
      }
    }
    
    // Update all units
    this.units = this.units.filter(unit => this.updateUnit(unit, dt));
  }
  
  // Utility functions
  private clamp(value: number, max: number, min: number): number {
    return value < min ? min : value > max ? max : value;
  }
  
  // Getters
  public getCells(): PopulousCell[][] {
    return this.cells;
  }
  
  public getUnits(): PopulousUnit[] {
    return this.units;
  }
  
  public pause(): void {
    this.paused = true;
  }
  
  public resume(): void {
    this.paused = false;
  }
}

// XorShift random number generator (from WebPopulous)
class XorShift {
  private x: number = 123456789;
  private y: number = 362436069;
  private z: number = 521288629;
  private w: number = 88675123;
  
  public next(): number {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    return this.w / 0x100000000 + 0.5;
  }
  
  public nextInt(): number {
    return Math.floor(this.next() * 0x100000000);
  }
}