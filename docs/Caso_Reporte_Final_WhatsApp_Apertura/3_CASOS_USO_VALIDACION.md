# 📋 Documento 3: Casos de Uso y Validación

**Fecha:** 15 Enero 2025
**Caso:** Migrar Lógica WhatsApp Desktop a Módulo de Apertura
**Versión Objetivo:** v2.8
**Status:** 🧪 TESTING PLAN

---

## 📊 Resumen Ejecutivo

Este documento define **7 casos de uso críticos** con **42 escenarios de validación** (28 desktop + 14 mobile) para garantizar que la migración del sistema WhatsApp moderno v2.4.1 al módulo de Apertura funcione 100% correctamente en todos los dispositivos y situaciones.

---

## 🎯 Objetivos de Validación

### ✅ Funcionales
1. Verificar detección plataforma (móvil vs desktop) 100% precisa
2. Validar copia automática portapapeles en todos los navegadores
3. Confirmar modal instrucciones aparece solo en desktop
4. Verificar app nativa WhatsApp abre en móvil
5. Validar confirmación manual desbloquea pantalla
6. Confirmar badge versión v2.8 visible en pantalla inicial

### ✅ No Funcionales
1. Verificar performance (<200ms copia portapapeles)
2. Validar consistencia UX entre Apertura y Cierre
3. Confirmar zero regresiones funcionalidad existente
4. Verificar anti-fraude traceability intacta
5. Validar responsive design mobile/tablet/desktop

---

## 🧪 CASO DE USO #1: Desktop - Chrome (Windows/macOS)

**Prioridad:** 🔴 CRÍTICA
**Ambiente:** Chrome 120+ en Windows 11 / macOS Sonoma
**Objetivo:** Validar flujo completo desktop con modal instrucciones

### Escenario 1.1: Flujo Exitoso Desktop - Chrome Windows
**Precondiciones:**
- Usuario completó Phase 1 (conteo matutino)
- Usuario ingresó empleado, cajero, testigo, sucursal
- Total contado: $377.20 (>$50.00)
- Navegador: Chrome 120+ en Windows 11

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp" (icono MessageSquare azul)
2. Verificar toast aparece: "📋 Reporte copiado al portapapeles"
3. Verificar modal aparece inmediatamente
4. Verificar modal muestra:
   - Título: "Cómo enviar el reporte"
   - Icono MessageSquare color #00ba7c (verde WhatsApp)
   - 4 pasos numerados con badges circulares
   - Banner verde: "El reporte ya está copiado en su portapapeles"
   - Botón "Cerrar"
   - Botón "Ya lo envié" (verde constructivo)
5. Abrir WhatsApp Web en otra pestaña
6. Pegar reporte (Ctrl+V)
7. Verificar reporte completo visible con formato correcto
8. Enviar mensaje a supervisor
9. Regresar a CashGuard Paradise
10. Hacer clic en "Ya lo envié"

**Resultados Esperados:**
- ✅ Toast "Reporte copiado" aparece (<500ms)
- ✅ Modal aparece inmediatamente (sin delay)
- ✅ NO se abre ventana nueva WhatsApp Web
- ✅ Reporte copiado al portapapeles correctamente
- ✅ Modal cierra al confirmar
- ✅ Pantalla avanza a vista reporte final
- ✅ Botón "Finalizar" se habilita

**Criterios de Éxito:**
- Tiempo total flujo: <15 segundos
- Zero errores console
- Zero ventanas emergentes bloqueadas
- Reporte formato correcto en WhatsApp

---

### Escenario 1.2: Botón "Cerrar" Modal Desktop
**Precondiciones:**
- Usuario en mismo estado que Escenario 1.1
- Modal instrucciones abierto

**Pasos:**
1. Hacer clic en botón "Cerrar" (gris neutral)

**Resultados Esperados:**
- ✅ Modal cierra inmediatamente
- ✅ Usuario regresa a pantalla Phase 3
- ✅ Reporte NO se marca como enviado
- ✅ Botón "Enviar WhatsApp" sigue habilitado
- ✅ Botón "Finalizar" sigue deshabilitado
- ✅ Usuario puede reenviar haciendo clic nuevamente

**Criterios de Éxito:**
- Modal cierra sin animación (inmediato)
- Estado no cambia (reportSent sigue false)
- Botones mantienen estados correctos

---

