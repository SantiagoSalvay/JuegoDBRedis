# 🎮 Redis Challenge - Quiz Interactivo

Un juego educativo interactivo para aprender Redis de forma divertida. Diseñado para usar en clase con grupos de alumnos.

![Redis Challenge](https://img.shields.io/badge/Redis-Challenge-D82C20?style=for-the-badge&logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Características

- ⚡ **10 preguntas** sobre Redis con opción múltiple
- 🎯 **Sistema de puntuación**: +10 puntos por respuesta correcta
- 🔥 **Bonus de racha**: +5 puntos extra por 3 aciertos consecutivos
- 🎨 **Animaciones suaves** con Framer Motion
- 🎉 **Confetti animado** en la pantalla final
- 📱 **Diseño responsive** para cualquier dispositivo
- 🚀 **Sin backend** - 100% frontend
- ⚡ **Feedback inmediato** al responder cada pregunta

## 🎯 Reglas del Juego

- Cada respuesta correcta suma **+10 puntos**
- Respuesta incorrecta = **0 puntos**
- **Bonus**: +5 puntos por cada 3 aciertos consecutivos
- Al terminar se muestra:
  - 🔥 Score ≥ 80: "¡Maestro del cache!"
  - ⚡ Score ≥ 50: "¡Buen trabajo!"
  - 💾 Score < 50: "Te falta un poco de RAM mental 😅"

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones fluidas
- **Canvas Confetti** - Efectos de confetti

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ y npm

### Pasos

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd redis-challenge
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:5173
```

## 🚀 Deploy en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. Sube tu código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Haz clic en "Add New Project"
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente la configuración de Vite
6. Haz clic en "Deploy"
7. ¡Listo! Tu app estará disponible en una URL pública

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

## 📂 Estructura del Proyecto

```
redis-challenge/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes React
│   │   ├── StartScreen.jsx      # Pantalla de inicio
│   │   ├── QuestionCard.jsx     # Tarjeta de pregunta
│   │   ├── ScoreBoard.jsx       # Marcador de puntos
│   │   └── ResultScreen.jsx     # Pantalla final
│   ├── data/
│   │   └── questions.json       # Preguntas del quiz
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html
├── package.json
├── tailwind.config.js   # Configuración Tailwind
├── postcss.config.js    # Configuración PostCSS
└── vite.config.js       # Configuración Vite
```

## 🎨 Paleta de Colores

```css
Redis Red:    #D82C20
Negro Carbón: #1E1E1E
Gris Oscuro:  #2C2C2C
Blanco:       #F5F5F5
```

## 📝 Personalización

### Agregar más preguntas

Edita el archivo `src/data/questions.json`:

```json
[
  {
    "question": "Tu pregunta aquí",
    "options": [
      "Opción A",
      "Opción B",
      "Opción C",
      "Opción D"
    ],
    "answer": "Opción correcta"
  }
]
```

### Cambiar puntuación

En `src/App.jsx`, modifica la función `handleAnswer`:

```javascript
const handleAnswer = (isCorrect) => {
  if (isCorrect) {
    let points = 10; // Cambiar puntos base
    const newStreak = streak + 1;
    
    if (newStreak >= 3 && newStreak % 3 === 0) {
      points += 5; // Cambiar bonus
    }
    
    setScore(score + points);
    setStreak(newStreak);
  }
  // ...
};
```

### Modificar mensajes finales

En `src/components/ResultScreen.jsx`, edita la función `getMessage`:

```javascript
const getMessage = () => {
  if (percentage >= 80) {
    return {
      emoji: '🔥',
      title: 'Tu mensaje aquí',
      message: 'Tu descripción aquí',
      // ...
    };
  }
  // ...
};
```

## 🎯 Uso en Clase

### Modo Individual
1. Cada alumno abre la URL en su dispositivo
2. Responde las preguntas a su ritmo
3. Comparte su puntuación al final

### Modo Grupal
1. Proyecta la pantalla en el aula
2. Los equipos discuten y votan la respuesta
3. Un representante selecciona la opción
4. Compite por el puntaje más alto

### Modo Competencia
1. Varios grupos juegan simultáneamente
2. Cada grupo en su propio dispositivo
3. Al finalizar, comparan puntuaciones
4. ¡El equipo con más puntos gana!

## 🐛 Solución de Problemas

### Las animaciones no funcionan
```bash
npm install framer-motion canvas-confetti
```

### Tailwind no aplica estilos
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Error al hacer build
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📜 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Preview del build de producción
npm run lint     # Ejecuta ESLint
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de uso educativo y está disponible libremente.

## 🙏 Agradecimientos

- Diseñado para facilitar el aprendizaje de Redis
- Inspirado en la necesidad de herramientas educativas interactivas
- Creado con ❤️ para educadores y estudiantes

## 📞 Contacto

¿Preguntas o sugerencias? ¡Abre un issue en GitHub!

---

**¡Diviértete aprendiendo Redis! 🚀⚡**