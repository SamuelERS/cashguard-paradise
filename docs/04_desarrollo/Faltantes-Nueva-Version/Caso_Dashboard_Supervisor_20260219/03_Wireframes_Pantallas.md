# 03 - Wireframes: Pantallas del Dashboard Supervisor

**Caso:** Dashboard Supervisor
**Fecha:** 19 febrero 2026
**Objetivo:** Representacion visual de las 3 pantallas principales del dashboard usando diagramas ASCII.

---

## 1. Vista A: Lista de Cortes del Dia

Esta es la pantalla principal al entrar al dashboard. Muestra todos los cortes completados del dia actual.

### 1.1 Pantalla Completa

```
+----------------------------------------------------------+
|                                                          |
|  CASHGUARD PARADISE - DASHBOARD SUPERVISOR         [X]  |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|   [ Hoy ]    [ Historial ]                              |
|   --------                                               |
|                                                          |
|   Miercoles, 19 de febrero 2026                         |
|   Cortes completados: 4                                  |
|                                                          |
+------+----------+----------+--------+----------+--------+
| HORA | SUCURSAL | CAJERO   | TOTAL  | DIFERENC | ESTADO |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 3:22 | Plaza    | Irvin    | $482.20| -$171.45 |  (R)   |
|  pm  | Merliot  | Abarca   |        |          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 2:45 | Los      | Adonay   | $653.65| +$2.10   |  (V)   |
|  pm  | Heroes   | Torres   |        |          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 1:15 | Plaza    | Tito     | $390.00| -$7.50   |  (A)   |
|  pm  | Merliot  | Gomez    |        |          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 9:30 | Los      | Jonathan | $50.00 | $0.00    |  (V)   |
|  am  | Heroes   | Melara   | (apert)|          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|                                                          |
|   (V) = Verde    (A) = Amarillo    (R) = Rojo           |
|                                                          |
|   Ultima actualizacion: 3:25 pm    [ Actualizar ]       |
|                                                          |
+----------------------------------------------------------+
```

### 1.2 Vista Movil (Tarjetas)

En pantallas pequenas, cada corte se muestra como tarjeta en lugar de fila de tabla.

```
+--------------------------------+
|                                |
| DASHBOARD SUPERVISOR     [X]  |
|                                |
| [ Hoy ]  [ Historial ]       |
|                                |
| Mie 19 feb 2026 - 4 cortes   |
|                                |
| +----------------------------+ |
| |  (R)  3:22 pm             | |
| |  Plaza Merliot             | |
| |  Cajero: Irvin Abarca     | |
| |  Total: $482.20            | |
| |  Diferencia: -$171.45     | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |  (V)  2:45 pm             | |
| |  Los Heroes                | |
| |  Cajero: Adonay Torres    | |
| |  Total: $653.65            | |
| |  Diferencia: +$2.10       | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |  (A)  1:15 pm             | |
| |  Plaza Merliot             | |
| |  Cajero: Tito Gomez       | |
| |  Total: $390.00            | |
| |  Diferencia: -$7.50       | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |  (V)  9:30 am  (apertura) | |
| |  Los Heroes                | |
| |  Cajero: Jonathan Melara   | |
| |  Total: $50.00             | |
| |  Diferencia: $0.00        | |
| +----------------------------+ |
|                                |
| Actualizado: 3:25 pm          |
|                                |
+--------------------------------+
```

---

## 2. Vista B: Detalle de Corte Individual

Se accede al hacer tap en cualquier fila/tarjeta de la lista.

### 2.1 Header y Resumen

```
+----------------------------------------------------------+
|                                                          |
|  [<- Volver]     DETALLE DE CORTE               (R)    |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  Sucursal:  Plaza Merliot                                |
|  Cajero:    Irvin Abarca                                 |
|  Testigo:   Jonathan Melara                              |
|  Fecha:     19/02/2026, 3:22 p.m.                       |
|  Tipo:      Cierre                                       |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  RESUMEN EJECUTIVO                                       |
|  --------------------------------------------------------|
|                                                          |
|  Efectivo Contado:       $377.20                         |
|  Pagos Electronicos:     $105.00                         |
|                         ---------                        |
|  Total General:          $482.20                         |
|                                                          |
|  Entregado a Gerencia:   $327.20                         |
|  Quedo en Caja:          $50.00                          |
|                                                          |
|  SICAR Esperado:         $653.65                         |
|  Diferencia:            -$171.45  FALTANTE    (R)       |
|                                                          |
+----------------------------------------------------------+
```

### 2.2 Seccion Conteo de Denominaciones

