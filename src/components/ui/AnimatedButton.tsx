import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "glass" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  glow?: boolean;
}

export const AnimatedButton = ({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  loading = false,
  glow = false,
  disabled,
  ...props 
}: AnimatedButtonProps) => {
  const baseClasses = "relative overflow-hidden font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    glass: "glass-card hover:bg-primary/10 hover:border-primary/20 text-foreground",
    success: "btn-success",
    warning: "bg-gradient-to-r from-warning to-yellow-400 text-black focus:ring-warning shadow-lg shadow-warning/30",
    danger: "bg-gradient-to-r from-destructive to-red-400 text-white focus:ring-destructive shadow-lg shadow-destructive/30"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        glow && "animate-pulse-glow",
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -top-1 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 transition-transform duration-1000 hover:translate-x-[300%]" />
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};