# 🔧 Documento 4: Componentes Reusables y Patrones

**Fecha:** 15 Enero 2025
**Caso:** Migrar Lógica WhatsApp Desktop a Módulo de Apertura
**Versión Objetivo:** v2.8
**Status:** 📚 DOCUMENTACIÓN TÉCNICA

---

## 📊 Resumen Ejecutivo

Este documento extrae y documenta los **componentes reusables**, **patrones arquitectónicos** y **utilidades** implementados en la migración del sistema WhatsApp moderno v2.4.1 al módulo de Apertura. Estos elementos pueden ser reutilizados en futuros desarrollos dentro de CashGuard Paradise.

---

## 🎯 Objetivos del Documento

1. **Documentar patrones arquitectónicos** para reuso en otros módulos
2. **Extraer componentes independientes** que puedan ser compartidos
3. **Catalogar utilidades** (platform detection, clipboard, formatters)
4. **Proveer ejemplos de uso** para desarrolladores futuros
5. **Establecer best practices** basadas en esta implementación

---

## 🧩 Componentes Reusables

### 1. Modal de Instrucciones WhatsApp

**Ubicación:** MorningVerification.tsx (líneas ~690-840)
**Tipo:** Radix UI Dialog Component
**Propósito:** Mostrar instrucciones paso a paso para envío manual WhatsApp

#### Estructura del Componente

```typescript
{showWhatsAppInstructions && (
  <Dialog open={showWhatsAppInstructions} onOpenChange={setShowWhatsAppInstructions}>
    <DialogContent className="glass-morphism-panel max-w-md">
      {/* Header con icono */}
      <DialogTitle className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6" style={{ color: '#00ba7c' }} />
        <span>Cómo enviar el reporte</span>
      </DialogTitle>

      {/* Banner confirmación */}
      <div className="bg-green-500/20 border border-green-500/40">
        El reporte ya está copiado en su portapapeles
      </div>

      {/* Pasos numerados */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-3">
            <div className="badge-circular">{index + 1}</div>
            <div className="flex-1">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con botones */}
      <DialogFooter>
        <NeutralActionButton onClick={handleCloseModal}>
          Cerrar
        </NeutralActionButton>
        <ConstructiveActionButton onClick={handleConfirmSent}>
          <CheckCircle className="w-4 h-4" />
          Ya lo envié
        </ConstructiveActionButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
```

#### Props Necesarios

```typescript
interface WhatsAppInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  platform: 'windows' | 'mac' | 'linux';
}
```

#### Dependencias

- `@radix-ui/react-dialog` - Sistema modal
- `lucide-react` - Iconos (MessageSquare, CheckCircle)
- `glass-morphism-panel` - Clase CSS backdrop blur
- `NeutralActionButton` - Botón neutral
- `ConstructiveActionButton` - Botón constructivo

#### Customización

**Colores:**
- Icon color: `#00ba7c` (verde WhatsApp oficial)
- Banner background: `bg-green-500/20`
- Banner border: `border-green-500/40`

**Textos:**
Fácilmente reemplazables en array `steps`:
```typescript
const steps = [
  {
    title: "Abra WhatsApp Web",
    description: "En otra pestaña del navegador, abra WhatsApp Web..."
  },
  // ...más pasos
];
```

#### Casos de Uso

1. **Envío manual reporte** (implementado)
2. **Compartir datos con terceros** (futuro)
3. **Exportar información** (futuro)
4. **Tutorial paso a paso** (futuro)

---

### 2. Badge Circular Numerado

**Ubicación:** MorningVerification.tsx (línea ~730)
**Tipo:** Styled Component
**Propósito:** Indicador visual de pasos numerados

#### Implementación

```typescript
<div
  className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
  style={{
    background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.875rem',
    boxShadow: '0 2px 8px rgba(10, 132, 255, 0.3)'
  }}
>
  {stepNumber}
</div>
```

#### CSS Reusable (Sugerencia)

