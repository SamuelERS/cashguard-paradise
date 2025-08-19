import { motion } from "framer-motion";

export const FloatingOrbs = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large orbs with new gradient colors */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%)`,
          filter: "blur(60px)"
        }}
        animate={{
          x: [0, 200, -100, 0],
          y: [0, -150, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        initial={{ x: "10%", y: "20%" }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-15"
        style={{
          background: `radial-gradient(circle, rgba(13, 115, 119, 0.4) 0%, transparent 70%)`,
          filter: "blur(50px)"
        }}
        animate={{
          x: [0, -180, 120, 0],
          y: [0, 100, -80, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -10
        }}
        initial={{ x: "70%", y: "60%" }}
      />

      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-25"
        style={{
          background: `radial-gradient(circle, rgba(20, 160, 133, 0.3) 0%, transparent 70%)`,
          filter: "blur(40px)"
        }}
        animate={{
          x: [0, 100, -150, 0],
          y: [0, -120, 80, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -20
        }}
        initial={{ x: "40%", y: "80%" }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 30s linear infinite'
        }}
      />
    </div>
  );
};