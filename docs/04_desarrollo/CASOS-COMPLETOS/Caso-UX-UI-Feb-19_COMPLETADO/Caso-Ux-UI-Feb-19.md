Plan: Auditoría UX/UI Módulo Nocturno CashGuard Paradise
Contexto
El módulo nocturno (corte de caja) es el flujo principal que los empleados recorren diariamente. Se requiere una inspección exhaustiva para detectar inconsistencias visuales, bugs estéticos, y malas implementaciones de UX/UI a lo largo de todo el recorrido: OperationSelector → Wizard (5 pasos) → Phase 1 (conteo) → Phase 2A (entrega) + Phase 2B (verificación ciega) → Phase 3 (reporte final).

La auditoría NO incluye cambios funcionales/lógicos — solo correcciones de presentación, consistencia visual y adherencia al design system establecido.

Categorización
BUG: Error visual que rompe la experiencia o contradice el design system
IMP: Mejora de implementación (código correcto pero subóptimo)
COS: Cosmético (refinamiento visual menor)
Prioridad: P0 (crítico) → P1 (alto) → P2 (medio) → P3 (bajo)

Hallazgos por Módulo
Módulo 1: OperationSelector (src/components/operation-selector/OperationSelector.tsx)
#	Tipo	P	Hallazgo	Detalle
1.1	BUG	P1	Glass morphism inline diverge de .glass-morphism-panel	Cards usan rgba(36, 36, 36, 0.4) + blur(20px) inline, mientras .glass-morphism-panel usa rgba(28, 28, 32, 0.72) + blur(12px) con !important. Dos sistemas de glass compitiendo.
1.2	IMP	P2	viewportScale pattern obsoleto	Math.min(window.innerWidth / 430, 1) aplicado como transform: scale() — el resto del app usa clamp() para responsividad. Este pattern causa layout shift y es inconsistente.
1.3	IMP	P2	Estilos inline masivos (~50 líneas de style={{}})	Cards con 15+ propiedades inline en vez de usar clases CSS/Tailwind. Dificulta mantenimiento y override de temas.
Módulo 2: InitialWizardModal (Wizard 5 pasos)
#	Tipo	P	Hallazgo	Detalle
2.1	BUG	P1	Botones sesión activa (Step5) usan <button> custom	Step5SicarInput.tsx líneas 62-77: Dos <button> con clases manuales (bg-amber-500/20, bg-red-500/20) en vez de ConstructiveActionButton/DestructiveActionButton. Rompe sistema de 4 botones estandarizado.
2.2	COS	P3	Panel sesión activa sin glass-morphism-panel	El panel usa rounded-lg p-4 border border-amber-500/40 con rgba(245, 158, 11, 0.08) inline — no sigue el glass morphism del resto del wizard.
Módulo 3: Phase 1 — Conteo de Efectivo
#	Tipo	P	Hallazgo	Detalle
3.1	IMP	P2	GuidedFieldView.tsx — imágenes de denominaciones 404	Referencia a /monedas-recortadas-dolares/ que no existe. Fallback funciona pero sin imágenes la UX pierde contexto visual. (Documentado desde v1.3.7T, pendiente resolución).
Módulo 4: Phase 2A — Entrega a Gerencia (Phase2DeliverySection)
#	Tipo	P	Hallazgo	Detalle
4.1	COS	P3	DeliveryFieldView.tsx — consistencia visual con Phase 1	El layout de delivery fields es funcional pero visualmente distinto al guided counting view (Phase 1). Los campos de entrega no tienen el mismo patrón de glass card.
Módulo 5: Phase 2B — Verificación Ciega (Phase2VerificationSection)
#	Tipo	P	Hallazgo	Detalle
5.1	IMP	P2	Import de Button genérico (línea 16)	Importa Button de @/components/ui/button — verificar si se usa directamente o si ya fue reemplazado por botones estandarizados en el JSX renderizado.
5.2	IMP	P3	Componente aún 783+ líneas	A pesar de extracciones (VerificationHeader, VerificationProgress, etc.), el archivo principal sigue extenso. No es un bug visual pero dificulta auditoría y mantenimiento UX.
Módulo 6: Phase 3 — Reporte Final (CashCalculation.tsx + CashResultsDisplay.tsx)
#	Tipo	P	Hallazgo	Detalle
6.1	BUG	P1	CashResultsDisplay.tsx — glassCard inline diverge	Constante glassCard usa rgba(36, 36, 36, 0.4) — mismo problema que 1.1. Debe alinearse con .glass-morphism-panel.
6.2	COS	P3	Framer Motion removido pero <div style={{ opacity: 1 }}> persiste	v1.3.6Z removió motion.div reemplazando por <div> con style={{ opacity: 1 }} — el opacity: 1 es redundante (valor default).
Módulo 7: Cross-Cutting (Transversal)
#	Tipo	P	Hallazgo	Detalle
7.1	BUG	P0	Dos sistemas de glass morphism coexisten	Problema raíz: .glass-morphism-panel en CSS (rgba(28, 28, 32, 0.72)) vs inline styles en múltiples componentes (rgba(36, 36, 36, 0.4)). Crea inconsistencia visual notable entre pantallas. Afecta: OperationSelector, CashResultsDisplay, y potencialmente otros.
7.2	IMP	P1	Botones no estandarizados en Step5SicarInput	Único lugar detectado donde se usan <button> raw en vez del sistema de 4 botones.
7.3	IMP	P2	!important en .glass-morphism-panel	El uso de !important en index.css líneas 493-495 impide override contextual limpio. Los componentes que necesitan variaciones recurren a inline styles, perpetuando la divergencia.
Plan de Ejecución (Orden de Implementación)
Paso 1: Unificar Glass Morphism (7.1, 1.1, 6.1) — P0
Archivos: index.css, OperationSelector.tsx, CashResultsDisplay.tsx