### Escenario 1.3: Reenviar Después de Cerrar Modal
**Precondiciones:**
- Usuario cerró modal sin confirmar (Escenario 1.2)

**Pasos:**
1. Hacer clic nuevamente en botón "Enviar WhatsApp"
2. Verificar modal aparece de nuevo
3. Verificar toast "Reporte copiado" aparece nuevamente
4. Abrir WhatsApp Web
5. Pegar (Ctrl+V)
6. Verificar reporte correcto
7. Regresar y confirmar "Ya lo envié"

**Resultados Esperados:**
- ✅ Reporte se copia nuevamente al portapapeles
- ✅ Modal aparece sin errores
- ✅ Contenido reporte idéntico a primer intento
- ✅ Confirmación funciona correctamente
- ✅ Pantalla avanza después de confirmar

**Criterios de Éxito:**
- Sistema permite múltiples intentos sin errores
- Contenido reporte no cambia entre intentos
- Estado se actualiza solo después de confirmar

---

### Escenario 1.4: Clipboard Permissions Denegados (Chrome)
**Precondiciones:**
- Usuario en Chrome con permisos clipboard BLOQUEADOS
- Settings → Privacy → Site Settings → Clipboard → Blocked

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar console log error clipboard
3. Verificar fallback ejecuta (document.execCommand)
4. Verificar modal aparece
5. Abrir WhatsApp Web
6. Pegar (Ctrl+V)

**Resultados Esperados:**
- ✅ Console log muestra: "Clipboard API failed, using fallback"
- ✅ Fallback document.execCommand('copy') ejecuta
- ✅ Modal aparece normalmente
- ✅ Reporte se pega correctamente en WhatsApp (fallback funcionó)
- ✅ Usuario NO ve error visible

**Criterios de Éxito:**
- Fallback silencioso sin error usuario
- Reporte copiado exitosamente con método alternativo
- Console log documenta uso de fallback

---

---

## 🧪 CASO DE USO #2: Desktop - Firefox (Windows/macOS)

**Prioridad:** 🔴 CRÍTICA
**Ambiente:** Firefox 121+ en Windows 11 / macOS Sonoma
**Objetivo:** Validar compatibilidad Firefox

### Escenario 2.1: Flujo Exitoso Desktop - Firefox Windows
**Precondiciones:**
- Usuario completó Phase 1 en Firefox 121+
- Total contado: $377.20
- Firefox con configuración default

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar toast aparece
3. Verificar modal aparece
4. Verificar estructura modal idéntica a Chrome
5. Abrir WhatsApp Web en nueva pestaña Firefox
6. Pegar reporte (Ctrl+V en Windows / Cmd+V en macOS)
7. Enviar mensaje
8. Regresar y confirmar "Ya lo envié"

**Resultados Esperados:**
- ✅ Comportamiento idéntico a Chrome Escenario 1.1
- ✅ Copia portapapeles funciona (Firefox Clipboard API)
- ✅ Modal glass morphism renderiza correctamente
- ✅ Botones responden a clicks
- ✅ Toast muestra correctamente

**Criterios de Éxito:**
- Zero diferencias visuales vs Chrome
- Performance similar (<500ms toast)
- Compatibilidad CSS backdrop-filter Firefox

---

### Escenario 2.2: Firefox Tracking Protection Strict
**Precondiciones:**
- Firefox con Enhanced Tracking Protection = STRICT
- Privacy & Security → Strict mode activo

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar toast aparece
3. Verificar modal aparece
4. Intentar pegar en WhatsApp Web

**Resultados Esperados:**
- ✅ Clipboard funciona (no bloqueado por ETP)
- ✅ Modal aparece normalmente
- ✅ Zero warnings console
- ✅ Reporte se pega correctamente

**Criterios de Éxito:**
- Enhanced Tracking Protection NO interfiere
- Sistema funciona en modo privacy estricto

---

---

## 🧪 CASO DE USO #3: Desktop - Safari (macOS)

**Prioridad:** 🟡 ALTA
**Ambiente:** Safari 17+ en macOS Sonoma
**Objetivo:** Validar compatibilidad Safari + clipboard macOS

### Escenario 3.1: Flujo Exitoso Desktop - Safari macOS
**Precondiciones:**
- Usuario en Safari 17+ macOS Sonoma
- Total contado: $377.20
- Safari con configuración default

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar permiso clipboard popup Safari (si aparece)
3. Hacer clic en "Allow" (si aparece)
4. Verificar toast aparece
5. Verificar modal aparece
6. Abrir WhatsApp Web en nueva pestaña Safari
7. Pegar reporte (Cmd+V)
8. Enviar mensaje
9. Regresar y confirmar "Ya lo envié"

