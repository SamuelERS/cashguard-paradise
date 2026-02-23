# Módulo Correctivo H4: Lint Error — useSucursales.ts

| Campo     | Valor                              |
|-----------|------------------------------------|
| Severidad | 🟠 Alto                            |
| Estado    | 🔴 Pendiente                       |
| Tipo      | ESLint / Calidad de código         |
| Archivo   | `src/hooks/useSucursales.ts`       |
| Línea     | ~80                                |

---

## Hallazgo Original

> `npm run lint` falla por error en `useSucursales.ts` (line 80) (`no-unsafe-finally`).

## Root Cause

El bloque `finally` contiene un `return` condicional que puede swallow exceptions:

```typescript
// Líneas 79-82:
} finally {
  if (!isMounted) return;  // ← Viola no-unsafe-finally
  setCargando(false);
}
```

La regla `no-unsafe-finally` existe porque un `return` en `finally` sobrescribe cualquier `return` o `throw` del `try`/`catch`, lo que puede ocultar errores silenciosamente.

## Análisis de Intención

El `return` es un guard para evitar `setState` en componente desmontado (patrón React legítimo). Sin embargo, el guard está mal ubicado — debería estar ANTES del `finally`.

## Estrategia Correctiva

### Solución: Mover el guard fuera del finally

```typescript
// ANTES (viola no-unsafe-finally):
} finally {
  if (!isMounted) return;
  setCargando(false);
}

// DESPUÉS (guard dentro de finally sin return):
} finally {
  if (isMounted) {
    setCargando(false);
  }
}
```

**Lógica equivalente:** Si `isMounted` es `false`, no ejecutar `setCargando`. Si es `true`, ejecutar. Sin `return` en `finally`.

## Plan de Ejecución

### Paso 1: Aplicar fix

Modificar `useSucursales.ts` línea ~80: invertir la condición y eliminar `return`.

### Paso 2: Verificar todos los finally del archivo

Buscar otros `return` en bloques `finally` del mismo archivo.

### Paso 3: Validar

```bash
npm run lint  # Debe pasar con 0 errores
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useSucursales.ts` | Invertir guard en `finally` (1 línea) |

## Criterio de Aceptación

- [ ] `npm run lint` pasa con 0 errores (warnings aceptables)
- [ ] Comportamiento funcional idéntico (guard de unmount preservado)
- [ ] Sin `return`, `break`, `continue` o `throw` en bloques `finally`
