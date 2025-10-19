# 🎮 Guía del Sistema de Grupos - Redis Challenge

## 📋 Descripción General

El **Redis Challenge** ahora incluye un sistema de grupos interactivo que permite que múltiples equipos compitan simultáneamente usando sus dispositivos móviles, mientras el instructor controla el juego desde una pantalla principal (TV/proyector).

## 🎯 Configuración de Grupos

### Grupos Disponibles (7 en total):
1. **Grupo 1** - MongoDB (Verde #4DB33D)
2. **Grupo 2** - Cassandra (Azul #1287A5) 
3. **Grupo 3** - Neo4j (Azul claro #008CC1)
4. **Grupo 4** - CouchDB (Rojo #E42528)
5. **Grupo 6** - BigTable (Azul Google #4285F4)
6. **Grupo 7** - Amazon DynamoDB (Naranja #FF9900)
7. **Grupo 8** - ArangoDB (Verde oscuro #68A063)

> ⚠️ **Nota**: El Grupo 5 (Redis) está reservado para los instructores y no aparece en la selección.

## 🚀 Cómo Usar el Sistema

### 1. 📺 Configuración en la Pantalla Principal (TV/Proyector)

1. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```

2. **Abrir en navegador**:
   - Ve a `http://localhost:5174` (o el puerto que indique)
   - Se mostrará automáticamente el **Dashboard Principal**

3. **Pantalla Dashboard incluye**:
   - ✅ **Código QR** grande para que los estudiantes escaneen
   - ✅ **Lista de grupos** con participantes en tiempo real
   - ✅ **Contador** de participantes conectados
   - ✅ **Instrucciones** claras para los estudiantes

### 2. 📱 Proceso para Estudiantes (Móviles)

#### Paso 1: Escanear QR
- Los estudiantes abren la cámara de su celular
- Escanean el código QR mostrado en la pantalla
- Esto los llevará automáticamente a la **página de selección de grupos**

#### Paso 2: Seleccionar Grupo
- Aparece una lista de los 7 grupos disponibles
- Cada grupo muestra:
  - 🎨 **Color identificativo**
  - 👥 **Número de participantes** ya registrados
  - 📋 **Lista de nombres** de quienes ya se unieron

#### Paso 3: Registro Personal
- Al tocar su grupo, aparece un formulario con:
  - 📝 **Campo "Nombre"** (requerido)
  - 📝 **Campo "Apellido"** (requerido)
  - 👥 **Vista previa** de participantes del grupo
- Completan sus datos y tocan **"🚀 Unirse al Grupo"**

#### Paso 4: Ingresar al Juego
- Automáticamente son redirigidos al juego
- Ven la **pantalla de inicio** personalizada con su grupo
- Pueden comenzar a responder las preguntas

### 3. 🎮 Experiencia de Juego

#### Para los Estudiantes:
- **Preguntas personalizadas**: Cada grupo recibe las mismas preguntas pero en **orden aleatorio diferente**
- **Interfaz móvil optimizada**: Diseño responsivo perfecto para celulares
- **Indicador de grupo**: Su grupo aparece en la esquina superior
- **Mismas reglas**: +10 puntos por acierto, +5 por racha de 3

#### Para el Instructor:
- **Dashboard en tiempo real**: Ve todos los grupos y participantes conectándose
- **Botón "Comenzar Competencia"**: Cuando estén listos los grupos
- **Control total**: Puede reiniciar o volver al dashboard principal

## 🔧 Funcionalidades Técnicas

### Sistema de URLs Inteligente:

1. **Dashboard Principal**: `http://localhost:5174/`
   - Modo automático para pantalla grande
   - Genera QR con URL móvil

2. **Selección Móvil**: `http://localhost:5174/?mode=mobile&session=abc123`
   - Se abre al escanear QR
   - Muestra interfaz de selección de grupos

3. **Juego Individual**: `http://localhost:5174/?group=1`
   - Se crea automáticamente al unirse a grupo
   - Carga preguntas aleatorias para ese grupo

### Sincronización de Estado:
- ✅ **Participantes en tiempo real**: El dashboard se actualiza automáticamente
- ✅ **Preguntas únicas por grupo**: Algoritmo determinístico basado en ID del grupo
- ✅ **Session ID único**: Cada sesión de clase tiene identificador único

## 🎯 Flujo de una Clase Típica

### Preparación (5 minutos):
1. Instructor inicia la aplicación en su laptop
2. Conecta laptop al proyector/TV
3. Verifica que aparezca el Dashboard con QR

### Registro de Grupos (10 minutos):
1. Estudiantes escanean QR desde sus celulares
2. Cada grupo selecciona su categoría de base de datos
3. Todos los miembros se registran con nombre y apellido
4. Dashboard muestra progreso en tiempo real

### Competencia (15-20 minutos):
1. Instructor presiona **"🚀 ¡Comenzar Competencia!"**
2. Cada grupo juega simultáneamente en sus dispositivos
3. Dashboard cambia a modo "Competencia en Progreso"
4. Estudiantes responden las 10 preguntas sobre Redis

### Resultados y Discusión (10 minutos):
1. Cada grupo ve su puntaje final individual
2. Instructor puede ver todos los resultados
3. Discusión grupal sobre las preguntas más difíciles

## 🛠️ Resolución de Problemas

### Problema: "No aparece el código QR"
**Solución**: 
- Verificar que la app esté corriendo en `localhost:5174`
- Refrescar la página (F5)
- Comprobar conexión a Internet

### Problema: "No puedo escanear el QR"
**Solución**:
- Usar la app de cámara nativa del celular
- Acercarse más a la pantalla
- Verificar que haya buena iluminación
- URL manual: copiar la dirección que aparece bajo el QR

### Problema: "No aparece mi grupo"
**Solución**:
- Solo hay 7 grupos disponibles (sin el Grupo 5)
- Refrescar la página en el celular
- Verificar que esté en el modo correcto (URL debe tener `?mode=mobile`)

### Problema: "Las preguntas son iguales para todos"
**Solución**:
- Las preguntas SON las mismas, pero en **orden diferente**
- Esto es intencional para fairness
- Cada grupo tiene su propia semilla aleatoria

## ⚙️ Configuración Avanzada

### Cambiar Grupos Disponibles:
Editar `src/context/GameContext.jsx`, líneas 7-15:

```javascript
const GROUPS_CONFIG = [
  { id: 1, name: "Tu DB Favorita", color: "#COLOR", participants: [] },
  // Agregar/modificar grupos aquí
];
```

### Cambiar Preguntas:
Modificar `src/data/questions.json`:

```json
[
  {
    "question": "Tu nueva pregunta aquí",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "answer": "Opción correcta"
  }
]
```

### Personalizar Colores:
Los colores de cada grupo se pueden cambiar en la configuración:
- MongoDB: Verde #4DB33D
- Cassandra: Azul #1287A5
- Neo4j: Azul claro #008CC1
- CouchDB: Rojo #E42528
- BigTable: Azul Google #4285F4
- Amazon DynamoDB: Naranja #FF9900
- ArangoDB: Verde oscuro #68A063

## 📊 Estadísticas y Métricas

### Dashboard en Tiempo Real Muestra:
- 👥 **Total de participantes** conectados
- 📋 **Lista completa** de todos los grupos
- ✅ **Estado de cada grupo** (con/sin participantes)
- 🏷️ **Nombres de participantes** por grupo
- ⏱️ **Hora de conexión** de cada participante

### Al Final del Juego:
- 🏆 **Puntaje individual** de cada participante
- 📊 **Estadísticas detalladas** (correctas/incorrectas)
- 🎯 **Porcentaje de aciertos**
- 🏅 **Mensaje personalizado** según rendimiento

## 🎉 Tips para una Mejor Experiencia

### Para el Instructor:
- 📱 Tener un celular de respaldo para probar el QR
- 🔊 Explicar el proceso antes de mostrar el QR  
- ⏱️ Dar tiempo suficiente para registro (10 min)
- 👁️ Monitorear el dashboard durante el registro
- 🎯 Estar preparado para ayudar con problemas técnicos

### Para los Estudiantes:
- 🔋 Verificar batería del celular antes de clase
- 📶 Conectarse a WiFi estable
- 👥 Designar un "capitán" por grupo para coordinar
- 💬 Comunicarse entre miembros durante el juego
- 🎯 Leer las preguntas completas antes de responder

## 🚀 Deploy en Producción

### Para usar en clase con WiFi local:
```bash
npm run build
npm run preview -- --host 0.0.0.0
```

### Para usar con Vercel (Internet):
1. Subir código a GitHub
2. Conectar repositorio a Vercel
3. Deploy automático
4. Compartir URL de Vercel con estudiantes

---

**¡El Redis Challenge está listo para transformar tu clase en una experiencia interactiva e inolvidable! 🎮⚡**

_Desarrollado con ❤️ para educadores y estudiantes_