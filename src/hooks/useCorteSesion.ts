// 🤖 [IA] - v1.4.0: CASO #3 RESILIENCIA OFFLINE (Iteración 3a) — clasificador robusto esErrorDeRed
// Previous: v1.3.0: reconexión automática con procesarCola
// Previous: v1.2.0: guardarProgreso encola offline si falla red
// Previous: v1.1.0: OT-17 — insert snapshot append-only
// Previous: v1.0.0: Hook de sesión de corte — capa de sincronización Supabase
// Orden de Trabajo #004 — Director General de Proyecto

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, tables } from '../lib/supabase';
import { insertSnapshot } from '../lib/snapshots';
import {
  agregarOperacion,
  escucharConectividad,
  procesarCola,
} from '../lib/offlineQueue';
import type { OperacionOffline } from '../lib/offlineQueue';
import {
  esErrorDeRed,
  esErrorInmutabilidadTerminal,
  MENSAJE_CORTE_TERMINAL_INMUTABLE,
} from '../lib/esErrorDeRed';
import type { CashCount, ElectronicPayments } from '../types/cash';
import type {
  Corte,
  CorteIntento,
  EstadoCorte,
  EstadoIntento,
  IniciarCorteParams,
  DatosProgreso,
  UseCorteSesionReturn,
} from '../types/auditoria';
import { ESTADOS_TERMINALES, CORRELATIVO_REGEX } from '../types/auditoria';

interface UseCorteSesionOptions {
  autoRecuperarSesion?: boolean;
  procesarColaEnReconexion?: boolean;
}

// ---------------------------------------------------------------------------
// Helper exportado: generarCorrelativo
// ---------------------------------------------------------------------------

/**
 * Genera un correlativo unico para un corte de caja.
 *
 * @param codigoSucursal - Codigo de sucursal (1 letra mayuscula, ej: "H")
 * @param fecha - Fecha del corte
 * @param secuencial - Numero secuencial del dia (1-based)
 * @returns Correlativo con formato CORTE-YYYY-MM-DD-X-NNN
 *
 * @example
 * ```ts
 * generarCorrelativo("H", new Date(2026, 1, 8), 1)
 * // => "CORTE-2026-02-08-H-001"
 * ```
 */
