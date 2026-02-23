# Plan de Implementación — DIRM Doble Fuente Catálogos (Módulos C y D)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Completar los Módulos C y D del caso `Caso_Investigacion_Doble_Fuente_Catalogos_20260217`: crear `CorteInicio.tsx` con los tests que faltan (Módulo C) y ejecutar el release verification (Módulo D).

**Architecture:** `CorteInicio.tsx` es un "dumb component" que recibe sucursales, empleados e initialValues como props y llama `onSubmit(IniciarCorteParams)`. El padre orquestador conecta con `useCorteSesion`. Los tests de Módulo C cubren prefill + datalist completo + "Mostrar todos". Ver spec en `03_Modulo_C_ArquitecturaSpec.md`.

**Tech Stack:** React 18, TypeScript (zero `any`), Vitest, Testing Library. Sin librerías nuevas.

---

## Lectura previa obligatoria

Antes de escribir cualquier código, leer en este orden:
1. `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/03_Modulo_C_ArquitecturaSpec.md`
2. `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/04_Modulo_D_ReleaseChecklist.md`
3. `src/hooks/useCorteSesion.ts` (firma de `IniciarCorteParams` y `UseCorteSesionReturn`)

---

## Task 1: Verificar estado actual de los tests

**Files:**
- Read: `src/components/corte/__tests__/CorteInicio.test.tsx` (puede no existir)
- Read: `src/components/corte/__tests__/CorteOrquestador.test.tsx` (puede no existir)
- Read: `src/components/corte/CorteInicio.tsx` (puede no existir)

**Step 1: Verificar qué archivos existen**

```bash
ls src/components/corte/__tests__/ 2>/dev/null || echo "Directorio no existe"
ls src/components/corte/ 2>/dev/null || echo "Directorio no existe"
```

Esperado: Directorio `corte/` existe con archivos. Si no existe, crearlo en Task 2.

**Step 2: Ejecutar los tests existentes para ver estado de partida**

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx 2>&1 | tail -20
```

Esperado: Si el archivo no existe → error esperado. Si existe → ver cuántos fallan.

---

## Task 2: Crear estructura de directorios si no existe

**Files:**
- Create directory: `src/components/corte/__tests__/`

**Step 1: Crear directorios necesarios**

```bash
mkdir -p src/components/corte/__tests__
```

Esperado: Sin errores.

---

## Task 3: Escribir los tests RED para Módulo C (los que faltan)

**Files:**
- Edit/Create: `src/components/corte/__tests__/CorteInicio.test.tsx`

**Step 1: Añadir o crear los 2 tests de casos nuevos**

Los tests que DEBEN existir al final (algunos pueden ya estar, NO borrar los existentes):

**Test A — Empleado precargado + datalist completo:**

```typescript
it('muestra todos los empleados en el datalist cuando cajero está precargado', () => {
  const empleados = ['Ana López', 'Juan Pérez', 'Sofía Ramos'];
  render(
    <CorteInicio
      sucursales={[{ id: '1', nombre: 'Los Héroes' }]}
      empleados={empleados}
      initialValues={{ sucursal_id: '1', cajero: 'Juan Pérez' }}
      onSubmit={jest.fn()}
      onSucursalChange={jest.fn()}
    />
  );

  // Input muestra el valor precargado
  const cajeroInput = screen.getByLabelText(/cajero/i);
  expect(cajeroInput).toHaveValue('Juan Pérez');

  // Datalist contiene los 3 empleados (no solo el precargado)
  const options = document.querySelectorAll('#empleados-cajero option');
  expect(options).toHaveLength(3);
});
```

**Test B — Acción "Mostrar todos" limpia input y lo enfoca:**

```typescript
it('"Mostrar todos" limpia el campo cajero y lo enfoca para mostrar el catálogo completo', async () => {
  const user = userEvent.setup();
  const empleados = ['Ana López', 'Juan Pérez', 'Sofía Ramos'];
  render(
    <CorteInicio
      sucursales={[{ id: '1', nombre: 'Los Héroes' }]}
      empleados={empleados}
      initialValues={{ sucursal_id: '1', cajero: 'Juan Pérez' }}
      onSubmit={jest.fn()}
      onSucursalChange={jest.fn()}
    />
  );

  const mostrarTodosBtn = screen.getByRole('button', { name: /mostrar todos/i });
  await user.click(mostrarTodosBtn);

  const cajeroInput = screen.getByLabelText(/cajero/i);
  expect(cajeroInput).toHaveValue('');
  expect(cajeroInput).toHaveFocus();
});
```

**Step 2: Ejecutar tests para confirmar RED**

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx 2>&1 | tail -30
```

Esperado: Los 2 tests nuevos deben FALLAR (no encuentra el componente o no encuentra el botón).
Los tests existentes deben seguir igual (no romper).

---