```
+----------------------------------------------------------+
|                                                          |
|  CONTEO DE DENOMINACIONES                    [-]        |
|  --------------------------------------------------------|
|                                                          |
|  MONEDAS                                                 |
|  +------------+-----------+-----------+                  |
|  | Denominac. | Cantidad  | Subtotal  |                  |
|  +------------+-----------+-----------+                  |
|  | 1 centavo  |    65     |   $0.65   |                  |
|  | 5 centavos |    20     |   $1.00   |                  |
|  | 10 centavos|    43     |   $4.30   |                  |
|  | 25 centavos|     8     |   $2.00   |                  |
|  | $1 moneda  |     1     |   $1.00   |                  |
|  +------------+-----------+-----------+                  |
|  | Subtotal Monedas:      |   $8.95   |                  |
|  +------------+-----------+-----------+                  |
|                                                          |
|  BILLETES                                                |
|  +------------+-----------+-----------+                  |
|  | Denominac. | Cantidad  | Subtotal  |                  |
|  +------------+-----------+-----------+                  |
|  | $1         |     5     |   $5.00   |                  |
|  | $5         |     3     |  $15.00   |                  |
|  | $10        |     2     |  $20.00   |                  |
|  | $20        |     4     |  $80.00   |                  |
|  | $50        |     0     |   $0.00   |                  |
|  | $100       |     1     | $100.00   |                  |
|  +------------+-----------+-----------+                  |
|  | Subtotal Billetes:     | $220.00   |                  |
|  +------------+-----------+-----------+                  |
|                                                          |
|  TOTAL EFECTIVO:            $377.20                      |
|                                                          |
+----------------------------------------------------------+
```

### 2.3 Seccion Pagos Electronicos

```
+----------------------------------------------------------+
|                                                          |
|  PAGOS ELECTRONICOS                          [-]        |
|  --------------------------------------------------------|
|                                                          |
|  +------------------+-------------+                      |
|  | Plataforma       | Monto       |                      |
|  +------------------+-------------+                      |
|  | Credomatic       |     $5.32   |                      |
|  | Promerica        |    $56.12   |                      |
|  | Transferencia    |    $43.56   |                      |
|  | PayPal           |     $0.00   |                      |
|  +------------------+-------------+                      |
|  | Total Electronico|   $105.00   |                      |
|  +------------------+-------------+                      |
|                                                          |
+----------------------------------------------------------+
```

### 2.4 Seccion Entrega a Gerencia

```
+----------------------------------------------------------+
|                                                          |
|  ENTREGA A GERENCIA ($327.20)                [-]        |
|  --------------------------------------------------------|
|                                                          |
|  ENTREGADO:                                              |
|  +------------+-----------+-----------+                  |
|  | $100       |     1     | $100.00   |                  |
|  | $20        |     4     |  $80.00   |                  |
|  | $10        |     2     |  $20.00   |                  |
|  | $5         |     2     |  $10.00   |                  |
|  | ...        |    ...    |   ...     |                  |
|  +------------+-----------+-----------+                  |
|                                                          |
|  QUEDO EN CAJA ($50.00):                                 |
|  +------------+-----------+-----------+                  |
|  | $10        |     0     |   $0.00   |                  |
|  | $5         |     1     |   $5.00   |                  |
|  | $1         |     5     |   $5.00   |                  |
|  | 25 centavos|     7     |   $1.75   |                  |
|  | ...        |    ...    |   ...     |                  |
|  +------------+-----------+-----------+                  |
|                                                          |
+----------------------------------------------------------+
```

### 2.5 Seccion Verificacion Ciega

```
+----------------------------------------------------------+
|                                                          |
|  VERIFICACION CIEGA                          [-]        |
|  --------------------------------------------------------|
|                                                          |
|  METRICAS:                                               |
|  +------------------------------+---------+              |
|  | Perfectas (1er intento)      |  5/8    |              |
|  | Corregidas (2do intento)     |  1/8    |              |
|  | Criticas (3er intento)       |  2/8    |              |
|  +------------------------------+---------+              |
|                                                          |
|  DENOMINACIONES CON PROBLEMAS:                           |
|                                                          |
|  (R)  Diez centavos (10c)                               |
|       Severidad: critical_severe                         |
|       Intentos: 33 -> 40 -> 32                          |
|       Patron: Erratico                                   |
|                                                          |
|  (R)  Billete $1                                        |
|       Severidad: critical_inconsistent                   |
|       Intentos: 5 -> 2 -> 3                             |
|       Patron: Inconsistencia severa                      |
|                                                          |
|  (A)  Veinticinco centavos (25c)                        |
|       Severidad: warning_retry                           |
|       Intentos: 9 -> 8                                  |
|       Patron: Corregido en 2do intento                   |
|                                                          |
+----------------------------------------------------------+
```

### 2.6 Seccion Alertas y Acciones

