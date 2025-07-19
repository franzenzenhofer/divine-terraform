import * as THREE from 'three';
import { TerrainCell, Position3D } from '../../types/game';

export interface TerrainChunk {
  x: number;
  z: number;
  mesh: THREE.Mesh;
  cells: TerrainCell[][];
  needsUpdate: boolean;
  lastUpdate: number;
  lod: number;
}

export interface ChunkConfig {
  chunkSize: number;
  viewDistance: number;
  lodLevels: number[];
  updateInterval: number;
}

export class TerrainChunkManager {
  private chunks: Map<string, TerrainChunk> = new Map();
  private config: ChunkConfig;
  private scene: THREE.Scene;
  private material: THREE.Material;
  private terrain: TerrainCell[][];
  private worldSize: number;

  constructor(scene: THREE.Scene, material: THREE.Material, terrain: TerrainCell[][], config: Partial<ChunkConfig> = {}) {
    this.scene = scene;
    this.material = material;
    this.terrain = terrain;
    this.worldSize = terrain.length;
    
    this.config = {
      chunkSize: 32,
      viewDistance: 5,
      lodLevels: [1, 2, 4, 8],
      updateInterval: 100,
      ...config
    };
  }

  private getChunkKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  private createChunkGeometry(startX: number, startZ: number, lod: number = 1): THREE.BufferGeometry {
    const size = this.config.chunkSize;
    const segments = Math.floor(size / lod);
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const vertexIndex = i * (segments + 1) + j;
        const x = startX + (j / segments) * size;
        const z = startZ + (i / segments) * size;
        
        const worldX = Math.floor(x);
        const worldZ = Math.floor(z);
        
        if (worldX >= 0 && worldX < this.worldSize && worldZ >= 0 && worldZ < this.worldSize) {
          const cell = this.terrain[worldX][worldZ];
          positions.setY(vertexIndex, cell.height * 10);
        }
      }
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }

  private createChunk(chunkX: number, chunkZ: number): TerrainChunk {
    const startX = chunkX * this.config.chunkSize;
    const startZ = chunkZ * this.config.chunkSize;
    
    const geometry = this.createChunkGeometry(startX, startZ);
    const mesh = new THREE.Mesh(geometry, this.material);
    
    mesh.position.set(
      startX + this.config.chunkSize / 2,
      0,
      startZ + this.config.chunkSize / 2
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    
    const cells: TerrainCell[][] = [];
    for (let x = 0; x < this.config.chunkSize; x++) {
      cells[x] = [];
      for (let z = 0; z < this.config.chunkSize; z++) {
        const worldX = startX + x;
        const worldZ = startZ + z;
        if (worldX < this.worldSize && worldZ < this.worldSize) {
          cells[x][z] = this.terrain[worldX][worldZ];
        }
      }
    }
    
    return {
      x: chunkX,
      z: chunkZ,
      mesh,
      cells,
      needsUpdate: false,
      lastUpdate: Date.now(),
      lod: 1
    };
  }

  public updateVisibleChunks(cameraPosition: Position3D): void {
    const chunkSize = this.config.chunkSize;
    const viewDistance = this.config.viewDistance;
    
    const cameraChunkX = Math.floor(cameraPosition.x / chunkSize);
    const cameraChunkZ = Math.floor(cameraPosition.z / chunkSize);
    
    // Track which chunks should be visible
    const visibleChunks = new Set<string>();
    
    // Check all chunks within view distance
    for (let dx = -viewDistance; dx <= viewDistance; dx++) {
      for (let dz = -viewDistance; dz <= viewDistance; dz++) {
        const chunkX = cameraChunkX + dx;
        const chunkZ = cameraChunkZ + dz;
        
        // Check if chunk is within world bounds
        const startX = chunkX * chunkSize;
        const startZ = chunkZ * chunkSize;
        
        if (startX < this.worldSize && startZ < this.worldSize && startX >= 0 && startZ >= 0) {
          const key = this.getChunkKey(chunkX, chunkZ);
          visibleChunks.add(key);
          
          // Create chunk if it doesn't exist
          if (!this.chunks.has(key)) {
            const chunk = this.createChunk(chunkX, chunkZ);
            this.chunks.set(key, chunk);
            this.scene.add(chunk.mesh);
          }
          
          // Update LOD based on distance
          const chunk = this.chunks.get(key)!;
          const distance = Math.sqrt(dx * dx + dz * dz);
          const targetLod = this.calculateLOD(distance);
          
          if (chunk.lod !== targetLod) {
            this.updateChunkLOD(chunk, targetLod);
          }
        }
      }
    }
    
    // Remove chunks that are no longer visible
    for (const [key, chunk] of this.chunks) {
      if (!visibleChunks.has(key)) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        this.chunks.delete(key);
      }
    }
  }

  private calculateLOD(distance: number): number {
    const { lodLevels, viewDistance } = this.config;
    const normalizedDistance = distance / viewDistance;
    
    if (normalizedDistance < 0.25) return lodLevels[0];
    if (normalizedDistance < 0.5) return lodLevels[1];
    if (normalizedDistance < 0.75) return lodLevels[2];
    return lodLevels[3];
  }

  private updateChunkLOD(chunk: TerrainChunk, newLod: number): void {
    chunk.lod = newLod;
    const startX = chunk.x * this.config.chunkSize;
    const startZ = chunk.z * this.config.chunkSize;
    
    const newGeometry = this.createChunkGeometry(startX, startZ, newLod);
    chunk.mesh.geometry.dispose();
    chunk.mesh.geometry = newGeometry;
  }

  public updateChunkTerrain(worldX: number, worldZ: number): void {
    const chunkX = Math.floor(worldX / this.config.chunkSize);
    const chunkZ = Math.floor(worldZ / this.config.chunkSize);
    const key = this.getChunkKey(chunkX, chunkZ);
    
    const chunk = this.chunks.get(key);
    if (chunk) {
      chunk.needsUpdate = true;
      this.refreshChunk(chunk);
    }
  }

  private refreshChunk(chunk: TerrainChunk): void {
    const startX = chunk.x * this.config.chunkSize;
    const startZ = chunk.z * this.config.chunkSize;
    
    const geometry = chunk.mesh.geometry as THREE.PlaneGeometry;
    const positions = geometry.attributes.position;
    const segments = Math.floor(this.config.chunkSize / chunk.lod);
    
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const vertexIndex = i * (segments + 1) + j;
        const x = startX + (j / segments) * this.config.chunkSize;
        const z = startZ + (i / segments) * this.config.chunkSize;
        
        const worldX = Math.floor(x);
        const worldZ = Math.floor(z);
        
        if (worldX >= 0 && worldX < this.worldSize && worldZ >= 0 && worldZ < this.worldSize) {
          const cell = this.terrain[worldX][worldZ];
          positions.setY(vertexIndex, cell.height * 10);
        }
      }
    }
    
    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
    
    chunk.needsUpdate = false;
    chunk.lastUpdate = Date.now();
  }

  public dispose(): void {
    for (const chunk of this.chunks.values()) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
    }
    this.chunks.clear();
  }
}