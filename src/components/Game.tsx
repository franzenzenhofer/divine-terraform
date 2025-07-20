import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { useGameStore } from '../stores/gameStore';
import GameWorld from './GameWorld';
import GameContainer from './GameContainer';
import LoadingScreen from './LoadingScreen';
import MainMenu from './MainMenu';
import { GamePhase, Difficulty } from '../types/game';

const Game: React.FC = () => {
  const { phase, initializeGame } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing divine powers...');
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return <GameContainer />;
};

export default Game;