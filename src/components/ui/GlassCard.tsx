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
        "glass-card",
        hover && "hover:shadow-lg hover:shadow-primary/25 hover:border-primary/20",
        glow && "shadow-lg shadow-primary/30",
        className
      )}
      whileHover={hover ? { scale: 1.005, y: -1 } : undefined}
      transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
    >
      {children}
    </motion.div>
  );
};