# 📝 Guía para Agregar Más Preguntas

## 🎯 Ubicación del archivo
Las preguntas están en: **`src/data/questions.json`**

---

## 📋 Formato de pregunta

Cada pregunta debe tener este formato:

```json
{
  "question": "¿Tu pregunta aquí?",
  "options": [
    "Primera opción",
    "Segunda opción",
    "Tercera opción",
    "Cuarta opción"
  ],
  "answer": "Opción correcta (debe coincidir exactamente)"
}
```

---

## ⚠️ IMPORTANTE

1. ✅ **La respuesta correcta** debe estar **exactamente igual** en `options` y en `answer`
2. ✅ Siempre incluye **4 opciones** para mantener la consistencia
3. ✅ No olvides la **coma** entre preguntas (excepto la última)
4. ✅ Usa **comillas dobles** `"` (no simples `'`)
5. ✅ El archivo debe ser un **array** válido de JSON `[ ... ]`

---

## 📚 Ejemplos de preguntas para Redis

### Ejemplo 1: Comandos básicos
```json
{
  "question": "¿Qué comando incrementa el valor de una clave numérica en Redis?",
  "options": ["INCR", "ADD", "INCREMENT", "PLUS"],
  "answer": "INCR"
}
```

### Ejemplo 2: Estructuras de datos
```json
{
  "question": "¿Cuál de estos NO es un tipo de dato en Redis?",
  "options": ["String", "List", "Set", "Table"],
  "answer": "Table"
}
```

### Ejemplo 3: Persistencia
```json
{
  "question": "¿Qué archivo utiliza Redis para la persistencia RDB?",
  "options": ["dump.rdb", "redis.db", "data.rdb", "backup.rdb"],
  "answer": "dump.rdb"
}
```

### Ejemplo 4: Configuración
```json
{
  "question": "¿Cómo se reinicia Redis sin perder datos en memoria?",
  "options": [
    "RESTART",
    "No es posible",
    "BGSAVE antes de reiniciar",
    "RELOAD"
  ],
  "answer": "BGSAVE antes de reiniciar"
}
```

### Ejemplo 5: Conceptos avanzados
```json
{
  "question": "¿Qué es Redis Sentinel?",
  "options": [
    "Un cliente de Redis",
    "Un sistema de alta disponibilidad",
    "Un tipo de dato",
    "Un protocolo de comunicación"
  ],
  "answer": "Un sistema de alta disponibilidad"
}
```

---

## 🔧 Cómo agregar preguntas

### Paso 1: Abre el archivo
```bash
# Abre src/data/questions.json en tu editor
```

### Paso 2: Copia el formato
```json
{
  "question": "¿Tu pregunta nueva?",
  "options": ["A", "B", "C", "D"],
  "answer": "Respuesta correcta"
}
```

### Paso 3: Pégala en el array
```json
[
  {
    "question": "Pregunta existente 1...",
    "options": [...],
    "answer": "..."
  },
  {
    "question": "Pregunta existente 2...",
    "options": [...],
    "answer": "..."
  },
  {
    "question": "¿Tu NUEVA pregunta?",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "answer": "Opción A"
  }
]
```

### Paso 4: Guarda y prueba
```bash
npm run dev
# Verifica que la nueva pregunta aparezca
```

---

## ✅ Validar el JSON

### Método 1: En línea
Copia tu JSON y pégalo en: https://jsonlint.com/

### Método 2: Terminal
```bash
# Intenta hacer build
npm run build

# Si hay error, te dirá dónde está el problema
```

---

## 🎨 Temas sugeridos para preguntas

### Nivel Básico
- ✓ Comandos básicos (GET, SET, DEL, EXISTS)
- ✓ Tipos de datos (String, List, Set, Hash, Sorted Set)
- ✓ Configuración inicial
- ✓ Puertos y conexiones

### Nivel Intermedio
- ✓ Comandos avanzados (ZADD, SADD, HSET, LPUSH)
- ✓ Expiración de claves (EXPIRE, TTL, PERSIST)
- ✓ Transacciones (MULTI, EXEC, DISCARD)
- ✓ Pub/Sub

### Nivel Avanzado
- ✓ Persistencia (RDB vs AOF)
- ✓ Redis Cluster
- ✓ Redis Sentinel
- ✓ Lua Scripting
- ✓ Replicación

---

## 🐛 Errores comunes

### ❌ Error: Falta una coma
```json
{
  "question": "Pregunta 1",
  "answer": "A"
}
{  // ⚠️ FALTA COMA AQUÍ
  "question": "Pregunta 2",
  "answer": "B"
}
```

### ✅ Corrección:
```json
{
  "question": "Pregunta 1",
  "answer": "A"
},  // ✓ COMA AGREGADA
{
  "question": "Pregunta 2",
  "answer": "B"
}
```

### ❌ Error: Respuesta no coincide
```json
{
  "options": ["SET", "INSERT", "SAVE", "PUT"],
  "answer": "set"  // ⚠️ Minúsculas, no coincide con "SET"
}
```

### ✅ Corrección:
```json
{
  "options": ["SET", "INSERT", "SAVE", "PUT"],
  "answer": "SET"  // ✓ Coincide exactamente
}
```

---

## 📊 Recomendaciones

- 🎯 **10-15 preguntas** es ideal (no muy largo, no muy corto)
- 🔀 **Mezcla dificultades** (fáciles, medias, difíciles)
- 🎨 **Varía los temas** para mantener el interés
- 📖 **Preguntas claras** y sin ambigüedades
- ✨ **Distractores creíbles** en las opciones incorrectas

---

## 🚀 Siguiente nivel

### Agregar categorías
Puedes modificar el código para agrupar por temas:

```json
{
  "category": "Comandos Básicos",
  "question": "¿Qué comando...?",
  "options": [...],
  "answer": "..."
}
```

### Agregar dificultad
```json
{
  "difficulty": "hard",
  "question": "...",
  "options": [...],
  "answer": "..."
}
```

### Agregar explicaciones
```json
{
  "question": "...",
  "options": [...],
  "answer": "...",
  "explanation": "SET es el comando básico para almacenar valores..."
}
```

---

## 💡 Ideas de preguntas

1. ¿Cuál es el comando para ver todas las claves?
2. ¿Qué hace el comando FLUSHALL?
3. ¿Cómo se verifica si Redis está funcionando?
4. ¿Qué es la memoria maxmemory?
5. ¿Cuál es la diferencia entre LPUSH y RPUSH?
6. ¿Qué hace el comando RENAME?
7. ¿Cómo se obtiene el tamaño de una lista?
8. ¿Qué es un Sorted Set?
9. ¿Para qué sirve el comando SCAN?
10. ¿Qué es Redis Cache?

---

**¡Feliz creación de preguntas! 📚✨**