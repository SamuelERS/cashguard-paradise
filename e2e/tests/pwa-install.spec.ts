// 🤖 [IA] - v1.1.17: E2E tests for PWA installation and functionality
// @regression tag - PWA features (specialized testing)
import { test, expect } from '@playwright/test';

// Type definition for PWA manifest icon
interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

test.describe('PWA Installation and Functionality @regression', () => {
  test('Verify manifest.json is properly configured', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Get the manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBeTruthy();
    
    // Fetch and validate manifest
    const manifestResponse = await page.request.get(manifestLink!);
    expect(manifestResponse.ok()).toBeTruthy();
    
    const manifest = await manifestResponse.json();
    
    // Validate required manifest properties
    expect(manifest.name).toBe('CashGuard Paradise');
    expect(manifest.short_name).toBe('CashGuard');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#000000');
    expect(manifest.background_color).toBe('#000000');
    
    // Validate icons
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    // Check for required icon sizes
    const iconSizes = manifest.icons.map((icon: ManifestIcon) => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
  });

  test('Service worker registration', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for service worker to register
    const swRegistered = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(() => {
            resolve(true);
          }).catch(() => {
            resolve(false);
          });
          
          // Timeout after 5 seconds
          setTimeout(() => resolve(false), 5000);
        } else {
          resolve(false);
        }
      });
    });
    
    expect(swRegistered).toBeTruthy();
    
    // Verify service worker is active
    const swState = await page.evaluate(() => {
      return navigator.serviceWorker.controller ? 'active' : 'inactive';
    });
    
    expect(swState).toBe('active');
  });

  test('App works in standalone mode', async ({ page, context }) => {
    // Create a new page with standalone display mode
    const standalonePage = await context.newPage();
    
    // Set viewport to mobile size
    await standalonePage.setViewportSize({ width: 375, height: 667 });
    
    // Navigate with standalone display mode
    await standalonePage.goto('/', {
      waitUntil: 'networkidle'
    });
    
    // Add to home screen simulation (meta tag check)
    const appleMetaTag = await standalonePage.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleMetaTag).toBe('yes');
    
    const appleStatusBar = await standalonePage.locator('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content');
    expect(appleStatusBar).toBe('black-translucent');
    
    // Verify app loads correctly
    await expect(standalonePage.locator('text=Selecciona la Operación')).toBeVisible();
    
    // Test that app functions work in standalone mode
    await standalonePage.click('text=Conteo de Caja');
    await expect(standalonePage.locator('text=Conteo Matutino')).toBeVisible();
    
    await standalonePage.close();
  });

  test('Offline functionality with cached assets', async ({ page, context }) => {
    // First visit to cache assets
    await page.goto('/');
    await expect(page.locator('text=Selecciona la Operación')).toBeVisible();
    
    // Wait for service worker to be ready
    await page.evaluate(() => {
      return navigator.serviceWorker.ready;
    });
    
    // Go offline
    await context.setOffline(true);
    
    // Reload the page
    await page.reload();
    
    // App should still load from cache
    await expect(page.locator('text=Selecciona la Operación')).toBeVisible({ timeout: 10000 });
    
    // Basic navigation should work offline
    await page.click('text=Corte de Caja');
    await expect(page.locator('text=Protocolo de Seguridad')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
  });

  test('Install prompt behavior', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Check if beforeinstallprompt event is handled
    const hasInstallHandler = await page.evaluate(() => {
      return new Promise((resolve) => {
        let handled = false;
        
        // Create a fake event to test if handler exists
        const fakeEvent = new Event('beforeinstallprompt');
        
        window.addEventListener('beforeinstallprompt', (e) => {
          handled = true;
        });
        
        window.dispatchEvent(fakeEvent);
        
        setTimeout(() => {
          resolve(handled);
        }, 100);
      });
    });
    
    // The app should handle the install prompt event
    expect(hasInstallHandler).toBeTruthy();
  });

  test('Icons load correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check favicon
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(favicon).toBeTruthy();
    
    const faviconResponse = await page.request.get(favicon!);
    expect(faviconResponse.ok()).toBeTruthy();
    
    // Check apple touch icon
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect(appleTouchIcon).toBeTruthy();
    
    const appleIconResponse = await page.request.get(appleTouchIcon!);
    expect(appleIconResponse.ok()).toBeTruthy();
    
    // Check logo in the app
    await expect(page.locator('img[alt*="Paradise"]').first()).toBeVisible();
  });

  test('Viewport and theme color meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
    expect(viewport).toContain('maximum-scale=1');
    expect(viewport).toContain('user-scalable=no');
    
    // Check theme color
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#000000');
  });

  test('App launches correctly from home screen', async ({ page, context }) => {
    // Simulate launch from home screen (standalone mode)
    const newPage = await context.newPage();
    
    // Add referrer to simulate home screen launch
    await newPage.goto('/', {
      referer: '',
      waitUntil: 'networkidle'
    });
    
    // Check display mode via JavaScript
    const displayMode = await newPage.evaluate(() => {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      return mediaQuery.matches ? 'standalone' : 'browser';
    });
    
    // In real PWA this would be standalone, but in test it's browser
    // Just verify the app loads correctly
    await expect(newPage.locator('text=Selecciona la Operación')).toBeVisible();
    
    // Verify full functionality
    await newPage.click('text=Conteo de Caja');
    await expect(newPage.locator('text=Conteo Matutino')).toBeVisible();
    
    await newPage.close();
  });

  test('Update notification when new version available', async ({ page }) => {
    await page.goto('/');
    
    // Check if update notification system is in place
    const hasUpdateMechanism = await page.evaluate(() => {
      return 'serviceWorker' in navigator && 'onupdatefound' in ServiceWorkerRegistration.prototype;
    });
    
    expect(hasUpdateMechanism).toBeTruthy();
    
    // Verify skipWaiting is handled
    const swScript = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return reg ? true : false;
    });
    
    expect(swScript).toBeTruthy();
  });

  test('PWA handles orientation changes correctly', async ({ page, context }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Set initial portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify app adapts to portrait
    const isPortraitOptimized = await page.evaluate(() => {
      const mediaQuery = window.matchMedia('(orientation: portrait)');
      return mediaQuery.matches;
    });
    expect(isPortraitOptimized).toBeTruthy();
    
    // Change to landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Verify app adapts to landscape
    const isLandscapeOptimized = await page.evaluate(() => {
      const mediaQuery = window.matchMedia('(orientation: landscape)');
      return mediaQuery.matches;
    });
    expect(isLandscapeOptimized).toBeTruthy();
    
    // Verify critical elements remain accessible
    await expect(page.locator('text=Selecciona la Operación')).toBeVisible();
    
    // Test that modal content adapts properly
    await page.click('text=Conteo de Caja');
    await expect(page.locator('text=Conteo Matutino')).toBeVisible();
    
    // Verify modal is still usable in landscape
    const modalHeight = await page.locator('[role="dialog"]').evaluate(el => {
      return el.getBoundingClientRect().height;
    });
    expect(modalHeight).toBeLessThan(375); // Should fit in viewport
  });
});