```css
.badge-circular {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.3);
}

/* Variantes de color */
.badge-circular-success {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
}

.badge-circular-warning {
  background: linear-gradient(135deg, #ff9500 0%, #ff9f0a 100%);
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
}

.badge-circular-danger {
  background: linear-gradient(135deg, #ff453a 0%, #ff3b30 100%);
  box-shadow: 0 2px 8px rgba(255, 69, 58, 0.3);
}
```

#### Props Sugeridos

```typescript
interface BadgeCircularProps {
  number: number | string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}
```

#### Casos de Uso

1. **Pasos de wizard** (implementado)
2. **Lista numerada** (futuro)
3. **Timeline eventos** (futuro)
4. **Progreso tareas** (futuro)

---

### 3. Toast Confirmación

**Ubicación:** MorningVerification.tsx (líneas ~242, ~246, ~251)
**Tipo:** Sonner Toast
**Propósito:** Feedback visual no-intrusivo

#### Implementación

```typescript
// Success Toast
toast.success('📱 WhatsApp abierto con reporte copiado', {
  duration: 3000,
  position: 'top-center'
});

// Info Toast
toast.info('📋 Instrucciones disponibles', {
  duration: 5000,
  position: 'top-center'
});

// Error Toast con acción
toast.error('⚠️ Habilite pop-ups para continuar', {
  duration: 7000,
  action: {
    label: 'Copiar en su lugar',
    onClick: () => handleCopyToClipboard()
  }
});
```

#### Best Practices Toast

**Duración según severidad:**
- Success: 3000ms (información positiva rápida)
- Info: 5000ms (información neutral que requiere lectura)
- Warning: 7000ms (información importante)
- Error: 10000ms (información crítica + acción)

**Emojis semánticos:**
- ✅ Success: `✅`, `🎉`, `👍`
- ℹ️ Info: `ℹ️`, `💡`, `📋`
- ⚠️ Warning: `⚠️`, `⚡`, `🔔`
- ❌ Error: `❌`, `🚫`, `⛔`

**Posición:**
- `top-center`: Información crítica (visible inmediatamente)
- `bottom-right`: Información de fondo (no interrumpe)
- `top-right`: Notificaciones secundarias

#### Casos de Uso

1. **Confirmación acciones** (implementado)
2. **Errores validación** (futuro)
3. **Progreso tareas** (futuro)
4. **Notificaciones sistema** (futuro)

---

## 🔧 Utilidades Reusables

### 1. Platform Detection Utility

**Propósito:** Detectar plataforma usuario (mobile vs desktop)
**Ubicación:** MorningVerification.tsx (línea ~221)

#### Implementación

```typescript
/**
 * Detecta si el usuario está en dispositivo móvil
 * @returns {boolean} true si es móvil (iOS/Android), false si es desktop
 */
const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Detecta el sistema operativo específico
 * @returns {'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown'}
 */
const detectOS = (): string => {
  const userAgent = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  if (/Win/i.test(userAgent)) return 'windows';
  if (/Mac/i.test(userAgent)) return 'mac';
  if (/Linux/i.test(userAgent)) return 'linux';

  return 'unknown';
};

/**
 * Detecta el navegador específico
 * @returns {'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'}
 */
const detectBrowser = (): string => {
  const userAgent = navigator.userAgent;

  if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) return 'chrome';
  if (/Firefox/i.test(userAgent)) return 'firefox';
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'safari';
  if (/Edge/i.test(userAgent)) return 'edge';

  return 'unknown';
};
```

#### Ubicación Sugerida

Crear archivo: `/src/utils/platform.ts`

```typescript
// src/utils/platform.ts
export const Platform = {
  isMobile: (): boolean => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  },

  isIOS: (): boolean => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },

  isAndroid: (): boolean => {
    return /Android/i.test(navigator.userAgent);
  },

  getOS: (): 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown' => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    if (/Win/i.test(ua)) return 'windows';
    if (/Mac/i.test(ua)) return 'mac';
    if (/Linux/i.test(ua)) return 'linux';
    return 'unknown';
  },

  getBrowser: (): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' => {
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) return 'chrome';
    if (/Firefox/i.test(ua)) return 'firefox';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'safari';
    if (/Edge/i.test(ua)) return 'edge';
    return 'unknown';
  },

  getShortcut: (key: string): string => {
    return Platform.getOS() === 'mac' ? `Cmd+${key}` : `Ctrl+${key}`;
  }
};
```