```
+----------------------------------------------------------+
|                                                          |
|  ALERTAS DETECTADAS                                      |
|  --------------------------------------------------------|
|                                                          |
|  (R) CRITICAS (2)                                       |
|                                                          |
|  * Diez centavos: 3 intentos erraticos                  |
|    Esperado: 43 | Intentos: 33, 40, 32                  |
|    Video: 15:22:21 - 15:22:25                            |
|                                                          |
|  * Billete $1: Inconsistencia severa                    |
|    Esperado: 5 | Intentos: 5, 2, 3                      |
|    Video: 15:22:28 - 15:22:34                            |
|                                                          |
|  (A) ADVERTENCIAS (1)                                   |
|                                                          |
|  * 25 centavos: Corregido en 2do intento                |
|    Esperado: 8 | Intentos: 9, 8                         |
|    Video: 15:22:16 - 15:22:18                            |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  [ Ver Reporte Original (WhatsApp) ]                    |
|                                                          |
+----------------------------------------------------------+
```

---

## 3. Vista C: Historial por Rango de Fechas

### 3.1 Pantalla con Filtros

```
+----------------------------------------------------------+
|                                                          |
|  CASHGUARD PARADISE - DASHBOARD SUPERVISOR         [X]  |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|   [ Hoy ]    [ Historial ]                              |
|               -----------                                |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  FILTROS                                                 |
|                                                          |
|  Desde:  [ 01/02/2026  v ]   Hasta: [ 19/02/2026  v ]  |
|                                                          |
|  Sucursal: [ Todas           v ]                        |
|                                                          |
|  Cajero:   [ Todos           v ]                        |
|                                                          |
|               [ Buscar ]                                 |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  RESULTADOS: 12 cortes encontrados                       |
|                                                          |
+------+----------+----------+--------+----------+--------+
| FECHA| SUCURSAL | CAJERO   | TOTAL  | DIFERENC | ESTADO |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 19/02| Plaza    | Irvin    | $482.20| -$171.45 |  (R)   |
| 3:22p| Merliot  | Abarca   |        |          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 19/02| Los      | Adonay   | $653.65| +$2.10   |  (V)   |
| 2:45p| Heroes   | Torres   |        |          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 18/02| Los      | Jonathan | $510.30| -$4.20   |  (A)   |
| 4:10p| Heroes   | Melara   |        |          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
| 18/02| Plaza    | Tito     | $720.00| +$0.50   |  (V)   |
| 3:55p| Merliot  | Gomez    |        |          |        |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|      |          |          |        |          |        |
|  ... |   ...    |  ...     |  ...   |   ...    |  ...   |
|      |          |          |        |          |        |
+------+----------+----------+--------+----------+--------+
|                                                          |
|           [ <- Anterior ]  Pag 1/1  [ Siguiente -> ]    |
|                                                          |
+----------------------------------------------------------+
```

### 3.2 Vista Movil del Historial

```
+--------------------------------+
|                                |
| DASHBOARD SUPERVISOR     [X]  |
|                                |
| [ Hoy ]  [ Historial ]       |
|           -----------          |
|                                |
| FILTROS                        |
|                                |
| Desde: [ 01/02/2026    v ]   |
| Hasta: [ 19/02/2026    v ]   |
| Sucursal: [ Todas       v ]   |
| Cajero: [ Todos         v ]   |
|                                |
|       [ Buscar ]              |
|                                |
| 12 cortes encontrados          |
|                                |
| +----------------------------+ |
| |  (R) 19/02 3:22pm         | |
| |  Plaza Merliot             | |
| |  Irvin Abarca              | |
| |  $482.20  |  -$171.45     | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |  (V) 19/02 2:45pm         | |
| |  Los Heroes                | |
| |  Adonay Torres             | |
| |  $653.65  |  +$2.10       | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |  (A) 18/02 4:10pm         | |
| |  Los Heroes                | |
| |  Jonathan Melara            | |
| |  $510.30  |  -$4.20       | |
| +----------------------------+ |
|                                |
|    [<-]  Pag 1/1  [->]       |
|                                |
+--------------------------------+
```

---

## 4. Pantalla de Autenticacion (PIN)

Se muestra al acceder a `/supervisor` sin sesion activa.

