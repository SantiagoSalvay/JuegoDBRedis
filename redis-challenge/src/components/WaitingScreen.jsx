import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const WaitingScreen = ({ groupName, participantName }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-redis-black p-6 flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Hola, {participantName}!
          </h1>
          <p className="text-gray-400 mb-6">Grupo: <span className="text-redis-red">{groupName}</span></p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Instrucciones del Juego
          </h2>
          
          <ul className="space-y-3 text-gray-300">
            {[
              "10 preguntas sobre Redis",
              "Responde rápido para más puntos",
              "Respuestas correctas: suman puntos",
              "Respuestas incorrectas: restan puntos"
            ].map((text, index) => (
              <li key={index} className="flex items-start">
                <span className="text-redis-red mr-2">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-redis-red border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">
              Esperando al anfitrión{dots}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingScreen;