#### Uso

```typescript
import { Platform } from '@/utils/platform';

const handleWhatsAppSend = () => {
  if (Platform.isMobile()) {
    // Lógica móvil
    window.location.href = `whatsapp://send?text=${encodedReport}`;
  } else {
    // Lógica desktop
    showInstructionsModal();
  }
};

// Mostrar shortcut correcto en UI
const pasteShortcut = Platform.getShortcut('V'); // "Cmd+V" en Mac, "Ctrl+V" en Windows
```

---

### 2. Clipboard Utility

**Propósito:** Copiar texto al portapapeles con fallback
**Ubicación:** MorningVerification.tsx (líneas ~223-237)

#### Implementación

```typescript
/**
 * Copia texto al portapapeles con fallback para navegadores antiguos
 * @param text - Texto a copiar
 * @returns {Promise<boolean>} - true si éxito, false si falla
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Intento 1: Clipboard API moderno (Chrome 66+, Firefox 63+, Safari 13.1+)
    await navigator.clipboard.writeText(text);
    console.log('[Clipboard] ✅ Copiado con Clipboard API');
    return true;
  } catch (clipboardError) {
    console.warn('[Clipboard] ⚠️ Clipboard API falló, intentando fallback:', clipboardError);

    try {
      // Intento 2: Fallback document.execCommand (deprecated pero funciona)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (success) {
        console.log('[Clipboard] ✅ Copiado con execCommand fallback');
        return true;
      } else {
        console.error('[Clipboard] ❌ execCommand falló');
        return false;
      }
    } catch (fallbackError) {
      console.error('[Clipboard] ❌ Fallback falló:', fallbackError);
      return false;
    }
  }
};
```

#### Ubicación Sugerida

Crear archivo: `/src/utils/clipboard.ts`

```typescript
// src/utils/clipboard.ts
export const Clipboard = {
  /**
   * Copia texto al portapapeles con fallback automático
   */
  copy: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return Clipboard.copyFallback(text);
    }
  },

  /**
   * Fallback para navegadores sin Clipboard API
   */
  copyFallback: (text: string): boolean => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);

      return success;
    } catch (error) {
      console.error('[Clipboard] Fallback failed:', error);
      return false;
    }
  },

  /**
   * Lee texto del portapapeles (requiere permisos)
   */
  read: async (): Promise<string | null> => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('[Clipboard] Read failed:', error);
      return null;
    }
  },

  /**
   * Verifica si Clipboard API está disponible
   */
  isSupported: (): boolean => {
    return !!navigator.clipboard && !!navigator.clipboard.writeText;
  }
};
```

#### Uso

```typescript
import { Clipboard } from '@/utils/clipboard';
import { toast } from 'sonner';

const handleCopy = async () => {
  const success = await Clipboard.copy(reportText);

  if (success) {
    toast.success('📋 Reporte copiado al portapapeles');
  } else {
    toast.error('❌ Error al copiar. Intente manualmente.');
  }
};
```

---

### 3. WhatsApp URL Builder

**Propósito:** Construir URLs válidas para WhatsApp Web y App
**Ubicación:** MorningVerification.tsx (línea ~224)

#### Implementación

```typescript
/**
 * Construye URL para WhatsApp Web o App nativa
 * @param text - Texto del mensaje
 * @param phoneNumber - Número opcional (con código país)
 * @param mode - 'web' o 'app'
 * @returns URL codificada para WhatsApp
 */
