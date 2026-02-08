# 08 — Estrategia de Testing y CI/CD

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Plan de testing por capa, coverage mínimo, integración CI/CD, GitHub Actions
**No cubre:** Implementación de tests individuales, configuración de Supabase

---

## Filosofía de testing

### Principio

> **Si no tiene test, no existe. Si el test no pasa en CI, no se despliega.**

Cada módulo nuevo del sistema de auditoría debe entrar con tests. No hay excepciones para módulos críticos (financieros, de auditoría, de seguridad).

### Contexto actual

El proyecto ya cuenta con una suite robusta de tests matemáticos:

| Tier | Tests | Cobertura |
|------|-------|-----------|
| TIER 0: Cross-Validation | 88 | Validación cruzada cálculos |
| TIER 1: Property-Based | 18 + 10,900 validaciones | Propiedades matemáticas |
| TIER 2: Boundary | 31 | Casos límite |
| TIER 3: Pairwise | 21 | Combinaciones |
| TIER 4: Regression | 16 | Regresión histórica |
| Unit + Integration | 490+ | Componentes + hooks |
| **Total** | **650+** | **Suite completa** |

Los módulos nuevos deben mantener o superar este estándar.

## Cobertura mínima obligatoria

### Regla general

- **70% cobertura** en líneas, funciones y branches para todo módulo nuevo
- **100% cobertura** en funciones financieras (cálculos, totales, diferencias)
- **100% cobertura** en type guards y validadores
- **80% cobertura** en hooks de sincronización

### Por módulo nuevo

| Módulo | Coverage mínimo | Justificación |
|--------|----------------|---------------|
| `src/types/auditoria.ts` | 100% | Type guards protegen integridad datos |
| `src/lib/supabase.ts` | 70% | Cliente con manejo errores |
| `src/hooks/useCorteSesion.ts` | 80% | Hook crítico de sincronización |
| `src/components/corte/CorteReanudacion.tsx` | 70% | Componente UI con lógica |

## Plan de testing por capa

### Capa 1: Tipos y validadores (`src/types/auditoria.ts`)

**Tipo de tests:** Unitarios puros
**Framework:** Vitest
**Coverage objetivo:** 100%

**Tests requeridos:**

```
auditoria.types.test.ts
├── isCorte() type guard
│   ├── Acepta objeto válido con todos los campos
│   ├── Rechaza null/undefined
│   ├── Rechaza objeto sin id
│   ├── Rechaza objeto con estado inválido
│   ├── Acepta campos JSONB como null (datos parciales)
│   └── Valida formato correlativo CORTE-YYYY-MM-DD-X-NNN
│
├── isCorteIntento() type guard
│   ├── Acepta intento válido
│   ├── Rechaza sin corte_id
│   ├── Valida attempt_number > 0
│   └── Requiere motivo_reinicio si attempt > 1
│
├── EstadoCorte enum
│   ├── Contiene INICIADO, EN_PROGRESO, FINALIZADO, ABORTADO
│   └── No contiene valores inesperados
│
└── Validadores de correlativo
    ├── Formato válido: CORTE-2026-02-08-H-001
    ├── Formato con intento: CORTE-2026-02-08-H-001-A2
    ├── Formato inválido: CORTE-ABC-DEF
    └── Formato inválido: cadena vacía
```

### Capa 2: Cliente Supabase (`src/lib/supabase.ts`)

**Tipo de tests:** Unitarios con mocks
**Framework:** Vitest + MSW (Mock Service Worker)
**Coverage objetivo:** 70%

**Tests requeridos:**

```
supabase.test.ts
├── Inicialización
│   ├── Crea cliente con variables de entorno correctas
│   ├── Falla gracefully si variables no definidas
│   └── Exporta cliente tipado
│
├── Manejo de errores
│   ├── Timeout en conexión (> 5 segundos)
│   ├── Error de autenticación
│   └── Error de red (offline)
│
└── Health check
    ├── Retorna true cuando servidor responde
    └── Retorna false cuando servidor no responde
```

### Capa 3: Hook useCorteSesion (`src/hooks/useCorteSesion.ts`)

**Tipo de tests:** Integración con mocks de Supabase
**Framework:** Vitest + React Testing Library + MSW
**Coverage objetivo:** 80%

**Tests requeridos:**

```
useCorteSesion.test.ts
├── Estado inicial
│   ├── Consulta corte activo al montar
│   ├── Retorna null si no hay corte activo
│   └── Retorna corte existente si hay uno activo
│
├── iniciarCorte()
│   ├── Crea corte nuevo cuando no existe
│   ├── Retorna correlativo generado por servidor
│   ├── Rechaza si ya existe corte FINALIZADO para el día
│   └── Maneja error de red con retry
│
├── guardarProgreso()
│   ├── Envía PATCH con datos parciales
│   ├── Actualiza fase_actual
│   ├── No bloquea UI (optimistic update)
│   ├── Reintenta con exponential backoff si falla
│   └── Encola operación si offline
│
├── finalizarCorte()
│   ├── Marca corte como FINALIZADO
│   ├── Genera hash del reporte
│   ├── Rechaza si offline (requiere servidor)
│   └── Registra timestamp de finalización
│
├── registrarIntento()
│   ├── Crea nuevo CorteIntento
│   ├── Marca intento anterior como ABANDONADO
│   ├── Incrementa attempt_actual
│   └── Requiere motivo obligatorio
│
├── Recovery
│   ├── Restaura estado desde servidor al recargar
│   ├── Muestra fase correcta después de recovery
│   ├── Preserva datos parciales (conteo_efectivo, etc.)
│   └── Ofrece opción de reanudar o nuevo intento
│
└── Offline
    ├── Detecta estado offline
    ├── Muestra banner de conectividad
    ├── Encola operaciones pendientes
    └── Procesa cola al reconectar
```

