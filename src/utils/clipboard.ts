// 🤖 [IA] - v1.1.09: Utility function robusta para copiar al portapapeles con fallback
/**
 * Copia texto al portapapeles usando la API moderna o fallback para navegadores antiguos
 * @param text - El texto a copiar
 * @returns Objeto con estado de éxito, método usado y error si hubo
 */
export async function copyToClipboard(text: string): Promise<{
  success: boolean;
  method: 'clipboard' | 'fallback' | 'none';
  error?: string;
}> {
  // Primero intentar con la API moderna del Clipboard
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ Copiado usando Clipboard API');
      return { success: true, method: 'clipboard' };
    } catch (err) {
      console.warn('⚠️ Clipboard API falló, intentando fallback:', err);
      // No retornar aquí, intentar fallback
    }
  }

  // Fallback: Crear textarea temporal y usar execCommand
  try {
    // Crear elemento textarea oculto
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Estilos para hacerlo invisible pero funcional
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    
    // Agregar al DOM
    document.body.appendChild(textarea);
    
    // Seleccionar y copiar
    textarea.focus();
    textarea.select();
    
    // Intentar copiar
    let success = false;
    try {
      success = document.execCommand('copy');
      if (success) {
        console.log('✅ Copiado usando fallback execCommand');
      } else {
        console.error('❌ execCommand retornó false');
      }
    } catch (cmdErr) {
      console.error('❌ Error en execCommand:', cmdErr);
    }
    
    // Limpiar
    document.body.removeChild(textarea);
    
    if (success) {
      return { success: true, method: 'fallback' };
    } else {
      return { 
        success: false, 
        method: 'none',
        error: 'No se pudo copiar con el método fallback' 
      };
    }
  } catch (error) {
    console.error('❌ Error crítico al copiar:', error);
    return { 
      success: false, 
      method: 'none',
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Verifica si el portapapeles está disponible
 */
export function isClipboardAvailable(): boolean {
  return !!(
    (navigator.clipboard && window.isSecureContext) ||
    document.queryCommandSupported?.('copy')
  );
}