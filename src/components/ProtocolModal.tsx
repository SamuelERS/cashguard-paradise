// 🤖 [IA] - ProtocolModal v1.0.2 - Fix centrado y padding consistente del modal
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const ProtocolModal = ({ isOpen, onClose, onAccept }: ProtocolModalProps) => {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [signature, setSignature] = useState("");

  const protocolRules = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      text: "Prohibido usar teléfonos o calculadoras durante el conteo",
      critical: true,
    },
    {
      icon: <Shield className="w-5 h-5 text-destructive" />,
      text: "Un solo conteo permitido - sin recuentos",
      critical: true,
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-primary" />,
      text: "Cajero ≠ Testigo - validación cruzada obligatoria",
      critical: true,
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-success" />,
      text: "Todos los campos son obligatorios antes de calcular",
      critical: false,
    },
    {
      icon: <Shield className="w-5 h-5 text-destructive" />,
      text: "Los campos se bloquean después del cálculo",
      critical: true,
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      text: "Alerta automática si faltante > $3.00",
      critical: false,
    },
  ];

  const handleAccept = () => {
    if (rulesAccepted && signature.trim()) {
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 🤖 [IA] - Modal responsive con padding consistente y centrado mejorado v1.0.2 */}
      <DialogContent className="protocol-modal-content glass-modal border-2 border-primary/30 w-[95vw] max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden">
        <div className="p-4 sm:p-6">
          <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-primary">
            <Shield className="w-8 h-8" />
            Protocolo Anti-Fraude
          </DialogTitle>
          {/* 🤖 [IA] - Descripción para accesibilidad WCAG */}
          <DialogDescription className="text-muted-foreground mt-2">
            Lee cuidadosamente las reglas del protocolo anti-fraude antes de continuar. 
            El cumplimiento de estas normas es obligatorio para garantizar la integridad del proceso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-destructive">ADVERTENCIA CRÍTICA</h3>
            </div>
            <p className="text-sm text-destructive/90">
              Este sistema está diseñado para prevenir fraude. Cualquier intento de 
              manipular los datos será detectado y reportado automáticamente.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">
              Reglas Obligatorias del Protocolo:
            </h3>
            
            {protocolRules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`protocol-rule flex items-start gap-3 p-3 rounded-lg ${
                  rule.critical 
                    ? "bg-destructive/5 border border-destructive/20" 
                    : "bg-success/5 border border-success/20"
                }`}
              >
                {rule.icon}
                <span className="text-sm flex-1">{rule.text}</span>
                {rule.critical && (
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                    CRÍTICO
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">Flujo del Proceso:</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Aceptar protocolo (este paso)</li>
              <li>2. Seleccionar sucursal y personal</li>
              <li>3. Contar efectivo físico manualmente</li>
              <li>4. Ingresar cantidades en el sistema</li>
              <li>5. Cálculo automático (campos se bloquean)</li>
              <li>6. Generación y envío de reporte</li>
            </ol>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rules-accepted"
                checked={rulesAccepted}
                onCheckedChange={(checked) => setRulesAccepted(checked as boolean)}
                className="border-primary data-[state=checked]:bg-primary"
              />
              <Label 
                htmlFor="rules-accepted" 
                className="text-sm font-medium cursor-pointer"
              >
                He leído y acepto cumplir todas las reglas del protocolo anti-fraude
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature" className="text-sm font-medium">
                Firma Digital (Nombre completo):
              </Label>
              <Input
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Ingrese su nombre completo como firma digital"
                className="bg-input/50 border-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-muted hover:bg-muted/50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!rulesAccepted || !signature.trim()}
              className="flex-1 bg-gradient-aqua hover:scale-105 transform transition-all duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aceptar y Continuar
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProtocolModal;