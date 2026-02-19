# Protocolo de Pruebas en Tienda Real

**Caso:** Pruebas Vida Real
**Fecha:** 19 de febrero 2026
**Prioridad:** ALTA - Gate de calidad antes de despliegue general
**Duración estimada:** 3 a 5 turnos completos (3-5 dias laborales)

---

## 1. Objetivo

Validar el sistema CashGuard Paradise completo con un cajero real durante 3 a 5 turnos consecutivos en una sucursal de Acuarios Paradise. El objetivo es detectar bugs, fricciones de UX y problemas de infraestructura que solo se manifiestan en condiciones reales de operacion.

**Criterio de exito:** El cajero completa 3 turnos consecutivos sin bugs bloqueantes y los reportes WhatsApp llegan correctamente a gerencia.

---

## 2. Pre-requisitos

Antes de iniciar las pruebas, verificar que TODOS los siguientes items esten resueltos:

| # | Pre-requisito | Estado | Responsable |
|---|---------------|--------|-------------|
| 1 | Caso_Resiliencia_Offline resuelto (guardarProgreso funciona sin internet) | Pendiente | Desarrollo |
| 2 | PWA instalada en dispositivo del cajero (Android o iPhone) | Pendiente | Samuel |
| 3 | Cuenta Supabase activa y conectada | Pendiente | Samuel |
| 4 | Cajero seleccionado e informado del protocolo | Pendiente | Gerencia |
| 5 | Grupo WhatsApp de gerencia configurado para recibir reportes | Pendiente | Gerencia |
| 6 | Dispositivo cargado al 100% al inicio de cada turno | Pendiente | Cajero |
| 7 | Acceso a internet estable en la sucursal (WiFi o datos moviles) | Pendiente | Infraestructura |
| 8 | Build de produccion desplegado en cashguard.paradisesystemlabs.com | Pendiente | CI/CD |

**Sucursal recomendada para prueba piloto:** La sucursal con mayor volumen de transacciones, ya que genera mas edge cases naturalmente.

---

## 3. Protocolo Dia 1 - Turno Completo Documentado

El Dia 1 es el mas critico. Se documenta CADA paso con detalle para establecer la linea base.

### 3.1 Apertura (Conteo Matutino)

**Hora estimada:** Inicio de turno (apertura de tienda)

| Paso | Accion | Que verificar | Capturar |
|------|--------|---------------|----------|
| 1 | Abrir la PWA en el dispositivo | App carga correctamente, no muestra "Under Construction" | Screenshot de pantalla principal |
| 2 | Seleccionar "Conteo Matutino" | Wizard se abre, muestra Paso 1 de 4 | Nada |
| 3 | Completar wizard (Protocolo, Sucursal, Cajero, Testigo) | Cada paso avanza correctamente, validaciones funcionan | Screenshot si algo falla |
| 4 | Contar las denominaciones del fondo de caja ($50) | Teclado numerico aparece, navegacion entre campos funcional | Tiempo total del conteo |
| 5 | Revisar pantalla de resultados | Muestra total correcto, diferencia vs $50 esperados | Screenshot del resultado |
| 6 | Enviar reporte por WhatsApp | Boton funciona, reporte llega al grupo, formato correcto | Screenshot del mensaje en WhatsApp |
| 7 | Verificar en Supabase | Registro aparece en la base de datos con timestamp correcto | Screenshot de Supabase dashboard |

**Tiempo objetivo:** Menos de 5 minutos para todo el flujo matutino.

### 3.2 Durante el Turno

| Paso | Accion | Que verificar |
|------|--------|---------------|
| 1 | Si hay gastos operacionales, registrarlos en la app | Formulario de gastos funciona, categorias correctas |
| 2 | Verificar que la app no se cierra sola en segundo plano | PWA persiste en memoria del dispositivo |
| 3 | Si el cajero necesita cerrar la app y reabrirla | Sesion se reanuda correctamente (datos no se pierden) |

### 3.3 Cierre (Conteo Nocturno)

**Hora estimada:** Fin de turno (cierre de tienda)

| Paso | Accion | Que verificar | Capturar |
|------|--------|---------------|----------|
| 1 | Seleccionar "Corte de Caja" | Wizard se abre correctamente | Nada |
| 2 | Completar wizard (Protocolo, Sucursal, Cajero, Testigo, Venta SICAR) | Venta esperada se ingresa correctamente | Nada |
| 3 | Contar TODAS las denominaciones (billetes + monedas) | Conteo guiado funcional, teclado no se cierra | Tiempo total |
| 4 | Ingresar pagos electronicos (Credomatic, Promerica, etc.) | Campos disponibles y funcionales | Nada |
| 5 | Si total > $50: Phase 2 Delivery aparece automaticamente | Algoritmo de entrega calcula correctamente | Screenshot de lo que entregar |
| 6 | Phase 2 Verificacion Ciega | Conteo ciego funciona sin pistas visuales | Anotar si algo revela el valor esperado |
| 7 | Phase 3: Pantalla de resultados | Totales correctos, diferencia calculada | Screenshot |
| 8 | Enviar reporte WhatsApp | Formato completo con todas las secciones | Screenshot del mensaje |
| 9 | Verificar en Supabase | Registro nocturno guardado correctamente | Screenshot |

