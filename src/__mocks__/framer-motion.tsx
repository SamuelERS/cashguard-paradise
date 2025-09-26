// 🤖 [IA] - Mock completo de Framer Motion para testing - TEST-RESILIENCE-FORTIFICATION
import React from 'react';

// Mock para todos los componentes motion.*
export const motion = {
  div: React.forwardRef<HTMLDivElement, any>(({
    children,
    onClick,
    onKeyDown,
    className,
    style,
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    variants,
    role,
    tabIndex,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed,
    'aria-disabled': ariaDisabled,
    'data-testid': dataTestId,
    ...props
  }, ref) => (
    <div
      ref={ref}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={className}
      style={style}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-disabled={ariaDisabled}
      data-testid={dataTestId}
      {...props}
    >
      {children}
    </div>
  )),

  span: React.forwardRef<HTMLSpanElement, any>(({
    children,
    onClick,
    className,
    style,
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    variants,
    ...props
  }, ref) => (
    <span
      ref={ref}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </span>
  )),

  button: React.forwardRef<HTMLButtonElement, any>(({
    children,
    onClick,
    className,
    style,
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    variants,
    ...props
  }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </button>
  )),

  img: React.forwardRef<HTMLImageElement, any>(({
    src,
    alt,
    onClick,
    className,
    style,
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    variants,
    ...props
  }, ref) => (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    />
  ))
};

// Mock para AnimatePresence - renderiza children inmediatamente sin animaciones
export const AnimatePresence: React.FC<{
  children?: React.ReactNode;
  initial?: boolean;
  mode?: string;
  onExitComplete?: () => void;
}> = ({ children, onExitComplete }) => {
  // Simular el callback de exit complete
  React.useEffect(() => {
    if (onExitComplete) {
      onExitComplete();
    }
  }, [onExitComplete]);

  return <>{children}</>;
};

// Mock para hooks de animación
export const useAnimation = () => ({
  start: () => Promise.resolve(true),
  stop: () => {},
  set: () => {},
  mount: () => {},
  unmount: () => {}
});

export const useMotionValue = (initialValue: any) => ({
  get: () => initialValue,
  set: () => {},
  onChange: () => {},
  destroy: () => {}
});

export const useTransform = (value: any, inputRange: number[], outputRange: any[]) => ({
  get: () => outputRange[0],
  set: () => {},
  onChange: () => {},
  destroy: () => {}
});

export const useSpring = (value: any, config?: any) => ({
  get: () => value,
  set: () => {},
  onChange: () => {},
  destroy: () => {}
});

export const useMotionTemplate = (...args: any[]) => ({
  get: () => '',
  set: () => {},
  onChange: () => {},
  destroy: () => {}
});

// Mock para variantes y transiciones
export const Variants = {};

// Mock para utilidades de animación
export const animate = () => Promise.resolve(true);
export const stagger = (delay: number) => delay;

// Mock para LayoutGroup
export const LayoutGroup: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// Mock para Reorder components (si se usan)
export const Reorder = {
  Group: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  )),
  Item: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  ))
};

// Mock para LazyMotion y domAnimation (para optimización)
export const LazyMotion: React.FC<{
  children?: React.ReactNode;
  features?: any;
  strict?: boolean;
}> = ({ children }) => <>{children}</>;

export const domAnimation = {};
export const m = motion; // Alias común para motion

// Exportar como default también
export default {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
  animate,
  stagger,
  LayoutGroup,
  Reorder,
  LazyMotion,
  domAnimation,
  m
};