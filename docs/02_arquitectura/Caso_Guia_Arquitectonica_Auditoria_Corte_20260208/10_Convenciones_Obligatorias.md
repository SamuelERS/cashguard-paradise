# 10 — Convenciones Obligatorias del Proyecto

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Reglas de naming, estructura de archivos, comentarios, versionado, commits
**No cubre:** Implementación técnica, lógica de negocio

---

## Convenciones de código

### TypeScript

| Regla | Ejemplo correcto | Ejemplo incorrecto |
|-------|-----------------|-------------------|
| Zero `any` | `param: string` | `param: any` |
| Interfaces con I-prefix solo si colisión | `Corte`, `CorteIntento` | `ICorte` (solo si necesario) |
| Enums como union types | `type Estado = 'INICIADO' \| 'FINALIZADO'` | `enum Estado { INICIADO }` |
| Type guards con is-prefix | `isCorte(obj): obj is Corte` | `checkCorte(obj): boolean` |
| Props con suffix Props | `CorteReanudacionProps` | `CorteReanudacionConfig` |
| Hooks con use-prefix | `useCorteSesion` | `corteSesionHook` |
| Constantes en UPPER_SNAKE | `MAX_INTENTOS` | `maxIntentos` |
| Funciones en camelCase | `guardarProgreso()` | `GuardarProgreso()` |

### React

| Regla | Ejemplo correcto | Ejemplo incorrecto |
|-------|-----------------|-------------------|
| Componentes en PascalCase | `CorteReanudacion.tsx` | `corte-reanudacion.tsx` |
| Un componente por archivo | `CorteReanudacion.tsx` exporta solo `CorteReanudacion` | Múltiples exports default |
| Props destructuradas | `({ corte, onContinue })` | `(props)` → `props.corte` |
| Hooks en archivo propio | `useCorteSesion.ts` | Inline en componente |
| Tests junto al código | `__tests__/useCorteSesion.test.ts` | Tests en carpeta raíz |

### CSS / Tailwind

| Regla | Ejemplo correcto | Ejemplo incorrecto |
|-------|-----------------|-------------------|
| Responsive con clamp() | `text-[clamp(0.875rem,2vw,1rem)]` | `text-sm md:text-base` |
| Colores del design system | `var(--accent-primary)` | `#0a84ff` hardcodeado |
| Glass morphism estándar | `rgba(36,36,36,0.4) + blur(20px)` | Valores custom sin justificación |

## Estructura de archivos

### Archivos nuevos del sistema de auditoría

```
src/
├── types/
│   └── auditoria.ts              # Interfaces, enums, type guards
│
├── lib/
│   └── supabase.ts               # Cliente Supabase tipado
│
├── hooks/
│   └── useCorteSesion.ts          # Hook de sincronización
│
├── components/
│   └── corte/
│       ├── CorteReanudacion.tsx    # Pantalla de reanudación
│       ├── CorteStatusBanner.tsx   # Banner de conectividad
│       └── __tests__/
│           ├── CorteReanudacion.test.tsx
│           └── CorteStatusBanner.test.tsx
│
└── utils/
    └── offlineQueue.ts            # Cola de operaciones offline
```

### Regla de 500 líneas

Ningún archivo de código debe superar 500 líneas. Si crece:

1. Extraer helpers a un archivo `*-helpers.ts`
2. Extraer tipos a un archivo `*-types.ts`
3. Extraer constantes a un archivo `*-constants.ts`
4. Si es componente, dividir en subcomponentes

**Excepción documentada:** Archivos legacy (`CashCalculation.tsx`, `Phase2VerificationSection.tsx`) se dejan como están. Los módulos nuevos deben cumplir la regla.

## Comentarios

### Formato de comentarios IA

Todo cambio realizado por IA debe incluir un comentario con el formato:

```typescript
// 🤖 [IA] - v{version}: {descripción breve del cambio}
```

Ejemplos:

```typescript
// 🤖 [IA] - v2.0.0: Hook de sincronización con backend Supabase
// 🤖 [IA] - v2.0.0: Type guard para validar formato correlativo
// 🤖 [IA] - v2.0.0: FIX - Race condition en useEffect dependencies
```

### Comentarios técnicos

Para decisiones técnicas no obvias:

```typescript
// Justificación: createTimeoutWithCleanup removido de dependencies
// porque se LLAMA (no se LEE) dentro del useEffect.
// Incluirlo causa re-disparos por cambio de referencia del hook.
```

### Comentarios prohibidos

```typescript
// ❌ No agregar estos comentarios:
// TODO: Fix later
// HACK: This works but shouldn't
// This is temporary
// I don't know why this works
```

## Versionado

### Formato de versión

```
v{major}.{minor}.{patch}{suffix}
```

| Componente | Cuándo incrementar | Ejemplo |
|-----------|-------------------|---------|
| Major | Cambio arquitectónico (backend, nueva capa) | v2.0.0 |
| Minor | Feature nueva dentro de la arquitectura | v2.1.0 |
| Patch | Bug fix | v2.0.1 |
| Suffix | Iteración rápida dentro de un patch | v2.0.1a |

### Dónde actualizar versión

Al hacer un release, actualizar en:

