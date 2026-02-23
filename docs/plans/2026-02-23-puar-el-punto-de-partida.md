# PUAR: Formalización de EL_PUNTO_DE_PARTIDA en Raíz

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corregir la desincronización entre REGLAS_DOCUMENTACION.md (que lista solo 4 excepciones) y la realidad (que tiene 8+ archivos oficiales en la raíz de docs/).

**Architecture:** Ningún archivo se mueve. EL_PUNTO_DE_PARTIDA_by_SamuelERS.md ya vive en el lugar correcto. La corrección es quirúrgica: actualizar la Regla #2 de REGLAS_DOCUMENTACION.md para que su lista de excepciones refleje todos los archivos oficiales de la raíz.

**Tech Stack:** Solo edición de Markdown.

---

## Contexto del PUAR

### Situación actual

`EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` vive en `docs/` raíz.
`README.md` lo lista explícitamente como archivo oficial bajo "Reglas del Juego".
Sus links internos usan rutas relativas desde la raíz (`./REGLAS_DE_LA_CASA.md`).

**Problema:** `REGLAS_DOCUMENTACION.md` Regla #2 solo nombra 4 excepciones:
- `README.md` ✅
- `REGLAS_DOCUMENTACION.md` ✅
- `REGLAS_MOLDE_ORDENES_DE_TRABAJO.md` ✅
- `La_Receta_Maestra_by_SamuelERS/` ✅

**Archivos raíz legítimos NO listados como excepción:**
- `REGLAS_DE_LA_CASA.md` ❌
- `REGLAS_DESARROLLO.md` ❌
- `REGLAS_DESARROLLO.template.md` ❌
- `REGLAS_PROGRAMADOR.md` ❌
- `REGLAS_PROGRAMADOR.template.md` ❌
- `REGLAS_INSPECCION.md` ❌
- `REGLAS_INSPECCION.template.md` ❌
- `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` ❌

### Veredicto de triaje
- **¿Obsoleto?** No. Es el onboarding maestro activo.
- **¿Duplicado?** No. Nada más cumple su rol.
- **¿Vital?** Sí. Es el "mapa de todos los mapas".
- **¿Mover?** No. Sus links funcionan desde raíz. Moverlo los rompería.
- **¿Acción correcta?** Actualizar REGLAS_DOCUMENTACION.md.

---

## Task 1: Actualizar REGLAS_DOCUMENTACION.md

**Archivo:** `docs/REGLAS_DOCUMENTACION.md`

**Step 1: Localizar la sección a modificar**

Buscar la Regla #2, sección "NO CREAR DOCUMENTOS SUELTOS EN RAÍZ".
Texto actual de las excepciones:
```
- Excepciones: `README.md`, `REGLAS_DOCUMENTACION.md`, `REGLAS_MOLDE_ORDENES_DE_TRABAJO.md`, `La_Receta_Maestra_by_SamuelERS/`
```

**Step 2: Reemplazar con lista completa**

Reemplazar la línea de excepciones por la lista real, agrupada por tipo:
```markdown
- Excepciones permitidas en raíz de `docs/`:
  - **Índices y navegación:** `README.md`, `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`
  - **Reglas normativas:** `REGLAS_DOCUMENTACION.md`, `REGLAS_DE_LA_CASA.md`, `REGLAS_DESARROLLO.md`, `REGLAS_PROGRAMADOR.md`, `REGLAS_INSPECCION.md`, `REGLAS_MOLDE_ORDENES_DE_TRABAJO.md`
  - **Templates de reglas:** `REGLAS_DESARROLLO.template.md`, `REGLAS_PROGRAMADOR.template.md`, `REGLAS_INSPECCION.template.md`
  - **Carpetas especiales:** `La_Receta_Maestra_by_SamuelERS/`
```

**Step 3: Añadir entrada al historial de cambios**

Al final del archivo en la sección `## 📝 HISTORIAL DE CAMBIOS`, añadir:
```markdown
### v1.3 (2026-02-23)
- ✅ Regla #2 actualizada: lista de excepciones sincronizada con la realidad del proyecto
- ✅ `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` formalizado como archivo oficial de raíz
- ✅ Todas las REGLAS_*.md y sus .template.md incluidos en excepciones
```

**Step 4: Verificar**

```bash
# Contar archivos .md en la raíz de docs/
ls "/Users/samuelers/Paradise System Labs/cashguard-paradise/docs/"*.md | wc -l
# Todos deben estar cubiertos por las excepciones actualizadas
```

---

## Task 2: (Opcional) Confirmar README.md ya está correcto

**Archivo:** `docs/README.md`

Verificar que la sección "📜 Reglas del Juego (En Raíz)" ya lista `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`.
Si ya está → no tocar.
Si no está → añadirlo.

**Estado confirmado:** Ya aparece en línea 79. No requiere cambio.

---

---

## Task 3: Corregir links rotos en EL_PUNTO_DE_PARTIDA (hallazgo 2026-02-23)

**Hallazgo nuevo (auditoría independiente):**
El archivo contiene 2 ocurrencias de `[CLAUDE.md](./CLAUDE.md)` que apuntan a
`docs/CLAUDE.md` — archivo que **no existe**. El `CLAUDE.md` real está en la
raíz del proyecto y la ruta correcta desde `docs/` es `../CLAUDE.md`.

| Misión | Link roto | Link correcto |
|---|---|---|
| 🕵️ Investigador de Elite (~línea 44) | `./CLAUDE.md` | `../CLAUDE.md` |
| ⚙️ Ingeniero de Operaciones (~línea 64) | `./CLAUDE.md` | `../CLAUDE.md` |

**Step 1: Verificar las 2 ocurrencias**

```bash
grep -n "CLAUDE.md" "docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md"
```

**Step 2: Aplicar reemplazo (ambas)**

```
[CLAUDE.md](./CLAUDE.md)  →  [CLAUDE.md](../CLAUDE.md)
```

**Step 3: Commit conjunto con Task 1**

```bash
git add docs/REGLAS_DOCUMENTACION.md docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md
git commit -m "fix(docs): PUAR EL_PUNTO_DE_PARTIDA — excepciones completas + links CLAUDE.md"
```

---

## Resultado esperado

- `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` permanece en `docs/` raíz ✅
- `REGLAS_DOCUMENTACION.md` v1.3 lista todas las excepciones reales (incluyendo .template.md) ✅
- Ningún otro archivo se mueve ✅
- Cero links rotos (`../CLAUDE.md` correcto) ✅
