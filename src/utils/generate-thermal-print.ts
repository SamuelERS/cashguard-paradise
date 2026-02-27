// 🤖 [IA] - v3.6.0: Utilidad de impresión térmica 80mm para reportes CashGuard
// Sanitiza emojis Unicode → texto ASCII + genera HTML optimizado para impresoras térmicas
// Papel: 80mm ancho, ~72mm imprimible, ~48 chars/línea monospace a 9px

/**
 * Mapa de emojis Unicode → reemplazos ASCII para impresoras térmicas.
 * Las impresoras térmicas NO soportan Unicode emoji — solo ASCII básico.
 */
const EMOJI_REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  // Separador WhatsApp (caracteres Unicode box-drawing)
  [/━+/g, (match: string) => '-'.repeat(match.length)],

  // Status / Checks
  [/✅/g, '[OK]'],
  [/❌/g, '[X]'],
  [/⚠️/g, '[!]'],
  [/🔴/g, '[!!]'],
  [/🚨/g, '[!!!]'],
  [/☐/g, '[ ]'],
  [/✓/g, '[v]'],
  [/✗/g, '[x]'],

  // Categorías / Secciones
  [/📊/g, ''],
  [/💰/g, '$'],
  [/💳/g, ''],
  [/📦/g, ''],
  [/🏢/g, ''],
  [/💼/g, ''],
  [/🎯/g, ''],
  [/📈/g, '^'],
  [/📉/g, 'v'],
  [/🔍/g, ''],
  [/💸/g, ''],
  [/📅/g, ''],
  [/🔐/g, ''],
  [/🔒/g, ''],
  [/📹/g, 'Video:'],
  [/ℹ️/g, '[i]'],

  // Expense categories
  [/⚙️/g, ''],
  [/🧹/g, ''],
  [/🚗/g, ''],
  [/🔧/g, ''],
  [/📋/g, ''],
  [/📂/g, ''],
  [/💵/g, '$'],

  // WhatsApp bold markers (*texto*) → plain text
  [/\*([^*]+)\*/g, '$1'],

  // Cleanup: remove any remaining emojis (Unicode ranges for emoji)
  // Covers: Emoticons, Symbols, Transport, Misc Symbols, Dingbats, Supplemental, etc.
  [/[\u{1F600}-\u{1F64F}]/gu, ''],
  [/[\u{1F300}-\u{1F5FF}]/gu, ''],
  [/[\u{1F680}-\u{1F6FF}]/gu, ''],
  [/[\u{1F1E0}-\u{1F1FF}]/gu, ''],
  [/[\u{2600}-\u{26FF}]/gu, ''],
  [/[\u{2700}-\u{27BF}]/gu, ''],
  [/[\u{FE00}-\u{FE0F}]/gu, ''],  // Variation selectors
  [/[\u{200D}]/gu, ''],            // Zero-width joiner

  // Cleanup: collapse multiple spaces into single space
  [/ {2,}/g, ' '],
  // Cleanup: trim leading spaces on each line
  [/^ +/gm, ''],
] as unknown as ReadonlyArray<[RegExp, string]>;

/**
 * Sanitiza texto de reporte WhatsApp para impresión térmica.
 * Reemplaza emojis Unicode por equivalentes ASCII legibles.
 * Remueve marcadores de negrita WhatsApp (*texto*).
 *
 * @param text - Texto crudo del reporte WhatsApp (con emojis)
 * @returns Texto sanitizado solo con caracteres ASCII imprimibles + acentos español
 */
export function sanitizeForThermal(text: string): string {
  if (!text) return '';

  let result = text;

  for (const [pattern, replacement] of EMOJI_REPLACEMENTS) {
    if (typeof replacement === 'string') {
      result = result.replace(pattern, replacement);
    } else {
      // Function replacement (for dynamic-length separators)
      result = result.replace(pattern, replacement as (match: string) => string);
    }
  }

  // Final trim of each line
  result = result.split('\n').map(line => line.trimEnd()).join('\n');

  return result;
}

/**
 * Escapa caracteres HTML peligrosos para prevenir XSS.
 */
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Genera documento HTML optimizado para impresión en papel térmico 80mm.
 *
 * Características:
 * - @page size: 80mm auto (rollo continuo)
 * - Fuente monospace 9px (~48 caracteres por línea)
 * - Emojis sanitizados a texto ASCII
 * - Auto-impresión al cargar (window.print())
 * - Charset UTF-8 para acentos español
 * - Escapa HTML del contenido para prevenir XSS
 *
 * @param report - Texto crudo del reporte (con emojis WhatsApp)
 * @param storeName - Nombre de sucursal para título (opcional)
 * @returns String HTML completo listo para escribir en ventana
 */
export function generateThermalHTML(report: string, storeName?: string): string {
  const sanitized = sanitizeForThermal(report);
  const escaped = escapeHTML(sanitized);
  const title = storeName ? `Corte de Caja - ${escapeHTML(storeName)}` : 'Corte de Caja';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 2mm;
    }
    body {
      font-family: 'Courier New', 'Lucida Console', monospace;
      font-size: 9px;
      line-height: 1.3;
      margin: 0;
      padding: 4mm;
      width: 72mm;
      max-width: 72mm;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      font-size: inherit;
      margin: 0;
    }
    .no-print {
      text-align: center;
      color: #555;
      background-color: #f8f8f8;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-family: sans-serif;
      font-size: 14px;
    }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</head>
<body>
  <div class="no-print">
    Imprimiendo automaticamente...<br>
    <small>Cierre esta ventana cuando termine la impresion</small>
  </div>
  <pre>${escaped}</pre>
</body>
</html>`;
}
