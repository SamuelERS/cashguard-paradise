/**
 * Genera hash SHA-256 hex (64 chars) a partir de un payload JSON
 * serializado de forma canónica (orden de claves estable).
 */

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));

    return entries.reduce<Record<string, unknown>>((acc, [key, nested]) => {
      acc[key] = canonicalize(nested);
      return acc;
    }, {});
  }

  return value;
}

function toCanonicalJson(payload: unknown): string {
  return JSON.stringify(canonicalize(payload));
}

export async function generarReporteHash(payload: unknown): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API no disponible para generar hash de reporte');
  }

  const canonicalJson = toCanonicalJson(payload);
  const data = new TextEncoder().encode(canonicalJson);
  const hashBuffer = await subtle.digest('SHA-256', data);

  return Array
    .from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
