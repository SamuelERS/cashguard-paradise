import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fish, DollarSign, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CashCounter from "@/components/CashCounter";
import ProtocolModal from "@/components/ProtocolModal";
import { FloatingOrbs } from "@/components/FloatingOrbs";

const Index = () => {
  const [showProtocol, setShowProtocol] = useState(true);
  const [protocolAccepted, setProtocolAccepted] = useState(false);
  const [showCashCounter, setShowCashCounter] = useState(false);

  const handleProtocolAccept = () => {
    setProtocolAccepted(true);
    setShowProtocol(false);
    setShowCashCounter(true);
  };

  if (showCashCounter) {
    return <CashCounter />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingOrbs />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Fish className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-aqua bg-clip-text text-transparent">
              ACUARIOS PARADISE
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-2">
            Sistema de Control de Caja
          </h2>
          <p className="text-muted-foreground text-lg">
            Prevención de fraude mediante protocolos estrictos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card h-full">
              <CardHeader className="text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-primary">Anti-Fraude</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Un solo conteo permitido
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Validación cruzada obligatoria
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Campos inmutables post-cálculo
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card h-full">
              <CardHeader className="text-center">
                <DollarSign className="w-12 h-12 text-success mx-auto mb-4" />
                <CardTitle className="text-success">Cálculo Automático</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Cambio objetivo de $50.00
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Algoritmo inteligente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Alertas automáticas
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card h-full">
              <CardHeader className="text-center">
                <Fish className="w-12 h-12 text-secondary mx-auto mb-4" />
                <CardTitle className="text-secondary">100% Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Funciona sin internet
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    PWA instalable
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Sincronización automática
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={() => setShowProtocol(true)}
            size="lg"
            className="glass-button bg-gradient-aqua hover:scale-105 transform transition-all duration-300 text-white font-semibold px-8 py-4 text-lg animate-pulse-glow"
          >
            Iniciar Corte de Caja
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showProtocol && (
          <ProtocolModal
            isOpen={showProtocol}
            onClose={() => setShowProtocol(false)}
            onAccept={handleProtocolAccept}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;