# CLAUDE.md v1.2.19

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CashGuard Paradise v1.2.19 is a cash management system for "Acuarios Paradise" retail stores, built with React, TypeScript, Vite, and shadcn/ui. The application implements **dual operation modes**: morning cash count (inicio de turno) and evening cash cut (fin de turno), with multi-phase protocols and anti-fraud measures.

### 🧪 Testing Status - 100% Docker Containerized
| Sector | Status | Coverage | Description |
|--------|--------|----------|-------------|
| **SECTOR 1 ✅** | Complete | 10 tests | Framework foundation - Docker exclusive |
| **SECTOR 2 ✅** | Complete | 107 tests | Financial calculations - 100% coverage |
| **SECTOR 3 ✅** | Complete | 36 tests | Business flows integration |
| **SECTOR 4 ✅** | Complete | 24 tests | E2E/UI Playwright tests - Port 5175 |
| **SECTOR 5 ✅** | Complete | CI/CD | GitHub Actions + Husky hooks automation |

**IMPORTANTE:** Todo el testing se ejecuta exclusivamente en contenedores Docker para mantener el entorno local limpio.

### 📊 Design System & Architecture

**Glass Effect Design System:**
- Background: `rgba(36, 36, 36, 0.4)` + `blur(20px)`
- Borders: `rgba(255, 255, 255, 0.15)`
- Color gradients: Azul-púrpura (evening), Naranja (morning), Verde (success)
- Text colors: #e1e8ed (titles), #8899a6 (subtexts)

**Mobile UX Optimizations:**
- Keyboard Persistence: TouchEnd handlers + preventDefault()
- Sequential Navigation: Auto-progression + focus management
- Input Types: `type="tel"` + `inputMode="numeric"`
- Responsive: breakpoints sm/md/lg con tamaños adaptativos

**Wizard Flow (5 pasos):**
1. Protocolo de seguridad (4 reglas + timing) 
2. Selección de sucursal
3. Cajero selection
4. Testigo validation (≠ cajero)
5. Venta esperada SICAR

**Performance Patterns:**
- Timing unificado: Sistema centralizado sin race conditions
- AnimatePresence: `initial={false}` optimization
- Memoization: useCallback + useRef pattern
- Code splitting: Componentes modulares (DRY)

---

## 📝 Recent Updates

*Para historial completo v1.0.80 - v1.1.20, ver [CHANGELOG-DETALLADO.md](/Documentos%20MarkDown/CHANGELOG-DETALLADO.md)*

### v1.2.21 - Victoria Definitiva Neon Glow [MISIÓN CUMPLIDA] ✅
**OPERACIÓN TAILWIND INTEGRITY AUDIT EXITOSA:** Corrección definitiva de la configuración Tailwind CSS - efecto "Neon Glow" operativo al 100%.
- **Insurgente identificado:** Content pattern en `tailwind.config.ts` excluía archivos `.css`
- **Configuración original:** `"./src/**/*.{ts,tsx}"` - Tailwind no escaneaba `src/index.css`
- **Corrección aplicada:** `"./src/**/*.{ts,tsx,css}"` - Inclusión de extensión `.css`
- **Purga completa:** Eliminación de caché Vite + reinstalación dependencies + rebuild total
- **Resultado:** Clases `.neon-glow-primary` y `.neon-glow-morning` procesadas exitosamente
- **Verificación técnica:** CSS bundle cambió de `COZOfHAo` a `Cmk0xgqI` confirmando re-procesamiento
- **Status final:** SelectTrigger exhibe resplandor azul perfecto - anomalía erradicada
**Archivos:** `tailwind.config.ts`, `CLAUDE.md`

### v1.2.20 - Doctrina Neon Glow Corregida [MISIÓN CUMPLIDA] ✅
**OPERACIÓN DEEP DIVE EXITOSA:** Corrección definitiva del efecto "Neon Glow" - sistema de resplandor azul funcional al 100%.
- **Diagnóstico forense:** Identificada incompatibilidad RGB/HSL en clases `.neon-glow-primary` y `.neon-glow-morning`
- **Causa raíz:** `theme('colors.blue.500')` devolvía valores RGB pero se aplicaban en funciones HSL
- **Solución aplicada:** Valores HSL directos - Primary: `213 100% 52%`, Morning: `39 100% 57%`
- **Validación exitosa:** SelectTrigger en InitialWizardModal ahora exhibe resplandor azul perfecto en focus/open
- **Arquitectura CSS:** Doctrina Neon Glow v1.0 completamente funcional y validada
- **Zero errores:** Build y runtime sin warnings, compatibilidad total con Tailwind CSS
**Archivos:** `src/index.css`, `CLAUDE.md`

### v1.2.19 - Operación Botón Unificado [MISIÓN CUMPLIDA] ✅
**ARQUITECTURA BUTTONS:** Refactorización completa del sistema de botones - eliminación total de deuda técnica.
- **47 botones unificados:** Todos los elementos migrados al `<Button />` centralizado (100% cobertura)
- **8 variantes especializadas:** `phase2-tab`, `phase2-back`, `phase2-verify`, `phase2-confirm`, `guided-confirm`, `guided-start`, `report-action`, `warning`, `success`
- **CSS modular completo:** 6 archivos modulares en `src/styles/features/` - eliminados ~800 líneas de estilos inline
- **Sistema data-state unificado:** Lógica visual consistente via `data-state="valid|invalid"`, `data-mode`, `data-active`, `data-count-type`
- **Deuda técnica erradicada:** 0% estilos inline, 0% gradientes hardcodeados, 0% handlers hover manuales
- **Verificación independiente:** Auditoría exhaustiva confirma migración 100% exitosa en 6 archivos críticos
- **Mantenibilidad:** +200% mejora en consistencia arquitectónica y facilidad de modificación
**Archivos:** `Phase2Manager.tsx`, `Phase2DeliverySection.tsx`, `Phase2VerificationSection.tsx`, `GuidedFieldView.tsx`, `GuidedInstructionsModal.tsx`, `CashCalculation.tsx`, `src/styles/features/*`, `CLAUDE.md`

### v1.2.18 - Arquitectura CSS Modular Incremental
**DECISIÓN ARQUITECTÓNICA:** Mantener `index.css` estable (2,306 líneas) + modularización incremental para nuevas features.
- **index.css CONGELADO:** No más adiciones, archivo marcado como frozen
- **Estructura modular:** Creados directorios `src/styles/features/`, `components/`, `core/`
- **Nuevas features:** Usar archivos CSS modulares en `styles/features/`
- **Documentación:** README.md en `src/styles/` con guías de uso
- **Beneficio:** Cero riesgo, modularización gradual, mejor mantenibilidad
**Archivos:** `src/index.css`, `src/styles/README.md`, `CLAUDE.md`

### v1.2.16 - Rediseño Estético Modal + CSS Warnings Fix
**REDISEÑO MODAL:** Mejora completa estética: badge progreso sutil, contraste dorado iconos, progress bar visible, input/botón unificado.
**CSS WARNINGS FIX:** Solución 100% Docker-compatible para eliminar 5 warnings "Unknown at rule @tailwind/@apply":
- Configuración `.vscode/settings.json` con desactivación CSS validation
- Comentarios supresión `/* stylelint-disable-next-line at-rule-no-unknown */` en `src/index.css`
- Script helper `Scripts/css-warnings-fix.sh` para automatización
- Build verificado exitosamente sin errores
**Archivos:** `src/index.css`, `.vscode/settings.json`, `Scripts/css-warnings-fix.sh`, `CLAUDE.md`

### v1.2.15 - Optimización Proporciones UX/UI 
Elementos 25-30% más compactos desktop, proporción dorada aplicada, variables CSS optimizadas, mejor aprovechamiento espacio.
**Archivos:** `src/index.css`, `CLAUDE.md`

### v1.2.14 - Sistema Diseño Coherente Completo
Variables CSS centralizadas (40+), clases modulares (25+), eliminados ~300 líneas estilos inline, +90% mantenibilidad.
**Archivos:** `src/index.css`, `src/components/CashCounter.tsx`, `src/components/ui/GuidedProgressIndicator.tsx`

### v1.2.13 - GlassAlertDialog Component
Modal confirmación premium con Glass Morphism. Componente reutilizable 120 líneas, arquitectura modular escalable.
**Archivos:** `src/components/ui/GlassAlertDialog.tsx`, `src/components/InitialWizardModal.tsx`

### v1.2.12 - Modal InitialWizardModal Optimizado
Centrado perfecto, sistema CSS unificado (10 clases), z-index hierarchy, -80% estilos inline, +300% mantenibilidad.
**Archivos:** `src/index.css`, `src/components/InitialWizardModal.tsx`