## Task 4: Implementar CorteInicio.tsx (GREEN)

**Files:**
- Edit/Create: `src/components/corte/CorteInicio.tsx`

**Step 1: Implementar el componente según la spec de `03_Modulo_C_ArquitecturaSpec.md`**

El componente debe:
- Props: `sucursales`, `empleados`, `initialValues?`, `onSubmit`, `onSucursalChange`, `isLoading?`, `error?`
- Estado interno: `sucursalId`, `cajero`, `testigo`, `showAllCajero`, `showAllTestigo`
- Handler `handleMostrarTodosCajero`: pone `cajero = ""` + enfoca el input.
- Validación: `cajero !== testigo` antes de llamar `props.onSubmit`.
- `<datalist id="empleados-cajero">` renderiza todos los `props.empleados` siempre.
- Botón `aria-label="Mostrar todos los empleados"` (o `name="Mostrar todos"`) visible cuando `cajero !== ""`.

**Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -E "error|warning" | head -20
```

Esperado: 0 errores. Si hay errores, corregirlos antes de continuar.

**Step 3: Ejecutar tests para confirmar GREEN**

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx 2>&1 | tail -20
```

Esperado: Todos los tests passing, 0 failures.

**Step 4: Commit**

```bash
git add src/components/corte/CorteInicio.tsx src/components/corte/__tests__/CorteInicio.test.tsx
git commit -m "feat(corte): Módulo C — CorteInicio datalist normalizado + tests empleado precargado"
```

---

## Task 5: Ejecutar suite completa de corte (validación Módulo C)

**Files:**
- Run: `src/components/corte/__tests__/CorteInicio.test.tsx`
- Run: `src/components/corte/__tests__/CorteOrquestador.test.tsx`

**Step 1: Ejecutar suite completa**

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx 2>&1 | tail -30
```

Esperado: Todos los tests passing en ambos archivos.

**Si CorteOrquestador.test.tsx falla:** Verificar que `onSubmit` de `CorteInicio` sigue el contrato `IniciarCorteParams`. El test de integración no debe requerir cambios si la firma es correcta.

---

## Task 6: Módulo D — Build limpio

**Step 1: Build de producción**

```bash
npm run build 2>&1 | tail -20
```

Esperado: `✓ built in X.XXs` sin errores de TypeScript ni de Vite.

**Si falla:** Ver error específico. Los errores de tipos en `CorteInicio.tsx` son los más probables.

---

## Task 7: Módulo D — Verificar ausencia de catálogos estáticos en código productivo

**Step 1: Buscar consumo remanente de paradise.ts**

```bash
grep -r "paradise" src/ --include="*.tsx" --include="*.ts" | grep -v "test" | grep -v "\.spec\." | grep -v "__tests__"
```

Esperado: Ninguna línea importando `paradise.ts` para obtener empleados o sucursales
en flujos productivos. Si aparece alguna → documentarla como deuda técnica o resolverla.

**Step 2: Commit final si hubo correcciones**

```bash
git add -A
git commit -m "feat(corte): Módulo D — build verificado, sin catálogos estáticos en producción"
```

---

## Task 8: Cierre documental del caso

**Files:**
- Edit: `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/00_README.md`

**Step 1: Actualizar 00_README.md**

- Cambiar estado `EN_PROGRESO` → `COMPLETADO`.
- Actualizar `Fecha de actualización`.
- Marcar módulos C y D como completados en la sección de progreso.

**Step 2: Verificar y hacer commit**

```bash
git add docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/00_README.md
git commit -m "docs(caso): Módulo C y D completados — actualizar README estado COMPLETADO"
```

**Step 3: Mover caso a CASOS-COMPLETOS**

```bash
mv "docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Doble_Fuente_Catalogos_20260217_COMPLETADO"
```

**Step 4: Verificar**

```bash
ls "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Doble_Fuente_Catalogos_20260217_COMPLETADO/"
```

Esperado: `00_README.md`, `01_Diagnostico_Tecnico.md`, `02_Plan_Modular_TDD.md`,
`03_Modulo_C_ArquitecturaSpec.md`, `04_Modulo_D_ReleaseChecklist.md`, `99_PENDIENTES_POR_REALIZAR.md`

**Step 5: Commit final**

```bash
git add docs/04_desarrollo/CASOS-COMPLETOS/
git commit -m "docs(caso): archivar Caso_Doble_Fuente_Catalogos como COMPLETADO"
```

---

## Resultado esperado al completar el plan

- `CorteInicio.tsx` existe con datalist normalizado y botón "Mostrar todos".
- Tests Módulo C: todos verdes (prefill + catálogo completo + mostrar todos).
- Build: sin errores TypeScript ni Vite.
- Sin consumo productivo de `paradise.ts` para empleados/sucursales.
- Caso archivado en `CASOS-COMPLETOS` con nombre canónico `_COMPLETADO`.
