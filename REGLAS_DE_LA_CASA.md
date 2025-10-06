# 🏠 Reglas de la Casa v3.1

**Documento de referencia para desarrollo con IA en proyectos Paradise System Labs**

Este documento define las reglas fundamentales que **NUNCA se rompen** durante el desarrollo, mantenimiento y evolución de cualquier proyecto en Paradise System Labs. Son la base para un desarrollo consistente, seguro y escalable.

---

## 🚨 CRÍTICAS (Leyes Inquebrantables)

- **🔒 Inmutabilidad del Código Base:** No modificar ni recortar código sin una justificación explícita y aprobada.
- **⚡ Principio de No Regresión:** No eliminar funcionalidades sin una evaluación de impacto completa y una orden directa.
- **💻 Tipado Estricto y Absoluto:** Cero `any`. Interfaces y tipado completos son obligatorios en todo momento.
- **🧪 Test-Driven Commitment:** Toda función nueva o modificada DEBE tener tests asociados. Coverage de lógica financiera: 100% obligatorio. Tests deben pasar ANTES de cualquier commit o entrega.
- **🐳 Mentalidad Docker-First:** Todo debe ser containerizable. No introducir dependencias que rompan el aislamiento del entorno.
- **🔐 Integridad del Stack Tecnológico:** Verificar la integración completa con React, TypeScript, Vite, shadcn/ui y Docker.

---

## ⚠️ IMPORTANTES (Protocolos Estándar)

- **📂 Estructura de Archivos Consistente:** Scripts → `/Scripts` | Documentos → `/Documentos MarkDown`. Verificar la estructura existente antes de crear nuevos archivos.
- **🔍 Principio de Reutilización (DRY):** Consultar exhaustivamente el código existente para extender o reutilizar soluciones antes de crear nuevas.
- **🗺️ Task Lists Detalladas Obligatorias:** ANTES de ejecutar cualquier trabajo, crear task list con:
  - **Objetivos específicos y medibles** (usar ✅ checkboxes)
  - **Pasos granulares y secuenciales** (no "hacer X", sino "1. Leer archivo Y, 2. Crear función Z, 3. Validar con test W")
  - **Criterios de aceptación claros** (cómo se verifica que está completo)
  - **Dependencias identificadas** (qué debe existir antes de empezar)

  **Sin task list aprobada = no hay ejecución permitida.**

- **🎯 Disciplina de Foco (No Divagar):** Seguir estrictamente la task list sin desviaciones. Si surge un tema tangencial o idea nueva, anotarlo en "Notas para Después" y continuar con el plan actual. Task lists detalladas previenen pérdida de contexto y divagaciones.
- **📝 Documentación Activa y Sistemática:** Comentar cambios con el formato `// 🤖 [IA] - v[X.X.X]: [Razón específica]` y actualizar todos los archivos `.md` relevantes (CLAUDE.md, README.md, TECHNICAL-SPECS.md según corresponda).
- **🎯 Versionado Semántico y Consistente:** Actualizar los números de versión de forma coherente en todos los puntos designados del proyecto (archivos de componentes, CLAUDE.md, package.json si aplica).

---

## 🔭 VISIÓN A FUTURO (Roadmap)

- **🔧 Worker:** [PENDIENTE] Incluir en el versionado y la documentación cuando se implemente.
- **📊 Rate limits:** [FUTURO] Preparar el manejo de límites de tasa para cuando se integren APIs externas.
- **🔄 Estado avanzado:** [ROADMAP] Considerar la migración a Zustand o Redux si la complejidad del estado lo justifica.

---

## 💡 BUENAS PRÁCTICAS (Recomendado)

- **⚡ Eficiencia:** Crear solo lo necesario, reutilizar componentes y optimizar el uso de recursos.
- **🧩 Modularización:** Enfocarse en componentes escalables y cohesivos, evitando la saturación en un solo archivo.
- **🛡️ Manejo de Errores Robusto:** Gestionar errores de forma explícita para evitar fallos silenciosos.
- **📱 Límites del Cliente:** Respetar los límites de `localStorage`, timeouts de animación y uso de memoria del navegador.
- **✅ Build Limpio:** Asegurar cero errores de TypeScript, resolver todos los warnings y garantizar que todos los tests pasen.

---

## 🧭 METODOLOGÍA DE DESARROLLO UNIFICADA

**Mantra central:** `ANALIZO → PLANIFICO → EJECUTO → DOCUMENTO → VALIDO`

### ✅ Checklist de Calidad Pre-Entrega (OBLIGATORIO):

Antes de considerar cualquier trabajo como "completo", verificar TODOS estos puntos:

