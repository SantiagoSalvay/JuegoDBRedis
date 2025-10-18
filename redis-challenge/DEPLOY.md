# 🚀 Guía de Despliegue - Redis Challenge

Esta guía te ayudará a desplegar tu aplicación Redis Challenge en la nube de forma gratuita usando Vercel.

---

## 📋 Requisitos Previos

- ✅ Una cuenta de GitHub (gratuita)
- ✅ Una cuenta de Vercel (gratuita)
- ✅ Git instalado en tu computadora

---

## 🌐 Método 1: Deploy con Vercel (Recomendado)

### Paso 1: Subir a GitHub

1. **Crear repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre del repositorio: `redis-challenge`
   - Descripción: "Quiz interactivo sobre Redis"
   - Público o Privado (tu elección)
   - Click en "Create repository"

2. **Subir tu código:**

```bash
cd redis-challenge
git init
git add .
git commit -m "Initial commit: Redis Challenge"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/redis-challenge.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. **Ve a Vercel:**
   - Abre https://vercel.com
   - Haz clic en "Sign Up" o "Log In"
   - Inicia sesión con tu cuenta de GitHub

2. **Importar proyecto:**
   - Click en "Add New..." → "Project"
   - Autoriza a Vercel para acceder a GitHub (si es necesario)
   - Busca y selecciona tu repositorio `redis-challenge`
   - Click en "Import"

3. **Configurar proyecto:**
   - **Framework Preset:** Vite (se detecta automáticamente)
   - **Build Command:** `npm run build` (ya configurado)
   - **Output Directory:** `dist` (ya configurado)
   - **Install Command:** `npm install` (ya configurado)

4. **Deploy:**
   - Click en "Deploy"
   - ⏱️ Espera 1-2 minutos
   - 🎉 ¡Listo! Tu app está en línea

5. **Obtén tu URL:**
   - Ejemplo: `https://redis-challenge-abc123.vercel.app`
   - Comparte esta URL con tus alumnos

---

## 🔧 Método 2: Deploy con Vercel CLI

### Instalar Vercel CLI

```bash
npm install -g vercel
```

### Deploy Rápido

```bash
cd redis-challenge

# Deploy a preview (desarrollo)
vercel

# Deploy a producción
vercel --prod
```

### Configurar proyecto (primera vez)

```bash
vercel
# ? Set up and deploy "redis-challenge"? [Y/n] y
# ? Which scope? Tu cuenta
# ? Link to existing project? [y/N] n
# ? What's your project's name? redis-challenge
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n
```

---

## 🌍 Método 3: Deploy con Netlify

### Opción A: Desde la web

1. Ve a https://www.netlify.com
2. Haz clic en "Add new site" → "Import an existing project"
3. Conecta con GitHub y selecciona tu repositorio
4. Configuración:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click en "Deploy"

### Opción B: Netlify CLI

```bash
# Instalar CLI
npm install -g netlify-cli

# Deploy
cd redis-challenge
netlify deploy

# Deploy a producción
netlify deploy --prod
```

---

## 📱 Método 4: GitHub Pages

### Configurar GitHub Pages

1. **Instalar gh-pages:**

```bash
npm install --save-dev gh-pages
```

2. **Agregar scripts en `package.json`:**

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Actualizar `vite.config.js`:**

```javascript
export default {
  base: '/redis-challenge/',
  // ... resto de la configuración
}
```

4. **Deploy:**

```bash
npm run deploy
```

5. **Habilitar GitHub Pages:**
   - Ve a Settings → Pages en tu repositorio
   - Source: "gh-pages" branch
   - URL: `https://TU-USUARIO.github.io/redis-challenge`

---

## ⚙️ Configuración de Dominio Personalizado (Opcional)

### En Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones
5. Ejemplo: `redis-quiz.midominio.com`

### En Netlify

1. Site settings → Domain management
2. Add custom domain
3. Sigue las instrucciones de DNS
4. Ejemplo: `redis-challenge.midominio.com`

