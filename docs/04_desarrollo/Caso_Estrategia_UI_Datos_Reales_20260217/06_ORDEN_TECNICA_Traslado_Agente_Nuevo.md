# ORDEN TECNICA #031-TRASLADO-ESTABILIZACION-MODELO-PROPIO
## Transferencia completa de contexto para nuevo agente (local-only)

**Fecha:** 2026-02-17  
**Prioridad:** ALTA  
**Modulos:** CashGuard PWA (5173), flujo Conteo/Corte, catalogos Supabase  
**Meta:** Entregar contexto completo y accionable para continuar estabilizacion del flujo guiado sin perder funcionalidad ni datos.

---

## 0) PRINCIPIO DE ESTA ORDEN
Continuar sobre el modelo operativo actual (UI tradicional) antes de modernizar.  
Toda accion debe mantenerse en local. No publicar rama, no mergear a `main`, no tocar produccion.

---

## 1) ENTREGABLES OBLIGATORIOS (DOCS)
1) `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md` - Orden de continuidad para agente nuevo.
2) `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/05_Ruta_Estabilizacion_Modelo_Propio.md` - Ruta vigente de estabilizacion por fases.
3) `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/04_Evidencia_Modulo_A_Validacion_Local.md` - Evidencia modulo A ya validada.

---

## 2) TAREA A - Estado base confirmado
### Objetivo
Partir de un estado limpio y verificable para evitar diagnosticos sobre una copia incorrecta del repo.

### Cambios requeridos
- Trabajar en: `/Users/samuelers/Paradise System Labs/cashguard-paradise`.
- Rama activa: `feature/ot11-activar-corte-page-ui`.
- Confirmar commit de estabilizacion:
  - `6c0f5bd` `fix(index): prevent blank screen and define stabilization route`.

### Criterio de aceptacion
- `git status` limpio al iniciar.
- Hash base identificado y documentado en bitacora de trabajo.

---

## 3) TAREA B - Hallazgo principal pendiente (flujo guiado)
### Objetivo
Resolver inconsistencia de experiencia: no aparecen todos los modales/pasos de guiado al personal o no respetan orden esperado.

### Cambios requeridos
- Inspeccionar componentes y orquestacion de pasos:
  - `src/components/InitialWizardModal.tsx`
  - `src/components/initial-wizard/InitialWizardModalView.tsx`
  - `src/hooks/initial-wizard/useInitialWizardController.ts`
  - `src/components/morning-count/MorningCountWizard.tsx`
  - `src/hooks/useCashCounterOrchestrator.ts`
  - `src/components/CashCounter.tsx`
- Construir matriz real de pasos:
  - Paso esperado (negocio) vs paso renderizado (UI) vs condicion de activacion.
- Detectar si hay saltos por estado previo, corte activo, o flags que omitan pasos.

### Criterio de aceptacion
- Existe diagnostico trazable de por que faltan modales/pasos.
- Se identifica causa raiz por codigo (no solo sintoma visual).

---

## 4) TAREA C - Regresion de pantalla negra (ya mitigada)
### Objetivo
Preservar fix de estabilidad para evitar volver a estados en blanco.

### Cambios requeridos
- Mantener y respetar:
  - `src/pages/Index.tsx` fallback seguro a `OperationSelector`.
  - Auto-recuperacion de estado `CASH_COUNT` hacia subflujo visible.
- Mantener test:
  - `src/__tests__/unit/pages/index.stability.test.tsx`.

### Criterio de aceptacion
- No reintroducir `return null` como salida final de pagina.
- Test de estabilidad sigue en verde.

---

## 5) TAREA D - Integridad de datos Supabase (sin perdida)
### Objetivo
Asegurar que todo dato capturado en flujo se persista o quede trazable para persistencia.

### Cambios requeridos
- Usar como base:
  - `docs/04_desarrollo/Caso_Mapeo_Integral_Persistencia_Supabase_Corte_20260217/`
- Verificar especialmente:
  - Cajero/testigo/sucursal
  - Conteos de monedas y billetes
  - Venta esperada SICAR
  - Gastos del dia (concepto, monto, categoria, factura)
  - Estados de corte, intentos, timestamps y metadata

### Criterio de aceptacion
- Matriz `captura -> persistencia` sin huecos criticos.
- Si falta persistencia, emitir orden tecnica especifica antes de implementar.

---

## 6) TAREA E - Higiene de ramas local-only
### Objetivo
Continuar sin riesgo de despliegue accidental ni perdida de historial.

### Cambios requeridos
- No usar `Publish branch` en GitHub Desktop.
- No push, no merge, no PR durante estabilizacion.
- Mantener commits atomicos locales con mensaje convencional.

### Criterio de aceptacion
- Todo avance queda versionado localmente.
- `main` y produccion sin cambios.

---

## 7) SMOKE TESTS (OBLIGATORIOS)
### S0: Estabilidad base
- `npm run test:unit -- --run src/__tests__/unit/pages/index.stability.test.tsx`
- Resultado esperado: PASS.

### S1: Salud unitaria minima
- `npm run test:unit -- --run`
- Resultado esperado: PASS.

### S2: Humo de interfaz
- `npm run test:e2e:smoke`
- Resultado esperado: PASS (2/2).

### S3: Build
- `npm run build`
- Resultado esperado: PASS.

### S4: Flujo guiado manual
- Levantar `npm run dev -- --host localhost --port 5173`.
- Ejecutar Conteo/Corte y registrar pasos visibles en orden.
- Resultado esperado: pasos de guiado completos y en secuencia correcta.

---

## 8) VEREDICTO DE CIERRE
- PASS: flujo guiado completo, orden correcto, test/build/smoke en verde.
- PARCIAL: estabilidad ok pero faltan pasos/modales o hay gaps de persistencia.
- FAIL: regresion de pantalla negra, salto de pasos sin control o datos sin trazabilidad.

---

## 9) NOTAS DE HIGIENE
- Cero `any`, TypeScript estricto.
- No introducir dependencias nuevas sin necesidad.
- No borrar funcionalidades legacy sin matriz de impacto.
- No ejecutar comandos destructivos de git.

---

## 10) CONTEXTO TECNICO RAPIDO (para arranque inmediato)
- Repo activo correcto:
  - `/Users/samuelers/Paradise System Labs/cashguard-paradise`
- Rama:
  - `feature/ot11-activar-corte-page-ui`
- Ultimos commits relevantes:
  - `6c0f5bd` fix(index) estabilidad pantalla negra + ruta estabilizacion
  - `6419fe7` docs(casos) plan modular/evidencia supabase
  - `850219e` fix(flow) consolidacion catalogos supabase
- Estado esperado al abrir:
  - sin cambios pendientes
  - trabajo local-only
