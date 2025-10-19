import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [question]);

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);
    const correct = option === question.answer;
    setIsCorrect(correct);

    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };

  const getOptionStyle = (option) => {
    if (!isAnswered) {
      return "bg-redis-gray hover:bg-redis-red/20 hover:border-redis-red border-2 border-transparent";
    }

    if (option === question.answer) {
      return "bg-green-600 border-2 border-green-400 glow-green";
    }

    if (option === selectedOption && !isCorrect) {
      return "bg-red-600 border-2 border-red-400";
    }

    return "bg-redis-gray opacity-50";
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.3 },
    },
  };

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center justify-center h-screen w-screen px-4 pt-20 pb-8 overflow-y-auto"
    >
      <motion.div
        className="w-full max-w-3xl bg-redis-gray rounded-2xl p-8 md:p-12 shadow-2xl"
        animate={isAnswered && !isCorrect ? shakeAnimation : {}}
      >
        {/* Question Header */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block bg-redis-red/20 text-redis-red px-4 py-2 rounded-full text-sm font-mono mb-4"
          >
            Pregunta {questionNumber} de {totalQuestions}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-white leading-tight"
          >
            {question.question}
          </motion.h2>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={!isAnswered ? { scale: 1.02, x: 10 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswered}
              className={`w-full text-left p-4 md:p-6 rounded-xl font-medium text-base md:text-lg transition-all duration-300 ${getOptionStyle(
                option,
              )} ${!isAnswered ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-redis-black rounded-full text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {isAnswered && option === question.answer && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-2xl"
                  >
                    ✓
                  </motion.span>
                )}
                {isAnswered && option === selectedOption && !isCorrect && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-2xl"
                  >
                    ✗
                  </motion.span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Feedback Message */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl text-center font-semibold text-lg ${
              isCorrect
                ? "bg-green-600/20 text-green-400 border-2 border-green-600"
                : "bg-red-600/20 text-red-400 border-2 border-red-600"
            }`}
          >
            {isCorrect ? (
              <span className="flex items-center justify-center gap-2">
                🎉 ¡Excelente! +10 puntos
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                😅 Incorrecto. La respuesta correcta es: {question.answer}
              </span>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuestionCard;
