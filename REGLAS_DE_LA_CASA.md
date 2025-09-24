# 🏠 Reglas de la Casa v3.0

**Documento de referencia para desarrollo con IA en proyectos Paradise System Labs**

Este documento define las reglas fundamentales que **NUNCA se rompen** durante el desarrollo, mantenimiento y evolución de cualquier proyecto en Paradise System Labs. Son la base para un desarrollo consistente, seguro y escalable.

---

## 🚨 CRÍTICAS (Leyes Inquebrantables)

- **🔒 Inmutabilidad del Código Base:** No modificar ni recortar código sin una justificación explícita y aprobada.
- **⚡ Principio de No Regresión:** No eliminar funcionalidades sin una evaluación de impacto completa y una orden directa.
- **💻 Tipado Estricto y Absoluto:** Cero `any`. Interfaces y tipado completos son obligatorios en todo momento.
- **🐳 Mentalidad Docker-First:** Todo debe ser containerizable. No introducir dependencias que rompan el aislamiento del entorno.
- **🔐 Integridad del Stack Tecnológico:** Verificar la integración completa con React, TypeScript, Vite, shadcn/ui y Docker.

---

## ⚠️ IMPORTANTES (Protocolos Estándar)

- **📂 Estructura de Archivos Consistente:** Scripts → `/Scripts` | Documentos → `/Documentos MarkDown`. Verificar la estructura existente antes de crear nuevos archivos.
- **🔍 Principio de Reutilización (DRY):** Consultar exhaustivamente el código existente para extender o reutilizar soluciones antes de crear nuevas.
- **🗺️ Planificación Previa Obligatoria (Plan-Mode-On):** Crear una **task list** detallada con objetivos específicos y medibles antes de iniciar cualquier ejecución.
- **📝 Documentación Activa y Sistemática:** Comentar cambios con el formato `// 🤖 [IA] - [Razón]` y actualizar todos los archivos `.md` relevantes.
- **🎯 Versionado Semántico y Consistente:** Actualizar los números de versión de forma coherente en todos los puntos designados del proyecto.

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

### ✅ Checklist de Calidad por Sesión:
- [ ] **Task list** creada y aprobada antes de iniciar.
- [ ] **Compatibilidad** verificada con el stack tecnológico actual.
- [ ] **Documentación** (comentarios de código y archivos .md) actualizada.
- [ ] **Versionado** aplicado consistentemente.
- [ ] **Build** exitoso sin errores ni warnings.
- [ ] **Funcionalidad** crítica preservada al 100%.

### 🆘 En caso de duda:
**PAUSA · PREGUNTA · VALIDA** (Es preferible una pausa para clarificar que una acción que rompa el sistema).

---

## 📚 Referencias

- **GitHub:** [Contador de Monedas](https://github.com/SamuelERS/calculadora-corte-caja)
- **Notion:** Documentación extendida del proyecto
- **DIRECTOR_IA_ARQUITECTO.md:** Constitución y protocolos específicos del Director Técnico.

---

## 📋 Historial de Versiones

- **v3.0:** Refactorización completa a "Reglas Constitucionales". Se formaliza el lenguaje de todas las reglas a un estándar técnico y autoritario.
- **v2.0:** Adaptación completa para stack React + TypeScript + Vite + shadcn/ui + Docker.
- **v1.0:** Versión original con stack WppConnect + OpenAI + Redis.

---

*Última actualización: Septiembre 2025 - CashGuard Paradise*