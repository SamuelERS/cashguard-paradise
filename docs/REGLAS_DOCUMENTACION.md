# 📋 REGLAS DE DOCUMENTACIÓN - OBLIGATORIO PARA TODAS LAS IAs

> **⚠️ ESTE ARCHIVO ES DE LECTURA OBLIGATORIA ANTES DE CREAR O MODIFICAR DOCUMENTACIÓN**
>
> Última actualización: 2026-01-23

---

## 🧠 Nuestra Filosofía: Anti-Bobos by SamuelERS

> **"Aquí somos bobos haciendo cosas geniales con tecnologías geniales como tú y nuestros agentes similares."**

Nuestro enfoque es simple: crear sistemas robustos y profesionales sin la complejidad innecesaria. Usamos metáforas como la "cocina del desarrollador" y la "receta maestra" no como un chiste, sino como una herramienta para pensar con claridad. La simplicidad y la comunicación directa son la base de la excelencia.

---

## 🚨 REGLAS FUNDAMENTALES

### 1. NO CREAR MONOLITOS
- **Máximo 500 líneas por documento**
- Si un documento crece más, dividirlo en módulos
- Cada documento debe tener UN propósito claro

### 2. NO CREAR DOCUMENTOS SUELTOS EN RAÍZ
- **PROHIBIDO** crear archivos `.md` directamente en `docs/`
- Todo documento nuevo va dentro de una carpeta `Caso_*`
- Excepciones: `README.md`, `REGLAS_DOCUMENTACION.md`, `REGLAS_MOLDE_ORDENES_DE_TRABAJO.md`, `La_Receta_Maestra_by_SamuelERS/`

### 3. ESTRUCTURA MODULAR OBLIGATORIA
- Un problema = Una carpeta `Caso_*`
- Dentro de cada caso: documentos pequeños y específicos
- Usar prefijos numéricos: `01_`, `02_`, etc.

### 4. ROL DEL DOCUMENTADOR (IA O HUMANO)
El documentador es responsable de:
- ✅ **Mantener orden:** Verificar estructura de carpetas y convenciones
- ✅ **Actualizar estados:** Mantener `00_README.md` de cada caso actualizado
- ✅ **Prevenir duplicación:** Auditar y consolidar información repetida
- ✅ **Eliminar irrelevancia:** Remover información obsoleta o innecesaria
- ✅ **Mejorar existente:** Actualizar documentos, no crear duplicados
- ✅ **Auditoría periódica:** Revisar y limpiar documentación obsoleta

---

## 📁 ESTRUCTURA DE CARPETAS

```
docs/
├── 📋 REGLAS_DOCUMENTACION.md    ← ESTE ARCHIVO (leer primero)
├── 📖 README.md                   ← Índice general
│
├── 01_guias/                      ← Guías de uso
│   └── Caso_[Nombre]_[YYYYMMDD]/
│
├── 02_arquitectura/               ← Documentación técnica
│   └── Caso_[Nombre]_[YYYYMMDD]/
│
├── 03_api/                        ← Documentación de APIs
│   └── Caso_[Nombre]_[YYYYMMDD]/
│
├── 04_desarrollo/                 ← Para desarrolladores
│   └── Caso_[Nombre]_[YYYYMMDD]/
│
├── 05_operaciones/                ← Operaciones y mantenimiento
│   └── Caso_[Nombre]_[YYYYMMDD]/
│
├── _plantillas/                   ← Plantillas para nuevos documentos
│
└── _archivo/                      ← Casos antiguos archivados
    └── YYYY/                      ← Por año
        └── Caso_[Nombre]_[YYYYMMDD]/
```

---

## 📝 CONVENCIÓN DE NOMBRES

### Carpetas de Caso
```
Caso_[NombreDescriptivo]_[YYYYMMDD]/
```

**Ejemplos:**
- `Caso_Pantalla_iPhone_Congelada_20251009/`
- `Caso_Sistema_Gastos_Caja_20251013/`
- `Caso_Phase2_Verification_100_Coverage_20251010/`

### Archivos dentro de Caso
```
[NN]_[NombreDescriptivo].md
```

