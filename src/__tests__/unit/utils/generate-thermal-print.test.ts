// 🤖 [IA] - TDD RED: Tests para utilidad de impresión térmica 80mm
/**
 * @file generate-thermal-print.test.ts
 * @description Tests unitarios para funciones de impresión térmica
 *
 * @remarks
 * Suite cubriendo:
 * - Escenario 1: sanitizeForThermal (7 tests)
 * - Escenario 2: generateThermalHTML estructura (5 tests)
 * - Escenario 3: generateThermalHTML estilos térmicos (4 tests)
 * - Escenario 4: Edge cases y seguridad (4 tests)
 *
 * TDD RED phase: Todos los tests DEBEN fallar inicialmente
 * (módulo generate-thermal-print.ts aún no existe)
 */

import { describe, test, expect } from 'vitest';
import {
  sanitizeForThermal,
  generateThermalHTML,
} from '@/utils/generate-thermal-print';

// ============================================================
// ESCENARIO 1: sanitizeForThermal - Reemplazo emojis por texto
// ============================================================
describe('generate-thermal-print - ESCENARIO 1: sanitizeForThermal', () => {

  test('1.1 - reemplaza emojis de reporte por equivalentes ASCII', () => {
    const input = '📊 *CORTE DE CAJA*';
    const result = sanitizeForThermal(input);
    // No debe contener el emoji original
    expect(result).not.toContain('📊');
    // Debe contener texto legible
    expect(result).toContain('CORTE DE CAJA');
  });

  test('1.2 - reemplaza múltiples emojis en una misma línea', () => {
    const input = '💰 Efectivo: $100.00 | 💳 Electrónico: $50.00';
    const result = sanitizeForThermal(input);
    expect(result).not.toContain('💰');
    expect(result).not.toContain('💳');
    // Los valores monetarios deben preservarse
    expect(result).toContain('$100.00');
    expect(result).toContain('$50.00');
  });

  test('1.3 - reemplaza separador WhatsApp por guiones ASCII', () => {
    const input = '━━━━━━━━━━━━';
    const result = sanitizeForThermal(input);
    expect(result).not.toContain('━');
    // Debe ser algún tipo de separador ASCII (guiones, iguales, etc.)
    expect(result.length).toBeGreaterThan(0);
    // Debe contener solo caracteres ASCII imprimibles
    expect(result).toMatch(/^[\x20-\x7E]+$/);
  });

  test('1.4 - preserva texto plano sin emojis', () => {
    const input = 'Sucursal: Los Heroes\nCajero: Juan Perez';
    const result = sanitizeForThermal(input);
    expect(result).toBe(input);
  });

  test('1.5 - reemplaza emojis de check/status', () => {
    const input = '✅ Perfectas: 6/10\n⚠️ Corregidas: 2/10\n🔴 Críticas: 2/10';
    const result = sanitizeForThermal(input);
    expect(result).not.toContain('✅');
    expect(result).not.toContain('⚠️');
    expect(result).not.toContain('🔴');
    // Los datos numéricos deben preservarse
    expect(result).toContain('6/10');
    expect(result).toContain('2/10');
  });

  test('1.6 - reemplaza emoji de negritas WhatsApp (*texto*)', () => {
    const input = '*RESUMEN EJECUTIVO*';
    const result = sanitizeForThermal(input);
    // Los asteriscos de negrita WhatsApp deben removerse para impresión
    expect(result).not.toContain('*');
    expect(result).toContain('RESUMEN EJECUTIVO');
  });

  test('1.7 - maneja string vacío sin errores', () => {
    const result = sanitizeForThermal('');
    expect(result).toBe('');
  });
});

