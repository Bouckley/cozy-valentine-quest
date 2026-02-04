import { useEffect, useState, useCallback, useRef } from 'react';
import heartImage from '@/assets/heart.png';
import characterStandNorth from '@/assets/character-stand-north.png';
import characterStandSouth from '@/assets/character-stand-south.png';
import characterStandEast from '@/assets/character-stand-east.png';
import characterStandWest from '@/assets/character-stand-west.png';
import characterWalkNorth from '@/assets/character-walk-north.gif';
import characterWalkSouth from '@/assets/character-walk-south.gif';
import characterWalkEast from '@/assets/character-walk-east.gif';
import characterWalkWest from '@/assets/character-walk-west.gif';
import TriviaDialog from './TriviaDialog';

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

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

// Larger game area and sprites
const GAME_WIDTH = 480;
const GAME_HEIGHT = 400;
const CHARACTER_SIZE = 64;
const HEART_SIZE = 40;
const COLLECTION_DISTANCE = 48;

// Slower, step-based movement
const STEP_SIZE = 4;
const STEP_INTERVAL = 60; // ms between steps

const triviaQuestions: TriviaQuestion[] = [
  {
    question: "Where was our first date?",
    options: ["Skating at Victoria Park", "Stages", "Your House", "The Arc Gym"],
    correctIndex: 2,
  },
  {
    question: "Who said 'I love you' first?",
    options: ["You did!", "I did!", "We said it together", "Technically someone said it by squeezing hands..."],
    correctIndex: 3,
  },
  {
    question: "Why was our first date insane?",
    options: ["I broguht whole wheat flour", "We watched my favourite movie Ponyo", "You brought me on a triple date", "All of the above!"],
    correctIndex: 3,
  },
  {
    question: "What pastry did I leave on your window sill?",
    options: ["Pastel de Nata", "Chocolate Chip Cookies", "Macaron", "Churros"],
    correctIndex: 0,
  },
  {
    question: "What's our song?",
    options: ["You're the Inspiration", "White Ferrari", "Cotton Eye Joe", "Die Trying"],
    correctIndex: 1,
  },
  {
    question: "What day is our Anniversary?",
    options: ["March 2nd", "February 24th", "February 25th", "Same as Valentine's Day"],
    correctIndex: 2,
  },
  {
    question: "What's my favorite thing about you?",
    options: ["Your smile", "Your beautiful eyes", "Your odd sense of humour", "Everything!"],
    correctIndex: 3,
  },
  {
    question: "How much do I miss you?",
    options: ["meh", "a lil", "so much", "I MISS YOU 1,000,000!!!"],
    correctIndex: 3,
  },
];

