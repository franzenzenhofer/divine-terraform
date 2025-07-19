import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { useGameStore } from '../stores/gameStore';
import GameWorld from './GameWorld';
import HUD from './HUD';
import LoadingScreen from './LoadingScreen';
import MainMenu from './MainMenu';
import { GamePhase, Difficulty } from '../types/game';

const Game: React.FC = () => {
  const { phase, initializeGame } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing divine powers...');

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoadingMessage('Creating the cosmos...');
        setLoadingProgress(0.2);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingMessage('Generating primordial terrain...');
        setLoadingProgress(0.5);
        
        await initializeGame({
          mapSize: { x: 128, y: 128 },
          playerName: 'Divine Architect',
          difficulty: Difficulty.normal
        });
        
        setLoadingMessage('Awakening civilizations...');
        setLoadingProgress(0.8);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingMessage('Ready to shape worlds!');
        setLoadingProgress(1);
        
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    loadGame();
  }, [initializeGame]);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} message={loadingMessage} />;
  }

  if (phase === GamePhase.MENU) {
    return <MainMenu />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Canvas
        camera={{
          position: [50, 50, 50],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false
        }}
        shadows
      >
        <Suspense fallback={null}>
          <GameWorld />
        </Suspense>
        {/* {import.meta.env.DEV && <Stats />} */}
      </Canvas>
      
      <HUD />
    </div>
  );
};

export default Game;