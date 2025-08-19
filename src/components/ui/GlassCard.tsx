import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard = ({ children, className, hover = false, glow = false }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "backdrop-blur-xl bg-glass-bg border border-glass-border shadow-glass rounded-xl",
        hover && "hover:bg-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300",
        glow && "shadow-lg shadow-primary/20",
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};