**Tiempo objetivo:** Menos de 15 minutos para todo el flujo nocturno (incluyendo conteo fisico).

---

## 4. Protocolo Dias 2-5 - Repeticion + Edge Cases

### Dia 2: Repeticion del flujo normal
- Repetir exactamente el protocolo del Dia 1
- Objetivo: Confirmar consistencia (no bugs intermitentes)
- Documentar cualquier diferencia vs Dia 1

### Dia 3: Pruebas de resiliencia
- **Simular corte de internet** durante `guardarProgreso()`: Apagar WiFi/datos durante el conteo
- **Cerrar la app a media operacion**: Forzar cierre durante Phase 2 y verificar reanudacion
- Documentar comportamiento exacto de cada simulacion

### Dia 4: Edge cases de usuario
- **Cajero ingresa datos incorrectos en verificacion ciega**: Documentar flujo de modales (1er, 2do, 3er intento)
- **Cambio de cajero a mitad de turno**: Verificar que la app permite seleccionar nuevo cajero
- **Intentar reporte WhatsApp con popup bloqueado**: Verificar que fallback de copia funciona

### Dia 5: Pruebas de stress y cierre
- **Dispositivo con poca bateria** (menos del 15%): Verificar comportamiento
- **Multiples cortes consecutivos** sin cerrar la app: Verificar que no hay memory leaks
- **Revision final** de todos los registros en Supabase vs reportes WhatsApp recibidos

---

## 5. Que Documentar

Para CADA anomalia detectada durante las pruebas, capturar:

1. **Timestamp exacto** (hora:minuto del dia)
2. **Screenshot** de la pantalla donde ocurrio el problema
3. **Que esperaba** el usuario que sucediera
4. **Que sucedio realmente**
5. **Reproducibilidad:** Unica vez, intermitente, o siempre
6. **Severidad:** Bloqueante (no puede continuar), Mayor (funciona mal), Menor (cosmetico)
7. **Dispositivo y version** de la PWA

---

## 6. Plantilla para Reportar Bug

Copiar esta plantilla para cada bug encontrado:

```
## BUG-[NNN] - [Titulo descriptivo corto]

**Fecha:** DD/MM/YYYY
**Hora:** HH:MM
**Dia de prueba:** 1 / 2 / 3 / 4 / 5
**Dispositivo:** [Modelo + SO version]
**Version PWA:** [Badge visible en pantalla principal]

### Descripcion
[Que estaba haciendo el cajero cuando ocurrio el problema]

### Esperado
[Que deberia haber sucedido]

### Resultado real
[Que sucedio realmente]

### Pasos para reproducir
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Evidencia
- [ ] Screenshot adjunto
- [ ] Video adjunto (si aplica)
- [ ] Logs de consola (si accesible)

### Severidad
- [ ] S0 - Bloqueante (no puede continuar)
- [ ] S1 - Mayor (funciona mal pero hay workaround)
- [ ] S2 - Menor (cosmetico, no afecta funcion)

### Reproducibilidad
- [ ] Siempre (100%)
- [ ] Intermitente (a veces)
- [ ] Una sola vez
```

---

## 7. Criterios de Aceptacion

Las pruebas en tienda se consideran **exitosas** cuando:

| Criterio | Umbral |
|----------|--------|
| Bugs bloqueantes (S0) | 0 |
| Bugs mayores (S1) | Maximo 2 (con workaround documentado) |
| Reportes WhatsApp recibidos correctamente | 100% |
| Registros en Supabase vs reportes | Match 100% |
| Tiempo flujo matutino | Menos de 5 minutos |
| Tiempo flujo nocturno | Menos de 15 minutos |
| Cajero puede operar sin asistencia tecnica | Si, desde Dia 3 |

---

## 8. Post-Pruebas

Despues de completar los 3-5 dias:

1. **Compilar** todos los bugs encontrados en un documento consolidado
2. **Priorizar** por severidad (S0 primero, luego S1, luego S2)
3. **Estimar** esfuerzo de correccion para cada bug
4. **Decidir** si se requiere otra ronda de pruebas despues de correcciones
5. **Documentar** lecciones aprendidas para futuras sucursales

---

*Documento creado: 19 de febrero 2026*
*Proyecto: CashGuard Paradise*
