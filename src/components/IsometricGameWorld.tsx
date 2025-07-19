import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import { IsometricRenderer } from '../game/rendering/isometric';
import { GodPowerType, TerrainType } from '../types/game';

interface IsometricSceneProps {
  onTerrainClick: (x: number, z: number) => void;
}

const IsometricScene: React.FC<IsometricSceneProps> = ({ onTerrainClick }) => {
  const { scene, camera, gl } = useThree();
  const rendererRef = useRef<IsometricRenderer | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  const { 
    terrain, 
    mapSize, 
    civilizations, 
    buildings, 
    units,
    selectedPower,
    modifyTerrain,
    timeOfDay
  } = useGameStore();

  // Initialize isometric renderer
  useEffect(() => {
    if (!terrain || terrain.length === 0) return;

    // Set up orthographic camera for WebPopulous-style isometric view
    const aspect = gl.domElement.width / gl.domElement.height;
    const frustumSize = 50; // Smaller for more zoomed-in view like WebPopulous
    const orthoCam = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );
    
    // Classic isometric angle: camera at 45° rotation and 30° elevation
    const distance = 100;
    const angle = Math.PI / 4; // 45 degrees
    const elevation = Math.PI / 6; // 30 degrees
    
    orthoCam.position.set(
      distance * Math.cos(angle) * Math.cos(elevation),
      distance * Math.sin(elevation),
      distance * Math.sin(angle) * Math.cos(elevation)
    );
    orthoCam.lookAt(0, 0, 0);
    
    // Replace the perspective camera with orthographic
    scene.clear();
    scene.add(orthoCam);
    
    // Create isometric renderer
    rendererRef.current = new IsometricRenderer(scene, orthoCam, terrain, {
      viewportWidth: gl.domElement.width,
      viewportHeight: gl.domElement.height
    });
    
    // Initial viewport update
    rendererRef.current.updateViewport(mapSize.x / 2, mapSize.y / 2);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [terrain, scene, gl, mapSize]);

  // Handle mouse movement for cursor
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
      
      if (rendererRef.current) {
        rendererRef.current.updateCursor(mouseRef.current.x, mouseRef.current.y);
      }
    };
    
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    return () => gl.domElement.removeEventListener('mousemove', handleMouseMove);
  }, [gl]);

  // Handle mouse clicks
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!rendererRef.current) return;
      
      const rect = gl.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const [logicalX, logicalY] = rendererRef.current.screenToLogical(x, y);
      
      // Apply god power at clicked location
      if (selectedPower) {
        applyGodPower(logicalX, logicalY, selectedPower);
      }
      
      onTerrainClick(logicalX, logicalY);
    };
    
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [gl, selectedPower, onTerrainClick]);

  // Apply god powers
  const applyGodPower = (x: number, z: number, power: GodPowerType) => {
    const radius = 3;
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance <= radius) {
          const strength = 1 - distance / radius;
          
          switch (power) {
            case GodPowerType.RAISE_LAND:
              modifyTerrain(x + dx, z + dz, {
                height: Math.min(1, terrain[x + dx]?.[z + dz]?.height + 0.1 * strength)
              });
              break;
              
            case GodPowerType.LOWER_LAND:
              modifyTerrain(x + dx, z + dz, {
                height: Math.max(0, terrain[x + dx]?.[z + dz]?.height - 0.1 * strength)
              });
              break;
              
            case GodPowerType.CREATE_WATER:
              if (terrain[x + dx]?.[z + dz]?.height < 0.3) {
                modifyTerrain(x + dx, z + dz, { type: TerrainType.WATER });
              }
              break;
              
            case GodPowerType.CREATE_FOREST:
              if (terrain[x + dx]?.[z + dz]?.type === TerrainType.LAND) {
                modifyTerrain(x + dx, z + dz, { type: TerrainType.FOREST });
              }
              break;
          }
        }
      }
    }
    
    // Update the renderer after terrain modification
    if (rendererRef.current) {
      rendererRef.current.updateViewport(
        camera.position.x,
        camera.position.z
      );
    }
  };

  // Render units and buildings
  useEffect(() => {
    if (!rendererRef.current) return;
    
    // Clear existing units and buildings
    scene.children = scene.children.filter(child => 
      !(child.userData.type === 'unit' || child.userData.type === 'building')
    );
    
    // Render units
    units.forEach(unit => {
      const sprite = rendererRef.current!.createUnitSprite(unit);
      sprite.userData.type = 'unit';
      scene.add(sprite);
    });
    
    // Render buildings
    buildings.forEach(building => {
      const mesh = rendererRef.current!.createBuildingMesh(building);
      mesh.userData.type = 'building';
      scene.add(mesh);
    });
  }, [units, buildings, scene]);

  // Camera movement with keyboard
  useFrame((state, delta) => {
    const speed = 50 * delta;
    let moved = false;
    
    // WASD camera movement
    if (keyPressed.current.w) {
      camera.position.z -= speed;
      moved = true;
    }
    if (keyPressed.current.s) {
      camera.position.z += speed;
      moved = true;
    }
    if (keyPressed.current.a) {
      camera.position.x -= speed;
      moved = true;
    }
    if (keyPressed.current.d) {
      camera.position.x += speed;
      moved = true;
    }
    
    // Update viewport if camera moved
    if (moved && rendererRef.current) {
      rendererRef.current.updateViewport(camera.position.x, camera.position.z);
    }
  });

  // Keyboard state
  const keyPressed = useRef({ w: false, a: false, s: false, d: false });
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': keyPressed.current.w = true; break;
        case 'a': keyPressed.current.a = true; break;
        case 's': keyPressed.current.s = true; break;
        case 'd': keyPressed.current.d = true; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': keyPressed.current.w = false; break;
        case 'a': keyPressed.current.a = false; break;
        case 's': keyPressed.current.s = false; break;
        case 'd': keyPressed.current.d = false; break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return null;
};

const IsometricGameWorld: React.FC = () => {
  const { terrain } = useGameStore();
  
  const handleTerrainClick = (x: number, z: number) => {
    console.log(`Clicked terrain at ${x}, ${z}`);
  };

  if (!terrain || terrain.length === 0) {
    return <div>Loading terrain...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        orthographic
        camera={{
          zoom: 1,
          position: [50, 50, 50],
          near: 0.1,
          far: 1000
        }}
        style={{ background: '#87CEEB' }}
      >
        <IsometricScene onTerrainClick={handleTerrainClick} />
      </Canvas>
    </div>
  );
};

export default IsometricGameWorld;