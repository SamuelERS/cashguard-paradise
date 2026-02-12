// 🤖 [IA] - v1.0.0: Stub de CorteOrquestador — placeholder para Order #009
// Este componente sera implementado completamente en la orden correspondiente.
import type { Sucursal } from '@/types/auditoria';

export interface CorteOrquestadorProps {
  sucursales: Sucursal[];
  sucursalId: string;
  onSalir?: () => void;
}

export const CorteOrquestador: React.FC<CorteOrquestadorProps> = ({
  sucursalId,
  onSalir,
}) => {
  return (
    <div data-testid="corte-orquestador" data-sucursal-id={sucursalId}>
      <p>Corte en progreso para sucursal: {sucursalId}</p>
      {onSalir && (
        <button onClick={onSalir} type="button">
          Salir
        </button>
      )}
    </div>
  );
};
