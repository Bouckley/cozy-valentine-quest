import { useState, useEffect } from 'react';
import heartImage from '@/assets/heart.png';

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface TriviaDialogProps {
  question: TriviaQuestion;
  onAnswer: (wasCorrect: boolean) => void;
}

const TriviaDialog = ({ question, onAnswer }: TriviaDialogProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnswerClick = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    const correct = index === question.correctIndex;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Wait for feedback to show, then continue game
    setTimeout(() => {
      onAnswer(correct);
    }, 1200);
  };

  const getFeedbackMessage = () => {
    if (!showFeedback) return '';
    if (isCorrect) {
      const messages = ["You know me so well! 💕", "Perfect! 💖", "That's right! 💘", "Exactly! 💗"];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    const messages = ["Close enough! 💕", "I still love you! 💖", "Nice try! 💘", "You're adorable! 💗"];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className={`relative max-w-sm w-full mx-4 transition-all duration-300 ${mounted ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="dialogue-box">
          {/* Decorative corner hearts */}
          <img src={heartImage} alt="" className="absolute -top-3 -left-3 w-6 h-6 opacity-70" />
          <img src={heartImage} alt="" className="absolute -top-3 -right-3 w-6 h-6 opacity-70" />

          {/* Question */}
          <p className="text-xs text-center mb-6 leading-relaxed pixel-text text-foreground">
            {question.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={showFeedback}
                className={`answer-option text-[10px] py-2 ${
                  showFeedback && index === question.correctIndex
                    ? 'correct'
                    : showFeedback && index === selectedAnswer && !isCorrect
                    ? 'incorrect'
                    : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="mt-4 text-center animate-bounce-in">
              <p className="text-[10px] text-primary pixel-text">
                {getFeedbackMessage()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriviaDialog;