### Capa 4: Componente CorteReanudacion (`src/components/corte/CorteReanudacion.tsx`)

**Tipo de tests:** Integración con React Testing Library
**Framework:** Vitest + RTL
**Coverage objetivo:** 70%

**Tests requeridos:**

```
CorteReanudacion.test.tsx
├── Renderizado
│   ├── Muestra correlativo del corte activo
│   ├── Muestra fase alcanzada
│   ├── Muestra timestamp de último guardado
│   └── Muestra número de intento actual
│
├── Interacción
│   ├── Botón "Continuar" restaura estado
│   ├── Botón "Nuevo intento" pide motivo
│   ├── Motivo es obligatorio (no vacío)
│   └── Confirmación antes de nuevo intento
│
└── Estados
    ├── Muestra loading mientras consulta servidor
    ├── Muestra error si consulta falla
    └── Redirige si no hay corte activo
```

## Integración CI/CD

### Pipeline actual (preservar)

```yaml
# .github/workflows existente
on: push to main
jobs:
  build-and-deploy:
    - npm ci
    - npm run build
    - npm run lint
    - Deploy to SiteGround (FTP)
```

### Pipeline propuesto (extender)

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Job 1: Linting y tipo
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  # Job 2: Tests unitarios
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run --reporter=verbose
      - run: npx vitest run --coverage
      # Verificar thresholds
      - name: Check coverage thresholds
        run: |
          npx vitest run --coverage --coverage.thresholds.lines=19
          npx vitest run --coverage --coverage.thresholds.branches=55

  # Job 3: Build producción
  build:
    runs-on: ubuntu-latest
    needs: [code-quality, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Verify PWA files
        run: |
          test -f dist/index.html
          test -f dist/manifest.webmanifest
          test -f dist/sw.js

  # Job 4: Deploy (solo main)
  deploy:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to SiteGround
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.SITEGROUND_FTP_HOST }}
          username: ${{ secrets.SITEGROUND_FTP_USERNAME }}
          password: ${{ secrets.SITEGROUND_FTP_PASSWORD }}
          port: ${{ secrets.SITEGROUND_FTP_PORT }}
          local-dir: ./dist/
          server-dir: cashguard.paradisesystemlabs.com/public_html/
```

### Reglas de CI/CD

1. **Todo push a main debe pasar CI.** Sin excepciones.
2. **PRs requieren CI verde.** No se puede merge con tests rojos.
3. **Coverage no puede bajar.** Nuevos módulos deben mantener o subir coverage.
4. **Build debe ser exitoso.** Si `npm run build` falla, no se despliega.
5. **TypeScript debe compilar.** `npx tsc --noEmit` con 0 errores.

### Timeouts CI/CD

Lección aprendida del proyecto (v1.3.7e): GitHub Actions es ~2.5x más lento que local.

| Configuración | Local | CI/CD |
|--------------|-------|-------|
| waitFor timeout | 3s | 90s |
| Test wrapper timeout | 10s | 120s |
| Factor de seguridad | 1x | 3x |

**Regla:** Todo timeout en tests debe considerar el factor 3x para CI.

## Estrategia de mocking

### Supabase mock

Para tests que involucran el backend, usar MSW (Mock Service Worker) ya configurado en el proyecto:

```typescript
// Ejemplo de mock handler para Supabase
const handlers = [
  rest.get('*/rest/v1/cortes', (req, res, ctx) => {
    return res(
      ctx.json([{
        id: 'test-uuid',
        correlativo: 'CORTE-2026-02-08-H-001',
        estado: 'EN_PROGRESO',
        fase_actual: 2
      }])
    );
  }),

  rest.patch('*/rest/v1/cortes', (req, res, ctx) => {
    return res(ctx.json({ ok: true }));
  }),
];
```

### Mocks de conectividad

```typescript
// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  get: () => false, // Simular offline
  configurable: true
});

// Mock eventos de red
window.dispatchEvent(new Event('offline'));
window.dispatchEvent(new Event('online'));
```

## Checklist de entrada para módulos nuevos

Antes de que cualquier módulo nuevo sea aceptado en el codebase:

- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] ESLint pasa sin errores (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Tests escritos y pasando (Vitest)
- [ ] Coverage >= 70% líneas (o 100% si es financiero)
- [ ] Comentarios `// 🤖 [IA] - vX.X.X` en cambios
- [ ] Sin `any` en TypeScript (tipado estricto)
- [ ] Sin archivos > 500 líneas
- [ ] Documentación actualizada

## Principios obligatorios

- Backend como fuente de verdad
- No monolitos, no archivos gigantes
- No lógica crítica solo en frontend
- No estado crítico no persistente
- Cobertura mínima de tests: 70%
- Compatibilidad CI/CD obligatoria

---

**Siguiente:** → Ver `09_Roles_Responsabilidades.md`