---

## 🔄 Actualizaciones Automáticas

Con Vercel o Netlify conectados a GitHub:

1. Haces cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Actualizar preguntas"
   git push
   ```
3. 🚀 Deploy automático en segundos
4. Tu sitio se actualiza automáticamente

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Solución:**
```bash
# Verifica que el build funcione localmente
npm run build

# Si funciona local pero falla en Vercel:
# - Revisa los logs en el dashboard de Vercel
# - Asegúrate que package.json esté actualizado
# - Verifica que todas las dependencias estén instaladas
```

### Error: "404 Not Found" en rutas

**Solución:**
El archivo `vercel.json` ya está configurado con las rewrites necesarias.

### Error: "Module not found"

**Solución:**
```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### La página se ve sin estilos

**Solución:**
```bash
# Verifica que Tailwind esté instalado
npm install -D tailwindcss@^3 postcss autoprefixer

# Rebuild
npm run build
```

---

## 📊 Monitoreo y Analytics (Opcional)

### Vercel Analytics

1. En tu proyecto de Vercel
2. Analytics → Enable
3. Ve estadísticas de uso en tiempo real

### Google Analytics

1. Crea una propiedad en Google Analytics
2. Obtén tu ID de seguimiento
3. Agrega el script en `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔐 Variables de Entorno (Si las necesitas)

### En Vercel

1. Settings → Environment Variables
2. Agregar variables:
   - `VITE_API_KEY=tu-api-key`
   - `VITE_API_URL=tu-url`
3. Redeploy para aplicar cambios

### En tu código

```javascript
const apiKey = import.meta.env.VITE_API_KEY;
```

---

## 📈 Mejores Prácticas

### 1. Preview Deployments
- Cada PR crea un preview deployment
- Prueba cambios antes de production
- URL temporal para testing

### 2. Rollback Rápido
- Si algo sale mal, haz rollback en Vercel
- Deployments → Three dots → Rollback

### 3. Monitoreo
- Revisa logs regularmente
- Configura alertas de errores
- Monitorea performance

### 4. Cache
- Vercel cachea automáticamente
- Assets estáticos se sirven desde CDN
- Velocidad de carga ultra rápida

---

## 🎯 URLs de Ejemplo

Después del deploy, tu app estará disponible en:

- **Vercel:** `https://redis-challenge.vercel.app`
- **Netlify:** `https://redis-challenge.netlify.app`
- **GitHub Pages:** `https://tu-usuario.github.io/redis-challenge`
- **Dominio custom:** `https://tudominio.com`

---

## ✅ Checklist Final

Antes de compartir con tus alumnos:

- [ ] App deployada y funcionando
- [ ] Todas las preguntas revisadas
- [ ] Probado en móvil y desktop
- [ ] URL copiada y lista para compartir
- [ ] (Opcional) Dominio personalizado configurado
- [ ] (Opcional) Analytics configurado
- [ ] README actualizado con tu URL

---

## 🎓 Compartir con Alumnos

### Opción 1: URL directa
```
¡Juega Redis Challenge!
https://tu-app.vercel.app
```

### Opción 2: QR Code
1. Genera un QR en: https://qr-code-generator.com
2. Usa tu URL de Vercel
3. Proyecta el QR en clase
4. Los alumnos escanean y juegan

### Opción 3: Shortlink
1. Usa https://bit.ly o https://tinyurl.com
2. Acorta tu URL
3. Más fácil de escribir: `bit.ly/redis-quiz`

---

## 🆘 Soporte

- **Documentación Vercel:** https://vercel.com/docs
- **Documentación Vite:** https://vitejs.dev
- **Comunidad React:** https://react.dev

---

## 🎉 ¡Felicidades!

Tu Redis Challenge está ahora disponible en línea para que tus alumnos aprendan jugando.

**URL de tu app:** `_____________________________`

**¡Compártela y diviértanse aprendiendo Redis! 🚀⚡**