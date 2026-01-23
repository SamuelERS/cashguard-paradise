# 📖 Paso 4: El Diario de Recetas (Documentación Mínima Viable)

---

### 1. 🏗️ Estableciendo el Sistema de Documentación

Un proyecto profesional no solo tiene documentos, tiene un **sistema** para gestionarlos. Tu primera tarea como "Chef Arquitecto" es establecer este sistema.

1.  Ve a la "Bóveda de Plantillas" (`_Plantillas/`) dentro de "La Receta Maestra".
2.  Copia los siguientes archivos a la carpeta `/docs` de tu **nuevo proyecto**:
    - `REGLAS_DESARROLLO.template.md`
    - `REGLAS_DOCUMENTACION.template.md`
    - `REGLAS_INSPECCION.template.md`
    - `REGLAS_PROGRAMADOR.template.md`
3.  Renómbralo a `REGLAS_DOCUMENTACION.md`.
4.  **¡Hecho!** Acabas de instaurar un sistema de documentación de élite. Ahora sigue las reglas de **ese nuevo archivo** para el resto de la documentación de tu proyecto.

---

## El Error a Evitar: "La Receta Secreta"

El chef que nunca anota sus recetas está condenado a no poder replicar sus éxitos ni enseñar a sus aprendices. El desarrollador que no documenta crea una "caja negra" que solo él entiende, convirtiéndose en un cuello de botella y haciendo que el proyecto sea frágil.

La documentación no es "algo que se hace al final si hay tiempo". Es parte integral del proceso de cocinar.

## La Documentación Mínima "Anti-Bobos"

No necesitas escribir una novela. Necesitas dejar un rastro de migas de pan claro y conciso para que otros (o tu "yo" del futuro) puedan seguirlo.

### 1. El `README.md`: La Portada de la Receta (No Negociable)
Este es el archivo más importante de todo el proyecto. Debe responder a tres preguntas sin que el lector tenga que buscar en ningún otro lado: **¿Qué es esto? ¿Cómo lo instalo? ¿Cómo lo ejecuto?**

**Checklist del `README.md` perfecto:**
- [ ] **Nombre del Proyecto:** Un título `H1` claro y grande.
- [ ] **Descripción Corta:** 1-2 frases que explican el propósito del proyecto.
- [ ] **Requisitos Previos:** Una lista de las herramientas que se deben tener instaladas en el sistema.
  - *Ejemplo: Node.js v20+, PNPM v8+, Docker v24+.*
- [ ] **Guía de Instalación:** Los comandos exactos, para copiar y pegar, que un nuevo desarrollador debe ejecutar.
  ```bash
  # 1. Clona el repositorio
  git clone ...
  # 2. Instala las dependencias
  pnpm install
  ```
- [ ] **Guía de Uso:** El comando exacto para arrancar la aplicación en modo desarrollo.
  ```bash
  # Iniciar el servidor de desarrollo
  pnpm dev
  ```

### 2. El `.env.example`: La Lista de Ingredientes Secretos
Ya lo mencionamos en la estructura de carpetas, pero su rol como documentación es **CRÍTICO**.
- [ ] **Completo:** Debe contener **TODAS** las variables de entorno que la aplicación necesita para funcionar.
- [ ] **Comentado:** Si el origen o el formato de una variable no es obvio, añade un comentario.
  ```
  API_KEY_OPENAI= # Clave obtenida desde platform.openai.com
  DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" # Formato URL de Postgres
  ```

### 3. La Carpeta `/docs`: El Recetario Extendido
No te compliques al principio. El objetivo aquí es documentar los **"PORQUÉS"**.
- [ ] **Decisiones de Arquitectura:** Crea un archivo `docs/decisiones.md` y anota las decisiones importantes.
  - *Ejemplo: "Se eligió `pnpm` en lugar de `npm` por su eficiencia en la gestión de monorepos y ahorro de espacio en disco."*
  - *Ejemplo: "La autenticación se maneja con tokens JWT en lugar de sesiones para poder escalar los servicios de forma independiente."*
- [ ] **A medida que el proyecto crece, considera añadir:**
  - **`Glosario.md`**: Define los términos de negocio y técnicos específicos de tu proyecto. ¿Qué es un "Agente"? ¿Qué significa "Cola Manual"? Un glosario evita malentendidos.
  - **`Roadmap.md`**: Una lista de alto nivel de las futuras funcionalidades o mejoras planificadas. Ayuda a mantener la visión del proyecto clara.

---

## 🏁 La Regla de Oro "Anti-Bobos"

> **Documenta para tu "yo" del futuro, que habrá olvidado por completo por qué tomó ciertas decisiones. Si una configuración te costó tres horas, dedica cinco minutos a documentarla para que la próxima vez tome un minuto. El `README.md` es la cara de tu proyecto; trátalo con respeto.**

## Siguiente Paso
→ Ver `06_Paso5_Checklist_Final_Antes_de_Empezar.md`
