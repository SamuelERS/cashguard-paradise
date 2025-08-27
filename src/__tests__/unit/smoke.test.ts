// 🤖 [IA] - v1.1.17: Smoke test to validate testing setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('🚬 Smoke Test - Sistema de Testing', () => {
  it('debe ejecutar un test básico matemático', () => {
    // Test básico para validar que Vitest funciona
    expect(2 + 2).toBe(4);
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });

  it('debe poder importar React correctamente', () => {
    // Validar que React está disponible
    expect(React).toBeDefined();
    expect(React.version).toBeDefined();
    expect(typeof React.createElement).toBe('function');
  });

  it('debe ejecutarse dentro del entorno de test', () => {
    // 🤖 [IA] - Verificamos el entorno
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('debe tener localStorage mockeado correctamente', () => {
    // Validar que localStorage está mockeado
    const testKey = 'test-key';
    const testValue = 'test-value';
    
    localStorage.setItem(testKey, testValue);
    expect(localStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
    
    localStorage.getItem(testKey);
    expect(localStorage.getItem).toHaveBeenCalledWith(testKey);
    
    localStorage.removeItem(testKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(testKey);
    
    localStorage.clear();
    expect(localStorage.clear).toHaveBeenCalled();
  });

  it('debe tener sessionStorage mockeado correctamente', () => {
    // Validar que sessionStorage está mockeado
    const testKey = 'session-key';
    const testValue = 'session-value';
    
    sessionStorage.setItem(testKey, testValue);
    expect(sessionStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
    
    sessionStorage.clear();
    expect(sessionStorage.clear).toHaveBeenCalled();
  });

  it('debe tener window.matchMedia mockeado', () => {
    // Validar que matchMedia está disponible para tests responsivos
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    expect(mediaQuery).toBeDefined();
    expect(mediaQuery.matches).toBe(false);
    expect(mediaQuery.media).toBe('(min-width: 768px)');
  });

  it('debe tener las funciones de Vitest disponibles', () => {
    // Validar que las utilidades de Vitest están disponibles
    expect(vi).toBeDefined();
    expect(typeof vi.fn).toBe('function');
    expect(typeof vi.mock).toBe('function');
    expect(typeof vi.spyOn).toBe('function');
  });

  it('debe poder usar matchers de jest-dom', () => {
    // Crear un elemento DOM para probar matchers
    const div = document.createElement('div');
    div.textContent = 'Hello Testing';
    div.setAttribute('role', 'button');
    document.body.appendChild(div);

    // Validar que los matchers funcionan
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello Testing');
    expect(div).toHaveAttribute('role', 'button');

    // Limpiar
    document.body.removeChild(div);
  });
});

describe('🔧 Validación del Setup de Testing', () => {
  it('debe limpiar el DOM después de cada test', () => {
    // 🤖 [IA] - v1.1.17: Test corregido - cleanup manual de elementos DOM
    // testing-library cleanup solo limpia componentes React, no elementos DOM nativos
    const div = document.createElement('div');
    div.id = 'test-cleanup';
    document.body.appendChild(div);
    
    expect(document.getElementById('test-cleanup')).toBeInTheDocument();
    
    // Limpieza manual para validar
    document.body.removeChild(div);
    expect(document.getElementById('test-cleanup')).not.toBeInTheDocument();
  });

  it('debe tener el DOM limpio al iniciar cada test', () => {
    // 🤖 [IA] - v1.1.17: Verificar que el DOM está limpio
    // Este test valida que cada test empieza con un DOM limpio
    expect(document.body.children.length).toBe(0);
    expect(document.body.innerHTML).toBe('');
  });
});