- [ ] **Task list** creada y aprobada antes de iniciar
- [ ] **REGLAS_DE_LA_CASA.md** revisadas al inicio de la sesión
- [ ] **Contexto cargado:** CLAUDE.md leído (última sesión + bugs conocidos)
- [ ] **Tests escritos** para toda función nueva o modificada
- [ ] **Test suite completo ejecutado:** `npm test` → **100% passing** (cero failures permitidos)
- [ ] **Build exitoso:** `npm run build` → **cero errores, cero warnings**
- [ ] **TypeScript limpio:** `npx tsc --noEmit` → **cero errores**
- [ ] **ESLint limpio:** `npm run lint` → **cero errors** (warnings documentados si inevitables)
- [ ] **Compatibilidad verificada** con el stack tecnológico actual (React + TS + Vite + shadcn + Docker)
- [ ] **Documentación actualizada:** Comentarios en código + archivos .md correspondientes
- [ ] **Versionado aplicado** consistentemente en todos los archivos tocados
- [ ] **Funcionalidad crítica preservada** al 100% (sin regresiones)

### 🆘 En caso de duda:
**PAUSA · PREGUNTA · VALIDA** (Es preferible una pausa para clarificar que una acción que rompa el sistema).

---

## 🔄 PROTOCOLO DE SESIÓN IA

### 📥 Al INICIAR cada sesión:

1. **Leer OBLIGATORIAMENTE:**
   - `REGLAS_DE_LA_CASA.md` (este documento) - Repasar reglas críticas
   - `CLAUDE.md` - Contexto de última sesión + bugs conocidos + roadmap actual

2. **Verificar estado del proyecto:**
   - Tests passing: `npm test` debe estar verde
   - Build limpio: `npm run build` sin errores
   - No bloqueadores críticos reportados en CLAUDE.md

3. **Confirmar task actual:**
   - ¿Hay una task list clara y aprobada?
   - ¿Están claros los criterios de aceptación?
   - ¿Tengo toda la información necesaria o debo preguntar primero?

### 📤 Al FINALIZAR cada sesión:

1. **Ejecutar validación completa (OBLIGATORIO):**
   ```bash
   npm test              # DEBE pasar 100% - cero failures
   npm run build         # DEBE compilar sin errores ni warnings
   npm run lint          # DEBE estar limpio
   npx tsc --noEmit      # DEBE validar TypeScript sin errores
   ```

2. **Actualizar documentación:**
   - **CLAUDE.md:** Agregar entrada con trabajo realizado + métricas + archivos tocados
   - **Comentarios en código:** Formato `// 🤖 [IA] - v[X.X.X]: [Razón]`
   - **README.md o TECHNICAL-SPECS.md:** Si cambió arquitectura o features

3. **Entregar limpio:**
   - ✅ Cero deuda técnica nueva
   - ✅ Cero tests failing
   - ✅ Cero warnings sin documentar
   - ✅ Task list 100% completada

### 🚫 NUNCA entregar trabajo si:

- ❌ **Tests fallando** (incluso 1 solo test = BLOQUEANTE total)
- ❌ **Build con errores** (TypeScript errors, Vite build failures)
- ❌ **ESLint errors** (warnings documentados OK, pero errors NO)
- ❌ **Task list incompleta** (criterios de aceptación no cumplidos)
- ❌ **Documentación desactualizada** (CLAUDE.md sin entrada de sesión)
- ❌ **Funcionalidad crítica rota** (regresiones detectadas)

**En estos casos:** Reportar el bloqueador, documentar en CLAUDE.md, y solicitar guía antes de continuar.

---

## 🔧 PROTOCOLO DE DEBUGGING (En caso de problemas)

### 🚨 Ante cualquier error o comportamiento inesperado:

1. **NO ASUMIR - VERIFICAR:**
   - Reproducir el error con pasos exactos documentados
   - Capturar logs completos (consola, terminal, errores TypeScript)
   - Identificar última modificación que funcionaba (git log)

2. **ANÁLISIS SISTEMÁTICO:**
   - ¿Es un error de tipos? → Revisar interfaces y contratos
   - ¿Es un error de runtime? → Revisar valores en runtime con console.log
   - ¿Es un error de build? → Revisar configuración Vite/TypeScript
   - ¿Es un error de tests? → Revisar mocks, fixtures, y test environment

3. **SOLUCIÓN DOCUMENTADA:**
   - Aplicar fix quirúrgico (mínimamente invasivo)
   - Agregar test que previene regresión
   - Documentar root cause en CLAUDE.md
   - Actualizar REGLAS si el error revela gap de proceso

### 📊 Logs obligatorios antes de reportar bugs:

```typescript
// Ejemplo de logging profesional
console.log('[ComponentName] 🔍 Estado actual:', {
  variable1,
  variable2,
  timestamp: new Date().toISOString()
});
```

**Nunca reportar:** "No funciona" o "Da error"
**Siempre reportar:** "Error X en línea Y del archivo Z cuando [condición específica]"

---

