// 🤖 [IA] - Mock completo de Framer Motion para testing - OPERACIÓN TIPADO ESTRICTO
import React, { CSSProperties, HTMLAttributes, ImgHTMLAttributes, ButtonHTMLAttributes } from 'react';

// Tipos para las propiedades de animación de Framer Motion
interface AnimationProps {
  initial?: Record<string, unknown> | boolean;
  animate?: Record<string, unknown> | string;
  exit?: Record<string, unknown> | string;
  transition?: Record<string, unknown>;
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
  variants?: Record<string, Record<string, unknown>>;
}

// Props para motion.div
interface MotionDivProps extends HTMLAttributes<HTMLDivElement>, AnimationProps {
  children?: React.ReactNode;
  'data-testid'?: string;
}

// Props para motion.span
interface MotionSpanProps extends HTMLAttributes<HTMLSpanElement>, AnimationProps {
  children?: React.ReactNode;
}

// Props para motion.button
interface MotionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, AnimationProps {
  children?: React.ReactNode;
}

// Props para motion.img
interface MotionImgProps extends ImgHTMLAttributes<HTMLImageElement>, AnimationProps {}

// Props para componentes Reorder
interface ReorderProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  value?: string | number;
  onReorder?: (newOrder: unknown[]) => void;
  axis?: 'x' | 'y';
}

// Mock para todos los componentes motion.*
export const motion = {
  div: React.forwardRef<HTMLDivElement, MotionDivProps>(({
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

  span: React.forwardRef<HTMLSpanElement, MotionSpanProps>(({
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

  button: React.forwardRef<HTMLButtonElement, MotionButtonProps>(({
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

  img: React.forwardRef<HTMLImageElement, MotionImgProps>(({
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

// Tipos para los valores de motion
type MotionValue<T = number> = {
  get: () => T;
  set: (value: T) => void;
  onChange: (callback: (value: T) => void) => void;
  destroy: () => void;
};

// Tipo para configuración de spring
interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

// Mock para hooks de animación
export const useAnimation = () => ({
  start: (definition?: Record<string, unknown>) => Promise.resolve(true),
  stop: () => {},
  set: (definition: Record<string, unknown>) => {},
  mount: () => {},
  unmount: () => {}
});

export const useMotionValue = <T = number>(initialValue: T): MotionValue<T> => ({
  get: () => initialValue,
  set: (value: T) => {},
  onChange: (callback: (value: T) => void) => {},
  destroy: () => {}
});

export const useTransform = <T = number>(
  value: MotionValue<number>,
  inputRange: number[],
  outputRange: T[]
): MotionValue<T> => ({
  get: () => outputRange[0],
  set: (val: T) => {},
  onChange: (callback: (value: T) => void) => {},
  destroy: () => {}
});

export const useSpring = <T = number>(
  value: T,
  config?: SpringConfig
): MotionValue<T> => ({
  get: () => value,
  set: (val: T) => {},
  onChange: (callback: (value: T) => void) => {},
  destroy: () => {}
});

export const useMotionTemplate = (
  strings: TemplateStringsArray,
  ...values: MotionValue<string | number>[]
): MotionValue<string> => ({
  get: () => '',
  set: (value: string) => {},
  onChange: (callback: (value: string) => void) => {},
  destroy: () => {}
});

// Mock para variantes y transiciones
export const Variants: Record<string, never> = {};

// Mock para utilidades de animación
export const animate = (
  from: number | string,
  to: number | string,
  options?: Record<string, unknown>
) => Promise.resolve(true);

export const stagger = (delay: number, options?: { startDelay?: number; from?: number | string }) => delay;

// Mock para LayoutGroup
export const LayoutGroup: React.FC<{ children?: React.ReactNode; id?: string }> = ({ children }) => (
  <>{children}</>
);

// Mock para Reorder components (si se usan)
export const Reorder = {
  Group: React.forwardRef<HTMLDivElement, ReorderProps>(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  )),
  Item: React.forwardRef<HTMLDivElement, ReorderProps>(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  ))
};

// Tipo para features de LazyMotion
type MotionFeatures = Record<string, unknown>;

// Mock para LazyMotion y domAnimation (para optimización)
export const LazyMotion: React.FC<{
  children?: React.ReactNode;
  features?: MotionFeatures;
  strict?: boolean;
}> = ({ children }) => <>{children}</>;

export const domAnimation: MotionFeatures = {};
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