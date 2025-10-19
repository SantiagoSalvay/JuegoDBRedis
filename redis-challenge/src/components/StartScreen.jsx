import { motion } from "framer-motion";

const StartScreen = ({ onStart, groupInfo }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-screen w-screen px-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        {groupInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-3 bg-redis-gray rounded-full px-6 py-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: groupInfo.group.color }}
              />
              <span className="text-lg font-bold text-white">
                Grupo {groupInfo.groupId} - {groupInfo.group.name}
              </span>
            </div>
          </motion.div>
        )}

        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-4 text-glow-red"
          animate={{
            textShadow: [
              "0 0 10px rgba(216, 44, 32, 0.8)",
              "0 0 20px rgba(216, 44, 32, 1)",
              "0 0 10px rgba(216, 44, 32, 0.8)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Redis Challenge
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl mb-8"
        >
          ⚡
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl bg-redis-gray rounded-2xl p-8 shadow-2xl mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-yellow-400">
          ¡Estás listo, espera a que comience el juego! ⏳
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-4">
          El anfitrión iniciará el juego pronto. Mientras tanto, aquí tienes algunas reglas:
        </p>
        <div className="text-left space-y-2 text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-redis-red">✓</span>
            <span>10 preguntas de opción múltiple</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-redis-red">✓</span>
            <span>+10 puntos por respuesta correcta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-redis-red">✓</span>
            <span>+5 puntos bonus por 3 aciertos consecutivos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-redis-red">✓</span>
            <span>Feedback inmediato en cada respuesta</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-6 py-3 rounded-full">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Esperando al anfitrión...</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-sm text-gray-500 font-mono"
      >
        Desarrollado con ❤️ para aprender Redis
      </motion.div>
    </motion.div>
  );
};

export default StartScreen;