Decidir: adoptar los valores de .glass-morphism-panel como single source of truth
Migrar inline styles de OperationSelector cards → usar clase .glass-morphism-panel o variante
Migrar glassCard constant de CashResultsDisplay → usar clase CSS
Evaluar si !important (7.3) puede removerse al eliminar inline styles conflictivos
Paso 2: Estandarizar Botones Step5 (2.1, 7.2) — P1
Archivo: Step5SicarInput.tsx

Reemplazar <button> custom líneas 62-77 por ConstructiveActionButton (Reanudar) y DestructiveActionButton (Abortar)
Preservar aria-label y funcionalidad onClick existentes
Paso 3: Limpiar OperationSelector (1.2, 1.3) — P2
Archivo: OperationSelector.tsx

Evaluar migración de viewportScale → clamp() (requiere testing visual cuidadoso)
Reducir inline styles moviendo propiedades repetidas a clases CSS/Tailwind
Paso 4: Limpiezas cosméticas (6.2, 2.2) — P3
Archivos: CashCalculation.tsx, Step5SicarInput.tsx

Remover style={{ opacity: 1 }} redundante
Evaluar si panel sesión activa merece glass morphism
Paso 5: Verificar imports Phase2 (5.1) — P2
Archivo: Phase2VerificationSection.tsx

Confirmar si Button import se usa o es dead import
Si se usa: migrar a botón estandarizado apropiado
Si no se usa: remover import
Verificación
npm run build — debe completar sin errores TypeScript
Inspección visual manual recorriendo todo el flujo nocturno:
OperationSelector → click "Corte de Caja"
Wizard pasos 1-5 (verificar glass morphism consistente)
Phase 1 conteo (verificar cards)
Phase 2 entrega + verificación
Phase 3 reporte (verificar glass cards alineados)
Comparación antes/después en viewport móvil (375px) y desktop (1440px)
Verificar que SHOW_REMAINING_AMOUNTS = false sigue ocultando correctamente los 5 elementos anti-fraude
Fuera de Alcance
Cambios funcionales/lógicos (anti-fraude, cálculos, WhatsApp)
Módulo matutino (MorningVerification)
Módulo deliveries
Imágenes de denominaciones (problema conocido, requiere assets externos)
Refactor de Phase2VerificationSection (783 líneas — tarea separada)
Tests


DIRECTIVA DE INVESTIGACIÓN Y RESOLUCIÓN MODULAR (DIRM) — CASHGUARD PARADISE

Se reporta un documento de caso/problema que requiere ubicación, análisis y resolución. Bajo los roles de Investigador, Arquitecto de Software y Documentador de Élite, se solicita ejecutar el siguiente protocolo:

1. FASE DE INVESTIGACIÓN Y MAPEO:
   - Referencia obligatoria:
     /Users/samuelers/Paradise System Labs/cashguard-paradise/docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md
   - Localización y rastreo: identificar ubicación exacta del caso en la jerarquía de `docs/` y ubicar todos los activos involucrados (archivos, imágenes de referencia y fragmentos de código).

2. PRIORIDAD ARQUITECTÓNICA (RESTRICCIÓN DE CÓDIGO):
   - Prohibido iniciar programación o implementación técnica en esta fase.
   - Objetivo único: crear Guía Arquitectónica Modular (estrategia antes de ejecución).

3. DESCONSTRUCCIÓN MODULAR (1 Archivo = 1 Tarea):
   - Fragmentar el problema en fases o módulos documentados individualmente.
   - Regla de oro: un archivo representa una sola tarea validable antes de pasar al siguiente módulo.
   - No se permite código funcional en esta fase.

4. TRAZABILIDAD Y CENTRALIZACIÓN DE ORIGEN:
   - Trasladar el documento inicial y su evidencia visual a la carpeta final del caso.
   - Centralizar origen y resolución para evitar ambigüedad futura.

5. USO DE SKILLS (BUENAS PRÁCTICAS):
   - /Users/samuelers/Paradise System Labs/cashguard-paradise/.agents/skills/systematic-debugging
   - /Users/samuelers/Paradise System Labs/cashguard-paradise/.agents/skills/writing-plans
   - /Users/samuelers/Paradise System Labs/cashguard-paradise/.agents/skills/vercel-react-best-practices

6. ENTREGABLE Y VALIDACIÓN:
   Entregar estructura de carpetas, archivos modulares de planificación y traslado de activos de origen. Luego solicitar aprobación explícita antes de cualquier fase de desarrollo.
