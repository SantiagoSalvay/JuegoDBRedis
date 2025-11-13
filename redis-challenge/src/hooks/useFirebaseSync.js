import { useEffect, useRef } from 'react';
import { db } from '../firebase';

/**
 * Hook para sincronizar grupos con Firebase
 * @param {string} sessionId - ID de la sesión actual
 * @param {Array} groups - Grupos locales
 * @param {Function} setGroups - Función para actualizar grupos
 * @param {string} gameMode - Modo del juego (dashboard, mobile, playing)
 */
export const useFirebaseSync = (sessionId, groups, setGroups, gameMode) => {
  const unsubscribeRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    console.log('🔥 Firebase: Setting up sync for session:', sessionId);

    // Escuchar cambios en los grupos desde Firebase
    const unsubscribe = db.onGroupsChange(sessionId, (firebaseGroups) => {
      if (isUpdatingRef.current) {
        // Evitar bucle infinito: si estamos actualizando, no procesar
        console.log('🔥 Firebase: Skipping update (local change)');
        return;
      }

      console.log('🔥 Firebase: Groups updated from server:', firebaseGroups);
      setGroups(firebaseGroups);
      
      // También actualizar localStorage para compatibilidad
      localStorage.setItem('redis-groups', JSON.stringify(firebaseGroups));
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup
    return () => {
      console.log('🔥 Firebase: Cleaning up sync');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [sessionId, setGroups]);

  // Función para guardar grupos en Firebase
  const saveGroupsToFirebase = async (newGroups) => {
    if (!sessionId) return;

    try {
      isUpdatingRef.current = true;
      console.log('🔥 Firebase: Saving groups to server:', newGroups);
      
      await db.saveGroups(sessionId, newGroups);
      
      // También guardar en localStorage para respaldo
      localStorage.setItem('redis-groups', JSON.stringify(newGroups));
      
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 500);
      
      return true;
    } catch (error) {
      console.error('🔥 Firebase: Error saving groups:', error);
      isUpdatingRef.current = false;
      return false;
    }
  };

  return { saveGroupsToFirebase };
};

/**
 * Hook para sincronizar el estado de la competencia con Firebase
 * @param {string} sessionId - ID de la sesión actual
 * @param {Function} onCompetitionUpdate - Callback cuando cambia el estado
 */
export const useCompetitionSync = (sessionId, onCompetitionUpdate) => {
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    console.log('🔥 Firebase: Setting up competition sync for session:', sessionId);

    // Escuchar cambios en el estado de la competencia
    const unsubscribe = db.onCompetitionChange(sessionId, (competitionData) => {
      console.log('🔥 Firebase: Competition state updated:', competitionData);
      onCompetitionUpdate(competitionData);
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup
    return () => {
      console.log('🔥 Firebase: Cleaning up competition sync');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [sessionId, onCompetitionUpdate]);

  // Función para guardar estado de competencia en Firebase
  const saveCompetitionToFirebase = async (competitionData) => {
    if (!sessionId) return;

    try {
      console.log('🔥 Firebase: Saving competition state:', competitionData);
      await db.saveCompetitionState(sessionId, competitionData);
      return true;
    } catch (error) {
      console.error('🔥 Firebase: Error saving competition state:', error);
      return false;
    }
  };

  return { saveCompetitionToFirebase };
};

export const useEffectsSync = (sessionId, onEffectsUpdate) => {
  const unsubscribeRef = useRef(null);
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = db.onEffectsChange(sessionId, (effects) => {
      onEffectsUpdate && onEffectsUpdate(effects);
    });
    unsubscribeRef.current = unsubscribe;
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [sessionId, onEffectsUpdate]);
  return {};
};

export const useScoresSync = (sessionId, onScoresUpdate) => {
  const unsubscribeRef = useRef(null);
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = db.onScoresChange(sessionId, (scores) => {
      onScoresUpdate && onScoresUpdate(scores);
    });
    unsubscribeRef.current = unsubscribe;
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [sessionId, onScoresUpdate]);
  return {};
};
