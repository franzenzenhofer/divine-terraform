import { useRef, useEffect, useCallback } from 'react';

interface InteractiveRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

export const useCanvasInteraction = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  uiRegions: InteractiveRegion[]
) => {
  const isInUIRegion = useCallback((x: number, y: number): boolean => {
    return uiRegions.some(region => 
      x >= region.x && 
      x <= region.x + region.width && 
      y >= region.y && 
      y <= region.y + region.height
    );
  }, [uiRegions]);

  const handleCanvasInteraction = useCallback((e: MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let x: number, y: number;
    
    if (e instanceof TouchEvent && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if (e instanceof MouseEvent) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      return;
    }
    
    // If click is in a UI region, let it bubble through
    if (isInUIRegion(x, y)) {
      return;
    }
    
    // Otherwise, handle the canvas interaction
    e.preventDefault();
    e.stopPropagation();
    
    // Dispatch custom event for game logic
    const customEvent = new CustomEvent('canvasInteraction', {
      detail: { x, y, type: e.type }
    });
    canvasRef.current.dispatchEvent(customEvent);
  }, [canvasRef, isInUIRegion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleCanvasInteraction);
    canvas.addEventListener('touchstart', handleCanvasInteraction, { passive: false });
    
    return () => {
      canvas.removeEventListener('mousedown', handleCanvasInteraction);
      canvas.removeEventListener('touchstart', handleCanvasInteraction);
    };
  }, [handleCanvasInteraction]);

  return { isInUIRegion };
};