# R3-B2: Sin Identificador de Sesion Visible

> Severidad: MEDIA
> Estado: LISTO PARA TDD
> Decision Authority: Solucion unica — Expandir select + propagar datos + renderizar en panel
> Detectado por: Usuario (testing manual)
> Quote: "no hay identificador de sesion... ultimos 5 caracteres o correlativo"

## 1. Sintoma Observable

El panel de sesion activa en Step 5 muestra el mensaje "Hay un corte de caja que no
se completo en esta sucursal" pero no muestra NINGUN identificador que permita al
usuario saber CUAL sesion es. No hay correlativo, ni ID parcial, ni fecha/hora.

## 2. Root Cause

### Panel actual — `Step5SicarInput.tsx` lineas 29-58:

```tsx
<h4 className="font-semibold text-amber-400 text-fluid-sm mb-2">
  Sesion en Progreso
</h4>
<p className="text-muted-foreground text-fluid-xs mb-4">
  Hay un corte de caja que no se completo en esta sucursal. Elige como continuar.
</p>
```

Solo texto estatico. No recibe ni muestra ID, correlativo, fecha, ni cajero anterior.

### Datos disponibles en `detectActiveCashCutSession()` — `Index.tsx` lineas 191-218:

```typescript
const { data, error } = await tables
  .cortes()
  .select('id,sucursal_id')  // <-- Solo trae id y sucursal_id
  .in('estado', ['INICIADO', 'EN_PROGRESO'])
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

return {
  hasActive: Boolean(data),
  sucursalId: data?.sucursal_id ?? null,
  // No retorna: id, created_at, correlativo, cajero
};
```

La query solo selecciona `id,sucursal_id`. No trae campos utiles para mostrar.

### Infraestructura de correlativo — `useCorteSesion.ts` lineas 38-55:

```typescript
const generarCorrelativo = async (sucursal_id: string): Promise<string> => {
  // Formato: CORTE-YYYY-MM-DD-X-NNN
  // Ejemplo: CORTE-2026-02-18-1-001
  // X = numero de sucursal, NNN = secuencial del dia
};
```

El correlativo se genera al llamar `iniciarCorte()` y se guarda en el campo
`correlativo` de la tabla `cortes`. Pero no se consulta durante la deteccion.

## 3. Datos Candidatos para Mostrar

| Dato | Disponible en DB | Disponible en deteccion | Util para usuario |
|------|-----------------|------------------------|-------------------|
| `id` (UUID) | Si | Si (ya en select) | Parcial (ultimos 5 chars) |
| `correlativo` | Si | No (no en select) | Muy util (CORTE-2026-02-18-1-001) |
| `created_at` | Si | No (no en select) | Util (fecha/hora inicio) |
| `cajero` | Si | No (no en select) | Util (quien empezo el corte) |
| `estado` | Si | Implicito (filtro IN) | Util (INICIADO vs EN_PROGRESO) |

## 4. Propuesta de Solucion

### Paso 1 — Ampliar select en `detectActiveCashCutSession()`:

```typescript
// ANTES:
.select('id,sucursal_id')

// DESPUES:
.select('id,sucursal_id,correlativo,created_at,cajero,estado')
```

### Paso 2 — Retornar datos adicionales:

```typescript
return {
  hasActive: Boolean(data),
  sucursalId: data?.sucursal_id ?? null,
  sessionId: data?.id ?? null,
  correlativo: data?.correlativo ?? null,
  createdAt: data?.created_at ?? null,
  cajero: data?.cajero ?? null,
  estado: data?.estado ?? null,
};
```

### Paso 3 — Propagar al panel (nuevo prop o prop enriquecido):

Dos opciones:
- **Opcion A:** Multiples props nuevas (`sessionCorrelativo`, `sessionCreatedAt`, etc.)
- **Opcion B:** Un objeto `activeSessionInfo` que contenga todo

### Paso 4 — Renderizar en Step5SicarInput:

```
Sesion en Progreso
CORTE-2026-02-18-1-001  |  Iniciado: 18 Feb 14:30  |  Cajero: Juan
```

## 5. Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Ampliar select en detectActiveCashCutSession, propagar datos |
| `src/types/initialWizard.ts` | Nuevas props en InitialWizardModalProps y Step5Props |
| `src/components/initial-wizard/InitialWizardModalView.tsx` | Pasar props al Step5 |
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | Renderizar identificador |

## 6. Complejidad Estimada

- **Baja-Media**
- Cambios en 4 archivos, todos menores
- Tests TDD: ~3-4 tests (renderiza correlativo, renderiza fecha, renderiza cajero,
  fallback cuando dato null)
