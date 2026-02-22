import { describe, it, expect, vi } from 'vitest';
import { cleanupDevServiceWorkers } from '../devServiceWorkerCleanup';

function createRegistration(unregisterResult = true) {
  return {
    unregister: vi.fn().mockResolvedValue(unregisterResult),
  } as unknown as ServiceWorkerRegistration;
}

describe('cleanupDevServiceWorkers', () => {
  it('unregisters service workers and deletes only PWA caches', async () => {
    const regA = createRegistration(true);
    const regB = createRegistration(true);

    const serviceWorker = {
      getRegistrations: vi.fn().mockResolvedValue([regA, regB]),
    } as unknown as ServiceWorkerContainer;

    const cacheStorage = {
      keys: vi.fn().mockResolvedValue([
        'workbox-precache-v2-http://localhost:5173/',
        'workbox-runtime',
        'app-custom-cache',
      ]),
      delete: vi.fn().mockResolvedValue(true),
    } as unknown as CacheStorage;

    const result = await cleanupDevServiceWorkers({ serviceWorker, cacheStorage });

    expect(serviceWorker.getRegistrations).toHaveBeenCalledTimes(1);
    expect(regA.unregister).toHaveBeenCalledTimes(1);
    expect(regB.unregister).toHaveBeenCalledTimes(1);
    expect(cacheStorage.delete).toHaveBeenCalledWith('workbox-precache-v2-http://localhost:5173/');
    expect(cacheStorage.delete).toHaveBeenCalledWith('workbox-runtime');
    expect(cacheStorage.delete).not.toHaveBeenCalledWith('app-custom-cache');
    expect(result).toEqual({ unregistered: 2, deletedCaches: 2 });
  });

  it('returns zeroes when browser APIs are unavailable', async () => {
    const result = await cleanupDevServiceWorkers({});
    expect(result).toEqual({ unregistered: 0, deletedCaches: 0 });
  });
});
