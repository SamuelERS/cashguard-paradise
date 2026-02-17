interface CleanupOptions {
  serviceWorker?: Pick<ServiceWorkerContainer, 'getRegistrations'>;
  cacheStorage?: Pick<CacheStorage, 'keys' | 'delete'>;
}

interface CleanupResult {
  unregistered: number;
  deletedCaches: number;
}

function isPwaCacheName(name: string): boolean {
  return name.startsWith('workbox-') || name.includes('vite-plugin-pwa') || name.includes('precache');
}

export async function cleanupDevServiceWorkers(options: CleanupOptions = {}): Promise<CleanupResult> {
  const serviceWorker = options.serviceWorker;
  const cacheStorage = options.cacheStorage;

  let unregistered = 0;
  let deletedCaches = 0;

  if (serviceWorker) {
    try {
      const registrations = await serviceWorker.getRegistrations();
      const unregisterResults = await Promise.allSettled(
        registrations.map((registration) => registration.unregister())
      );
      unregistered = unregisterResults.filter(
        (result): result is PromiseFulfilledResult<boolean> => result.status === 'fulfilled'
      ).filter((result) => result.value).length;
    } catch {
      // Best effort cleanup for development only.
    }
  }

  if (cacheStorage) {
    try {
      const names = await cacheStorage.keys();
      const pwaCaches = names.filter(isPwaCacheName);
      const deleteResults = await Promise.allSettled(
        pwaCaches.map((name) => cacheStorage.delete(name))
      );
      deletedCaches = deleteResults.filter(
        (result): result is PromiseFulfilledResult<boolean> => result.status === 'fulfilled'
      ).filter((result) => result.value).length;
    } catch {
      // Best effort cleanup for development only.
    }
  }

  return { unregistered, deletedCaches };
}

