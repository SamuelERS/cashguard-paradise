import { motion } from "framer-motion";

export const FloatingOrbs = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: "var(--gradient-orb-1)",
          top: "10%",
          left: "10%",
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, -200, -150, 0],
          scale: [1, 1.1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-15"
        style={{
          background: "var(--gradient-orb-2)",
          top: "60%",
          right: "20%",
        }}
        animate={{
          x: [0, -80, 30, 0],
          y: [0, -120, 50, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -10,
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-10"
        style={{
          background: "var(--gradient-orb-3)",
          bottom: "20%",
          left: "70%",
        }}
        animate={{
          x: [0, -60, 40, -20, 0],
          y: [0, 80, -40, 60, 0],
          scale: [1, 1.3, 0.7, 1.1, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -20,
        }}
      />
    </div>
  );
};