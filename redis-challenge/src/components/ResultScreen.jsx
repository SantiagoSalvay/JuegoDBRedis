import { motion } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const ResultScreen = ({ score, totalQuestions, onRestart }) => {
  const maxScore = totalQuestions * 10;
  const percentage = (score / maxScore) * 100;

  useEffect(() => {
    // Trigger confetti if score is good
    if (percentage >= 50) {
      const duration = percentage >= 80 ? 3000 : 2000;
      const end = Date.now() + duration;

      const colors = ['#D82C20', '#FF6B6B', '#FFA500', '#FFD700'];

      (function frame() {
        confetti({
          particleCount: percentage >= 80 ? 7 : 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: percentage >= 80 ? 7 : 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [percentage]);

  const getMessage = () => {
    if (percentage >= 80) {
      return {
        emoji: '🔥',
        title: '¡Maestro del Cache!',
        message: 'Dominas Redis como un profesional. ¡Impresionante!',
        color: 'text-yellow-400',
        glow: 'glow-green',
      };
    } else if (percentage >= 50) {
      return {
        emoji: '⚡',
        title: '¡Buen trabajo!',
        message: 'Te estás acercando al nivel experto. ¡Sigue así!',
        color: 'text-orange-400',
        glow: 'glow-red',
      };
    } else {
      return {
        emoji: '💾',
        title: 'Te falta un poco de RAM mental',
        message: '¡No te preocupes! La práctica hace al maestro. 😅',
        color: 'text-blue-400',
        glow: '',
      };
    }
  };

  const result = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-redis-gray rounded-3xl p-8 md:p-12 shadow-2xl text-center"
      >
        {/* Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="text-8xl md:text-9xl mb-6"
        >
          {result.emoji}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`text-4xl md:text-5xl font-bold mb-4 ${result.color}`}
        >
          {result.title}
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg md:text-xl text-gray-300 mb-8"
        >
          {result.message}
        </motion.p>

        {/* Score Display */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 100 }}
          className={`bg-redis-black rounded-2xl p-8 mb-8 ${result.glow}`}
        >
          <div className="text-gray-400 text-sm md:text-base mb-2 font-mono">
            PUNTUACIÓN FINAL
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-6xl md:text-7xl font-bold text-redis-red mb-4"
          >
            {score}
          </motion.div>
          <div className="text-gray-400 text-lg">
            de {maxScore} puntos posibles
          </div>

          {/* Percentage Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>0%</span>
              <span className="font-bold text-white">{percentage.toFixed(0)}%</span>
              <span>100%</span>
            </div>
            <div className="h-3 bg-redis-gray rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 1.3, duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  percentage >= 80
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : percentage >= 50
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-400'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-redis-black rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {Math.round((score / 10))}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Correctas</div>
          </div>
          <div className="bg-redis-black rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {totalQuestions - Math.round((score / 10))}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Incorrectas</div>
          </div>
          <div className="bg-redis-black rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {totalQuestions}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Total</div>
          </div>
        </motion.div>

        {/* Restart Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="bg-redis-red hover:bg-red-700 text-white font-bold text-xl px-10 py-4 rounded-full shadow-lg transition-all duration-300 glow-red w-full md:w-auto"
        >
          🔄 Jugar de nuevo
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-6 text-sm text-gray-500 font-mono"
        >
          ¡Gracias por jugar! 🎮
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ResultScreen;
