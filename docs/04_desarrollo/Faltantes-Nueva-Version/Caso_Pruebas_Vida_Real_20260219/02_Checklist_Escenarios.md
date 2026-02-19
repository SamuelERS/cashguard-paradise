# Checklist de Escenarios de Prueba

**Caso:** Pruebas Vida Real
**Fecha:** 19 de febrero 2026
**Complemento de:** 01_Protocolo_Pruebas_Tienda.md

---

## Instrucciones de Uso

Para cada escenario, marcar el resultado durante las pruebas en tienda:
- **OK** = Funciona como se espera
- **FALLO** = No funciona, documentar con plantilla de bug
- **N/A** = No fue posible probar en este turno
- **PARCIAL** = Funciona pero con problemas menores

---

## 1. Happy Path - Flujos Completos Sin Errores

### 1.1 Conteo Matutino Completo

| # | Escenario | Resultado | Notas |
|---|-----------|-----------|-------|
| 1.1.1 | Abrir PWA y ver pantalla principal con badge de version | | |
| 1.1.2 | Seleccionar "Conteo Matutino" y ver wizard | | |
| 1.1.3 | Completar Paso 1: Protocolo Anti-Fraude (leer y aceptar) | | |
| 1.1.4 | Completar Paso 2: Seleccionar sucursal | | |
| 1.1.5 | Completar Paso 3: Seleccionar cajero | | |
| 1.1.6 | Completar Paso 4: Seleccionar testigo (diferente al cajero) | | |
| 1.1.7 | Contar todas las denominaciones del fondo de caja | | |
| 1.1.8 | Ver resultado con total y diferencia vs $50 | | |
| 1.1.9 | Enviar reporte WhatsApp exitosamente | | |
| 1.1.10 | Reporte llega al grupo de gerencia con formato correcto | | |
| 1.1.11 | Registro guardado en Supabase con timestamp correcto | | |

### 1.2 Conteo Nocturno Completo (total > $50)

| # | Escenario | Resultado | Notas |
|---|-----------|-----------|-------|
| 1.2.1 | Seleccionar "Corte de Caja" y ver wizard | | |
| 1.2.2 | Completar wizard completo (5 pasos incluyendo venta SICAR) | | |
| 1.2.3 | Contar todas las denominaciones (billetes + monedas) | | |
| 1.2.4 | Ingresar pagos electronicos por plataforma | | |
| 1.2.5 | Phase 2 Delivery aparece automaticamente (total > $50) | | |
| 1.2.6 | Lista de entrega a gerencia muestra denominaciones correctas | | |
| 1.2.7 | Phase 2 Verificacion Ciega funciona sin revelar valores | | |
| 1.2.8 | Completar 7 denominaciones de verificacion en secuencia | | |
| 1.2.9 | Phase 3: Resultados muestran totales correctos | | |
| 1.2.10 | Diferencia (sobrante/faltante) calculada correctamente | | |
| 1.2.11 | Reporte WhatsApp incluye todas las secciones | | |
| 1.2.12 | Seccion "LO QUE RECIBES" presente con checkboxes | | |
| 1.2.13 | Seccion "LO QUE QUEDO EN CAJA" presente | | |
| 1.2.14 | Seccion "VERIFICACION CIEGA" con metricas correctas | | |
| 1.2.15 | Registro guardado en Supabase | | |

### 1.3 Conteo Nocturno Completo (total <= $50)

| # | Escenario | Resultado | Notas |
|---|-----------|-----------|-------|
| 1.3.1 | Si total contado es <= $50, Phase 2 se omite automaticamente | | |
| 1.3.2 | Pasa directo de Phase 1 a Phase 3 (resultados) | | |
| 1.3.3 | Reporte no incluye seccion de entrega a gerencia | | |

---

## 2. Edge Cases - Conectividad

| # | Escenario | Como simular | Resultado | Notas |
|---|-----------|--------------|-----------|-------|
| 2.1 | Internet se corta durante guardarProgreso() | Apagar WiFi/datos justo al presionar "Confirmar" | | |
| 2.2 | Internet se corta al enviar reporte WhatsApp | Apagar WiFi antes de presionar "Enviar WhatsApp" | | |
| 2.3 | Internet regresa despues de corte | Reactivar WiFi y verificar que datos se sincronizan | | |
| 2.4 | Internet lento (2G/3G) durante todo el flujo | Usar datos moviles en zona con mala senal | | |
| 2.5 | Sin internet desde el inicio del turno | Modo avion durante todo el flujo matutino | | |
| 2.6 | WiFi se desconecta y reconecta multiples veces | Alternar WiFi on/off cada 30 segundos | | |

---

## 3. Edge Cases - Aplicacion

| # | Escenario | Como simular | Resultado | Notas |
|---|-----------|--------------|-----------|-------|
| 3.1 | App se cierra accidentalmente durante Phase 1 | Forzar cierre desde gestor de apps | | |
| 3.2 | App se cierra accidentalmente durante Phase 2 | Forzar cierre durante verificacion ciega | | |
| 3.3 | App se cierra durante Phase 3 (antes de enviar WhatsApp) | Forzar cierre en pantalla de resultados | | |
| 3.4 | Reanudacion de sesion despues de crash | Reabrir app despues de cierre forzado | | |
| 3.5 | Datos persisten despues de reabrir | Verificar que conteo parcial no se perdio | | |
| 3.6 | PWA no tiene update (version vieja en cache) | Verificar que badge muestra version actual | | |
| 3.7 | Service Worker no actualiza contenido | Borrar cache de app y reinstalar PWA | | |
| 3.8 | Abrir app en browser normal (no PWA standalone) | Abrir URL directamente en Safari/Chrome | | |

