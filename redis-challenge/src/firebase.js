import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, remove, update } from 'firebase/database';

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Funciones helper para manejar la base de datos
export const db = {
  // Guardar grupos en Firebase
  saveGroups: async (sessionId, groups) => {
    const groupsRef = ref(database, `sessions/${sessionId}/groups`);
    await set(groupsRef, groups);
  },

  // Escuchar cambios en los grupos
  onGroupsChange: (sessionId, callback) => {
    const groupsRef = ref(database, `sessions/${sessionId}/groups`);
    return onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
  },

  // Guardar estado de la competencia
  saveCompetitionState: async (sessionId, competitionData) => {
    const competitionRef = ref(database, `sessions/${sessionId}/competition`);
    await set(competitionRef, competitionData);
  },

  // Escuchar cambios en el estado de la competencia
  onCompetitionChange: (sessionId, callback) => {
    const competitionRef = ref(database, `sessions/${sessionId}/competition`);
    return onValue(competitionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
  },

  // Limpiar sesión
  clearSession: async (sessionId) => {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    await remove(sessionRef);
  }
};

export default database;
