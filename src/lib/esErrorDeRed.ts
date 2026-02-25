// 🤖 [IA] - CASO #3 RESILIENCIA OFFLINE — Iteración 3a
// Clasificador robusto de errores de red.
// Reemplaza check estrecho: err instanceof TypeError && err.message === 'Failed to fetch'

/**
 * Mensajes de TypeError que los navegadores lanzan cuando fetch() falla por red.
 * Cada navegador usa un mensaje distinto — esta lista cubre Chrome, Firefox, Safari y iOS.
 */
const MENSAJES_TYPEOF_ERROR: ReadonlyArray<string> = [
  'Failed to fetch',                                     // Chrome / Edge
  'NetworkError when attempting to fetch resource',      // Firefox
  'Load failed',                                         // Safari macOS
  'The Internet connection appears to be offline.',      // Safari iOS
  'cancelled',                                           // Safari abort
];

/**
 * Nombres de DOMException que indican fallo de red o timeout.
 */
const NOMBRES_DOM_EXCEPTION: ReadonlyArray<string> = [
  'AbortError',
  'TimeoutError',
];

/**
 * Patrones en mensajes de Error genérico que indican fallo de red.
 * Se buscan case-insensitive dentro de err.message.
 * Cubren: Supabase re-wrapping, errores DNS, timeouts TCP, etc.
 */
const PATRONES_MENSAJE_RED: ReadonlyArray<RegExp> = [
  /failed to fetch/i,
  /network/i,
  /ECONNREFUSED/,
  /ETIMEDOUT/,
  /ENOTFOUND/,
  /socket hang up/i,
  /ERR_INTERNET_DISCONNECTED/,
];

/**
 * Mensajes de negocio que NO deben ser tratados como conectividad.
 * Se prioriza check temprano para evitar fallback offline indebido.
 */
const PATRONES_MENSAJE_NO_RED: ReadonlyArray<RegExp> = [
  /corte terminal inmutable/i,
  /intento terminal inmutable/i,
  /ya está cerrado y no puede modificarse/i,
];

/**
 * Mensaje UX consistente cuando BD bloquea mutación por estado terminal.
 */
export const MENSAJE_CORTE_TERMINAL_INMUTABLE =
  'Este corte ya está cerrado y no puede modificarse.';

/**
 * Detecta errores de negocio por inmutabilidad terminal.
 */
export function esErrorInmutabilidadTerminal(err: unknown): boolean {
  if (typeof err === 'string') {
    return PATRONES_MENSAJE_NO_RED.some((patron) => patron.test(err));
  }

  if (!(err instanceof Error)) return false;
  return PATRONES_MENSAJE_NO_RED.some((patron) => patron.test(err.message));
}

/**
 * Determina si un error es causado por fallo de conectividad de red.
 *
 * Cubre:
 * 1. TypeError del navegador (fetch nativo falla) — Chrome, Firefox, Safari, iOS
 * 2. DOMException (AbortError, TimeoutError)
 * 3. Error genérico con mensaje de red (Supabase wrapping, ECONNREFUSED, etc.)
 *
 * Solo acepta instancias de Error/TypeError/DOMException.
 * Strings, números, null, undefined → false.
 *
 * @param err - Valor capturado en catch (unknown)
 * @returns true si el error indica fallo de red, false en caso contrario
 */
export function esErrorDeRed(err: unknown): boolean {
  // 2. DOMException (abort / timeout) — check primero porque en algunos
  //    entornos (Node/jsdom) DOMException NO extiende Error
  if (err instanceof DOMException) {
    if (NOMBRES_DOM_EXCEPTION.includes(err.name)) return true;
  }

  if (!(err instanceof Error)) return false;

  // Errores de negocio explícitos no deben clasificarse como red.
  if (esErrorInmutabilidadTerminal(err)) return false;

  // 1. TypeError del navegador (fetch nativo)
  if (err instanceof TypeError) {
    if (MENSAJES_TYPEOF_ERROR.includes(err.message)) return true;
  }

  // 3. Error genérico con mensaje que contiene patrón de red
  for (const patron of PATRONES_MENSAJE_RED) {
    if (patron.test(err.message)) return true;
  }

  return false;
}