```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|         +-----------------------------+                  |
|         |                             |                  |
|         |   ACCESO SUPERVISOR         |                  |
|         |                             |                  |
|         |   Ingrese su PIN:           |                  |
|         |                             |                  |
|         |   +---+---+---+---+        |                  |
|         |   | * | * | * |   |        |                  |
|         |   +---+---+---+---+        |                  |
|         |                             |                  |
|         |   +---+ +---+ +---+        |                  |
|         |   | 1 | | 2 | | 3 |        |                  |
|         |   +---+ +---+ +---+        |                  |
|         |   +---+ +---+ +---+        |                  |
|         |   | 4 | | 5 | | 6 |        |                  |
|         |   +---+ +---+ +---+        |                  |
|         |   +---+ +---+ +---+        |                  |
|         |   | 7 | | 8 | | 9 |        |                  |
|         |   +---+ +---+ +---+        |                  |
|         |         +---+              |                  |
|         |         | 0 |              |                  |
|         |         +---+              |                  |
|         |                             |                  |
|         |  [Cancelar]   [Validar]    |                  |
|         |                             |                  |
|         +-----------------------------+                  |
|                                                          |
|                                                          |
+----------------------------------------------------------+
```

**Nota:** Este componente ya existe como `PinModal`. Solo se reutiliza con el titulo cambiado a "ACCESO SUPERVISOR".

---

## 5. Modal Reporte Original

Se abre al presionar "Ver Reporte Original" en Vista B.

```
+----------------------------------------------------------+
|                                                          |
|  +----------------------------------------------------+ |
|  |                                                    | |
|  |  REPORTE ORIGINAL (WhatsApp)              [X]     | |
|  |                                                    | |
|  |  ------------------------------------------------ | |
|  |                                                    | |
|  |  REPORTE CRITICO - ACCION INMEDIATA               | |
|  |                                                    | |
|  |  CORTE DE CAJA - 19/02/2026, 3:22 p.m.           | |
|  |  Sucursal: Plaza Merliot                           | |
|  |  Cajero: Irvin Abarca                              | |
|  |  Testigo: Jonathan Melara                          | |
|  |                                                    | |
|  |  ================                                  | |
|  |                                                    | |
|  |  RESUMEN EJECUTIVO                                 | |
|  |                                                    | |
|  |  Efectivo Contado: $377.20                         | |
|  |  Pagos Electronicos: $105.00                       | |
|  |    Credomatic: $5.32                               | |
|  |    Promerica: $56.12                               | |
|  |    Transferencia: $43.56                           | |
|  |    PayPal: $0.00                                   | |
|  |                                                    | |
|  |  ... (texto completo del reporte) ...              | |
|  |                                                    | |
|  |  Firma Digital: ZXRlZCI6M30=                       | |
|  |                                                    | |
|  |  ------------------------------------------------ | |
|  |                                                    | |
|  |            [ Copiar Texto ]  [ Cerrar ]           | |
|  |                                                    | |
|  +----------------------------------------------------+ |
|                                                          |
+----------------------------------------------------------+
```

---

## 6. Indicador de Semaforo (Referencia Visual)

Representacion del indicador que acompana cada corte en las listas.

```
  Verde:     Amarillo:    Rojo:
  +----+     +----+       +----+
  | V  |     | A  |       | R  |
  +----+     +----+       +----+

  < $3       $3 - $10     > $10
  Sin        Con           Con
  alertas    advertencias  criticas
```

En la implementacion real, estos seran circulos coloreados (no texto). Los colores seguiran la paleta del design system existente:

- Verde: `#065f46` (mismo que ConstructiveActionButton)
- Amarillo: `#f4a52a` (mismo que tema matutino)
- Rojo: `#7f1d1d` (mismo que DestructiveActionButton)

---

## 7. Flujo de Navegacion

```
                    /supervisor
                        |
                    [PinModal]
                        |
                   PIN Valido?
                   /         \
                 NO           SI
                 |             |
            [Rechazado]   /supervisor/cortes
                              |
                    +---------+---------+
                    |                   |
              [Tab: Hoy]         [Tab: Historial]
                    |                   |
             Lista del Dia      Filtros + Lista
                    |                   |
                    +------- TAP -------+
                              |
                     /supervisor/corte/:id
                              |
                    Detalle Completo
                              |
                    [Ver Reporte Original]
                              |
                    ReporteOriginalModal
```

---

## 8. Notas de Diseno

1. **Glass morphism:** Mantener el efecto glass del proyecto (`rgba(36,36,36,0.4)` + `blur(20px)`)
2. **Colores de texto:** Titulos en `#e1e8ed`, subtextos en `#8899a6`
3. **Bordes:** `rgba(255,255,255,0.15)` consistente con el sistema
4. **Responsive:** Mobile-first. Tabla en desktop, tarjetas en mobile
5. **Secciones colapsables:** El detalle de corte tiene muchas secciones. Usar acordeon para que el usuario expanda solo lo que necesita
6. **Sin animaciones pesadas:** Evitar Framer Motion en el dashboard (leccion del bug iOS Safari documentado en v1.3.6Z)
7. **Fuente monoespaciada:** Para el modal de reporte original, usar fuente mono para mantener el formato del texto WhatsApp
