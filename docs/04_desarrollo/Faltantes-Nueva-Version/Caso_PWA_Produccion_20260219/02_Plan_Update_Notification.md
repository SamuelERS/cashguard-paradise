# 02 - Plan de Notificacion de Actualizacion PWA

**Caso:** PWA Produccion
**Fecha:** 19 febrero 2026
**Estado:** Plan aprobado, pendiente implementacion
**Prioridad:** Alta
**Esfuerzo estimado:** 2-3 horas
**Resuelve brechas:** B1, B2, B3 del diagnostico

---

## 1. Objetivo

Garantizar que los cajeros de CashGuard Paradise **siempre operen con la version mas reciente** de la aplicacion, sin perder trabajo en progreso ni interrumpir operaciones activas.

**Situacion actual:**
- Cajero abre la app al inicio del turno
- Se despliega un fix critico a las 10:00 AM
- El cajero no se entera y opera con la version vieja todo el dia
- El fix no llega hasta que cierre todas las pestanas y reabra (posiblemente al dia siguiente)

**Situacion deseada:**
- Cajero abre la app al inicio del turno
- Se despliega un fix critico a las 10:00 AM
- La app muestra un banner discreto: "Nueva version disponible"
- El cajero termina lo que esta haciendo y presiona "Actualizar ahora"
- La pagina recarga y opera con la version mas reciente

---

## 2. Estrategia Recomendada: Toast de Recarga

### 2.1 Flujo General

```
[Nuevo build desplegado en servidor]
        |
        v
[Service Worker detecta nueva version]
  - Descarga nueva version en background
  - Nuevo SW pasa a estado "waiting"
        |
        v
[Evento 'controllerchange' se dispara]
        |
        v
[App detecta SW en estado waiting]
        |
        v
[Muestra banner/toast persistente]
  "Nueva version disponible"
  [Actualizar ahora]
        |
        v
[Cajero decide cuando actualizar]
  - Si esta en pantalla principal: actualiza inmediatamente
  - Si esta en medio de corte: termina y luego actualiza
        |
        v
[Click "Actualizar ahora"]
        |
        v
[Guardar progreso si hay datos en vuelo]
        |
        v
[window.location.reload()]
        |
        v
[Nuevo SW toma control]
[App carga con version actualizada]
```

### 2.2 Componente de Notificacion

Un banner o toast persistente que aparece en la parte superior o inferior de la pantalla con las siguientes caracteristicas:

**Contenido del banner:**
- Icono de actualizacion
- Texto: "Nueva version disponible"
- Boton primario: "Actualizar ahora"
- Boton secundario (opcional): "Mas tarde" (oculta temporalmente, reaparece en 30 minutos)

**Comportamiento visual:**
- No invasivo: no bloquea la interaccion con la app
- Persistente: permanece visible hasta que el usuario actue
- Posicion: parte inferior de la pantalla (no interfiere con la navegacion superior)
- Estilo: consistente con el design system existente (glass morphism)

**Comportamiento logico:**
- Solo aparece cuando hay un SW nuevo en estado `waiting`
- NO aparece durante fases criticas (Phase 1 conteo, Phase 2 delivery/verificacion)
- Si el usuario presiona "Mas tarde", se oculta por 30 minutos y reaparece
- Si el usuario cierra la app y reabre, el banner vuelve a aparecer si la actualizacion sigue pendiente

### 2.3 Deteccion del Evento

La deteccion se basa en el ciclo de vida estandar del Service Worker:

1. **Registro inicial:** Al cargar la app, se registra el SW y se guarda la referencia
2. **Escuchar `updatefound`:** Cuando Workbox detecta un nuevo SW, emite este evento
3. **Escuchar `statechange` del nuevo SW:** Cuando el nuevo SW pasa a `installed`, significa que esta listo pero esperando
4. **Escuchar `controllerchange`:** Se dispara cuando un nuevo SW toma control (post-reload)

El punto clave es detectar cuando `registration.waiting` no es `null`, lo que indica que hay una version lista para activarse.

### 2.4 Activacion de la Actualizacion

Cuando el usuario presiona "Actualizar ahora":

