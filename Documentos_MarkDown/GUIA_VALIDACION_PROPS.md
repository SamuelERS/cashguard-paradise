# 🛡️ Guía de Validación de Props - Paradise System Labs

**Documento creado:** 01/10/2025  
**Versión:** 1.0  
**Resuelve:** Bug #12 - Falta Validación de Props en Algunos Componentes

---

## 📋 Resumen Ejecutivo

Esta guía documenta las mejores prácticas para validación de props en componentes React TypeScript, con enfoque en prevenir errores runtime y mejorar la experiencia del desarrollador.

---

## ✅ Estado Actual de Validaciones

### Componentes con Validación Completa

#### 1. **CashCalculation.tsx**
```typescript
// ✅ Validación de datos antes de generar reportes
if (!calculationData || !store || !cashier || !witness) {
  toast.error("❌ Error", {
    description: "Faltan datos necesarios para generar el reporte"
  });
  return;
}

// ✅ Early return si calculationData es null
if (!calculationData) {
  return <LoadingState />;
}

// ✅ Optional chaining en renderizado
{store?.name}
{cashier?.name}
{witness?.name}
```

#### 2. **MorningVerification.tsx**
```typescript
// ✅ Optional chaining con fallbacks
Sucursal: ${store?.name || 'N/A'}
Cajero Entrante: ${cashierIn?.name || 'N/A'}
Cajero Saliente: ${cashierOut?.name || 'N/A'}
```

#### 3. **CashCounter.tsx**
```typescript
// ✅ Validación null-check antes de pasar props
if (!deliveryCalculation) {
  return null;
}
return <Phase2Manager deliveryCalculation={deliveryCalculation} />;
```

#### 4. **GuidedDenominationItem.tsx**
```typescript
// ✅ Validación de callbacks opcionales
if (!isAccessible && onAttemptAccess) {
  onAttemptAccess();
}
```

---

## 🛠️ Utilities de Validación Disponibles

### Archivo: `/utils/propValidation.ts`

#### **requireProp<T>**
Valida que un valor no sea null ni undefined
```typescript
const validatedStore = requireProp(store, 'store', 'CashCalculation');
```

#### **requireNonEmptyString**
Valida que un string no esté vacío
```typescript
const validatedName = requireNonEmptyString(name, 'name', 'EmployeeCard');
```

#### **requireNonEmptyArray**
Valida que un array no esté vacío
```typescript
const steps = requireNonEmptyArray(deliverySteps, 'deliverySteps', 'Phase2Manager');
```

#### **requirePositiveNumber**
Valida que un número sea positivo
```typescript
const amount = requirePositiveNumber(expectedSales, 'expectedSales', 'CashCalculation');
```

#### **requireOneOf**
Valida que un valor esté en un enum
```typescript
const mode = requireOneOf(operationMode, ['morning', 'evening'], 'operationMode', 'CashCounter');
```

#### **withOptionalProp**
Wrapper seguro para props opcionales
```typescript
const result = withOptionalProp(onCancel, (callback) => callback());
```

#### **getOrDefault**
Obtiene valor con fallback
```typescript
const tabIndex = getOrDefault(props.tabIndex, 0);
```

---

## 📐 Mejores Prácticas

### 1. **Props Requeridas**
```typescript
interface ComponentProps {
  // ✅ BIEN: Type non-nullable
  userId: string;
  count: number;
  items: Item[];
}

// ❌ MAL: Props críticas como opcionales
interface ComponentProps {
  userId?: string;  // Puede causar errores runtime
}
```

### 2. **Optional Chaining para Datos Externos**
```typescript
// ✅ BIEN: Datos de API o funciones que retornan undefined
const userName = user?.name || 'Usuario Desconocido';
const storeAddress = getStoreById(id)?.address ?? 'Sin dirección';

// ❌ MAL: Acceso directo sin validación
const userName = user.name;  // Error si user es undefined
```

### 3. **Early Returns para Validación**
```typescript
// ✅ BIEN: Validar al inicio del componente
function Component({ data }: Props) {
  if (!data) {
    return <LoadingState />;
  }
  
  // Código puede asumir que data existe
  return <div>{data.name}</div>;
}

// ❌ MAL: Validaciones esparcidas
function Component({ data }: Props) {
  return (
    <div>
      {data && data.name}  // Validación inline repetitiva
      {data?.address}
    </div>
  );
}
```

