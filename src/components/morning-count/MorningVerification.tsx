// 🤖 [IA] - v1.1.13 - Mejora visual del detalle de denominaciones con tabla estructurada
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, CheckCircle, AlertTriangle, Download, Share, ArrowLeft, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateCashTotal, formatCurrency, generateDenominationSummary } from '@/utils/calculations';
import { copyToClipboard } from '@/utils/clipboard'; // 🤖 [IA] - v1.1.09
import { CashCount } from '@/types/cash';
import { getStoreById, getEmployeeById } from '@/data/paradise';
import { toast } from 'sonner';

interface MorningVerificationProps {
  storeId: string;
  cashierId: string; // Cajero entrante
  witnessId: string; // Cajero saliente
  cashCount: CashCount;
  onBack: () => void;
  onComplete: () => void;
}

export function MorningVerification({
  storeId,
  cashierId,
  witnessId,
  cashCount,
  onBack,
  onComplete
}: MorningVerificationProps) {
  const [verificationData, setVerificationData] = useState<any>(null);
  
  const store = getStoreById(storeId);
  const cashierIn = getEmployeeById(cashierId);
  const cashierOut = getEmployeeById(witnessId);
  
  useEffect(() => {
    performVerification();
  }, []);

  const performVerification = () => {
    const totalCash = calculateCashTotal(cashCount);
    const expectedAmount = 50; // Siempre $50 para cambio
    const difference = totalCash - expectedAmount;
    const isCorrect = Math.abs(difference) < 0.01; // Tolerancia de 1 centavo
    
    const data = {
      totalCash,
      expectedAmount,
      difference,
      isCorrect,
      hasShortage: difference < -1.00,
      hasExcess: difference > 1.00,
      timestamp: new Date().toLocaleString('es-SV', {
        timeZone: 'America/El_Salvador',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    
    setVerificationData(data);
  };

  const handleWhatsApp = () => {
    const report = generateReport();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(report)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Abriendo WhatsApp con el reporte');
  };
  
  // 🤖 [IA] - v1.1.09: Función mejorada con fallback robusto
  const handleCopyToClipboard = async () => {
    try {
      const report = generateReport();
      const result = await copyToClipboard(report);
      
      if (result.success) {
        toast.success('Reporte copiado al portapapeles');
      } else {
        toast.error(result.error || 'No se pudo copiar al portapapeles');
      }
    } catch (error) {
      toast.error('Error al generar el reporte');
    }
  };
  
  const handleShare = async () => {
    const report = generateReport();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conteo de Caja Matutino',
          text: report,
        });
      } catch (err) {
        // Usuario canceló el share o error
        console.log('Share cancelado o no disponible');
      }
    } else {
      // Fallback a copiar al portapapeles
      await handleCopyToClipboard();
    }
  };

  const generatePrintableReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conteo-matutino-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte descargado exitosamente');
  };

  const generateReport = () => {
    if (!verificationData) return '';
    
    return `
🌅 CONTEO DE CAJA MATUTINO
============================
Fecha/Hora: ${verificationData.timestamp}
Sucursal: ${store?.name || 'N/A'}

PERSONAL
--------
Cajero Entrante: ${cashierIn?.name || 'N/A'}
Cajero Saliente: ${cashierOut?.name || 'N/A'}

RESUMEN DEL CONTEO
------------------
${generateDenominationSummary(cashCount)}

VERIFICACIÓN
------------
Total Contado: ${formatCurrency(verificationData.totalCash)}
Cambio Esperado: ${formatCurrency(verificationData.expectedAmount)}
Diferencia: ${formatCurrency(verificationData.difference)}

ESTADO: ${verificationData.isCorrect ? '✅ CORRECTO' : '⚠️ DIFERENCIA DETECTADA'}

${verificationData.hasShortage ? '⚠️ FALTANTE: Revisar con cajero saliente' : ''}
${verificationData.hasExcess ? '⚠️ SOBRANTE: Verificar origen del exceso' : ''}

============================
Sistema CashGuard Paradise v1.1.13
    `.trim();
  };

  // 🤖 [IA] - v1.1.13: Función para generar display visual de denominaciones con identidad naranja
  const generateDenominationDisplay = () => {
    const denominations = [
      { key: 'penny', label: '1¢ centavo', value: 0.01 },
      { key: 'nickel', label: '5¢ centavos', value: 0.05 },
      { key: 'dime', label: '10¢ centavos', value: 0.10 },
      { key: 'quarter', label: '25¢ centavos', value: 0.25 },
      { key: 'dollarCoin', label: '$1 moneda', value: 1.00 },
      { key: 'bill1', label: '$1', value: 1.00 },
      { key: 'bill5', label: '$5', value: 5.00 },
      { key: 'bill10', label: '$10', value: 10.00 },
      { key: 'bill20', label: '$20', value: 20.00 },
      { key: 'bill50', label: '$50', value: 50.00 },
      { key: 'bill100', label: '$100', value: 100.00 }
    ];

    const items = denominations
      .filter(d => cashCount[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = cashCount[d.key as keyof CashCount] || 0;
        const subtotal = quantity * d.value;
        return (
          <div key={d.key} className="flex justify-between text-sm rounded px-3 py-1.5" style={{
            background: 'rgba(244, 165, 42, 0.05)'
          }}>
            <span className="font-medium" style={{ color: '#e1e8ed' }}>{d.label}</span>
            <span className="font-semibold" style={{ color: '#ffb84d' }}>
              × {quantity} = {formatCurrency(subtotal)}
            </span>
          </div>
        );
      });

    const total = calculateCashTotal(cashCount);
    
    return (
      <>
        {items}
        {items.length > 0 && (
          <>
            <div className="my-2" style={{ borderTop: '1px solid rgba(244, 165, 42, 0.3)' }}></div>
            <div className="flex justify-between text-sm font-bold px-3">
              <span style={{ color: '#ffb84d' }}>Total contado:</span>
              <span style={{ color: '#f4a52a' }}>{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </>
    );
  };

  if (!verificationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sunrise className="w-12 h-12 mx-auto mb-4" style={{ color: '#f4a52a' }} />
          </motion.div>
          <p style={{ color: '#8899a6' }}>Verificando conteo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* 🤖 [IA] - v1.1.12: Eliminado gradient gris, coherente con CashCalculation */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:max-w-4xl">
        {/* Header simplificado pero con identidad naranja preservada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f4a52a' }}>
              Verificación Completada
            </h2>
            <p style={{ color: '#8899a6' }}>
              Resultados del conteo matutino
            </p>
            <Badge 
              variant="outline" 
              className="mt-2"
              style={{ 
                borderColor: '#f4a52a', 
                color: '#f4a52a',
                background: 'rgba(244, 165, 42, 0.1)'
              }}
            >
              {verificationData.timestamp}
            </Badge>
          </div>
          
          {/* Alert/Estado movido como sección independiente */}
          {verificationData.isCorrect ? (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{
              background: 'rgba(0, 186, 124, 0.1)',
              border: '1px solid rgba(0, 186, 124, 0.3)'
            }}>
              <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#00ba7c' }} />
              <div>
                <p className="font-medium" style={{ color: '#00ba7c' }}>
                  Cambio Verificado Correctamente
                </p>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  El cajero entrante puede iniciar su turno
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{
              background: 'rgba(244, 33, 46, 0.1)',
              border: '1px solid rgba(244, 33, 46, 0.3)'
            }}>
              <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#f4212e' }} />
              <div>
                <p className="font-medium" style={{ color: '#f4212e' }}>
                  Diferencia Detectada
                </p>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  {verificationData.hasShortage 
                    ? 'Revisar faltante con el cajero saliente'
                    : 'Verificar origen del sobrante'}
                </p>
              </div>
            </div>
          )}

        {/* Main Content - 🤖 [IA] - v1.1.12: Grid reorganizado para coherencia con CashCalculation */}
        <div className="grid md:grid-cols-2 gap-6 lg:max-w-3xl lg:mx-auto">
          {/* Información del conteo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>
                Información del Conteo
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm" style={{ color: '#8899a6' }}>Sucursal</p>
                  <p className="text-lg font-semibold" style={{ color: '#e1e8ed' }}>
                    {store?.name || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm" style={{ color: '#8899a6' }}>Cajero Entrante</p>
                  <p className="text-lg font-semibold" style={{ color: '#ffb84d' }}>
                    {cashierIn?.name || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm" style={{ color: '#8899a6' }}>Cajero Saliente</p>
                  <p className="text-lg font-semibold" style={{ color: '#e1e8ed' }}>
                    {cashierOut?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resultados del conteo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>
                Resultados del Conteo
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ color: '#8899a6' }}>Total Contado:</span>
                  <span className="text-2xl font-bold" style={{ color: '#e1e8ed' }}>
                    {formatCurrency(verificationData.totalCash)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span style={{ color: '#8899a6' }}>Cambio Esperado:</span>
                  <span className="text-xl" style={{ color: '#8899a6' }}>
                    {formatCurrency(verificationData.expectedAmount)}
                  </span>
                </div>
                
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#8899a6' }}>Diferencia:</span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ 
                        color: verificationData.isCorrect ? '#00ba7c' : '#f4212e' 
                      }}
                    >
                      {verificationData.difference >= 0 ? '+' : ''}
                      {formatCurrency(verificationData.difference)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detalle de denominaciones - 🤖 [IA] - v1.0.98: Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 lg:max-w-3xl lg:mx-auto"
        >
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>
              Detalle de Denominaciones
            </h3>
            
            <div className="p-4 rounded-lg" style={{
              background: 'rgba(244, 165, 42, 0.1)',
              border: '1px solid rgba(244, 165, 42, 0.3)'
            }}>
              <p className="text-sm font-medium mb-3" style={{ color: '#f4a52a' }}>
                Cambio verificado para inicio de turno:
              </p>
              
              <div className="space-y-1">
                {generateDenominationDisplay()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Confirmation - 🤖 [IA] - v1.1.11: Glass morphism coherente con CashCalculation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#00ba7c' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: '#e1e8ed' }}>
                Conteo Matutino Completado
              </h3>
              <p className="mb-6" style={{ color: '#8899a6' }}>
                El cambio ha sido verificado y está listo para iniciar el turno.
                Los datos están bloqueados según el protocolo anti-fraude.
              </p>
              
              {/* Botones de acción en grid - 🤖 [IA] - v1.1.11: Coherente con CashCalculation */}
              {/* 🤖 [IA] - v1.2.8: Removido botón Reporte, grid ajustado a 3 columnas */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:max-w-3xl mx-auto">
                <Button
                  onClick={handleWhatsApp}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2"
                >
                  <Share className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  className="border-warning/30 hover:bg-warning/10 hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                
                <Button
                  onClick={onComplete}
                  className="bg-gradient-to-r from-[#f4a52a] to-[#ffb84d] hover:from-[#e89a1a] hover:to-[#ffa83d] text-white font-semibold hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2 md:col-span-1 col-span-2"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  style={{ color: '#8899a6' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Conteo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}