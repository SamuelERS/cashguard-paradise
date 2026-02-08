# 02 — Arquitectura Actual (Estado Real del Código)

**Fecha:** 2026-02-08
**Caso:** Caso_Guia_Arquitectonica_Auditoria_Corte_20260208
**Cubre:** Cómo funciona hoy el sistema, qué módulos existen, dónde vive el estado
**No cubre:** Propuesta de solución, modelo de datos futuro

---

## Stack tecnológico confirmado

- **Frontend:** React 18.3.1 + TypeScript + Vite + Tailwind + Radix UI
- **Despliegue:** GitHub Actions → FTP → SiteGround (Nginx, archivos estáticos)
- **Backend:** No existe
- **Base de datos:** No existe
- **Supabase:** Variables en `.env.example` pero sin integración en código (0 imports)

## Flujo del corte de caja (Evening Cut)

```
OperationSelector.tsx   → Usuario elige operación
  ↓
Index.tsx               → Renderiza CashCounter (modo "evening")
  ↓
CashCounter.tsx         → Orquesta fases via usePhaseManager
  ↓
Phase 1: Conteo         → useCashCounterOrchestrator + GuidedFieldView
  ↓
Phase 2: Entrega        → Phase2Manager → Phase2DeliverySection
  ↓
Phase 2: Verificación   → Phase2VerificationSection (conteo ciego)
  ↓
Phase 3: Reporte        → CashCalculation.tsx (resultados + WhatsApp)
```

## Dónde vive el estado hoy

| Mecanismo | Qué almacena | Persiste refresh | Persiste cierre | Persiste incógnito |
|-----------|-------------|------------------|-----------------|-------------------|
| `useState()` | Conteos, fases, cálculos, reportes | NO | NO | NO |
| `sessionStorage` | IDs de sesión (timestamps) | SI | NO | NO |
| `localStorage` | Lockout PIN, tema, deliveries | SI | SI | NO |
| Backend/DB | **NADA** | N/A | N/A | N/A |

**Hallazgo crítico:** La totalidad de los datos financieros viven exclusivamente en React state (RAM del navegador).

## Módulos clave y sus archivos

### Orquestación de fases
- `src/hooks/usePhaseManager.ts` — Máquina de estados de las 3 fases
- `src/components/CashCounter.tsx` — Componente contenedor principal

### Conteo (Phase 1)
- `src/hooks/useCashCounterOrchestrator.ts` — Lógica del flujo guiado
- `src/hooks/useGuidedCounting.ts` — Navegación entre denominaciones
- `src/components/cash-counting/GuidedFieldView.tsx` — UI de conteo

### Entrega y verificación (Phase 2)
- `src/components/phases/Phase2Manager.tsx` — Orquesta delivery + verification
- `src/components/phases/Phase2DeliverySection.tsx` — Instrucciones de separación
- `src/components/phases/Phase2VerificationSection.tsx` — Verificación ciega
- `src/hooks/useBlindVerification.ts` — Lógica de 3 intentos

### Reporte (Phase 3)
- `src/components/CashCalculation.tsx` — Resultados, bloqueo, reporte WhatsApp
- `src/lib/morning-verification/mvRules.ts` — Hash de reporte (Base64, no criptográfico)

### Seguridad existente
- `src/components/ui/pin-modal.tsx` — PIN supervisor (SHA-256 client-side, PIN hardcodeado "1234")
- `src/components/deliveries/DeliveryDashboardWrapper.tsx` — Lockout 5 min en localStorage

## Vulnerabilidades confirmadas

| # | Vulnerabilidad | Evidencia en código |
|---|---------------|---------------------|
| 1 | Refresh destruye todo | `usePhaseManager.ts` usa solo `useState()` |
| 2 | Incógnito = contexto limpio | localStorage no existe en incógnito |
| 3 | Sin audit trail | 0 llamadas HTTP en `/src` |
| 4 | Bloqueo resultados es client-side | `CashCalculation.tsx:63` → `useState(false)` |
| 5 | Lockout PIN eliminable | `DeliveryDashboardWrapper.tsx:17` → localStorage sin integridad |

## Qué sí funciona bien (preservar)

- Flujo guiado de conteo por denominación
- Sistema de verificación ciega (3 intentos max)
- Cálculos financieros con tests (174 tests matemáticos)
- Generación de reporte WhatsApp con detalles completos
- UI responsive y PWA funcional

---

**Siguiente:** → Ver `03_Principios_Diseno.md`
