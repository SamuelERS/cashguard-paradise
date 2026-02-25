export const queryKeys = {
  supervisor: {
    today: () => ['supervisor', 'today'] as const,
    detail: (corteId: string) => ['supervisor', 'detail', corteId] as const,
    history: (fingerprint = 'all') => ['supervisor', 'history', fingerprint] as const,
  },
} as const;