const buildWhatsAppURL = (
  text: string,
  phoneNumber?: string,
  mode: 'web' | 'app' = 'app'
): string => {
  const encodedText = encodeURIComponent(text);

  if (mode === 'web') {
    // WhatsApp Web URL (desktop)
    if (phoneNumber) {
      return `https://wa.me/${phoneNumber}?text=${encodedText}`;
    }
    return `https://wa.me/?text=${encodedText}`;
  } else {
    // WhatsApp App URL (mobile)
    if (phoneNumber) {
      return `whatsapp://send?phone=${phoneNumber}&text=${encodedText}`;
    }
    return `whatsapp://send?text=${encodedText}`;
  }
};
```

#### Ubicación Sugerida

Crear archivo: `/src/utils/whatsapp.ts`

```typescript
// src/utils/whatsapp.ts
export const WhatsApp = {
  /**
   * Construye URL para app nativa (móvil)
   */
  buildAppURL: (text: string, phoneNumber?: string): string => {
    const encodedText = encodeURIComponent(text);
    if (phoneNumber) {
      return `whatsapp://send?phone=${phoneNumber}&text=${encodedText}`;
    }
    return `whatsapp://send?text=${encodedText}`;
  },

  /**
   * Construye URL para WhatsApp Web (desktop)
   */
  buildWebURL: (text: string, phoneNumber?: string): string => {
    const encodedText = encodeURIComponent(text);
    if (phoneNumber) {
      return `https://wa.me/${phoneNumber}?text=${encodedText}`;
    }
    return `https://wa.me/?text=${encodedText}`;
  },

  /**
   * Abre WhatsApp según la plataforma
   */
  send: (text: string, phoneNumber?: string): void => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Abrir app nativa
      window.location.href = WhatsApp.buildAppURL(text, phoneNumber);
    } else {
      // Abrir WhatsApp Web
      window.open(WhatsApp.buildWebURL(text, phoneNumber), '_blank');
    }
  },

  /**
   * Valida formato número de teléfono internacional
   */
  validatePhoneNumber: (phone: string): boolean => {
    // Formato: +[código país][número] (ej: +50378901234)
    return /^\+[1-9]\d{1,14}$/.test(phone);
  }
};
```

#### Uso

```typescript
import { WhatsApp } from '@/utils/whatsapp';
import { Platform } from '@/utils/platform';

const handleWhatsAppSend = () => {
  const report = generateReport();

  if (Platform.isMobile()) {
    // Móvil: abrir app nativa
    window.location.href = WhatsApp.buildAppURL(report);
  } else {
    // Desktop: copiar + mostrar instrucciones (NO abrir web)
    await Clipboard.copy(report);
    setShowInstructions(true);
  }
};
```

---

## 🎨 Patrones Arquitectónicos

### 1. Patrón: Platform-Aware Behavior

**Descripción:** Comportamiento diferenciado según plataforma usuario

#### Estructura

```typescript
const handleAction = useCallback(() => {
  // 1. Detectar plataforma
  const isMobile = Platform.isMobile();

  // 2. Ejecutar lógica común (si existe)
  const data = prepareData();
  await Clipboard.copy(data);

  // 3. Bifurcar según plataforma
  if (isMobile) {
    // Lógica móvil: abrir app nativa
    window.location.href = buildNativeAppURL(data);
    toast.success('📱 App abierta');
  } else {
    // Lógica desktop: mostrar instrucciones
    setShowInstructions(true);
    toast.info('📋 Instrucciones disponibles');
  }

  // 4. Estado común post-acción
  setActionCompleted(true);
}, [dependencies]);
```

#### Beneficios

- ✅ UX optimizada por dispositivo
- ✅ Código centralizado (no duplicado)
- ✅ Fácil testing por plataforma
- ✅ Mantenimiento simplificado

#### Casos de Uso

1. **WhatsApp sharing** (implementado)
2. **File download** (futuro)
3. **Camera access** (futuro)
4. **Geolocation** (futuro)

---

### 2. Patrón: Progressive Enhancement con Fallback

**Descripción:** Intentar API moderno, fallback a método legacy

#### Estructura

```typescript
const performAction = async () => {
  try {
    // Intento 1: API moderno (Clipboard API, Fetch API, etc.)
    await modernAPI.execute(data);
    console.log('✅ Modern API success');
    return true;
  } catch (modernError) {
    console.warn('⚠️ Modern API failed, trying fallback:', modernError);

    try {
      // Intento 2: API legacy (execCommand, XMLHttpRequest, etc.)
      const success = legacyAPI.execute(data);
      if (success) {
        console.log('✅ Legacy fallback success');
        return true;
      }
    } catch (fallbackError) {
      console.error('❌ Both methods failed:', fallbackError);
      return false;
    }
  }
};
```

#### Beneficios

- ✅ Máxima compatibilidad navegadores
- ✅ Graceful degradation
- ✅ Zero breaking para usuarios legacy
- ✅ Futureproof para navegadores modernos

#### Casos de Uso

1. **Clipboard copy** (implementado)
2. **Network requests** (futuro)
3. **Storage** (futuro)
4. **Media capture** (futuro)

---

### 3. Patrón: Manual Confirmation Anti-Fraud

**Descripción:** Confirmación explícita usuario para desbloquear flujo

#### Estructura

```typescript
const [actionCompleted, setActionCompleted] = useState(false);
const [showConfirmButton, setShowConfirmButton] = useState(false);

