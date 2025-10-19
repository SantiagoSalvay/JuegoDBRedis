import { useState } from "react";
import { motion } from "framer-motion";

const MobileGroupSelection = ({ groups, joinGroup }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setIsRegistering(true);
  };

  const handleJoinGroup = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Por favor, completa tu nombre y apellido");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 Intentando unirse al grupo:", {
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        participant: { firstName: firstName.trim(), lastName: lastName.trim() },
      });

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const participant = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      console.log("📝 Llamando joinGroup...");

      // Verificar estado antes
      const beforeGroups = JSON.parse(
        localStorage.getItem("redis-groups") || "[]",
      );
      const beforeCount =
        beforeGroups.find((g) => g.id === selectedGroup.id)?.participants
          ?.length || 0;
      console.log("👥 Participantes antes:", beforeCount);

      joinGroup(selectedGroup.id, participant);

      // Verificar después de un momento
      setTimeout(() => {
        const afterGroups = JSON.parse(
          localStorage.getItem("redis-groups") || "[]",
        );
        const afterCount =
          afterGroups.find((g) => g.id === selectedGroup.id)?.participants
            ?.length || 0;
        console.log("👥 Participantes después:", afterCount);

        if (afterCount > beforeCount) {
          console.log(
            "✅ Participante agregado correctamente, redirigiendo...",
          );
        } else {
          console.warn("⚠️ No se detectó el cambio en localStorage");
        }

        // Redirigir
        const newURL = `${window.location.origin}${window.location.pathname}?group=${selectedGroup.id}`;
        console.log("🔄 Redirigiendo a:", newURL);
        window.location.href = newURL;
      }, 1000);
    } catch (error) {
      console.error("❌ Error joining group:", error);
      alert("Error al unirse al grupo. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsRegistering(false);
    setSelectedGroup(null);
    setFirstName("");
    setLastName("");
  };

  if (isRegistering && selectedGroup) {
    return (
      <div className="min-h-screen w-full bg-redis-black p-3 sm:p-4 md:p-6 flex flex-col justify-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto w-full"
        >
          <div className="bg-redis-gray rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4 sm:mb-6 md:mb-8"
            >
              <motion.button
                onClick={handleBack}
                className="absolute top-2 left-2 sm:top-4 sm:left-4 p-2 text-gray-400 hover:text-white text-sm sm:text-base"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ← Volver
              </motion.button>

              <div
                className="w-4 h-4 sm:w-6 sm:h-6 rounded-full mx-auto mb-2 sm:mb-4"
                style={{ backgroundColor: selectedGroup.color }}
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                Grupo {selectedGroup.id}
              </h1>
              <h2
                className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4"
                style={{ color: selectedGroup.color }}
              >
                {selectedGroup.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 px-2">
                Registra tu información para unirte
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 px-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-redis-black border-2 border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:border-redis-red focus:outline-none transition-colors text-sm sm:text-base"
                  maxLength="50"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 px-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ingresa tu apellido"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-redis-black border-2 border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:border-redis-red focus:outline-none transition-colors text-sm sm:text-base"
                  maxLength="50"
                />
              </div>

              {/* Participants Preview */}
              {selectedGroup.participants &&
                selectedGroup.participants.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-redis-black rounded-lg sm:rounded-xl p-3 sm:p-4"
                  >
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-1 sm:mb-2">
                      👥 Ya están en este grupo:
                    </h3>
                    <div className="space-y-1 max-h-16 sm:max-h-20 overflow-y-auto">
                      {selectedGroup.participants
                        .slice(0, 3)
                        .map((participant, idx) => (
                          <div
                            key={idx}
                            className="text-xs sm:text-sm text-gray-300 truncate"
                          >
                            • {participant.firstName} {participant.lastName}
                          </div>
                        ))}
                      {selectedGroup.participants.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{selectedGroup.participants.length - 3} más...
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinGroup}
                disabled={isLoading || !firstName.trim() || !lastName.trim()}
                className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 ${
                  isLoading || !firstName.trim() || !lastName.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-redis-red hover:bg-red-700 text-white glow-red"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">Uniéndose...</span>
                  </div>
                ) : (
                  "🚀 Unirse al Grupo"
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-redis-black p-3 sm:p-4 md:p-6 flex flex-col justify-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto w-full flex-shrink-0"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-4 sm:mb-6 md:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-redis-red mb-1 sm:mb-2 text-glow-red px-2">
            Redis Challenge
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-1 px-2">
            📱 Selecciona tu grupo
          </p>
          <p className="text-xs sm:text-sm text-gray-500 px-2">
            Competencia de Bases de Datos NoSQL
          </p>
        </motion.div>

        {/* Groups List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto max-h-96 sm:max-h-none"
        >
          {groups &&
            groups.map((group, index) => (
              <motion.button
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGroupSelect(group)}
                className="w-full bg-redis-gray hover:bg-redis-gray/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-left border-2 border-transparent hover:border-redis-red transition-all duration-300"
              >
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  {/* Color indicator */}
                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />

                  {/* Group info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-white">
                        Grupo {group.id}
                      </span>
                      {group.participants && group.participants.length > 0 && (
                        <span className="bg-green-600 text-white text-xs px-1 sm:px-2 py-1 rounded-full">
                          {group.participants.length} 👥
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-base sm:text-lg md:text-xl font-bold truncate"
                      style={{ color: group.color }}
                    >
                      {group.name}
                    </h3>
                  </div>

                  {/* Arrow */}
                  <div className="text-redis-red text-lg sm:text-xl flex-shrink-0">
                    →
                  </div>
                </div>

                {/* Participants preview */}
                {group.participants && group.participants.length > 0 && (
                  <div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-1 sm:mb-2">
                      Participantes ({group.participants.length}):
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {group.participants
                        .slice(0, window.innerWidth < 640 ? 2 : 3)
                        .map((participant, idx) => (
                          <span
                            key={idx}
                            className="bg-redis-black text-xs px-1 sm:px-2 py-1 rounded text-gray-300 truncate max-w-24 sm:max-w-none"
                            title={`${participant.firstName} ${participant.lastName}`}
                          >
                            {participant.firstName} {participant.lastName}
                          </span>
                        ))}
                      {group.participants.length >
                        (window.innerWidth < 640 ? 2 : 3) && (
                        <span className="text-xs text-gray-500">
                          +
                          {group.participants.length -
                            (window.innerWidth < 640 ? 2 : 3)}{" "}
                          más...
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-6 md:mt-8 text-center text-xs sm:text-sm text-gray-500 font-mono px-2"
        >
          Toca tu grupo para registrarte y comenzar a jugar
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MobileGroupSelection;
