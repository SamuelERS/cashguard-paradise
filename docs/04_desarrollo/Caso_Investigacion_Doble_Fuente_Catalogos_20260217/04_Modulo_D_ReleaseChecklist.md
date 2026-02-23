# 04 Módulo D — Checklist de Verificación de Release

> **Documento DIRM — Criterios de cierre medibles para el caso.**
> Se ejecuta después de que el Módulo C esté completamente verde.

---

## Prerrequisito

Todos los tests del Módulo C deben estar en verde antes de iniciar este checklist.

```
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx
# Esperado: todos los tests passing, 0 failures
```

---

## D-1: Build limpio

**Comando:**
```bash
npm run build
```

**Resultado esperado:**
- Sin errores de TypeScript (`tsc --noEmit` implícito en el build de Vite).
- Sin errores de Vite.
- Output en `dist/` generado exitosamente.
- Línea final tipo: `✓ built in X.XXs`

**Fallo implica:**
- Error de tipos → corregir antes de continuar.
- Error de importación → revisar que `CorteInicio.tsx` exporta correctamente.

---

## D-2: Suite de tests corte

**Comando:**
```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx
```

**Resultado esperado:**
- Todos los tests passing.
- 0 failures, 0 errors.
- Tiempo de ejecución razonable (< 30s localmente).

**Qué valida:**
- Módulo C completo: prefill + sugerencias + empleado precargado + "Mostrar todos".
- Integración con `useCorteSesion.iniciarCorte()` recibe parámetros correctos.

---

## D-3: Smoke manual en `localhost:5173`

### D-3.1 Catálogo completo visible

1. Levantar dev server: `npm run dev`.
2. Navegar al flujo de Corte → pantalla de inicio de corte.
3. En el campo **Cajero**: hacer click / focus.
4. **Verificar:** La lista desplegable muestra todos los empleados de la sucursal seleccionada (no solo 1).
5. En el campo **Testigo**: mismo proceso.
6. **Verificar:** Lista completa visible.

**Criterio pasa/falla:**
- ✅ Se ven múltiples empleados en el datalist.
- ❌ Solo se ve 1 empleado o ninguno.

### D-3.2 Sin divergencia respecto a Supabase

1. Ir a Supabase → tabla `empleados` de la sucursal seleccionada.
2. Contar empleados activos.
3. Comparar con lo que muestra el datalist en la UI.
4. **Verificar:** El número de opciones en el datalist coincide con los registros en Supabase.

**Criterio pasa/falla:**
- ✅ Número idéntico de empleados UI ↔ Supabase.
- ❌ UI muestra menos o empleados distintos a los de Supabase.

### D-3.3 Flujo legacy (CashCounter) también usa Supabase

1. Ir al flujo CashCounter (inicio de turno legacy).
2. Verificar que el selector de sucursales y empleados carga desde Supabase (no hardcoded de `paradise.ts`).
3. Seleccionar una sucursal diferente → verificar que los empleados cambian dinámicamente.

**Criterio pasa/falla:**
- ✅ Los datos cambian según la sucursal seleccionada (comportamiento dinámico).
- ❌ Los mismos empleados aparecen sin importar la sucursal (datos estáticos).

---

## D-4: Criterio de cierre del caso

El caso puede marcarse como **COMPLETADO** cuando:

> **No existe consumo productivo de catálogos estáticos para empleados/sucursales
> y todos los flujos usan proveedor unificado con tests en verde.**

Verificación de cierre:

```bash
# Buscar consumo remanente de paradise.ts para empleados/sucursales
grep -r "paradise" src/ --include="*.tsx" --include="*.ts" | grep -v "test" | grep -v "\.spec\."
```

**Resultado esperado:** Ninguna línea debe mostrar `paradise.ts` siendo importado
para obtener listas de empleados o sucursales en código productivo.

---

## D-5: Pasos de cierre documental

Una vez que D-1, D-2, D-3 y D-4 estén confirmados:

1. Actualizar `00_README.md`:
   - Cambiar estado `EN_PROGRESO` → `COMPLETADO`.
   - Actualizar `Fecha de actualización` al día del cierre.
   - Marcar los módulos C y D como `[x]`.

2. Mover carpeta completa:
   ```bash
   mv "docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217" \
      "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Doble_Fuente_Catalogos_20260217_COMPLETADO"
   ```

3. Verificar:
   ```bash
   ls "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Doble_Fuente_Catalogos_20260217_COMPLETADO/"
   ```
   Esperado: `00_README.md`, `01_Diagnostico_Tecnico.md`, `02_Plan_Modular_TDD.md`,
   `03_Modulo_C_ArquitecturaSpec.md`, `04_Modulo_D_ReleaseChecklist.md`, `99_PENDIENTES_POR_REALIZAR.md`