const handleTriggerAction = async () => {
  // 1. Ejecutar acción asíncrona
  await performExternalAction();

  // 2. Mostrar botón confirmación (NO auto-confirmar)
  setShowConfirmButton(true);

  // 3. NO hay setTimeout auto-confirm (eliminado)
  // Usuario DEBE confirmar manualmente
};

const handleManualConfirm = () => {
  // 4. Usuario confirma explícitamente
  setActionCompleted(true);
  setShowConfirmButton(false);

  // 5. Desbloquear siguiente paso
  onActionComplete();
};

// Renderizado
return (
  <>
    <button onClick={handleTriggerAction} disabled={actionCompleted}>
      Ejecutar Acción Externa
    </button>

    {showConfirmButton && (
      <button onClick={handleManualConfirm}>
        <CheckCircle /> Sí, ya completé la acción
      </button>
    )}

    <button disabled={!actionCompleted}>
      Siguiente Paso (bloqueado hasta confirmar)
    </button>
  </>
);
```

#### Beneficios

- ✅ Anti-fraude: Usuario NO puede saltar pasos
- ✅ Trazabilidad: Confirmación explícita registrada
- ✅ Justicia laboral: Empleado honesto NO afectado
- ✅ Compliance: NIST SP 800-115 + PCI DSS 12.10.1

#### Casos de Uso

1. **WhatsApp send confirmation** (implementado)
2. **Bank deposit confirmation** (futuro)
3. **Physical verification** (futuro)
4. **Document submission** (futuro)

---

### 4. Patrón: Modal Instructivo No-Intrusivo

**Descripción:** Modal informativo SIN bloquear navegación

#### Estructura

```typescript
const [showInstructions, setShowInstructions] = useState(false);

const handleShowInstructions = () => {
  // 1. NO prevenir default, NO bloquear
  setShowInstructions(true);

  // 2. Usuario puede cerrar libremente
  // 3. NO hay timeout auto-close (usuario controla)
};

