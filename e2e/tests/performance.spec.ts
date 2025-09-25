// 🤖 [IA] - v1.1.17: Performance metrics tests - Web Vitals and bundle analysis
import { test, expect } from '@playwright/test';

// Type definitions for performance APIs
interface LayoutShiftAttribution extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface ResourceMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  fontSize: number;
  resourceCount: number;
  loadTime: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

interface AnimationMetrics {
  fps: number;
  frames: number;
  duration: number;
}

test.describe('Performance Metrics', () => {
  test('Core Web Vitals measurements', async ({ page }) => {
    // Navigate and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          ttfb: 0,
          fcp: 0,
          lcp: 0,
          fid: 0,
          cls: 0
        };
        
        // Time to First Byte (TTFB)
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          vitals.ttfb = navTiming.responseStart - navTiming.requestStart;
        }
        
        // First Contentful Paint (FCP)
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          vitals.fcp = fcpEntry.startTime;
        }
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as LayoutShiftAttribution).hadRecentInput) {
              clsValue += (entry as LayoutShiftAttribution).value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Wait a bit to collect metrics
        setTimeout(() => {
          resolve(vitals);
        }, 3000);
      });
    });
    
    // Assert acceptable thresholds
    console.log('Web Vitals:', metrics);
    
    // TTFB should be under 800ms (good: <800ms, needs improvement: 800-1800ms, poor: >1800ms)
    expect(metrics.ttfb).toBeLessThan(800);
    
    // FCP should be under 1.8s (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
    expect(metrics.fcp).toBeLessThan(1800);
    
    // LCP should be under 2.5s (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    expect(metrics.lcp).toBeLessThan(2500);
    
    // CLS should be under 0.1 (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    expect(metrics.cls).toBeLessThan(0.1);
  });

  test('Bundle size and resource loading', async ({ page }) => {
    const resourceMetrics: ResourceMetrics = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      fontSize: 0,
      resourceCount: 0,
      loadTime: 0
    };
    
    // Track resource loading
    page.on('response', response => {
      const url = response.url();
      const headers = response.headers();
      const contentLength = headers['content-length'];
      
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        resourceMetrics.totalSize += size;
        resourceMetrics.resourceCount++;
        
        if (url.endsWith('.js') || url.includes('.js?')) {
          resourceMetrics.jsSize += size;
        } else if (url.endsWith('.css') || url.includes('.css?')) {
          resourceMetrics.cssSize += size;
        } else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)/)) {
          resourceMetrics.imageSize += size;
        } else if (url.match(/\.(woff|woff2|ttf|otf|eot)/)) {
          resourceMetrics.fontSize += size;
        }
      }
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    resourceMetrics.loadTime = Date.now() - startTime;
    
    console.log('Resource Metrics:', {
      ...resourceMetrics,
      totalSizeMB: (resourceMetrics.totalSize / 1024 / 1024).toFixed(2) + ' MB',
      jsSizeMB: (resourceMetrics.jsSize / 1024 / 1024).toFixed(2) + ' MB',
      cssSizeKB: (resourceMetrics.cssSize / 1024).toFixed(2) + ' KB',
      loadTimeSeconds: (resourceMetrics.loadTime / 1000).toFixed(2) + 's'
    });
    
    // Assert bundle size limits
    // Total bundle should be under 5MB for initial load
    expect(resourceMetrics.totalSize).toBeLessThan(5 * 1024 * 1024);
    
    // JavaScript should be under 2MB (before gzip)
    expect(resourceMetrics.jsSize).toBeLessThan(2 * 1024 * 1024);
    
    // CSS should be under 200KB
    expect(resourceMetrics.cssSize).toBeLessThan(200 * 1024);
    
    // Load time should be under 3 seconds on good connection
    expect(resourceMetrics.loadTime).toBeLessThan(3000);
  });

  test('Memory usage and performance during interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ((performance as PerformanceWithMemory).memory) {
        return {
          usedJSHeapSize: (performance as PerformanceWithMemory).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as PerformanceWithMemory).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as PerformanceWithMemory).memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    // Perform heavy interactions
    // Open and close modals multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('text=Corte de Caja');
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Navigate through wizard multiple times
    await page.click('text=Conteo de Caja');
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.click('text=Los Héroes');
    await page.click('text=Siguiente');
    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Maria Lopez');
    await page.click('text=Siguiente');
    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Juan Carlos');
    await page.click('text=Completar');
    
    // Get memory after interactions
    const finalMemory = await page.evaluate(() => {
      if ((performance as PerformanceWithMemory).memory) {
        return {
          usedJSHeapSize: (performance as PerformanceWithMemory).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as PerformanceWithMemory).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as PerformanceWithMemory).memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      console.log('Memory Usage:', {
        initialMB: (initialMemory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        finalMB: (finalMemory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        increaseMB: memoryIncreaseMB.toFixed(2) + ' MB'
      });
      
      // Memory increase should be less than 50MB after heavy interactions
      expect(memoryIncreaseMB).toBeLessThan(50);
    }
    
    // Check for animation performance
    const animationMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let startTime = performance.now();
        
        function countFrames() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve({
              fps: frameCount,
              smooth: frameCount >= 55 // Should be close to 60fps
            });
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    console.log('Animation Performance:', animationMetrics);

    // Should maintain at least 55 fps (close to 60)
    expect((animationMetrics as AnimationMetrics).fps).toBeGreaterThanOrEqual(55);
  });
});