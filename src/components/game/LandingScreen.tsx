import { useEffect, useState } from 'react';
import heartImage from '@/assets/heart.png';

interface LandingScreenProps {
  onStart: () => void;
}

const LandingScreen = ({ onStart }: LandingScreenProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate floating hearts
  const floatingHearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${10 + (i * 12)}%`,
    delay: `${i * 0.4}s`,
    duration: `${3 + (i % 3)}s`,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background hearts */}
      {floatingHearts.map((heart) => (
        <img
          key={heart.id}
          src={heartImage}
          alt=""
          className="absolute w-6 h-6 opacity-30 animate-float pointer-events-none"
          style={{
            left: heart.left,
            top: `${20 + (heart.id % 4) * 15}%`,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
          }}
        />
      ))}

      {/* Main content panel */}
      <div
        className={`pixel-panel max-w-md w-full text-center transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Decorative heart at top */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <img
            src={heartImage}
            alt="Heart"
            className="w-10 h-10 animate-heart-beat"
          />
        </div>

        {/* Title */}
        <h1 className="text-lg md:text-xl text-primary leading-relaxed mb-4 mt-4 pixel-text">
          A Little Game
          <br />
          Just for You
        </h1>
        
        {/* Decorative hearts */}
        <div className="flex justify-center gap-2 mb-6">
          <span className="text-valentine-pink text-2xl">💖</span>
        </div>

        {/* Subtitle */}
        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed mb-8 px-4">
          Collect the hearts to unlock something special.
        </p>

        {/* Start button */}
        <button
          onClick={onStart}
          className="pixel-button text-xs md:text-sm animate-pulse-glow"
        >
          Start
        </button>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center gap-3 opacity-50">
          <img src={heartImage} alt="" className="w-4 h-4" />
          <img src={heartImage} alt="" className="w-4 h-4" />
          <img src={heartImage} alt="" className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
