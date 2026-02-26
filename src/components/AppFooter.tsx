interface AppFooterProps {
  className?: string;
  containerClassName?: string;
}

export function AppFooter({ className = '', containerClassName = 'max-w-6xl px-4' }: AppFooterProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Compromiso Operativo"
      className={`w-full border-t border-white/10 bg-[rgba(10,10,10,0.92)] backdrop-blur-md ${className}`}
    >
      <div className={`mx-auto py-2.5 ${containerClassName}`}>
        <div
          data-testid="footer-top"
          className="flex items-center gap-2"
        >
          <span className="h-px flex-1 bg-white/[0.07]" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45 whitespace-nowrap">
            Compromiso Operativo
          </p>
          <span className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <p
          data-testid="footer-middle"
          className="mt-2 text-[12px] leading-relaxed text-white/60 text-center"
        >
          Este sistema resguarda tu trabajo diario con trazabilidad, orden y transparencia en cada corte. Gracias por operar con precisión y cuidar los recursos de Paradise en cada turno.
        </p>

        <div
          data-testid="footer-bottom"
          className="mt-2 border-t border-white/[0.08] pt-2 flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between sm:gap-3"
        >
          <span className="text-[11px] text-white/40 whitespace-nowrap">Equipo de Acuarios Paradise</span>
          <span className="hidden sm:inline text-white/20 text-[11px]">·</span>
          <span className="text-[11px] font-semibold tracking-[0.04em] text-white/75 whitespace-nowrap text-center sm:text-right">
            🕊️ JesucristoEsDios ♥️
          </span>
        </div>
      </div>
    </footer>
  );
}
