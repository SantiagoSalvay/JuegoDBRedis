import { useState } from "react";
import { motion } from "framer-motion";

const PowerCardsModal = ({ offeredPowers = [], groups = [], onConfirm, onClose }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [targetGroupId, setTargetGroupId] = useState(null);

  const handleCardClick = (id) => {
    if (selectedId) return;
    setSelectedId(id);
    const chosen = offeredPowers.find((p) => p.id === id);
    if (chosen?.type === 'double_points' || chosen?.type === 'skip_question') {
      setTimeout(() => onConfirm?.(chosen), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-redis-gray rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6"
      >
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold text-white">Cartas Misteriosas</h3>
          <p className="text-gray-300 text-sm">Elige 1 carta para aplicar su poder</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offeredPowers.map((card) => {
            const isSelected = selectedId === card.id;
            return (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(card.id)}
                className={`h-40 rounded-xl border-2 transition-all duration-300 flex items-center justify-center text-xl font-bold ${
                  isSelected
                    ? "bg-redis-red/20 border-redis-red text-redis-red"
                    : "bg-redis-black/60 border-gray-600 text-white"
                }`}
              >
                {isSelected ? card.name : "?"}
              </motion.button>
            );
          })}
        </div>
        {selectedId && offeredPowers.find(p => p.id === selectedId)?.type === 'steal_points' && (
          <div className="mt-6">
            <div className="mb-2 text-sm text-gray-300">Elige equipo objetivo</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setTargetGroupId(g.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold border-2 ${
                    targetGroupId === g.id ? 'border-redis-red text-redis-red' : 'border-gray-600 text-white'
                  }`}
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                  {g.name}
                </button>
              ))}
            </div>
            {targetGroupId && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    const card = offeredPowers.find(p => p.id === selectedId);
                    onConfirm?.({ id: selectedId, type: 'steal_points', value: (card?.value ?? 1), targetGroupId });
                  }}
                  className="bg-redis-red hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-400">Se aplica automáticamente al elegir</div>
      </motion.div>
    </div>
  );
};

export default PowerCardsModal;
