import { Toaster as Sonner } from "@/components/ui/sonner"; // 🤖 [IA] - v1.1.15 - Single toast system
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { useIsMobile } from "@/hooks/use-mobile"; // 🤖 [IA] - v2.0.0: Hook unificado de detección móvil
import { ErrorBoundary } from "@/components/ErrorBoundary"; // 🤖 [IA] - v1.0.0: Global error handling
import { logError } from "@/utils/errorLogger"; // 🤖 [IA] - v1.0.0: Error logging service

const queryClient = new QueryClient();

const App = () => {
  // 🤖 [IA] - v1.0.47: Detectar móvil para posición de toasts
  const isMobile = useIsMobile();
  
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
          {/* Global FloatingOrbs - Single instance for entire app */}
          <FloatingOrbs />
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