## 📊 MÉTRICAS DE CALIDAD (Estándares Mínimos)

### 🎯 Coverage de Tests:

| Tipo de Código | Coverage Mínimo | Target Ideal |
|----------------|-----------------|--------------|
| **Lógica financiera** (calculations.ts, etc.) | 100% ✅ | 100% |
| **Hooks de negocio** (usePhaseManager, etc.) | 80% | 95% |
| **Componentes UI críticos** | 70% | 85% |
| **Componentes UI secundarios** | 50% | 70% |
| **Utilities y helpers** | 90% | 100% |

**Regla de oro:** Si una función maneja dinero, DEBE tener 100% coverage sin excepciones.

### ⚡ Performance Thresholds:

- **Build time:** < 10 segundos (desarrollo), < 30 segundos (producción)
- **Test suite duration:** < 30 segundos (local), < 60 segundos (CI/CD)
- **Hot reload:** < 200ms (cambios en componentes)
- **Tiempo de carga inicial:** < 2 segundos (PWA modo standalone)

### 🧹 Deuda Técnica Permitida:

- **ESLint warnings:** Máximo 5 warnings totales (documentados en CLAUDE.md)
- **TypeScript `@ts-ignore`:** Máximo 0 (cero tolerancia)
- **TODO comments:** Máximo 10 en todo el proyecto (con issue tracking)
- **Console.logs en producción:** Máximo 0 (eliminar o envolver en `if (__DEV__)`)

---

## 🎓 GLOSARIO TÉCNICO DEL PROYECTO

### Términos de Negocio:

- **Phase 1 (Conteo):** Proceso de contar efectivo físico y pagos electrónicos
- **Phase 2 (Entrega):** Distribución óptima de efectivo para entregar, dejando exactamente $50
- **Phase 3 (Resultados):** Reporte final inmutable con alertas y acciones
- **Guided Mode:** Modo paso a paso con confirmación campo por campo (anti-fraude)
- **Manual Mode:** Modo rápido sin confirmaciones (solo empleados confiables)
- **Morning Count:** Conteo matutino para verificar fondo de $50
- **Evening Cut:** Corte nocturno con comparación contra ventas esperadas SICAR
- **Delivery Distribution:** Algoritmo greedy que separa denominaciones para entregar
- **Change Fund:** Los $50.00 que SIEMPRE deben quedar en caja (invariante crítico)

### Patrones Arquitectónicos:

- **Wizard V3 (Doctrina D.5):** Arquitectura obligatoria para flujos guiados multi-paso
  - Componente UI (presentación) - "dumb component"
  - Hook de lógica (cerebro) - `use...Flow` con `useReducer`
  - Archivo de configuración (datos) - `/data/*.ts`

- **Glass Morphism:** Sistema de diseño visual con blur + transparencias
  - Clase canónica: `.glass-morphism-panel`
  - Variables CSS: `--glass-blur-light/medium/full`

- **Sistema Ciego Anti-Fraude:** Sin preview de totales durante conteo
  - Auto-confirmación al completar
  - Transiciones automáticas sin botones manuales
  - Single count restriction por sesión

### Componentes Críticos:

- **CashCounter:** Orquestador principal de Phase 1
- **Phase2Manager:** Gestor de entrega de efectivo
- **GuidedFieldView:** Campo de input guiado con navegación inteligente
- **usePhaseManager:** Hook maestro de flujo multi-fase
- **calculations.ts:** Funciones core de cálculo financiero (100% coverage obligatorio)

---

## 📚 Referencias

- **GitHub:** [Contador de Monedas](https://github.com/SamuelERS/calculadora-corte-caja)
- **Notion:** Documentación extendida del proyecto
- **DIRECTOR_IA_ARQUITECTO.md:** Constitución y protocolos específicos del Director Técnico
- **CLAUDE.md:** Historial de desarrollo + contexto de sesiones + bugs conocidos
- **TECHNICAL-SPECS.md:** Especificaciones técnicas detalladas del proyecto

---

## 📋 Historial de Versiones

- **v3.1 (Octubre 2025):** Expansión estratégica con protocolo de sesión IA, testing obligatorio, task lists detalladas, protocolo de debugging, métricas de calidad, y glosario técnico. Cero contenido removido, solo adiciones profesionales.
- **v3.0:** Refactorización completa a "Reglas Constitucionales". Se formaliza el lenguaje de todas las reglas a un estándar técnico y autoritario.
- **v2.0:** Adaptación completa para stack React + TypeScript + Vite + shadcn/ui + Docker.
- **v1.0:** Versión original con stack WppConnect + OpenAI + Redis.

---

*Última actualización: Octubre 2025 - CashGuard Paradise*
*"Herramientas profesionales de tope de gama con valores cristianos"*

**🙏 Gloria a Dios por la excelencia en el desarrollo.**
