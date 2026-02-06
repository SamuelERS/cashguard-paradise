# 🛡️ ARQUITECTURA ENV-SENTINEL

## Sistema Nervioso Central de Configuración

**Versión:** 1.0.0
**Fecha:** 2026-01-21
**Autor:** Claude Opus (Diseño Arquitectónico)
**Estado:** Diseño Completo - Pendiente Implementación

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Diagnóstico del Estado Actual](#2-diagnóstico-del-estado-actual)
3. [Inventario de Variables](#3-inventario-de-variables)
4. [Arquitectura del Sentinel](#4-arquitectura-del-sentinel)
5. [Esquema Zod Maestro](#5-esquema-zod-maestro)
6. [Flujo de Arranque](#6-flujo-de-arranque)
7. [Estrategia de Persistencia](#7-estrategia-de-persistencia)
8. [Pseudocódigo de Implementación](#8-pseudocódigo-de-implementación)
9. [Librerías Recomendadas](#9-librerías-recomendadas)
10. [Plan de Migración](#10-plan-de-migración)

---

## 1. Resumen Ejecutivo

### El Problema

El sistema actual trata las variables de entorno como **archivos de texto dispersos** (`.env`) que:
- Se pierden, se borran o se desactualizan
- No tienen validación unificada
- Están duplicadas entre servicios con nombres diferentes
- Contienen secretos en texto plano
- Fallan silenciosamente cuando faltan

### La Solución

**Env-Sentinel** es un módulo guardián que actúa como **Sistema Nervioso Central** de configuración:

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENV-SENTINEL                              │
│              "Single Source of Truth" (SSOT)                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Validator   │  │   Injector   │  │   Monitor    │           │
│  │  (Zod)       │  │   (Runtime)  │  │   (WebSocket)│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    VAULT (Encrypted)                        │ │
│  │  API Keys | JWT Secrets | DB Passwords | Service Tokens    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ WPPConnect│        │ Bridge   │        │ Memory   │
    │ Server   │        │ API      │        │ API      │
    └──────────┘        └──────────┘        └──────────┘
```

### Principios de Diseño

1. **Autónomo:** Funciona en Local, Docker y Producción sin cambiar código
2. **Proactivo:** Alerta vía WebSocket si detecta problemas en runtime
3. **Centralizado:** Ningún servicio lee `.env` directamente
4. **Seguro:** Secretos encriptados en vault SQLite
5. **Resiliente:** Fallbacks inteligentes y recuperación automática

---

## 2. Diagnóstico del Estado Actual

### 2.1 Fragmentación de Configuración

| Componente | Archivo | Método de Validación |
|------------|---------|---------------------|
| Bridge API | `src/config/index.ts` | Joi Schema |
| Memory API | `src/config/config.ts` | Funciones helper manuales |
| WPPConnect | `src/config-module/*` | Builder pattern + Validator propio |
| PM2 | `ecosystem.config.js` | Carga manual de .env |

**Problema:** 4 sistemas diferentes de validación, sin coherencia entre ellos.

### 2.2 Duplicación de Variables Críticas

Variables que DEBEN coincidir entre servicios pero tienen nombres diferentes:

| Bridge API | Memory API | WPPConnect | Propósito |
|------------|------------|------------|-----------|
| `MEMORY_API_KEY` | `API_KEY_MEMORY` | `MEMORY_API_KEY` | Auth Memory API |
| `WPPCONNECT_API_KEY` | - | `API_KEY` | Auth WPPConnect |
| `INTERNAL_SERVICE_TOKEN` | `INTERNAL_API_TOKEN` | `INTERNAL_API_TOKEN` | Auth Inter-servicio |
| `JWT_SECRET` | - | - | Tokens JWT |

**Problema:** Un error de sincronización causa Auth failures en cascada.

### 2.3 Archivos .env Dispersos

```
/
├── .env.master (legacy fallback)
├── .env.development
├── .env.production.local
├── .env.production.docker
├── bridge-api/
│   ├── .env
│   └── .env.example
├── memory-api/
│   ├── .env
│   └── .env.example
├── wppconnect-server/
│   ├── .env
│   └── .env.example
└── dashboard_lovable/
    └── .env.example
```

**Problema:** 9+ archivos de configuración sin sincronización automática.

### 2.4 Secretos en Texto Plano

```env
# .env.master (ACTUAL - INSEGURO)
JWT_SECRET=super-secret-jwt-key-2025-production
OPENAI_API_KEY=sk-proj-abc123xyz...
WOOCOMMERCE_CONSUMER_SECRET=cs_live_abc123...
```

**Problema:** Cualquiera con acceso al repo tiene todos los secretos.

---

## 3. Inventario de Variables

### 3.1 Matriz Unificada (100+ variables)

#### Variables Compartidas (CRÍTICAS)

| Variable | Bridge | Memory | WPPConnect | Dashboard | Tipo | Sensible |
|----------|--------|--------|------------|-----------|------|----------|
| `JWT_SECRET` | ✅ | ❌ | ❌ | ❌ | string | 🔐 |
| `MEMORY_API_KEY` | ✅ | ✅¹ | ✅ | ❌ | string(32+) | 🔐 |
| `WPPCONNECT_API_KEY` | ✅ | ❌ | ✅² | ✅ | string | 🔐 |
| `INTERNAL_API_TOKEN` | ✅³ | ✅ | ✅ | ❌ | string | 🔐 |
| `SESSION_SECRET` | ✅ | ❌ | ❌ | ❌ | string | 🔐 |
| `OPENAI_API_KEY` | ❌ | ❌ | ✅ | ❌ | string | 🔐 |

¹ = `API_KEY_MEMORY`
² = `API_KEY`
³ = `INTERNAL_SERVICE_TOKEN`

#### Variables por Servicio

**Bridge API (35 variables):**
```typescript
// Server
NODE_ENV, PORT, APP_ENV

// JWT
JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN

// Service URLs
WPPCONNECT_URL, MEMORY_API_URL, QUEUE_SERVICE_URL

// API Keys
WPPCONNECT_API_KEY, MEMORY_API_KEY, DASHBOARD_API_KEY

// CORS
CORS_ORIGIN, CORS_CREDENTIALS

// Rate Limit
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS

// Logging
LOG_LEVEL, LOG_DIR

// Database
DATABASE_URL

// Security
BCRYPT_ROUNDS, SESSION_SECRET, WC_INTERNAL_API_KEY, INTERNAL_SERVICE_TOKEN

// Email (SMTP)
SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
SMTP_FROM_EMAIL, SMTP_FROM_NAME
EMAIL_VERIFICATION_URL, PASSWORD_RESET_URL

// WooCommerce
WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET
WC_SYNC_ENABLED, WC_SYNC_ON_STARTUP, WC_DATABASE_PATH
// ... +15 más

// Identity Console
IDENTITY_CONSOLE_DB_PATH, IDENTITY_CONSOLE_MAX_RULES
IDENTITY_CONSOLE_CACHE_TTL_MS
```

**Memory API (25 variables):**
```typescript
// Server
PORT, NODE_ENV

// Database
DB_PATH, DB_MAX_CONNECTIONS, DB_BUSY_TIMEOUT

// Auth
API_KEY_MEMORY

// Redis
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB, REDIS_KEY_PREFIX

// Rate Limit
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
RATE_LIMIT_MESSAGE, RATE_LIMIT_CLEANUP_INTERVAL_MS
PUBLIC_RATE_LIMIT_MAX_REQUESTS, STRICT_RATE_LIMIT_MAX_REQUESTS

// Logging
LOG_LEVEL, LOG_MAX_FILES, LOG_MAX_SIZE

// Identity Console Integration
BRIDGE_API_URL, INTERNAL_API_TOKEN
IDENTITY_CONSOLE_TIMEOUT_MS, IDENTITY_CONSOLE_CACHE_TTL_MS
IDENTITY_CONSOLE_ENABLED
```

**WPPConnect Server (45 variables):**
```typescript
// Server
NODE_ENV, PORT, API_KEY

// WhatsApp
WHATSAPP_SESSION_NAME, WHATSAPP_TOKENS_DIR, WHATSAPP_AUTO_CLOSE_TIMEOUT
WHATSAPP_OPERATION_TIMEOUT, WHATSAPP_MAX_RECONNECT_ATTEMPTS
WHATSAPP_RECONNECT_DELAY, HEALTH_CHECK_INTERVAL
WHATSAPP_HEALTH_CHECK_INTERVAL, MAX_HEALTH_FAILURES

// AI
AI_PROVIDER, OPENAI_API_KEY, GEMINI_API_KEY, AI_MODEL
AI_TIMEOUT_MS, AI_MAX_TOKENS
BUSINESS_NAME, BUSINESS_TYPE

// Memory API
MEMORY_API_URL, MEMORY_API_KEY, MEMORY_API_ENABLED
MEMORY_API_TIMEOUT, MEMORY_API_MAX_RETRIES, MEMORY_API_CACHE_TTL

// Bridge API
BRIDGE_API_URL, BRIDGE_API_KEY, INTERNAL_API_TOKEN

// WooCommerce
WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET

// Logging
LOG_LEVEL, LOG_TO_FILE, LOG_DIR, LOG_FILE_NAME
MAX_LOG_SIZE, MAX_LOG_FILES, VISUAL_LOGS, DEBUG_MODE

// Retry/DLQ
RETRY_MAX_ATTEMPTS, RETRY_INITIAL_DELAY_MS, RETRY_FACTOR, RETRY_MAX_DELAY_MS
DLQ_DIR, DLQ_FILE_PATTERN, DLQ_RETRY_INTERVAL, DLQ_MAX_RETRY_COUNT

// Multimedia
SEND_MEDIA_METADATA_ONLY, MEDIA_BASE64_TRUNCATE_THRESHOLD

// Identity Console
IDENTITY_CONSOLE_ENABLED, IDENTITY_CONSOLE_TIMEOUT_MS, IDENTITY_CONSOLE_CACHE_TTL_MS

// Search Transformer
SEARCH_TRANSFORMER_ENABLED, SEARCH_TRANSFORMER_TIMEOUT_MS, SEARCH_TRANSFORMER_CACHE_TTL_MS

// RAG
RAG_ENABLED
```

---

## 4. Arquitectura del Sentinel

### 4.1 Diagrama de Componentes

```
                    ┌─────────────────────────────────────┐
                    │           ENV-SENTINEL              │
                    │         (Proceso Principal)         │
                    │                                     │
                    │  ┌───────────┐   ┌───────────────┐  │
                    │  │ Bootstrap │──▶│ ConfigLoader  │  │
                    │  │  Module   │   │ (Multi-source)│  │
                    │  └───────────┘   └───────────────┘  │
                    │         │               │           │
                    │         ▼               ▼           │
                    │  ┌───────────────────────────────┐  │
                    │  │        ZodValidator           │  │
                    │  │ (Schema + Type Coercion)      │  │
                    │  └───────────────────────────────┘  │
                    │         │               │           │
                    │         ▼               ▼           │
                    │  ┌─────────────┐ ┌───────────────┐  │
                    │  │   Vault    │ │  Reconciler   │  │
                    │  │ (Encrypted)│ │ (Sync Aliases)│  │
                    │  └─────────────┘ └───────────────┘  │
                    │         │               │           │
                    │         ▼               ▼           │
                    │  ┌───────────────────────────────┐  │
                    │  │        ConfigInjector         │  │
                    │  │   (process.env population)    │  │
                    │  └───────────────────────────────┘  │
                    │         │                           │
                    │         ▼                           │
                    │  ┌───────────────────────────────┐  │
                    │  │      HealthMonitor            │  │
                    │  │  (WebSocket Broadcaster)      │  │
                    │  └───────────────────────────────┘  │
                    └─────────────────┬───────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │    WPPConnect   │     │    Bridge API   │     │   Memory API    │
    │    (Hijo PM2)   │     │    (Hijo PM2)   │     │    (Hijo PM2)   │
    │                 │     │                 │     │                 │
    │ process.env     │     │ process.env     │     │ process.env     │
    │ ├─ API_KEY      │     │ ├─ JWT_SECRET   │     │ ├─ API_KEY_MEM..│
    │ ├─ MEMORY_API...│     │ ├─ MEMORY_API...│     │ ├─ BRIDGE_API...│
    │ └─ (inyectado)  │     │ └─ (inyectado)  │     │ └─ (inyectado)  │
    └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 4.2 Módulos del Sentinel

#### 4.2.1 Bootstrap Module
Punto de entrada que orquesta el flujo de carga.

```typescript
// sentinel/src/bootstrap.ts
export async function bootstrap(): Promise<SentinelConfig> {
  // 1. Determinar entorno
  const env = detectEnvironment(); // dev | staging | prod | docker

  // 2. Cargar configuración de múltiples fuentes
  const rawConfig = await loadConfiguration(env);

  // 3. Validar con Zod
  const validatedConfig = validateWithSchema(rawConfig);

  // 4. Reconciliar aliases (MEMORY_API_KEY ↔ API_KEY_MEMORY)
  const reconciledConfig = reconcileAliases(validatedConfig);

  // 5. Desencriptar secretos del vault
  const finalConfig = await decryptSecrets(reconciledConfig);

  // 6. Inyectar en process.env para servicios hijos
  injectToProcessEnv(finalConfig);

  // 7. Iniciar monitor de salud
  startHealthMonitor(finalConfig);

  return finalConfig;
}
```

#### 4.2.2 ConfigLoader (Multi-source)
Carga configuración de múltiples fuentes con prioridad.

```typescript
// sentinel/src/loaders/config-loader.ts
export async function loadConfiguration(env: Environment): Promise<RawConfig> {
  const sources: ConfigSource[] = [
    // Prioridad 1: Variables de sistema (ya en process.env)
    new SystemEnvSource(),

    // Prioridad 2: Vault encriptado (si existe)
    new VaultSource('./data/sentinel-vault.db'),

    // Prioridad 3: Archivo .env específico del entorno
    new DotEnvSource(`.env.${env}`),

    // Prioridad 4: Archivo .env genérico
    new DotEnvSource('.env'),

    // Prioridad 5: .env.master (legacy)
    new DotEnvSource('.env.master'),

    // Prioridad 6: Defaults del esquema Zod
    new DefaultsSource(),
  ];

  // Merge con prioridad (primera fuente gana)
  return mergeConfigs(sources);
}
```

#### 4.2.3 Reconciler (Alias Synchronizer)
Sincroniza variables duplicadas entre servicios.

```typescript
// sentinel/src/reconciler.ts
const ALIAS_MAP: Record<string, string[]> = {
  // Clave canónica -> Aliases
  'MEMORY_API_KEY': ['API_KEY_MEMORY'],
  'WPPCONNECT_API_KEY': ['API_KEY', 'WHATSAPP_API_KEY'],
  'INTERNAL_API_TOKEN': ['INTERNAL_SERVICE_TOKEN'],
};

export function reconcileAliases(config: Record<string, unknown>): Record<string, unknown> {
  const reconciled = { ...config };

  for (const [canonical, aliases] of Object.entries(ALIAS_MAP)) {
    // Encontrar el valor definido (prioridad al canónico)
    const value = reconciled[canonical]
      || aliases.find(alias => reconciled[alias]);

    if (value) {
      // Propagar a todas las variantes
      reconciled[canonical] = value;
      aliases.forEach(alias => reconciled[alias] = value);
    }
  }

  return reconciled;
}
```

#### 4.2.4 HealthMonitor (WebSocket Broadcaster)
Monitorea cambios y alerta vía WebSocket.

```typescript
// sentinel/src/health-monitor.ts
export class HealthMonitor {
  private wss: WebSocketServer;
  private checkInterval: NodeJS.Timer;

  constructor(port: number = 8083) {
    this.wss = new WebSocketServer({ port });
  }

  start(config: SentinelConfig) {
    this.checkInterval = setInterval(() => {
      const issues = this.detectIssues(config);

      if (issues.length > 0) {
        this.broadcast({
          type: 'config-warning',
          timestamp: new Date().toISOString(),
          issues: issues,
          severity: this.calculateSeverity(issues),
        });
      }
    }, 30000); // Cada 30 segundos
  }

  private detectIssues(config: SentinelConfig): ConfigIssue[] {
    const issues: ConfigIssue[] = [];

    // Verificar API Keys activas
    if (!config.secrets.OPENAI_API_KEY && config.features.AI_ENABLED) {
      issues.push({
        code: 'MISSING_AI_KEY',
        message: 'OpenAI API Key no configurada pero AI está habilitado',
        severity: 'warning',
        recommendation: 'Configure OPENAI_API_KEY o deshabilite AI_ENABLED',
      });
    }

    // Verificar expiración de tokens
    if (this.isTokenExpiringSoon(config.secrets.JWT_SECRET)) {
      issues.push({
        code: 'JWT_ROTATION_NEEDED',
        message: 'JWT Secret debería rotarse pronto',
        severity: 'info',
      });
    }

    return issues;
  }
}
```

---

## 5. Esquema Zod Maestro

### 5.1 Schema Unificado

```typescript
// sentinel/src/schemas/master.schema.ts
import { z } from 'zod';

// ============================================================================
// TIPOS BASE REUTILIZABLES
// ============================================================================

const PortSchema = z.coerce.number().int().min(1).max(65535);
const UrlSchema = z.string().url();
const ApiKeySchema = z.string().min(32, 'API Key debe tener mínimo 32 caracteres');
const SecretSchema = z.string().min(16, 'Secret debe tener mínimo 16 caracteres');
const BooleanStringSchema = z.enum(['true', 'false']).transform(v => v === 'true');
const DurationMsSchema = z.coerce.number().int().min(0);

// ============================================================================
// SCHEMAS POR DOMINIO
// ============================================================================

const ServerConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

const PortsConfigSchema = z.object({
  WPPCONNECT_PORT: PortSchema.default(3000),
  MEMORY_API_PORT: PortSchema.default(3001),
  BRIDGE_API_PORT: PortSchema.default(8080),
  DASHBOARD_LOVABLE_PORT: PortSchema.default(5173),
  DASHBOARD_MONITOR_PORT: PortSchema.default(8081),
  WEBSOCKET_PORT: PortSchema.default(8082),
  SENTINEL_PORT: PortSchema.default(8083),
});

const ServiceUrlsSchema = z.object({
  WPPCONNECT_URL: UrlSchema.default('http://localhost:3000'),
  MEMORY_API_URL: UrlSchema.default('http://localhost:3001/api/v1'),
  BRIDGE_API_URL: UrlSchema.default('http://localhost:8080'),
  QUEUE_SERVICE_URL: UrlSchema.default('http://localhost:8082'),
});

const SecretsSchema = z.object({
  JWT_SECRET: SecretSchema,
  SESSION_SECRET: SecretSchema,

  // API Keys (con aliases reconciliados)
  MEMORY_API_KEY: ApiKeySchema,
  API_KEY_MEMORY: ApiKeySchema.optional(), // Alias → reconciled to MEMORY_API_KEY

  WPPCONNECT_API_KEY: z.string().min(16),
  API_KEY: z.string().min(16).optional(), // Alias → reconciled to WPPCONNECT_API_KEY

  INTERNAL_API_TOKEN: SecretSchema,
  INTERNAL_SERVICE_TOKEN: SecretSchema.optional(), // Alias

  DASHBOARD_API_KEY: z.string().min(16),
  WC_INTERNAL_API_KEY: z.string().optional(),
});

const AIConfigSchema = z.object({
  AI_PROVIDER: z.enum(['openai', 'gemini', 'mock']).default('openai'),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  GEMINI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_TIMEOUT_MS: DurationMsSchema.default(10000),
  AI_MAX_TOKENS: z.coerce.number().int().min(1).max(4096).default(500),
  RAG_ENABLED: BooleanStringSchema.default('true'),
});

const DatabaseConfigSchema = z.object({
  DATABASE_URL: z.string().default('./data/bridge-api.db'),
  DB_PATH: z.string().default('./data/memory-api.db'),
  WC_DATABASE_PATH: z.string().default('./data/woocommerce.db'),
  IDENTITY_CONSOLE_DB_PATH: z.string().default('./data/identity-console.db'),
  DB_BUSY_TIMEOUT: DurationMsSchema.default(5000),
});

const RedisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: PortSchema.default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).max(15).default(0),
  REDIS_KEY_PREFIX: z.string().default('paradise:'),
});

const SMTPConfigSchema = z.object({
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: PortSchema.default(587),
  SMTP_SECURE: BooleanStringSchema.default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().default('noreply@paradisesystemlabs.com'),
  SMTP_FROM_NAME: z.string().default('Paradise System Labs'),
  EMAIL_VERIFICATION_URL: UrlSchema.default('http://localhost:5173/verify-email'),
  PASSWORD_RESET_URL: UrlSchema.default('http://localhost:5173/reset-password'),
});

const WooCommerceConfigSchema = z.object({
  WOOCOMMERCE_URL: UrlSchema.optional(),
  WOOCOMMERCE_CONSUMER_KEY: z.string().startsWith('ck_').optional(),
  WOOCOMMERCE_CONSUMER_SECRET: z.string().startsWith('cs_').optional(),
  WC_SYNC_ENABLED: BooleanStringSchema.default('true'),
  WC_SYNC_ON_STARTUP: BooleanStringSchema.default('true'),
  WC_SYNC_PRODUCTS_INTERVAL: DurationMsSchema.default(7200000),
});

const WhatsAppConfigSchema = z.object({
  WHATSAPP_SESSION_NAME: z.string().default('default'),
  WHATSAPP_TOKENS_DIR: z.string().default('./tokens'),
  WHATSAPP_AUTO_CLOSE_TIMEOUT: DurationMsSchema.default(300000),
  WHATSAPP_OPERATION_TIMEOUT: DurationMsSchema.default(45000),
  WHATSAPP_MAX_RECONNECT_ATTEMPTS: z.coerce.number().int().min(1).default(10),
  WHATSAPP_RECONNECT_DELAY: DurationMsSchema.default(3000),
  WHATSAPP_HEALTH_CHECK_INTERVAL: DurationMsSchema.default(30000),
  MAX_HEALTH_FAILURES: z.coerce.number().int().min(1).default(2),
});

const LoggingConfigSchema = z.object({
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_TO_FILE: BooleanStringSchema.default('true'),
  LOG_DIR: z.string().default('./logs'),
  LOG_MAX_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.string().default('14d'),
  VISUAL_LOGS: BooleanStringSchema.default('true'),
  DEBUG_MODE: BooleanStringSchema.default('false'),
});

const RateLimitConfigSchema = z.object({
  RATE_LIMIT_WINDOW_MS: DurationMsSchema.default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(100),
  PUBLIC_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(1000),
  STRICT_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(10),
});

const JWTConfigSchema = z.object({
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const IdentityConsoleConfigSchema = z.object({
  IDENTITY_CONSOLE_ENABLED: BooleanStringSchema.default('true'),
  IDENTITY_CONSOLE_TIMEOUT_MS: DurationMsSchema.default(5000),
  IDENTITY_CONSOLE_CACHE_TTL_MS: DurationMsSchema.default(60000),
  IDENTITY_CONSOLE_MAX_RULES: z.coerce.number().int().min(1).default(20),
  IDENTITY_CONSOLE_MAX_FAQS: z.coerce.number().int().min(1).default(100),
});

// ============================================================================
// SCHEMA MAESTRO UNIFICADO
// ============================================================================

export const MasterConfigSchema = z.object({
  // Servidor
  ...ServerConfigSchema.shape,

  // Puertos
  ...PortsConfigSchema.shape,

  // URLs de Servicios
  ...ServiceUrlsSchema.shape,

  // Secretos (SENSIBLES)
  ...SecretsSchema.shape,

  // Configuración de IA
  ...AIConfigSchema.shape,

  // Bases de Datos
  ...DatabaseConfigSchema.shape,

  // Redis
  ...RedisConfigSchema.shape,

  // Email/SMTP
  ...SMTPConfigSchema.shape,

  // WooCommerce
  ...WooCommerceConfigSchema.shape,

  // WhatsApp
  ...WhatsAppConfigSchema.shape,

  // Logging
  ...LoggingConfigSchema.shape,

  // Rate Limiting
  ...RateLimitConfigSchema.shape,

  // JWT
  ...JWTConfigSchema.shape,

  // Identity Console
  ...IdentityConsoleConfigSchema.shape,

  // Monitoring
  HEALTH_CHECK_INTERVAL: DurationMsSchema.default(30000),
  METRICS_ENABLED: BooleanStringSchema.default('true'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:8081'),
  CORS_CREDENTIALS: BooleanStringSchema.default('true'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(10),
  DEV_BYPASS_AUTH: BooleanStringSchema.default('false'),
});

export type MasterConfig = z.infer<typeof MasterConfigSchema>;

// ============================================================================
// VALIDACIÓN CON MENSAJES AMIGABLES
// ============================================================================

export function validateConfig(raw: unknown): MasterConfig {
  const result = MasterConfigSchema.safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      received: (issue as any).received,
    }));

    console.error('\n❌ [Env-Sentinel] VALIDACIÓN FALLIDA:');
    errors.forEach(err => {
      console.error(`   • ${err.path}: ${err.message}`);
    });
    console.error('\n');

    throw new ConfigValidationError(errors);
  }

  return result.data;
}
```

### 5.2 Validaciones Especiales

```typescript
// sentinel/src/schemas/validators.ts

/**
 * Valida formato de API Key de OpenAI
 */
export const OpenAIKeySchema = z.string()
  .regex(/^sk-[a-zA-Z0-9]{48,}$/, 'OpenAI API Key debe tener formato sk-...')
  .or(z.literal('')); // Permitir vacío (modo mock)

/**
 * Valida que MEMORY_API_URL termine en /api/v1
 */
export const MemoryApiUrlSchema = z.string()
  .url()
  .refine(
    url => url.endsWith('/api/v1'),
    'MEMORY_API_URL DEBE terminar en /api/v1'
  );

/**
 * Valida coherencia entre servicios
 */
export function validateCrossServiceConsistency(config: MasterConfig): void {
  const issues: string[] = [];

  // MEMORY_API_KEY debe coincidir con API_KEY_MEMORY
  if (config.MEMORY_API_KEY !== config.API_KEY_MEMORY) {
    issues.push('MEMORY_API_KEY y API_KEY_MEMORY deben ser idénticos');
  }

  // Si AI_PROVIDER=openai, debe existir OPENAI_API_KEY
  if (config.AI_PROVIDER === 'openai' && !config.OPENAI_API_KEY) {
    issues.push('AI_PROVIDER=openai requiere OPENAI_API_KEY configurada');
  }

  // WooCommerce requiere ambas credenciales
  if (config.WOOCOMMERCE_URL && (!config.WOOCOMMERCE_CONSUMER_KEY || !config.WOOCOMMERCE_CONSUMER_SECRET)) {
    issues.push('WOOCOMMERCE_URL requiere CONSUMER_KEY y CONSUMER_SECRET');
  }

  if (issues.length > 0) {
    throw new CrossServiceValidationError(issues);
  }
}
```

---

## 6. Flujo de Arranque

### 6.1 Diagrama de Secuencia

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PM2       │     │  Sentinel   │     │   Bridge    │     │  WPPConnect │
│             │     │   (Master)  │     │    API      │     │   Server    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Start          │                   │                   │
       │──────────────────▶│                   │                   │
       │                   │                   │                   │
       │                   │ 2. LoadConfig()   │                   │
       │                   │───────┐           │                   │
       │                   │       │ .env files│                   │
       │                   │◀──────┘ + vault   │                   │
       │                   │                   │                   │
       │                   │ 3. Validate(Zod)  │                   │
       │                   │───────┐           │                   │
       │                   │       │ Schema    │                   │
       │                   │◀──────┘ Check     │                   │
       │                   │                   │                   │
       │                   │ 4. Reconcile      │                   │
       │                   │    Aliases        │                   │
       │                   │───────┐           │                   │
       │                   │       │ Sync      │                   │
       │                   │◀──────┘ Keys      │                   │
       │                   │                   │                   │
       │                   │                   │                   │
       │        ┌──────────┴──────────┐        │                   │
       │        │ 5. ¿Validation OK?  │        │                   │
       │        └──────────┬──────────┘        │                   │
       │                   │                   │                   │
       │              SÍ   │   NO              │                   │
       │                   │────────────────▶ ABORT (exit 1)       │
       │                   │                   │                   │
       │                   │                   │                   │
       │                   │ 6. Inject to      │                   │
       │                   │    process.env    │                   │
       │                   │───────┐           │                   │
       │                   │       │           │                   │
       │                   │◀──────┘           │                   │
       │                   │                   │                   │
       │                   │ 7. Fork Child     │                   │
       │                   │──────────────────▶│                   │
       │                   │                   │                   │
       │                   │ 8. Fork Child     │                   │
       │                   │───────────────────┼──────────────────▶│
       │                   │                   │                   │
       │                   │ 9. Start Health   │                   │
       │                   │    Monitor        │                   │
       │                   │───────┐           │                   │
       │                   │       │ WS:8083   │                   │
       │                   │◀──────┘           │                   │
       │                   │                   │                   │
       │                   │ 10. Ready         │                   │
       │◀──────────────────│                   │                   │
       │                   │                   │                   │
```

### 6.2 Pseudocódigo del Flujo

```typescript
// sentinel/src/index.ts - Entry Point

import { bootstrap } from './bootstrap';
import { forkServices } from './process-manager';
import { HealthMonitor } from './health-monitor';

async function main() {
  console.log('🛡️  [Env-Sentinel] Iniciando Sistema Nervioso Central...\n');

  try {
    // ========================================
    // FASE 1: CARGA Y VALIDACIÓN
    // ========================================
    console.log('📥 [1/6] Cargando configuración de múltiples fuentes...');
    const config = await bootstrap();
    console.log('   ✅ Configuración cargada\n');

    // ========================================
    // FASE 2: VERIFICACIÓN DE SECRETOS
    // ========================================
    console.log('🔐 [2/6] Verificando secretos críticos...');
    const missingSecrets = verifySecrets(config);

    if (missingSecrets.length > 0) {
      console.error('\n❌ SECRETOS FALTANTES (requeridos en producción):');
      missingSecrets.forEach(s => console.error(`   • ${s}`));

      if (config.NODE_ENV === 'production') {
        console.error('\n🛑 ABORT: No se puede iniciar en producción sin secretos.\n');
        process.exit(1);
      } else {
        console.warn('\n⚠️  ADVERTENCIA: Usando valores de desarrollo.\n');
      }
    } else {
      console.log('   ✅ Todos los secretos presentes\n');
    }

    // ========================================
    // FASE 3: INYECCIÓN EN PROCESS.ENV
    // ========================================
    console.log('💉 [3/6] Inyectando configuración en process.env...');
    injectToProcessEnv(config);
    console.log('   ✅ Variables inyectadas\n');

    // ========================================
    // FASE 4: FORK DE SERVICIOS HIJOS
    // ========================================
    console.log('🚀 [4/6] Iniciando servicios hijos...');
    const services = await forkServices(config, [
      { name: 'memory-api', script: './memory-api/dist/server.js' },
      { name: 'bridge-api', script: './bridge-api/dist/index.js' },
      { name: 'wppconnect', script: './wppconnect-server/dist/server.js' },
    ]);
    console.log(`   ✅ ${services.length} servicios iniciados\n`);

    // ========================================
    // FASE 5: HEALTH MONITOR
    // ========================================
    console.log('🏥 [5/6] Iniciando monitor de salud (WebSocket :8083)...');
    const monitor = new HealthMonitor(8083);
    monitor.start(config);
    console.log('   ✅ Monitor activo\n');

    // ========================================
    // FASE 6: RESUMEN FINAL
    // ========================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('🛡️  ENV-SENTINEL ACTIVO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Entorno:          ${config.NODE_ENV}`);
    console.log(`   Servicios:        ${services.length} activos`);
    console.log(`   Health Monitor:   ws://localhost:8083`);
    console.log(`   Vault:            ${config._vaultEnabled ? 'HABILITADO' : 'DESHABILITADO'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Mantener proceso vivo
    process.on('SIGTERM', () => gracefulShutdown(services, monitor));
    process.on('SIGINT', () => gracefulShutdown(services, monitor));

  } catch (error) {
    console.error('\n💥 [Env-Sentinel] ERROR FATAL:', error.message);
    console.error('   El sistema NO puede iniciar con configuración inválida.\n');
    process.exit(1);
  }
}

main();
```

---

## 7. Estrategia de Persistencia

### 7.1 Vault Encriptado (SQLite + AES-256)

```typescript
// sentinel/src/vault/vault.service.ts

import Database from 'better-sqlite3';
import crypto from 'crypto';

const VAULT_PATH = './data/sentinel-vault.db';
const ALGORITHM = 'aes-256-gcm';

export class VaultService {
  private db: Database.Database;
  private masterKey: Buffer;

  constructor() {
    this.masterKey = this.deriveMasterKey();
    this.db = new Database(VAULT_PATH);
    this.initSchema();
  }

  /**
   * Deriva master key de VAULT_PASSPHRASE o genera una de hardware ID
   */
  private deriveMasterKey(): Buffer {
    const passphrase = process.env.VAULT_PASSPHRASE
      || this.getHardwareFingerprint();

    return crypto.pbkdf2Sync(
      passphrase,
      'paradise-sentinel-salt-v1',
      100000, // Iteraciones (resistente a brute force)
      32,     // 256 bits
      'sha512'
    );
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS secrets (
        key TEXT PRIMARY KEY,
        encrypted_value BLOB NOT NULL,
        iv BLOB NOT NULL,
        auth_tag BLOB NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        rotated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        key TEXT NOT NULL,
        actor TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Almacena un secreto encriptado
   */
  setSecret(key: string, value: string): void {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO secrets (key, encrypted_value, iv, auth_tag, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(key, encrypted, iv, authTag);

    // Audit log
    this.logAction('SET', key);
  }

  /**
   * Recupera un secreto desencriptado
   */
  getSecret(key: string): string | null {
    const stmt = this.db.prepare(`
      SELECT encrypted_value, iv, auth_tag FROM secrets WHERE key = ?
    `);
    const row = stmt.get(key) as {
      encrypted_value: Buffer;
      iv: Buffer;
      auth_tag: Buffer
    } | undefined;

    if (!row) return null;

    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, row.iv);
    decipher.setAuthTag(row.auth_tag);

    const decrypted = Buffer.concat([
      decipher.update(row.encrypted_value),
      decipher.final()
    ]);

    this.logAction('GET', key);
    return decrypted.toString('utf8');
  }

  /**
   * Lista todas las claves (sin valores)
   */
  listKeys(): string[] {
    const stmt = this.db.prepare('SELECT key FROM secrets');
    return stmt.all().map((row: any) => row.key);
  }

  /**
   * Rota un secreto (guarda el anterior con sufijo _prev)
   */
  rotateSecret(key: string, newValue: string): void {
    const current = this.getSecret(key);
    if (current) {
      this.setSecret(`${key}_prev`, current);
    }
    this.setSecret(key, newValue);

    // Marcar como rotado
    this.db.prepare(`
      UPDATE secrets SET rotated_at = CURRENT_TIMESTAMP WHERE key = ?
    `).run(key);
  }

  private logAction(action: string, key: string): void {
    this.db.prepare(`
      INSERT INTO audit_log (action, key, actor) VALUES (?, ?, ?)
    `).run(action, key, 'sentinel');
  }
}
```

### 7.2 Estructura del Vault

```sql
-- data/sentinel-vault.db

-- Tabla principal de secretos encriptados
CREATE TABLE secrets (
  key TEXT PRIMARY KEY,          -- Ej: 'JWT_SECRET', 'OPENAI_API_KEY'
  encrypted_value BLOB NOT NULL, -- Valor AES-256-GCM encriptado
  iv BLOB NOT NULL,              -- Vector de inicialización (16 bytes)
  auth_tag BLOB NOT NULL,        -- Tag de autenticación GCM
  created_at TEXT,
  updated_at TEXT,
  rotated_at TEXT                -- Última rotación
);

-- Auditoría de accesos
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY,
  action TEXT NOT NULL,          -- 'SET', 'GET', 'DELETE', 'ROTATE'
  key TEXT NOT NULL,
  actor TEXT,                    -- 'sentinel', 'admin', etc.
  timestamp TEXT
);

-- Ejemplo de datos (encriptados, no legibles):
-- INSERT INTO secrets VALUES ('JWT_SECRET', x'a1b2c3...', x'd4e5f6...', x'g7h8i9...');
```

### 7.3 CLI de Gestión del Vault

```bash
# Inicializar vault (primera vez)
$ npx sentinel vault init
  🔐 Vault inicializado en ./data/sentinel-vault.db
  ⚠️  IMPORTANTE: Guarda VAULT_PASSPHRASE en lugar seguro

# Agregar secreto
$ npx sentinel vault set JWT_SECRET
  Enter value (hidden): ********
  ✅ JWT_SECRET guardado en vault

# Listar claves
$ npx sentinel vault list
  Secrets in vault:
    • JWT_SECRET (updated: 2026-01-21)
    • OPENAI_API_KEY (updated: 2026-01-20)
    • MEMORY_API_KEY (updated: 2026-01-19)

# Rotar secreto
$ npx sentinel vault rotate JWT_SECRET
  Enter new value (hidden): ********
  ✅ JWT_SECRET rotado (anterior guardado como JWT_SECRET_prev)

# Exportar (solo para migración - PELIGROSO)
$ npx sentinel vault export --format=dotenv > secrets.env
  ⚠️  ADVERTENCIA: Este archivo contiene secretos en texto plano
```

---

## 8. Pseudocódigo de Implementación

### 8.1 Estructura de Carpetas

```
sentinel/
├── src/
│   ├── index.ts                 # Entry point
│   ├── bootstrap.ts             # Orquestador principal
│   │
│   ├── loaders/
│   │   ├── system-env.loader.ts # Lee process.env
│   │   ├── dotenv.loader.ts     # Lee archivos .env
│   │   ├── vault.loader.ts      # Lee vault encriptado
│   │   └── defaults.loader.ts   # Aplica defaults de Zod
│   │
│   ├── schemas/
│   │   ├── master.schema.ts     # Schema Zod unificado
│   │   ├── validators.ts        # Validaciones custom
│   │   └── service-profiles.ts  # Perfiles por servicio
│   │
│   ├── reconciler/
│   │   ├── alias-map.ts         # Mapa de aliases
│   │   └── reconciler.ts        # Sincronización de variables
│   │
│   ├── vault/
│   │   ├── vault.service.ts     # Encriptación/desencriptación
│   │   ├── vault-cli.ts         # Comandos CLI
│   │   └── key-derivation.ts    # Derivación de master key
│   │
│   ├── injector/
│   │   └── process-env.ts       # Inyección a process.env
│   │
│   ├── monitor/
│   │   ├── health-monitor.ts    # WebSocket broadcaster
│   │   └── issue-detector.ts    # Detección de problemas
│   │
│   ├── process-manager/
│   │   ├── fork-services.ts     # Fork de procesos hijos
│   │   └── graceful-shutdown.ts # Cierre elegante
│   │
│   └── types/
│       ├── config.types.ts      # Tipos de configuración
│       └── errors.types.ts      # Errores custom
│
├── bin/
│   └── sentinel                 # CLI ejecutable
│
├── package.json
├── tsconfig.json
└── README.md
```

### 8.2 Service Profiles (Config por Servicio)

```typescript
// sentinel/src/schemas/service-profiles.ts

/**
 * Define qué variables necesita cada servicio
 * El Sentinel solo inyecta las variables relevantes
 */
export const SERVICE_PROFILES = {
  'bridge-api': {
    required: [
      'NODE_ENV', 'PORT', 'JWT_SECRET', 'SESSION_SECRET',
      'MEMORY_API_URL', 'MEMORY_API_KEY', 'WPPCONNECT_URL', 'WPPCONNECT_API_KEY',
      'DASHBOARD_API_KEY', 'DATABASE_URL',
    ],
    optional: [
      'CORS_ORIGIN', 'BCRYPT_ROUNDS', 'LOG_LEVEL',
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
      'WOOCOMMERCE_URL', 'WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET',
    ],
    aliases: {
      'INTERNAL_SERVICE_TOKEN': 'INTERNAL_API_TOKEN',
    },
  },

  'memory-api': {
    required: [
      'NODE_ENV', 'PORT', 'API_KEY_MEMORY', 'DB_PATH',
    ],
    optional: [
      'REDIS_HOST', 'REDIS_PORT', 'BRIDGE_API_URL', 'INTERNAL_API_TOKEN',
      'IDENTITY_CONSOLE_ENABLED', 'LOG_LEVEL',
    ],
    aliases: {
      'API_KEY_MEMORY': 'MEMORY_API_KEY',
    },
  },

  'wppconnect': {
    required: [
      'NODE_ENV', 'PORT', 'API_KEY', 'MEMORY_API_URL', 'MEMORY_API_KEY',
    ],
    optional: [
      'AI_PROVIDER', 'OPENAI_API_KEY', 'GEMINI_API_KEY',
      'BRIDGE_API_URL', 'INTERNAL_API_TOKEN',
      'WHATSAPP_SESSION_NAME', 'WHATSAPP_TOKENS_DIR',
      'RAG_ENABLED', 'IDENTITY_CONSOLE_ENABLED',
    ],
    aliases: {
      'API_KEY': 'WPPCONNECT_API_KEY',
    },
  },

  'dashboard-lovable': {
    required: ['NODE_ENV', 'PORT'],
    optional: ['VITE_API_URL', 'VITE_WEBSOCKET_URL'],
    aliases: {},
  },

  'dashboard-monitor': {
    required: ['NODE_ENV', 'PORT', 'DASHBOARD_API_KEY'],
    optional: ['WPPCONNECT_API_KEY', 'MEMORY_API_KEY', 'JWT_SECRET'],
    aliases: {},
  },
};

export type ServiceName = keyof typeof SERVICE_PROFILES;
```

---

## 9. Librerías Recomendadas

### 9.1 Dependencias Core

| Librería | Propósito | Justificación |
|----------|-----------|---------------|
| `zod` | Validación de esquemas | Mejor DX que Joi, tipos inferidos automáticamente |
| `better-sqlite3` | Vault SQLite | Sync, rápido, sin dependencias nativas complicadas |
| `dotenv` | Parsing de .env | Estándar de la industria |
| `ws` | WebSocket server | Ligero, para HealthMonitor |
| `chalk` | Output coloreado | UX de CLI |
| `commander` | CLI framework | Para `npx sentinel vault *` |

### 9.2 package.json Recomendado

```json
{
  "name": "@paradise/sentinel",
  "version": "1.0.0",
  "description": "Sistema Nervioso Central de Configuración",
  "main": "dist/index.js",
  "bin": {
    "sentinel": "./bin/sentinel"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "vault": "ts-node src/vault/vault-cli.ts"
  },
  "dependencies": {
    "zod": "^3.22.4",
    "better-sqlite3": "^9.4.3",
    "dotenv": "^16.4.1",
    "ws": "^8.16.0",
    "chalk": "^5.3.0",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.8",
    "@types/ws": "^8.5.10",
    "@types/node": "^20.11.5",
    "typescript": "^5.5.4",
    "ts-node": "^10.9.2"
  }
}
```

### 9.3 Alternativas Evaluadas

| Alternativa | Descartada por |
|-------------|----------------|
| `dotenv-vault` | Requiere cuenta externa (Dotenv.org) |
| `envalid` | Menos flexible que Zod para schemas complejos |
| `node-config` | Orientado a JSON, no a .env |
| `HashiCorp Vault` | Overkill para el tamaño del proyecto |
| `AWS Secrets Manager` | Vendor lock-in, requiere AWS |

---

## 10. Plan de Migración

### 10.1 Fases de Implementación

```
FASE 1: Fundación (1-2 días)
├── Crear estructura sentinel/
├── Implementar MasterConfigSchema (Zod)
├── Implementar loaders básicos (dotenv, defaults)
└── Tests unitarios de validación

FASE 2: Vault (1 día)
├── Implementar VaultService (SQLite + AES-256)
├── CLI para gestión de secretos
└── Migrar secretos existentes al vault

FASE 3: Integración PM2 (1 día)
├── Modificar ecosystem.config.js para usar Sentinel
├── Implementar fork de servicios hijos
└── Tests de integración

FASE 4: Health Monitor (1 día)
├── Implementar WebSocket broadcaster
├── Detección de issues en runtime
└── Integración con Dashboard (opcional)

FASE 5: Rollout (1 día)
├── Documentación de migración
├── Actualizar .env.example de cada servicio
├── Deprecar carga directa de .env en servicios
└── Validación en staging/producción
```

### 10.2 Cambios en Servicios Existentes

#### ecosystem.config.js (MODIFICADO)

```javascript
// ANTES: Cada app tiene su bloque env con variables duplicadas
// DESPUÉS: Sentinel inyecta todo

// ecosystem.config.js
module.exports = {
  apps: [
    // El Sentinel es el proceso MAESTRO
    {
      name: 'sentinel',
      script: './sentinel/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        VAULT_PASSPHRASE: process.env.VAULT_PASSPHRASE || '',
      },
    },
    // Los demás servicios YA NO tienen bloque env
    // El Sentinel los forkea internamente con la config inyectada
  ],
};
```

#### Servicios Individuales (OPCIONAL - Fase Final)

```typescript
// bridge-api/src/config/index.ts

// ANTES
import dotenv from 'dotenv';
dotenv.config();
const envSchema = joi.object({...});

// DESPUÉS (cuando Sentinel esté activo)
// Ya no necesita dotenv ni validación propia
// Las variables ya están en process.env validadas por Sentinel

export const config = {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT!, 10),
  jwt: {
    secret: process.env.JWT_SECRET!,
    // ... El Sentinel garantiza que existen
  },
};
```

### 10.3 Backward Compatibility

Durante la transición, los servicios pueden seguir funcionando con su validación actual:

```typescript
// Detectar si Sentinel está activo
const sentinelActive = process.env.SENTINEL_INJECTED === 'true';

if (sentinelActive) {
  // Confiar en que las variables ya están validadas
  export const config = buildConfigFromEnv();
} else {
  // Fallback a validación legacy
  import dotenv from 'dotenv';
  dotenv.config();
  export const config = validateWithJoi(process.env);
}
```

---

## 11. Beneficios Esperados

| Métrica | Antes | Después |
|---------|-------|---------|
| Archivos de config | 9+ dispersos | 1 vault centralizado |
| Validación | 4 sistemas diferentes | 1 schema Zod |
| Secretos expuestos | En texto plano | Encriptados AES-256 |
| Detección de errores | Al fallar en runtime | Al arrancar (bloqueante) |
| Sincronización de aliases | Manual | Automática |
| Monitoreo de config | Ninguno | WebSocket en tiempo real |
| Tiempo de debug | Horas | Minutos |

---

## 12. Próximos Pasos

1. **Revisión del diseño** con el equipo
2. **Prototipo funcional** de Fase 1 (Schema + Loaders)
3. **Prueba de concepto** del Vault encriptado
4. **Integración gradual** empezando por desarrollo local
5. **Documentación de migración** para operadores

---

**Documento creado por:** Claude Opus
**Fecha:** 2026-01-21
**Estado:** Diseño Completo - Listo para Implementación

---

## 13. Guía Rápida de Operaciones (v2.9.24)

> **Estado:** ✅ IMPLEMENTADO Y FUNCIONANDO

### 13.1 Configuración de SENTINEL_MASTER_KEY

La `SENTINEL_MASTER_KEY` es la clave maestra para desencriptar el vault. **DEBE ser única por ambiente.**

#### Desarrollo Local
```bash
# Ya configurado en .env.development
SENTINEL_MASTER_KEY=e62fa1179f3f13910a4a84fb15b01b5f5eef451ea23f5dcca64601a508ac8a04
```

#### Producción (Coolify)
```bash
# Generar una clave DIFERENTE para producción:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Agregar en Coolify como Variable de Entorno:
# Name: SENTINEL_MASTER_KEY
# Value: <clave-generada>
# Type: Secret (encrypted)
```

### 13.2 Comandos Útiles

```bash
# Ver secretos en el vault
cd env-sentinel && node -e "
const {VaultService} = require('./dist/vault/vault.service');
const v = new VaultService({dbPath:'./data/sentinel-vault.db'});
console.log(v.listKeys());
v.close();
"

# Validar configuración actual
cd env-sentinel && npm run validate

# Migrar secretos desde .env al vault
cd env-sentinel && npx ts-node scripts/migrate-secrets.ts

# Rotar un secreto específico
cd env-sentinel && npx ts-node -e "
const {VaultService} = require('./dist/vault/vault.service');
const v = new VaultService({dbPath:'./data/sentinel-vault.db'});
v.rotateSecret('JWT_SECRET', require('crypto').randomBytes(64).toString('base64'));
console.log('✅ JWT_SECRET rotado');
v.close();
"
```

### 13.3 Flujo de Arranque PM2

```
pm2 start ecosystem.config.js
         ↓
1. loadEnvironmentLegacy() - Carga .env.development
         ↓
2. tryLoadFromSentinel() - Detecta SENTINEL_MASTER_KEY
         ↓
3. VaultService.open() - Abre vault con AES-256-GCM
         ↓
4. validateForPM2() - Valida 102+ variables con Zod
         ↓
5. injectConfig() - Inyecta secretos a process.env
         ↓
6. validateCriticalConfig() - Verifica MEMORY_API_URL
         ↓
✅ Servicios arrancan con configuración segura
```

### 13.4 Secretos Actuales en Vault (11)

| Secreto | Descripción |
|---------|-------------|
| `JWT_SECRET` | Firma de tokens JWT |
| `SESSION_SECRET` | Sesiones Express |
| `MEMORY_API_KEY` | Auth Memory API |
| `WPPCONNECT_API_KEY` | Auth WPPConnect |
| `DASHBOARD_API_KEY` | Auth Dashboard |
| `OPENAI_API_KEY` | API de OpenAI |
| `INTERNAL_API_TOKEN` | Auth inter-servicio |
| `WC_WEBHOOK_SECRET` | Webhooks WooCommerce |
| `WOOCOMMERCE_CONSUMER_KEY` | API WooCommerce |
| `WOOCOMMERCE_CONSUMER_SECRET` | API WooCommerce |
| `WC_INTERNAL_API_KEY` | WooCommerce interno |

### 13.5 Troubleshooting

**Error: "Usando hardware fingerprint como master key"**
- Causa: `SENTINEL_MASTER_KEY` no está en el archivo .env cargado
- Solución: Verificar que `.env.development` tiene la variable

**Error: "VaultDecryptionError"**
- Causa: El vault se creó con una clave diferente
- Solución: Regenerar vault con `migrate-secrets.ts`

**Error: "MEMORY_API_URL must end with /api/v1"**
- Causa: URL mal configurada
- Solución: Verificar que termina en `/api/v1`

---

**Última actualización:** 2026-01-22
**Versión:** 2.9.24
**Estado:** ✅ PRODUCCIÓN
