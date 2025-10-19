import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import StartScreen from "./components/StartScreen";
import QuestionCard from "./components/QuestionCard";
import ScoreBoard from "./components/ScoreBoard";
import ResultScreen from "./components/ResultScreen";
import Dashboard from "./components/Dashboard";
import MobileGroupSelection from "./components/MobileGroupSelection";
import questionsData from "./data/questions.json";

// Configuración de grupos
const GROUPS_CONFIG = [
  { id: 1, name: "MongoDB", color: "#4DB33D", participants: [] },
  { id: 2, name: "Cassandra", color: "#1287A5", participants: [] },
  { id: 3, name: "Neo4j", color: "#008CC1", participants: [] },
  { id: 4, name: "CouchDB", color: "#E42528", participants: [] },
  { id: 6, name: "BigTable", color: "#4285F4", participants: [] },
  { id: 7, name: "Amazon DynamoDB", color: "#FF9900", participants: [] },
  { id: 8, name: "ArangoDB", color: "#68A063", participants: [] },
];

// Función para shufflear preguntas
const shuffleQuestions = (questions, groupId, sessionId) => {
  const seed = `${groupId}-${sessionId}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = hash % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function App() {
  // Estado del juego
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameQuestions, setGameQuestions] = useState([]);

  // Estado de grupos
  const [groups, setGroups] = useState(GROUPS_CONFIG);
  const [currentUser, setCurrentUser] = useState(null);
  const [gameMode, setGameMode] = useState("dashboard");
  const [sessionId, setSessionId] = useState("");
  const [competitionStarted, setCompetitionStarted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);

  // Función para cargar grupos desde localStorage
  const loadGroupsFromStorage = () => {
    try {
      const storedGroups = localStorage.getItem("redis-groups");
      const storedTimestamp = localStorage.getItem("redis-groups-timestamp");

      if (storedGroups && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp);
        if (timestamp > lastUpdate) {
          const parsedGroups = JSON.parse(storedGroups);
          console.log(
            "🔄 Loading groups from storage:",
            parsedGroups.filter((g) => g.participants?.length > 0),
          );
          setGroups(parsedGroups);
          setLastUpdate(timestamp);
          return true;
        }
      }
    } catch (error) {
      console.error("❌ Error loading groups:", error);
    }
    return false;
  };

  // Función para guardar grupos en localStorage
  const saveGroupsToStorage = (newGroups) => {
    try {
      const timestamp = Date.now();
      localStorage.setItem("redis-groups", JSON.stringify(newGroups));
      localStorage.setItem("redis-groups-timestamp", timestamp.toString());
      setLastUpdate(timestamp);
      console.log(
        "💾 Groups saved to storage:",
        newGroups.filter((g) => g.participants?.length > 0),
      );
    } catch (error) {
      console.error("❌ Error saving groups:", error);
    }
  };

  // Inicialización
  useEffect(() => {
    // Generar session ID
    let storedSessionId = localStorage.getItem("redis-session-id");
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("redis-session-id", storedSessionId);
    }
    setSessionId(storedSessionId);

    // Cargar grupos iniciales
    loadGroupsFromStorage();

    // Detectar modo según URL
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const groupId = urlParams.get("group");

    if (mode === "mobile") {
      setGameMode("mobile");
    } else if (groupId) {
      setGameMode("playing");
      const group = GROUPS_CONFIG.find((g) => g.id === parseInt(groupId));
      if (group) {
        setCurrentUser({ groupId: parseInt(groupId), group });
      }
    } else {
      setGameMode("dashboard");
    }
  }, []);

  // Polling cada segundo para sincronización
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameMode === "dashboard") {
        const updated = loadGroupsFromStorage();
        if (updated) {
          console.log("🕐 Groups updated via polling");
        }
      }
    }, 1000); // Polling cada 1 segundo

    return () => clearInterval(interval);
  }, [gameMode, lastUpdate]);

  // Función para unirse a un grupo
  const joinGroup = (groupId, participant) => {
    console.log("🚀 joinGroup called:", { groupId, participant });

    const newParticipant = {
      ...participant,
      id: Math.random().toString(36).substr(2, 9),
      joinedAt: new Date().toISOString(),
    };

    // Cargar grupos más recientes primero
    loadGroupsFromStorage();

    const updatedGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            participants: [...(group.participants || []), newParticipant],
          }
        : group,
    );

    console.log("📝 Updating groups:", {
      groupId,
      newParticipant,
      totalAfter: updatedGroups.find((g) => g.id === groupId)?.participants
        ?.length,
    });

    setGroups(updatedGroups);
    saveGroupsToStorage(updatedGroups);

    return updatedGroups;
  };

  const clearGroups = () => {
    console.log("🧹 Clearing all groups");
    const resetGroups = GROUPS_CONFIG.map((group) => ({
      ...group,
      participants: [],
    }));
    setGroups(resetGroups);
    saveGroupsToStorage(resetGroups);
  };

  // Funciones del juego
  const handleStart = () => {
    const shuffled = currentUser
      ? shuffleQuestions(questionsData, currentUser.groupId, sessionId)
      : questionsData;

    setGameQuestions(shuffled);
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setStreak(0);
  };

  const handleStartCompetition = () => {
    setCompetitionStarted(true);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      let points = 10;
      const newStreak = streak + 1;

      if (newStreak >= 3 && newStreak % 3 === 0) {
        points += 5;
      }

      setScore(score + points);
      setStreak(newStreak);
    } else {
      setStreak(0);
    }

    if (currentQuestion < gameQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    if (gameMode === "playing") {
      handleStart();
    } else {
      setGameStarted(false);
      setCurrentQuestion(0);
      setScore(0);
      setShowResults(false);
      setStreak(0);
      setGameQuestions([]);
    }
  };

  // Props para componentes
  const dashboardProps = {
    groups,
    sessionId,
    onStartGame: handleStartCompetition,
    clearGroups,
  };

  const mobileGroupSelectionProps = {
    groups,
    joinGroup,
  };

  // Calcular total de participantes
  const totalParticipants = groups.reduce(
    (acc, g) => acc + (g.participants?.length || 0),
    0,
  );

  // Renderizado según el modo
  if (gameMode === "dashboard") {
    if (!competitionStarted) {
      return <Dashboard {...dashboardProps} />;
    } else {
      return (
        <div className="min-h-screen bg-redis-black flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-8xl mb-8">🚀</div>
            <h1 className="text-6xl font-bold text-redis-red mb-4 text-glow-red">
              ¡Competencia en Progreso!
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Los grupos están respondiendo las preguntas sobre Redis
            </p>
            <div className="bg-redis-gray rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-lg text-gray-300 mb-4">
                Los participantes están jugando desde sus dispositivos móviles
              </p>
              <button
                onClick={() => setCompetitionStarted(false)}
                className="bg-redis-red hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (gameMode === "mobile") {
    return <MobileGroupSelection {...mobileGroupSelectionProps} />;
  }

  if (gameMode === "playing") {
    return (
      <div className="min-h-screen bg-redis-black">
        <AnimatePresence mode="wait">
          {!gameStarted && !showResults && (
            <StartScreen
              key="start"
              onStart={handleStart}
              groupInfo={currentUser}
            />
          )}

          {gameStarted && !showResults && gameQuestions.length > 0 && (
            <>
              <ScoreBoard
                key="scoreboard"
                score={score}
                currentQuestion={currentQuestion}
                totalQuestions={gameQuestions.length}
                streak={streak}
                groupInfo={currentUser}
              />
              <QuestionCard
                key={currentQuestion}
                question={gameQuestions[currentQuestion]}
                questionNumber={currentQuestion + 1}
                totalQuestions={gameQuestions.length}
                onAnswer={handleAnswer}
              />
            </>
          )}

          {showResults && (
            <ResultScreen
              key="results"
              score={score}
              totalQuestions={gameQuestions.length}
              onRestart={handleRestart}
              groupInfo={currentUser}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Modo standalone (original)
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
