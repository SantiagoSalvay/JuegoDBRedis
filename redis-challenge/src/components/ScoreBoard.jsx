import { motion } from "framer-motion";

const ScoreBoard = ({
  score,
  currentQuestion,
  totalQuestions,
  streak,
  groupInfo,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 bg-redis-gray/95 backdrop-blur-sm shadow-lg z-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Group Info */}
        {groupInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: groupInfo.group.color }}
            />
            <span className="text-sm md:text-base text-gray-300">
              {groupInfo.group.name}
            </span>
          </motion.div>
        )}
        {/* Score */}
        <motion.div
          key={score}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-3"
        >
          <span className="text-gray-400 text-sm md:text-base">
            Puntuación:
          </span>
          <motion.span
            className="text-2xl md:text-3xl font-bold text-redis-red glow-red"
            animate={{
              textShadow: [
                "0 0 10px rgba(216, 44, 32, 0.8)",
                "0 0 20px rgba(216, 44, 32, 1)",
                "0 0 10px rgba(216, 44, 32, 0.8)",
              ],
            }}
            transition={{ duration: 1 }}
          >
            {score}
          </motion.span>
        </motion.div>

        {/* Question Progress */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm md:text-base">Pregunta:</span>
          <span className="text-xl md:text-2xl font-semibold text-white">
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>

        {/* Streak Indicator */}
        {streak >= 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border-2 border-orange-500"
          >
            <span className="text-2xl">🔥</span>
            <span className="text-orange-500 font-bold text-sm md:text-base">
              ¡{streak} seguidos!
            </span>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="w-full mt-2">
          <div className="h-1 bg-redis-black rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-redis-red to-orange-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreBoard;