---

## 4. Edge Cases - Usuario

| # | Escenario | Resultado | Notas |
|---|-----------|-----------|-------|
| 4.1 | Cajero ingresa valor incorrecto en verificacion ciega (1 intento) | | |
| 4.2 | Cajero ingresa mismo valor incorrecto 2 veces (force override) | | |
| 4.3 | Cajero ingresa 3 valores totalmente diferentes (critical) | | |
| 4.4 | Cajero presiona Enter con modal abierto (triple defensa) | | |
| 4.5 | Cajero intenta retroceder durante Phase 2 (boton eliminado) | | |
| 4.6 | Testigo seleccionado es el mismo que el cajero | | |
| 4.7 | Venta SICAR ingresada como $0 | | |
| 4.8 | Venta SICAR ingresada con decimales ($653.45) | | |
| 4.9 | Gastos del dia registrados correctamente | | |
| 4.10 | Gastos del dia con monto $0 o negativo | | |
| 4.11 | Reporte WhatsApp falla por popup bloqueado | | |
| 4.12 | Cajero usa boton "Copiar" como fallback cuando popup bloqueado | | |
| 4.13 | Dos cajeros intentan usar la app simultaneamente (mismo dispositivo) | | |
| 4.14 | Cambio de cajero a mitad de turno | | |

---

## 5. Edge Cases - Dispositivo

| # | Escenario | Como simular | Resultado | Notas |
|---|-----------|--------------|-----------|-------|
| 5.1 | Dispositivo se queda sin bateria durante operacion | Dejar que bateria baje a 5% durante uso | | |
| 5.2 | Llamada telefonica interrumpe la app | Recibir llamada durante conteo | | |
| 5.3 | Notificacion push cubre la pantalla | Recibir notificacion durante Phase 2 | | |
| 5.4 | Rotacion de pantalla (portrait a landscape) | Girar dispositivo durante uso | | |
| 5.5 | Teclado numerico no aparece en campo de conteo | Tocar campo de input y esperar teclado | | |
| 5.6 | Teclado se cierra inesperadamente | Observar comportamiento durante conteo rapido | | |
| 5.7 | App en segundo plano por mas de 5 minutos | Minimizar app y esperar 5+ minutos | | |
| 5.8 | App en segundo plano por mas de 30 minutos | Minimizar y esperar 30+ minutos, luego reabrir | | |

---

## 6. Performance

| # | Metrica | Objetivo | Medido Dia 1 | Medido Dia 3 | Medido Dia 5 |
|---|---------|----------|--------------|--------------|--------------|
| 6.1 | Tiempo carga inicial PWA (cold start) | < 3s | | | |
| 6.2 | Tiempo carga PWA (warm start, ya en cache) | < 1s | | | |
| 6.3 | Tiempo total flujo matutino (wizard + conteo + WhatsApp) | < 5 min | | | |
| 6.4 | Tiempo total flujo nocturno completo (3 phases + WhatsApp) | < 15 min | | | |
| 6.5 | Respuesta de Supabase al guardar registro | < 2s | | | |
| 6.6 | Respuesta de Supabase con internet lento | < 10s | | | |
| 6.7 | Tiempo entre Phase 2 Verification y Phase 3 Results | < 2s | | | |
| 6.8 | Tiempo de generacion del reporte WhatsApp | < 1s | | | |
| 6.9 | Uso de memoria de la PWA despues de 1 hora | < 150 MB | | | |
| 6.10 | Bateria consumida durante un turno completo (8h) | < 15% | | | |

---

## 7. Validacion Cruzada (Supabase vs WhatsApp)

Para cada turno completado, verificar que los datos coincidan:

| Turno | Fecha | Tipo | Total Efectivo | Total Electronico | Diferencia | Match Supabase? | Match WhatsApp? |
|-------|-------|------|----------------|-------------------|------------|-----------------|-----------------|
| 1 | | Matutino | | N/A | | | |
| 1 | | Nocturno | | | | | |
| 2 | | Matutino | | N/A | | | |
| 2 | | Nocturno | | | | | |
| 3 | | Matutino | | N/A | | | |
| 3 | | Nocturno | | | | | |
| 4 | | Matutino | | N/A | | | |
| 4 | | Nocturno | | | | | |
| 5 | | Matutino | | N/A | | | |
| 5 | | Nocturno | | | | | |

---

## 8. Resumen Post-Pruebas

Completar despues de finalizar los 3-5 dias:

| Categoria | Total Escenarios | OK | Fallo | Parcial | N/A |
|-----------|-----------------|-----|-------|---------|-----|
| Happy Path | 18 | | | | |
| Conectividad | 6 | | | | |
| Aplicacion | 8 | | | | |
| Usuario | 14 | | | | |
| Dispositivo | 8 | | | | |
| Performance | 10 | | | | |
| **TOTAL** | **64** | | | | |

**Bugs S0 encontrados:** ___
**Bugs S1 encontrados:** ___
**Bugs S2 encontrados:** ___

**Decision final:**
- [ ] Listo para despliegue general
- [ ] Requiere otra ronda de pruebas despues de correcciones
- [ ] Requiere cambios arquitectonicos antes de continuar

---

*Documento creado: 19 de febrero 2026*
*Proyecto: CashGuard Paradise*
