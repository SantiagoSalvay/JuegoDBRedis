import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      if (!storedGroups) return false;
      
      const parsedData = JSON.parse(storedGroups);
      
      // Manejar tanto el formato antiguo (array) como el nuevo (objeto con grupos)
      const groupsToSet = Array.isArray(parsedData) 
        ? parsedData 
        : (parsedData.groups || []);
      
      // Verificar que los grupos tengan la estructura esperada
      if (Array.isArray(groupsToSet) && groupsToSet.length > 0) {
        // Asegurarse de que cada grupo tenga los campos necesarios
        const validatedGroups = groupsToSet.map(group => ({
          id: group.id || 0,
          name: group.name || 'Grupo sin nombre',
          color: group.color || '#666666',
          participants: Array.isArray(group.participants) ? group.participants : [],
          competitionStarted: !!group.competitionStarted,
          lastUpdated: group.lastUpdated || new Date().toISOString()
        }));
        
        setGroups(validatedGroups);
        setLastUpdate(Date.now());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error cargando grupos:", error);
      return false;
    }
  };

  // Función para guardar grupos en localStorage
  const saveGroupsToStorage = async (newGroups) => {
    try {
      const timestamp = Date.now();
      
      // Guardar los grupos directamente sin anidarlos en un objeto
      localStorage.setItem("redis-groups", JSON.stringify(newGroups));
      localStorage.setItem("redis-groups-last-updated", timestamp);
      
      // Actualizar el estado local
      setLastUpdate(timestamp);
      
      // Pequeño delay para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return true;
    } catch (error) {
      console.error('❌ Error guardando grupos en localStorage:', error);
      return false;
    }
  };

  // Inicialización
  useEffect(() => {
    console.log('🔍 Initializing app...');
    
    // 1. Obtener parámetros de la URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlSessionId = searchParams.get('session');
    const urlMode = searchParams.get('mode');
    
    console.log('🌐 URL Parameters:', { urlMode, urlSessionId });
    
    // 2. Manejar el modo de la aplicación
    if (urlMode === 'mobile') {
      console.log('📱 Mobile mode detected from URL');
      setGameMode('mobile');
      
      // Si hay un sessionId en la URL, usarlo
      if (urlSessionId) {
        console.log('🔄 Using session ID from URL:', urlSessionId);
        localStorage.setItem("redis-session-id", urlSessionId);
        setSessionId(urlSessionId);
        return; // Salir temprano para móviles
      }
    } else {
      // Modo dashboard por defecto
      setGameMode('dashboard');
    }
    
    // 3. Para modo dashboard o sin modo específico
    let storedSessionId = localStorage.getItem("redis-session-id");
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("redis-session-id", storedSessionId);
      console.log('🆕 New session ID generated:', storedSessionId);
    } else {
      console.log('🔑 Existing session ID:', storedSessionId);
    }
    
    setSessionId(storedSessionId);

    // 2. Resetear estado del juego
    console.log('🔄 Resetting game state...');
    setCompetitionStarted(false);
    setGameStarted(false);
    setGameQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setStreak(0);

    // 3. Cargar grupos
    console.log('📂 Loading groups...');
    loadGroupsFromStorage();

    // 4. Detectar modo según URL
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    console.log('🌐 URL mode detected:', mode || 'default');

    if (mode === 'dashboard') {
      console.log('🖥️ Setting dashboard mode');
      setGameMode('dashboard');
      
      // Limpiar cualquier estado de competencia previo
      localStorage.removeItem('redis-competition');
    } else if (mode === 'mobile') {
      console.log('📱 Setting mobile mode');
      setGameMode('mobile');
      
      // Intentar cargar usuario desde localStorage
      const storedUser = localStorage.getItem('redis-current-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('👤 Loaded user from storage:', user.name);
          setCurrentUser(user);
          setGameMode('playing');
        } catch (e) {
          console.error('❌ Error parsing stored user:', e);
          localStorage.removeItem('redis-current-user');
        }
      }
    }

    // 5. Verificar si hay una competencia en curso
    const competitionData = localStorage.getItem('redis-competition');
    if (competitionData) {
      try {
        const compData = JSON.parse(competitionData);
        console.log('🏁 Found competition data:', {
          started: compData.started,
          sessionId: compData.sessionId,
          initializedBy: compData.initializedBy
        });
        
        // Solo establecer como iniciada si la sesión coincide
        if (compData.sessionId === storedSessionId) {
          setCompetitionStarted(!!compData.started);
        } else {
          console.log('⚠️ Session ID mismatch, ignoring competition data');
          localStorage.removeItem('redis-competition');
        }
      } catch (e) {
        console.error('❌ Error parsing competition data:', e);
        localStorage.removeItem('redis-competition');
      }
    } else {
      console.log('ℹ️ No active competition found');
    }
    
    console.log('✅ Initialization complete');
  }, []);

  // Efecto para sincronizar el estado del juego
  useEffect(() => {
    let isMounted = true;
    
    const syncGameState = () => {
      if (!isMounted) return;
      
      // 1. Actualizar grupos
      const updatedGroups = loadGroupsFromStorage();
      if (updatedGroups) {
        console.log("🔄 Groups updated");
      }
      
      // 2. Verificar estado de la competencia
      const competitionData = localStorage.getItem('redis-competition');
      if (!competitionData) return;

      try {
        const competition = JSON.parse(competitionData);
        
        // Limpiar datos de competencia inválidos
        if (!competition.initializedBy || !competition.sessionId) {
          console.log('⚠️ Invalid competition data, cleaning up...');
          localStorage.removeItem('redis-competition');
          return;
        }

        const { started, sessionId: compSessionId, initializedBy } = competition;
        
        // Actualizar estado de la competencia solo si hay cambios
        setCompetitionStarted(prevStarted => {
          if (prevStarted !== started) {
            console.log(`🔄 Competition status: ${started ? 'STARTED' : 'STOPPED'}, Session: ${compSessionId}`);
            return started;
          }
          return prevStarted;
        });

        // Solo procesar si la sesión coincide
        if (compSessionId !== sessionId) {
          console.log(`🔀 Session ID mismatch: ${sessionId} (current) vs ${compSessionId} (stored)`);
          return;
        }

        // Lógica para el HOST (Dashboard)
        if (gameMode === 'dashboard') {
          if (started && !gameStarted && initializedBy === 'host') {
            console.log('🏁 HOST: Starting game with session:', compSessionId);
            const shuffled = shuffleQuestions(questionsData, 'all', compSessionId);
            setGameQuestions(shuffled);
            setGameStarted(true);
            setCurrentQuestion(0);
            setScore(0);
            setShowResults(false);
            setStreak(0);
          }
          return;
        }

        // Lógica para los JUGADORES
        if (gameMode === 'playing' && started && !gameStarted) {
          console.log('🎮 PLAYER: Joining game with session:', compSessionId);
          const shuffled = shuffleQuestions(questionsData, currentUser?.groupId || 'all', compSessionId);
          
          // Usar setTimeout para asegurar que el estado se actualice en el orden correcto
          setTimeout(() => {
            if (isMounted) {
              setGameQuestions(shuffled);
              setGameStarted(true);
              setCurrentQuestion(0);
              setScore(0);
              setShowResults(false);
              setStreak(0);
            }
          }, 100);
        }
      } catch (error) {
        console.error('❌ Error processing competition data:', error);
        if (isMounted) {
          localStorage.removeItem('redis-competition');
          setCompetitionStarted(false);
        }
      }
    };
    
    // Sincronizar inmediatamente
    syncGameState();
    
    // Configurar sincronización periódica
    const interval = setInterval(syncGameState, 2000);

    // Limpieza
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [gameMode, lastUpdate, currentUser?.groupId, sessionId, gameQuestions.length, gameStarted]);

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

  // Función para reiniciar la competencia
  const resetCompetition = async () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar la competencia? Esto desconectará a todos los jugadores.')) {
      console.log('🔄 Resetting competition...');
      
      // Limpiar el estado de la competencia
      setCompetitionStarted(false);
      setGameStarted(false);
      setGameQuestions([]);
      
      // Limpiar el almacenamiento local
      localStorage.removeItem('redis-competition');
      
      // Actualizar el estado de los grupos
      const updatedGroups = groups.map(group => ({
        ...group,
        competitionStarted: false,
        lastUpdated: new Date().toISOString()
      }));
      
      setGroups(updatedGroups);
      await saveGroupsToStorage(updatedGroups);
      
      console.log('✅ Competition reset complete');
    }
  };

  const handleStartCompetition = async () => {
    console.log('🔵 handleStartCompetition called');
    
    // 1. Clear any existing game state
    setGameQuestions([]);
    setGameStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setStreak(0);
    
    // 2. Create a new session ID for this game
    const gameSessionId = Math.random().toString(36).substr(2, 9);
    setSessionId(gameSessionId);
    localStorage.setItem("redis-session-id", gameSessionId);
    
    // 3. Prepare competition data
    const competitionData = {
      started: true,
      startedAt: new Date().toISOString(),
      sessionId: gameSessionId,
      initializedBy: 'host',
      lastUpdated: Date.now()
    };
    
    // 4. Save competition data to local storage
    localStorage.setItem('redis-competition', JSON.stringify(competitionData));
    console.log('🏁 Competition data saved:', competitionData);
    
    // 5. Update local state
    setCompetitionStarted(true);
    
    // 6. Update groups with competition status
    const updatedGroups = groups.map(group => ({
      ...group,
      competitionStarted: true,
      lastUpdated: new Date().toISOString()
    }));
    
    // 7. Save groups to storage
    setGroups(updatedGroups);
    await saveGroupsToStorage(updatedGroups);
    
    // 8. Initialize game questions (this will be picked up by the sync effect)
    const shuffled = shuffleQuestions(questionsData, 'all', gameSessionId);
    setGameQuestions(shuffled);
    
    // 9. Force a re-render to ensure state is updated
    setLastUpdated(Date.now());
    
    console.log('✅ Game started successfully with session:', gameSessionId);
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
      return <Dashboard 
        {...dashboardProps} 
        competitionStarted={competitionStarted}
        onResetCompetition={resetCompetition}
      />;
    } else {
      return (
        <div className="min-h-screen bg-redis-black p-4">
          {/* Botón de volver al dashboard */}
          <div className="max-w-7xl mx-auto mb-8">
            <button
              onClick={() => {
                setGameMode('dashboard');
                setCompetitionStarted(false);
              }}
              className="bg-redis-gray hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              ← Volver al Dashboard
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] -mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-8xl mb-6 animate-bounce">🚀</div>
              <h1 className="text-5xl md:text-7xl font-bold text-redis-red mb-4 text-glow-red">
                ¡Competencia en Progreso!
              </h1>
              <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Los grupos están respondiendo las preguntas sobre Redis
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetCompetition}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-all duration-300"
              >
                🔄 Terminar Competencia
              </motion.button>
            </motion.div>
          </div>
        </div>
      );
    }
  }

  if (gameMode === "mobile") {
    // If we have a group in the URL and the game hasn't started yet
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('group');
    
    if (groupId && !gameStarted) {
      // Show waiting screen if game hasn't started yet
      const group = groups.find(g => g.id === groupId);
      const participantName = urlParams.get('name') || 'Jugador';
      
      if (group) {
        return (
          <WaitingScreen 
            groupName={group.name} 
            participantName={participantName}
          />
        );
      }
    }
    
    // Otherwise show group selection
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