**Ejemplos:**
- `00_README.md` ← Obligatorio, resumen del caso
- `01_Diagnostico.md`
- `02_Solucion.md`
- `03_Verificacion.md`

---

## 🗣️ COMUNICACIÓN VISUAL: USO DE EMOJIS

Los emojis se usan con propósito para transmitir estados e ideas rápidamente. La paleta oficial es:

| Emoji | Significado | Uso Común |
|---|---|---|
| ⚠️ | **Advertencia** | Llama la atención sobre un riesgo, un cambio importante o algo que requiere cuidado. |
| 🚧 | **En Construcción** | Para casos o documentos en refactorización profunda o trabajo pesado a largo plazo. |
| 🗣️ | **Necesita Discusión** | Tema que requiere una reunión o un debate antes de continuar. |
| 🔍 | **En Investigación** | El trabajo actual es analizar un problema, no solucionarlo aún. Diagnóstico. |
| 📝 | **Redacción** | El trabajo principal es escribir documentación o texto. |
| ✅ | **Tarea Completada** | Para un ítem de checklist, una subtarea o un documento modular finalizado. |
| ❌ | **Rechazado / Error** | Una idea se descarta, una prueba falla, o una acción está prohibida. |
| 🏁 | **Caso Finalizado** | Un caso se ha completado y, preferiblemente, verificado o desplegado. |
| 🔴 | **Pendiente / Bloqueado** | Tarea o caso que no ha iniciado o que no puede continuar. |
| 🟠 | **En Progreso (con riesgo)** | En progreso, pero ha surgido un problema o una advertencia. |
| 🟡 | **En Progreso** | Trabajo activo en curso. Estado normal de una tarea iniciada. |
| 🟢 | **Completado y Verificado** | El caso en su totalidad está resuelto, probado y verificado. |

---

## 📊 ESTADO DE CASOS

Cada carpeta `Caso_*` DEBE tener un archivo `00_README.md` con este formato:

```markdown
# Caso: [Nombre del Problema]

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | YYYY-MM-DD |
| **Fecha actualización** | YYYY-MM-DD |
| **Estado** | 🔴 Pendiente / 🟡 En progreso / 🟢 Completado |
| **Prioridad** | Alta / Media / Baja |
| **Responsable** | [Nombre o IA] |

## Resumen
[Descripción breve del problema/caso en 2-3 líneas]

## Documentos en este caso
- `01_*.md` - [Descripción]
- `02_*.md` - [Descripción]

## Resultado
[Solo si está completado: qué se logró]
```

---

## 🤖 INSTRUCCIONES PARA IAs

### Al INICIAR una sesión de trabajo:
1. Leer `docs/REGLAS_DOCUMENTACION.md` (este archivo)
2. Verificar si existe un `Caso_*` relacionado con la tarea
3. Si existe → Actualizar documentos existentes
4. Si no existe → Crear nuevo `Caso_*` con estructura correcta

### Al CREAR documentación nueva:
1. **NUNCA** crear archivos sueltos en `docs/`
2. Crear carpeta `Caso_[Nombre]_[YYYYMMDD]/`
3. Crear `00_README.md` con estado del caso
4. Crear documentos modulares con prefijos numéricos
5. Máximo 500 líneas por documento

### Al FINALIZAR una sesión:
1. Actualizar `00_README.md` del caso con:
   - Nueva fecha de actualización
   - Nuevo estado (si cambió)
   - Lista actualizada de documentos
2. Si el caso está COMPLETADO:
   - Cambiar estado a 🟢 Completado
   - Mantener en su carpeta original (no mover)

### Al MODIFICAR documentación existente:
1. NO borrar información histórica
2. Agregar sección "## Actualización YYYY-MM-DD" al final
3. Actualizar `00_README.md` del caso

---

## 📄 PLANTILLAS

### Plantilla: 00_README.md (Obligatorio en cada Caso)

```markdown
# Caso: [Título Descriptivo]

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | YYYY-MM-DD |
| **Fecha actualización** | YYYY-MM-DD |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | Media |
| **Responsable** | [IA/Usuario] |

## Resumen
[2-3 líneas describiendo el problema o tema]

## Contexto
[Por qué se creó este caso]

## Documentos
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_*.md` | [Desc] | ✅/🔄/❌ |

