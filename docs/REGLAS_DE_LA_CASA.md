# Reglas de la Casa v2.1

**Documento de gobernanza para CashGuard Paradise - Paradise System Labs**

> **Audiencia principal:** SamuelERS (propietario), IAs asistentes, nuevos colaboradores
> **Tipo:** Documento constitucional - Define QUÉ se hace y POR QUÉ
> **Última actualización:** 2026-01-23

---

## Qué es este documento

Este es el documento **fundacional** del proyecto. Define las reglas que **NUNCA se rompen**, la filosofía de trabajo y cómo comunicarse con SamuelERS.

**NO es un manual técnico.** Para estándares de código, ver:
- [REGLAS_DESARROLLO.md](./REGLAS_DESARROLLO.md) - Estándares técnicos
- [REGLAS_PROGRAMADOR.md](./REGLAS_PROGRAMADOR.md) - Guía práctica con ejemplos

---

## Leyes Inquebrantables

### 1. Inmutabilidad del Código Base
- **NO** modificar ni eliminar código sin justificación explícita
- **NO** eliminar funcionalidades existentes sin evaluación de impacto
- **SIEMPRE** crear backup en `/Backups-RESPALDOS/` antes de cambios estructurales

### 2. Principio de No Regresión
- Lo que funciona **NO** se toca sin necesidad
- Toda modificación requiere verificar que no rompe funcionalidad existente
- Si algo se rompe, se revierte primero, se investiga después

### 3. TypeScript Estricto
- Todo código nuevo **DEBE** ser TypeScript
- **CERO `any`** en código nuevo (usar tipos del Diccionario Oficial)
- Los 6 módulos principales ya están migrados a TypeScript

### 4. Test Coverage Obligatorio
- Toda función crítica nueva **DEBE** tener tests
- Mínimos de coverage definidos en [REGLAS_DESARROLLO.md](../REGLAS_DESARROLLO.md)
- **NUNCA** entregar código sin verificar que tests pasan

### 5. Versionado Bloqueado
- **NUNCA** ejecutar `npm update`, `npm upgrade`, o `npm audit fix --force`
- Versiones bloqueadas: React 18.x, Vite 5.x, shadcn/ui, VitePWA
- Cualquier actualización requiere autorización explícita de SamuelERS

### 6. Backups Obligatorios
- **SIEMPRE** backup antes de cambios estructurales
- Ubicación: `/Backups-RESPALDOS/[YYYYMMDD]_[descripcion]/`

---

## Metodología de Trabajo

### Mantra Central
```
ANALIZO → PLANIFICO → EJECUTO → DOCUMENTO → VALIDO
```

### Protocolo de Sesión IA

**Al INICIAR cada sesión:**
1. Leer este documento (REGLAS_DE_LA_CASA.md)
2. Leer `/docs/CLAUDE.md` - Estado actual del proyecto
3. Verificar `npm run dev` - PWA debe estar corriendo en :5173
4. Confirmar task list clara antes de ejecutar

**Al FINALIZAR cada sesión:**
1. Ejecutar tests del módulo modificado
2. Verificar build exitoso
3. Actualizar `/docs/CLAUDE.md` con trabajo realizado
4. Entregar limpio: cero deuda técnica nueva sin documentar

### Checklist de Calidad Pre-Entrega

Antes de considerar cualquier trabajo como "completo":

- [ ] Task list creada y aprobada antes de iniciar
- [ ] Tests escritos para funcionalidad nueva
- [ ] Build exitoso (`npm run build`) sin errores
- [ ] TypeScript limpio (`npx tsc --noEmit`) sin errores
- [ ] Documentación actualizada (`/docs/CLAUDE.md`)
- [ ] PWA verificada en :5173 (si aplica)
- [ ] Funcionalidad crítica preservada al 100%

### Regla de Oro ante Dudas
```
PAUSA · PREGUNTA · VALIDA
```
Es preferible una pausa para clarificar que una acción que rompa el sistema.

---

## Comunicación con SamuelERS

**IMPORTANTE:** SamuelERS NO es programador. Toda comunicación debe ser:

- En español claro y simple
- Sin jerga técnica innecesaria
- Enfocada en resultados y beneficios
- Pidiendo confirmación antes de cambios importantes

### Ejemplo de comunicación

**BUENO:**
> "He mejorado el sistema de conteo para que sea más difícil que un empleado se equivoque. Ahora el sistema guía paso a paso y detecta automáticamente si hay diferencias con lo esperado."

**MALO:**
> "Implementé un useReducer pattern en el GuidedCountingFlow con state machine de 3 fases y memoización de cálculos."

---

## Sección: Explicación Anti-Bobos by SamuelERS

**Propósito:** Traducir cambios complejos a lenguaje ultra-simple para el solicitante (SamuelERS), sin bajar el estándar técnico del proyecto.

**Reglas:**
- Máximo 15 líneas por explicación.
- Cero jerga técnica innecesaria.
- Usar analogías simples solo si aportan claridad.

**Estructura Obligatoria:**
1. **Qué es:** [Explicación en 1-2 líneas del concepto general.]
2. **Qué falta:** [El problema o la necesidad en lenguaje simple.]
3. **Qué se va a hacer:** [Los pasos a seguir de forma breve.]
4. **Beneficio:** [Por qué vale la pena hacerlo, el resultado final positivo.]

**Resumen Rápido (Siempre al final):**
- [bullet point 1]
- [bullet point 2]
- [bullet point 3]

---

## Protocolos Estándar

### Estructura de Archivos
- Scripts → `/Scripts/`
- Documentación → `/docs/` y `/Documentos_MarkDown/`
- Backups → `/Backups-RESPALDOS/`
- Componentes → `/src/components/`
- Hooks → `/src/hooks/`
- Utilidades → `/src/utils/`

