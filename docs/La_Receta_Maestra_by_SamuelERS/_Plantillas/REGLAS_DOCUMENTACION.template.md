# 📋 Plantilla: Reglas de Documentación v1.0

> **⚠️ ESTE ARCHIVO ES DE LECTURA OBLIGATORIA ANTES DE CREAR O MODIFICAR DOCUMENTACIÓN**
> **Propósito:** Este documento define el sistema de documentación del proyecto. Es una plantilla que debe ser copiada a la carpeta `/docs` de un nuevo proyecto.

---

## 🚨 REGLAS FUNDAMENTALES

### 1. NO CREAR MONOLITOS
- **Máximo 500 líneas por documento.**
- Si un documento crece más, debe dividirse en módulos más pequeños.
- Cada documento debe tener UN propósito claro y único.

### 2. ESTRUCTURA MODULAR OBLIGATORIA ("Casos")
- Un problema, una guía o una arquitectura se documenta dentro de una carpeta `Caso_*`.
- **PROHIBIDO** crear archivos `.md` sueltos fuera de una estructura de `Caso_*`.
- Dentro de cada caso, los documentos deben ser pequeños y específicos.
- Usar prefijos numéricos para ordenar los documentos (`01_`, `02_`, etc.).

---

## 📁 ESTRUCTURA DE CARPETAS SUGERIDA

```
docs/
├── 📋 REGLAS_DOCUMENTACION.md    ← ESTE ARCHIVO
│
├── 01_guias/
│   └── Caso_[Nombre]_[YYYYMMDD]/
│
├── 02_arquitectura/
│   └── Caso_[Nombre]_[YYYYMMDD]/
│
└── _archivo/
    └── YYYY/
        └── Caso_[Nombre]_[YYYYMMDD]/
```

---

## 📝 CONVENCIÓN DE NOMBRES

### Carpetas de Caso
`Caso_[NombreDescriptivo]_[YYYYMMDD]/`
- **Ejemplos:** `Caso_Error_Login_20260111/`, `Caso_Guia_Docker_20260110/`

### Archivos dentro de Caso
`[NN]_[NombreDescriptivo].md`
- **Ejemplos:** `00_README.md`, `01_Diagnostico.md`, `02_Solucion.md`

---

## 🗣️ COMUNICACIÓN VISUAL: USO DE EMOJIS

Se recomienda usar emojis para transmitir estados rápidamente.

| Emoji | Significado |
|---|---|
| ⚠️ | **Advertencia** |
| 🚧 | **En Construcción** |
| 🔍 | **En Investigación** |
| 📝 | **Redacción / En Progreso** |
| ✅ | **Tarea Completada** |
| ❌ | **Rechazado / Error** |
| 🏁 | **Caso Finalizado** |
| 🔴 | **Pendiente / Bloqueado** |
| 🟡 | **En Progreso** |
| 🟢 | **Completado y Verificado** |

---

## 📊 EL `00_README.md` (El Corazón de un Caso)

Toda carpeta `Caso_*` DEBE tener un archivo `00_README.md` con este formato mínimo:

```markdown
# Caso: [Título Descriptivo]

| Campo | Valor |
|---|---|
| **Fecha inicio** | YYYY-MM-DD |
| **Fecha actualización** | YYYY-MM-DD |
| **Estado** | 🔴 Pendiente / 🟡 En Progreso / 🟢 Completado |
| **Responsable** | [Nombre o IA] |

## Resumen
[Descripción breve del problema/caso en 2-3 líneas]

## Documentos en este caso
| Archivo | Descripción | Estado |
|---|---|---|
| `01_*.md` | [Desc] | ✅/📝/❌ |
```

---

## 📄 PLANTILLAS DE DOCUMENTOS

### Diagnóstico de un Problema
```markdown
# Diagnóstico: [Problema]

## Síntomas
- [Qué se observa]

## Análisis
[Investigación realizada y datos]

## Causa Raíz
[Causa raíz identificada]

## Siguiente Paso
→ Ver `02_Solucion.md`
```

### Solución a un Problema
```markdown
# Solución: [Problema]

## Cambios Realizados
[Descripción de alto nivel de los cambios]

### Archivo: `path/to/file.ts`
`// Ejemplo de código modificado`

## Verificación
[Cómo verificar que la solución funciona]
```
