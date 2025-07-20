import React, { useRef, useEffect } from 'react';

interface Props {
  width: number;
  height: number;
  onInteraction: (x: number, y: number, isRightClick: boolean) => void;
}

export const ClickableCanvas: React.FC<Props> = ({ width, height, onInteraction }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const isRightClick = e.button === 2;

    // Check if we're clicking on a UI element
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // If it's a button or inside a UI container, don't handle the click
    if (element?.closest('button, .pointer-events-auto')) {
      return;
    }

    onInteraction(x, y, isRightClick);
  };

  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0"
      style={{ zIndex: 5 }} // Between canvas (0) and UI (1000+)
      onMouseDown={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

export default ClickableCanvas;