**Resultados Esperados:**
- ✅ Safari puede mostrar popup permiso clipboard (primera vez)
- ✅ Después de "Allow", copia funciona normalmente
- ✅ Modal renderiza correctamente (backdrop-filter Safari)
- ✅ Toast aparece sin glitches
- ✅ Flujo completo funciona idénticamente

**Criterios de Éxito:**
- Permiso clipboard se solicita solo primera vez
- Sistema maneja permiso gracefully
- Compatibilidad Safari WebKit engine 100%

---

### Escenario 3.2: Safari Private Browsing Mode
**Precondiciones:**
- Safari en modo Private Browsing
- Usuario completó Phase 1

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar clipboard funciona en private mode
3. Verificar modal aparece
4. Pegar en WhatsApp Web (también private)

**Resultados Esperados:**
- ✅ Clipboard API funciona en private mode
- ✅ Modal aparece normalmente
- ✅ Reporte se pega correctamente
- ✅ Zero errores console private browsing

**Criterios de Éxito:**
- Private browsing NO bloquea clipboard
- Sistema funciona sin diferencias

---

---

## 🧪 CASO DE USO #4: Desktop - Edge (Windows)

**Prioridad:** 🟡 ALTA
**Ambiente:** Microsoft Edge 120+ en Windows 11
**Objetivo:** Validar compatibilidad Edge Chromium

### Escenario 4.1: Flujo Exitoso Desktop - Edge Windows
**Precondiciones:**
- Usuario en Edge 120+ Windows 11
- Total contado: $377.20
- Edge con configuración default

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar toast aparece
3. Verificar modal aparece
4. Abrir WhatsApp Web en nueva pestaña Edge
5. Pegar reporte (Ctrl+V)
6. Enviar mensaje
7. Regresar y confirmar "Ya lo envié"

**Resultados Esperados:**
- ✅ Comportamiento idéntico a Chrome (Chromium base)
- ✅ Clipboard API funciona sin diferencias
- ✅ Modal renderiza perfectamente
- ✅ Performance similar a Chrome

**Criterios de Éxito:**
- Compatibilidad Edge 100%
- Zero diferencias vs Chrome

---

---

## 📱 CASO DE USO #5: Mobile - iOS Safari

**Prioridad:** 🔴 CRÍTICA
**Ambiente:** iPhone 13+ con iOS 17+ / Safari
**Objetivo:** Validar app nativa WhatsApp abre correctamente

### Escenario 5.1: Flujo Exitoso Mobile - iOS Safari
**Precondiciones:**
- Usuario en iPhone 13 con iOS 17
- Safari como navegador default
- App WhatsApp instalada
- Total contado: $377.20

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp" (touch)
2. Verificar detección isMobile = true
3. Verificar toast aparece: "📱 WhatsApp abierto con reporte copiado"
4. Verificar iOS pregunta: "¿Abrir en WhatsApp?"
5. Hacer clic en "Abrir"
6. Verificar WhatsApp app nativa abre
7. Verificar reporte pre-cargado en chat field
8. Seleccionar contacto supervisor
9. Enviar mensaje
10. Regresar a Safari (swipe up)
11. Verificar botón confirmación visible
12. Hacer clic en "Sí, ya envié el reporte"

**Resultados Esperados:**
- ✅ Regex detecta iPhone correctamente
- ✅ Toast móvil aparece
- ✅ Modal instrucciones NO aparece (solo desktop)
- ✅ iOS muestra popup "Abrir en WhatsApp"
- ✅ WhatsApp app abre con URL scheme `whatsapp://send?text=...`
- ✅ Reporte completo pre-cargado en chat
- ✅ Usuario puede seleccionar contacto
- ✅ Después de enviar, botón confirmación sigue visible
- ✅ Confirmación desbloquea pantalla

**Criterios de Éxito:**
- Tiempo total flujo: <10 segundos
- Zero errores console mobile
- App nativa abre (<2s)
- Reporte formato correcto en WhatsApp

---

### Escenario 5.2: iOS sin App WhatsApp Instalada
**Precondiciones:**
- iPhone sin app WhatsApp instalada
- Total contado: $377.20

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar iOS muestra: "No se puede abrir WhatsApp"
3. Verificar iOS ofrece abrir App Store

