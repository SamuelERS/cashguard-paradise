# Definición del Problema: Omisión de Wizard en Local

**Caso:** Caso_Modales_Saltados_Local_20260217

## 1. Descripción del Problema (El "Qué")

Se ha detectado una **violación crítica del flujo de seguridad** en el entorno local de desarrollo. El sistema está omitiendo por completo la secuencia de "Wizard" o "Modales de Instrucción" que debe aparecer obligatoriamente al inicio de la sesión.

Estos modales contienen reglas de negocio y seguridad inviolables para el operador, incluyendo:
- 🚫 Prohibición del uso de calculadoras externas.
- 🏷️ Instrucciones de rotulación de dinero.
- ⏱️ Timers de lectura obligatoria para asegurar la comprensión del protocolo.

Actualmente, al iniciar la aplicación en local, el sistema salta directamente a la fase operativa (Dashboard/Selector de Operación), ignorando estos pasos previos de validación y concienciación.

## 2. Comparativa de Entornos

| Entorno | Comportamiento Observado | Estado |
|---------|--------------------------|--------|
| **Producción / Nube** | Al iniciar, se presentan los modales de instrucción paso a paso. El usuario no puede avanzar hasta completar los timers y confirmaciones. | ✅ Correcto |
| **Local (Dev)** | Al iniciar, los modales **NO** aparecen. El usuario aterriza directamente en la pantalla principal operativa. | ❌ Incorrecto |

## 3. Zona de Evidencia

### Evidencia A: Flujo Esperado (Producción)
![AQUÍ INSERTAR IMAGEN: Flujo correcto en Producción - Modales visibles]

### Evidencia B: Flujo Actual (Local)
![AQUÍ INSERTAR IMAGEN: Flujo incorrecto en Local - Salto directo a operaciones]

## 4. Hipótesis Iniciales (Preliminar)

Basado en la arquitectura del sistema, los sospechosos principales de esta anomalía son:

1.  **Persistencia de Estado (`localStorage`):** Es posible que flags como `hasSeenWizard` o similares estén quedando "pegados" en el navegador local.
2.  **Variables de Entorno:** Existencia de alguna variable tipo `VITE_SKIP_WIZARD` o `VITE_DEV_MODE` en `.env.local`.
3.  **Lógica de Detección:** Fallo en `InitialWizardModal` o `useWizardNavigation` al evaluar si es la primera vez del usuario.
4.  **Condicionales de Renderizado:** Algún `if (isDevelopment)` explícito en el código.
