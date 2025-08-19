import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fish, DollarSign, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CashCounter from "@/components/CashCounter";
import ProtocolModal from "@/components/ProtocolModal";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { FloatingParticles } from "@/components/FloatingParticles";

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
      <FloatingParticles />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Fish className="w-12 h-12" style={{ color: 'var(--accent-primary)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ACUARIOS PARADISE
            </h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>
            Sistema de Control de Caja
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Prevención de fraude mediante protocolos estrictos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card h-full">
              <div className="text-center p-6">
                <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Anti-Fraude</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Un solo conteo permitido
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Validación cruzada obligatoria
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Campos inmutables post-cálculo
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card h-full">
              <div className="text-center p-6">
                <DollarSign className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--success)' }} />
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Cálculo Automático</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Cambio objetivo de $50.00
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Algoritmo inteligente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Alertas automáticas
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card h-full">
              <div className="text-center p-6">
                <Fish className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent-secondary)' }} />
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>100% Offline</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Funciona sin internet
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    PWA instalable
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    Sincronización automática
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => setShowProtocol(true)}
            className="btn-primary"
          >
            Iniciar Corte de Caja
          </button>
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