### Task Lists Obligatorias
**ANTES** de ejecutar cualquier trabajo, crear task list con:
- Objetivos específicos y medibles
- Pasos granulares y secuenciales
- Criterios de aceptación claros
- Dependencias identificadas

**Sin task list aprobada = no hay ejecución permitida.**

### Disciplina de Foco
- Seguir estrictamente la task list sin desviaciones
- Si surge un tema tangencial, anotarlo en "Notas para Después"
- Continuar con el plan actual

### PWA Deployment
- La PWA se despliega en `cashguard.paradisesystemlabs.com` vía GitHub Actions
- **NUNCA** desplegar a producción sin probar localmente con `npm run build && npm run preview`

---

## Glosario del Proyecto

### Términos de Negocio
| Término | Significado |
|---------|-------------|
| **Paradise System Labs** | Empresa de desarrollo de software de SamuelERS |
| **CashGuard Paradise** | PWA anti-fraude para corte de caja en retail |
| **Cajero** | Empleado que realiza el conteo de efectivo |
| **Testigo** | Segunda persona que valida el conteo (≠ cajero) |
| **Corte de Caja** | Proceso de cierre diario con conteo y reporte |
| **Verificación Ciega** | Conteo sin ver valores esperados (anti-fraude) |
| **SICAR** | Sistema de inventario con ventas esperadas |

### Servicios del Sistema
| Servicio | Puerto | Función |
|----------|--------|---------|
| **CashGuard PWA (Dev)** | 5173 | Aplicación React + Vite |
| **CashGuard PWA (Prod)** | 443 | cashguard.paradisesystemlabs.com |
| **E2E Tests** | 5175 | Servidor dedicado Playwright |

### Patrones Arquitectónicos
| Patrón | Descripción |
|--------|-------------|
| **PWA** | Progressive Web App con Service Worker |
| **Client-Side** | Sin backend, localStorage para persistencia |
| **3 Fases** | Conteo → Entrega a Gerencia → Reporte |
| **Hooks Pattern** | Lógica encapsulada en custom hooks |

---

## Visión a Futuro (Roadmap)

| Prioridad | Feature | Estado |
|-----------|---------|--------|
| Alta | PWA Deployment a producción | ✅ COMPLETADO |
| Alta | Sistema de verificación ciega (3 intentos) | ✅ COMPLETADO |
| Media | E2E Testing con Playwright | ✅ 24/24 tests |
| Media | Reportes WhatsApp mejorados | ✅ COMPLETADO |
| Baja | Dashboard de supervisores | FUTURO |
| Baja | Integración SICAR API | ROADMAP |

---

## Protocolo de Debugging

### Ante cualquier error:

1. **NO ASUMIR - VERIFICAR**
   - Reproducir el error con pasos exactos
   - Abrir DevTools: Console (errores) + Network (requests)
   - Verificar localStorage: Application → Local Storage

2. **ANÁLISIS SISTEMÁTICO**
   - ¿Error de tipos? → Revisar interfaces TypeScript
   - ¿Error de runtime? → Revisar console con contexto
   - ¿Error de build? → Revisar `npm run build` output
   - ¿Error de state? → Verificar React DevTools

3. **SOLUCIÓN DOCUMENTADA**
   - Aplicar fix quirúrgico (mínimamente invasivo)
   - Documentar root cause en `/docs/CLAUDE.md`
   - Agregar test que previene regresión

### Formato de Reporte de Bugs
```
NUNCA: "No funciona" o "Da error"
SIEMPRE: "Error [tipo] en [archivo:línea] cuando [condición]. Console: [paste]"
```

---

## Referencias

| Documento | Propósito |
|-----------|-----------|
| [REGLAS_DESARROLLO.md](./REGLAS_DESARROLLO.md) | Estándares técnicos de código |
| [REGLAS_PROGRAMADOR.md](./REGLAS_PROGRAMADOR.md) | Guía práctica con ejemplos |
| [CLAUDE.md](./CLAUDE.md) | Estado actual del proyecto |
| [README.md](../README.md) | Documentación general |

---

## Docker (Testing)

### Filosofía
> Desarrolla localmente con Vite. Usa Docker exclusivamente para ejecutar tests de manera consistente.

### Modos de Ejecución
| Ambiente | Modo | Puerto |
|----------|------|--------|
| Desarrollo | `npm run dev` (Vite local) | 5173 |
| Tests | Docker container | 5175 |
| Producción | SiteGround vía GitHub Actions | 443 |

### Comandos Esenciales
```bash
# Desarrollo local
npm run dev

# Build producción
npm run build

# Preview build local
npm run preview

# Tests en Docker
./Scripts/docker-test-commands.sh test
./Scripts/docker-test-commands.sh test:coverage
```

---

## Historial de Versiones

### v2.1 (2026-01-23)
- Adaptado para CashGuard Paradise (PWA anti-fraude para retail)
- Actualizado glosario con términos de conteo de caja
- Simplificado para arquitectura PWA sin backend
- Actualizado roadmap con features completados

### v2.0 (2025-12-26)
- Clarificado propósito como documento constitucional
- Eliminada duplicación de estándares técnicos (movidos a REGLAS_DESARROLLO)
- Añadidas referencias cruzadas a otros documentos
- Simplificado glosario
- Unificada sección de Docker

### v1.0 (Octubre 2025)
- Creación inicial para WhatsApp Enterprise Integration

---

*"Sistema anti-fraude con valores cristianos para el éxito de Paradise System Labs"*

**Gloria a Dios por la excelencia en el desarrollo.**
