import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import StartScreen from "./components/StartScreen";
import QuestionCard from "./components/QuestionCard";
import ScoreBoard from "./components/ScoreBoard";
import ResultScreen from "./components/ResultScreen";
import questionsData from "./data/questions.json";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [streak, setStreak] = useState(0);

  const handleStart = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setStreak(0);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      let points = 10;
      const newStreak = streak + 1;

      // Bonus for 3 consecutive correct answers
      if (newStreak >= 3 && newStreak % 3 === 0) {
        points += 5;
      }

      setScore(score + points);
      setStreak(newStreak);
    } else {
      setStreak(0);
    }

    // Move to next question or show results
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setStreak(0);
  };

  return (
    <div className="min-h-screen bg-redis-black">
      <AnimatePresence mode="wait">
        {!gameStarted && !showResults && (
          <StartScreen key="start" onStart={handleStart} />
        )}

        {gameStarted && !showResults && (
          <>
            <ScoreBoard
              key="scoreboard"
              score={score}
              currentQuestion={currentQuestion}
              totalQuestions={questionsData.length}
              streak={streak}
            />
            <QuestionCard
              key={currentQuestion}
              question={questionsData[currentQuestion]}
              questionNumber={currentQuestion + 1}
              totalQuestions={questionsData.length}
              onAnswer={handleAnswer}
            />
          </>
        )}

        {showResults && (
          <ResultScreen
            key="results"
            score={score}
            totalQuestions={questionsData.length}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
