# 🔍 Plantilla: Reglas de Inspección de Código v1.0

> **Audiencia:** Todos los desarrolladores e inspectores (humanos e IAs).
> **Propósito:** Este documento define el estándar para la revisión de código (Pull Requests). Asegura que el código sea de alta calidad, seguro y mantenible.

---

## 🎯 Misión del Inspector

Garantizar que el código cumple con los estándares del proyecto, no introduce riesgos y es una adición de valor antes de ser integrado.

---

## 🚨 Reglas Fundamentales del Inspector

1.  **Revisar Antes de Aprobar:** Nunca aprobar código sin leerlo y entenderlo.
2.  **Criticar el Código, No a la Persona:** El feedback debe ser técnico, objetivo y constructivo.
3.  **Detectar Errores Invisibles:** Buscar no solo bugs obvios, sino también riesgos de seguridad, problemas de rendimiento y lógica defectuosa.
4.  **Documentar la Decisión:** Justificar siempre una aprobación, petición de cambios o rechazo.

---

## ✅ CHECKLIST OFICIAL DE INSPECCIÓN

*El inspector debe verificar estos puntos en cada revisión.*

### 5.1 Calidad y Mantenibilidad
- [ ] **Legibilidad:** El código es claro y fácil de entender.
- [ ] **Estructura:** Sigue los patrones de diseño y la arquitectura del proyecto.
- [ ] **Sin Duplicación (DRY):** No hay bloques de código copiados y pegados.
- [ ] **Nomenclatura:** Variables, funciones y clases tienen nombres descriptivos.
- [ ] **Simplicidad:** No hay complejidad innecesaria (KISS - Keep It Simple, Stupid).
- [ ] **Funciones Cortas:** Las funciones tienen una sola responsabilidad y son breves.

### 5.2 Seguridad
- [ ] **Cero Credenciales:** No hay llaves, tokens o contraseñas hardcodeadas.
- [ ] **Validación de Entradas:** Toda data proveniente de usuarios o sistemas externos es validada.
- [ ] **Manejo de Errores Seguro:** No se exponen detalles sensibles (stack traces) en los errores públicos.
- [ ] **Queries Seguras:** Se usan queries parametrizadas para evitar inyección de SQL.

### 5.3 Funcionalidad
- [ ] **Cumple Requisitos:** El código hace exactamente lo que la tarea solicitó.
- [ ] **No Regresión:** No rompe ninguna funcionalidad existente.
- [ ] **Manejo de Casos Borde:** Se han considerado entradas inesperadas o valores límite.
- [ ] **Documentación Actualizada:** El `README.md` o la carpeta `/docs` han sido actualizados si es necesario.

### 5.4 Pruebas (Testing)
- [ ] **Existen Tests:** La nueva lógica de negocio tiene pruebas unitarias y/o de integración.
- [ ] **Tests Pasan:** Todos los tests se ejecutan exitosamente.
- [ ] **Calidad de Tests:** Los tests son claros, siguen el patrón Arrange-Act-Assert y cubren los casos de uso importantes.
- [ ] **Cobertura Adecuada:** Se cumple con el mínimo de cobertura de código definido en las `REGLAS_DESARROLLO.md`.

### 5.5 Git y Commits
- [ ] **Mensajes de Commit Claros:** Siguen el estándar de Commits Convencionales (`feat:`, `fix:`, etc.).
- [ ] **Commits Atómicos:** Cada commit representa un cambio lógico y cohesivo.
- [ ] **Historial Limpio:** No hay commits de "WIP" o "fix" desordenados. La rama está actualizada con `develop`/`main`.

---

## 🏁 RESULTADO DE LA INSPECCIÓN

El inspector debe elegir y comunicar claramente **UNA** de estas opciones.

### ✅ APROBADO
El código cumple con todos los estándares y está listo para ser integrado.

### ⚠️ APROBADO CON OBSERVACIONES
El código es funcional y seguro, pero se sugieren mejoras menores (ej. renombrar una variable, un pequeño refactor) que pueden realizarse en un futuro PR. **No bloquea la integración.**

### 🔄 REQUIERE CAMBIOS
El código tiene problemas que **deben** ser solucionados antes de la integración. (Ej: bugs, tests faltantes, no cumple estándares de forma significativa).

### ❌ RECHAZADO
El código tiene problemas fundamentales (ej: riesgo de seguridad crítico, enfoque arquitectónico incorrecto) y debe ser re-diseñado o re-implementado.

---
### Plantilla de Comentario de Revisión

Usa esta plantilla para dar feedback claro y accionable.

```markdown
**Observación:** [Qué detectaste]
**Impacto:** [Por qué es importante y el riesgo que representa]
**Ubicación:** [Archivo:línea]
**Acción Sugerida:** [Qué hacer específicamente para solucionarlo]
**Prioridad:** [Crítica / Alta / Media / Baja]
```
