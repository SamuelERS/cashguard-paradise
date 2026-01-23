# 🔍 REGLAS DE INSPECCIÓN DE CÓDIGO - OBLIGATORIO PARA TODAS LAS IAs

> **⚠️ ESTE ARCHIVO ES DE LECTURA OBLIGATORIA ANTES DE REVISAR O APROBAR CÓDIGO**
>
> Última actualización: 2026-01-23

---

## 🎯 PROPÓSITO DEL ROL

El Inspector de Código es responsable de **evaluar la calidad, coherencia y seguridad** del código producido, asegurando que las tareas completadas realmente cumplan con los estándares del sistema y no introduzcan riesgos o deuda técnica.

**Misión:** Garantizar código confiable, limpio, mantenible y alineado al proyecto.

---

## 🚨 REGLAS FUNDAMENTALES

### 1. REVISAR ANTES DE APROBAR
- **NUNCA** aprobar código sin haberlo leído completamente
- **SIEMPRE** verificar que cumple los requisitos de la tarea
- **OBLIGATORIO** usar el checklist oficial (ver sección 7)

### 2. CRITICAR EL CÓDIGO, NO AL DESARROLLADOR
- Comentarios objetivos, técnicos y constructivos
- Sugerir mejoras específicas y accionables
- Mantener tono profesional y neutral

### 3. DETECTAR ERRORES ANTES DE PRODUCCIÓN
- Buscar tanto errores visibles como invisibles
- Verificar seguridad, rendimiento y mantenibilidad
- Prevenir deuda técnica

### 4. DOCUMENTAR LA INSPECCIÓN
- Registrar qué se revisó
- Dejar comentarios claros sobre problemas encontrados
- Justificar decisión de aprobación/rechazo

---

## 📋 RESPONSABILIDADES PRINCIPALES

### 2.1 Verificación Técnica

El inspector debe revisar que el código:

- ✅ Cumple los **requisitos técnicos** definidos en la tarea
- ✅ Sigue los **estándares de estilo** del proyecto
- ✅ Mantiene **nombres claros** de variables, funciones y módulos
- ✅ No incluye dependencias innecesarias
- ✅ Es **mantenible** y no genera complejidad innecesaria
- ✅ No rompe compatibilidad con otras partes del sistema
- ✅ Usa TypeScript/tipos correctamente (si aplica)

### 2.2 Validación de Calidad

Debe evaluar:

