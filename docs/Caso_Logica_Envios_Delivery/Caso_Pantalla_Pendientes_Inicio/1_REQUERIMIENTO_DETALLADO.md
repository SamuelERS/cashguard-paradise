# 1. REQUERIMIENTO DETALLADO - Vista Deliveries Pantalla Inicial

**Documento:** 1 de 5 | **Fecha:** 24 Oct 2025 | **Status:** ✅ COMPLETO

---

## 🎯 Descripción Funcional

### Objetivo
Agregar **tercera tarjeta "Deliveries Pendientes"** en pantalla inicial (`OperationSelector`) para acceso directo al dashboard de envíos COD sin completar wizard de corte nocturno.

### Alcance

**✅ Incluye:**
- Tercera tarjeta en `OperationSelector` (junto a Inicio/Fin Turno)
- Navegación directa a `DeliveryDashboard` existente
- Validación PIN supervisor opcional
- Badge contador: "X deliveries | $X.XX"
- Todas funciones dashboard existente (marcar pagado, filtros, exportar)

**❌ NO incluye:**
- Modificaciones módulo deliveries (ya completo)
- Notificaciones push (futura mejora)
- Integración API externa C807/Melos

---

## 👤 User Stories

### US-01: Acceso Rápido Supervisor
**Como** supervisor  
**Quiero** ver deliveries pendientes inmediatamente  
**Para** planificar cobranzas del día

**Criterios:**
- [ ] Tarjeta visible en pantalla inicial
- [ ] Contador muestra: "X deliveries | $X.XX"
- [ ] Acceso en <10 segundos (vs 2-3min actual)
- [ ] Dashboard completo cargado tras validar PIN

### US-02: Consulta Durante Jornada
**Como** cajero  
**Quiero** consultar si cliente pagó  
**Para** responder llamadas sin interrumpir operaciones

**Criterios:**
- [ ] Búsqueda por nombre funcional
- [ ] Filtros por courier (C807/Melos/Otro)
- [ ] Marcar como pagado con confirmación
- [ ] Toast feedback inmediato

### US-03: Seguridad PIN
**Como** administrador  
**Quiero** proteger acceso con PIN  
**Para** evitar consulta no autorizada

**Criterios:**
- [ ] Modal PIN al clickear tarjeta
- [ ] 3 intentos máximo → bloqueo 5min
- [ ] PIN encriptado (hash SHA-256)
- [ ] Opción admin: PIN obligatorio vs acceso libre

---

## 🎨 Especificación UI/UX

### Tercera Tarjeta "Deliveries Pendientes"

**Diseño:**
```
┌────────────────────────────────────────┐
│ 📦 Package Icon (Green gradient)       │ [COD]
│                                        │
│ Deliveries Pendientes                 │
│ Consulta envíos pendientes de cobro   │
│                                        │
│ • Vista completa envíos activos       │
│ • Actualizar estados (pagado/cancelado)│
│ • Alertas automáticas antigüedad      │
│                                        │
│ [3 deliveries | $300.00] ← Badge nuevo│
│                                        │
│ Comenzar →                             │
└────────────────────────────────────────┘
```

**Colores (Verde - diferenciarse de las otras 2):**
- Gradiente: `#10b981` → `#059669` (Tailwind green-500→600)
- Background: `rgba(16, 185, 129, 0.2)`
- Border: `rgba(16, 185, 129, 0.4)`

**Responsive:**
- Desktop: Grid 3 columnas
- Tablet: 2 columnas (Deliveries full width fila 2)
- Mobile: Stack vertical

**Glass Morphism (IGUAL a tarjetas existentes):**
```typescript
style={{
  background: 'rgba(36, 36, 36, 0.4)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: 'clamp(20px, ${32 * viewportScale}px, 32px)'
}}
```

---

## 🔄 Flujos de Usuario

### Flujo A: Sin PIN (Opción B - Simplificada)
```
Abrir PWA → Click "Deliveries" → Dashboard cargado → Consultar/Modificar
```

### Flujo B: Con PIN (Opción A - Recomendada)
```
Abrir PWA → Click "Deliveries" → Modal PIN → Validar → Dashboard → Consultar
                                    ↓ (incorrecto)
                                 Intentos < 3? → Reintentar
                                    ↓ (3 fallos)
                                 Bloqueo 5min
```

---

## ⚙️ Requisitos No Funcionales

### Performance
| Métrica | Target |
|---------|--------|
| Carga inicial dashboard | <2s |
| Filtro/búsqueda | <300ms |
| Actualizar status | <500ms |
| FPS animaciones | ≥60fps |

### Seguridad
- PIN hash SHA-256 (NO plaintext)
- Bloqueo 5min tras 3 intentos
- Session timeout: 15min inactividad

### Compatibilidad
- iOS Safari 14+
- Android Chrome (Android 10+)
- Responsive: 360px - 430px (móviles Paradise)

### Calidad Código
- Test coverage ≥85%
- TypeScript strict (0 errores, 0 `any`)
- JSDoc 100% funciones públicas

---

## ✅ Criterios de Aceptación

### Funcionales
- [ ] Tarjeta visible en `OperationSelector`
- [ ] Contador badge dinámico funcional
- [ ] Navegación a `/deliveries-pending` OK
- [ ] PIN modal funciona (si habilitado)
- [ ] Dashboard completo renderizado
- [ ] Todas acciones existentes funcionan (marcar pagado, filtros, exportar)
- [ ] Breadcrumb "← Volver" retorna correctamente
- [ ] Animaciones smooth (Framer Motion)

### No Funcionales
- [ ] Responsive perfecto 360px-430px
- [ ] Performance <2s carga inicial
- [ ] Zero breaking changes funcionalidad existente
- [ ] Tests ≥85% coverage
- [ ] TypeScript compila sin errores

### UX/Accesibilidad
- [ ] Textos en español con tildes correctas
- [ ] Iconos universales (Package, Check, X)
- [ ] Feedback toasts inmediatos
- [ ] Estados vacíos informativos
- [ ] WCAG AA compliance

---

## 🔗 Dependencias

**CRÍTICAS (bloqueantes):**
- ✅ DeliveryDashboard.tsx existente
- ✅ useDeliveries hook existente
- ✅ React Router funcional
- ✅ localStorage disponible

**OPCIONALES:**
- Sistema notificaciones push (v2.0)
- Backend API deliveries (no requerido)

---

**Última actualización:** 24 Oct 2025  
**Próximo documento:** [2_ANALISIS_TECNICO.md](./2_ANALISIS_TECNICO.md)
