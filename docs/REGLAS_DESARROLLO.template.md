# Plantilla: Reglas de Desarrollo v1.0

> **Audiencia:** Todos los desarrolladores (humanos e IAs)
> **Propósito:** Este documento define los estándares técnicos de código. Es una plantilla que DEBE ser copiada y adaptada para cada nuevo proyecto.

---

## 1. Regla de Oro: Cero Tolerancia a `any` (En TypeScript)

El uso de `any` anula los beneficios de TypeScript. Está prohibido en código nuevo.

```typescript
// ❌ PROHIBIDO
const data: any = response;

// ✅ OBLIGATORIO
// Usar tipos específicos, 'unknown', o genéricos.
import { type ApiResponse } from './shared/types'; // Ejemplo
async function fetchData(): Promise<ApiResponse<MyData>> { /* ... */ }

catch (error: unknown) { /* ... */ }
```

---

## 2. El "Diccionario Oficial de Tipos"

Para proyectos con múltiples paquetes (monorepos), todos los tipos compartidos (interfaces, type guards, enums) **DEBEN** residir en una carpeta central, por ejemplo: `shared/types/`.

Esto previene la duplicación y asegura que todos los servicios "hablen el mismo idioma".

---

## 3. Convenciones de Código Generales

### Nomenclatura
- **Variables/Funciones:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Clases/Tipos/Interfaces:** `PascalCase`
- **Archivos:** `kebab-case.ts` o `snake_case.py`

### Funciones
- **Una Sola Responsabilidad:** Una función debe hacer una sola cosa y hacerla bien.
- **Límite de Líneas:** Apuntar a un máximo de 50 líneas por función. Si es más larga, probablemente se puede y debe dividir.
- **Nombres Descriptivos:** Usar `verbo + Sustantivo` (ej: `calculateTotalPrice`).

### Async/Await
- **Paralelismo:** Usa `Promise.all` para ejecutar operaciones independientes en paralelo. No crees cadenas secuenciales de `await` si no es necesario.
- **Manejo de Errores:** Envuelve siempre las llamadas `await` en bloques `try/catch` para manejar los errores de forma predecible.

### Manejo de Errores y Logs
- **Errores Específicos:** No lances `new Error('falló')`. Lanza errores específicos (ej: `new DatabaseError(...)`).
- **No Silenciar Errores:** Un bloque `catch` vacío es un crimen. Como mínimo, loguea el error.
- **Logs Estructurados:** Incluye siempre un contexto. `logger.error('Falló la operación', { userId, operation, errorMsg })` es mil veces mejor que `console.log('error')`.
- **NUNCA** loguear información sensible (contraseñas, API keys, PII).

---

## 4. Testing y Calidad

### Reglas de Testing
- **Patrón AAA:** Organiza tus tests siempre con `Arrange` (preparar), `Act` (ejecutar), y `Assert` (verificar).
- **Independencia:** Cada test debe poder ejecutarse de forma independiente sin depender de otro.
- **Mocks:** "Mockea" (simula) todas las dependencias externas (APIs, bases de datos). Un test unitario prueba una sola cosa.

### Métricas de Calidad (Objetivos)
- **Cobertura de Código (Coverage):** Apuntar a >80% para la lógica de negocio crítica.
- **Complejidad Ciclomática:** Mantenerla por debajo de 10. Funciones más complejas son difíciles de testear y razonar.

---

## 5. Principios de Seguridad
- **Cero Credenciales en el Código:** Usa siempre variables de entorno (`process.env`).
- **Valida Toda Entrada Externa:** Nunca confíes en los datos que vienen de un usuario o de otra API. Valídalos siempre.
- **Usa Queries Parametrizadas:** Para evitar inyección de SQL.

---

## 6. Flujo de Trabajo con Git

### Modelo de Ramas (Sugerido)
- `main`: Refleja producción. Protegida. Solo se mezcla desde `develop`.
- `develop`: Rama de integración principal.
- `feature/nombre-feature`: Para nuevas funcionalidades. Nacen de `develop` y vuelven a `develop`.
- `fix/nombre-bug`: Para corregir bugs. Nacen de `develop` y vuelven a `develop`.

### Mensajes de Commit (Convencionales)
Usa el formato `tipo: descripción`.
- `feat`: Nueva funcionalidad.
- `fix`: Corrección de un bug.
- `refactor`: Cambio de código que no altera la funcionalidad.
- `test`: Añadir o mejorar tests.
- `docs`: Cambios en la documentación.
- `chore`: Tareas de mantenimiento (ej: actualizar dependencias).

---

## 7. Anti-Patrones Comunes (A Evitar)
- **God Objects:** Clases o archivos que hacen de todo. Divide y vencerás.
- **Magic Numbers/Strings:** Valores hardcodeados sin explicación. Ponlos en constantes con nombres descriptivos.
- **Código Duplicado (DRY - Don't Repeat Yourself):** Si copias y pegas código, probablemente deberías crear una función o clase reutilizable.