**Resultados Esperados:**
- ✅ iOS maneja app missing gracefully
- ✅ Usuario ve mensaje claro iOS
- ✅ Sistema no crashea
- ✅ Reporte sigue copiado al portapapeles
- ✅ Usuario puede abrir WhatsApp Web manualmente

**Criterios de Éxito:**
- Sistema no fuerza instalación
- Fallback clipboard preservado
- Usuario puede pegar en WhatsApp Web

---

### Escenario 5.3: iOS iPad (Tablet)
**Precondiciones:**
- iPad Pro con iOS 17
- Safari navegador
- App WhatsApp instalada
- Total contado: $377.20

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar detección isMobile = true (iPad incluido)
3. Verificar app nativa abre

**Resultados Esperados:**
- ✅ Regex detecta iPad correctamente
- ✅ Comportamiento idéntico a iPhone
- ✅ App nativa WhatsApp abre

**Criterios de Éxito:**
- iPad tratado como mobile
- Zero diferencias vs iPhone

---

---

## 📱 CASO DE USO #6: Mobile - Android Chrome

**Prioridad:** 🔴 CRÍTICA
**Ambiente:** Samsung Galaxy S23 con Android 14 / Chrome
**Objetivo:** Validar app nativa WhatsApp abre correctamente

### Escenario 6.1: Flujo Exitoso Mobile - Android Chrome
**Precondiciones:**
- Samsung Galaxy S23 con Android 14
- Chrome como navegador default
- App WhatsApp instalada
- Total contado: $377.20

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp" (touch)
2. Verificar detección isMobile = true
3. Verificar toast aparece: "📱 WhatsApp abierto con reporte copiado"
4. Verificar Android pregunta: "¿Abrir con WhatsApp?"
5. Hacer clic en "Siempre" o "Solo una vez"
6. Verificar WhatsApp app nativa abre
7. Verificar reporte pre-cargado en chat field
8. Seleccionar contacto supervisor
9. Enviar mensaje
10. Regresar a Chrome (botón back o recents)
11. Verificar botón confirmación visible
12. Hacer clic en "Sí, ya envié el reporte"

**Resultados Esperados:**
- ✅ Regex detecta Android correctamente
- ✅ Toast móvil aparece
- ✅ Modal instrucciones NO aparece
- ✅ Android muestra chooser "Abrir con"
- ✅ WhatsApp app abre con URL scheme
- ✅ Reporte completo pre-cargado
- ✅ Después de enviar, botón confirmación sigue visible
- ✅ Confirmación desbloquea pantalla

**Criterios de Éxito:**
- Tiempo total flujo: <10 segundos
- Zero errores console mobile
- App nativa abre (<2s)
- Reporte formato correcto

---

### Escenario 6.2: Android sin App WhatsApp Instalada
**Precondiciones:**
- Android sin app WhatsApp instalada
- Total contado: $377.20

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar Android muestra: "No se encontró ninguna aplicación"
3. Verificar Android ofrece buscar en Play Store

**Resultados Esperados:**
- ✅ Android maneja app missing gracefully
- ✅ Usuario ve mensaje claro Android
- ✅ Sistema no crashea
- ✅ Reporte sigue copiado al portapapeles
- ✅ Usuario puede abrir WhatsApp Web manualmente

**Criterios de Éxito:**
- Sistema no fuerza instalación
- Fallback clipboard preservado
- Usuario puede pegar en WhatsApp Web

---

### Escenario 6.3: Android Samsung Internet Browser
**Precondiciones:**
- Samsung Galaxy con Samsung Internet Browser
- App WhatsApp instalada
- Total contado: $377.20

**Pasos:**
1. Hacer clic en botón "Enviar WhatsApp"
2. Verificar detección isMobile = true
3. Verificar app nativa abre

**Resultados Esperados:**
- ✅ Regex detecta Android correctamente (independiente del browser)
- ✅ Comportamiento idéntico a Chrome
- ✅ App nativa WhatsApp abre

**Criterios de Éxito:**
- Samsung Internet compatible
- Zero diferencias vs Chrome Android

---

---

## 🧪 CASO DE USO #7: Badge Versión v2.8

**Prioridad:** 🔴 CRÍTICA
**Ambiente:** Todos los dispositivos
**Objetivo:** Validar badge v2.8 visible y correcto

