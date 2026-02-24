/**
 * Detecta dispositivos iOS/iPadOS, incluyendo iPadOS en modo desktop.
 *
 * @param userAgent - navigator.userAgent
 * @param platform - navigator.platform
 * @param maxTouchPoints - navigator.maxTouchPoints
 */
export function isIOSLikeDevice(
  userAgent: string,
  platform = '',
  maxTouchPoints = 0
): boolean {
  const ua = userAgent ?? '';

  // iPhone/iPad/iPod tradicionales.
  if (/iPad|iPhone|iPod/i.test(ua)) {
    return true;
  }

  // iPadOS en modo desktop: UA tipo Macintosh + touch real + marcador móvil.
  const looksLikeMac = /Macintosh|Mac OS X/i.test(ua) || platform === 'MacIntel';
  const hasTouch = maxTouchPoints > 1;
  const hasMobileToken = /Mobile\//i.test(ua);

  return looksLikeMac && hasTouch && hasMobileToken;
}
