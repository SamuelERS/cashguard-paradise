# Reglas del Programador v3.1

**Guía práctica con ejemplos para desarrolladores - CashGuard Paradise**

> **Audiencia:** Programadores, desarrolladores nuevos, agentes IA
> **Tipo:** Tutorial práctico - Muestra CÓMO se aplican las reglas con ejemplos
> **Última actualización:** 2026-01-23
> **Proyecto:** CashGuard Paradise - Sistema anti-fraude para caja registradora

---

## Qué es este documento

Este documento es una **guía práctica con ejemplos extensos** de cómo aplicar los estándares del proyecto. Complementa a:

- [REGLAS_DE_LA_CASA.md](./REGLAS_DE_LA_CASA.md) - El POR QUÉ (gobernanza, filosofía)
- [REGLAS_DESARROLLO.md](REGLAS_DESARROLLO.md) - El QUÉ (estándares técnicos)

**Este documento muestra el CÓMO** con código real, tutoriales y ejemplos detallados.

---

## Contenido

1. [Misión del Programador](#1-misión-del-programador)
2. [Evitar Monolitos](#2-evitar-monolitos)
3. [Comentar Código Profesionalmente](#3-comentar-código-profesionalmente)
4. [Scripts Ordenados y Reutilizables](#4-scripts-ordenados-y-reutilizables)
5. [Código Sólido y Autónomo](#5-código-sólido-y-autónomo)
6. [Docker y Entorno](#6-docker-y-entorno)
7. [Gestión de Puertos](#7-gestión-de-puertos)
8. [Variables de Entorno](#8-variables-de-entorno)
9. [Checklist Oficial](#9-checklist-oficial)
10. [Reporte Ejecutivo](#10-reporte-ejecutivo)

---

## 1. Misión del Programador

### Principio Fundamental

> **"Cada línea de código debe incrementar la inteligencia del sistema, no su complejidad."**

### Objetivos

Entregar código que:
- Es limpio, comentado y organizado
- No es monolítico
- Reduce la complejidad
- Se mantiene solo sin intervención manual

### Características del Buen Código

| Característica | Significado |
|----------------|-------------|
| **Predecible** | Se comporta como se espera |
| **Mantenible** | Fácil de modificar sin romper |
| **Inteligible** | Cualquiera puede entenderlo |
| **Autónomo** | Se mantiene solo |

---

## 2. Evitar Monolitos

### Regla de Oro

> **"Si para agregar una función debo tocar muchas partes a la vez, ya hay un diseño incorrecto."**

### Ejemplo Práctico

```typescript
// ❌ MAL - Función monolítica (500+ líneas)
function processCashCount(cashData: any) {
    // Validación
    if (!cashData) return;
    if (!cashData.denominations) return;

    // Cálculo de billetes
    let billTotal = 0;
    billTotal += cashData.bill100 * 100;
    billTotal += cashData.bill50 * 50;
    billTotal += cashData.bill20 * 20;
    // ... 20 líneas más de billetes

    // Cálculo de monedas
    let coinTotal = 0;
    coinTotal += cashData.quarter * 0.25;
    // ... 30 líneas más de monedas

    // Cálculo de electrónicos
    let electronicTotal = 0;
    // ... 40 líneas más

    // Generación de reporte
    // ... 200 líneas más
}

// ✅ BIEN - Funciones modulares
function processCashCount(cashData: CashCount): CashCalculationResult {
    const validation = validateCashData(cashData);
    if (!validation.isValid) return validation;

    const billTotal = calculateBillTotal(cashData);
    const coinTotal = calculateCoinTotal(cashData);
    const electronicTotal = calculateElectronicTotal(cashData.electronic);

    const totalCash = billTotal + coinTotal;
    const totalGeneral = totalCash + electronicTotal;

    return buildCalculationResult(totalCash, electronicTotal, totalGeneral);
}

// Cada función hace UNA cosa
function validateCashData(cashData: CashCount): ValidationResult {
    if (!cashData) return { isValid: false, error: 'Cash data is null' };
    if (typeof cashData.penny !== 'number') return { isValid: false, error: 'Invalid penny count' };
    return { isValid: true };
}

function calculateBillTotal(cashData: CashCount): number {
    return (cashData.bill100 * 100) + (cashData.bill50 * 50) +
           (cashData.bill20 * 20) + (cashData.bill10 * 10) +
           (cashData.bill5 * 5) + (cashData.bill1 * 1);
}
```

### Qué Hacer si Heredas un Monolito

1. **Solo modificar lo necesario** para la tarea actual
2. **NUNCA** hacerlo más grande
3. **Proponer refactorización** futura si el módulo lo requiere
4. **Documentar el problema** en el código

```typescript
// Ejemplo de documentación de monolito heredado
/**
 * NOTA TÉCNICA: Este archivo es un monolito heredado de ~800 líneas.
 * Se mantiene intacto por compatibilidad.
 *
 * PLAN DE REFACTORIZACIÓN:
 * - Extraer validación a MessageValidator.ts
 * - Extraer parsing a MessageParser.ts
 * - Extraer notificaciones a NotificationService.ts
 *
 * Ver: docs/refactoring/legacy-handler-plan.md
 */
```

---

## 3. Comentar Código Profesionalmente

### Qué Comentar

```typescript
/**
 * Calcula la distribución óptima de efectivo para entrega a gerencia
 *
 * IMPORTANTE: Siempre debe quedar exactamente $50.00 en caja.
 * El algoritmo prioriza billetes grandes para la entrega.
 *
 * @param cashCount - Denominaciones contadas en caja
 * @returns Objeto con monto a entregar y denominaciones específicas
 *
 * Limitaciones:
 * - Solo funciona con denominaciones USD estándar
 * - Requiere que el total sea mayor a $50.00
 */
function calculateDeliveryDistribution(cashCount: CashCount): DeliveryCalculation {
    // Validar que hay suficiente efectivo para entregar
    // (si hay $50 o menos, se omite Phase 2 por diseño)
    const totalCash = calculateCashTotal(cashCount);
    if (totalCash <= 50) {
        return { shouldSkip: true, amountToDeliver: 0 };
    }

    // ... resto del código
}
```

### Qué NO Comentar

```typescript
// ❌ MAL - Obvio y redundante
// Suma 1 al contador
counter = counter + 1;

// Retorna verdadero
return true;

// ✅ BIEN - Explica decisión no obvia
// Incrementamos ANTES de validar para evitar race conditions
counter = counter + 1;
if (validateState()) {
    // ...
}
```

### Características de Buenos Comentarios

| Característica | Descripción |
|----------------|-------------|
| **Breves** | No novelas |
| **Precisos** | Explican el "por qué", no el "qué" obvio |
| **Útiles** | Aportan contexto no evidente |
| **Actualizados** | Coinciden con el código actual |

---

## 4. Scripts Ordenados y Reutilizables

### Estructura de Carpetas

```
/scripts/
├── operations/      # Scripts de operación (.bat/.ps1)
├── diagnostics/     # Scripts de diagnóstico
├── docker/          # Scripts de Docker
└── maintenance/     # Limpieza, backups, etc.
```

### Antes de Crear un Script

1. **Buscar** si ya existe uno similar
2. **Si existe:** Mejorarlo o extenderlo
3. **Si no existe:** Crear en la carpeta correcta con documentación

### Plantilla de Script Estándar

```javascript
/**
 * Script: Limpiar logs antiguos del sistema
 *
 * Propósito:
 *   Elimina archivos de log con más de 30 días de antigüedad
 *   para evitar saturación de disco.
 *
 * Uso:
 *   node scripts/maintenance/clean-old-logs.js [days]
 *
 * Parámetros:
 *   days (opcional) - Días de antigüedad. Default: 30
 *
 * Ejemplo:
 *   node scripts/maintenance/clean-old-logs.js 60
 *
 * Dependencias:
 *   - fs-extra
 *   - path
 *
 * Autor: [Tu nombre]
 * Fecha: 2025-12-26
 */

const fs = require('fs-extra');
const path = require('path');

// Configuración
const DEFAULT_DAYS = 30;
const LOGS_DIR = path.join(__dirname, '../../logs');

// Función principal
async function cleanOldLogs(daysOld = DEFAULT_DAYS) {
    console.log(`🧹 Limpiando logs más antiguos de ${daysOld} días...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const files = await fs.readdir(LOGS_DIR);
    let deleted = 0;

    for (const file of files) {
        const filePath = path.join(LOGS_DIR, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
            await fs.remove(filePath);
            deleted++;
            console.log(`  ✓ Eliminado: ${file}`);
        }
    }

    console.log(`\n✅ Limpieza completada. ${deleted} archivos eliminados.`);
    return deleted;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const days = parseInt(process.argv[2]) || DEFAULT_DAYS;
    cleanOldLogs(days)
        .then(() => process.exit(0))
        .catch(err => {
            console.error('❌ Error:', err.message);
            process.exit(1);
        });
}

module.exports = { cleanOldLogs };
```

### Reglas para Scripts

| Regla | Descripción |
|-------|-------------|
| Siempre en carpeta correcta | No dejarlos "sueltos" |
| Nombre descriptivo | `clean-old-logs.js`, no `script1.js` |
| Documentación completa | Qué hace, cómo se usa, qué necesita |
| Exportable | Poder usarlo como módulo |
| Sin hardcodear rutas | Usar paths relativos o ENV |

---

## 5. Código Sólido y Autónomo

### Auto-Recovery

```typescript
// ✅ BIEN - Sistema que se recupera solo
async function connectToDatabase(): Promise<Connection> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const connection = await db.connect();
            logger.info('Database connected', { attempt });
            return connection;
        } catch (error) {
            attempt++;
            logger.warn('Connection failed, retrying...', { attempt, error });
            await sleep(1000 * attempt); // Backoff exponencial
        }
    }

    throw new Error('Failed to connect after retries');
}
```

### Evitar Redundancias

```typescript
// ❌ MAL - Código duplicado
function formatUserName(user) {
    return user.firstName + ' ' + user.lastName;
}

function formatAgentName(agent) {
    return agent.firstName + ' ' + agent.lastName;
}

// ✅ BIEN - Función compartida
function formatFullName(person: { firstName: string, lastName: string }): string {
    return `${person.firstName} ${person.lastName}`.trim();
}

const userName = formatFullName(user);
const agentName = formatFullName(agent);
```

### Validación Exhaustiva

```typescript
// ✅ BIEN - Validación completa
function processPayment(amount: number, currency: string): PaymentResult {
    // Validar inputs
    if (amount <= 0) {
        throw new ValidationError('Amount must be positive');
    }

    if (!['USD', 'EUR', 'MXN'].includes(currency)) {
        throw new ValidationError(`Unsupported currency: ${currency}`);
    }

    // Validar estado del sistema
    if (!paymentGateway.isConnected()) {
        throw new ConnectionError('Payment gateway not available');
    }

    // Procesar
    return paymentGateway.process(amount, currency);
}
```

### Manejo de Errores Específico

```typescript
// ✅ BIEN - Errores específicos y recuperables
async function fetchUserData(userId: string): Promise<User> {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new UserNotFoundError(userId);
        }

        if (error.response?.status === 403) {
            throw new UnauthorizedError('No access to user data');
        }

        // Error genérico
        logger.error('Failed to fetch user', { userId, error });
        throw new Error('Failed to fetch user data');
    }
}
```

---

## 6. Docker y Entorno

### Cuándo Usar Docker

| Usar Docker | No Usar Docker |
|-------------|----------------|
| Base de datos (PostgreSQL, MongoDB) | Debug complejo con breakpoints |
| Redis, RabbitMQ | Hot-reload lento |
| Workers en background | Performance degradada en desarrollo |
| Deploy a producción | Conexiones a servicios externos locales |

### Regla General

> **"Todo lo que pueda vivir en Docker sin perjudicar el desarrollo, va en Docker."**

### docker-compose.yml Ejemplo

```yaml
version: '3.8'

services:
  # ✅ CashGuard PWA - Desarrollo con Vite
  cashguard:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev -- --host

  # ✅ Tests en Docker (recomendado para CI/CD)
  cashguard-test:
    build:
      context: .
      dockerfile: Dockerfile
    command: npm run test
    environment:
      - CI=true

volumes:
  node_modules:
```

> **Nota CashGuard:** Este proyecto es una PWA sin backend propio.
> Los datos se almacenan en localStorage del navegador.
> Docker se usa principalmente para tests y deployment.

### Si Trabajas Fuera de Docker

1. **El servicio final DEBE funcionar en Docker**
2. **Documentar la razón** en README
3. **Verificar que deploy a producción use Docker**

```markdown
# Desarrollo Local (Sin Docker)

**Razón:** Hot-reload de Vite es 10x más lento en Docker en Windows.

**Para desarrollo:**
npm install && npm run dev

**Para producción:**
docker-compose up --build
```

---

## 7. Gestión de Puertos

### Tabla de Puertos del Proyecto

| Servicio | Puerto | Protocolo | Descripción |
|----------|--------|-----------|-------------|
| CashGuard PWA (Dev) | 5173 | HTTP | Aplicación principal React + Vite |
| CashGuard PWA (Prod) | 443 | HTTPS | cashguard.paradisesystemlabs.com |
| E2E Tests (Playwright) | 5175 | HTTP | Servidor dedicado para tests |

> **Nota:** CashGuard es una PWA client-side. No requiere servicios backend.
> Los datos se persisten en localStorage del navegador del usuario.

### Antes de Iniciar una Tarea

1. **Revisar puertos usados** en docker-compose.yml y .env
2. **Elegir puerto libre**
3. **Documentar en 3 lugares:** .env, docker-compose, docs

### Verificar Puertos en Sistema

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
ss -tulpn | grep :3000
```

### Resolver Conflictos

```bash
# Error común
Error: listen EADDRINUSE: address already in use :::3000

# Solución 1: Matar proceso
kill -9 <PID>

# Solución 2: Cambiar puerto en .env
API_PORT=3001
```

---

## 8. Variables de Entorno

### Estructura Estándar

```bash
# .env.example - Template público (sí va en Git)
# .env - Valores locales (NO va en Git)
# .env.production - Producción (encriptado)
```

### Ejemplo Completo

```bash
# .env.example
# ======================
# CONFIGURACIÓN DEL PROYECTO
# ======================

# Node
NODE_ENV=development

# Servidor API
API_PORT=3000
API_HOST=localhost

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_db
DB_USER=admin
DB_PASSWORD=change_this_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# PWA Configuration
VITE_APP_NAME=CashGuard Paradise
VITE_APP_VERSION=3.0.1

# Deployment
SITEGROUND_FTP_HOST=paradisesystemlabs.com
SITEGROUND_FTP_USERNAME=your_ftp_user
SITEGROUND_FTP_PASSWORD=your_ftp_password

# Logging
LOG_LEVEL=debug
```

### Validación al Inicio

```typescript
// config/validate-env.ts
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    API_PORT: z.string().transform(Number),
    DB_HOST: z.string(),
    DB_PORT: z.string().transform(Number),
    DB_NAME: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string().min(8),
    JWT_SECRET: z.string().min(32),
});

// Validar al inicio - falla rápido si falta algo
export const env = envSchema.parse(process.env);
```

### Reglas de Variables de Entorno

| SIEMPRE | NUNCA |
|---------|-------|
| Agregar nueva variable a .env.example | Hardcodear valores en código |
| Usar valores de ejemplo | Commitear .env a Git |
| Documentar con comentarios | Usar valores de producción en desarrollo |
| Validar que existan al inicio | Dejar variables sin documentar |

---

## 9. Checklist Oficial

Antes de marcar una tarea como "terminada", responde SÍ a todas:

### Calidad de Código
- [ ] Evité crear monolitos
- [ ] Dividí en funciones pequeñas
- [ ] Nombres claros y descriptivos
- [ ] Código legible sin comentarios excesivos
- [ ] Sin código duplicado
- [ ] Sin código muerto

### Documentación
- [ ] Comenté partes complejas (el "por qué")
- [ ] Actualicé README si agregué funcionalidad
- [ ] JSDoc/TSDoc en funciones públicas

### Organización
- [ ] Archivos en carpeta correcta
- [ ] Scripts organizados (no "sueltos")
- [ ] Convenciones de naming respetadas

### Seguridad y Configuración
- [ ] Sin credenciales hardcodeadas
- [ ] Variables de entorno para configuración
- [ ] Input de usuario validado
- [ ] Sin info sensible en logs
- [ ] Nuevas variables en .env.example

### Docker y Entorno
- [ ] Docker usado cuando apropiado
- [ ] Sin conflictos de puertos
- [ ] Puerto documentado en 3 lugares
- [ ] Dependencias justificadas

### Testing
- [ ] Tests para funcionalidad crítica
- [ ] Casos edge cubiertos
- [ ] Todos los tests pasan
- [ ] Funcionalidad probada manualmente

### Autonomía del Sistema
- [ ] Manejo de errores sin crashear
- [ ] Retry logic donde necesario
- [ ] Logs suficientes para debugging

---

## 10. Reporte Ejecutivo

Al terminar cada sesión, entregar este reporte:

### Formato

```markdown
# Reporte Ejecutivo - [Fecha]

## 1. Resumen de lo Realizado

### Funcionalidades Desarrolladas
- [x] Feature 1: Descripción breve
- [x] Feature 2: Descripción breve
- [ ] Feature 3: En progreso (80%)

### Archivos Modificados
- `src/utils/calculations.ts` (+150, -30)
- `src/components/phases/Phase2Manager.tsx` (+50, -10)
- `src/utils/__tests__/calculations.test.ts` (+200, -0)

---

## 2. Estado del Sistema

### Indicadores
- ✅ Todos los tests pasando (45/45)
- ✅ Build exitoso sin warnings
- ⚠️ 2 warnings de deprecation (no críticos)

### Flujos Probados
- ✅ Conteo guiado de denominaciones
- ✅ Cálculo de entrega a gerencia
- ⏳ Generación de reporte WhatsApp (pendiente)

### Riesgos Detectados
- ⚠️ Performance issue potencial en verificación ciega con muchas denominaciones
- 💡 Sugerencia: Optimizar re-renders en Phase2VerificationSection

---

## 3. Próximos Pasos

### Qué Falta
- [ ] Completar tests de Phase2VerificationSection
- [ ] Agregar tests E2E para flujo completo
- [ ] Documentar hooks personalizados

### Qué se Sugiere Mejorar
- Refactorizar `CashCalculation.tsx` (componente grande)
- Extraer lógica de reportes a utils separado

---

## 4. Para Revisión

### Archivos Principales
1. `src/utils/calculations.ts` - Lógica core de cálculos
2. `src/components/phases/Phase2Manager.tsx` - Orquestador de fases

### Decisiones Técnicas
- Usé localStorage en vez de backend para persistencia PWA
- Implementé patrón de 3 fases (conteo → entrega → reporte)
```

---

## Referencias

| Documento | Propósito | Cuándo Consultar |
|-----------|-----------|------------------|
| [REGLAS_DE_LA_CASA.md](./REGLAS_DE_LA_CASA.md) | Gobernanza y filosofía | Para entender el POR QUÉ |
| [REGLAS_DESARROLLO.md](REGLAS_DESARROLLO.md) | Estándares técnicos | Para consultar el QUÉ |
| Este documento | Ejemplos prácticos | Para ver el CÓMO |

---

## Historial de Versiones

### v3.1 (2026-01-23) - Adaptación CashGuard Paradise
- Ejemplos actualizados para contexto CashGuard (conteo de caja, cálculos)
- Tabla de puertos simplificada (PWA sin backend)
- Docker config actualizado para PWA + tests
- Variables de entorno adaptadas para deployment SiteGround

### v3.0 (2025-12-26)
- Clarificado propósito como guía práctica con ejemplos
- Eliminada duplicación de estándares (ahora en REGLAS_DESARROLLO)
- Añadidas referencias cruzadas a otros documentos
- Simplificado contenido redundante
- Mantenidos ejemplos extensos de código
- Reducido de ~1780 líneas a ~600 líneas

### v2.0 (2025-12-21) - Operación "Cimientos de Cristal"
- Nueva sección Diccionario Oficial de Tipos
- Actualizada estructura de proyecto

### v1.0 (2025-12-10)
- Versión inicial

---

**Mantenedor:** Equipo de Desarrollo - CashGuard Paradise
**Proyecto:** Sistema anti-fraude de caja registradora para retail