1. Se verifica si hay datos en progreso que proteger
2. Si hay datos, se guardan usando el mecanismo existente
3. Se envia mensaje `skipWaiting` al SW en espera (para que tome control inmediatamente)
4. Se ejecuta `window.location.reload()` para cargar la nueva version

---

## 3. Alternativas Evaluadas

### 3.1 Auto-reload Silencioso

**Descripcion:** Cuando se detecta nueva version, recargar automaticamente sin preguntar al usuario.

**Evaluacion:**

| Criterio | Resultado |
|----------|-----------|
| Garantiza version actualizada | Si |
| Protege trabajo en progreso | **NO** |
| Experiencia de usuario | **Mala** - Recarga inesperada |
| Riesgo operacional | **ALTO** - Puede interrumpir corte de caja en progreso |

**Veredicto: RECHAZADO**

Un cajero que lleva 30 minutos contando denominaciones y la app recarga sin aviso perderia todo el progreso. Esto es inaceptable en el contexto operacional de CashGuard Paradise.

### 3.2 Modal Obligatorio (Bloqueo Total)

**Descripcion:** Mostrar un modal que bloquea toda la interfaz hasta que el usuario acepte actualizar.

**Evaluacion:**

| Criterio | Resultado |
|----------|-----------|
| Garantiza version actualizada | Si (rapido) |
| Protege trabajo en progreso | Parcial (depende del momento) |
| Experiencia de usuario | **Mala** - Invasivo y frustrante |
| Riesgo operacional | **MEDIO** - Interrumpe flujo de trabajo |

**Veredicto: RECHAZADO**

Aunque es mas seguro que el auto-reload, un modal bloqueante que aparece en medio de una operacion genera frustacion y puede causar errores si el cajero esta apurado.

### 3.3 Toast con Countdown

**Descripcion:** Mostrar un toast que dice "Actualizando en 60 segundos..." con cuenta regresiva, y un boton "Actualizar ahora" para acelerar.

**Evaluacion:**

| Criterio | Resultado |
|----------|-----------|
| Garantiza version actualizada | Si (con delay maximo de 60s) |
| Protege trabajo en progreso | Parcial (da 60s para terminar) |
| Experiencia de usuario | Aceptable |
| Riesgo operacional | **BAJO-MEDIO** - 60s puede no ser suficiente |

**Veredicto: VIABLE COMO ALTERNATIVA**

Es una opcion valida como segunda fase. Si la estrategia del toast persistente (seccion 2) resulta insuficiente porque los cajeros ignoran el banner durante dias, se puede escalar a esta alternativa con countdown.

### 3.4 Tabla Comparativa Final

| Estrategia | UX | Seguridad Datos | Rapidez Update | Complejidad | Decision |
|------------|-----|-----------------|----------------|-------------|----------|
| Auto-reload | Mala | Ninguna | Inmediata | Baja | RECHAZADO |
| Modal bloqueante | Mala | Parcial | Rapida | Media | RECHAZADO |
| **Toast persistente** | **Buena** | **Alta** | **A criterio usuario** | **Media** | **APROBADO** |
| Toast con countdown | Aceptable | Media | 60s max | Media-Alta | Alternativa futura |

---

## 4. Archivos a Modificar

### 4.1 Archivos Existentes

**`src/main.tsx` o `src/App.tsx`**
- Agregar logica de escucha del ciclo de vida del Service Worker
- Detectar cuando `registration.waiting` no es null
- Exponer estado de "actualizacion disponible" al arbol de componentes
- Implementar funcion para enviar mensaje `skipWaiting` y recargar

**`vite.config.ts`**
- Revisar si la configuracion actual de VitePWA necesita ajustes para exponer el objeto `registration`
- Actualmente usa `registerType: 'autoUpdate'` que maneja el registro automaticamente
- Puede ser necesario cambiar a registro manual para tener control sobre el ciclo de vida
- Evaluar si `registerType: 'prompt'` es mas adecuado (VitePWA ofrece esta variante que facilita el patron de "preguntar antes de actualizar")

### 4.2 Archivos Nuevos

