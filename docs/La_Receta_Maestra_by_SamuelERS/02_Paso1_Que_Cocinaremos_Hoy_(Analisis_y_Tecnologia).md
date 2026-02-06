# 🔍 Paso 1: ¿Qué Cocinaremos Hoy? (Análisis y Elección de Tecnología)

---

## El Error a Evitar: El Martillo de Oro

Abraham Maslow dijo: "Supongo que es tentador, si la única herramienta que tienes es un martillo, tratar todo como si fuera un clavo".

En nuestro mundo, si nuestra herramienta favorita es Python (o cualquier otra), es tentador usarla para todo. Este es el primer y más fundamental error que un arquitecto de software debe evitar. Elegir los "ingredientes" correctos es la base de una buena "receta".

## El Checklist de Decisión Tecnológica

Antes de escribir una sola línea de código, responde estas preguntas. Documenta las respuestas en el `README.md` de tu nuevo proyecto.

### 1. ¿Cuál es el "Plato Principal"? (El Core del Proyecto)
Esto define la naturaleza de tu aplicación. Marca la opción principal:

- [ ] **API de Backend** (Para servir a un frontend, una app, etc.)
  - **Opciones fuertes:** `Node.js (TypeScript)` con Express/Fastify, `Python` con FastAPI, `Go`.
- [ ] **Aplicación Web Frontend** (Un dashboard, una web interactiva)
  - **Opciones fuertes:** `Next.js (React/TS)`, `Nuxt.js (Vue/TS)`, `SvelteKit`.
- [ ] **Script de Automatización o Proceso de Datos** (Mover archivos, procesar un CSV, ETL)
  - **Opciones fuertes:** `Python` es el rey aquí por su simplicidad y sus librerías de datos.
- [ ] **Aplicación de Consola (CLI)** (Una herramienta para desarrolladores)
  - **Opciones fuertes:** `Go` (compila a un binario único), `Python` con Typer/Click.
- [ ] **Servicio en Tiempo Real** (Chats, notificaciones push, dashboards en vivo)
  - **Opciones fuertes:** `Node.js (TypeScript)` con WebSockets/Socket.io.

### 2. ¿Quiénes son los "Comensales"? (El Ecosistema y el Equipo)

- [ ] **Integraciones Obligatorias:** ¿El proyecto DEPENDE de una librería o SDK que solo existe en un lenguaje?
  - *Ejemplo: Un proyecto que usa `wppconnect` está fuertemente atado a `Node.js`. La decisión ya está casi tomada.*
- [ ] **Experiencia del Equipo:** ¿El equipo domina una tecnología? A veces, entregar valor rápidamente con una herramienta "buena" es mejor que tardar el doble con la herramienta "perfecta". Sé pragmático.
- [ ] **Madurez del Ecosistema:** ¿El lenguaje que consideras tiene librerías estables y una comunidad activa para los problemas que vas a resolver? (Autenticación, acceso a base de datos, etc.).

### 3. ¿Qué tan "Rápido" y "Grande" debe ser el Plato? (Rendimiento y Escalabilidad)

- [ ] **Rendimiento Ultra-Crítico:** ¿Necesitas manejar miles de conexiones concurrentes con bajo consumo de memoria?
  - **Opciones a considerar:** `Go`, `Rust`.
- [ ] **Rendimiento Estándar:** (La mayoría de las APIs y webs caen aquí).
  - **No te compliques:** `Node.js (TS)` y `Python (FastAPI)` son extremadamente rápidos y más que suficientes para el 95% de los casos.

---

## 🏁 La Regla de Oro "Anti-Bobos"

> **No elijas la tecnología porque es tu favorita o porque está de moda. Elige la tecnología que, según las respuestas de este checklist, demuestra ser la más adecuada para resolver el problema. Sé capaz de justificar tu elección en 30 segundos.**

## Siguiente Paso
→ Ver `03_Paso2_Mise_en_Place_(Estructura_de_Carpetas).md`
