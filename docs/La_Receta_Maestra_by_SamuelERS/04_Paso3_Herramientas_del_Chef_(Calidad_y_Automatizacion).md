# 🛠️ Paso 3: Las Herramientas del Chef (Calidad y Automatización)

---

## El Error a Evitar: "En mi máquina funciona"

Un chef que no limpia sus herramientas después de usarlas pronto tendrá una cocina insalubre y comida de mal sabor. Un desarrollador que no automatiza la calidad de su código, pronto tendrá un proyecto lleno de bugs, inconsistencias y el clásico "en mi máquina funciona".

La disciplina manual es frágil. La automatización es robusta.

## Las Herramientas No Negociables

Estas herramientas no son opcionales. Son la base de un desarrollo profesional y deben configurarse al inicio del proyecto.

### 1. Control de Versiones (`git`)
Es el sistema de guardado de nuestra receta. Sin él, estamos cocinando a ciegas.
- [ ] **`git init`**: Debe ser el primer comando que ejecutes.
- [ ] **`.gitignore` robusto**: Crea un `.gitignore` desde el día cero para tu stack (Node.js, Python, etc.) para evitar subir archivos basura como `node_modules/` o `__pycache__/`.

### 2. Formateador de Código (El "Estilista Automático")
**Propósito:** Acabar para siempre con las discusiones sobre comillas dobles vs. simples, o dónde poner un paréntesis. El código debe tener un único estilo, y un robot debe imponerlo.
- [ ] **Para TypeScript/JavaScript:** Instala y configura **Prettier**. Crea un archivo `.prettierrc.json` con las reglas del equipo.
- [ ] **Para Python:** Instala y configura **Ruff Formatter** (o `Black`). `Ruff` es la navaja suiza moderna.

### 3. Linter (El "Inspector de Calidad")
**Propósito:** Es tu asistente personal que revisa tu código mientras escribes, buscando errores potenciales, malas prácticas y código que podría fallar.
- [ ] **Para TypeScript/JavaScript:** Instala y configura **ESLint**.
  - ⚠️ **REGLA CRÍTICA INNEGOCIABLE:** Configura la regla para **prohibir el uso de `any`**. El `any` es una puerta abierta al caos y anula el propósito de usar TypeScript.
    - `@typescript-eslint/no-explicit-any`: `error`
- [ ] **Para Python:** Instala y configura **Ruff**. Es increíblemente rápido y combina el trabajo de decenas de herramientas de linting en una sola.

### 4. Hooks de Pre-Commit (El "Control de Calidad en la Puerta")
**Propósito:** Automatizar la ejecución del Formateador y el Linter **antes** de que un `commit` pueda ser creado. Si el código no pasa la inspección, no entra al recetario.
- [ ] **Opción 1 (Node.js):** Usa la combinación **`husky`** y **`lint-staged`**.
- [ ] **Opción 2 (Python/Multi-lenguaje):** Usa **`pre-commit`**. Es excelente y agnóstico al lenguaje.

---

## 🏁 La Regla de Oro "Anti-Bobos"

> **No confíes en tu memoria para mantener el código limpio. Configura estas herramientas una vez al principio del proyecto. Deja que los robots hagan el trabajo sucio para que tú te puedas concentrar en cocinar (desarrollar lógica de negocio).**

## Siguiente Paso
→ Ver `05_Paso4_El_Diario_de_Recetas_(Documentacion_Minima_Viable).md`