## Resultado
[Completar cuando el caso esté resuelto]

## Referencias
- [Links a otros casos relacionados]
- [Links a código relevante]
```

### Plantilla: Documento de Diagnóstico

```markdown
# Diagnóstico: [Problema]

**Fecha:** YYYY-MM-DD
**Caso:** Caso_[Nombre]_[Fecha]/

## Síntomas
- [Qué se observa]

## Análisis
[Investigación realizada]

## Causa Raíz
[Causa identificada]

## Siguiente Paso
→ Ver `02_Solucion.md`
```

### Plantilla: Documento de Solución

```markdown
# Solución: [Problema]

**Fecha:** YYYY-MM-DD
**Caso:** Caso_[Nombre]_[Fecha]/

## Cambios Realizados

### Archivo: `path/to/file.ts`
```typescript
// Código modificado
```

## Verificación
[Cómo verificar que funciona]

## Notas
[Consideraciones adicionales]
```

---

## ❌ ERRORES COMUNES A EVITAR

### NO hacer:
- ❌ Crear `docs/NUEVO_DOCUMENTO.md` (archivo suelto)
- ❌ Crear documentos de +500 líneas
- ❌ Crear carpetas sin `00_README.md`
- ❌ Duplicar información en múltiples documentos
- ❌ Usar nombres sin fecha: `Caso_Bug_Login/`
- ❌ Mezclar temas diferentes en un solo documento

### SÍ hacer:
- ✅ Crear `docs/01_guias/Caso_Bug_Login_20251208/`
- ✅ Dividir documentos largos en módulos
- ✅ Siempre incluir `00_README.md` con estado
- ✅ Referenciar otros documentos en vez de duplicar
- ✅ Usar fechas en formato YYYYMMDD
- ✅ Un tema = Un documento

---

## 🧹 CRITERIOS DE INFORMACIÓN IRRELEVANTE

### ❌ Información que debe eliminarse:

1. **Código obsoleto comentado sin contexto**
   - Si el código está comentado, debe tener explicación de POR QUÉ
   - Sin contexto → eliminar

2. **Logs de debug extensos**
   - Solo incluir logs relevantes que ilustren el problema
   - Máximo 20 líneas de log, lo demás → referencia al archivo

3. **Soluciones intentadas pero descartadas**
   - Si no funcionó y no aporta aprendizaje → eliminar
   - Si aporta contexto → mover a sección "Intentos previos"

4. **Comandos de prueba sin resultado**
   - Solo documentar comandos que funcionaron o enseñan algo
   - Pruebas fallidas sin valor educativo → eliminar

5. **Información duplicada**
   - Si está en otro documento → referenciar con link
   - NO copiar-pegar, usar: `→ Ver [documento](path)`

6. **Notas personales sin contexto**
   - "TODO: revisar después" sin fecha → eliminar
   - "Esto está raro" sin explicación → eliminar o expandir

### ✅ Información que SÍ debe mantenerse:

- Causa raíz de problemas
- Soluciones que funcionaron
- Código de ejemplo funcional
- Referencias a archivos específicos con líneas
- Lecciones aprendidas
- Comandos de verificación

---

## 🔄 FLUJO DE TRABAJO

```
1. Usuario reporta problema
         ↓
2. IA lee REGLAS_DOCUMENTACION.md
         ↓
3. IA busca Caso_* existente relacionado
         ↓
   ┌─────┴─────┐
   ↓           ↓
Existe      No existe
   ↓           ↓
Actualizar  Crear nuevo Caso_*
documentos  con 00_README.md
   ↓           ↓
   └─────┬─────┘
         ↓
4. Trabajar en el problema
         ↓
5. Actualizar 00_README.md con estado
         ↓
