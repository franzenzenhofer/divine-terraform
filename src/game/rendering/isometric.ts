import * as THREE from 'three';
import { TerrainCell, Unit, Building, Position3D, TerrainType } from '../../types/game';

export interface IsometricConfig {
  tileWidth: number;
  tileHeight: number;
  heightScale: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface IsometricSprite {
  mesh: THREE.Mesh | THREE.Sprite;
  position: Position3D;
  type: 'terrain' | 'unit' | 'building' | 'cursor';
}

export class IsometricRenderer {
  private config: IsometricConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private terrain: TerrainCell[][];
  private sprites: Map<string, IsometricSprite> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  
  // Viewport origin and size (from WebPopulous)
  private viewportOrigin: [number, number] = [0, 0];
  private viewportWidth: number = 20;
  private viewportHeight: number = 20;

  constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera, terrain: TerrainCell[][], config?: Partial<IsometricConfig>) {
    this.scene = scene;
    this.camera = camera;
    this.terrain = terrain;
    
    this.config = {
      tileWidth: 32,    // WebPopulous uses 32x16 diamond tiles
      tileHeight: 16,   // Classic isometric 2:1 ratio
      heightScale: 8,   // 8 pixels per height unit (from WebPopulous)
      viewportWidth: 800,
      viewportHeight: 600,
      ...config
    };
    
    this.initMaterials();
  }

