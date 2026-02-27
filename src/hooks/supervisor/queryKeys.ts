export const queryKeys = {
  supervisor: {
    today: () => ['supervisor', 'today'] as const,
    detail: (corteId: string) => ['supervisor', 'detail', corteId] as const,
    history: (fingerprint = 'all') => ['supervisor', 'history', fingerprint] as const,
    // 🤖 [IA] - v4.1.0: Clave para pantalla analytics/KPI (tab Resumen)
    analytics: (fp = 'all') => ['supervisor', 'analytics', fp] as const,
  },
} as const;
