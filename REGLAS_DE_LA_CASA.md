# 🏠 Reglas de la Casa v3.0
## La Constitución Técnica de Paradise System Labs

> **Documento de referencia para desarrollo con IA en proyectos Paradise System Labs**  
> **Ley suprema inquebrantable para desarrollo consistente, de élite, seguro y escalable**

---

## 📋 Información del Documento

| Propiedad | Valor |
|-----------|-------|
| **Versión** | v3.0 |
| **Estado** | 🟢 Activo |
| **Última Actualización** | Septiembre 2025 |
| **Proyecto Base** | CashGuard Paradise v1.2.35+ |
| **Aplicable a** | Todos los proyectos Paradise System Labs |

---

## 🚨 ARTÍCULO I: LEYES SUPREMAS (CERO TOLERANCIA)

> **Cualquier agente que viole estas reglas será reevaluado**

### C.1 - NO NATIVE BUTTONS/ANCHORS
- ❌ **Prohibido:** Uso de `<button>` o `<a>` nativos para acciones de flujo de trabajo
- ✅ **Obligatorio:** Usar componentes `*ActionButton` estandarizados
- **Justificación:** Consistencia visual y funcional del sistema

### C.2 - NO INLINE STYLES
- ❌ **Prohibido:** Uso de la prop `style={{...}}` para estilizado
- ✅ **Obligatorio:** Estilo a través de clases de utilidad Tailwind CSS o componentes variant
- **Justificación:** Mantenibilidad y consistencia del diseño

### C.3 - NO HARDCODED VALUES
- ❌ **Prohibido:** Valores hardcodeados (colores, espaciados, tamaños de fuente)
- ✅ **Obligatorio:** Tokens del sistema de diseño (`bg-primary`, `p-4`, `text-lg`)
- **Justificación:** Escalabilidad y coherencia visual

### C.4 - DOCKER FIRST ABSOLUTO
- ❌ **Prohibido:** Operaciones fuera de contenedores Docker
- ✅ **Obligatorio:** Todas las operaciones (instalación, desarrollo, testing, build) DEBEN ejecutarse dentro de contenedores Docker
- **Justificación:** El entorno local del host es irrelevante

### C.5 - TYPESCRIPT ESTRICTO
- ❌ **Prohibido:** Uso del tipo `any`
- ✅ **Obligatorio:** Tipado estricto completo
- **Justificación:** Seguridad de tipos y prevención de errores

---

## 🏛️ ARTÍCULO II: DOCTRINAS ARQUITECTÓNICAS INQUEBRANTABLES

### D.1 - DOCTRINA DE COMPONENTES DE ACCIÓN
**Jerarquía visual de cuatro niveles - Selección NO NEGOCIABLE:**

| Componente | Color | Uso |
|------------|-------|-----|
| `PrimaryActionButton` | 🔵 Azul | Acción principal y terminal |
| `ConstructiveActionButton` | 🟢 Verde | Acciones positivas o de avance |
| `NeutralActionButton` | 🟡 Amarillo | Acciones secundarias, navegación o advertencia |
| `DestructiveActionButton` | 🔴 Rojo | Acciones de cancelación o pérdida de datos |

### D.2 - DOCTRINA DE CAPAS Y PROFUNDIDAD

| Nivel | Descripción | Implementación |
|-------|-------------|----------------|
| **Nivel 0** (Base) | Vistas y flujos principales | DEBE SER OPACO |
| **Nivel 1** (Contextual) | Modales, Sidebars | DEBE USAR `glass-morphism-panel` |
| **Nivel 2** (Flotante) | Toasts, Tooltips | DEBE SER OPACO CON SOMBRA |

### D.3 - DOCTRINA DE RESPONSIVIDAD FLUIDA
- **Prioridad:** Función `clamp()` de CSS sobre breakpoints discretos (`sm:`, `md:`)
- **Objetivo:** Adaptabilidad perfecta en todos los dispositivos
- **Aplicación:** Componentes complejos requieren responsividad fluida

### D.4 - DOCTRINA DE FOCO "NEON GLOW"
- **Implementación:** Efecto `neon-glow` estandarizado para elementos de formulario
- **Propósito:** Feedback de interacción consistente
- **Aplicación:** Todos los elementos interactivos

---

## 🔄 ARTÍCULO III: PROTOCOLO OPERACIONAL OBLIGATORIO

### P.1 - PLAN MODE ON
- **Regla:** Ninguna línea de código se escribe sin un plan de acción detallado
- **Proceso:** Presentar **PLAN MODE ON** y obtener aprobación formal
- **Validación:** Plan debe incluir objetivos específicos y medibles

### P.2 - BÚSQUEDA PREVIA (DRY EXTREMO)
- **Antes de crear:** Búsqueda exhaustiva de soluciones existentes
- **Verificación:** Confirmar que no existe solución reutilizable
- **Principio:** Don't Repeat Yourself llevado al extremo

### P.3 - DOCUMENTACIÓN SISTEMÁTICA