**`src/components/shared/UpdateAvailableBanner.tsx`**
- Componente visual del banner de actualizacion
- Props: `visible`, `onUpdate`, `onDismiss`
- Estilo consistente con design system (glass morphism, colores del tema)
- Posicion fija en la parte inferior de la pantalla
- Animacion de entrada/salida con Framer Motion (consistente con la app)
- Responsive: se adapta a mobile y desktop

### 4.3 Archivos Potencialmente Afectados

**`src/hooks/` (hook nuevo posible)**
- Un hook como `useServiceWorkerUpdate` podria encapsular toda la logica de deteccion
- Retornaria: `{ updateAvailable: boolean, applyUpdate: () => void }`
- Separa la logica del SW de los componentes de UI (patron consistente con la arquitectura)

---

## 5. Proteccion de Datos en Progreso

### 5.1 Escenarios de Riesgo

El momento mas critico para una recarga es cuando el cajero esta en medio de una operacion:

| Fase | Datos en riesgo | Nivel de riesgo |
|------|-----------------|-----------------|
| Pantalla principal (OperationSelector) | Ninguno | Nulo |
| Wizard (pasos 1-5) | Sucursal, cajero, testigo, venta esperada | Bajo (rapido de re-ingresar) |
| Phase 1 - Conteo de denominaciones | Todas las cantidades ingresadas | **ALTO** (15-30 min de trabajo) |
| Phase 2 - Delivery | Progreso de entrega | **ALTO** (dificil de repetir) |
| Phase 2 - Verificacion ciega | Todos los intentos registrados | **CRITICO** (imposible de repetir) |
| Phase 3 - Reporte | Solo lectura, sin riesgo | Nulo |

### 5.2 Estrategia de Proteccion

**Regla principal:** El banner de actualizacion NO debe ofrecer la opcion de recargar si el cajero esta en una fase critica (Phase 1 o Phase 2).

**Implementacion propuesta:**

1. **Pantalla principal / Phase 3:** Banner con boton "Actualizar ahora" habilitado
2. **Wizard (pasos 1-5):** Banner visible pero con texto "Actualiza al terminar el proceso actual"
3. **Phase 1 / Phase 2:** Banner oculto o con boton deshabilitado. Texto: "Actualizacion disponible. Se aplicara al finalizar el corte."
4. **Al completar Phase 3:** Si hay actualizacion pendiente, mostrar banner prominente invitando a actualizar

**Guardado de progreso:**

Si el usuario decide actualizar mientras tiene datos del wizard (pasos 1-5), se debe:
1. Serializar el estado actual del wizard a localStorage
2. Ejecutar la recarga
3. Al cargar la nueva version, detectar si hay estado guardado y restaurar

Para Phase 1 y Phase 2, la complejidad de guardar y restaurar el estado completo (incluyendo conteo parcial, intentos de verificacion ciega, etc.) es demasiado alta. Por eso es preferible **no permitir la recarga** durante estas fases.

### 5.3 Matriz de Comportamiento del Banner

| Estado de la App | Banner Visible | Boton Habilitado | Texto del Boton |
|------------------|----------------|------------------|-----------------|
| OperationSelector | Si | Si | "Actualizar ahora" |
| Wizard (cualquier paso) | Si | Si* | "Actualizar ahora"* |
| Phase 1 (conteo) | Si | No | "Disponible al finalizar" |
| Phase 2 (delivery) | Si | No | "Disponible al finalizar" |
| Phase 2 (verificacion) | Si | No | "Disponible al finalizar" |
| Phase 3 (reporte) | Si | Si | "Actualizar ahora" |

*En el wizard, si se decide actualizar, se guarda el progreso del wizard en localStorage antes de recargar.

---

## 6. Criterios de Aceptacion

### 6.1 Funcionales

- [ ] Cuando hay un nuevo SW en estado `waiting`, se muestra un banner de actualizacion
- [ ] El banner muestra el texto "Nueva version disponible" con un boton "Actualizar ahora"
- [ ] Al presionar "Actualizar ahora", la pagina se recarga y carga la nueva version
- [ ] Despues de la recarga, la app opera con el SW mas reciente (verificable en DevTools > Application > Service Workers)
- [ ] Si el cajero esta en Phase 1 o Phase 2, el boton de actualizar esta deshabilitado
- [ ] Si el cajero esta en OperationSelector o Phase 3, el boton esta habilitado
- [ ] El boton "Mas tarde" oculta el banner temporalmente (reaparece en 30 minutos)
- [ ] Si la app se cierra y reabre con actualizacion pendiente, el banner aparece nuevamente

