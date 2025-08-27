// 🤖 [IA] - v1.1.17: Tests para cálculos de distribución Fase 2 - SECTOR 2
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateDeliveryDistribution,
  calculateCashValue
} from '@/utils/deliveryCalculation';
import { CashCount } from '@/types/cash';

describe('💰 calculateDeliveryDistribution - Distribución Fase 2 [CRÍTICO]', () => {
  
  let fullCashCount: CashCount;
  let emptyCashCount: CashCount;

  beforeEach(() => {
    // Setup típico con todas las denominaciones
    fullCashCount = {
      penny: 87,
      nickel: 23,
      dime: 45,
      quarter: 67,
      dollarCoin: 2,
      bill1: 34,
      bill5: 12,
      bill10: 8,
      bill20: 15,
      bill50: 2,
      bill100: 3
    };

    emptyCashCount = {
      penny: 0,
      nickel: 0,
      dime: 0,
      quarter: 0,
      dollarCoin: 0,
      bill1: 0,
      bill5: 0,
      bill10: 0,
      bill20: 0,
      bill50: 0,
      bill100: 0
    };
  });

  it('debe distribuir correctamente cuando total > $50', () => {
    const totalCash = 850.75; // Mucho más que $50
    const result = calculateDeliveryDistribution(totalCash, fullCashCount);
    
    expect(result.amountToDeliver).toBe(800.75);
    expect(result.denominationsToDeliver).toBeDefined();
    expect(result.denominationsToKeep).toBeDefined();
    
    // Verificar que deliver + keep = original
    const deliverTotal = calculateCashValue(result.denominationsToDeliver);
    const keepTotal = calculateCashValue(result.denominationsToKeep);
    const originalTotal = calculateCashValue(fullCashCount);
    
    expect(Math.round((deliverTotal + keepTotal) * 100) / 100).toBe(originalTotal);
  });

  it('debe retornar no delivery cuando total = $50', () => {
    const exactFifty: CashCount = {
      ...emptyCashCount,
      bill20: 2,
      bill10: 1
    };
    
    const result = calculateDeliveryDistribution(50.00, exactFifty);
    
    expect(result.amountToDeliver).toBe(0);
    expect(result.denominationsToDeliver).toEqual(emptyCashCount);
    expect(result.denominationsToKeep).toEqual(exactFifty);
  });

  it('debe mantener todo cuando total < $50', () => {
    const lessThanFifty: CashCount = {
      ...emptyCashCount,
      bill20: 1,
      bill10: 2,
      bill5: 1
    };
    
    const result = calculateDeliveryDistribution(45.00, lessThanFifty);
    
    expect(result.amountToDeliver).toBe(0);
    expect(result.denominationsToDeliver).toEqual(emptyCashCount);
    expect(result.denominationsToKeep).toEqual(lessThanFifty);
  });

  it('debe usar greedy algorithm correctamente', () => {
    // Con billetes grandes disponibles, debe usarlos primero
    const withBigBills: CashCount = {
      ...emptyCashCount,
      bill100: 5, // $500
      bill20: 5,  // $100
      bill1: 100  // $100
    };
    
    const result = calculateDeliveryDistribution(700, withBigBills);
    
    // Debe entregar $650, preferiblemente con billetes grandes
    expect(result.amountToDeliver).toBe(650);
    expect(result.denominationsToDeliver.bill100).toBeGreaterThan(0);
    
    // Verificar que mantiene exactamente $50
    const keepTotal = calculateCashValue(result.denominationsToKeep);
    expect(keepTotal).toBe(50);
  });

  it('debe usar alternative algorithm cuando greedy falla', () => {
    // Caso donde el greedy podría no dar exactamente $50 de cambio
    const trickyCase: CashCount = {
      ...emptyCashCount,
      bill100: 1,  // $100
      bill20: 1,   // $20
      bill10: 1,   // $10
      bill1: 3     // $3
    };
    // Total: $133
    
    const result = calculateDeliveryDistribution(133, trickyCase);
    
    expect(result.amountToDeliver).toBe(83);
    
    // Verificar que la suma es correcta
    const deliverTotal = calculateCashValue(result.denominationsToDeliver);
    const keepTotal = calculateCashValue(result.denominationsToKeep);
    
    expect(Math.round((deliverTotal + keepTotal) * 100) / 100).toBe(133);
  });

  it('debe generar delivery steps correctamente', () => {
    const result = calculateDeliveryDistribution(150, fullCashCount);
    
    expect(result.deliverySteps).toBeDefined();
    expect(Array.isArray(result.deliverySteps)).toBe(true);
    
    // Cada step debe tener la estructura correcta
    result.deliverySteps.forEach(step => {
      expect(step).toHaveProperty('key');
      expect(step).toHaveProperty('quantity');
      expect(step).toHaveProperty('label');
      expect(step).toHaveProperty('value');
      expect(step.quantity).toBeGreaterThan(0);
    });
  });

  it('debe generar verification steps correctamente', () => {
    const result = calculateDeliveryDistribution(150, fullCashCount);
    
    expect(result.verificationSteps).toBeDefined();
    expect(Array.isArray(result.verificationSteps)).toBe(true);
    
    // Cada step debe tener la estructura correcta
    result.verificationSteps.forEach(step => {
      expect(step).toHaveProperty('key');
      expect(step).toHaveProperty('quantity');
      expect(step).toHaveProperty('label');
      expect(step).toHaveProperty('value');
      expect(step.quantity).toBeGreaterThan(0);
    });
  });

  it('debe manejar empty cash count correctamente', () => {
    const result = calculateDeliveryDistribution(0, emptyCashCount);
    
    expect(result.amountToDeliver).toBe(0);
    expect(result.denominationsToDeliver).toEqual(emptyCashCount);
    expect(result.denominationsToKeep).toEqual(emptyCashCount);
    expect(result.deliverySteps).toEqual([]);
    expect(result.verificationSteps).toEqual([]);
  });

  it('debe manejar cantidades extremas ($10,000+)', () => {
    const extremeCase: CashCount = {
      ...emptyCashCount,
      bill100: 150 // $15,000
    };
    
    const result = calculateDeliveryDistribution(15000, extremeCase);
    
    expect(result.amountToDeliver).toBe(14950);
    expect(result.denominationsToDeliver.bill100).toBe(149);
    expect(result.denominationsToKeep.bill100).toBe(1); // Mantiene $50 de alguna forma
  });

  it('debe mantener precisión en centavos', () => {
    const withCents: CashCount = {
      ...emptyCashCount,
      bill20: 3,    // $60
      quarter: 3,   // $0.75
      dime: 2,      // $0.20
      nickel: 1,    // $0.05
      penny: 3      // $0.03
    };
    // Total: $61.03
    
    const result = calculateDeliveryDistribution(61.03, withCents);
    
    expect(result.amountToDeliver).toBeCloseTo(11.03, 2);
    
    // Verificar precisión
    const deliverTotal = calculateCashValue(result.denominationsToDeliver);
    const keepTotal = calculateCashValue(result.denominationsToKeep);
    
    expect(deliverTotal + keepTotal).toBeCloseTo(61.03, 2);
  });

  it('debe ordenar denominaciones correctamente en steps', () => {
    const result = calculateDeliveryDistribution(100, fullCashCount);
    
    // Los steps deben tener denominaciones ordenadas
    const deliveryKeys = result.deliverySteps.map(s => s.key);
    
    // Verificar que las monedas vienen antes que los billetes
    const firstCoinIndex = deliveryKeys.findIndex(k => 
      ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'].includes(k)
    );
    const firstBillIndex = deliveryKeys.findIndex(k => 
      k.startsWith('bill')
    );
    
    if (firstCoinIndex !== -1 && firstBillIndex !== -1) {
      expect(firstCoinIndex).toBeLessThan(firstBillIndex);
    }
  });

  it('debe manejar solo billetes grandes disponibles', () => {
    const bigBillsOnly: CashCount = {
      ...emptyCashCount,
      bill100: 3,
      bill50: 2
    };
    // Total: $400
    
    const result = calculateDeliveryDistribution(400, bigBillsOnly);
    
    expect(result.amountToDeliver).toBe(350);
    // Debe guardar exactamente un bill50 para hacer $50
    expect(result.denominationsToKeep.bill50).toBe(1);
    expect(calculateCashValue(result.denominationsToKeep)).toBe(50);
  });

  it('debe manejar solo monedas disponibles', () => {
    const coinsOnly: CashCount = {
      ...emptyCashCount,
      penny: 2000,   // $20
      nickel: 600,   // $30
      dime: 200,     // $20
      quarter: 120,  // $30
      dollarCoin: 5  // $5
    };
    // Total: $105
    
    const result = calculateDeliveryDistribution(105, coinsOnly);
    
    expect(result.amountToDeliver).toBe(55);
    expect(calculateCashValue(result.denominationsToKeep)).toBe(50);
  });

  it('debe validar que deliver + keep = original', () => {
    const testCases = [
      { total: 75.50, cashCount: fullCashCount },
      { total: 150.00, cashCount: fullCashCount },
      { total: 999.99, cashCount: fullCashCount }
    ];
    
    testCases.forEach(({ total, cashCount }) => {
      const result = calculateDeliveryDistribution(total, cashCount);
      
      const deliverTotal = calculateCashValue(result.denominationsToDeliver);
      const keepTotal = calculateCashValue(result.denominationsToKeep);
      const originalTotal = calculateCashValue(cashCount);
      
      expect(deliverTotal + keepTotal).toBeCloseTo(originalTotal, 2);
    });
  });

  it('no debe modificar objetos originales', () => {
    const originalCash = { ...fullCashCount };
    const originalTotal = 150.00;
    
    calculateDeliveryDistribution(originalTotal, fullCashCount);
    
    expect(fullCashCount).toEqual(originalCash);
  });

  it('debe manejar caso $50.01 (entrega 1 centavo)', () => {
    const fiftyOneCase: CashCount = {
      ...emptyCashCount,
      bill20: 2,
      bill10: 1,
      penny: 1
    };
    
    const result = calculateDeliveryDistribution(50.01, fiftyOneCase);
    
    expect(result.amountToDeliver).toBeCloseTo(0.01, 2);
    expect(result.denominationsToDeliver.penny).toBe(1);
    expect(calculateCashValue(result.denominationsToKeep)).toBe(50.00);
  });

  it('debe manejar caso $150 exacto', () => {
    const hundredFifty: CashCount = {
      ...emptyCashCount,
      bill100: 1,
      bill50: 1
    };
    
    const result = calculateDeliveryDistribution(150, hundredFifty);
    
    expect(result.amountToDeliver).toBe(100);
    expect(result.denominationsToDeliver.bill100).toBe(1);
    expect(result.denominationsToKeep.bill50).toBe(1);
  });

  it('debe preferir distribución óptima sobre no óptima', () => {
    // Con múltiples opciones, debe elegir la más eficiente
    const multiOption: CashCount = {
      ...emptyCashCount,
      bill100: 1,  // Podría entregar esto
      bill50: 1,   // O guardar esto
      bill20: 5,   // O una combinación
      bill10: 5,
      bill5: 10,
      bill1: 50
    };
    
    const result = calculateDeliveryDistribution(400, multiOption);
    
    expect(result.amountToDeliver).toBe(350);
    // Debe preferir entregar billetes grandes
    expect(result.denominationsToDeliver.bill100).toBeGreaterThanOrEqual(1);
  });

  it('debe generar steps solo con denominaciones no-cero', () => {
    const sparse: CashCount = {
      ...emptyCashCount,
      bill100: 1,
      bill20: 2
    };
    
    const result = calculateDeliveryDistribution(140, sparse);
    
    // Solo debe haber steps para las denominaciones que realmente se usan
    result.deliverySteps.forEach(step => {
      expect(step.quantity).toBeGreaterThan(0);
    });
    
    result.verificationSteps.forEach(step => {
      expect(step.quantity).toBeGreaterThan(0);
    });
  });

  it('debe tener labels correctos en español', () => {
    const result = calculateDeliveryDistribution(100, fullCashCount);
    
    result.deliverySteps.forEach(step => {
      // Verificar que los labels están en español
      if (step.key === 'penny') {
        expect(step.label).toContain('centavo');
      }
      if (step.key === 'quarter') {
        expect(step.label).toContain('centavos');
      }
      if (step.key === 'dollarCoin') {
        expect(step.label).toContain('moneda');
      }
    });
  });

  it('debe tener values correctos en steps', () => {
    const result = calculateDeliveryDistribution(100, fullCashCount);
    
    result.deliverySteps.forEach(step => {
      // Verificar que los valores coinciden con las denominaciones
      if (step.key === 'penny') expect(step.value).toBe(0.01);
      if (step.key === 'nickel') expect(step.value).toBe(0.05);
      if (step.key === 'dime') expect(step.value).toBe(0.10);
      if (step.key === 'quarter') expect(step.value).toBe(0.25);
      if (step.key === 'dollarCoin') expect(step.value).toBe(1.00);
      if (step.key === 'bill1') expect(step.value).toBe(1);
      if (step.key === 'bill5') expect(step.value).toBe(5);
      if (step.key === 'bill10') expect(step.value).toBe(10);
      if (step.key === 'bill20') expect(step.value).toBe(20);
      if (step.key === 'bill50') expect(step.value).toBe(50);
      if (step.key === 'bill100') expect(step.value).toBe(100);
    });
  });

  it('performance: debe calcular múltiples distribuciones rápidamente', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      calculateDeliveryDistribution(100 + i, fullCashCount);
    }
    
    const endTime = performance.now();
    
    // 100 cálculos en menos de 200ms (ajustado para Docker)
    expect(endTime - startTime).toBeLessThan(200);
  });

  it('debe funcionar con datos reales de Paradise', () => {
    // Caso típico de corte nocturno en Paradise
    const paradiseCase: CashCount = {
      penny: 87,
      nickel: 23,
      dime: 45,
      quarter: 67,
      dollarCoin: 2,
      bill1: 34,
      bill5: 12,
      bill10: 8,
      bill20: 15,
      bill50: 2,
      bill100: 3
    };
    
    const total = calculateCashValue(paradiseCase);
    const result = calculateDeliveryDistribution(total, paradiseCase);
    
    // Debe dejar exactamente $50 para el siguiente día
    const keepTotal = calculateCashValue(result.denominationsToKeep);
    expect(keepTotal).toBe(50.00);
    
    // La suma debe ser exacta
    const deliverTotal = calculateCashValue(result.denominationsToDeliver);
    expect(deliverTotal + keepTotal).toBeCloseTo(total, 2);
  });

  it('debe manejar edge cases combinados', () => {
    // Combinación de edge cases
    const edgeCase: CashCount = {
      penny: 999,     // Máximo de pennies
      nickel: 0,       // Sin nickels
      dime: 1,         // Un solo dime
      quarter: 200,    // Muchos quarters
      dollarCoin: 50,  // Muchas monedas de dólar
      bill1: 1,        // Un solo bill de $1
      bill5: 0,        // Sin $5
      bill10: 0,       // Sin $10
      bill20: 0,       // Sin $20
      bill50: 0,       // Sin $50
      bill100: 1       // Un solo $100
    };
    
    const total = calculateCashValue(edgeCase);
    const result = calculateDeliveryDistribution(total, edgeCase);
    
    // Debe manejar la complejidad correctamente
    expect(result.amountToDeliver).toBeGreaterThanOrEqual(0);
    const keepTotal = calculateCashValue(result.denominationsToKeep);
    
    // Si el total es mayor a $50, debe guardar $50
    if (total > 50) {
      expect(keepTotal).toBe(50.00);
    } else {
      expect(keepTotal).toBe(total);
    }
  });
});