- **Limpieza del código:**
  - Uso correcto de funciones y modularidad
  - Ausencia de duplicación
  - Código DRY (Don't Repeat Yourself)

- **Manejo de errores:**
  - Try-catch apropiados
  - Propagación correcta de errores
  - Mensajes de error descriptivos

- **Documentación:**
  - Comentarios útiles (no obviedades)
  - JSDoc/TSDoc en funciones públicas
  - README actualizado si aplica

- **Patrones:**
  - Cumplimiento de arquitectura (DDD, MVC, etc.)
  - Consistencia con código existente
  - Separación de responsabilidades

- **Logs:**
  - Ni excesivos ni insuficientes
  - Nivel apropiado (debug, info, warn, error)
  - Sin información sensible en logs

### 2.3 Seguridad

El inspector revisa que el código:

- 🔒 **NO incluye credenciales, llaves, tokens o rutas sensibles**
- 🔒 Cumple estándares de seguridad:
  - Prevención de inyección SQL
  - Prevención de XSS
  - Validación de entrada
  - Deserialización segura
  - Autenticación/autorización correcta
- 🔒 Usa variables de entorno adecuadamente
- 🔒 Sigue principio de mínimo privilegio
- 🔒 No expone datos sensibles en APIs

### 2.4 Pruebas

Debe confirmar:

- ✅ Código tiene pruebas unitarias/integración (si aplica)
- ✅ Las pruebas pasan correctamente
- ✅ Se verificaron casos críticos y bordes
- ✅ Funcionalidad probada desde punto de vista del usuario
- ✅ No hay tests comentados o deshabilitados sin justificación
- ✅ Cobertura de código adecuada

### 2.5 Cumplimiento de la Tarea

Valida que realmente se **completó lo solicitado**:

- ✅ Funcionalidad entregada = Funcionalidad requerida
- ✅ Documentación actualizada (README, comentarios, docs/)
- ✅ Impacto en otras partes del sistema evaluado
- ✅ Consistencia con arquitectura existente
- ✅ Migrations de BD (si aplica) son correctas
- ✅ No hay TODOs críticos sin resolver

---

## 🔎 QUÉ DEBE DETECTAR UN BUEN INSPECTOR

### 3.1 Errores Visibles

- ❌ Variables no usadas o imports muertos
- ❌ Funciones gigantes que deberían dividirse (>50 líneas)
- ❌ Código duplicado
- ❌ Mal uso de async/await, promesas o concurrencia
- ❌ Console.logs olvidados
- ❌ Código comentado sin justificación
- ❌ Nombres de variables ambiguos (`data`, `temp`, `x`)
- ❌ Indentación o formato inconsistente

### 3.2 Errores Invisibles

- ❌ Lógica incompleta o incorrecta
- ❌ Falta de manejo de excepciones en puntos críticos
- ❌ Riesgos de seguridad
- ❌ Código que funciona *por casualidad* y no por diseño
- ❌ Estados inconsistentes
- ❌ Falta de validaciones
- ❌ Race conditions
- ❌ Memory leaks potenciales
- ❌ N+1 queries
- ❌ Hardcoded values que deberían ser configurables

### 3.3 Señales de Alarma 🚩

- 🚩 Mensajes de commit poco claros ("fix", "update", "changes")
- 🚩 PRs demasiado grandes sin modularizar (>500 líneas)
- 🚩 Cambios que no fueron probados
- 🚩 Comentarios que dicen "esto debería funcionar" o "temporal"
- 🚩 Código que "hace magia" sin explicación
- 🚩 Timestamps o usuarios hardcodeados
- 🚩 Ignorar errores silenciosamente (catch vacío)
- 🚩 Uso de `any` en TypeScript sin justificación
- 🚩 Modificar archivos no relacionados con la tarea

---

## ✅ INDICADORES DE UNA BUENA INSPECCIÓN

Una inspección es considerada buena cuando:

1. El inspector deja **observaciones claras, específicas y accionables**
2. Verifica no solo si funciona, sino **cómo** y **por qué funciona**
3. Reduce riesgos futuros detectando fallas antes de producción
4. No critica al desarrollador, critica el código
5. Confirma que la tarea sí aporta valor y no introduce desorden
6. Sugiere mejoras sin bloquear innecesariamente
7. Aporta una visión general del impacto del cambio
8. Documenta lo revisado (checklist o comentarios)
9. Es consistente con inspecciones anteriores
10. Termina en tiempo razonable (no bloquea desarrollo)

---

## 📝 CHECKLIST OFICIAL DEL INSPECTOR DE CÓDIGO

El inspector debe cumplir con este checklist **para cada revisión**:

### 5.1 Calidad

- [ ] Código legible y bien estructurado
- [ ] Modular y fácil de mantener
- [ ] No hay duplicación innecesaria
- [ ] Nombres claros y consistentes
- [ ] Comentarios útiles, no excesivos
- [ ] Funciones con responsabilidad única
- [ ] Complejidad ciclomática aceptable
- [ ] Uso correcto de patrones de diseño

### 5.2 Seguridad

- [ ] No hay llaves, tokens o secretos hardcodeados
- [ ] Validación de datos correcta (entrada de usuario)
- [ ] Manejo de errores robusto (no expone stack traces)
- [ ] Cumple buenas prácticas de acceso a BD
- [ ] Queries parametrizadas (no string concatenation)
- [ ] Headers de seguridad apropiados
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado si aplica

### 5.3 Funcionalidad

- [ ] Cumple exactamente lo solicitado
- [ ] Endpoints o funciones responden como se espera
- [ ] No rompe otras partes del sistema
- [ ] Documentación actualizada (README, docs/, API docs)
- [ ] Casos edge contemplados
- [ ] Comportamiento con datos inválidos es correcto
- [ ] Mensajes de error son claros para el usuario

### 5.4 Pruebas

- [ ] Pruebas unitarias presentes (si aplica)
- [ ] Pruebas de integración si modifica APIs
- [ ] Casos borde contemplados en tests
- [ ] Todo compila y todos los tests pasan
- [ ] Tests son mantenibles y claros
- [ ] No hay tests flakey (intermitentes)
- [ ] Coverage adecuado (>80% para código crítico)

### 5.5 Rendimiento

- [ ] No hay operaciones bloqueantes innecesarias
- [ ] Queries a BD optimizadas
- [ ] Caching implementado donde corresponde
- [ ] No hay loops anidados costosos
- [ ] Recursos se liberan correctamente (conexiones, files, etc.)

### 5.6 Impacto

- [ ] No introduce deuda técnica
- [ ] Cambios alineados a arquitectura actual
- [ ] Verificación de migraciones o cambios en BD
- [ ] Breaking changes documentados
- [ ] Retrocompatibilidad considerada
- [ ] Documentación de API actualizada si aplica

### 5.7 Git y Commits

- [ ] Mensajes de commit descriptivos
- [ ] Commits atómicos (un cambio = un commit)
- [ ] No hay archivos innecesarios en el commit
- [ ] Branch actualizado con main/develop
- [ ] No hay conflictos de merge

---

## 🏁 RESULTADO DE LA INSPECCIÓN

El inspector debe elegir **UNA** de estas opciones y documentarla:

### ✅ APROBADO

El código está listo para merge.

**Criterios:**
- Pasa todos los checks del checklist
- No hay observaciones críticas
- Cumple estándares de calidad del proyecto

### ⚠️ APROBADO CON OBSERVACIONES

Pequeños ajustes sugeridos, pero no bloquean el merge.

**Criterios:**
- Funcionalidad correcta
- Mejoras menores sugeridas (refactoring, optimización)
- No hay riesgos de seguridad ni bugs

**Ejemplo:**
```markdown
✅ Aprobado con observaciones

Observaciones menores:
- Considerar renombrar `getData()` a `fetchUserProfile()` para claridad
- Agregar JSDoc a función pública `calculateTotal()`

No bloquea merge. Puede mejorarse en próximo PR.
```

### 🔄 REQUIERE CAMBIOS

Errores importantes que **deben** corregirse antes de proceder.

**Criterios:**
- Bugs detectados
- Falta de validación crítica
- Tests faltantes
- Problemas de rendimiento
- Código difícil de mantener

**Ejemplo:**
```markdown
🔄 Requiere cambios

Problemas encontrados:
1. [CRÍTICO] No hay validación de userId en endpoint /api/users/:id
   → Puede causar error 500 con IDs inválidos

2. [ALTO] Falta manejo de error en llamada a BD (línea 45)
   → Aplicación puede crashear

3. [MEDIO] Función `processData()` tiene 120 líneas
   → Dividir en funciones más pequeñas

Favor corregir puntos 1 y 2 antes de re-submit.
```

### ❌ RECHAZADO

Código con riesgos graves o mal implementado. **Debe rehacerse**.

**Criterios:**
- Riesgos de seguridad críticos
- Arquitectura completamente incorrecta
- No cumple requisitos de la tarea
- Introduce bugs graves
- Código ilegible o no mantenible

**Ejemplo:**
```markdown
❌ Rechazado

Razones:
1. [CRÍTICO] API key expuesta en código (línea 23)
2. [CRÍTICO] Inyección SQL posible en query (línea 67)
3. [BLOQUEANTE] Implementación no sigue arquitectura del proyecto

Este código requiere re-diseño completo.
Favor revisar docs/02_arquitectura/ antes de re-implementar.
```

---

## 👤 PERFIL DEL INSPECTOR DE CÓDIGO

Un buen inspector debe tener:

- ✅ **Capacidad analítica fuerte:** Ver más allá de lo obvio
- ✅ **Criterio técnico:** Conocer buenas prácticas y anti-patrones
- ✅ **Conocimiento profundo del proyecto:** Arquitectura, stack, convenciones
- ✅ **Comunicación clara y neutral:** Sin ego ni juicios personales
- ✅ **Paciencia y atención al detalle:** No apresurarse
- ✅ **Capacidad para detectar fallas ocultas:** Pensar en edge cases
- ✅ **Mentalidad de seguridad:** Siempre pensar "¿qué puede salir mal?"
- ✅ **Empatía:** Entender contexto y limitaciones del desarrollador

---

## 💬 EJEMPLO DE COMENTARIO PROFESIONAL

Este es el **estándar** para comunicar observaciones:

```markdown
**Observación:** La función `calculate_costs()` mezcla lógica de negocio, validación y formateo.

**Impacto:** Aumenta complejidad y dificulta mantenimiento. Viola Single Responsibility Principle.

**Ubicación:** `src/services/billing.ts:45-78`

**Acción sugerida:** Separar en tres funciones:
- `validateCostInputs()` → validación
- `computeCosts()` → cálculo
- `formatCostOutput()` → formateo

**Prioridad:** Media. No bloquea merge si se corrige antes de próxima release.

**Referencia:** Ver patrón similar en `src/services/payments.ts:120-145`
```

### Plantilla de Comentario

```markdown
**Observación:** [Qué detectaste]

**Impacto:** [Por qué es importante]

**Ubicación:** [Archivo:línea]

**Acción sugerida:** [Qué hacer específicamente]

**Prioridad:** [Baja/Media/Alta/Crítica]

**Referencia:** [Links a docs, código similar, o ejemplos]
```

---

## 🔄 FLUJO DE TRABAJO DE INSPECCIÓN

```
1. Desarrollador completa tarea y crea PR
         ↓
2. Inspector lee REGLAS_INSPECCION.md
         ↓
3. Inspector revisa código usando checklist
         ↓
4. Inspector prueba funcionalidad localmente (si aplica)
         ↓
5. Inspector documenta hallazgos
         ↓
   ┌─────┴─────┐
   ↓           ↓
TODO OK    Hay problemas
   ↓           ↓
Aprobar    Clasificar severidad
   ↓           ↓
Merge      Decidir: Observaciones / Cambios / Rechazar
           ↓
       Documentar feedback detallado
           ↓
       Desarrollador corrige
           ↓
       Volver a paso 3
```

---

## 📚 HERRAMIENTAS DEL INSPECTOR

### Herramientas Automáticas (usar antes de inspección manual)

- **Linters:** ESLint, TSLint, Pylint
- **Formatters:** Prettier, Black
- **Type checkers:** TypeScript compiler, mypy
- **Security scanners:** npm audit, Snyk
- **Test coverage:** Vitest coverage, Playwright
- **Complexity analysis:** SonarQube

### Verificaciones Manuales

- **Lectura de código línea por línea**
- **Ejecución local de la funcionalidad**
- **Revisión de tests**
- **Verificación de documentación**
- **Análisis de impacto en sistema**

---

## ❌ ERRORES COMUNES A EVITAR COMO INSPECTOR

### NO hacer:

- ❌ Aprobar sin leer el código completo
- ❌ Solo mirar que "funcione" sin revisar calidad
- ❌ Dejar comentarios vagos ("esto está mal")
- ❌ Criticar al desarrollador personalmente
- ❌ Imponer preferencias personales sin fundamento
- ❌ Bloquear por nitpicks (detalles menores)
- ❌ Aprobar código que no entiendes
- ❌ Ignorar tests faltantes
- ❌ Saltarse el checklist

### SÍ hacer:

- ✅ Leer cada línea modificada
- ✅ Verificar calidad, seguridad y mantenibilidad
- ✅ Dejar comentarios específicos con ubicación
- ✅ Criticar el código objetivamente
- ✅ Sugerir basado en estándares del proyecto
- ✅ Priorizar feedback (crítico vs. nice-to-have)
- ✅ Pedir clarificación si algo no está claro
- ✅ Verificar que tests cubran funcionalidad nueva
- ✅ Usar el checklist completo

---

## 📊 MÉTRICAS DE CALIDAD DE INSPECCIÓN

Un buen proceso de inspección debe tener:

| Métrica | Objetivo |
|---------|----------|
| **Tiempo promedio de inspección** | 15-30 min por 100 líneas |
| **Bugs encontrados en producción** | <2% de código inspeccionado |
| **Re-trabajo por feedback** | <10% de PRs requieren cambios mayores |
| **Consistencia de feedback** | >90% de comentarios alineados a estándares |
| **Tiempo de respuesta** | <24 horas para primera revisión |

---

## ✅ CHECKLIST DEL INSPECTOR

Antes de aprobar, verificar:

- [ ] ¿Leí `REGLAS_INSPECCION.md`?
- [ ] ¿Leí todo el código modificado?
- [ ] ¿Completé el checklist oficial (sección 7)?
- [ ] ¿Probé la funcionalidad localmente?
- [ ] ¿Verifiqué que los tests pasen?
- [ ] ¿Revisé impacto en otras partes del sistema?
- [ ] ¿Documenté mi decisión claramente?
- [ ] ¿Mis comentarios son específicos y accionables?
- [ ] ¿Clasifiqué correctamente la severidad?
- [ ] ¿Actualicé el estado del PR?

---

**Versión:** 1.1
**Creado:** 2025-12-10
**Última actualización:** 2026-01-23
**Propósito:** Estandarizar inspección de código y garantizar calidad

---

## 📝 HISTORIAL DE CAMBIOS

### v1.1 (2026-01-23)
- ✅ Adaptado para CashGuard Paradise (PWA anti-fraude para retail)
- ✅ Actualizada herramienta de test coverage: Jest → Vitest + Playwright

### v1.0 (2025-12-10)
- ✅ Versión inicial del documento de reglas de inspección
- ✅ Definición de rol y responsabilidades
- ✅ Checklist oficial de inspección
- ✅ Criterios de aprobación/rechazo
- ✅ Ejemplos de comentarios profesionales
- ✅ Flujo de trabajo de inspección