### 4. **Validación de Callbacks Opcionales**
```typescript
// ✅ BIEN: Verificar antes de llamar
if (onComplete) {
  onComplete(result);
}

// También válido con optional chaining
onComplete?.(result);

// ❌ MAL: Asumir que existe
onComplete(result);  // Error si undefined
```

### 5. **Default Props con Destructuring**
```typescript
// ✅ BIEN: Defaults en destructuring
function Component({ 
  variant = 'primary',
  size = 'md',
  disabled = false 
}: Props) {
  // variant, size, disabled nunca son undefined
}

// ❌ MAL: Validación manual
function Component({ variant, size, disabled }: Props) {
  const actualVariant = variant || 'primary';  // Redundante
}
```

### 6. **Type Guards para Validación Compleja**
```typescript
// ✅ BIEN: Type guard personalizado
function isValidUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'name' in user
  );
}

function Component({ data }: Props) {
  if (!isValidUser(data)) {
    return <ErrorState />;
  }
  
  // TypeScript sabe que data es User aquí
  return <div>{data.name}</div>;
}
```

---

## 🚨 Casos de Uso Comunes

### Validar Datos de getStoreById
```typescript
const store = getStoreById(storeId);

// ✅ OPCIÓN 1: Optional chaining con fallback
<p>{store?.name || 'Sucursal no encontrada'}</p>

// ✅ OPCIÓN 2: Early return
if (!store) {
  return <ErrorState message="Sucursal no encontrada" />;
}
return <StoreDetails store={store} />;
```

### Validar Arrays Antes de map()
```typescript
// ✅ BIEN: Validar antes de iterar
if (!items || items.length === 0) {
  return <EmptyState />;
}

return (
  <ul>
    {items.map(item => <Item key={item.id} {...item} />)}
  </ul>
);

// ❌ MAL: map() sin validar
return items.map(...);  // Error si items es undefined
```

### Validar Props de Componentes Padre
```typescript
// ✅ BIEN: Validar en padre antes de pasar a hijo
function Parent() {
  if (!deliveryCalculation) {
    return null;  // o <LoadingState />
  }
  
  return <Child calculation={deliveryCalculation} />;
}

// Hijo puede asumir que prop es válida
interface ChildProps {
  calculation: DeliveryCalculation;  // No opcional
}
```

---

## 🎯 Checklist de Validación

Antes de commitear un componente nuevo, verificar:

- [ ] Props requeridas tienen tipos non-nullable
- [ ] Props opcionales usan `?:` en TypeScript
- [ ] Datos externos usan optional chaining (`?.`)
- [ ] Arrays se validan antes de `.map()`, `.filter()`, etc.
- [ ] Callbacks opcionales se verifican antes de llamar
- [ ] Early returns para casos de error o loading
- [ ] Fallbacks (`|| 'default'`) para valores de UI
- [ ] Type guards para datos complejos
- [ ] Mensajes de error informativos en desarrollo

---

## 📊 Métricas de Validación

**Estado actual del proyecto:**
- ✅ Componentes críticos: 100% validados
- ✅ getStoreById/getEmployeeById: Usan optional chaining
- ✅ Props de cálculos: Validadas en componentes padre
- ✅ Callbacks opcionales: Verificados antes de invocar

**Archivos con validaciones completas:**
- CashCalculation.tsx
- MorningVerification.tsx
- CashCounter.tsx
- Phase2Manager.tsx
- GuidedDenominationItem.tsx

---

## 🔧 Herramientas de Desarrollo

### ESLint Rules Activas
```json
{
  "@typescript-eslint/no-non-null-assertion": "error",
  "@typescript-eslint/strict-boolean-expressions": "warn",
  "@typescript-eslint/no-unnecessary-condition": "warn"
}
```

### TypeScript strictNullChecks
```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "strict": true
  }
}
```

---

## 📚 Referencias

- [TypeScript Handbook - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Optional Chaining MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

---

**Última actualización:** 01/10/2025  
**Próxima revisión:** Mensual o cuando se agreguen nuevos componentes críticos
