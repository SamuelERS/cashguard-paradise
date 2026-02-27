// 🤖 [IA] - v1.0.1 - Footer corporativo — escala dinámica eliminada (patrón DACC v3.5.0 P2)
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface AppFooterProps {
  variant?: 'minimal' | 'floating' | 'elegant';
}

export function AppFooter({ variant = 'minimal' }: AppFooterProps) {
  // Opción 1: Footer Minimalista con Gradiente
  if (variant === 'minimal') {
    return (
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          padding: 'clamp(12px, 3.7vw, 20px)',
        }}
      >
        <div
          className="max-w-fit mx-auto flex items-center justify-center gap-2 pointer-events-auto"
          style={{
            padding: 'clamp(8px, 2.8vw, 16px) clamp(16px, 5.6vw, 32px)',
            background: 'rgba(36, 36, 36, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: `clamp(20px, 5vw, 24px)`,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <motion.span
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              fontSize: `clamp(1rem, 4vw, 1.25rem)`,
            }}
          >
            🕊️
          </motion.span>
          
          <span
            className="font-semibold"
            style={{
              fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
              background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 50%, #f4a52a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.02em',
            }}
          >
            JesucristoEsDios
          </span>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Heart
              fill="#ff4d6d"
              stroke="#ff4d6d"
              style={{
                width: `clamp(14px, 3.5vw, 18px)`,
                height: `clamp(14px, 3.5vw, 18px)`,
                filter: 'drop-shadow(0 0 8px rgba(255, 77, 109, 0.6))',
              }}
            />
          </motion.div>
        </div>
      </motion.footer>
    );
  }

  // Opción 2: Footer Floating Badge (esquina inferior derecha)
  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-6 right-6 z-30 cursor-default"
        style={{
          padding: 'clamp(10px, 3.3vw, 18px) clamp(14px, 4.7vw, 24px)',
          background: 'rgba(36, 36, 36, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: `clamp(16px, 4vw, 20px)`,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              fontSize: `clamp(1.125rem, 4.5vw, 1.375rem)`,
            }}
          >
            🕊️
          </motion.span>
          
          <div className="flex flex-col">
            <span
              className="font-bold leading-tight"
              style={{
                fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                background: 'linear-gradient(135deg, #0a84ff 0%, #f4a52a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              JesucristoEsDios
            </span>
          </div>

          <motion.div
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Heart
              fill="#ff4d6d"
              stroke="#ff4d6d"
              style={{
                width: `clamp(16px, 4vw, 20px)`,
                height: `clamp(16px, 4vw, 20px)`,
                filter: 'drop-shadow(0 0 10px rgba(255, 77, 109, 0.7))',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Opción 3: Footer Elegante Full-Width
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="fixed bottom-0 left-0 right-0 z-10"
      style={{
        background: 'linear-gradient(to top, rgba(20, 20, 20, 0.95) 0%, rgba(20, 20, 20, 0.85) 50%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Separador decorativo con gradiente */}
      <div
        className="w-full mx-auto"
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #0a84ff 20%, #5e5ce6 50%, #f4a52a 80%, transparent 100%)',
          opacity: 0.6,
        }}
      />
      
      <div
        className="container mx-auto flex items-center justify-center"
        style={{
          padding: 'clamp(16px, 4.7vw, 24px)',
          gap: 'clamp(8px, 2.8vw, 16px)',
        }}
      >
        <motion.span
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
            filter: 'drop-shadow(0 2px 8px rgba(10, 132, 255, 0.3))',
          }}
        >
          🕊️
        </motion.span>

        <div className="flex flex-col items-center">
          <span
            className="font-bold tracking-wide"
            style={{
              fontSize: `clamp(0.875rem, 3.5vw, 1rem)`,
              background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 40%, #f4a52a 80%, #ff4d6d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.03em',
              textShadow: '0 0 20px rgba(10, 132, 255, 0.3)',
            }}
          >
            JesucristoEsDios
          </span>
          <div
            className="w-full mt-1"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(10, 132, 255, 0.4) 50%, transparent 100%)',
            }}
          />
        </div>

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Heart
            fill="#ff4d6d"
            stroke="#ff4d6d"
            style={{
              width: `clamp(18px, 4.5vw, 22px)`,
              height: `clamp(18px, 4.5vw, 22px)`,
              filter: 'drop-shadow(0 0 12px rgba(255, 77, 109, 0.8))',
            }}
          />
        </motion.div>
      </div>
    </motion.footer>
  );
}