// ============================================================
// ESCENARIO 2: generateThermalHTML - Estructura del documento
// ============================================================
describe('generate-thermal-print - ESCENARIO 2: generateThermalHTML estructura', () => {

  const SAMPLE_REPORT = '✅ *REPORTE NORMAL*\n\nSucursal: Test\nTotal: $100.00';

  test('2.1 - genera documento HTML válido', () => {
    const html = generateThermalHTML(SAMPLE_REPORT, 'Test Store');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
  });

  test('2.2 - incluye título con nombre de sucursal', () => {
    const html = generateThermalHTML(SAMPLE_REPORT, 'Los Heroes');
    expect(html).toContain('<title>');
    expect(html).toContain('Los Heroes');
  });

  test('2.3 - contiene el reporte sanitizado (sin emojis)', () => {
    const html = generateThermalHTML(SAMPLE_REPORT, 'Test');
    // El HTML NO debe contener emojis crudos
    expect(html).not.toContain('✅');
    // Pero sí el contenido textual
    expect(html).toContain('REPORTE NORMAL');
    expect(html).toContain('$100.00');
  });

  test('2.4 - incluye script de auto-impresión', () => {
    const html = generateThermalHTML(SAMPLE_REPORT);
    expect(html).toContain('window.print()');
  });

  test('2.5 - funciona sin storeName (parámetro opcional)', () => {
    const html = generateThermalHTML(SAMPLE_REPORT);
    expect(html).toContain('<html');
    expect(html).toContain('REPORTE NORMAL');
  });
});

// ============================================================
// ESCENARIO 3: generateThermalHTML - Estilos para térmica 80mm
// ============================================================
describe('generate-thermal-print - ESCENARIO 3: generateThermalHTML estilos térmicos', () => {

  const SAMPLE_REPORT = 'REPORTE NORMAL\nTotal: $100.00';

  test('3.1 - incluye @page con ancho 80mm para papel térmico', () => {
    const html = generateThermalHTML(SAMPLE_REPORT);
    expect(html).toContain('@page');
    expect(html).toContain('80mm');
  });

  test('3.2 - usa fuente monospace para alineación de columnas', () => {
    const html = generateThermalHTML(SAMPLE_REPORT);
    // Debe usar alguna fuente monospace
    expect(html).toMatch(/font-family.*monospace/i);
  });

  test('3.3 - usa tamaño de fuente pequeño para térmica (~9px)', () => {
    const html = generateThermalHTML(SAMPLE_REPORT);
    // El tamaño debe ser pequeño para caber en 80mm (~48 chars/line at 9px)
    expect(html).toMatch(/font-size:\s*(8|9|10)px/);
  });

  test('3.4 - oculta elementos no-print en media print', () => {
    const html = generateThermalHTML(SAMPLE_REPORT);
    expect(html).toContain('@media print');
    expect(html).toContain('no-print');
  });
});

// ============================================================
// ESCENARIO 4: Edge cases y seguridad
// ============================================================
describe('generate-thermal-print - ESCENARIO 4: Edge cases y seguridad', () => {

  test('4.1 - escapa HTML en el contenido del reporte', () => {
    const maliciousReport = '<script>alert("xss")</script>';
    const html = generateThermalHTML(maliciousReport);
    // No debe contener script inyectado sin escapar
    expect(html).not.toContain('<script>alert("xss")</script>');
  });

  test('4.2 - maneja reporte con caracteres especiales en español', () => {
    const spanishReport = 'Sucursal: Héroe Ñandú\nMonto: $1,500.00\nNúmero: #123';
    const html = generateThermalHTML(spanishReport);
    expect(html).toContain('Héroe');
    expect(html).toContain('Ñandú');
    expect(html).toContain('$1,500.00');
  });

  test('4.3 - maneja reporte largo sin truncar', () => {
    const longReport = Array(100).fill('Línea de reporte con datos: $123.45').join('\n');
    const html = generateThermalHTML(longReport);
    // Debe contener todas las 100 líneas
    const occurrences = (html.match(/\$123\.45/g) || []).length;
    expect(occurrences).toBe(100);
  });

  test('4.4 - incluye charset UTF-8 para caracteres especiales', () => {
    const html = generateThermalHTML('Test');
    expect(html).toMatch(/charset.*utf-8/i);
  });
});
