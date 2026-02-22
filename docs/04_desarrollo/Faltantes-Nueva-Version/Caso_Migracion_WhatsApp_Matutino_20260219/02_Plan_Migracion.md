# Plan de Migracion WhatsApp Matutino

**Caso:** Migracion WhatsApp Matutino
**Fecha:** 19 de febrero 2026
**Principio:** NO reinventar -- reutilizar `useWhatsAppReport` y seguir patron DRY
**Esfuerzo:** ~90 minutos implementacion + 4-6 horas testing
**Pre-requisito:** Leer 01_Diagnostico_Diferencias.md

---

## 1. Principio de Diseno

El hook compartido `useWhatsAppReport.ts` ya existe y encapsula toda la logica necesaria:
- 4 estados de control (`reportSent`, `whatsappOpened`, `popupBlocked`, `showWhatsAppInstructions`)
- Deteccion de plataforma movil/desktop
- Copia automatica al portapapeles con fallback
- Deteccion de popup bloqueado
- Confirmacion manual explicita

**La migracion consiste en reemplazar la logica inline duplicada por un import del hook.** No se escribe logica nueva.

---

## 2. Fases de Implementacion

### Fase 1: Migrar Controller Matutino (~30 minutos)

**Archivo:** `src/hooks/morning-verification/useMorningVerificationController.ts`

**Paso 1.1:** Importar el hook compartido

```typescript
import { useWhatsAppReport } from '@/hooks/useWhatsAppReport';
```

**Paso 1.2:** Reemplazar los 4 estados internos y helpers por el hook

Eliminar:
- `isMobilePlatform()` helper interno (lineas ~28-30)
- `buildWhatsAppUrl()` helper interno (lineas ~33-35)
- `copyReportToClipboard()` helper interno (lineas ~41-55)
- Estado `showWhatsAppInstructions` (linea ~88)
- Handler `handleWhatsAppSend` completo (lineas ~156-195)
- Cualquier estado duplicado de `reportSent`, `whatsappOpened`, `popupBlocked`

Reemplazar por:

```typescript
const {
  reportSent,
  whatsappOpened,
  popupBlocked,
  showWhatsAppInstructions,
  setShowWhatsAppInstructions,
  handleWhatsAppSend,
  handleConfirmSent,
  handleCopyToClipboard
} = useWhatsAppReport({
  generateReport: () => generateMorningReport(/* params existentes */),
  isDataReady: /* condicion existente de datos listos */
});
```

**Paso 1.3:** Verificar que el return del controller sigue exponiendo las mismas propiedades

El controller retorna un objeto que la vista consume. Verificar que las propiedades siguen igual:
- `showWhatsAppInstructions` -- ahora viene del hook
- `handleWhatsAppSend` -- ahora viene del hook
- `handleConfirmSent` -- ahora viene del hook
- `reportSent` -- ahora viene del hook

**Paso 1.4:** Build check

```bash
npx tsc --noEmit
```

Debe dar 0 errors.

---

### Fase 2: Migrar Componente Nocturno (~30 minutos)

**Archivo:** `src/components/CashCalculation.tsx`

**Paso 2.1:** Importar el hook compartido

```typescript
import { useWhatsAppReport } from '@/hooks/useWhatsAppReport';
```

**Paso 2.2:** Reemplazar la logica inline de WhatsApp

Eliminar:
- Los 4 estados declarados con `useState` para WhatsApp
- El handler `handleWhatsAppSend` inline completo
- El handler `handleConfirmSent` inline
- La logica de copia al portapapeles inline
- La deteccion de plataforma inline

Reemplazar por el mismo patron de destructuring del hook.

**Paso 2.3:** Verificar que el JSX sigue referenciando las mismas variables

Los botones y modales en el JSX de CashCalculation usan:
- `reportSent` para condicional de bloqueo de resultados
- `whatsappOpened` para estado del boton
- `popupBlocked` para banner de fallback
- `showWhatsAppInstructions` para `WhatsAppInstructionsModal`
- `handleWhatsAppSend` como onClick del boton principal
- `handleConfirmSent` como callback del modal

Estos nombres son los mismos que exporta el hook, asi que el JSX no deberia necesitar cambios.

**Paso 2.4:** Build check

```bash
npx tsc --noEmit
```

---

### Fase 3: Limpiar helpers muertos (~10 minutos)

Despues de ambas migraciones, verificar que no quedan imports o funciones sin usar:

```bash
npm run lint
```

Eliminar cualquier import muerto o funcion que ya no se llama.

---

### Fase 4: Testing Manual Desktop (~2-3 horas)

