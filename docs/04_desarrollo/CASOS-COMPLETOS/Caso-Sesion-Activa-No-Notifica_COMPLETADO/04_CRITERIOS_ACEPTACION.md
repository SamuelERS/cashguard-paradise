# 04 - Criterios de Aceptacion

## Criterios Funcionales

### CA-01: Banner Visible con Sesion Activa
- **Precondicion:** Existe un registro en tabla `cortes` con estado `INICIADO` o `EN_PROGRESO`
- **Accion:** Usuario selecciona "Corte de Caja" en OperationSelector
- **Resultado esperado:** El wizard muestra banner informativo indicando sesion activa detectada
- **Verificacion:** Visual (screenshot) + Playwright automation

### CA-02: Banner NO Visible sin Sesion Activa
- **Precondicion:** No existen registros activos en tabla `cortes` (o Supabase no configurado)
- **Accion:** Usuario selecciona "Corte de Caja" en OperationSelector
- **Resultado esperado:** El wizard se abre normalmente SIN banner
- **Verificacion:** Visual + Playwright (verificar ausencia del banner)

### CA-03: Banner Persistente en Todos los Pasos
- **Precondicion:** Sesion activa detectada, wizard abierto con banner
- **Accion:** Usuario navega por pasos 1 a 5 del wizard
- **Resultado esperado:** Banner permanece visible en cada paso
- **Verificacion:** Navegacion completa con screenshots por paso

### CA-04: Pre-seleccion de Sucursal Preservada
- **Precondicion:** Sesion activa con `sucursal_id` = "sucursal-abc"
- **Accion:** Usuario llega al paso de seleccion de sucursal
- **Resultado esperado:** Sucursal ya seleccionada automaticamente (comportamiento existente preservado)
- **Verificacion:** Valor del dropdown coincide con sesion activa

### CA-05: Reanudacion Correcta Post-Wizard
- **Precondicion:** Sesion activa detectada, wizard completado
- **Accion:** `handleWizardComplete()` ejecuta
- **Resultado esperado:** Sistema reanuda sesion existente (NO crea nueva)
  - `syncEstado` = 'sincronizado'
  - NO se llama `iniciarCorte()` (sesion ya existe)
- **Verificacion:** Console log + Supabase query (no duplicados)

## Criterios Tecnicos

### CT-01: Zero `any` Types
- Toda nueva prop, parametro o variable debe tener tipo explicito
- Verificacion: `npx tsc --noEmit` retorna 0 errores

### CT-02: Build Exitoso
- `npm run build` debe completar sin errores
- Bundle size incremento maximo: +1 KB

### CT-03: Tests Existentes No Fallan
- `index.cashcut-routing.test.tsx` debe seguir pasando
- `index.stability.test.tsx` debe seguir pasando
- `index.sync-ux.test.tsx` debe seguir pasando

### CT-04: Graceful Degradation
- Sin Supabase configurado: App funciona sin banner (comportamiento actual)
- Con error de red: App funciona sin banner (graceful degradation existente)
- Banner es puramente informativo, no bloquea flujo

### CT-05: Comentarios Versionados
- Todo cambio debe incluir comentario `// [IA] - CASO-SANN: [descripcion]`
- Consistente con patron existente del proyecto

## Criterios UX

### CU-01: Texto Claro y Confiable
- El banner debe comunicar CLARAMENTE que la sesion se guardo
- Lenguaje positivo: "Se detecto una sesion activa" (no "Error" ni "Advertencia")
- Responde directamente la duda del usuario: "SI se guardo tu sesion"

### CU-02: Estilo Consistente
- Colores, tipografia y espaciado consistentes con el sistema de diseno
- Glass morphism compatible con el tema existente
- No debe interferir con la usabilidad del wizard

### CU-03: Responsive
- Banner debe ser legible en mobile (iPhone SE viewport 320px)
- No debe causar overflow horizontal
- Texto debe adaptarse a ancho disponible

## Checklist de Validacion Final

- [ ] CA-01: Banner visible con sesion activa
- [ ] CA-02: Banner ausente sin sesion activa
- [ ] CA-03: Banner persistente en todos los pasos
- [ ] CA-04: Pre-seleccion de sucursal preservada
- [ ] CA-05: Reanudacion correcta post-wizard
- [ ] CT-01: Zero `any` types (tsc --noEmit)
- [ ] CT-02: Build exitoso (npm run build)
- [ ] CT-03: Tests existentes pasan
- [ ] CT-04: Graceful degradation verificada
- [ ] CT-05: Comentarios versionados
- [ ] CU-01: Texto claro y confiable
- [ ] CU-02: Estilo consistente
- [ ] CU-03: Responsive mobile
