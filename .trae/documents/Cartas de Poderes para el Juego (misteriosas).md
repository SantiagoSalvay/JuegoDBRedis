## Objetivo
Implementar cartas de poder misteriosas que se ofrecen al finalizar cada pregunta. El jugador elige 2 cartas sin saber qué poder contienen; al revelarlas, se aplican sus efectos (al instante o en la siguiente pregunta), incluyendo: robar puntos, congelar a otro jugador, doble puntos de la pregunta, cambiar puntos con un jugador random, saltear la pregunta (cuenta como correcta).

## Arquitectura Actual (resumen)
- Render y validación de preguntas en `QuestionCard.jsx`; callback `onAnswer(correct)`.  
- Puntuación y avance en `App.jsx` (`handleAnswer`); `+10` base y bonus por racha.  
- Estado y sincronización multi-dispositivo con Firebase RTDB (`useFirebaseSync` y `firebase.js`).  
- No hay Redis ni sockets; no existen power-ups.

## Diseño de UX
- Al terminar cada pregunta, mostrar un modal de “Cartas Misteriosas” con 3 cartas cerradas; el jugador elige 2.  
- Tras elegir, revelar poderes y aplicar efectos.  
- Cartas con destino (robar/congelar/cambiar puntos) permiten:  
  - MVP: auto-selección de un jugador random del mismo grupo/sesión.  
  - Extensión: selector de objetivo si hay múltiples jugadores visibles.

## Modelo de Datos de Poder
- `Power`: `{ id, name, type, value, timing }` donde:  
  - `type`: `double_points | skip_question | steal_points | freeze_player | swap_points`  
  - `value`: número o parámetros (ej. puntos a robar).  
  - `timing`: `immediate | next_question` (congelar afecta la siguiente).

## Integración en el Flujo
- `QuestionCard` mantiene el feedback y llama `onAnswer(correct)` como hoy.  
- `App.handleAnswer(isCorrect)`:  
  1) Registrar resultado de la pregunta (sin avanzar aún).  
  2) Abrir `PowerCardsModal` con 3 opciones generadas aleatoriamente.  
  3) Tras seleccionar 2, aplicar efectos:  
     - `double_points`: multiplicar puntaje base de la pregunta recién respondida.  
     - `skip_question`: si fue incorrecta, contar como correcta y sumar puntaje.  
     - `steal_points`: restar `value` al objetivo y sumar al jugador.  
     - `freeze_player`: marcar objetivo como congelado para la siguiente pregunta.  
     - `swap_points`: intercambiar totales entre jugador y objetivo random.  
  4) Avanzar a la siguiente pregunta o terminar.  
- Si es incorrecta y se elige `skip_question`, se corrige retroactivamente antes de avanzar.

## Estado en `App.jsx`
- `showPowerModal`, `offeredPowers`, `selectedPowers`.  
- `pendingResult`: `{ isCorrect, basePoints, questionIndex }`.  
- Para multi-jugador: `scoresByUser` y `frozenByUser` sincronizados con RTDB.

## Sincronización (Firebase RTDB)
- Rutas nuevas bajo `sessions/{sessionId}`:  
  - `powers/{userId}/{questionIndex}/offered`: cartas ofrecidas.  
  - `powers/{userId}/{questionIndex}/selected`: cartas elegidas.  
  - `effects/{questionIndex}`: efectos aplicados (para que impacten a todos).  
  - `scores/{userId}`: puntaje por jugador.  
  - `status/{userId}/frozenUntil`: índice de pregunta hasta la que está congelado.  
- Hooks: ampliar `useFirebaseSync` con `onPowersChange`, `savePowers`, `saveEffects`, `saveScores`, `saveStatus`.  
- Al aplicar un poder que afecta a otro: escribir `effects` y actualizar `scores/status` del objetivo.

## Reglas de Cálculo
- Base: `+10` por correcta; bonus por racha se mantiene.  
- Orden de aplicación:  
  1) Determinar `basePoints` y racha.  
  2) Aplicar cartas de la pregunta (`double_points`, `skip_question`).  
  3) Aplicar efectos cruzados (`steal_points`, `swap_points`, `freeze_player`) sobre RTDB.  
- Validaciones: límites para no tener puntajes negativos (min 0), máximos configurables.

## Componente UI
- `PowerCardsModal`: overlay con 3 cartas misteriosas; animación de revelado y selección de 2.  
- Tailwind para estilos y `framer-motion` para animaciones (coherente con el proyecto).  
- Props: `offeredPowers`, `onSelect(powers)`, `onClose`.

## Fases de Implementación
1) MVP local (una sola app/usuario):  
- Añadir estado y `PowerCardsModal`.  
- Generar cartas al finalizar cada pregunta y aplicar `double_points` y `skip_question`.  
- Avance del flujo con el modal.  
2) Multi-jugador con RTDB:  
- Persistir puntajes por usuario (`scores`).  
- Implementar `steal_points`, `freeze_player`, `swap_points` con efectos sincronizados.  
- Auto-selección de objetivo random; opcional: selector de objetivo.  
3) UX y robustez:  
- Animaciones, protección contra abuso, límites de valores, mensajes de estado (congelado, robo).  
- Pruebas unitarias de cálculo y pruebas manuales.

## Consideraciones
- Respetar patrones existentes (App como orquestador, Tailwind + motion).  
- Evitar latencia: aplicar efectos locales y reconciliar con RTDB cuando lleguen.  
- No introducir Redis; seguir con Firebase RTDB para coherencia del proyecto.

¿Confirmas este plan para que proceda con la implementación del MVP y luego la sincronización multi-jugador?