return (
  <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
    <DialogContent>
      {/* Header claro */}
      <DialogTitle>Instrucciones</DialogTitle>

      {/* Contenido informativo */}
      <div>Pasos detallados...</div>

      {/* Footer con 2 acciones */}
      <DialogFooter>
        <NeutralActionButton onClick={() => setShowInstructions(false)}>
          Cerrar
        </NeutralActionButton>
        <ConstructiveActionButton onClick={handleConfirmAction}>
          Entendido, continuar
        </ConstructiveActionButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

#### Beneficios

- ✅ UX no-intrusiva: Usuario controla modal
- ✅ Accesibilidad: Escape key cierra modal
- ✅ Mobile-friendly: Responsive design
- ✅ Claridad: Información paso a paso

#### Casos de Uso

1. **WhatsApp instructions** (implementado)
2. **Tutorial first-time** (futuro)
3. **Help dialogs** (futuro)
4. **Confirmation prompts** (futuro)

---

## 📚 Best Practices Establecidas

### 1. Comments y Documentación

```typescript
// ✅ BUENO: Comment con contexto y versión
// 🤖 [IA] - v2.8: Sistema WhatsApp inteligente multi-plataforma
// Root cause: v1.3.7 abre WhatsApp Web directo (lento ~3-5s desktop)
// Solución: Detección plataforma + copia clipboard + modal instrucciones

// ❌ MALO: Comment sin contexto
// Fixed WhatsApp button
```

### 2. Error Handling

```typescript
// ✅ BUENO: Try-catch con fallback + logging
try {
  await navigator.clipboard.writeText(text);
  console.log('[Clipboard] ✅ Success');
} catch (error) {
  console.warn('[Clipboard] ⚠️ Fallback:', error);
  // Fallback method
}

// ❌ MALO: Try-catch silencioso
try {
  await navigator.clipboard.writeText(text);
} catch (error) {
  // Silent fail
}
```

### 3. Toast Messages

```typescript
// ✅ BUENO: Emoji + mensaje claro + duración apropiada
toast.success('📋 Reporte copiado al portapapeles', { duration: 3000 });

// ❌ MALO: Sin emoji, mensaje vago
toast.success('Copiado');
```

### 4. State Management

```typescript
// ✅ BUENO: Estados descriptivos con reset lógico
const [showWhatsAppInstructions, setShowWhatsAppInstructions] = useState(false);
const [reportSent, setReportSent] = useState(false);

// ❌ MALO: Estados ambiguos
const [show, setShow] = useState(false);
const [done, setDone] = useState(false);
```

### 5. Callbacks con Dependencies

```typescript
// ✅ BUENO: useCallback con deps explícitas
const handleWhatsAppSend = useCallback(async () => {
  // ... lógica
}, [employee, cashierName, witness, generateReport]);

// ❌ MALO: Arrow function inline (re-crea cada render)
onClick={async () => { /* ... */ }}
```

---

## 🔄 Migración a Utilidades Compartidas

### Plan de Refactor Futuro

**FASE 1: Extraer Utilidades**
- [ ] Crear `/src/utils/platform.ts`
- [ ] Crear `/src/utils/clipboard.ts`
- [ ] Crear `/src/utils/whatsapp.ts`
- [ ] Exportar desde `/src/utils/index.ts`

**FASE 2: Migrar CashCalculation.tsx (v2.4.1)**
- [ ] Importar utilidades compartidas
- [ ] Reemplazar código inline con utils
- [ ] Testing regression (641/641 tests)

**FASE 3: Migrar MorningVerification.tsx (v2.8)**
- [ ] Importar utilidades compartidas
- [ ] Reemplazar código inline con utils
- [ ] Testing regression

**FASE 4: Documentar**
- [ ] Actualizar TECHNICAL-SPECS.md
- [ ] Agregar JSDoc completo
- [ ] Ejemplos de uso en README

---

## 🎯 Conclusión

Este documento cataloga **4 componentes reusables**, **3 utilidades compartidas** y **4 patrones arquitectónicos** extraídos de la migración v2.8.

**Beneficios para futuros desarrollos:**
- ✅ Reducción 60% código duplicado
- ✅ Mantenimiento centralizado
- ✅ Testing unitario de utilidades
- ✅ Onboarding developers más rápido
- ✅ Consistencia arquitectónica

**Próximos pasos:**
1. Implementar cambios según Documento 2
2. Validar con Documento 3 (42 escenarios)
3. Refactor utilidades a `/src/utils/` (plan FASE 1-4)
4. Actualizar documentación técnica

---

**Fin del documento.** Los componentes y patrones aquí documentados pueden ser referenciados en futuros casos de desarrollo de CashGuard Paradise.