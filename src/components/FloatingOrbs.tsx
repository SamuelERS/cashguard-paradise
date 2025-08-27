import { motion } from "framer-motion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

export const FloatingOrbs = () => {
  const isVisible = usePageVisibility();
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{
        contain: "layout style paint",
        contentVisibility: "auto"
      }}
    >
      {/* Large orbs with iOS blue gradient colors - responsive sizes */}
      <motion.div
        className="absolute w-48 h-48 md:w-64 lg:w-96 md:h-64 lg:h-96 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, rgba(10, 132, 255, 0.3) 0%, transparent 70%)`,
          filter: "blur(40px)",
          willChange: "transform",
          transform: "translateZ(0)" // Force GPU acceleration
        }}
        animate={isVisible ? {
          x: [0, 50, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        } : {}}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          pause: !isVisible
        }}
        initial={{ x: "5%", y: "10%" }}
      />

      <motion.div
        className="absolute w-40 h-40 md:w-56 lg:w-80 md:h-56 lg:h-80 rounded-full opacity-15"
        style={{
          background: `radial-gradient(circle, rgba(94, 92, 230, 0.4) 0%, transparent 70%)`,
          filter: "blur(35px)",
          willChange: "transform",
          transform: "translateZ(0)" // Force GPU acceleration
        }}
        animate={isVisible ? {
          x: [0, -40, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.95, 1.05, 1],
        } : {}}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -10,
          pause: !isVisible
        }}
        initial={{ x: "50%", y: "40%" }}
      />

      <motion.div
        className="absolute w-32 h-32 md:w-48 lg:w-64 md:h-48 lg:h-64 rounded-full opacity-25"
        style={{
          background: `radial-gradient(circle, rgba(48, 209, 88, 0.3) 0%, transparent 70%)`,
          filter: "blur(30px)",
          willChange: "transform",
          transform: "translateZ(0)" // Force GPU acceleration
        }}
        animate={isVisible ? {
          x: [0, 30, -40, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.05, 0.95, 1],
        } : {}}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -20,
          pause: !isVisible
        }}
        initial={{ x: "30%", y: "60%" }}
      />

      {/* Grid pattern overlay - more subtle */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(10, 132, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 132, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 30s linear infinite'
        }}
      />
    </div>
  );
};