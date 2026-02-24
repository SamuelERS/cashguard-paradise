import { describe, expect, it } from 'vitest';
import { isIOSLikeDevice } from '@/utils/deviceDetection';

describe('isIOSLikeDevice', () => {
  it('detecta iPhone como iOS', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
    expect(isIOSLikeDevice(ua)).toBe(true);
  });

  it('detecta iPad clásico por userAgent', () => {
    const ua = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
    expect(isIOSLikeDevice(ua)).toBe(true);
  });

  it('detecta iPadOS en modo desktop (UA Macintosh + touch)', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    expect(isIOSLikeDevice(ua, 'MacIntel', 5)).toBe(true);
  });

  it('no detecta Mac desktop sin touch como iOS', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
    expect(isIOSLikeDevice(ua, 'MacIntel', 0)).toBe(false);
  });

  it('no detecta Android como iOS', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36';
    expect(isIOSLikeDevice(ua)).toBe(false);
  });
});
