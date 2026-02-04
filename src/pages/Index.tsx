import { useState } from 'react';
import LandingScreen from '@/components/game/LandingScreen';
import HeartGame from '@/components/game/HeartGame';
import FinalReveal from '@/components/game/FinalReveal';

type GameStage = 'landing' | 'game' | 'reveal';

const Index = () => {
  const [stage, setStage] = useState<GameStage>('landing');
  const [fadeOut, setFadeOut] = useState(false);

  const transitionTo = (nextStage: GameStage) => {
    setFadeOut(true);
    setTimeout(() => {
      setStage(nextStage);
      setFadeOut(false);
    }, 500);
  };

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {stage === 'landing' && (
        <LandingScreen onStart={() => transitionTo('game')} />
      )}
      
      {stage === 'game' && (
        <HeartGame 
          onComplete={() => transitionTo('reveal')} 
          requiredHearts={8}
        />
      )}
      
      {stage === 'reveal' && (
        <FinalReveal />
      )}
    </div>
  );
};

export default Index;
