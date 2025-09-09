# 🏠 Reglas de la Casa v2.0

**Documento de referencia para desarrollo con Claude Code en proyectos Paradise System Labs**

Este documento define las reglas fundamentales que **NUNCA se rompen** durante el desarrollo, mantenimiento y evolución de cualquier proyecto en Paradise System Labs. Son la base para un desarrollo consistente, seguro y escalable.

---

## 🚨 CRÍTICAS (Nunca romper)

- **🔒 Preservación total:** No modifiques ni recortes código sin justificación explícita
- **⚡ Funcionalidad intacta:** No elimines funcionalidades sin evaluar impacto completo
- **💻 TypeScript estricto:** Cero `any` - interfaces y tipado completos obligatorios
- **🐳 Docker first:** Todo debe ser containerizable - no introduzcas dependencias que rompan containerización
- **🔐 Compatibilidad total:** Verifica integración con React + TypeScript + Vite + shadcn/ui + Docker

---

## ⚠️ IMPORTANTES (Seguir siempre)

- **🏠 Casa limpia:** Scripts → `/Scripts` | Documentos → `/Documentos MarkDown` (verifica antes de crear)
- **🔍 Revisar antes de crear:** Consulta lo existente, verifica compatibilidad con código actual  
- **🗺️ Planificación obligatoria:** Crea **task list** antes de empezar con objetivos específicos y medibles
- **📝 Documentación sistemática:** Comenta cambios `// 🤖 [IA] - [Razón]` y actualiza .md relevantes
- **🎯 Versionado consistente:** Actualiza versión en Index.tsx, InitialWizardModal.tsx, CashCounter.tsx, etc.

---

## 🔮 FUTURO (En desarrollo)

- **🔧 Worker:** [PENDIENTE] Incluir en versionado y documentación cuando se implemente
- **📊 Rate limits:** [FUTURO] Preparar manejo de límites cuando se agreguen APIs externas
- **🔄 Estado avanzado:** [ROADMAP] Considerar migración a Zustand/Redux cuando el estado crezca

---

## 💡 RECOMENDADAS (Buenas prácticas)

- **⚡ Eficiencia:** Crea solo lo necesario, reutiliza componentes, optimiza recursos
- **🧩 Modularización:** Enfócate en componentes escalables sin saturación en un solo archivo  
- **🛡️ Manejo de errores:** Gestiona errores correctamente, evita crashes silenciosos
- **📱 Límites locales:** Respeta localStorage limits, timeouts de animación, memoria del navegador
- **✅ Build limpio:** Sin errores TypeScript, warnings resueltos, tests pasando

---

## 🧭 Metodología Unificada

**Mantra central:** `Reviso → Planifico → Ejecuto → Documento → Valido`

### 📋 Checklist por sesión:
- [ ] **Task list** creada antes de iniciar
- [ ] **Compatibilidad** verificada con stack actual
- [ ] **Documentación** actualizada (comentarios + .md)
- [ ] **Versionado** aplicado consistentemente  
- [ ] **Build** exitoso sin errores ni warnings
- [ ] **Funcionalidad** preservada al 100%

### 🆘 En caso de duda:
**PARA · PREGUNTA · VERIFICA** (mejor preguntar que romper)

---

## 📚 Referencias

- **GitHub:** [Contador de Monedas](https://github.com/SamuelERS/calculadora-corte-caja)
- **Notion:** Documentación extendida del proyecto
- **CLAUDE.md:** Integración específica del proyecto actual

---

## 📋 Historial de Versiones

- **v2.0:** Adaptación completa para stack React + TypeScript + Vite + shadcn/ui + Docker
- **v1.0:** Versión original con stack WppConnect + OpenAI + Redis

---

*Última actualización: Diciembre 2024 - CashGuard Paradise v1.0.80*