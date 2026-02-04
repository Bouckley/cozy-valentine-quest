import { useState, useEffect } from 'react';
import heartImage from '@/assets/heart.png';

interface TriviaSectionProps {
  onComplete: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const questions: Question[] = [
  {
    question: "Where was our first date?",
    options: ["Coffee shop downtown", "The park by the lake", "That cozy restaurant", "Movie theater"],
    correctIndex: 2,
  },
  {
    question: "Who said 'I love you' first?",
    options: ["You did 💕", "I did 💖", "We said it together", "We haven't yet!"],
    correctIndex: 0,
  },
  {
    question: "What's our favorite thing to do together?",
    options: ["Watch movies", "Cook dinner", "Go on walks", "Play games"],
    correctIndex: 1,
  },
  {
    question: "Which of these reminds you of me most?",
    options: ["Warm hugs", "Silly jokes", "Late night talks", "All of the above 💘"],
    correctIndex: 3,
  },
];

const TriviaSection = ({ onComplete }: TriviaSectionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnswerClick = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setIsCorrect(index === questions[currentQuestion].correctIndex);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
          setTransitioning(false);
        }, 300);
      } else {
        onComplete();
      }
    }, 1500);
  };

  const question = questions[currentQuestion];

  const getFeedbackMessage = () => {
    if (!showFeedback) return '';
    if (isCorrect) {
      return ["You know me so well! 💕", "Perfect! 💖", "That's right! 💘", "Exactly! 💗"][currentQuestion];
    }
    return ["Close enough! 💕", "I still love you! 💖", "Nice try! 💘", "You're adorable! 💗"][currentQuestion];
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`max-w-md w-full transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < currentQuestion
                  ? 'bg-primary'
                  : i === currentQuestion
                  ? 'bg-primary animate-pulse-glow'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Dialogue box */}
        <div className="dialogue-box">
          {/* Decorative corner hearts */}
          <img src={heartImage} alt="" className="absolute -top-3 -left-3 w-6 h-6 opacity-70" />
          <img src={heartImage} alt="" className="absolute -top-3 -right-3 w-6 h-6 opacity-70" />

          {/* Question */}
          <p className="text-xs md:text-sm text-center mb-8 leading-relaxed pixel-text text-foreground">
            {question.question}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={showFeedback}
                className={`answer-option ${
                  showFeedback && index === questions[currentQuestion].correctIndex
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
            <div className="mt-6 text-center animate-bounce-in">
              <p className="text-xs text-primary pixel-text">
                {getFeedbackMessage()}
              </p>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>
    </div>
  );
};

export default TriviaSection;
