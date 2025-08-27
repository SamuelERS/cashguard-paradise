import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { useIsMobile } from "@/hooks/useIsMobile"; // 🤖 [IA] - v1.0.47: Detección móvil para toasts

const queryClient = new QueryClient();

const App = () => {
  // 🤖 [IA] - v1.0.47: Detectar móvil para posición de toasts
  const isMobile = useIsMobile();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Global FloatingOrbs - Single instance for entire app */}
        <FloatingOrbs />
        <Toaster />
        {/* 🤖 [IA] - v1.0.47: Toasts arriba en móvil, abajo en desktop */}
        <Sonner 
          position={isMobile ? "top-center" : "bottom-center"}
          duration={2500}
          closeButton
          expand={false}
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
  );
};

export default App;
