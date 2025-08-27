# 🤖 [IA] - Dockerfile multi-stage para CashGuard Paradise

# Stage 1: Development - Para testing E2E
FROM node:20-alpine AS development

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar el código fuente
COPY . .

# Exponer puerto para desarrollo
EXPOSE 5173

# Comando por defecto para desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Builder - Compila la aplicación
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalación limpia de dependencias dentro del contenedor
# npm ci es más rápido y confiable para builds de producción
RUN npm ci --silent

# Copiar el código fuente
COPY . .

# Variables de entorno de build (se pueden sobrescribir)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Compilar la aplicación para producción
RUN npm run build

# Stage 3: Production - Servidor Nginx optimizado
FROM nginx:alpine

# Instalar certificados CA para HTTPS
RUN apk add --no-cache ca-certificates

# Copiar configuración de Nginx
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear usuario no-root para seguridad
RUN adduser -D -H -u 1001 -s /bin/sh www-user && \
    chown -R www-user:www-user /usr/share/nginx/html && \
    chown -R www-user:www-user /var/cache/nginx && \
    chown -R www-user:www-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R www-user:www-user /var/run/nginx.pid

# Configurar Nginx para ejecutarse como usuario no-root
RUN echo "user www-user;" > /tmp/nginx.conf && \
    cat /etc/nginx/nginx.conf | grep -v "^user" >> /tmp/nginx.conf && \
    mv /tmp/nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Cambiar a usuario no-root
USER www-user

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]