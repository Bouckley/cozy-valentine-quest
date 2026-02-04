import { useState, useEffect } from 'react';
import heartImage from '@/assets/heart.png';

const FinalReveal = () => {
  const [stage, setStage] = useState<'typing' | 'question' | 'finale'>('typing');
  const [showButtons, setShowButtons] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string; delay: string; rotation: number }>>([]);
  const [typedText, setTypedText] = useState('');
  
  const fullText = "You unlocked the final question!";

  // Typewriter effect
  useEffect(() => {
    if (stage !== 'typing') return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStage('question'), 800);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [stage]);

  // Show buttons after question appears
  useEffect(() => {
    if (stage === 'question') {
      setTimeout(() => setShowButtons(true), 1000);
    }
  }, [stage]);

  // Generate confetti
  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      rotation: Math.random() * 360,
    }));
    setConfetti(newConfetti);
    setStage('finale');
  };

  const handleYesClick = () => {
    triggerConfetti();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece) => (
        <img
          key={piece.id}
          src={heartImage}
          alt=""
          className="fixed w-6 h-6 pointer-events-none z-50"
          style={{
            left: piece.left,
            top: '-50px',
            animation: `confetti-fall ${3 + Math.random() * 2}s linear ${piece.delay} forwards`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="text-center max-w-lg w-full">
        {stage === 'typing' && (
          <div className="animate-slide-up">
            <p className="text-sm md:text-base text-primary pixel-text leading-relaxed">
              {typedText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
        )}

        {stage === 'question' && (
          <>
            {/* Main question */}
            <div className="pixel-panel mb-8 animate-bounce-in">
              <h1 className="text-lg md:text-2xl text-primary pixel-text leading-relaxed animate-heart-beat">
                Teiah, will you be my Valentine ?
              </h1>
              
              {/* Decorative hearts */}
              <div className="flex justify-center gap-3 mt-4">
                <img src={heartImage} alt="" className="w-6 h-6 animate-float" style={{ animationDelay: '0s' }} />
                <img src={heartImage} alt="" className="w-8 h-8 animate-float" style={{ animationDelay: '0.3s' }} />
                <img src={heartImage} alt="" className="w-6 h-6 animate-float" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            {/* Buttons */}
            {showButtons && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                <button
                  onClick={handleYesClick}
                  className="pixel-button text-xs md:text-sm animate-pulse-glow"
                >
                  Yes 💖
                </button>
                <button
                  onClick={handleYesClick}
                  className="pixel-button text-xs md:text-sm"
                  style={{
                    background: 'linear-gradient(180deg, hsl(280 50% 70%) 0%, hsl(280 50% 55%) 100%)',
                  }}
                >
                  Yes, obviously 💕
                </button>
              </div>
            )}
          </>
        )}

        {stage === 'finale' && (
          <div className="animate-bounce-in">
            <div className="pixel-panel bg-card">
              {/* Big heart */}
              <div className="flex justify-center mb-6">
                <img src={heartImage} alt="Heart" className="w-20 h-20 animate-heart-beat" />
              </div>
              
              {/* Final message */}
              <h2 className="text-lg md:text-xl text-primary pixel-text mb-4">
                Good choice
              </h2>
              
              <p className="text-xs text-muted-foreground pixel-text">
                I love you to the moon and back Teiah
              </p>

              {/* Floating hearts decoration */}
              <div className="mt-8 flex justify-center gap-4">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={heartImage}
                    alt=""
                    className="w-4 h-4 animate-float"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background floating hearts */}
      {stage === 'finale' && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <img
              key={`bg-heart-${i}`}
              src={heartImage}
              alt=""
              className="fixed w-8 h-8 opacity-20 animate-float pointer-events-none"
              style={{
                left: `${(i * 8) + 4}%`,
                top: `${20 + (i % 4) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default FinalReveal;
