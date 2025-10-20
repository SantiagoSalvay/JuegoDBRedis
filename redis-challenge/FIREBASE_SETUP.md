# 🔥 Configuración de Firebase para Redis Challenge

## Paso 1: Crear proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Haz clic en "Agregar proyecto"
3. Nombre del proyecto: `redis-challenge` (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

## Paso 2: Configurar Realtime Database

1. En el menú lateral, ve a **Realtime Database**
2. Haz clic en "Crear base de datos"
3. Selecciona una ubicación: **United States (us-central1)** (recomendado)
4. Reglas de seguridad: Selecciona **"Iniciar en modo de prueba"**
5. Haz clic en "Habilitar"

## Paso 3: Obtener credenciales

1. Haz clic en el ícono de engranaje ⚙️ → **Configuración del proyecto**
2. En la sección "Tus apps", haz clic en el ícono web `</>`
3. Nombre de la app: `Redis Challenge Web`
4. **NO** marques "También configurar Firebase Hosting"
5. Haz clic en "Registrar app"
6. Copia el objeto `firebaseConfig` que aparece

## Paso 4: Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`)
2. Copia el contenido de `.env.example`
3. Reemplaza los valores con los de tu `firebaseConfig`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=redis-challenge-xxxxx.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://redis-challenge-xxxxx-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=redis-challenge-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=redis-challenge-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Paso 5: Configurar reglas de seguridad (Importante)

En Firebase Console → Realtime Database → Reglas, reemplaza con:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**Nota:** Estas reglas son para desarrollo. Para producción, deberías agregar autenticación.

## Paso 6: Configurar Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable de entorno:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

4. Marca las tres opciones: Production, Preview, Development
5. Haz clic en "Save"

## Paso 7: Probar localmente

```bash
npm run dev
```

Abre el dashboard y verifica que no haya errores en la consola.

## Paso 8: Desplegar

```bash
vercel --prod
```

## ✅ Verificación

Para verificar que Firebase está funcionando:

1. Abre el dashboard en tu PC
2. Escanea el QR con tu celular
3. Únete a un grupo desde el celular
4. En Firebase Console → Realtime Database, deberías ver los datos aparecer en tiempo real
5. En el dashboard de tu PC, deberías ver al participante agregado

## 🔒 Seguridad para Producción (Opcional)

Para mejorar la seguridad en producción:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": "!data.exists() || data.child('locked').val() != true",
        "groups": {
          ".write": true
        },
        "competition": {
          ".write": true
        }
      }
    }
  }
}
```

Esto permite lectura a todos, pero escritura solo si la sesión no está bloqueada.