const HeartGame = ({ onComplete, requiredHearts = 8 }: HeartGameProps) => {
  const [playerPos, setPlayerPos] = useState({ 
    x: GAME_WIDTH / 2 - CHARACTER_SIZE / 2, 
    y: GAME_HEIGHT / 2 - CHARACTER_SIZE / 2 
  });
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTrivia, setCurrentTrivia] = useState<TriviaQuestion | null>(null);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [collectionPause, setCollectionPause] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef<number>(0);
  const gameLoopRef = useRef<number>();
  const sparkleIdRef = useRef(0);

  // Get character sprite based on direction and movement state
  const getCharacterSprite = () => {
    if (isMoving) {
      switch (direction) {
        case 'up': return characterWalkNorth;
        case 'down': return characterWalkSouth;
        case 'left': return characterWalkWest;
        case 'right': return characterWalkEast;
      }
    }
    // Standing sprites when idle
    switch (direction) {
      case 'up': return characterStandNorth;
      case 'down': return characterStandSouth;
      case 'left': return characterStandWest;
      case 'right': return characterStandEast;
    }
  };

  // Initialize hearts with better spacing
  useEffect(() => {
    setMounted(true);
    const initialHearts: Heart[] = [];
    const padding = HEART_SIZE * 2;
    
    for (let i = 0; i < requiredHearts; i++) {
      let x, y;
      let attempts = 0;
      do {
        x = Math.random() * (GAME_WIDTH - padding * 2) + padding;
        y = Math.random() * (GAME_HEIGHT - padding * 2) + padding;
        attempts++;
      } while (
        attempts < 50 && 
        initialHearts.some(h => 
          Math.abs(h.x - x) < HEART_SIZE * 1.5 && 
          Math.abs(h.y - y) < HEART_SIZE * 1.5
        )
      );
      
      initialHearts.push({
        id: i,
        x,
        y,
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

  // Show trivia after heart collection
  const showTrivia = useCallback(() => {
    if (triviaIndex < triviaQuestions.length) {
      setCurrentTrivia(triviaQuestions[triviaIndex]);
      setIsPaused(true);
    }
  }, [triviaIndex]);

  // Handle trivia answer
  const handleTriviaAnswer = useCallback(() => {
    setCurrentTrivia(null);
    setIsPaused(false);
    setTriviaIndex(prev => prev + 1);
  }, []);

  // Check collision with hearts
  const checkHeartCollision = useCallback((px: number, py: number) => {
    if (collectionPause || isPaused) return;
    
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
        // Brief pause after collection
        setCollectionPause(true);
        setTimeout(() => {
          setCollectionPause(false);
          setCollectedCount(prev => {
            const newCount = prev + 1;
            // Show trivia after each heart
            setTimeout(() => showTrivia(), 100);
            return newCount;
          });
        }, 250);
      }
      
      return newHearts;
    });
  }, [spawnSparkle, showTrivia, collectionPause, isPaused]);

  // Game loop with step-based movement
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (isPaused || collectionPause) {
        setIsMoving(false);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const timeSinceLastMove = timestamp - lastMoveTime.current;
      
      let dx = 0;
      let dy = 0;
      let newDirection: Direction = direction;
      let moving = false;

      // Check pressed keys
      const up = keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has('W');
      const down = keysPressed.current.has('ArrowDown') || keysPressed.current.has('s') || keysPressed.current.has('S');
      const left = keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A');
      const right = keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D');

      if (up) {
        dy = -1;
        newDirection = 'up';
        moving = true;
      } else if (down) {
        dy = 1;
        newDirection = 'down';
        moving = true;
      }
      
      if (left) {
        dx = -1;
        newDirection = 'left';
        moving = true;
      } else if (right) {
        dx = 1;
        newDirection = 'right';
        moving = true;
      }

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const normalize = 1 / Math.sqrt(2);
        dx *= normalize;
        dy *= normalize;
      }

      // Step-based movement with timing
      if (moving && timeSinceLastMove >= STEP_INTERVAL) {
        setPlayerPos(prev => {
          const newX = Math.max(0, Math.min(GAME_WIDTH - CHARACTER_SIZE, prev.x + dx * STEP_SIZE));
          const newY = Math.max(0, Math.min(GAME_HEIGHT - CHARACTER_SIZE, prev.y + dy * STEP_SIZE));
          checkHeartCollision(newX, newY);
          return { x: newX, y: newY };
        });
        lastMoveTime.current = timestamp;
      }

      setDirection(newDirection);
      setIsMoving(moving);
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [checkHeartCollision, direction, isPaused, collectionPause]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
      if (keys.includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      // Also clear the uppercase/lowercase variant
      keysPressed.current.delete(e.key.toLowerCase());
      keysPressed.current.delete(e.key.toUpperCase());
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
    if (collectedCount >= requiredHearts && !isComplete && !isPaused) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [collectedCount, requiredHearts, isComplete, onComplete, isPaused]);

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
        className={`game-area relative transition-all duration-500 ${
          isComplete ? 'opacity-0 scale-95' : 
          isPaused ? 'opacity-50' : 'opacity-100 scale-100'
        }`}
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
              imageRendering: 'pixelated',
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
            <span className="text-3xl">✨</span>
          </div>
        ))}

        {/* Player character */}
        <img
          src={getCharacterSprite()}
          alt="Character"
          className="absolute transition-none"
          style={{
            left: playerPos.x,
            top: playerPos.y,
            width: CHARACTER_SIZE,
            height: CHARACTER_SIZE,
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* Trivia Dialog */}
      {currentTrivia && (
        <TriviaDialog 
          question={currentTrivia} 
          onAnswer={handleTriviaAnswer}
        />
      )}

      {/* Controls hint */}
      <div className="mt-4 text-[10px] text-muted-foreground text-center">
        <p>Use arrow keys or WASD to move</p>
      </div>

      {/* Completion message */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
          <div className="pixel-panel animate-bounce-in">
            <p className="text-sm text-primary pixel-text">All hearts collected! 💖</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeartGame;
