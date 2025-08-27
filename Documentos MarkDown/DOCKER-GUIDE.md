# 🐳 Guía Completa de Docker para CashGuard Paradise v1.0.0

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura Docker](#arquitectura-docker)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Comandos y Operaciones](#comandos-y-operaciones)
5. [Desarrollo con Docker](#desarrollo-con-docker)
6. [Producción con Docker](#producción-con-docker)
7. [Troubleshooting](#troubleshooting)
8. [Mejores Prácticas](#mejores-prácticas)

## Introducción

CashGuard Paradise está completamente dockerizado, lo que significa que **NO necesitas instalar Node.js, npm, ni ninguna dependencia en tu máquina local**. Todo se ejecuta dentro de contenedores Docker.

### Ventajas de nuestra configuración

- ✅ **Zero instalación local**: No necesitas Node.js ni npm
- ✅ **Consistencia**: Mismo entorno para todos los desarrolladores
- ✅ **Aislamiento**: No hay conflictos con otras versiones de Node
- ✅ **Multi-stage build**: Imagen de producción optimizada (~30MB)
- ✅ **Hot-reload**: Cambios automáticos en desarrollo
- ✅ **Seguridad**: Contenedores ejecutan con usuarios no-root

## Arquitectura Docker

### Estructura de archivos

```
cashguard-paradise/
├── Dockerfile                 # Build multi-stage para producción
├── docker-compose.yml         # Orquestación con perfiles
├── .dockerignore             # Optimización del contexto
├── .env.example              # Variables de entorno de ejemplo
├── infra/
│   └── nginx.conf            # Configuración de Nginx para SPA
├── Scripts/
│   └── docker-commands.sh    # Script helper con comandos
└── Documentos MarkDown/
    └── DOCKER-GUIDE.md       # Esta guía
```

### Dockerfile Multi-stage

```dockerfile
# Stage 1: Builder (node:20-alpine)
- Instala dependencias con npm ci
- Compila la aplicación con npm run build
- ~1GB temporalmente

# Stage 2: Production (nginx:alpine)
- Copia solo archivos compilados
- Configuración optimizada de Nginx
- Usuario no-root para seguridad
- ~30MB imagen final
```

### Docker Compose con Perfiles

| Perfil | Servicio | Puerto | Imagen | Descripción |
|--------|----------|--------|---------|-------------|
| `dev` | cashguard-dev | 5173 | node:20-alpine | Desarrollo con hot-reload |
| `prod` | cashguard-prod | 8080 | nginx:alpine | Producción optimizada |

## Instalación y Configuración

### Prerrequisitos

1. **Docker Desktop** (incluye Docker Compose)
   - [Windows](https://docs.docker.com/desktop/install/windows-install/)
   - [Mac](https://docs.docker.com/desktop/install/mac-install/)
   - [Linux](https://docs.docker.com/desktop/install/linux-install/)

2. **Verificar instalación:**
```bash
docker --version
docker compose version
```

### Configuración inicial

1. **Clonar el repositorio:**
```bash
git clone <YOUR_GIT_URL>
cd cashguard-paradise
```

2. **Configurar variables de entorno:**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env  # o usar cualquier editor
```

3. **Variables requeridas:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Comandos y Operaciones

### Script Helper (Recomendado)

```bash
# Ver todos los comandos disponibles
./Scripts/docker-commands.sh

# Desarrollo
./Scripts/docker-commands.sh dev          # Iniciar desarrollo
./Scripts/docker-commands.sh dev:build    # Rebuild y desarrollo

# Producción
./Scripts/docker-commands.sh prod         # Iniciar producción
./Scripts/docker-commands.sh prod:build   # Build y producción

# Mantenimiento
./Scripts/docker-commands.sh stop         # Detener todo
./Scripts/docker-commands.sh clean        # Limpiar todo
./Scripts/docker-commands.sh status       # Ver estado
./Scripts/docker-commands.sh logs [prod|dev]  # Ver logs
./Scripts/docker-commands.sh shell [prod|dev] # Entrar al contenedor
```

### Docker Compose Directamente

```bash
# Desarrollo
docker compose --profile dev up           # Iniciar
docker compose --profile dev up --build   # Rebuild
docker compose --profile dev down         # Detener
docker compose --profile dev logs -f      # Ver logs

# Producción
docker compose --profile prod up -d       # Iniciar (background)
docker compose --profile prod build       # Solo build
docker compose --profile prod down        # Detener
docker compose --profile prod logs -f     # Ver logs

# Ambos perfiles
docker compose --profile dev --profile prod down  # Detener todo
```

## Desarrollo con Docker

### Flujo de trabajo

1. **Iniciar contenedor de desarrollo:**
```bash
./Scripts/docker-commands.sh dev
```

2. **Acceder a la aplicación:**
```
http://localhost:5173
```

3. **Hot-reload automático:**
- Los cambios en el código se reflejan automáticamente
- No necesitas reiniciar el contenedor

### Estructura del contenedor dev

```yaml
- Imagen: node:20-alpine
- Puerto: 5173
- Volúmenes:
  - Código fuente montado para hot-reload
  - node_modules aislado del host
- Comando: npm install && npm run dev
```

### Debugging en desarrollo

```bash
# Ver logs en tiempo real
docker compose --profile dev logs -f

# Entrar al contenedor
docker exec -it cashguard-paradise-dev sh

# Dentro del contenedor
npm list              # Ver dependencias
npm run lint         # Ejecutar linter
npm run build        # Probar build
```

## Producción con Docker

### Build de producción

```bash
# Build y ejecutar
./Scripts/docker-commands.sh prod:build

# Solo build
docker compose --profile prod build
```

### Características de producción

- **Nginx Alpine**: Servidor web ligero y rápido
- **Gzip**: Compresión automática de assets
- **Cache headers**: Optimización de caché del navegador
- **Security headers**: XSS, Frame Options, etc.
- **Health check**: Endpoint `/health` para monitoreo
- **Usuario no-root**: Seguridad mejorada

### Despliegue en servidor

```bash
# En el servidor de producción
git pull origin main
docker compose --profile prod build --no-cache
docker compose --profile prod up -d

# Verificar
docker compose --profile prod ps
curl http://localhost:8080/health
```

## Troubleshooting

### Problemas comunes y soluciones

#### 1. Puerto ocupado

**Error:** `bind: address already in use`

**Solución:**
```bash
# Ver qué usa el puerto
lsof -i :5173  # Mac/Linux
netstat -ano | findstr :5173  # Windows

# Cambiar puerto en docker-compose.yml
ports:
  - "5174:5173"  # Usar 5174 en lugar de 5173
```

#### 2. Permisos en Linux

**Error:** `permission denied`

**Solución:**
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Logout y login de nuevo
```

#### 3. Build falla

**Error:** `npm install failed`

**Solución:**
```bash
# Limpiar cache de Docker
docker system prune -a
# Rebuild sin cache
docker compose --profile prod build --no-cache
```

#### 4. Hot-reload no funciona

**Solución:**
```bash
# Verificar que el volumen esté montado
docker compose --profile dev config

# En Windows, puede necesitar WSL2
# Verificar en Docker Desktop:
# Settings > Resources > WSL Integration
```

#### 5. Variables de entorno no se aplican

**Solución:**
```bash
# Verificar que .env existe
ls -la .env

# Reconstruir con las nuevas variables
docker compose --profile prod build --no-cache
```

### Comandos de diagnóstico

```bash
# Ver logs detallados
docker compose --profile dev logs --tail=100

# Inspeccionar contenedor
docker inspect cashguard-paradise-dev

# Ver uso de recursos
docker stats

# Limpiar todo y empezar de nuevo
./Scripts/docker-commands.sh clean
```

## Mejores Prácticas

### 🤖 [IA] - Recomendaciones

1. **Siempre usar el script helper** para operaciones comunes
2. **No instalar Node.js localmente** - usa el contenedor
3. **Commitear .env.example**, nunca .env
4. **Usar multi-stage build** para optimizar tamaño
5. **Health checks** en producción para monitoreo
6. **Usuario no-root** en contenedores por seguridad
7. **Cache de dependencias** en Dockerfile (COPY package*.json primero)
8. **Limpiar regularmente** imágenes no usadas

### Seguridad

- ✅ Contenedores ejecutan con usuario no-root
- ✅ Variables sensibles en .env (no en Dockerfile)
- ✅ .dockerignore excluye archivos sensibles
- ✅ Headers de seguridad en Nginx
- ✅ Imágenes Alpine (mínimas, sin bloat)

### Performance

- ✅ Multi-stage build (~30MB final)
- ✅ Gzip en Nginx
- ✅ Cache headers optimizados
- ✅ Health checks rápidos
- ✅ Volúmenes para desarrollo (no rebuild)

### Mantenimiento

```bash
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo (cuidado!)
docker system prune -a --volumes

# Ver espacio usado
docker system df

# Actualizar imágenes base
docker compose pull
```

## Recursos adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

*Documentación creada por 🤖 [IA] para CashGuard Paradise v1.0.0*