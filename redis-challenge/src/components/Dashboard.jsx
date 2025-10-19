import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

const Dashboard = ({ groups, sessionId, onStartGame, clearGroups }) => {
  const [currentURL, setCurrentURL] = useState("");

  useEffect(() => {
    const baseURL = window.location.origin + window.location.pathname;
    const mobileURL = `${baseURL}?mode=mobile&session=${sessionId}`;
    setCurrentURL(mobileURL);
  }, [sessionId]);

  const getTotalParticipants = () => {
    return groups.reduce(
      (total, group) => total + group.participants.length,
      0,
    );
  };

  const getGroupsWithParticipants = () => {
    return groups.filter((group) => group.participants.length > 0);
  };

  const handleClearGroups = () => {
    if (
      window.confirm(
        "¿Seguro que quieres limpiar todos los grupos? Esta acción no se puede deshacer.",
      )
    ) {
      clearGroups();
    }
  };

  return (
    <div className="min-h-screen w-full bg-redis-black overflow-y-auto">
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4 sm:mb-6 md:mb-8 flex-shrink-0"
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-2 sm:mb-4 text-glow-red px-2"
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
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-2 sm:mb-4 md:mb-6 px-2">
              🎓 Competencia de Bases de Datos NoSQL
            </p>
            <div className="inline-block bg-redis-red/20 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full">
              <span className="text-redis-red font-bold text-sm sm:text-base md:text-lg lg:text-xl">
                👥 {getTotalParticipants()} Participantes Conectados
              </span>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6 flex-1 min-h-0">
            {/* QR Code Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-5 xl:col-span-4"
            >
              <div className="bg-redis-gray rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center shadow-2xl h-full flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                  📱 Únete al Juego
                </h2>

                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 inline-block mx-auto">
                  <QRCode
                    value={currentURL}
                    size={
                      window.innerWidth < 640
                        ? 150
                        : window.innerWidth < 768
                          ? 180
                          : 200
                    }
                    level="M"
                    includeMargin={true}
                  />
                </div>

                <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-2 sm:mb-4 px-2">
                  Escanea el código QR con tu celular
                </p>

                <div className="bg-redis-black rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 font-mono text-xs sm:text-sm break-all">
                  <span className="text-gray-500">URL: </span>
                  <span className="text-redis-red">{currentURL}</span>
                </div>

                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-3 sm:mt-4 md:mt-6 text-yellow-400 text-sm sm:text-base md:text-lg font-semibold"
                >
                  👆 ¡Escanéame para jugar!
                </motion.div>
              </div>
            </motion.div>

            {/* Groups Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-7 xl:col-span-8"
            >
              <div className="bg-redis-gray rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl h-full flex flex-col min-h-[400px] sm:min-h-[500px]">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                  🏆 Grupos Participantes
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 flex-1 overflow-y-auto">
                  {groups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 transition-all duration-300 ${
                        group.participants.length > 0
                          ? "bg-green-900/20 border-green-500 shadow-lg"
                          : "bg-redis-black border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: group.color }}
                          />
                          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white truncate">
                            Grupo {group.id}
                          </h3>
                        </div>
                        <div
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 ${
                            group.participants.length > 0
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 text-gray-300"
                          }`}
                        >
                          {group.participants.length} 👥
                        </div>
                      </div>

                      <div className="text-center mb-2 sm:mb-4">
                        <h4
                          className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 truncate"
                          style={{ color: group.color }}
                        >
                          {group.name}
                        </h4>
                      </div>

                      {group.participants.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          <h5 className="text-xs sm:text-sm font-semibold text-gray-400 mb-1 sm:mb-2">
                            Participantes:
                          </h5>
                          <div className="max-h-16 sm:max-h-20 md:max-h-24 overflow-y-auto space-y-1">
                            {group.participants
                              .slice(0, 3)
                              .map((participant, idx) => (
                                <motion.div
                                  key={participant.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="text-xs sm:text-sm bg-redis-black rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-gray-300 truncate"
                                  title={`${participant.firstName} ${participant.lastName}`}
                                >
                                  👤 {participant.firstName}{" "}
                                  {participant.lastName}
                                </motion.div>
                              ))}
                            {group.participants.length > 3 && (
                              <div className="text-xs text-gray-500 px-2 sm:px-3">
                                +{group.participants.length - 3} más...
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-2 sm:py-4">
                          <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                            ⏳
                          </div>
                          <p className="text-xs sm:text-sm">
                            Esperando participantes...
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Control Buttons */}
          {getGroupsWithParticipants().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center space-y-3 sm:space-y-4 flex-shrink-0"
            >
              {/* Start Game Button */}
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStartGame}
                  className="bg-gradient-to-r from-redis-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg sm:text-xl md:text-2xl px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full shadow-2xl transition-all duration-300 glow-red w-full sm:w-auto"
                >
                  🚀 ¡Comenzar Competencia!
                </motion.button>

                <p className="text-gray-400 mt-2 sm:mt-4 text-sm sm:text-base md:text-lg px-2">
                  {getGroupsWithParticipants().length} de {groups.length} grupos
                  listos para competir
                </p>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 px-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearGroups}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base"
                >
                  🗑️ Limpiar Grupos
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base"
                >
                  🔄 Refrescar
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 sm:mt-6 md:mt-8 bg-redis-black rounded-lg sm:rounded-2xl p-3 sm:p-4 md:p-6 flex-shrink-0"
          >
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-redis-red mb-2 sm:mb-4">
              📋 Instrucciones:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-gray-300">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">📱</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base">
                    1. Escanear QR
                  </p>
                  <p className="text-xs sm:text-sm">
                    Use su celular para escanear el código QR
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">👥</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base">
                    2. Unirse al Grupo
                  </p>
                  <p className="text-xs sm:text-sm">
                    Seleccione su grupo y registre su nombre
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 sm:col-span-2 lg:col-span-1">
                <span className="text-xl sm:text-2xl flex-shrink-0">🎮</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base">
                    3. ¡A Jugar!
                  </p>
                  <p className="text-xs sm:text-sm">
                    Responda las preguntas sobre Redis
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 sm:mt-6 md:mt-8 text-center text-xs sm:text-sm text-gray-500 font-mono flex-shrink-0 px-2"
          >
            Redis Challenge • Session ID: {sessionId?.slice(0, 8)}... •
            Desarrollado con ❤️
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