export function generarCorrelativo(
  codigoSucursal: string,
  fecha: Date,
  secuencial: number,
): string {
  const yyyy = fecha.getFullYear().toString();
  const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dd = fecha.getDate().toString().padStart(2, '0');
  const nnn = secuencial.toString().padStart(3, '0');

  const correlativo = `CORTE-${yyyy}-${mm}-${dd}-${codigoSucursal}-${nnn}`;

  if (!CORRELATIVO_REGEX.test(correlativo)) {
    throw new Error(`Correlativo generado no es valido: ${correlativo}`);
  }

  return correlativo;
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

/**
 * Hook de sesion de corte de caja — capa de sincronizacion con Supabase.
 *
 * Gestiona el ciclo de vida completo de un corte: inicio, progreso,
 * finalizacion, aborto, reinicio de intentos y recuperacion de sesion.
 *
 * @param sucursal_id - UUID de la sucursal (obligatorio, no cambia durante el ciclo de vida)
 * @returns Estado y acciones del corte ({@link UseCorteSesionReturn})
 */
export function useCorteSesion(
  sucursal_id: string,
  options?: UseCorteSesionOptions,
): UseCorteSesionReturn {
  const isMissingEmployeeIdColumnError = (message?: string | null): boolean => {
    const normalized = (message ?? '').toLowerCase();
    const mentionsEmployeeIdColumn =
      normalized.includes('cajero_id') || normalized.includes('testigo_id');
    const isSchemaColumnError =
      normalized.includes('schema cache') ||
      normalized.includes('column') ||
      normalized.includes('does not exist');
    return mentionsEmployeeIdColumn && isSchemaColumnError;
  };

  const isCorrelativoDuplicateKeyError = (message?: string | null): boolean => {
    const normalized = (message ?? '').toLowerCase();
    return (
      normalized.includes('cortes_correlativo_key') ||
      normalized.includes('duplicate key value violates unique constraint')
    );
  };

  const isIniciarCorteRpcNoDisponible = (
    error: { message?: string | null; code?: string | null } | null | undefined,
  ): boolean => {
    const message = (error?.message ?? '').toLowerCase();
    return (
      error?.code === 'PGRST202' ||
      message.includes('could not find the function public.iniciar_corte_transaccional') ||
      message.includes('schema cache')
    );
  };

  const autoRecuperarSesion = options?.autoRecuperarSesion ?? true;
  const procesarColaEnReconexion = options?.procesarColaEnReconexion ?? true;
  const [corteActual, setCorteActual] = useState<Corte | null>(null);
  const [intentoActual, setIntentoActual] = useState<CorteIntento | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🤖 [IA] - v1.0.0: Estado derivado del corte actual
  const estado: EstadoCorte | null = corteActual?.estado ?? null;

  // 🤖 [IA] - v1.0.0: Contador para manejar cargando con operaciones concurrentes
  const loadingCount = useRef(0);

  // -------------------------------------------------------------------------
  // iniciarCorte
  // -------------------------------------------------------------------------

  const iniciarCorte = useCallback(async (
    params: IniciarCorteParams,
  ): Promise<Corte> => {
    try {
      loadingCount.current += 1;
      setCargando(true);
      setError(null);

      // 🤖 [IA] - v1.0.0: Validar cajero !== testigo
      if (params.cajero === params.testigo) {
        throw new Error('Cajero y testigo deben ser diferentes');
      }

      let corte: Corte | null = null;
      const { data: corteRpc, error: rpcError } = await supabase.rpc(
        'iniciar_corte_transaccional',
        {
          p_sucursal_id: params.sucursal_id,
          p_cajero: params.cajero,
          p_testigo: params.testigo,
          p_venta_esperada: params.venta_esperada ?? null,
          p_cajero_id: params.cajero_id ?? null,
          p_testigo_id: params.testigo_id ?? null,
        },
      );

      if (!rpcError && corteRpc) {
        corte = corteRpc as unknown as Corte;
      } else if (rpcError && !isIniciarCorteRpcNoDisponible(rpcError)) {
        throw new Error(rpcError.message);
      }

      // Fallback temporal para entornos que aún no tienen la RPC OT-25 desplegada.
      if (!corte) {
        // 🤖 [IA] - v1.0.0: Obtener codigo de sucursal
        const { data: sucursal, error: sucursalError } = await tables
          .sucursales()
          .select('codigo')
          .eq('id', params.sucursal_id)
          .single();

        if (sucursalError || !sucursal) {
          throw new Error(sucursalError?.message ?? 'Sucursal no encontrada');
        }

        // 🤖 [IA] - v1.0.0: Verificar no existe corte FINALIZADO hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const fechaHoyInicio = hoy.toISOString();
        const fechaMananaInicio = manana.toISOString();

        const { data: cortesHoy, error: cortesError } = await tables
          .cortes()
          .select('id, estado')
          .eq('sucursal_id', params.sucursal_id)
          .gte('created_at', fechaHoyInicio)
          .lt('created_at', fechaMananaInicio);

        if (cortesError) {
          throw new Error(cortesError.message);
        }

        const cortesFinalizados = (cortesHoy ?? []).filter(
          (c) => c.estado === 'FINALIZADO',
        );
        if (cortesFinalizados.length > 0) {
          throw new Error('Ya existe un corte finalizado para hoy');
        }

        // Evita fallas por carrera/reintento: si colisiona correlativo, incrementa secuencial y reintenta.
        const secuencialBase = (cortesHoy ?? []).length + 1;
        const fechaCorrelativo = new Date();
        const MAX_REINTENTOS_CORRELATIVO = 5;
        let insertError: { message?: string | null } | null = null;

        for (let reintento = 0; reintento < MAX_REINTENTOS_CORRELATIVO; reintento += 1) {
          const correlativo = generarCorrelativo(
            sucursal.codigo,
            fechaCorrelativo,
            secuencialBase + reintento,
          );

          const baseInsertPayload = {
            sucursal_id: params.sucursal_id,
            cajero: params.cajero,
            testigo: params.testigo,
            estado: 'INICIADO' as EstadoCorte,
            correlativo: correlativo,
            fase_actual: 0,
            intento_actual: 1,
            venta_esperada: params.venta_esperada ?? null,
            datos_conteo: null,
            datos_entrega: null,
            datos_verificacion: null,
            datos_reporte: null,
            reporte_hash: null,
            finalizado_at: null,
            motivo_aborto: null,
          };

          const payloadWithEmployeeIds = {
            ...baseInsertPayload,
            cajero_id: params.cajero_id ?? null,
            testigo_id: params.testigo_id ?? null,
          };

          let { data: corteIntento, error: errorIntento } = await tables
            .cortes()
            .insert(payloadWithEmployeeIds)
            .select()
            .single();

          // Backward compatibility: algunos entornos aún no tienen columnas cajero_id/testigo_id.
          if (errorIntento && isMissingEmployeeIdColumnError(errorIntento.message)) {
            ({ data: corteIntento, error: errorIntento } = await tables
              .cortes()
              .insert(baseInsertPayload)
              .select()
              .single());
          }

          if (!errorIntento && corteIntento) {
            corte = corteIntento;
            insertError = null;
            break;
          }

          insertError = errorIntento;
          if (isCorrelativoDuplicateKeyError(errorIntento?.message ?? null)) {
            continue;
          }

          break;
        }

        if (insertError || !corte) {
          throw new Error(insertError?.message ?? 'Error al crear corte');
        }
      }

      // 🤖 [IA] - v1.0.0: Crear primer intento
      const { data: intento, error: intentoError } = await tables
        .corteIntentos()
        .insert({
          corte_id: corte.id,
          attempt_number: 1,
          estado: 'ACTIVO' as EstadoIntento,
          snapshot_datos: null,
          motivo_reinicio: null,
          finalizado_at: null,
        })
        .select()
        .single();

      if (intentoError || !intento) {
        throw new Error(intentoError?.message ?? 'Error al crear intento');
      }

      setCorteActual(corte);
      setIntentoActual(intento);

      return corte;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      loadingCount.current -= 1;
      if (loadingCount.current === 0) setCargando(false);
    }
  // 🤖 [IA] - Fix OT-02: sucursal_id removido de deps (callback usa params.sucursal_id, no la variable outer)
  }, []);

  // -------------------------------------------------------------------------
  // guardarProgreso
  // -------------------------------------------------------------------------

  const guardarProgreso = useCallback(async (
    datos: DatosProgreso,
  ): Promise<void> => {
    try {
      loadingCount.current += 1;
      setCargando(true);
      setError(null);

      // 🤖 [IA] - v1.0.0: Validar corte activo y no terminal
      if (!corteActual || ESTADOS_TERMINALES.includes(corteActual.estado)) {
        throw new Error('No hay corte activo para guardar progreso');
      }

      // 🤖 [IA] - v1.0.0: Transicionar INICIADO -> EN_PROGRESO
      const nuevoEstado: EstadoCorte =
        corteActual.estado === 'INICIADO' ? 'EN_PROGRESO' : corteActual.estado;

      // 🤖 [IA] - v1.0.0: Combinar datos de conteo
      const datosConteo: Record<string, unknown> = {
        conteo_parcial: datos.conteo_parcial,
        pagos_electronicos: datos.pagos_electronicos,
        gastos_dia: datos.gastos_dia,
      };
      const datosEntrega = Object.prototype.hasOwnProperty.call(datos, 'datos_entrega')
        ? (datos.datos_entrega ?? null)
        : corteActual.datos_entrega;
      const datosVerificacion = Object.prototype.hasOwnProperty.call(datos, 'datos_verificacion')
        ? (datos.datos_verificacion ?? null)
        : corteActual.datos_verificacion;
      const datosReporte = Object.prototype.hasOwnProperty.call(datos, 'datos_reporte')
        ? (datos.datos_reporte ?? null)
        : corteActual.datos_reporte;

      const { data: corteActualizado, error: updateError } = await tables
        .cortes()
        .update({
          fase_actual: datos.fase_actual,
          estado: nuevoEstado,
          datos_conteo: datosConteo,
          datos_entrega: datosEntrega,
          datos_verificacion: datosVerificacion,
          datos_reporte: datosReporte,
          updated_at: new Date().toISOString(),
        })
        .eq('id', corteActual.id)
        .select()
        .single();

      if (updateError || !corteActualizado) {
        throw new Error(updateError?.message ?? 'Error al guardar progreso');
      }

      // 🤖 [IA] - OT-17: Insertar snapshot append-only (fire-and-forget, no bloquea flujo)
      insertSnapshot({
        corte_id: corteActual.id,
        attempt_number: corteActual.intento_actual,
        fase_actual: datos.fase_actual,
        cashCount: (datos.conteo_parcial ?? {}) as CashCount,
        electronicPayments: (datos.pagos_electronicos ?? {}) as ElectronicPayments,
        gastos_dia: datos.gastos_dia,
        source: 'manual',
      }).catch((snapshotErr: unknown) => {
        // Snapshot es audit trail — NO debe bloquear el flujo principal
        console.warn('[useCorteSesion] Snapshot fallido (no-blocking):', snapshotErr);
      });

      setCorteActual(corteActualizado);
    } catch (err: unknown) {
      // 🤖 [IA] - CASO #3 RESILIENCIA OFFLINE (Iter 3a): Clasificador robusto de errores de red
      if (esErrorDeRed(err) && corteActual) {
        const ahora = new Date().toISOString();
        const estadoOptimista: EstadoCorte =
          corteActual.estado === 'INICIADO' ? 'EN_PROGRESO' : corteActual.estado;
        const datosEntregaFallback = Object.prototype.hasOwnProperty.call(datos, 'datos_entrega')
          ? (datos.datos_entrega ?? null)
          : corteActual.datos_entrega;
        const datosVerificacionFallback =
          Object.prototype.hasOwnProperty.call(datos, 'datos_verificacion')
            ? (datos.datos_verificacion ?? null)
            : corteActual.datos_verificacion;
        const datosReporteFallback = Object.prototype.hasOwnProperty.call(datos, 'datos_reporte')
          ? (datos.datos_reporte ?? null)
          : corteActual.datos_reporte;
        setCorteActual({
          ...corteActual,
          fase_actual: datos.fase_actual,
          estado: estadoOptimista,
          datos_conteo: {
            conteo_parcial: datos.conteo_parcial,
            pagos_electronicos: datos.pagos_electronicos,
            gastos_dia: datos.gastos_dia,
          },
          datos_entrega: datosEntregaFallback,
          datos_verificacion: datosVerificacionFallback,
          datos_reporte: datosReporteFallback,
          updated_at: ahora,
        });

        agregarOperacion({
          tipo: 'GUARDAR_PROGRESO',
          payload: {
            fase_actual: datos.fase_actual,
            datos_conteo: {
              conteo_parcial: datos.conteo_parcial,
              pagos_electronicos: datos.pagos_electronicos,
              gastos_dia: datos.gastos_dia,
            },
            datos_entrega: datosEntregaFallback,
            datos_verificacion: datosVerificacionFallback,
            datos_reporte: datosReporteFallback,
          },
          corteId: corteActual.id,
        });
        // No setError, no throw — degradación elegante, estado local preservado
        return;
      }

      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      loadingCount.current -= 1;
      if (loadingCount.current === 0) setCargando(false);
    }
  }, [corteActual]);

  // -------------------------------------------------------------------------
  // finalizarCorte
  // -------------------------------------------------------------------------

  const finalizarCorte = useCallback(async (
    reporte_hash: string,
    datos_reporte?: Record<string, unknown> | null,
  ): Promise<Corte> => {
    const incluirDatosReporte = datos_reporte !== undefined;
    try {
      loadingCount.current += 1;
      setCargando(true);
      setError(null);

      // 🤖 [IA] - v1.0.0: Solo se puede finalizar un corte EN_PROGRESO
      if (!corteActual || corteActual.estado !== 'EN_PROGRESO') {
        throw new Error('Solo se puede finalizar un corte EN_PROGRESO');
      }

      if (!reporte_hash.trim()) {
        throw new Error('reporte_hash es obligatorio');
      }

      const ahora = new Date().toISOString();

      const { data: corteFinalizado, error: updateError } = await tables
        .cortes()
        .update({
          estado: 'FINALIZADO' as EstadoCorte,
          reporte_hash: reporte_hash,
          ...(incluirDatosReporte ? { datos_reporte: datos_reporte ?? null } : {}),
          finalizado_at: ahora,
          updated_at: ahora,
        })
        .eq('id', corteActual.id)
        .select()
        .single();

      if (updateError || !corteFinalizado) {
        if (esErrorInmutabilidadTerminal(updateError?.message ?? null)) {
          throw new Error(MENSAJE_CORTE_TERMINAL_INMUTABLE);
        }
        throw new Error(updateError?.message ?? 'Error al finalizar corte');
      }

      // 🤖 [IA] - v1.0.0: Marcar intento actual como COMPLETADO
      if (intentoActual) {
        const { error: intentoUpdateError } = await tables
          .corteIntentos()
          .update({
            estado: 'COMPLETADO' as EstadoIntento,
            finalizado_at: ahora,
          })
          .eq('id', intentoActual.id);

        if (intentoUpdateError) {
          throw new Error(intentoUpdateError.message);
        }
      }

      setCorteActual(corteFinalizado);
      setIntentoActual(null);

      return corteFinalizado;
    } catch (err: unknown) {
      if (esErrorDeRed(err) && corteActual) {
        const ahora = new Date().toISOString();
        agregarOperacion({
          tipo: 'FINALIZAR_CORTE',
          payload: {
            reporte_hash,
            ...(incluirDatosReporte ? { datos_reporte: datos_reporte ?? null } : {}),
            finalizado_at: ahora,
            intento_id: intentoActual?.id ?? null,
          },
          corteId: corteActual.id,
        });

        const corteFinalizadoLocal: Corte = {
          ...corteActual,
          estado: 'FINALIZADO',
          reporte_hash,
          ...(incluirDatosReporte ? { datos_reporte: datos_reporte ?? null } : {}),
          finalizado_at: ahora,
          updated_at: ahora,
        };
        setCorteActual(corteFinalizadoLocal);
        setIntentoActual(null);
        return corteFinalizadoLocal;
      }

      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      loadingCount.current -= 1;
      if (loadingCount.current === 0) setCargando(false);
    }
  }, [corteActual, intentoActual]);

  // -------------------------------------------------------------------------
  // abortarCorte
  // -------------------------------------------------------------------------

  const abortarCorte = useCallback(async (
    motivo: string,
  ): Promise<void> => {
    try {
      loadingCount.current += 1;
      setCargando(true);
      setError(null);

      // 🤖 [IA] - v1.0.0: Validar corte activo y no terminal
      if (!corteActual || ESTADOS_TERMINALES.includes(corteActual.estado)) {
        throw new Error('No hay corte activo para abortar');
      }

      if (!motivo.trim()) {
        throw new Error('Motivo de aborto es obligatorio');
      }

      const ahora = new Date().toISOString();

      const { error: updateError } = await tables
        .cortes()
        .update({
          estado: 'ABORTADO' as EstadoCorte,
          motivo_aborto: motivo,
          finalizado_at: ahora,
          updated_at: ahora,
        })
        .eq('id', corteActual.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 🤖 [IA] - v1.0.0: Marcar intento actual como ABANDONADO con snapshot
      if (intentoActual) {
        const { error: intentoUpdateError } = await tables
          .corteIntentos()
          .update({
            estado: 'ABANDONADO' as EstadoIntento,
            finalizado_at: ahora,
            snapshot_datos: corteActual.datos_conteo,
          })
          .eq('id', intentoActual.id);

        if (intentoUpdateError) {
          throw new Error(intentoUpdateError.message);
        }
      }

      setCorteActual(null);
      setIntentoActual(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      loadingCount.current -= 1;
      if (loadingCount.current === 0) setCargando(false);
    }
  }, [corteActual, intentoActual]);

  // -------------------------------------------------------------------------
  // reiniciarIntento
  // -------------------------------------------------------------------------

  const reiniciarIntento = useCallback(async (
    motivo: string,
  ): Promise<CorteIntento> => {
    try {
      loadingCount.current += 1;
      setCargando(true);
      setError(null);

      // 🤖 [IA] - v1.0.0: Validar corte activo y no terminal
      if (!corteActual || ESTADOS_TERMINALES.includes(corteActual.estado)) {
        throw new Error('No hay corte activo para reiniciar');
      }

      if (!motivo.trim()) {
        throw new Error('Motivo de reinicio es obligatorio');
      }

      const ahora = new Date().toISOString();

      // 🤖 [IA] - v1.0.0: Marcar intento actual como ABANDONADO
      if (intentoActual) {
        const { error: intentoUpdateError } = await tables
          .corteIntentos()
          .update({
            estado: 'ABANDONADO' as EstadoIntento,
            finalizado_at: ahora,
            snapshot_datos: corteActual.datos_conteo,
          })
          .eq('id', intentoActual.id);

        if (intentoUpdateError) {
          throw new Error(intentoUpdateError.message);
        }
      }

      // 🤖 [IA] - v1.0.0: Crear nuevo intento con numero incrementado
      const nuevoNumero = corteActual.intento_actual + 1;

      const { data: nuevoIntento, error: insertError } = await tables
        .corteIntentos()
        .insert({
          corte_id: corteActual.id,
          attempt_number: nuevoNumero,
          estado: 'ACTIVO' as EstadoIntento,
          motivo_reinicio: motivo,
          snapshot_datos: null,
          finalizado_at: null,
        })
        .select()
        .single();

      if (insertError || !nuevoIntento) {
        throw new Error(insertError?.message ?? 'Error al crear nuevo intento');
      }

      // 🤖 [IA] - v1.0.0: Actualizar corte (incrementar intento, limpiar datos parciales)
      const { data: corteActualizado, error: updateError } = await tables
        .cortes()
        .update({
          intento_actual: nuevoNumero,
          fase_actual: 0,
          datos_conteo: null,
          datos_entrega: null,
          datos_verificacion: null,
          datos_reporte: null,
          updated_at: ahora,
        })
        .eq('id', corteActual.id)
        .select()
        .single();

      if (updateError || !corteActualizado) {
        throw new Error(updateError?.message ?? 'Error al actualizar corte');
      }

      setCorteActual(corteActualizado);
      setIntentoActual(nuevoIntento);

      return nuevoIntento;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      loadingCount.current -= 1;
      if (loadingCount.current === 0) setCargando(false);
    }
  }, [corteActual, intentoActual]);

  // -------------------------------------------------------------------------
  // recuperarSesion
  // -------------------------------------------------------------------------

  const recuperarSesion = useCallback(async (): Promise<Corte | null> => {
    try {
      loadingCount.current += 1;
      setCargando(true);
      setError(null);

      // 🤖 [IA] - v1.0.0: Buscar corte activo (INICIADO o EN_PROGRESO)
      const { data: corte, error: corteError } = await tables
        .cortes()
        .select('*')
        .eq('sucursal_id', sucursal_id)
        .in('estado', ['INICIADO', 'EN_PROGRESO'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (corteError) {
        throw new Error(corteError.message);
      }

      if (!corte) {
        return null;
      }

      // 🤖 [IA] - v1.0.0: Buscar intento ACTIVO del corte
      const { data: intento, error: intentoError } = await tables
        .corteIntentos()
        .select('*')
        .eq('corte_id', corte.id)
        .eq('estado', 'ACTIVO')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (intentoError) {
        throw new Error(intentoError.message);
      }

      setCorteActual(corte);
      setIntentoActual(intento);

      return corte;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      loadingCount.current -= 1;
      if (loadingCount.current === 0) setCargando(false);
    }
  }, [sucursal_id]);

  // -------------------------------------------------------------------------
  // Auto-recovery al montar
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!autoRecuperarSesion) return;
    if (sucursal_id) {
      recuperarSesion().catch(() => {
        // 🤖 [IA] - v1.0.0: Error silencioso en auto-recovery
        // El usuario puede reintentar manualmente o iniciar un nuevo corte
      });
    }
  }, [autoRecuperarSesion, sucursal_id, recuperarSesion]);

  // -------------------------------------------------------------------------
  // 🤖 [IA] - v1.3.0: Reconexión automática — procesar cola offline al volver online
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!procesarColaEnReconexion) return;

    const ejecutor = async (op: OperacionOffline): Promise<void> => {
      if (op.tipo === 'GUARDAR_PROGRESO') {
        const payload = op.payload as {
          fase_actual: number;
          datos_conteo: Record<string, unknown>;
          datos_entrega?: Record<string, unknown> | null;
          datos_verificacion?: Record<string, unknown> | null;
          datos_reporte?: Record<string, unknown> | null;
        };

        const { error: updateError } = await tables
          .cortes()
          .update({
            fase_actual: payload.fase_actual,
            estado: 'EN_PROGRESO',
            datos_conteo: payload.datos_conteo,
            ...(Object.prototype.hasOwnProperty.call(payload, 'datos_entrega')
              ? { datos_entrega: payload.datos_entrega ?? null }
              : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'datos_verificacion')
              ? { datos_verificacion: payload.datos_verificacion ?? null }
              : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'datos_reporte')
              ? { datos_reporte: payload.datos_reporte ?? null }
              : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', op.corteId)
          .select()
          .single();

        if (updateError) {
          if (esErrorInmutabilidadTerminal(updateError.message)) {
            throw new Error(MENSAJE_CORTE_TERMINAL_INMUTABLE);
          }
          throw new Error(updateError.message);
        }
        return;
      }

      if (op.tipo === 'FINALIZAR_CORTE') {
        const payload = op.payload as {
          reporte_hash?: string;
          datos_reporte?: Record<string, unknown> | null;
          finalizado_at?: string;
          intento_id?: string | null;
        };

        if (!payload.reporte_hash || typeof payload.reporte_hash !== 'string') {
          throw new Error('Operacion FINALIZAR_CORTE invalida: reporte_hash faltante');
        }

        const finalizadoAt = payload.finalizado_at ?? new Date().toISOString();
        const { error: updateError } = await tables
          .cortes()
          .update({
            estado: 'FINALIZADO',
            reporte_hash: payload.reporte_hash,
            ...(Object.prototype.hasOwnProperty.call(payload, 'datos_reporte')
              ? { datos_reporte: payload.datos_reporte ?? null }
              : {}),
            finalizado_at: finalizadoAt,
            updated_at: finalizadoAt,
          })
          .eq('id', op.corteId)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (payload.intento_id) {
          const { error: intentoUpdateError } = await tables
            .corteIntentos()
            .update({
              estado: 'COMPLETADO',
              finalizado_at: finalizadoAt,
            })
            .eq('id', payload.intento_id);

          if (intentoUpdateError) {
            throw new Error(intentoUpdateError.message);
          }
        }
      }
    };

    const drenarCola = () => {
      procesarCola(ejecutor).catch(() => {
        // 🤖 [IA] - v1.3.0: Degradación elegante — fallo en cola no rompe UI
      });
    };

    // Intento inmediato al montar para sincronizar operaciones pendientes
    // aunque no haya un corte activo cargado en memoria.
    drenarCola();

    const cleanup = escucharConectividad(() => {
      drenarCola();
    });

    return cleanup;
  }, [procesarColaEnReconexion]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    estado,
    corte_actual: corteActual,
    intento_actual: intentoActual,
    iniciarCorte,
    guardarProgreso,
    finalizarCorte,
    abortarCorte,
    reiniciarIntento,
    recuperarSesion,
    cargando,
    error,
  };
}