  private initMaterials(): void {
    // Create terrain materials based on WebPopulous's grass texture frames
    const grassColors = [
      0x4CAF50, // Normal grass
      0x66BB6A, // Light grass
      0x388E3C, // Dark grass
      0x2E7D32, // Very dark grass
      0x81C784, // Bright grass
      0x43A047, // Medium grass
    ];
    
    grassColors.forEach((color, index) => {
      const material = new THREE.MeshPhongMaterial({
        color,
        flatShading: true,
        shininess: 0,
      });
      this.materials.set(`grass_${index}`, material);
    });
    
    // Ocean material
    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x0288D1,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
    });
    this.materials.set('ocean', oceanMaterial);
    
    // Building materials
    const houseMaterial = new THREE.MeshPhongMaterial({
      color: 0x8D6E63,
      flatShading: true,
    });
    this.materials.set('house', houseMaterial);
  }

  // Convert logical position to isometric screen position (from WebPopulous)
  public logicalToScreen(x: number, y: number, height: number = 0): Position3D {
    const screenX = this.config.viewportWidth / 2 + x * this.config.tileWidth / 2 - y * this.config.tileWidth / 2;
    const screenY = this.config.viewportHeight - this.config.tileHeight * 20 + 
                   x * this.config.tileHeight / 2 + y * this.config.tileHeight / 2 - 
                   height * this.config.heightScale;
    
    return { x: screenX, y: screenY, z: 0 };
  }

  // Convert screen position to logical position (from WebPopulous)
  public screenToLogical(screenX: number, screenY: number): [number, number] {
    const pos = [screenX, screenY];
    pos[0] -= this.config.viewportWidth / 2;
    pos[1] -= this.config.viewportHeight - this.config.tileHeight * 20 - this.config.tileHeight;
    
    const logicalX = Math.floor((pos[0] / 2 + pos[1]) / this.config.tileHeight + this.viewportOrigin[0]);
    const logicalY = Math.floor((pos[1] - pos[0] / 2) / this.config.tileHeight + this.viewportOrigin[1]);
    
    // Clamp to viewport bounds
    const clampedX = Math.max(this.viewportOrigin[0], 
                             Math.min(this.viewportOrigin[0] + this.viewportWidth, logicalX));
    const clampedY = Math.max(this.viewportOrigin[1], 
                             Math.min(this.viewportOrigin[1] + this.viewportHeight, logicalY));
    
    return [clampedX, clampedY];
  }

  // Create isometric tile mesh (WebPopulous-style diamond shape)
  private createTileMesh(x: number, y: number, cell: TerrainCell): THREE.Mesh {
    // Create diamond-shaped geometry for isometric tile
    const shape = new THREE.Shape();
    const hw = this.config.tileWidth / 2;  // half width
    const hh = this.config.tileHeight / 2; // half height
    
    // Draw diamond shape (clockwise from top)
    shape.moveTo(0, -hh);      // Top point
    shape.lineTo(hw, 0);       // Right point
    shape.lineTo(0, hh);       // Bottom point
    shape.lineTo(-hw, 0);      // Left point
    shape.closePath();
    
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Select material based on height and type
    let material: THREE.Material;
    if (cell.type === TerrainType.WATER || cell.type === TerrainType.SHALLOW_WATER) {
      material = this.materials.get('ocean')!;
    } else if (cell.type === TerrainType.BUILDING) {
      material = this.materials.get('house')!;
    } else {
      // Use different grass textures based on height
      const grassIndex = Math.floor(cell.height * 6);
      material = this.materials.get(`grass_${Math.min(5, grassIndex)}`)!;
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position in isometric space (WebPopulous style)
    const screenPos = this.logicalToScreen(x, y, cell.height);
    mesh.position.set(screenPos.x, screenPos.y, screenPos.z);
    
    // No rotation needed - diamond is already in correct orientation
    
    return mesh;
  }

  // Update visible terrain tiles
  public updateViewport(cameraX: number, cameraZ: number): void {
    // Update viewport origin based on camera position
    this.viewportOrigin[0] = Math.floor(cameraX - this.viewportWidth / 2);
    this.viewportOrigin[1] = Math.floor(cameraZ - this.viewportHeight / 2);
    
    // Clear existing terrain sprites
    this.sprites.forEach((sprite, key) => {
      if (sprite.type === 'terrain') {
        this.scene.remove(sprite.mesh);
        this.sprites.delete(key);
      }
    });
    
    // Render visible terrain tiles
    for (let x = 0; x < this.viewportWidth; x++) {
      for (let y = 0; y < this.viewportHeight; y++) {
        const worldX = this.viewportOrigin[0] + x;
        const worldY = this.viewportOrigin[1] + y;
        
        if (worldX >= 0 && worldX < this.terrain.length && 
            worldY >= 0 && worldY < this.terrain[0].length) {
          const cell = this.terrain[worldX][worldY];
          const mesh = this.createTileMesh(worldX, worldY, cell);
          
          this.scene.add(mesh);
          this.sprites.set(`terrain_${worldX}_${worldY}`, {
            mesh,
            position: { x: worldX, y: cell.height, z: worldY },
            type: 'terrain'
          });
        }
      }
    }
  }

  // Create unit sprite (based on WebPopulous man sprite)
  public createUnitSprite(unit: Unit): THREE.Sprite {
    const material = new THREE.SpriteMaterial({
      color: unit.civilizationId === 'player' ? 0x4FC3F7 : 0xFF5252,
      sizeAttenuation: false
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(16, 16, 1);
    
    // Position at unit location
    const cell = this.terrain[Math.floor(unit.position.x)][Math.floor(unit.position.z)];
    const screenPos = this.logicalToScreen(unit.position.x, unit.position.z, cell.height);
    sprite.position.set(screenPos.x, screenPos.y, 0.1);
    
    return sprite;
  }

  // Create building mesh (based on WebPopulous house)
  public createBuildingMesh(building: Building): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(
      this.config.tileWidth * 0.8,
      this.config.tileWidth * 0.8,
      this.config.tileWidth * 0.6
    );
    
    const material = this.materials.get('house')!.clone();
    if (building.civilizationId !== 'player') {
      (material as THREE.MeshPhongMaterial).color.setHex(0xB71C1C);
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position at building location
    const cell = this.terrain[building.position.x][building.position.z];
    const screenPos = this.logicalToScreen(building.position.x, building.position.z, cell.height);
    mesh.position.set(screenPos.x, screenPos.y + 10, 0.05);
    
    return mesh;
  }

  // Check if a position is flat (from WebPopulous)
  public isFlat(x: number, y: number): boolean {
    if (x < 1 || x >= this.terrain.length - 1 || 
        y < 1 || y >= this.terrain[0].length - 1) {
      return false;
    }
    
    const centerHeight = this.terrain[x][y].height;
    const tolerance = 0.1;
    
    // Check all adjacent cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const adjHeight = this.terrain[x + dx][y + dy].height;
        if (Math.abs(adjHeight - centerHeight) > tolerance) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Find adjacent cells (from WebPopulous forAdjacents)
  public forAdjacents(
    centerX: number, 
    centerY: number, 
    maxX: number, 
    maxY: number, 
    radius: number,
    callback: (x: number, y: number) => boolean
  ): void {
    const minX = Math.max(0, centerX - radius);
    const minY = Math.max(0, centerY - radius);
    const boundMaxX = Math.min(maxX, centerX + radius + 1);
    const boundMaxY = Math.min(maxY, centerY + radius + 1);
    
    for (let x = minX; x < boundMaxX; x++) {
      for (let y = minY; y < boundMaxY; y++) {
        if (!callback(x, y)) return;
      }
    }
  }

  // Update cursor position
  public updateCursor(screenX: number, screenY: number): void {
    const [logicalX, logicalY] = this.screenToLogical(screenX, screenY);
    
    // Remove old cursor
    const oldCursor = this.sprites.get('cursor');
    if (oldCursor) {
      this.scene.remove(oldCursor.mesh);
    }
    
    // Create new cursor at position
    const geometry = new THREE.RingGeometry(8, 12, 6);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xFFFF00, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    const cursor = new THREE.Mesh(geometry, material);
    const cell = this.terrain[logicalX]?.[logicalY];
    
    if (cell) {
      const screenPos = this.logicalToScreen(logicalX, logicalY, cell.height);
      cursor.position.set(screenPos.x, screenPos.y, 0.2);
      cursor.rotation.x = -Math.PI / 2;
      
      this.scene.add(cursor);
      this.sprites.set('cursor', {
        mesh: cursor,
        position: { x: logicalX, y: cell.height, z: logicalY },
        type: 'cursor'
      });
    }
  }

  // Get viewport bounds
  public getViewportBounds(): { x0: number, y0: number, x1: number, y1: number } {
    return {
      x0: this.viewportOrigin[0],
      y0: this.viewportOrigin[1],
      x1: this.viewportOrigin[0] + this.viewportWidth,
      y1: this.viewportOrigin[1] + this.viewportHeight
    };
  }

  // Dispose of all resources
  public dispose(): void {
    this.sprites.forEach(sprite => {
      this.scene.remove(sprite.mesh);
      if (sprite.mesh instanceof THREE.Mesh) {
        sprite.mesh.geometry.dispose();
      }
    });
    
    this.materials.forEach(material => material.dispose());
    this.textures.forEach(texture => texture.dispose());
    
    this.sprites.clear();
    this.materials.clear();
    this.textures.clear();
  }
}