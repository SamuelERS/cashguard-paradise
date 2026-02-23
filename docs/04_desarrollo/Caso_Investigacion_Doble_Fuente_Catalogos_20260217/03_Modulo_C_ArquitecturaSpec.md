# 03 Módulo C — Especificación Arquitectónica: CorteInicio

> **Documento DIRM — Solo arquitectura. Sin código funcional.**
> Módulos A y B ya completados. Este documento especifica el contrato de diseño
> para los tests que faltan del Módulo C antes de ejecutar la implementación.

---

## 1. Contexto del Componente

`CorteInicio.tsx` es el formulario de inicio de turno en el flujo Corte.
Recopila `cajero`, `testigo` y `sucursal_id` antes de llamar `iniciarCorte()` del hook `useCorteSesion`.

**Archivo objetivo:** `src/components/corte/CorteInicio.tsx`
**Tests objetivo:** `src/components/corte/__tests__/CorteInicio.test.tsx`

---

## 2. Props Interface (Contrato de entrada)

```
CorteInicioProps {
  sucursales:        Array<{ id: string; nombre: string }>
  empleados:         string[]                          // Lista completa de empleados de la sucursal
  initialValues?:    {
    sucursal_id?: string
    cajero?:      string
    testigo?:     string
  }
  onSubmit:          (params: IniciarCorteParams) => void
  onSucursalChange:  (id: string) => void              // Callback para que el padre recargue empleados
  isLoading?:        boolean
  error?:            string | null
}
```

**Nota:** `IniciarCorteParams` viene de `useCorteSesion`:
```
{ sucursal_id: string; cajero: string; testigo: string; venta_esperada?: number }
```

---

## 3. Estado interno (Contrato de estado)

| Campo           | Tipo    | Valor inicial              | Propósito                                          |
|-----------------|---------|----------------------------|----------------------------------------------------|
| `sucursalId`    | string  | `initialValues?.sucursal_id ?? ""` | Input de selección de sucursal              |
| `cajero`        | string  | `initialValues?.cajero ?? ""`      | Input de cajero (controlado)                |
| `testigo`       | string  | `initialValues?.testigo ?? ""`     | Input de testigo (controlado)               |
| `showAllCajero` | boolean | `false`                    | Cuando `true`, fuerza renderizado de todos los empleados en el datalist de cajero. Ver §4. |
| `showAllTestigo`| boolean | `false`                    | Ídem para el campo testigo.                        |

---

## 4. Contrato de comportamiento: datalist con prefill

### Problema documentado
Cuando `cajero` se precarga desde `initialValues.cajero` (recuperación de sesión),
el browser filtra el `<datalist>` para mostrar únicamente la opción que coincide
con el valor actual. El empleado ve "1 sugerencia" aunque el catálogo tenga 15 empleados.

### Solución especificada: acción "Mostrar todos"

**Trigger:** Botón o enlace `aria-label="Mostrar todos los empleados"` junto al input.

**Contrato de la acción:**
1. Pone `cajero = ""` (limpia el input).
2. Enfoca el input (`inputRef.current?.focus()`).
3. Pone `showAllCajero = false` (ya no se necesita flag especial — el datalist muestra
   todas las opciones porque el valor está vacío).

**Por qué funciona:** El browser filtra `<datalist>` por `value` del input.
`value = ""` → sin filtro → todas las opciones visibles.

### Contrato del datalist
El `<datalist>` de cajero renderiza **todos** los elementos de `props.empleados`
incondicionalmente (no importa el valor actual de `cajero`).

```
<datalist id="empleados-cajero">
  {props.empleados.map(e => <option key={e} value={e} />)}
</datalist>
```

---

## 5. Reglas de validación (pre-submit)

| Regla                       | Mensaje de error sugerido                          |
|-----------------------------|---------------------------------------------------|
| `cajero !== ""`             | "Selecciona un cajero"                            |
| `testigo !== ""`            | "Selecciona un testigo"                           |
| `cajero !== testigo`        | "El cajero y el testigo no pueden ser la misma persona" |
| `sucursalId !== ""`         | "Selecciona una sucursal"                         |

La validación ocurre en el handler `onSubmit` del `<form>` antes de llamar `props.onSubmit()`.

---

## 6. Contratos de tests — Módulo C

### 6.1 Tests existentes (NO romper)

Los tests actuales de `CorteInicio.test.tsx` que cubren:
- Prefill de campos desde `initialValues` → campos muestran valor correcto.
- Sugerencias completas en datalist cuando no hay prefill → todas las opciones visibles.

**Acción requerida:** Verificar que ningún cambio en la implementación rompa estos assertions.

### 6.2 Caso nuevo A: Empleado precargado + catálogo múltiple

**Escenario:** `initialValues.cajero = "Juan Pérez"` + `empleados = ["Ana López", "Juan Pérez", "Sofía Ramos"]`

**Assertions:**
1. El input de cajero muestra `"Juan Pérez"` al renderizar.
2. El `<datalist>` contiene **3 opciones** (no solo 1) — independientemente del valor del input.
3. El botón/enlace "Mostrar todos" es visible cuando `cajero` tiene valor.

### 6.3 Caso nuevo B: Acción manual "Mostrar todos"

**Escenario:** Estado inicial con `cajero = "Juan Pérez"`.

**Secuencia:**
1. Render del componente con prefill.
2. Click en "Mostrar todos" para el campo cajero.

**Assertions:**
1. El input de cajero está vacío después del click.
2. El input de cajero tiene el foco (`document.activeElement === input`).
3. El `<datalist>` sigue mostrando los 3 empleados.
4. Seleccionar "Sofía Ramos" del datalist → `cajero = "Sofía Ramos"`.

### 6.4 Test de integración: CorteOrquestador (ya existe, mantener)

`CorteOrquestador.test.tsx` verifica que al llamar `onSubmit` desde `CorteInicio`,
`useCorteSesion.iniciarCorte()` recibe los parámetros correctos. No requiere cambios
si la firma del `onSubmit` respeta `IniciarCorteParams`.

---

## 7. Restricciones técnicas (Vercel React Best Practices)

| Regla                          | Aplicación en este componente                          |
|--------------------------------|--------------------------------------------------------|
| `rerender-dependencies`        | Los `useEffect` deben usar dependencias primitivas (`cajero: string`, no objetos) |
| `rerender-derived-state-no-effect` | `showAllCajero` NO se deriva con `useEffect`. Se actualiza directamente en el event handler del botón. |
| `rerender-functional-setstate` | Si `setCajero` depende del valor anterior, usar función `prev => ...` |
| `rerender-defer-reads`         | No suscribirse a `cajero` en callbacks que no lo necesiten para renderizar. |
| Zero `any`                     | Todos los tipos explícitos. `empleados: string[]`, no `any[]`. |

---

## 8. Alineación con `useCorteSesion`

El componente **NO** llama directamente a `useCorteSesion`. El padre (`CorteOrquestador` o similar)
es quien llama al hook y pasa `onSubmit = iniciarCorte` como prop.

Esto mantiene `CorteInicio` como un "dumb component" testeable en aislamiento
sin necesidad de mockear Supabase.

---

## 9. Checklist de aceptación del Módulo C

- [ ] Tests existentes (prefill + sugerencias completas) siguen en verde.
- [ ] Test caso A: empleado precargado + datalist completo en verde.
- [ ] Test caso B: acción "Mostrar todos" limpia input + foca + datalist completo.
- [ ] Cero `any` en el archivo del componente.
- [ ] `npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx` → todos verdes.