6. Si completado → Marcar 🟢 en 00_README.md
```

---

## 📚 CATEGORÍAS DE DOCUMENTACIÓN

| Carpeta | Qué va aquí | Ejemplo |
|---------|-------------|---------|
| `01_guias/` | Guías de uso, tutoriales, troubleshooting | Cómo arrancar el sistema |
| `02_arquitectura/` | Diseño técnico, diagramas, decisiones | Arquitectura de servicios |
| `03_api/` | Documentación de endpoints, schemas | Tipos CashCount, VerificationBehavior |
| `04_desarrollo/` | Para devs: testing, pendientes, templates | Tests E2E |
| `05_operaciones/` | Ops: seguridad, performance, monitoreo | Auditoría de seguridad |
| `_plantillas/` | Plantillas para nuevos documentos | README de caso |

---

## 🔍 AUDITORÍA Y MANTENIMIENTO DE DOCUMENTACIÓN

### Auditoría Periódica (Mensual o por Sesión)

El documentador debe realizar estas tareas regularmente:

#### 1. Identificar casos obsoletos
```bash
# Buscar casos completados hace más de 3 meses
# Revisar si su información sigue siendo relevante
```

**Criterios:**
- Casos 🟢 Completados con fecha > 90 días
- Casos con tecnología/código ya eliminado del proyecto
- Casos con soluciones superadas por nuevas implementaciones

#### 2. Consolidar información duplicada
- Buscar temas repetidos en múltiples casos
- Crear un caso "canónico" si es necesario
- Referenciar desde casos antiguos al nuevo

#### 3. Archivar casos antiguos
**IMPORTANTE:** NO eliminar, sino mover a archivo

```
docs/
└── _archivo/                    ← Casos completados antiguos
    └── YYYY/                    ← Organizar por año
        └── Caso_[Nombre]_[Fecha]/
```

**Criterios para archivar:**
- Completado hace más de 6 meses
- Información ya no es relevante para operación actual
- Mantener por si se necesita referencia histórica

#### 4. Limpiar documentos extensos
- Revisar documentos cercanos a 500 líneas
- Dividir en módulos si es necesario
- Eliminar secciones irrelevantes

#### 5. Actualizar índices
- Mantener `docs/README.md` actualizado
- Listar solo casos activos o recientes
- Referenciar archivo para casos antiguos

### Checklist de Auditoría

- [ ] ¿Hay casos sin actualizar en +30 días?
- [ ] ¿Hay documentos >500 líneas?
- [ ] ¿Hay información duplicada en múltiples casos?
- [ ] ¿Hay archivos `.md` sueltos en `docs/`?
- [ ] ¿Todos los casos tienen `00_README.md` con estado?
- [ ] ¿Hay casos completados >6 meses que deberían archivarse?

---

## ✅ CHECKLIST ANTES DE CREAR DOCUMENTACIÓN

- [ ] ¿Leí `REGLAS_DOCUMENTACION.md`?
- [ ] ¿Busqué si existe un `Caso_*` relacionado?
- [ ] ¿El documento va en una carpeta `Caso_*`, no suelto?
- [ ] ¿Tiene menos de 500 líneas?
- [ ] ¿Creé/actualicé el `00_README.md` del caso?
- [ ] ¿Usé la convención de nombres correcta?
- [ ] ¿Actualicé el estado del caso?
- [ ] ¿Verifiqué que no haya información duplicada?
- [ ] ¿Eliminé información irrelevante?

---

**Versión:** 1.2
**Creado:** 2025-12-08
**Última actualización:** 2026-01-23
**Propósito:** Estandarizar documentación y evitar caos

---

## 📝 HISTORIAL DE CAMBIOS

### v1.2 (2026-01-23)
- ✅ Adaptado para CashGuard Paradise (PWA anti-fraude para retail)
- ✅ Actualizados ejemplos de casos con nombres relevantes al proyecto
- ✅ Actualizada referencia API a tipos TypeScript del proyecto (CashCount, VerificationBehavior)

### v1.1 (2025-12-10)
- ✅ Agregada sección "ROL DEL DOCUMENTADOR" en reglas fundamentales
- ✅ Agregada sección "CRITERIOS DE INFORMACIÓN IRRELEVANTE"
- ✅ Agregada sección "AUDITORÍA Y MANTENIMIENTO DE DOCUMENTACIÓN"
- ✅ Ampliado checklist con verificaciones de duplicación e irrelevancia
- ✅ Definido proceso de archivo de casos antiguos en `docs/_archivo/`

### v1.0 (2025-12-08)
- Versión inicial del documento de reglas
