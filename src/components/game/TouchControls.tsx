import { useEffect, useCallback } from 'react';

interface TouchControlsProps {
  onDirectionChange: (directions: { up: boolean; down: boolean; left: boolean; right: boolean }) => void;
}

const TouchControls = ({ onDirectionChange }: TouchControlsProps) => {
  const handleTouchStart = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const directions = { up: false, down: false, left: false, right: false };
    directions[direction] = true;
    onDirectionChange(directions);
  }, [onDirectionChange]);

  const handleTouchEnd = useCallback(() => {
    onDirectionChange({ up: false, down: false, left: false, right: false });
  }, [onDirectionChange]);

  const buttonClass = "w-12 h-12 pixel-panel flex items-center justify-center text-lg active:scale-95 active:bg-primary/20 transition-transform select-none touch-none";

  return (
    <div className="flex flex-col items-center gap-1 mt-4">
      {/* Up button */}
      <button
        className={buttonClass}
        onTouchStart={(e) => { e.preventDefault(); handleTouchStart('up'); }}
        onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
        onMouseDown={() => handleTouchStart('up')}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        ▲
      </button>
      
      {/* Middle row: Left, Down, Right */}
      <div className="flex gap-1">
        <button
          className={buttonClass}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          ◀
        </button>
        
        <button
          className={buttonClass}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('down'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseDown={() => handleTouchStart('down')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          ▼
        </button>
        
        <button
          className={buttonClass}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default TouchControls;