### 6.2 No Funcionales

- [ ] El banner no bloquea la interaccion con la interfaz (es no-modal)
- [ ] El banner es visualmente consistente con el design system (glass morphism, colores tema)
- [ ] El banner es responsive y se adapta a mobile y desktop
- [ ] La deteccion de actualizacion no causa impacto en el rendimiento de la app
- [ ] TypeScript: cero tipos `any` en toda la implementacion
- [ ] Comentarios con prefijo `// [IA] - v{version}:` segun convenciones del proyecto

### 6.3 De Seguridad

- [ ] NO se ejecuta auto-reload en ningun escenario
- [ ] Los datos en progreso (Phase 1, Phase 2) nunca se pierden por una actualizacion
- [ ] El mecanismo `skipWaiting` solo se invoca cuando el usuario explicitamente lo solicita
- [ ] No se introduce ninguna vulnerabilidad en el manejo del SW

### 6.4 De Verificacion

- [ ] Build exitoso: `npm run build` sin errores
- [ ] TypeScript: `npx tsc --noEmit` con 0 errores
- [ ] Verificacion manual en Chrome DevTools: SW lifecycle correcto
- [ ] Verificacion en dispositivo real (iPhone + Android): banner aparece y recarga funciona

---

## 7. Esfuerzo Estimado

| Tarea | Tiempo |
|-------|--------|
| Configurar escucha del ciclo de vida SW (registro, `updatefound`, `statechange`) | 30-45 min |
| Crear hook `useServiceWorkerUpdate` con logica de deteccion | 30 min |
| Crear componente `UpdateAvailableBanner.tsx` con estilos | 30-45 min |
| Integrar banner en `App.tsx` con logica de fase activa | 20-30 min |
| Implementar logica de `skipWaiting` + reload | 15 min |
| Pruebas manuales en DevTools (simular update, verificar banner, probar reload) | 30 min |
| Documentacion y actualizacion CLAUDE.md | 15 min |
| **Total estimado** | **2.5 - 3.5 horas** |

### Consideraciones de Tiempo

- Si se opta por `registerType: 'prompt'` de VitePWA, parte de la logica de deteccion ya esta resuelta por el plugin, lo que puede reducir el tiempo a ~2 horas
- Si se requiere guardar y restaurar estado del wizard pre-recarga, agregar 30-45 minutos adicionales
- Testing en dispositivos reales (iPhone, Android) puede requerir tiempo extra dependiendo del entorno

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Banner aparece en momento inoportuno | Baja | Medio | Logica de fase activa desactiva el boton |
| SW no detecta actualizacion correctamente | Baja | Alto | Fallback: verificacion periodica cada 60 min |
| Recarga pierde datos no guardados | Media | Alto | Boton deshabilitado en fases criticas |
| Banner ignorado por cajeros | Media | Medio | Escalar a toast con countdown si persiste |
| Incompatibilidad con algun navegador mobile | Baja | Medio | Testing en dispositivos reales antes de deploy |

---

## 9. Dependencias

- No se requieren dependencias npm adicionales
- VitePWA ya incluye las APIs necesarias para el registro y control del SW
- Framer Motion ya esta disponible para animaciones del banner
- El design system (glass morphism, colores) ya esta definido y se reutiliza

---

## 10. Proximos Pasos

1. **Revisar** este plan y el diagnostico (`01_Diagnostico_PWA_Actual.md`)
2. **Decidir** si usar `registerType: 'prompt'` (simplifica deteccion) o registro manual (mas control)
3. **Implementar** siguiendo el orden de tareas de la seccion 7
4. **Verificar** criterios de aceptacion de la seccion 6
5. **Desplegar** y validar en al menos 2 sucursales antes de rollout completo

---

**Documento anterior:** `01_Diagnostico_PWA_Actual.md` - Diagnostico completo del estado actual de la PWA.
