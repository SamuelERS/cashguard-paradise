import { Toaster as Sonner } from "@/components/ui/sonner"; // 🤖 [IA] - v1.1.15 - Single toast system
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupervisorDashboard from "./pages/SupervisorDashboard"; // 🤖 [IA] - Orden #4 DACC
import { CortesDelDia } from "@/components/supervisor/CortesDelDia"; // 🤖 [IA] - Orden #3 DACC
import { CorteDetalle } from "@/components/supervisor/CorteDetalle"; // 🤖 [IA] - Orden #5 DACC
import { CorteHistorial } from "@/components/supervisor/CorteHistorial"; // 🤖 [IA] - Orden #5 DACC
import { CortesResumen } from "@/components/supervisor/CortesResumen"; // 🤖 [IA] - v4.1.0: Analytics/KPI
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { useIsMobile } from "@/hooks/use-mobile"; // 🤖 [IA] - v2.0.0: Hook unificado de detección móvil
import { ErrorBoundary } from "@/components/ErrorBoundary"; // 🤖 [IA] - v1.0.0: Global error handling
import { logError } from "@/utils/errorLogger"; // 🤖 [IA] - v1.0.0: Error logging service
import { isIOSLikeDevice } from "@/utils/deviceDetection";

const queryClient = new QueryClient();

const App = () => {
  // 🤖 [IA] - v1.0.47: Detectar móvil para posición de toasts
  const isMobile = useIsMobile();

  // 🤖 [IA] - v1.3.6AA: FIX CRÍTICO iOS Safari - Deshabilitar FloatingOrbs en iOS
  // Root cause REAL: FloatingOrbs GPU compositing (3 motion.div animados) bloquea touch events en iOS
  // Trade-off aceptable: iOS sin orbes decorativos para garantizar funcionalidad 100%
  const isIOS = typeof navigator !== 'undefined' && isIOSLikeDevice(
    navigator.userAgent,
    navigator.platform,
    navigator.maxTouchPoints ?? 0
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to external service
        logError(
          'Uncaught error in component tree',
          error,
          {
            componentStack: errorInfo.componentStack,
            url: window.location.href,
          }
        );
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* 🤖 [IA] - v1.3.6AA: FIX iOS Safari - FloatingOrbs solo en Android/desktop */}
          {/* Root cause: GPU compositing bug iOS Safari bloquea touch events en Phase 3 */}
          {!isIOS && <FloatingOrbs />}
          {/* 🤖 [IA] - v1.0.47: Toasts arriba en móvil, abajo en desktop */}
          <Sonner 
            position={isMobile ? "top-center" : "bottom-center"}
            duration={2500}
            closeButton
            expand={false}
            style={{ 
              position: 'fixed',
              pointerEvents: 'none',
              zIndex: 9999
            }}
            toastOptions={{
              style: {
                pointerEvents: 'auto'
              }
            }}
          />
          {/* 🤖 [IA] - Configurar future flags para React Router v7 */}
          <BrowserRouter future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
          }}>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* 🤖 [IA] - Orden #4 DACC: Rutas del módulo supervisor */}
              <Route path="/supervisor" element={<SupervisorDashboard />}>
                <Route index element={<Navigate to="/supervisor/cortes" replace />} />
                <Route path="cortes" element={<CortesDelDia />} />
                {/* Próximamente — ORDEN #5: Vista B y Vista C */}
                <Route path="corte/:id" element={<CorteDetalle />} />
                <Route path="historial" element={<CorteHistorial />} />
                {/* 🤖 [IA] - v4.1.0: Ruta analytics/KPI */}
                <Route path="resumen" element={<CortesResumen />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
