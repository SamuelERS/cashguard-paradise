# Pendientes por Realizar

> Extraído de `02_Plan_Modular_TDD.md`. Módulos A y B completados.
> Módulos C y D son los pasos restantes para cerrar el caso.

---

## Módulo C — Integridad de flujo CorteInicio

**Archivo de test:** `src/components/corte/__tests__/CorteInicio.test.tsx`

- [ ] Mantener tests existentes de prefill + sugerencias completas (no romper lo que funciona).
- [ ] Cubrir caso: empleado precargado + catálogo múltiple (la datalist muestra todos los empleados de la sucursal, no solo el precargado).
- [ ] Cubrir caso: acción manual "Mostrar todos" (el usuario puede expandir el catálogo explícitamente).
- [ ] Ejecutar suite completa de corte y confirmar verde:

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx
```

---

## Módulo D — Verificación de release

- [ ] Build limpio:

```bash
npm run build
```
Esperado: sin errores de TypeScript ni de Vite.

- [ ] Suite de tests del flujo corte en verde:

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx
```
Esperado: todos los tests passing.

- [ ] Smoke manual en `localhost:5173`:
  - Catálogo completo visible en campo cajero y campo testigo (no solo 1 sugerencia).
  - Sin divergencia entre sucursales/empleados respecto a Supabase.
  - Flujo legacy (CashCounter) también muestra sucursales/empleados desde Supabase (no desde `paradise.ts`).

---

## Criterio de Cierre

> El caso puede marcarse como **COMPLETADO** y moverse a `CASOS-COMPLETOS/` cuando:
>
> **No existe consumo productivo de catálogos estáticos para empleados/sucursales y todos los flujos usan proveedor unificado con tests en verde.**

Pasos de cierre cuando los módulos C y D estén completados:
1. Actualizar `00_README.md`: cambiar `EN_PROGRESO` → `COMPLETADO` y fecha actualización.
2. Mover carpeta completa a `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Doble_Fuente_Catalogos_20260217_COMPLETADO/`.