describe('💵 calculateCashValue - Cálculo de valor total [MEDIA]', () => {
  
  it('debe calcular el valor total correctamente', () => {
    const cashCount: CashCount = {
      penny: 100,    // $1.00
      nickel: 20,    // $1.00
      dime: 10,      // $1.00
      quarter: 4,    // $1.00
      dollarCoin: 1, // $1.00
      bill1: 5,      // $5.00
      bill5: 2,      // $10.00
      bill10: 1,     // $10.00
      bill20: 1,     // $20.00
      bill50: 0,     // $0
      bill100: 0     // $0
    };
    
    expect(calculateCashValue(cashCount)).toBe(50.00);
  });

  it('debe ser equivalente a calculateCashTotal de calculations.ts', () => {
    const testCase: CashCount = {
      penny: 87,
      nickel: 23,
      dime: 45,
      quarter: 67,
      dollarCoin: 2,
      bill1: 34,
      bill5: 12,
      bill10: 8,
      bill20: 15,
      bill50: 2,
      bill100: 3
    };
    
    const result = calculateCashValue(testCase);
    
    // Calculamos manualmente para verificar
    const manual = 
      0.87 +     // pennies
      1.15 +     // nickels
      4.50 +     // dimes
      16.75 +    // quarters
      2.00 +     // dollar coins
      34.00 +    // $1 bills
      60.00 +    // $5 bills
      80.00 +    // $10 bills
      300.00 +   // $20 bills
      100.00 +   // $50 bills
      300.00;    // $100 bills
    
    expect(result).toBeCloseTo(manual, 2);
  });

  it('debe manejar caso vacío', () => {
    const empty: CashCount = {
      penny: 0,
      nickel: 0,
      dime: 0,
      quarter: 0,
      dollarCoin: 0,
      bill1: 0,
      bill5: 0,
      bill10: 0,
      bill20: 0,
      bill50: 0,
      bill100: 0
    };
    
    expect(calculateCashValue(empty)).toBe(0);
  });

  it('debe mantener precisión con centavos', () => {
    const cents: CashCount = {
      penny: 3,
      nickel: 1,
      dime: 1,
      quarter: 1,
      dollarCoin: 0,
      bill1: 0,
      bill5: 0,
      bill10: 0,
      bill20: 0,
      bill50: 0,
      bill100: 0
    };
    // Total: $0.03 + $0.05 + $0.10 + $0.25 = $0.43
    
    expect(calculateCashValue(cents)).toBe(0.43);
  });
});