| # | Escenario | Matutino | Nocturno |
|---|-----------|----------|----------|
| 4.1 | Click "Enviar WhatsApp" en desktop | Modal instrucciones aparece | Modal instrucciones aparece |
| 4.2 | Reporte copiado automaticamente al portapapeles | Verificar con Cmd+V/Ctrl+V | Verificar con Cmd+V/Ctrl+V |
| 4.3 | Modal muestra pasos correctos (4 pasos) | Verificar texto | Verificar texto |
| 4.4 | Click "Ya lo envie" desbloquea resultados | Verificar transicion | Verificar transicion |
| 4.5 | Boton cambia estado a "Reporte Enviado" | Verificar texto y disabled | Verificar texto y disabled |
| 4.6 | Boton "Copiar" funciona como fallback | Verificar toast de confirmacion | Verificar toast de confirmacion |
| 4.7 | Bloqueo de resultados previo al envio | Verificar que resultados estan ocultos | Verificar que resultados estan ocultos |

### Fase 5: Testing Manual Mobile (~2-3 horas)

| # | Escenario | Matutino | Nocturno |
|---|-----------|----------|----------|
| 5.1 | Click "Enviar WhatsApp" en movil | WhatsApp se abre con reporte | WhatsApp se abre con reporte |
| 5.2 | Reporte pre-copiado al portapapeles | Verificar que ya esta copiado | Verificar que ya esta copiado |
| 5.3 | Popup bloqueado detectado | Toast de error + boton copiar habilitado | Toast de error + boton copiar habilitado |
| 5.4 | Confirmacion manual despues de enviar | Boton "Ya lo envie" funciona | Boton "Ya lo envie" funciona |
| 5.5 | Reenviar reporte (segundo intento) | Boton permite reenvio | Boton permite reenvio |

**Dispositivos recomendados para testing:**
- iPhone (Safari iOS) -- El dispositivo mas problematico historicamente
- Android (Chrome) -- El dispositivo principal de los cajeros

---

## 3. Referencia a Documentacion Existente

Para detalles de implementacion mas granulares, consultar la documentacion creada originalmente:

| Documento | Para que consultarlo |
|-----------|---------------------|
| `docs/Caso_Reporte_Final_WhatsApp_Apertura/2_PLAN_MIGRACION_PASO_A_PASO.md` | Detalles linea por linea de cada fase |
| `docs/Caso_Reporte_Final_WhatsApp_Apertura/3_CASOS_USO_VALIDACION.md` | 42 escenarios de validacion completos |
| `docs/Caso_Reporte_Final_WhatsApp_Apertura/4_COMPONENTES_REUSABLES.md` | Arquitectura de utilidades compartidas |

**Nota:** Esa documentacion fue creada cuando el matutino aun tenia la implementacion antigua. El contexto ha cambiado (el controller ya fue refactorizado) pero los escenarios de testing siguen siendo validos.

---

## 4. Criterios de Aceptacion

La migracion se considera exitosa cuando:

| Criterio | Verificacion |
|----------|-------------|
| 0 errors TypeScript | `npx tsc --noEmit` |
| 0 errores ESLint nuevos | `npm run lint` |
| Build exitoso | `npm run build` |
| Matutino Desktop: Modal instrucciones funciona | Testing manual |
| Matutino Mobile: WhatsApp se abre | Testing manual |
| Nocturno Desktop: Modal instrucciones funciona | Testing manual |
| Nocturno Mobile: WhatsApp se abre | Testing manual |
| Bloqueo de resultados funciona en ambos | Testing manual |
| Popup bloqueado detectado en ambos | Testing manual |
| Tests existentes pasan | `npm test` (via Docker) |
| Lineas de codigo duplicado eliminadas | Revisar diff: ~147 lineas menos |

---

## 5. Resumen de Esfuerzo

| Fase | Tiempo | Descripcion |
|------|--------|-------------|
| Fase 1 | 30 min | Migrar controller matutino a useWhatsAppReport |
| Fase 2 | 30 min | Migrar CashCalculation a useWhatsAppReport |
| Fase 3 | 10 min | Limpiar helpers e imports muertos |
| Fase 4 | 2-3 h | Testing manual desktop (ambos flujos) |
| Fase 5 | 2-3 h | Testing manual mobile (ambos flujos) |
| **Total** | **~5-7 h** | Implementacion rapida, testing exhaustivo |

---

## 6. Beneficios Post-Migracion

| Metrica | Antes | Despues |
|---------|-------|---------|
| Lineas de logica WhatsApp duplicada | ~147 (72 + 75) | 0 |
| Puntos de mantenimiento | 2 (matutino + nocturno) | 1 (hook compartido) |
| Consistencia comportamiento | Manual (esperando que coincidan) | Garantizada (mismo codigo) |
| Riesgo de divergencia | Alto (cada dev puede modificar uno sin el otro) | Cero (un solo archivo) |

---

*Documento creado: 19 de febrero 2026*
*Proyecto: CashGuard Paradise*
