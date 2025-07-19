import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainMenu from '../MainMenu';
import { useGameStore } from '../../stores/gameStore';
import { GamePhase, Difficulty } from '../../types/game';

// Mock the game store
vi.mock('../../stores/gameStore', () => ({
  useGameStore: vi.fn()
}));

describe('MainMenu', () => {
  const mockSetPhase = vi.fn();
  const mockInitializeGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    (useGameStore as any).mockReturnValue({
      setPhase: mockSetPhase,
      initializeGame: mockInitializeGame
    });
  });

  it('should render main menu with title and subtitle', () => {
    render(<MainMenu />);
    
    expect(screen.getByText('Divine Terraform')).toBeInTheDocument();
    expect(screen.getByText('Shape worlds. Guide civilizations. Become a god.')).toBeInTheDocument();
  });

  it('should render all difficulty buttons', () => {
    render(<MainMenu />);
    
    expect(screen.getByRole('button', { name: /peaceful/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /balanced/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apocalyptic/i })).toBeInTheDocument();
  });

  it('should start game with easy difficulty', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);
    
    const peacefulButton = screen.getByRole('button', { name: /peaceful/i });
    await user.click(peacefulButton);
    
    await waitFor(() => {
      expect(mockInitializeGame).toHaveBeenCalledWith({
        mapSize: { x: 128, y: 128 },
        playerName: 'Divine Architect',
        difficulty: Difficulty.easy
      });
      expect(mockSetPhase).toHaveBeenCalledWith(GamePhase.PLAYING);
    });
  });

  it('should start game with normal difficulty', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);
    
    const balancedButton = screen.getByRole('button', { name: /balanced/i });
    await user.click(balancedButton);
    
    await waitFor(() => {
      expect(mockInitializeGame).toHaveBeenCalledWith({
        mapSize: { x: 128, y: 128 },
        playerName: 'Divine Architect',
        difficulty: Difficulty.normal
      });
      expect(mockSetPhase).toHaveBeenCalledWith(GamePhase.PLAYING);
    });
  });

  it('should start game with hard difficulty', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);
    
    const apocalypticButton = screen.getByRole('button', { name: /apocalyptic/i });
    await user.click(apocalypticButton);
    
    await waitFor(() => {
      expect(mockInitializeGame).toHaveBeenCalledWith({
        mapSize: { x: 128, y: 128 },
        playerName: 'Divine Architect',
        difficulty: Difficulty.hard
      });
      expect(mockSetPhase).toHaveBeenCalledWith(GamePhase.PLAYING);
    });
  });

  it('should render settings and credits buttons', () => {
    render(<MainMenu />);
    
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /credits/i })).toBeInTheDocument();
  });

  it('should have hover effects on difficulty buttons', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);
    
    const peacefulButton = screen.getByRole('button', { name: /peaceful/i });
    
    // Check initial state
    expect(peacefulButton).toHaveClass('hover:scale-105');
    
    // Hover should trigger scale transform
    await user.hover(peacefulButton);
    
    // Note: Testing CSS transforms requires more setup with jsdom
    // This test verifies the class is present
    expect(peacefulButton).toHaveClass('hover:scale-105');
  });

  it('should display difficulty descriptions', () => {
    render(<MainMenu />);
    
    expect(screen.getByText('Relaxed gameplay with helpful civilizations')).toBeInTheDocument();
    expect(screen.getByText('Standard challenge for aspiring deities')).toBeInTheDocument();
    expect(screen.getByText('Disasters, wars, and demanding followers')).toBeInTheDocument();
  });
});