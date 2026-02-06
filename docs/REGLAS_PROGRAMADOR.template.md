# ✍️ Plantilla: Guía Práctica del Programador v1.0

> **Audiencia:** Programadores, desarrolladores nuevos, agentes IA.
> **Propósito:** Este documento es un tutorial práctico que muestra **CÓMO** aplicar los estándares del proyecto con ejemplos de código reales.

---

## 1. Misión del Programador: Incrementar la Inteligencia del Sistema

> **"Cada línea de código debe incrementar la inteligencia del sistema, no su complejidad."**

Tu objetivo es entregar código **predecible, mantenible e inteligible**.

---

## 2. Ejemplo Práctico: Evitar Monolitos

La regla de oro es: **"Si para agregar una función debo tocar muchas partes a la vez, el diseño es incorrecto."**

```typescript
// ❌ MAL: Función que valida, autoriza, parsea, guarda y notifica.
async function processMessage(message: any) {
    if (!message) return; // Validación
    const user = db.query('...'); // Autorización
    const parsed = JSON.parse(message.body); // Parsing
    db.insert('messages', parsed); // Guardado
    webhook.send(parsed); // Notificación
    // ... 200 líneas más
}

// ✅ BIEN: Una función orquesta, otras ejecutan.
function processMessage(message: WhatsAppMessage): Result {
    const validation = validateMessage(message);
    if (!validation.isValid) return validation.error;

    const auth = checkAuthorization(message.from);
    if (!auth.authorized) return auth.error;

    const savedMessage = saveMessageToDatabase(message);
    notifyWebhook(savedMessage);
    
    return { success: true };
}
```

---

## 3. Ejemplo Práctico: Comentar Código Profesionalmente

Comenta el **"porqué"** (la intención, la decisión), no el "qué" (lo que el código ya dice).

```typescript
// ❌ MAL: Comentario inútil que repite el código.
// Suma 1 al contador
counter = counter + 1;

// ✅ BIEN: Explica una decisión de diseño no obvia.
// Se incrementa el contador ANTES de la validación
// para incluir los intentos fallidos en las métricas.
counter = counter + 1;
if (validateState(counter)) {
    // ...
}
```

---

## 4. Ejemplo Práctico: Scripts Ordenados y Reutilizables

Todo script debe tener un encabezado que explique su propósito y uso.

```javascript
/**
 * Script: Limpiar logs antiguos del sistema.
 * Propósito: Elimina archivos de log con más de X días para evitar saturación.
 * Uso: node scripts/maintenance/clean-old-logs.js [dias]
 * Parámetros: dias (opcional) - Default: 30.
 */

// ...código del script...

// Permite ser importado por otros módulos sin ejecutarse
if (require.main === module) {
    // Lógica para ser ejecutado desde la línea de comandos
}
```

---

## 5. Ejemplo Práctico: Código Sólido y Autónomo

### Auto-Recuperación (Retry Logic)
Tu código no debe rendirse al primer fallo de conexión.
```typescript
async function connectToDatabase(): Promise<Connection> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const connection = await db.connect();
            return connection; // Éxito
        } catch (error) {
            logger.warn(`Fallo de conexión, reintentando... (${attempt}/${maxRetries})`);
            if (attempt === maxRetries) throw error; // Falla final
            await sleep(1000 * attempt); // Espera antes de reintentar
        }
    }
}
```

### Validación Exhaustiva
No confíes en ninguna entrada. Valida todo.
```typescript
function processPayment(amount: number, currency: string): Result {
    if (amount <= 0) {
        throw new ValidationError('El monto debe ser positivo');
    }
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
        throw new ValidationError(`Moneda no soportada: ${currency}`);
    }
    // ... resto de la lógica
}
```

---

## 6. Ejemplo Práctico: Variables de Entorno

### Validación al Inicio
El sistema debe fallar RÁPIDO si falta una variable de entorno, no en medio de una operación. Usa una librería como `zod` para validar `process.env` al arrancar la aplicación.

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']),
    API_PORT: z.string().transform(Number),
    DB_PASSWORD: z.string().min(8, 'La contraseña de BD debe tener al menos 8 caracteres'),
    JWT_SECRET: z.string().min(32),
});

// Esta línea se ejecuta una sola vez al iniciar la app.
// Si falta una variable o es incorrecta, la app crashea inmediatamente.
export const env = envSchema.parse(process.env);
```
Luego, en tu código, importa `env` en lugar de usar `process.env` directamente.
`import { env } from './config/env';`
`const port = env.API_PORT;`
