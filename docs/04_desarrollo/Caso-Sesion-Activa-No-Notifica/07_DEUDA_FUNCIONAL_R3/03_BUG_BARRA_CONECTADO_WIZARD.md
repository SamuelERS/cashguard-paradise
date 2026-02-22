# R3-B3: Barra "Conectado" No Visible en Wizard

> Severidad: BAJA
> Estado: DECISION TOMADA
> Decision Authority: OPCION B — Icono minimo de nube/check en panel Step 5
> Detectado por: Usuario (testing manual)
> Quote: "la barra verde de Conectado - Datos sincronizados no se ve en el wizard"

## 1. Sintoma Observable

La barra verde "Conectado - Datos sincronizados" que indica estado de sync con
Supabase aparece dentro de CashCounter (pantalla de conteo), pero NO dentro del
wizard inicial. El usuario espera ver confirmacion de conexion cuando detecta
sesion activa.

## 2. Root Cause

### CorteStatusBanner se renderiza en CashCounter — `CashCounter.tsx` lineas 104-115:

```tsx
{syncEstado && (
  <div className="mb-2">
    <CorteStatusBanner
      estadoConexion="online"
      estadoSync={syncEstado}
      ultimaSync={ultimaSync ?? null}
      pendientes={0}
      mensajeError={syncError}
    />
  </div>
)}
```

### El wizard NO renderiza CorteStatusBanner:

`InitialWizardModalView.tsx` no importa ni usa `CorteStatusBanner`.
`Step5SicarInput.tsx` tampoco.

### Valores de sync en Index.tsx:

```typescript
// Lineas 39-41:
const [syncSucursalId, setSyncSucursalId] = useState('');
const [ultimaSync, setUltimaSync] = useState<string | null>(null);
const [syncEstado, setSyncEstado] = useState<'sincronizado' | 'sincronizando' | 'error'>('sincronizado');
```

Estos valores se inicializan vacios/default y solo se actualizan DESPUES de
que handleWizardComplete ejecuta (lineas 135-160). Durante el wizard, syncEstado
es 'sincronizado' y syncSucursalId es '' — no hay sync real ocurriendo.

## 3. Analisis: Es Realmente un Bug?

### Argumento a favor (mostrar barra en wizard):

- Cuando hay sesion activa, el usuario quiere saber que Supabase esta conectado
- Da confianza visual de que el sistema esta online
- Coherencia visual: si se detecta sesion, la barra confirma la conexion

### Argumento en contra (NO mostrar barra en wizard):

- Durante el wizard, NO hay sync activa (syncSucursalId = '')
- Mostrar "Conectado" cuando no hay sync real es ENGAÑOSO
- La deteccion de sesion activa ya usa Supabase exitosamente (si no, no se muestra el panel)
- Agregar estado de conexion al wizard mezcla preocupaciones (wizard = configuracion, no sync)

### Argumento alternativo (indicador ligero en panel Step 5):

- En lugar de la barra completa, agregar un icono pequeno en el panel de sesion activa
- Ejemplo: icono de nube/check junto al texto "Sesion en Progreso"
- Indica que la deteccion fue exitosa sin implicar sync activa

## 4. Opciones de Solucion

### Opcion A — No hacer nada (CONSIDERAR):

La deteccion de sesion activa ya prueba que Supabase esta conectado.
Si la query falla, el panel NO aparece (graceful degradation en lineas 205-217).
Mostrar "Conectado" durante el wizard puede ser mas confuso que util.

### Opcion B — Icono de estado en panel Step 5:

Agregar un indicador visual MINIMO al panel:
```
[icono nube verde] Sesion en Progreso
Hay un corte de caja que no se completo...
```

### Opcion C — Mover/duplicar CorteStatusBanner al wizard:

Requiere:
- Pasar syncEstado como prop al wizard
- Pero syncEstado = 'sincronizado' (default, no sync real) -> engañoso
- Requiere crear nuevo estado de conexion separado del sync

## 5. Recomendacion

**Opcion B** (icono minimo) o **Opcion A** (no hacer nada) dependiendo de la
decision del Authority. La barra completa (Opcion C) no tiene sentido tecnico
porque no hay sync activa durante el wizard.

## 6. Archivos Afectados (si se implementa Opcion B)

| Archivo | Cambio |
|---------|--------|
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | Agregar icono estado junto a titulo |

## 7. Complejidad Estimada

- **Opcion A:** Cero (documentar decision)
- **Opcion B:** Muy baja (1 icono, 0 logica nueva)
- **Opcion C:** Media (nuevo estado conexion, props adicionales)