1. `OperationSelector.tsx` — Badge visual
2. `CashCalculation.tsx` — Footer del reporte
3. `MorningVerification.tsx` — Footer del reporte (si aplica)
4. Comentario de versión en archivos modificados

## Commits

### Formato de commit

```
{tipo}({alcance}): {descripción}

{cuerpo opcional}
```

### Tipos válidos

| Tipo | Uso |
|------|-----|
| `feat` | Feature nueva |
| `fix` | Bug fix |
| `docs` | Solo documentación |
| `refactor` | Cambio de código sin cambiar funcionalidad |
| `test` | Agregar o corregir tests |
| `chore` | Cambios de configuración, dependencias |
| `style` | Cambios de formato (sin cambio funcional) |

### Alcances válidos para auditoría

| Alcance | Descripción |
|---------|-------------|
| `auditoria` | Sistema de auditoría general |
| `corte` | Flujo de corte de caja |
| `supabase` | Cliente y configuración backend |
| `offline` | Política y manejo offline |
| `sync` | Sincronización frontend-backend |
| `types` | Tipos TypeScript |
| `ci` | CI/CD pipeline |

### Ejemplos

```
feat(auditoria): add useCorteSesion hook for backend sync
fix(corte): resolve race condition in phase transition
docs(offline): define operational policy for connectivity loss
test(sync): add integration tests for progressive save
chore(supabase): configure client with environment variables
```

## Documentación

### Reglas de documentación (de REGLAS_DOCUMENTACION.md)

1. **Máximo 500 líneas por documento**
2. **Carpeta `Caso_*` por cada tema**
3. **`00_README.md` obligatorio** como índice
4. **Prefijos numéricos:** `01_`, `02_`, etc.
5. **Sin duplicación:** Si ya existe, referenciar
6. **Emoji de estado:** ✅ completado, ⏳ en progreso, ❌ bloqueado

### Estructura de caso

```
docs/02_arquitectura/Caso_{Nombre}_{Fecha}/
├── 00_README.md           # Índice obligatorio
├── 01_Nombre.md           # Primer documento
├── 02_Nombre.md           # Segundo documento
└── ...
```

### Anti-duplicación

Si un tema ya está documentado en otro caso, NO duplicar. Referenciar:

```markdown
→ Ver `docs/02_arquitectura/Caso_Otro/03_Detalle.md` para modelo de datos completo.
```

## Reglas de PR y code review

### Checklist de PR

Todo PR que toque el sistema de auditoría debe incluir:

- [ ] TypeScript compila (`npx tsc --noEmit` → 0 errors)
- [ ] Lint pasa (`npm run lint` → 0 errors)
- [ ] Build exitoso (`npm run build`)
- [ ] Tests nuevos escritos y pasando
- [ ] Coverage >= 70% en módulos nuevos
- [ ] Sin `any` en TypeScript
- [ ] Comentarios `// 🤖 [IA]` en cambios
- [ ] Sin archivos > 500 líneas
- [ ] Versión actualizada donde corresponda
- [ ] Documentación actualizada si aplica

### Criterios de rechazo automático

Un PR se rechaza automáticamente si:

1. Introduce `any` en TypeScript
2. Baja la cobertura de tests
3. TypeScript no compila
4. Build falla
5. Modifica archivos que NO debería (ver doc 04, lista de "no cambia")
6. Archivo nuevo > 500 líneas
7. Hook nuevo sin `useCallback`/`useMemo` donde corresponda
8. Componente que habla directo con backend (sin pasar por `useCorteSesion`)

## Variables de entorno

### Nomenclatura

```
VITE_{SERVICIO}_{PROPIEDAD}
```

### Variables requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon | `eyJhbGciOiJIUzI1...` |

### Reglas

1. **Nunca commitear valores reales** (usar `.env.example` con placeholders)
2. **Prefijo VITE_ obligatorio** (Vite solo expone variables con este prefijo)
3. **Validar existencia al iniciar** (supabase.ts debe verificar que existen)

## Dependencias

### Reglas para agregar dependencias

1. **Justificación obligatoria:** ¿Por qué esta librería y no código propio?
2. **Evaluación de tamaño:** ¿Cuánto agrega al bundle?
3. **Mantenimiento activo:** ¿Última release < 6 meses?
4. **TypeScript nativo:** ¿Tiene tipos incluidos o `@types/`?
5. **Licencia compatible:** MIT, Apache 2.0, BSD (no GPL si es producción)

### Dependencias aprobadas para auditoría

| Dependencia | Versión | Propósito |
|------------|---------|-----------|
| `@supabase/supabase-js` | ^2.x | Cliente backend |
| (ya incluida) `vitest` | existente | Testing |
| (ya incluida) `msw` | existente | Mock Service Worker |

### Dependencias prohibidas

| Dependencia | Razón |
|------------|-------|
| `axios` | `fetch` nativo es suficiente, Supabase SDK maneja HTTP |
| `redux` | React state + hooks es suficiente para la escala |
| `firebase` | Supabase es la elección de backend |
| Cualquier ORM | Supabase SDK maneja queries |

## Principios obligatorios

- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Fin de la guía arquitectónica.**
→ Volver al índice: `00_README.md`
