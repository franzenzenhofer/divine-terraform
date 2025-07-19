import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { GamePhase, Difficulty } from '../types/game';

const MainMenu: React.FC = () => {
  const { setPhase, initializeGame } = useGameStore();
  
  const startGame = async (difficulty: Difficulty) => {
    await initializeGame({
      mapSize: { x: 128, y: 128 },
      playerName: 'Divine Architect',
      difficulty
    });
    setPhase(GamePhase.PLAYING);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 animate-pulse">
            Divine Terraform
          </h1>
          <p className="text-xl md:text-2xl text-purple-200">
            Shape worlds. Guide civilizations. Become a god.
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">New Game</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => startGame(Difficulty.easy)}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Peaceful</h3>
                <p className="text-sm opacity-90">
                  Relaxed gameplay with helpful civilizations
                </p>
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            
            <button
              onClick={() => startGame(Difficulty.normal)}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Balanced</h3>
                <p className="text-sm opacity-90">
                  Standard challenge for aspiring deities
                </p>
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            
            <button
              onClick={() => startGame(Difficulty.hard)}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Apocalyptic</h3>
                <p className="text-sm opacity-90">
                  Disasters, wars, and demanding followers
                </p>
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <button className="text-purple-200 hover:text-white transition-colors duration-200">
              Settings
            </button>
            <span className="mx-4 text-purple-400">•</span>
            <button className="text-purple-200 hover:text-white transition-colors duration-200">
              Credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;