#### Comentarios de Código
```typescript
// 🤖 [IA] vX.X.X - [Razón del cambio]
```

#### Documentos .MD
- **Obligatorio:** Actualizar artefactos arquitectónicos
- **Archivos:** `ConfirmationModal.md`, `README.md`, etc.
- **Momento:** Reflejar cualquier cambio doctrinal

### P.4 - VERSIONADO CONSISTENTE
- **Frecuencia:** Cada commit o conjunto de cambios funcionales
- **Formato:** Versionado semántico (MAJOR.MINOR.PATCH)
- **Ubicaciones:** `Index.tsx`, `InitialWizardModal.tsx`, `CashCounter.tsx`

### P.5 - BUILD LIMPIO
- **Validación:** `npm run build` debe completarse sin errores
- **Criterio:** Un commit solo es válido con build exitoso
- **Verificación:** Cero warnings, tests pasando

---

## 🧭 ARTÍCULO IV: METODOLOGÍA DE COMANDO

### Mantra Central
```
ANALIZO → PLANIFICO → SOLICITO APROBACIÓN → EJECUTO → VALIDO → INFORMO
```

### 📋 Checklist por Sesión

- [ ] **Task list** creada antes de iniciar
- [ ] **Compatibilidad** verificada con stack actual
- [ ] **Plan Mode ON** activado y aprobado
- [ ] **Búsqueda previa** completada (DRY extremo)
- [ ] **Documentación** actualizada (comentarios + .md)
- [ ] **Versionado** aplicado consistentemente
- [ ] **Build** exitoso sin errores ni warnings
- [ ] **Funcionalidad** preservada al 100%

### 🆘 Protocolo de Escalación
**En caso de duda o conflicto doctrinal:**

1. **PARA** - Detener ejecución inmediatamente
2. **ESCALA** - Elevar el problema al nivel superior
3. **SOLICITA CLARIFICACIÓN** - Obtener directrices específicas

> **Principio fundamental:** La ejecución incorrecta es peor que la inacción

---

## 📊 STACK TECNOLÓGICO OFICIAL

### Tecnologías Principales
- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Containerización:** Docker
- **Control de versiones:** Git + GitHub

### Tecnologías en Desarrollo
- **🔧 Worker:** [PENDIENTE] Incluir en versionado cuando se implemente
- **📊 Rate limits:** [FUTURO] Preparar manejo para APIs externas
- **🔄 Estado avanzado:** [ROADMAP] Migración a Zustand/Redux

---

## 📁 ESTRUCTURA DE ARCHIVOS OBLIGATORIA

### Organización de Directorios
```
/
├── Scripts/                 # Todos los scripts de automatización
├── Documentos MarkDown/     # Documentación del proyecto
├── src/
│   ├── components/         # Componentes React
│   ├── types/             # Definiciones TypeScript
│   └── utils/             # Utilidades y helpers
└── docker/                # Configuración Docker
```

### Verificación Previa
- ✅ Consultar estructura existente antes de crear
- ✅ Verificar compatibilidad con código actual
- ✅ Validar ubicación correcta de archivos

---

## 🔮 ROADMAP Y FUTURO

### En Desarrollo Activo
- Implementación completa de Workers
- Sistema avanzado de rate limiting
- Migración de estado a arquitectura más robusta

### Consideraciones Futuras
- Integración con APIs externas
- Optimización de performance
- Escalabilidad horizontal

---

## 📚 REFERENCIAS Y RECURSOS

### Enlaces Importantes
- **GitHub:** [Contador de Monedas](https://github.com/SamuelERS/calculadora-corte-caja)
- **Notion:** Documentación extendida del proyecto
- **CLAUDE.md:** Integración específica del proyecto actual

### Documentación Relacionada
- Guía de implementación de componentes
- Manual de configuración Docker
- Estándares de TypeScript

---

## 📋 HISTORIAL DE VERSIONES

| Versión | Fecha | Cambios Principales |
|---------|-------|-------------------|
| **v3.0** | Sep 2025 | Constitución técnica completa con artículos y doctrinas |
| **v2.0** | Dic 2024 | Adaptación para stack React + TypeScript + Vite + shadcn/ui + Docker |
| **v1.0** | - | Versión original con stack WppConnect + OpenAI + Redis |

---

## ⚖️ CUMPLIMIENTO Y AUDITORÍA

### Proceso de Auditoría
1. **Revisión automática:** Verificación en cada commit
2. **Revisión manual:** Auditoría semanal de cumplimiento
3. **Escalación:** Violaciones reportadas al nivel superior

### Métricas de Cumplimiento
- **Build success rate:** 100% requerido
- **Type safety:** Cero uso de `any`
- **Component compliance:** 100% uso de componentes estandarizados
- **Documentation coverage:** 100% de cambios documentados

---

*🏠 **Paradise System Labs** - Excelencia técnica inquebrantable*  
*Última actualización: Septiembre 2025 - CashGuard Paradise v1.2.35+*