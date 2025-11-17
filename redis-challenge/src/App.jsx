import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StartScreen from "./components/StartScreen";
import QuestionCard from "./components/QuestionCard";
import ScoreBoard from "./components/ScoreBoard";
import ResultScreen from "./components/ResultScreen";
import Dashboard from "./components/Dashboard";
import MobileGroupSelection from "./components/MobileGroupSelection";
import WaitingScreen from "./components/WaitingScreen";
import PowerCardsModal from "./components/PowerCardsModal";
import questionsData from "./data/questions.json";
import { useFirebaseSync, useCompetitionSync, useEffectsSync, useScoresSync } from './hooks/useFirebaseSync';

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
    const j = Math.abs(hash) % (i + 1);
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
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [offeredPowers, setOfferedPowers] = useState([]);
  const [pendingResult, setPendingResult] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const pendingResultRef = useRef(null);

  // Estado de grupos
  const [groups, setGroups] = useState(GROUPS_CONFIG);
  const [currentUser, setCurrentUser] = useState(null);
  const [gameMode, setGameMode] = useState("dashboard");
  const [sessionId, setSessionId] = useState("");
  const [competitionStarted, setCompetitionStarted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [effectsMap, setEffectsMap] = useState({});
  const [effectToast, setEffectToast] = useState(null);
  const [teamScores, setTeamScores] = useState({});
  const teamScoresRef = useRef({});
  const [consumedEffectKeys, setConsumedEffectKeys] = useState([]);
  const [doubleNext, setDoubleNext] = useState(false);

  // BroadcastChannel para comunicación entre pestañas
  const [gameChannel, setGameChannel] = useState(null);

  // 🔥 Firebase: Sincronización de grupos en tiempo real
  const { saveGroupsToFirebase } = useFirebaseSync(
    sessionId,
    groups,
    setGroups,
    gameMode
  );

  // 🔥 Firebase: Sincronización de competencia en tiempo real
  const { saveCompetitionToFirebase } = useCompetitionSync(
    sessionId,
    (competitionData) => {
      // Callback cuando cambia el estado de la competencia desde Firebase
      if (gameMode === 'mobile' || gameMode === 'playing') {
        console.log('🔥 Competition update received from Firebase:', competitionData);
        localStorage.setItem('redis-competition', JSON.stringify(competitionData));
        setLastUpdate(Date.now());
      }
    }
  );

  useEffectsSync(sessionId, (effects) => {
    setEffectsMap(effects || {});
  });

  const setTeamScoresSafe = (map) => {
    const next = map || {};
    teamScoresRef.current = next;
    setTeamScores(next);
    writeTeamScoresStorage(next);
  };

  useScoresSync(sessionId, (scores) => {
    const incoming = scores || {};
    const hasIncoming = Object.keys(incoming).length > 0;
    if (hasIncoming) {
      setTeamScoresSafe(incoming);
    } else {
      // Prefer local cached scores when server returns empty (offline or not initialized)
      const cached = readTeamScoresStorage();
      if (Object.keys(cached).length > 0) {
        setTeamScoresSafe(cached);
      }
    }
  });

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

  // Inicializar BroadcastChannel
  useEffect(() => {
    // Crear canal de comunicación
    const channel = new BroadcastChannel('redis-game-channel');
    setGameChannel(channel);

    // Escuchar mensajes del canal
    channel.onmessage = (event) => {
      console.log('📡 Mensaje recibido:', event.data);
      
      if (event.data.type === 'START_GAME') {
        console.log('🎮 Señal de inicio de juego recibida');
        const { sessionId: gameSessionId } = event.data;
        
        // Solo procesar si estamos en modo móvil o jugando
        if (gameMode === 'mobile' || gameMode === 'playing') {
          console.log('📱 Iniciando juego en dispositivo móvil...');
          
          // IMPORTANTE: Actualizar el sessionId local para que coincida con el del host
          setSessionId(gameSessionId);
          localStorage.setItem('redis-session-id', gameSessionId);
          
          // Actualizar localStorage con los datos de la competencia
          const competitionData = {
            started: true,
            startedAt: new Date().toISOString(),
            sessionId: gameSessionId,
            initializedBy: 'broadcast',
            lastUpdated: Date.now()
          };
          localStorage.setItem('redis-competition', JSON.stringify(competitionData));
          
          // Forzar actualización
          setLastUpdate(Date.now());
        }
      }
    };

    // Cleanup
    return () => {
      channel.close();
    };
  }, [gameMode]);

  // Inicialización
  useEffect(() => {
    console.log('🔍 Initializing app...');
    
    // 1. Resetear estado del juego
    console.log('🔄 Resetting game state...');
    setCompetitionStarted(false);
    setGameStarted(false);
    setGameQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setStreak(0);
    setAnsweredCount(0);
    setAnsweredCount(0);

    // 2. Cargar grupos
    console.log('📂 Loading groups...');
    loadGroupsFromStorage();

    // 2b. Cargar puntajes de equipos desde almacenamiento local (fallback)
    const storedTeamScores = readTeamScoresStorage();
    if (storedTeamScores && Object.keys(storedTeamScores).length > 0) {
      setTeamScores(storedTeamScores);
    }

    // 3. Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    const urlSessionId = urlParams.get('session');
    
    console.log('🌐 URL Parameters:', { urlMode, urlSessionId });

    // 4. Manejar el modo de la aplicación
    if (urlMode === 'mobile') {
      console.log('📱 Mobile mode detected from URL');
      setGameMode('mobile');
      
      // Si hay un sessionId en la URL, usarlo
      if (urlSessionId) {
        console.log('🔄 Using session ID from URL:', urlSessionId);
        localStorage.setItem("redis-session-id", urlSessionId);
        setSessionId(urlSessionId);
      }
      
      // Intentar cargar usuario desde localStorage
      const storedUser = localStorage.getItem('redis-current-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('👤 Loaded user from storage:', user.name);
          
          // Asegurar que el usuario tenga la estructura correcta
          if (!user.group && user.groupId) {
            user.group = {
              id: user.groupId,
              name: user.groupName || '',
              color: user.groupColor || ''
            };
            console.log('🔧 Fixed user structure:', user);
            localStorage.setItem('redis-current-user', JSON.stringify(user));
          }
          
          setCurrentUser(user);
          setGameMode('playing');
        } catch (e) {
          console.error('❌ Error parsing stored user:', e);
          localStorage.removeItem('redis-current-user');
        }
      }
    } else {
      // Modo dashboard por defecto
      console.log('🖥️ Setting dashboard mode');
      setGameMode('dashboard');
      
      // Limpiar cualquier estado de competencia previo
      localStorage.removeItem('redis-competition');
      
      // Para modo dashboard, SIEMPRE generar un nuevo sessionId al recargar
      const newSessionId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("redis-session-id", newSessionId);
      setSessionId(newSessionId);
      console.log('🆕 New session ID generated:', newSessionId);
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
        
        // Para dispositivos móviles que reciben broadcast, siempre aceptar la competencia
        if (compData.initializedBy === 'broadcast' && urlMode === 'mobile') {
          console.log('📱 Mobile device accepting broadcast competition');
          setCompetitionStarted(!!compData.started);
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
      
      console.log('🔄 Sync triggered - Mode:', gameMode, 'GameStarted:', gameStarted, 'CurrentUser:', currentUser?.name);
      
      // 1. Actualizar grupos
      const updatedGroups = loadGroupsFromStorage();
      if (updatedGroups) {
        console.log("🔄 Groups updated");
      }
      
      // 2. Verificar estado de la competencia
      const competitionData = localStorage.getItem('redis-competition');
      if (!competitionData) {
        console.log('ℹ️ No competition data in localStorage');
        return;
      }

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

        // Para jugadores que reciben broadcast, actualizar sessionId si es necesario
        if (compSessionId !== sessionId) {
          if (initializedBy === 'broadcast') {
            console.log(`🔄 Updating sessionId from ${sessionId} to ${compSessionId}`);
            setSessionId(compSessionId);
            localStorage.setItem('redis-session-id', compSessionId);
            // No hacer return aquí, continuar con la lógica de inicio
          } else {
            console.log(`🔀 Session ID mismatch: ${sessionId} (current) vs ${compSessionId} (stored)`);
            return;
          }
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
          console.log('🎮 PLAYER: Attempting to start game...');
          console.log('  - Session ID:', compSessionId);
          console.log('  - Current User:', currentUser);
          console.log('  - Game Started:', gameStarted);
          console.log('  - Competition Started:', started);
          console.log('  - Questions loaded:', gameQuestions.length);
          
          if (!currentUser) {
            console.warn('⚠️ Current user not found, cannot start game');
            return;
          }
          
          // Evitar iniciar el juego si ya hay preguntas cargadas
          if (gameQuestions.length > 0) {
            console.log('⚠️ Questions already loaded, skipping initialization');
            return;
          }
          
          console.log('✅ Starting game for player:', currentUser.name);
          const shuffled = shuffleQuestions(questionsData, currentUser.groupId || 'all', compSessionId);
          
          console.log('📝 Setting game state...');
          // Actualizar estado inmediatamente
          setGameQuestions(shuffled);
          setGameStarted(true);
          setCurrentQuestion(0);
          setScore(0);
          setShowResults(false);
          setStreak(0);
          
          console.log('🎮 Game started with', shuffled.length, 'questions');
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
    saveGroupsToFirebase(updatedGroups);

    // Guardar información del usuario actual
    const selectedGroup = updatedGroups.find((g) => g.id === groupId);
    const userInfo = {
      ...newParticipant,
      groupId: groupId,
      groupName: selectedGroup?.name || '',
      groupColor: selectedGroup?.color || '',
      name: `${participant.firstName} ${participant.lastName}`,
      group: {
        id: groupId,
        name: selectedGroup?.name || '',
        color: selectedGroup?.color || ''
      }
    };
    
    console.log("💾 Saving current user:", userInfo);
    localStorage.setItem('redis-current-user', JSON.stringify(userInfo));
    setCurrentUser(userInfo);
    
    // Cambiar a modo playing
    setGameMode('playing');
    console.log("✅ User joined group and mode changed to 'playing'");

    return updatedGroups;
  };

  const clearGroups = () => {
    console.log("🧹 Clearing all groups");
    const resetGroups = GROUPS_CONFIG.map((group) => ({
      ...group,
      participants: [],
    }));
    setGroups(resetGroups);
    saveGroupsToFirebase(resetGroups);
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
    setAnsweredCount(0);
    try {
      const scores = JSON.parse(localStorage.getItem('redis-scores') || '{}');
      if (currentUser?.id) {
        scores[currentUser.id] = 0;
        localStorage.setItem('redis-scores', JSON.stringify(scores));
      }
    } catch {}
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
      await saveGroupsToFirebase(updatedGroups);
      
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
    
    // 2. USAR EL MISMO sessionId (NO crear uno nuevo)
    // Los móviles ya están conectados con este sessionId del QR
    const gameSessionId = sessionId; // Usar el sessionId existente
    console.log('🎮 Using existing session ID:', gameSessionId);
    
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
    
    // 4b. 🔥 Save competition data to Firebase for cross-device sync
    await saveCompetitionToFirebase(competitionData);
    console.log('🔥 Competition data synced to Firebase');
    
    // 5. 📡 ENVIAR MENSAJE A TODOS LOS DISPOSITIVOS VÍA BROADCASTCHANNEL
    if (gameChannel) {
      const message = {
        type: 'START_GAME',
        sessionId: gameSessionId,
        timestamp: Date.now()
      };
      gameChannel.postMessage(message);
      console.log('📡 Mensaje de inicio enviado a todos los dispositivos:', message);
    }
    
    // 6. Update local state
    setCompetitionStarted(true);
    
    // 7. Update groups with competition status
    const updatedGroups = groups.map(group => ({
      ...group,
      competitionStarted: true,
      lastUpdated: new Date().toISOString()
    }));
    
    // 8. Save groups to Firebase
    setGroups(updatedGroups);
    await saveGroupsToFirebase(updatedGroups);
    
    // 9a. Initialize team scores per group in Firebase
    const initialScores = groups.reduce((acc, g) => {
      acc[g.id] = 0;
      return acc;
    }, {});
    setTeamScores(initialScores);
    import('./firebase').then(({ db }) => {
      db.saveScores(sessionId, initialScores);
    });

    // 9b. Initialize game questions for HOST
    const shuffled = shuffleQuestions(questionsData, 'all', gameSessionId);
    setGameQuestions(shuffled);
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setStreak(0);
    
    // 10. Force a re-render to ensure state is updated
    setLastUpdate(Date.now());
    
    console.log('✅ Game started successfully with session:', gameSessionId);
  };

  const generateRandomPowers = (n = 3) => {
    const pool = [
      { key: "double_points", name: "Doble Puntos", type: "double_points", value: 2, timing: "immediate" },
      { key: "skip_question", name: "Saltear Pregunta", type: "skip_question", value: 1, timing: "immediate" },
      { key: "steal_points", name: "Robar", type: "steal_points", value: Math.floor(Math.random() * 3) + 1, timing: "immediate" }
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n).map((p) => ({
      id: `${p.key}-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
      name: p.name,
      type: p.type,
      value: p.value,
      timing: p.timing
    }));
  };
  const getRandomTargetUser = () => {
    const participants = groups.flatMap(g => (g.participants || []).map(p => ({ ...p, groupId: g.id })));
    const others = participants.filter(p => p.id !== currentUser?.id);
    if (others.length === 0) return null;
    return others[Math.floor(Math.random() * others.length)];
  };

  const readScoresStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('redis-scores') || '{}');
    } catch { return {}; }
  };

  const writeScoresStorage = (map) => {
    localStorage.setItem('redis-scores', JSON.stringify(map));
  };

  const applySelectedPowerAndAdvance = (power) => {
    const pr = pendingResult || pendingResultRef.current;
    const wasCorrect = pr?.isCorrect ?? false;
    const basePoints = pr?.basePoints ?? 0;
    const newStreakBase = pr?.newStreakBase ?? 0;

    let pointsToAdd = 0;
    let nextStreak = 0;

    if (power?.type === 'double_points') {
      setDoubleNext(true);
      if (wasCorrect) {
        pointsToAdd = basePoints;
        nextStreak = newStreakBase;
      } else {
        pointsToAdd = 0;
        nextStreak = 0;
      }
    } else if (power?.type === 'skip_question') {
      pointsToAdd = basePoints;
      nextStreak = wasCorrect ? newStreakBase : 1;
    } else {
      if (wasCorrect) {
        pointsToAdd = basePoints;
        nextStreak = newStreakBase;
      } else {
        pointsToAdd = 0;
        nextStreak = 0;
      }
    }

    if (power?.type === 'steal_points') {
      const targetGroupId = power.targetGroupId;
      if (targetGroupId) {
        const points = Math.min(3, Math.max(1, power.value || 1));
        const payload = {
          type: 'steal_points',
          points,
          fromUserId: currentUser?.id,
          fromGroupId: currentUser?.groupId,
          targetGroupId,
          questionIndex: currentQuestion,
          timestamp: Date.now()
        };
        import('./firebase').then(({ db }) => {
          db.pushEffect(sessionId, payload);
        });
        const newScores = { ...teamScoresRef.current };
        const fromId = currentUser?.groupId;
        newScores[fromId] = (newScores[fromId] || 0) + points;
        newScores[targetGroupId] = Math.max(0, (newScores[targetGroupId] || 0) - points);
        setTeamScoresSafe(newScores);
        import('./firebase').then(({ db }) => {
          db.saveScores(sessionId, newScores);
        });
        const targetName = groups.find(g => g.id === targetGroupId)?.name || '';
        setEffectToast({ 
          type: 'steal_points_success', 
          points, 
          targetGroupId, 
          fromGroupId: fromId, 
          fromScore: newScores[fromId] || 0,
          targetScore: newScores[targetGroupId] || 0,
          message: `Robaste +${points} a ${targetName}` 
        });
        setTimeout(() => setEffectToast(null), 3000);
      }
    }

    // swap_points eliminado

    

    if (power?.type !== 'steal_points' && power?.type !== 'swap_points') {
      setScore((prev) => prev + pointsToAdd);
      setStreak(nextStreak);
    } else {
      setStreak(nextStreak);
    }

    setShowPowerModal(false);
    setOfferedPowers([]);
    setPendingResult(null);
    pendingResultRef.current = null;
    setAnsweredCount((c) => c + 1);

    if (currentQuestion < gameQuestions.length - 1) {
      const nextIndex = currentQuestion + 1;
      const nextQuestion = gameQuestions[nextIndex];
      if (nextQuestion) {
        setCurrentQuestion(nextIndex);
      } else {
        setShowResults(true);
      }
    } else {
      setShowResults(true);
    }
  };

  const handleAnswer = (isCorrect) => {
    console.log('🎯 handleAnswer called:', { 
      isCorrect, 
      currentQuestion, 
      totalQuestions: gameQuestions.length,
      nextQuestionIndex: currentQuestion + 1
    });
    
    let points = 10;
    const newStreak = isCorrect ? streak + 1 : 0;
    if (doubleNext) {
      points = isCorrect ? 20 : 0;
      setDoubleNext(false);
    } else {
      if (isCorrect && newStreak >= 3 && newStreak % 3 === 0) {
        points += 5;
      }
    }

    const willOfferPower = [2, 4, 6, 8].includes(answeredCount + 1);
    const pending = { isCorrect, basePoints: points, newStreakBase: newStreak };
    setPendingResult(pending);
    pendingResultRef.current = pending;

    const pendingKeys = Object.keys(effectsMap || {}).filter(k => !consumedEffectKeys.includes(k));
    const targetEffects = pendingKeys
      .map(k => ({ key: k, ...effectsMap[k] }))
      .filter(e => e.targetGroupId === currentUser?.groupId);
    if (targetEffects.length > 0) {
      const e = targetEffects[0];
      setEffectToast({ type: e.type, points: e.points, fromGroupId: e.fromGroupId, targetGroupId: e.targetGroupId });
      setConsumedEffectKeys(prev => [...prev, e.key]);
      setTimeout(() => setEffectToast(null), 3000);
    }

    if (willOfferPower) {
      setOfferedPowers(generateRandomPowers(3));
      setShowPowerModal(true);
    } else {
      setTimeout(() => {
        applySelectedPowerAndAdvance(null);
      }, 0);
    }
  };

  useEffect(() => {
    const handler = (ev) => {
      const e = ev.detail;
      if (currentUser?.groupId && e?.targetGroupId === currentUser.groupId) {
        setEffectToast({ type: e.type, points: e.points, fromGroupId: e.fromGroupId });
        setTimeout(() => setEffectToast(null), 3000);
        setScore((prev) => Math.max(0, prev - e.points));
      }
    };
    window.addEventListener('redis-effect-local', handler);
    return () => window.removeEventListener('redis-effect-local', handler);
  }, [currentUser?.groupId]);

  useEffect(() => {
    if (!currentUser?.groupId) return;
    const pendingKeys = Object.keys(effectsMap || {}).filter(k => !consumedEffectKeys.includes(k));
    for (const k of pendingKeys) {
      const e = effectsMap[k];
      if (e && e.targetGroupId === currentUser.groupId) {
        setEffectToast({ type: e.type, points: e.points, fromGroupId: e.fromGroupId, targetGroupId: e.targetGroupId });
        setConsumedEffectKeys(prev => [...prev, k]);
        setTimeout(() => setEffectToast(null), 3000);
        if (e.type === 'steal_points') {
          setTeamScores(prev => ({
            ...prev,
            [currentUser.groupId]: Math.max(0, (prev[currentUser.groupId] || 0) - (e.points || 0))
          }));
        }
      }
    }
  }, [effectsMap, currentUser?.groupId]);

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
    teamScores,
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
    console.log('🎨 Rendering playing mode:', {
      gameStarted,
      showResults,
      currentUser: currentUser?.name,
      questionsCount: gameQuestions.length
    });

    // Si el juego no ha comenzado, mostrar pantalla de espera
    if (!gameStarted && !showResults && currentUser) {
      console.log('⏳ Showing WaitingScreen');
      return (
        <WaitingScreen 
          groupName={currentUser.groupName} 
          participantName={currentUser.name}
        />
      );
    }

    console.log('🎮 Rendering game screen');
    
    const shouldShowQuestions = gameStarted && !showResults && gameQuestions.length > 0;
    const currentQuestionData = gameQuestions[currentQuestion];
    
    console.log('📊 Should show questions?', shouldShowQuestions, {
      gameStarted,
      showResults,
      questionsLength: gameQuestions.length,
      currentQuestion,
      hasCurrentQuestion: !!currentQuestionData
    });
    
    // Si no hay pregunta actual, mostrar error detallado
    if (shouldShowQuestions && !currentQuestionData) {
      console.error('❌ Error: No hay pregunta en el índice', currentQuestion);
      return (
        <div className="min-h-screen bg-redis-black flex items-center justify-center p-4">
          <div className="text-white text-center max-w-md bg-redis-gray rounded-xl p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Error cargando pregunta</h2>
            <div className="bg-redis-black rounded-lg p-4 mb-4 text-left">
              <p className="text-gray-400 text-sm mb-2">🔍 Información de debug:</p>
              <p className="text-redis-red font-mono text-xs mb-1">
                Pregunta actual: {currentQuestion + 1}
              </p>
              <p className="text-redis-red font-mono text-xs mb-1">
                Total preguntas: {gameQuestions.length}
              </p>
              <p className="text-redis-red font-mono text-xs mb-1">
                Índice: {currentQuestion} (debe ser {'<'} {gameQuestions.length})
              </p>
              <p className="text-redis-red font-mono text-xs">
                Estado: gameStarted={gameStarted.toString()}, showResults={showResults.toString()}
              </p>
            </div>
            <p className="text-gray-300 mb-6">
              La pregunta {currentQuestion + 1} no está disponible en el array de preguntas.
            </p>
            <button 
              onClick={handleRestart}
              className="bg-redis-red hover:bg-red-700 px-6 py-3 rounded-lg font-bold w-full"
            >
              🔄 Reiniciar Juego
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-redis-black">
        {/* Debug panel - visible en desarrollo */}
        {shouldShowQuestions && (
          <div className="fixed top-2 right-2 bg-black/80 text-white text-xs p-2 rounded-lg font-mono z-50 max-w-xs">
            <p className="text-green-400 font-bold mb-1">🐛 Debug Info:</p>
            <p>Q: {currentQuestion + 1}/{gameQuestions.length}</p>
            <p>Idx: {currentQuestion}</p>
            <p>Existe: {currentQuestionData ? '✅' : '❌'}</p>
            <p className="text-gray-400 text-[10px] mt-1">
              {currentQuestionData ? currentQuestionData.question.substring(0, 30) + '...' : 'Sin pregunta'}
            </p>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {shouldShowQuestions && currentQuestionData && (
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
                question={currentQuestionData}
                questionNumber={currentQuestion + 1}
                totalQuestions={gameQuestions.length}
                onAnswer={handleAnswer}
              />
              {showPowerModal && (
                <PowerCardsModal
                  offeredPowers={offeredPowers}
                  groups={groups}
                  onConfirm={applySelectedPowerAndAdvance}
                  onClose={() => {
                    setShowPowerModal(false);
                    setOfferedPowers([]);
                    setPendingResult(null);
                    pendingResultRef.current = null;
                  }}
                />
              )}
              {effectToast && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg z-50 ${
                    effectToast.type === 'swap_points'
                      ? 'bg-yellow-500 text-black'
                      : effectToast.type === 'steal_points_success'
                        ? 'bg-green-600 text-white'
                        : 'bg-redis-red text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {effectToast.type === 'swap_points' ? '🔁' : effectToast.type === 'steal_points_success' ? '🏴‍☠️' : '🚨'}
                    </span>
                    <span>
                      {
                        effectToast.type === 'swap_points'
                          ? `Intercambio de puntos: ${groups.find(g => g.id === effectToast.fromGroupId)?.name || ''} ↔ ${groups.find(g => g.id === effectToast.targetGroupId)?.name || ''}`
                          : effectToast.type === 'steal_points_success'
                            ? effectToast.message || `Robaste +${effectToast.points} puntos`
                            : `Tu equipo recibió -${effectToast.points} puntos de ${groups.find(g => g.id === effectToast.fromGroupId)?.name || ''}`
                      }
                    </span>
                    {effectToast.type === 'steal_points_success' && (
                      <div className="mt-1 text-sm">
                        Tu equipo: {effectToast.fromScore} | {groups.find(g => g.id === effectToast.targetGroupId)?.name || ''}: {effectToast.targetScore}
                      </div>
                    )}
                    {effectToast.type === 'swap_points' && (
                      <div className="mt-1 text-sm">
                        {groups.find(g => g.id === effectToast.fromGroupId)?.name || ''}: {(effectToast.fromScore ?? (teamScores[effectToast.fromGroupId] ?? 0))} | {groups.find(g => g.id === effectToast.targetGroupId)?.name || ''}: {(effectToast.targetScore ?? (teamScores[effectToast.targetGroupId] ?? 0))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {effectToast && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-6 py-4 rounded-2xl shadow-2xl ${
                      effectToast.type === 'swap_points'
                        ? 'bg-yellow-500 text-black'
                        : effectToast.type === 'steal_points_success'
                          ? 'bg-green-600 text-white'
                          : 'bg-redis-red text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-xl font-bold">
                      <span className="text-3xl">
                        {effectToast.type === 'swap_points' ? '🔁' : effectToast.type === 'steal_points_success' ? '🏴‍☠️' : '🚨'}
                      </span>
                      <span>
                        {
                          effectToast.type === 'swap_points'
                            ? `Intercambio: ${groups.find(g => g.id === effectToast.fromGroupId)?.name || ''} ↔ ${groups.find(g => g.id === effectToast.targetGroupId)?.name || ''}`
                            : effectToast.type === 'steal_points_success'
                              ? effectToast.message || `Robaste +${effectToast.points} puntos`
                              : `Penalización: -${effectToast.points}`
                        }
                      </span>
                    </div>
                    {effectToast.type === 'swap_points' && (
                      <div className="mt-2 text-sm">
                        {groups.find(g => g.id === effectToast.fromGroupId)?.name || ''}: {(effectToast.fromScore ?? (teamScores[effectToast.fromGroupId] ?? 0))} | {groups.find(g => g.id === effectToast.targetGroupId)?.name || ''}: {(effectToast.targetScore ?? (teamScores[effectToast.targetGroupId] ?? 0))}
                      </div>
                    )}
                    {effectToast.type === 'steal_points_success' && (
                      <div className="mt-2 text-sm">
                        Tu equipo: {(effectToast.fromScore ?? (teamScores[effectToast.fromGroupId] ?? 0))} | {groups.find(g => g.id === effectToast.targetGroupId)?.name || ''}: {(effectToast.targetScore ?? (teamScores[effectToast.targetGroupId] ?? 0))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
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
  const readTeamScoresStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('redis-team-scores') || '{}');
    } catch { return {}; }
  };

  const writeTeamScoresStorage = (map) => {
    localStorage.setItem('redis-team-scores', JSON.stringify(map));
  };
