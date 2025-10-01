// 🤖 [IA] - v1.3.1: Runtime prop validation utilities
// Resuelve Bug #12: Falta Validación de Props en Algunos Componentes

/**
 * Valida que un valor no sea null ni undefined
 * @param value - El valor a validar
 * @param propName - Nombre de la prop para el mensaje de error
 * @param componentName - Nombre del componente para el mensaje de error
 * @returns El valor si es válido
 * @throws Error si el valor es null o undefined
 */
export function requireProp<T>(
  value: T | null | undefined,
  propName: string,
  componentName: string
): T {
  if (value === null || value === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[PropValidation] Required prop '${propName}' was not provided to '${componentName}'.`
      );
    }
    throw new Error(
      `${componentName}: Required prop '${propName}' is missing.`
    );
  }
  return value;
}

/**
 * Valida que un string no esté vacío
 * @param value - El string a validar
 * @param propName - Nombre de la prop
 * @param componentName - Nombre del componente
 * @returns El string si es válido
 * @throws Error si el string está vacío
 */
export function requireNonEmptyString(
  value: string | null | undefined,
  propName: string,
  componentName: string
): string {
  const required = requireProp(value, propName, componentName);
  if (required.trim() === '') {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[PropValidation] Prop '${propName}' in '${componentName}' cannot be an empty string.`
      );
    }
    throw new Error(
      `${componentName}: Prop '${propName}' cannot be empty.`
    );
  }
  return required;
}

/**
 * Valida que un array no esté vacío
 * @param value - El array a validar
 * @param propName - Nombre de la prop
 * @param componentName - Nombre del componente
 * @returns El array si es válido
 * @throws Error si el array está vacío
 */
export function requireNonEmptyArray<T>(
  value: T[] | null | undefined,
  propName: string,
  componentName: string
): T[] {
  const required = requireProp(value, propName, componentName);
  if (required.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[PropValidation] Prop '${propName}' in '${componentName}' cannot be an empty array.`
      );
    }
    throw new Error(
      `${componentName}: Prop '${propName}' cannot be empty.`
    );
  }
  return required;
}

/**
 * Valida que un número sea positivo
 * @param value - El número a validar
 * @param propName - Nombre de la prop
 * @param componentName - Nombre del componente
 * @returns El número si es válido
 * @throws Error si el número no es positivo
 */
export function requirePositiveNumber(
  value: number | null | undefined,
  propName: string,
  componentName: string
): number {
  const required = requireProp(value, propName, componentName);
  if (required <= 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[PropValidation] Prop '${propName}' in '${componentName}' must be positive. Received: ${required}`
      );
    }
    throw new Error(
      `${componentName}: Prop '${propName}' must be positive.`
    );
  }
  return required;
}

/**
 * Valida que un valor esté dentro de un enum
 * @param value - El valor a validar
 * @param validValues - Array de valores válidos
 * @param propName - Nombre de la prop
 * @param componentName - Nombre del componente
 * @returns El valor si es válido
 * @throws Error si el valor no está en el enum
 */
export function requireOneOf<T>(
  value: T | null | undefined,
  validValues: readonly T[],
  propName: string,
  componentName: string
): T {
  const required = requireProp(value, propName, componentName);
  if (!validValues.includes(required)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[PropValidation] Prop '${propName}' in '${componentName}' must be one of: [${validValues.join(', ')}]. Received: ${required}`
      );
    }
    throw new Error(
      `${componentName}: Prop '${propName}' must be one of: [${validValues.join(', ')}].`
    );
  }
  return required;
}

/**
 * Wrapper seguro para optional props
 * Retorna undefined si el valor es null/undefined, de lo contrario ejecuta el callback
 * @param value - El valor opcional
 * @param callback - Función a ejecutar si el valor existe
 * @returns El resultado del callback o undefined
 */
export function withOptionalProp<T, R>(
  value: T | null | undefined,
  callback: (val: T) => R
): R | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return callback(value);
}

/**
 * Obtiene un valor con fallback seguro
 * @param value - El valor a obtener
 * @param fallback - Valor por defecto si value es null/undefined
 * @returns El valor o el fallback
 */
export function getOrDefault<T>(
  value: T | null | undefined,
  fallback: T
): T {
  return value ?? fallback;
}

/**
 * Valida props de un componente al montarse
 * Útil para validación early en desarrollo
 * @param props - Objeto de props a validar
 * @param componentName - Nombre del componente
 */
export function validatePropsOnMount(
  props: Record<string, unknown>,
  componentName: string
): void {
  if (process.env.NODE_ENV === 'production') {
    return; // Skip en producción para performance
  }

  const requiredKeys = Object.keys(props).filter(
    key => props[key] === undefined || props[key] === null
  );

  if (requiredKeys.length > 0) {
    console.warn(
      `[PropValidation] ${componentName} received undefined/null props:`,
      requiredKeys
    );
  }
}
