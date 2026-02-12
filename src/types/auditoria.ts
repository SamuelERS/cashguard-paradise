// 🤖 [IA] - v1.0.0: Tipos del sistema de auditoria de corte de caja
// Source of truth para Sucursal y tipos relacionados del flujo de auditoria

/**
 * Representa una sucursal del negocio.
 */
export interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  activa: boolean;
}
