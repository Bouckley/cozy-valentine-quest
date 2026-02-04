import { useEffect, useState, useCallback, useRef } from 'react';
import heartImage from '@/assets/heart.png';
import characterIdle from '@/assets/character-idle.gif';
import characterWalkNorth from '@/assets/character-walk-north.gif';
import characterWalkSouth from '@/assets/character-walk-south.gif';
import characterWalkEast from '@/assets/character-walk-east.gif';
import characterWalkWest from '@/assets/character-walk-west.gif';

interface HeartGameProps {
  onComplete: () => void;
  requiredHearts?: number;
}

interface Heart {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

type Direction = 'idle' | 'up' | 'down' | 'left' | 'right';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 280;
const CHARACTER_SIZE = 32;
const HEART_SIZE = 24;
const MOVE_SPEED = 4;
const COLLECTION_DISTANCE = 28;

const HeartGame = ({ onComplete, requiredHearts = 8 }: HeartGameProps) => {
  const [playerPos, setPlayerPos] = useState({ x: GAME_WIDTH / 2 - CHARACTER_SIZE / 2, y: GAME_HEIGHT / 2 - CHARACTER_SIZE / 2 });
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [direction, setDirection] = useState<Direction>('idle');
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const sparkleIdRef = useRef(0);

  // Get character sprite based on direction
  const getCharacterSprite = () => {
    switch (direction) {
      case 'up': return characterWalkNorth;
      case 'down': return characterWalkSouth;
      case 'left': return characterWalkWest;
      case 'right': return characterWalkEast;
      default: return characterIdle;
    }
  };

  // Initialize hearts
  useEffect(() => {
    setMounted(true);
    const initialHearts: Heart[] = [];
    for (let i = 0; i < requiredHearts; i++) {
      initialHearts.push({
        id: i,
        x: Math.random() * (GAME_WIDTH - HEART_SIZE * 2) + HEART_SIZE,
        y: Math.random() * (GAME_HEIGHT - HEART_SIZE * 2) + HEART_SIZE,
        collected: false,
      });
    }
    setHearts(initialHearts);
  }, [requiredHearts]);

  // Spawn sparkle effect
  const spawnSparkle = useCallback((x: number, y: number) => {
    const id = sparkleIdRef.current++;
    setSparkles(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== id));
    }, 600);
  }, []);

  // Check collision with hearts
  const checkHeartCollision = useCallback((px: number, py: number) => {
    setHearts(prevHearts => {
      let collected = false;
      const newHearts = prevHearts.map(heart => {
        if (heart.collected) return heart;
        
        const dx = (px + CHARACTER_SIZE / 2) - (heart.x + HEART_SIZE / 2);
        const dy = (py + CHARACTER_SIZE / 2) - (heart.y + HEART_SIZE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < COLLECTION_DISTANCE) {
          collected = true;
          spawnSparkle(heart.x, heart.y);
          return { ...heart, collected: true };
        }
        return heart;
      });
      
      if (collected) {
        setCollectedCount(prev => prev + 1);
      }
      
      return newHearts;
    });
  }, [spawnSparkle]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      let dx = 0;
      let dy = 0;
      let newDirection: Direction = 'idle';

      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
        dy = -MOVE_SPEED;
        newDirection = 'up';
      }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
        dy = MOVE_SPEED;
        newDirection = 'down';
      }
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
        dx = -MOVE_SPEED;
        newDirection = 'left';
      }
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
        dx = MOVE_SPEED;
        newDirection = 'right';
      }

      if (dx !== 0 || dy !== 0) {
        setPlayerPos(prev => {
          const newX = Math.max(0, Math.min(GAME_WIDTH - CHARACTER_SIZE, prev.x + dx));
          const newY = Math.max(0, Math.min(GAME_HEIGHT - CHARACTER_SIZE, prev.y + dy));
          checkHeartCollision(newX, newY);
          return { x: newX, y: newY };
        });
      }

      setDirection(newDirection);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [checkHeartCollision]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check completion
  useEffect(() => {
    if (collectedCount >= requiredHearts && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [collectedCount, requiredHearts, isComplete, onComplete]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Heart counter */}
      <div className="pixel-panel mb-4 py-3 px-6">
        <p className="text-xs text-center pixel-text">
          Hearts: <span className="text-primary">{collectedCount}</span> / {requiredHearts}
        </p>
      </div>

      {/* Game area */}
      <div 
        className={`game-area relative transition-all duration-1000 ${isComplete ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Hearts */}
        {hearts.map(heart => !heart.collected && (
          <img
            key={heart.id}
            src={heartImage}
            alt="Heart"
            className="absolute animate-float"
            style={{
              left: heart.x,
              top: heart.y,
              width: HEART_SIZE,
              height: HEART_SIZE,
              animationDelay: `${heart.id * 0.2}s`,
            }}
          />
        ))}

        {/* Sparkles */}
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none animate-sparkle"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: HEART_SIZE,
              height: HEART_SIZE,
            }}
          >
            <span className="text-2xl">✨</span>
          </div>
        ))}

        {/* Player character */}
        <img
          src={getCharacterSprite()}
          alt="Character"
          className="absolute"
          style={{
            left: playerPos.x,
            top: playerPos.y,
            width: CHARACTER_SIZE,
            height: CHARACTER_SIZE,
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* Controls hint */}
      <div className="mt-4 text-[10px] text-muted-foreground text-center">
        <p>Use arrow keys or WASD to move</p>
      </div>

      {/* Completion message */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="pixel-panel animate-bounce-in">
            <p className="text-sm text-primary pixel-text">All hearts collected! 💖</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeartGame;
