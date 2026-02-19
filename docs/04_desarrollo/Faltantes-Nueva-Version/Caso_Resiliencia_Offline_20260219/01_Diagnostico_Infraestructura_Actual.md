# 01 - Diagnostico de Infraestructura Actual: Resiliencia Offline

> ⚠️ Corregido 2026-02-19: Nombres de funciones y tablas actualizados contra codigo fuente real

**Caso:** Resiliencia Offline
**Fecha:** 19 de febrero 2026
**Estado:** Diagnostico completado
**Severidad:** Alta - Riesgo de perdida de datos en produccion
**Proyecto:** CashGuard Paradise

---

## Tabla de Contenidos

1. [Sintomas](#1-sintomas)
2. [Infraestructura Existente](#2-infraestructura-existente)
3. [Hallazgo Critico](#3-hallazgo-critico)
4. [Brechas Identificadas](#4-brechas-identificadas)
5. [Impacto Operacional](#5-impacto-operacional)
6. [Resumen Ejecutivo](#6-resumen-ejecutivo)

---

## 1. Sintomas

### Que experimenta el usuario cuando se pierde la conexion a internet

Cuando un cajero de Acuarios Paradise esta en medio de un corte de caja y la conexion a internet se interrumpe (situacion comun en locales comerciales), ocurre lo siguiente:

| Momento de la perdida | Sintoma observable | Severidad |
|---|---|---|
| Durante el wizard inicial (pasos 1-5) | El progreso local se mantiene (localStorage), pero `guardarProgreso()` falla silenciosamente al intentar sincronizar con Supabase | Media |
| Durante Phase 1 (conteo de efectivo) | El conteo se realiza localmente sin problema, pero cualquier intento de persistir estado en Supabase falla | Media |
| Durante Phase 2 (delivery/verificacion) | La verificacion ciega funciona localmente, pero los datos de anomalias no se sincronizan | Alta |
| Durante Phase 3 (reporte final) | El reporte se genera correctamente en local, pero la finalizacion del corte en Supabase (`finalizarCorte()`) falla | Critica |
| Al intentar reanudar sesion | `recuperarSesion()` falla completamente, el cajero no puede recuperar su trabajo previo | Critica |

### Errores tipicos en consola

Sin un mecanismo de fallback, las llamadas directas a Supabase producen errores no manejados:

- `TypeError: Failed to fetch` en llamadas a `supabase.from('cortes').insert()`
- `TypeError: Failed to fetch` en llamadas a `supabase.from('cortes').update()`
- `TypeError: Failed to fetch` en `guardarProgreso()` durante auto-save periodico
- Sin retroalimentacion visual para el cajero: la app aparenta funcionar pero los datos no se persisten remotamente

### Escenario real documentado

Un cajero completa 45 minutos de trabajo (conteo completo de denominaciones, verificacion ciega de 10 denominaciones, entrega a gerencia). Al llegar a Phase 3, la conexion se pierde. El reporte WhatsApp se genera correctamente (es local), pero al presionar "Finalizar", `finalizarCorte()` falla. El cajero cierra la app. Al dia siguiente, `recuperarSesion()` no puede conectar a Supabase para recuperar la sesion, y el trabajo se pierde completamente.

---

## 2. Infraestructura Existente

### 2.1 offlineQueue.ts - Cola de operaciones offline

**Ubicacion:** `src/lib/offlineQueue.ts`

El proyecto ya cuenta con una infraestructura completa de cola offline que fue desarrollada pero nunca integrada al flujo principal de la aplicacion.

**Capacidades implementadas:**

| Funcionalidad | Estado | Descripcion |
|---|---|---|
| `agregarOperacion()` | Implementada | Agrega operaciones a la cola FIFO con metadata (tipo, payload, timestamp) |
| `procesarCola()` | Implementada | Procesa la cola en orden FIFO, ejecutando cada operacion pendiente |
| Retry con backoff exponencial | Implementada | Intervalos: [2000, 4000, 8000, 16000, 30000] ms entre reintentos |
| `MAX_REINTENTOS` | Configurado en 5 | Despues de 5 intentos fallidos, la operacion se marca como fallida |
| Persistencia localStorage | Implementada | La cola sobrevive recargas del navegador y cierres de la app |
| Deteccion de conectividad | Implementada | `escucharConectividad()` registra `addEventListener('online')` y retorna funcion de cleanup. No integrada al flujo principal (solo exportada, nunca importada). |

**Suite de tests existente:**

La cola offline tiene cobertura de tests robusta:

- 7 suites de tests
- Aproximadamente 30 tests individuales
- Cubren: encolado, procesamiento FIFO, reintentos, persistencia, limpieza

### 2.2 useCorteSesion.ts - Hook principal de sesion

**Ubicacion:** `src/hooks/useCorteSesion.ts`
**Tamano:** 585 lineas

Este es el hook central que maneja todo el ciclo de vida de un corte de caja contra Supabase. Expone las siguientes operaciones criticas:

| Funcion | Que hace | Conectividad requerida |
|---|---|---|
| `iniciarCorte()` | Crea registro en `cortes` con estado INICIADO + primer intento | Si - INSERT a Supabase |
| `guardarProgreso()` | Actualiza el registro con datos parciales del wizard/conteo | Si - UPDATE a Supabase |
| `finalizarCorte()` | Marca el corte como FINALIZADO con reporte_hash | Si - UPDATE a Supabase |
| `abortarCorte()` | Marca el corte como ABORTADO con motivo | Si - UPDATE a Supabase |
| `reiniciarIntento()` | Crea nuevo intento, limpia datos parciales del corte | Si - INSERT + UPDATE a Supabase |
| `recuperarSesion()` | Busca cortes con estado INICIADO o EN_PROGRESO para reanudar | Si - SELECT de Supabase |

**Problema fundamental:** Todas estas funciones realizan llamadas directas a Supabase sin ningun mecanismo de fallback. Si la red falla, la operacion simplemente se pierde.

### 2.3 Configuracion Workbox (vite.config.ts)

La configuracion actual de VitePWA/Workbox solo maneja precaching de assets estaticos:

| Aspecto | Estado actual |
|---|---|
| Precaching de HTML/CSS/JS | Configurado - La app carga offline |
| Precaching de iconos/imagenes | Configurado |
| Runtime caching para API calls | **NO configurado** |
| Caching de llamadas a Supabase | **NO existe** |
| Strategy NetworkFirst para APIs | **NO implementada** |

Esto significa que la PWA puede cargar su interfaz sin conexion, pero cualquier operacion que requiera datos del servidor falla completamente.

### 2.4 Flujo de reanudacion de sesion

Se encontraron 42 referencias al flujo de reanudacion de sesion en el codebase. Este flujo permite que un cajero retome un corte interrumpido. Sin embargo, depende completamente de poder conectarse a Supabase para verificar y cargar la sesion activa.

---

## 3. Hallazgo Critico

### offlineQueue esta EXPORTADA pero NO IMPORTADA en ningun lugar de la aplicacion

Este es el hallazgo mas importante del diagnostico:

```
offlineQueue.ts  -->  EXPORTA: agregarOperacion(), procesarCola(), etc.
                      IMPORTADO POR: NINGUN ARCHIVO DE LA APLICACION
```

**Evidencia:**

- `offlineQueue.ts` exporta correctamente todas sus funciones publicas
- Una busqueda exhaustiva en todo el codebase revela **cero imports** de `offlineQueue` en archivos de produccion
- Los unicos archivos que importan `offlineQueue` son sus propios tests
- El archivo ha existido en el repositorio durante multiples versiones sin ser conectado al flujo real

**Conclusion:** Existe una infraestructura completa de resiliencia offline (cola FIFO, retry con backoff, persistencia) que fue desarrollada, testeada, y luego nunca integrada. Es codigo funcional muerto.

### Diagrama de la brecha

```
Estado ACTUAL:
  useCorteSesion.ts  --(llamada directa)-->  Supabase API
                                               |
                                          [SIN INTERNET]
                                               |
                                          ERROR / DATOS PERDIDOS

Estado DESEADO:
  useCorteSesion.ts  --(llamada)--> offlineQueue  --(cuando hay red)--> Supabase API
                                        |
                                   [SIN INTERNET]
                                        |
                                   localStorage (persistido)
                                        |
                                   [INTERNET REGRESA]
                                        |
                                   procesarCola() automatico
```

---

## 4. Brechas Identificadas

### Brecha 1: offlineQueue desconectada de useCorteSesion

- **Que existe:** Cola con retry, backoff, persistencia y tests
- **Que falta:** Un wrapper o middleware que intercepte las llamadas de `useCorteSesion` a Supabase y las encole cuando la red falla
- **Esfuerzo estimado:** Bajo-medio (la infraestructura existe, solo falta la integracion)

### Brecha 2: Sin runtime caching para llamadas API

- **Que existe:** Workbox configurado para precaching de assets estaticos
- **Que falta:** Reglas de runtime caching con strategy `NetworkFirst` para endpoints de Supabase (`*.supabase.co/rest/v1/*`)
- **Esfuerzo estimado:** Bajo (configuracion en `vite.config.ts`)

### Brecha 3: Sin deteccion visual de estado de conexion

- **Que existe:** `escucharConectividad()` en offlineQueue que registra `addEventListener('online')` y retorna funcion de cleanup. Sin embargo, esta funcion no es importada por ningun archivo de la aplicacion.
- **Que falta:**
  - Hook `useConnectionStatus` que consuma `escucharConectividad()` con event listeners para `online`/`offline`
  - Componente banner visual que informe al cajero si esta sin conexion
  - Trigger automatico de `procesarCola()` cuando la conexion regresa (conectar ambas funciones existentes)
- **Esfuerzo estimado:** Bajo (componentes nuevos pequenos, infraestructura de listener ya existe)

### Brecha 4: Sin estrategia de conflictos

- **Que existe:** Nada
- **Que falta:** Definicion de que ocurre si se hicieron cambios offline y la version en Supabase cambio mientras tanto
- **Esfuerzo estimado:** Bajo (para estrategia "last-write-wins" con timestamp)

### Brecha 5: guardarProgreso() sin proteccion

- **Que existe:** Funcion que hace UPDATE directo a Supabase
- **Que falta:** Try/catch con fallback a offlineQueue cuando la llamada falla
- **Esfuerzo estimado:** Bajo (envolver llamadas existentes)

### Tabla resumen de brechas

| # | Brecha | Infraestructura existente | Lo que falta | Esfuerzo |
|---|---|---|---|---|
| 1 | offlineQueue desconectada | Cola completa con tests | Integracion con useCorteSesion | Bajo-Medio |
| 2 | Sin runtime caching API | Workbox para static assets | NetworkFirst para Supabase | Bajo |
| 3 | Sin UI de conexion | `escucharConectividad()` (no integrada) | Hook + Banner visual que consuma listener existente | Bajo |
| 4 | Sin manejo de conflictos | Nada | Estrategia last-write-wins | Bajo |
| 5 | guardarProgreso() sin fallback | Funcion funcional | Try/catch + enqueue | Bajo |

---

## 5. Impacto Operacional

### Contexto de negocio: Acuarios Paradise

Las tiendas de Acuarios Paradise operan en locales comerciales donde la conexion a internet puede ser inestable:

- **Conexion compartida** con otros locales del centro comercial
- **Cortes intermitentes** durante horarios pico
- **Perdida total** durante tormentas electricas o mantenimiento del ISP
- **Zonas con senal debil** dentro del mismo local (bodegas, areas traseras)

### Escenarios de riesgo por frecuencia

| Escenario | Frecuencia estimada | Impacto sin resiliencia |
|---|---|---|
| Microinterrupcion (2-5 segundos) | Diaria | `guardarProgreso()` falla, datos de ese tick se pierden |
| Interrupcion media (1-5 minutos) | Semanal | Cajero no nota el problema hasta intentar finalizar |
| Perdida prolongada (5-30 minutos) | Mensual | Corte completo de 45 min puede perderse |
| Sin internet durante turno completo | Raro pero posible | Imposible iniciar sesion, sistema inutilizable |

### Costo operacional de la perdida de datos

- **Tiempo del cajero:** 45 minutos de conteo perdidos = repetir todo el proceso
- **Impacto en turno:** El siguiente cajero espera para iniciar su turno
- **Riesgo anti-fraude:** Sin registro en Supabase, no hay trazabilidad del corte
- **Frustracion del empleado:** Desmotivacion por perdida de trabajo realizado
- **Confianza en la herramienta:** El cajero deja de confiar en CashGuard y vuelve a metodos manuales

### Dato clave

El reporte WhatsApp (la pieza mas critica para gerencia) se genera localmente y funciona sin internet. Pero sin el registro en Supabase, no hay forma de:

- Verificar que el corte se realizo
- Reanudar un corte interrumpido
- Mantener historial para auditorias
- Correlacionar reportes WhatsApp con registros del sistema

---

## 6. Resumen Ejecutivo

### Lo positivo

- La infraestructura de cola offline (`offlineQueue.ts`) ya existe y esta testeada
- La PWA carga correctamente sin internet (precaching funciona)
- El flujo de conteo (Phase 1, 2, 3) funciona localmente sin necesidad de red
- El reporte WhatsApp se genera localmente
- Los tests de offlineQueue estan escritos y pasan

### Lo critico

- `offlineQueue` es codigo funcional muerto: exportada pero nunca importada (incluyendo `procesarCola()` y `escucharConectividad()`)
- `useCorteSesion` hace todas sus llamadas directamente a Supabase sin fallback
- No existe runtime caching para llamadas API en la configuracion de Workbox
- No hay indicador visual de estado de conexion para el cajero
- No hay sincronizacion automatica cuando la conexion regresa (`escucharConectividad()` existe pero no esta conectada a `procesarCola()`)
- `guardarProgreso()` puede fallar silenciosamente perdiendo datos

### Veredicto

El 70% de la solucion ya esta construida. La cola offline tiene la logica de encolado, procesamiento FIFO, retry con backoff exponencial, persistencia en localStorage, y deteccion de reconexion (`escucharConectividad()` con `addEventListener('online')`). Lo que falta es el "pegamento" entre esta infraestructura y el flujo real de la aplicacion: integrar offlineQueue con useCorteSesion, conectar `escucharConectividad()` con `procesarCola()`, agregar runtime caching para APIs, y proporcionar feedback visual al cajero.

El esfuerzo para cerrar esta brecha es **significativamente menor** que si se tuviera que construir desde cero.

---

**Documento siguiente:** `02_Plan_Arquitectonico_Offline.md` - Plan de implementacion por capas
