import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cleanupDevServiceWorkers } from './lib/devServiceWorkerCleanup'

// 🤖 [IA] - v1.1.04: Remover loader cuando React esté listo
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  void cleanupDevServiceWorkers({
    serviceWorker: navigator.serviceWorker,
    cacheStorage: window.caches,
  });
}

// Renderizar la app
root.render(<App />);

// Fade out y remover el loader después de que React monte
setTimeout(() => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('fade-out');
    // Remover completamente después de la animación
    setTimeout(() => {
      loader.remove();
    }, 300);
  }
}, 100); // Pequeño delay para asegurar que React haya montado
