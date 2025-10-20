# 📝 Guía de Integración de Firebase

## Resumen

Firebase ya está configurado y listo para usar. Los archivos creados son:

1. `src/firebase.js` - Configuración y funciones de Firebase
2. `src/hooks/useFirebaseSync.js` - Hooks para sincronización automática
3. `.env.example` - Plantilla para variables de entorno
4. `FIREBASE_SETUP.md` - Instrucciones detalladas de configuración

## Próximos pasos

### 1. Configurar Firebase Console

Sigue las instrucciones en `FIREBASE_SETUP.md` para:
- Crear proyecto en Firebase
- Configurar Realtime Database
- Obtener credenciales
- Configurar reglas de seguridad

### 2. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Firebase:

```bash
cp .env.example .env
```

Luego edita `.env` y agrega tus credenciales reales.

### 3. Integrar en App.jsx

Necesitas hacer estos cambios en `App.jsx`:

#### a) Importar los hooks de Firebase

```javascript
import { useFirebaseSync, useCompetitionSync } from './hooks/useFirebaseSync';
```

#### b) Agregar los hooks después de los estados

```javascript
// Después de todos los useState...

// Sincronización de grupos con Firebase
const { saveGroupsToFirebase } = useFirebaseSync(
  sessionId,
  groups,
  setGroups,
  gameMode
);

// Sincronización de competencia con Firebase
const { saveCompetitionToFirebase } = useCompetitionSync(
  sessionId,
  (competitionData) => {
    // Callback cuando cambia el estado de la competencia
    if (gameMode === 'mobile' || gameMode === 'playing') {
      localStorage.setItem('redis-competition', JSON.stringify(competitionData));
      setLastUpdate(Date.now());
    }
  }
);
```

#### c) Reemplazar saveGroupsToStorage

Busca todas las llamadas a `saveGroupsToStorage(updatedGroups)` y reemplázalas con:

```javascript
saveGroupsToFirebase(updatedGroups);
```

Esto incluye:
- En `joinGroup` (línea ~420)
- En `clearGroups` (línea ~445)
- En `handleStartCompetition` (línea ~520)

#### d) Actualizar handleStartCompetition

En la función `handleStartCompetition`, después de guardar en localStorage, agrega:

```javascript
// Guardar en Firebase para sincronización entre dispositivos
await saveCompetitionToFirebase(competitionData);
```

### 4. Eliminar BroadcastChannel (Opcional)

Firebase reemplaza la funcionalidad de BroadcastChannel, así que puedes:

1. Comentar o eliminar el useEffect de BroadcastChannel (líneas 120-163)
2. Comentar o eliminar el estado `gameChannel`
3. Comentar la línea que envía el mensaje en `handleStartCompetition`

O puedes mantenerlo para compatibilidad con pestañas en el mismo navegador.

### 5. Probar

```bash
# Desarrollo local
npm run dev

# Desplegar a Vercel
vercel --prod
```

## Ventajas de Firebase

✅ **Sincronización en tiempo real** entre todos los dispositivos
✅ **No requiere backend propio** - todo funciona desde el frontend
✅ **Compatible con Vercel** - se despliega sin problemas
✅ **Gratis** para proyectos pequeños (hasta 1GB de datos y 10GB de transferencia)
✅ **Escalable** - puede crecer con tu proyecto

## Flujo de datos

```
Dashboard (PC)                    Firebase                    Mobile (Celular)
     |                               |                              |
     |-- joinGroup() --------------->|                              |
     |   saveGroupsToFirebase()      |                              |
     |                               |                              |
     |                               |<------ onGroupsChange() -----|
     |                               |        setGroups()           |
     |                               |                              |
     |-- startCompetition() -------->|                              |
     |   saveCompetitionToFirebase() |                              |
     |                               |                              |
     |                               |<-- onCompetitionChange() ----|
     |                               |    Inicia el juego           |
```

## Troubleshooting

### Error: "Firebase not initialized"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Reinicia el servidor de desarrollo: `npm run dev`

### Los datos no se sincronizan
- Verifica las reglas de seguridad en Firebase Console
- Abre la consola del navegador y busca errores de Firebase
- Verifica que ambos dispositivos usan el mismo `sessionId`

### Error en Vercel
- Asegúrate de agregar las variables de entorno en Vercel Settings
- Re-despliega después de agregar las variables

## Soporte

Si tienes problemas, revisa:
1. Console del navegador (F12)
2. Firebase Console → Realtime Database → Data (para ver los datos en tiempo real)
3. Firebase Console → Realtime Database → Rules (verificar permisos)