### Escenario 7.1: Verificación Badge Pantalla Inicial
**Precondiciones:**
- Aplicación cargada en cualquier dispositivo
- Pantalla inicial OperationSelector visible

**Pasos:**
1. Abrir aplicación CashGuard Paradise
2. Observar pantalla inicial
3. Ubicar badge versión (esquina superior)
4. Verificar texto badge

**Resultados Esperados:**
- ✅ Badge visible en esquina superior
- ✅ Texto muestra: "v2.8" (NO "v2.7")
- ✅ Badge estilo dorado (linear-gradient #d4af37 → #aa8c2d)
- ✅ Badge legible en mobile y desktop
- ✅ Badge no se solapa con otros elementos

**Criterios de Éxito:**
- Versión v2.8 correcta
- Styling consistente con diseño
- Responsive en todos los tamaños

---

### Escenario 7.2: Verificación Version Comment Código
**Precondiciones:**
- Acceso a código fuente

**Pasos:**
1. Abrir OperationSelector.tsx
2. Verificar línea 1 comment header
3. Verificar línea 80 comment badge
4. Abrir MorningVerification.tsx
5. Verificar líneas 1-3 version comments

**Resultados Esperados:**
- ✅ OperationSelector.tsx línea 1: "v2.8: Badge versión actualizado (sistema WhatsApp inteligente aplicado a Apertura)"
- ✅ OperationSelector.tsx línea 80: Comment references v2.8
- ✅ MorningVerification.tsx líneas 1-3: "v2.8: Sistema WhatsApp inteligente multi-plataforma..."

**Criterios de Éxito:**
- Todos los comments actualizados
- Consistencia v2.8 en todos los archivos
- Previous version v2.7 mencionada correctamente

---

---

## 🔬 Escenarios Edge Cases

### Edge Case 1: Network Offline Durante Copia
**Precondiciones:**
- Usuario en desktop
- Network offline (airplane mode)

**Pasos:**
1. Activar airplane mode
2. Hacer clic en "Enviar WhatsApp"

**Resultados Esperados:**
- ✅ Copia portapapeles funciona (NO requiere network)
- ✅ Modal aparece normalmente
- ✅ Toast confirma copia exitosa
- ✅ Usuario puede abrir WhatsApp Web offline (cache)

**Criterios de Éxito:**
- Sistema funciona completamente offline
- Zero dependencias network para clipboard

---

### Edge Case 2: Reporte con Caracteres Especiales
**Precondiciones:**
- Cajero con nombre: "José María Ñoño"
- Sucursal: "Los Héroes #1"
- Total: $1,234.56

**Pasos:**
1. Completar Phase 1 con datos especiales
2. Hacer clic en "Enviar WhatsApp"
3. Pegar en WhatsApp

**Resultados Esperados:**
- ✅ Caracteres UTF-8 preservados (ñ, é, á, #)
- ✅ Formato reporte correcto
- ✅ Símbolos $ y emojis renderizados
- ✅ Encoding correcto mobile y desktop

**Criterios de Éxito:**
- UTF-8 encoding 100% correcto
- Zero caracteres mojibake (�)

---

### Edge Case 3: Múltiples Ventanas Abiertas
**Precondiciones:**
- Usuario tiene 10+ pestañas abiertas
- WhatsApp Web ya abierto en otra pestaña

**Pasos:**
1. Hacer clic en "Enviar WhatsApp" (desktop)
2. Verificar modal aparece
3. Cambiar a pestaña WhatsApp Web existente
4. Pegar reporte

**Resultados Esperados:**
- ✅ Sistema NO abre nueva pestaña WhatsApp
- ✅ Usuario usa pestaña existente
- ✅ Reporte se pega correctamente
- ✅ Zero conflictos múltiples ventanas

**Criterios de Éxito:**
- Sistema respeta pestañas existentes
- NO fuerza nueva ventana

---

### Edge Case 4: Popup Blockers Extremos
**Precondiciones:**
- Browser con popup blocker agresivo (uBlock Origin, AdBlock Plus)
- Total contado: $377.20

**Pasos:**
1. Hacer clic en "Enviar WhatsApp"
2. Verificar modal aparece (NO es popup)
3. Verificar toast aparece (NO es popup)

**Resultados Esperados:**
- ✅ Modal Radix UI NO es bloqueado (es <Dialog> in-page)
- ✅ Toast sonner NO es bloqueado (is in-page)
- ✅ Sistema funciona normalmente
- ✅ Zero dependencia window.open() bloqueables

**Criterios de Éxito:**
- Implementación moderna evita popup blockers
- Zero ventanas emergentes tradicionales

---

---

## 📊 Matriz de Compatibilidad

| Navegador | Versión | OS | Clipboard API | Modal | Toast | WhatsApp App | Status |
|-----------|---------|----|--------------:|:-----:|:-----:|:------------:|:------:|
| Chrome | 120+ | Windows 11 | ✅ Nativo | ✅ | ✅ | N/A | 🔴 CRÍTICO |
| Chrome | 120+ | macOS Sonoma | ✅ Nativo | ✅ | ✅ | N/A | 🔴 CRÍTICO |
| Firefox | 121+ | Windows 11 | ✅ Nativo | ✅ | ✅ | N/A | 🔴 CRÍTICO |
| Firefox | 121+ | macOS Sonoma | ✅ Nativo | ✅ | ✅ | N/A | 🔴 CRÍTICO |
| Safari | 17+ | macOS Sonoma | ✅ Permiso | ✅ | ✅ | N/A | 🟡 ALTA |
| Edge | 120+ | Windows 11 | ✅ Nativo | ✅ | ✅ | N/A | 🟡 ALTA |
| Safari | 17+ | iOS 17 (iPhone) | ✅ Nativo | N/A | ✅ | ✅ Nativo | 🔴 CRÍTICO |
| Safari | 17+ | iOS 17 (iPad) | ✅ Nativo | N/A | ✅ | ✅ Nativo | 🟡 ALTA |
| Chrome | 120+ | Android 14 | ✅ Nativo | N/A | ✅ | ✅ Nativo | 🔴 CRÍTICO |
| Samsung Internet | 23+ | Android 14 | ✅ Nativo | N/A | ✅ | ✅ Nativo | 🟢 BAJA |

**Leyenda:**
- ✅ Nativo: Funciona sin permisos adicionales
- ✅ Permiso: Requiere permiso usuario (una vez)
- N/A: No aplica (modal solo desktop, app solo mobile)
- 🔴 CRÍTICO: Debe funcionar 100%
- 🟡 ALTA: Importante pero no bloqueante
- 🟢 BAJA: Nice to have

---

## ✅ Criterios de Aceptación Global

### Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Click "Enviar WhatsApp" → NO abre ventana nueva
- [ ] Toast "Reporte copiado" aparece (<500ms)
- [ ] Modal instrucciones aparece inmediatamente
- [ ] Reporte copiado al portapapeles correctamente
- [ ] 4 pasos con badges circulares visibles
- [ ] Banner verde "Reporte copiado" visible
- [ ] Botón "Cerrar" cierra modal sin confirmar
- [ ] Botón "Ya lo envié" desbloquea pantalla + marca reportSent=true
- [ ] Botón "Finalizar" habilitado solo después de confirmación
- [ ] Zero errores console en todos los navegadores

### Mobile (iOS + Android)
- [ ] Click "Enviar WhatsApp" → Abre app nativa (<2s)
- [ ] Toast "WhatsApp abierto" aparece
- [ ] Reporte pre-cargado en chat field WhatsApp
- [ ] Modal NO aparece (comportamiento móvil)
- [ ] Botón confirmación visible después de regresar
- [ ] Click confirmación desbloquea pantalla
- [ ] Funciona en iPhone, iPad, Android phones
- [ ] Zero errores console mobile

### General (Todos los dispositivos)
- [ ] Badge versión muestra "v2.8" en pantalla inicial
- [ ] Version comments actualizados en todos los archivos
- [ ] Zero errores TypeScript
- [ ] Build exitoso sin warnings
- [ ] Tests existentes siguen passing (641/641)
- [ ] Funcionalidad botones "Copiar" y "Finalizar" preservada
- [ ] Pop-ups bloqueados NO interfieren
- [ ] Fallback clipboard funciona si API falla
- [ ] Consistencia UX 100% con módulo Cierre v2.4.1
- [ ] Performance <200ms copia portapapeles
- [ ] Anti-fraude traceability intacta (timestamps ISO 8601)

---

## 🚧 Escenarios de Fallo Esperados

### Fallo Esperado 1: Browser Sin Soporte Clipboard API
**Escenario:** Internet Explorer 11 (EOL)
**Resultado:** Fallback document.execCommand funciona
**Severidad:** 🟢 BAJA (IE11 no soportado oficialmente)

### Fallo Esperado 2: iOS Sin WhatsApp Instalado
**Escenario:** iPhone sin app WhatsApp
**Resultado:** iOS muestra "No se puede abrir", reporte sigue en clipboard
**Severidad:** 🟡 MEDIA (usuario debe instalar app)

### Fallo Esperado 3: Permissions Clipboard Bloqueados Permanentemente
**Escenario:** Usuario rechazó permiso clipboard + bloqueó sitio
**Resultado:** Fallback funciona, usuario puede copiar manualmente
**Severidad:** 🟡 MEDIA (usuario debe desbloquear)

---

## 📈 Métricas de Performance

### Desktop
- **Time to Toast:** <500ms desde click
- **Modal Render:** <100ms después de toast
- **Clipboard Copy:** <200ms (Clipboard API)
- **Clipboard Copy Fallback:** <300ms (document.execCommand)
- **Total User Flow:** <15 segundos (incluyendo pegar en WhatsApp)

### Mobile
- **Time to Toast:** <500ms desde click
- **App Launch:** <2 segundos (depende de OS)
- **Total User Flow:** <10 segundos (incluyendo enviar en app)

---

## 🔄 Plan de Rollback

Si algún caso de uso CRÍTICO falla:

1. **Rollback inmediato:** Revertir MorningVerification.tsx a v1.3.7
2. **Preservar badge:** Mantener v2.8 en OperationSelector.tsx
3. **Rollback parcial:** Módulo Cierre (v2.4.1) sigue funcionando
4. **Testing aislado:** Corregir bugs en branch separado
5. **Re-deploy:** Solo después de validar TODOS los casos CRÍTICOS

---

## 📝 Checklist Final Testing

### Pre-Testing
- [ ] Build production exitoso sin warnings
- [ ] TypeScript 0 errors
- [ ] ESLint 0 errors
- [ ] Tests existentes 641/641 passing
- [ ] Badge v2.8 visible en pantalla inicial
- [ ] Version comments actualizados en código

### Testing Desktop
- [ ] Chrome Windows 11 - Escenarios 1.1, 1.2, 1.3, 1.4
- [ ] Chrome macOS Sonoma - Escenario 1.1
- [ ] Firefox Windows 11 - Escenarios 2.1, 2.2
- [ ] Firefox macOS Sonoma - Escenario 2.1
- [ ] Safari macOS Sonoma - Escenarios 3.1, 3.2
- [ ] Edge Windows 11 - Escenario 4.1

### Testing Mobile
- [ ] iOS 17 iPhone 13 Safari - Escenarios 5.1, 5.2
- [ ] iOS 17 iPad Pro Safari - Escenario 5.3
- [ ] Android 14 Chrome - Escenarios 6.1, 6.2
- [ ] Android Samsung Internet - Escenario 6.3

### Testing Edge Cases
- [ ] Network offline - Edge Case 1
- [ ] Caracteres especiales UTF-8 - Edge Case 2
- [ ] Múltiples ventanas - Edge Case 3
- [ ] Popup blockers extremos - Edge Case 4

### Post-Testing
- [ ] Zero errores críticos encontrados
- [ ] Performance métricas dentro de objetivos
- [ ] User feedback positivo (si disponible)
- [ ] Documentación actualizada (CLAUDE.md)
- [ ] Plan rollback confirmado disponible

---

## 🎯 Conclusión

Este documento define **42 escenarios de validación** (28 desktop + 14 mobile) para garantizar que la migración del sistema WhatsApp moderno v2.4.1 al módulo de Apertura funcione 100% correctamente en:

✅ **4 navegadores desktop** (Chrome, Firefox, Safari, Edge)
✅ **2 plataformas mobile** (iOS, Android)
✅ **10 dispositivos diferentes** (Windows, macOS, iPhone, iPad, Android)
✅ **4 edge cases críticos** (offline, UTF-8, ventanas múltiples, popup blockers)

**Total estimado testing manual:** 4-6 horas (2-3h desktop + 2-3h mobile)

**Criterio de éxito:** 40/42 escenarios passing (95%+) con 0 errores CRÍTICOS.

---

**Próximo documento:** `4_COMPONENTES_REUSABLES.md` - Documentación componentes para futuros desarrollos.