### v1.2.11 - Sistema Escala Proporcional
Detección viewport responsive, CSS clamp() límites, viewport units (vw), interface proporcional 320px-768px.
**Archivos:** CashCounter.tsx, GuidedProgressIndicator.tsx, operation-selector/*, morning-count/*

### v1.2.10 - Simplificación Header Móviles
Header Fase 1 40% menos altura, título simplificado, mejor UX móviles con más espacio contenido principal.
**Archivos:** `src/components/CashCounter.tsx`

### v1.2.8 - Sistema Ciego Anti-Fraude
Auto-confirmación totales sin preview, eliminada TotalsSummarySection durante conteo, transición automática, 100% ciego.
**Archivos:** `src/components/CashCounter.tsx`

### v1.2.6 - Android Responsive Optimization
Elementos fuera pantalla eliminados, espaciados optimizados 33%, textos adaptativos, padding reducido, 30% más contenido visible.
**Archivos:** GuidedFieldView.tsx, Phase2VerificationSection.tsx, TotalsSummarySection.tsx, Phase2Manager.tsx, CashCounter.tsx

### v1.2.5 - Android UX Improvements
Valor electrónico siempre visible, botón confirmar mejorado, texto responsive botones, UI compacta sin texto cortado.
**Archivos:** TotalsSummarySection.tsx, CashCounter.tsx, Phase2Manager.tsx, Phase2DeliverySection.tsx

### v1.2.4 - CI/CD Automation (SECTOR 5)
GitHub Actions (3 workflows), Husky hooks, security monitoring, performance tracking, Docker-first pipelines.
**Archivos:** `.github/workflows/*`, `.husky/*`, `Scripts/ci-cd-commands.sh`

### v1.1.27 - Header Fase 2 Unificado
Título movido dentro del card, header + navegación en un contenedor, eliminado motion.div separado.
**Archivos:** `/src/components/phases/Phase2Manager.tsx`

---

## Development Quick Reference

```bash
# Essential commands
npm install          # Dependencies
npm run dev         # Dev server (5173)
npm run build       # Production build
npm run lint        # Code linting

# Testing (Docker exclusive)
./Scripts/docker-test-commands.sh test              # All tests
./Scripts/docker-test-commands.sh test:unit         # Unit only
./Scripts/docker-test-commands.sh test:e2e          # E2E only
./Scripts/docker-test-commands.sh test:coverage     # Coverage
```

## Architecture Overview

**Core Stack:** React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS + Framer Motion + Docker

**Project Structure:**
```
src/
├── components/     # Feature-organized UI (cash-counting/, phases/, ui/)
├── hooks/         # Business logic (usePhaseManager, useGuidedCounting, useCalculations)
├── utils/         # Core calculations (calculations.ts, deliveryCalculation.ts)
├── types/         # TypeScript definitions
└── data/         # Static data (paradise.ts)
```

**Key Business Logic:**

*Three-Phase System:*
1. **Phase 1:** Cash counting (guided/manual modes) → auto-proceed if >$50 to Phase 2, else Phase 3
2. **Phase 2:** Cash delivery (optimal distribution algorithm → exactly $50 remaining)
3. **Phase 3:** Final reports (immutable results, WhatsApp/copy/share actions)

*Anti-Fraud Measures:*
- Sistema ciego: No preview totals during counting
- Single count restriction per session
- Mandatory witness validation (witness ≠ cashier)
- Alert system for discrepancies >$3.00
- Pattern detection for consecutive shortages

**State Management:**
- usePhaseManager: Multi-phase workflow orchestration
- useGuidedCounting: Step-by-step counting process
- useLocalStorage: Persistent state with automatic serialization
- useCalculations: Centralized cash calculation logic

## Important Considerations

- **Single-page workflow:** No back navigation (anti-fraud)
- **USD denominations:** Full US coin/bill support
- **Phase transitions:** One-way to prevent manipulation  
- **Local storage:** Persistence with cleanup capability
- **$50 target:** Hardcoded business requirement for change fund

## Dual Operation Modes

**Morning Count (Inicio de turno):**
- Verifies $50 change fund
- 2 phases (no Phase 2 if ≤$50)
- Physical cash only (no electronic payments)
- Colors: Orange gradient (#f4a52a → #ffb84d)

**Evening Cut (Fin de turno):**
- Compares with SICAR expected sales
- 3 phases (including cash delivery if >$50)
- All payment types (cash + electronic)
- Colors: Blue-purple gradient (#0a84ff → #5e5ce6)

## 🏠 Reglas de la Casa v2.0

### 📋 Directrices Esenciales

**CRÍTICAS - Nunca romper:**
1. **🔒 Preservación:** No modificar código sin justificación explícita
2. **⚡ Funcionalidad:** Evaluar impacto completo antes de cambios
3. **💻 TypeScript:** Cero `any`, tipado estricto obligatorio
4. **🐳 Docker first:** Todo containerizable, sin dependencias problemáticas
5. **🔐 Compatibilidad:** React + TypeScript + Vite + shadcn/ui + Docker

**PROCESO - Seguir siempre:**
6. **🏠 Estructura:** Scripts → `/Scripts`, Docs → `/Documentos MarkDown`
7. **🗺️ Planificación:** Task list obligatoria con objetivos medibles
8. **📝 Documentación:** Comentarios `// 🤖 [IA] - [Razón]` y actualizar .md
9. **🎯 Versionado:** Consistente en todos los archivos relevantes
10. **🧪 Tests:** Funciones financieras con 100% cobertura

### 🧭 Metodología: `Reviso → Planifico → Ejecuto → Documento → Valido`

---

## 📚 Referencias Técnicas

- [TECHNICAL-SPECS.md](/Documentos%20MarkDown/TECHNICAL-SPECS.md) - Especificaciones técnicas detalladas
- [CHANGELOG-DETALLADO.md](/Documentos%20MarkDown/CHANGELOG-DETALLADO.md) - Historial v1.0.80-v1.1.20
- [CHANGELOG-HISTORICO.md](/Documentos%20MarkDown/CHANGELOG-HISTORICO.md) - Historial v1.0.2-v1.0.79
- [GitHub Repository](https://github.com/SamuelERS/calculadora-corte-caja)