// 🤖 [IA] - Delivery calculation: optimal distribution algorithm
import { CashCount, DENOMINATIONS } from '@/types/cash';
import { DeliveryCalculation } from '@/types/phases';

/**
 * Calculate optimal distribution for delivery to management
 * Target: Keep exactly $50 in register, deliver the rest
 */
export const calculateDeliveryDistribution = (totalCash: number, cashCount: CashCount): DeliveryCalculation => {
  const TARGET_KEEP = 50.00;
  const amountToDeliver = Math.max(0, totalCash - TARGET_KEEP);
  
  if (amountToDeliver <= 0) {
    // No delivery needed, keep everything
    return {
      amountToDeliver: 0,
      denominationsToDeliver: createEmptyCashCount(),
      denominationsToKeep: { ...cashCount },
      deliverySteps: [],
      verificationSteps: createVerificationSteps(cashCount)
    };
  }

  // Calculate optimal delivery using largest denominations first
  const result = calculateOptimalDelivery(cashCount, amountToDeliver);
  
  return {
    amountToDeliver,
    denominationsToDeliver: result.toDeliver,
    denominationsToKeep: result.toKeep,
    deliverySteps: createDeliverySteps(result.toDeliver),
    verificationSteps: createVerificationSteps(result.toKeep)
  };
};

/**
 * Calculate optimal delivery strategy using greedy algorithm with largest denominations first
 */
const calculateOptimalDelivery = (
  availableCash: CashCount, 
  targetAmount: number
): { toDeliver: CashCount; toKeep: CashCount } => {
  const targetCents = Math.round(targetAmount * 100);
  let remainingCents = targetCents;
  
  const toDeliver: CashCount = createEmptyCashCount();
  const toKeep: CashCount = { ...availableCash };
  
  // Order denominations by value (descending) for greedy algorithm
  const denomOrder: Array<{key: keyof CashCount, valueCents: number}> = [
    { key: 'bill100', valueCents: 10000 },
    { key: 'bill50', valueCents: 5000 },
    { key: 'bill20', valueCents: 2000 },
    { key: 'bill10', valueCents: 1000 },
    { key: 'bill5', valueCents: 500 },
    { key: 'bill1', valueCents: 100 },
    { key: 'dollarCoin', valueCents: 100 },
    { key: 'quarter', valueCents: 25 },
    { key: 'dime', valueCents: 10 },
    { key: 'nickel', valueCents: 5 },
    { key: 'penny', valueCents: 1 }
  ];

  // Greedy algorithm: take largest denominations first
  for (const denom of denomOrder) {
    if (remainingCents <= 0) break;
    
    const available = toKeep[denom.key];
    const needed = Math.min(
      Math.floor(remainingCents / denom.valueCents),
      available
    );
    
    if (needed > 0) {
      toDeliver[denom.key] = needed;
      toKeep[denom.key] = available - needed;
      remainingCents -= needed * denom.valueCents;
    }
  }

  // If we couldn't make exact change, try alternative approach
  if (remainingCents > 0) {
    return calculateAlternativeDelivery(availableCash, targetAmount);
  }

  return { toDeliver, toKeep };
};

/**
 * Alternative delivery calculation when greedy fails
 */
const calculateAlternativeDelivery = (
  availableCash: CashCount, 
  targetAmount: number
): { toDeliver: CashCount; toKeep: CashCount } => {
  // For now, deliver all larger denominations and keep smaller ones
  const toDeliver: CashCount = createEmptyCashCount();
  const toKeep: CashCount = { ...availableCash };
  
  let deliveredAmount = 0;
  
  // Try to get as close as possible by taking largest bills first
  const largeSteps = [
    { key: 'bill100' as keyof CashCount, value: 100 },
    { key: 'bill50' as keyof CashCount, value: 50 },
    { key: 'bill20' as keyof CashCount, value: 20 },
    { key: 'bill10' as keyof CashCount, value: 10 },
    { key: 'bill5' as keyof CashCount, value: 5 }
  ];
  
  for (const step of largeSteps) {
    const available = toKeep[step.key];
    const canTake = Math.floor((targetAmount - deliveredAmount) / step.value);
    const willTake = Math.min(available, canTake);
    
    if (willTake > 0) {
      toDeliver[step.key] = willTake;
      toKeep[step.key] = available - willTake;
      deliveredAmount += willTake * step.value;
    }
  }
  
  return { toDeliver, toKeep };
};

/**
 * Create empty cash count object
 */
const createEmptyCashCount = (): CashCount => ({
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
});

/**
 * Create delivery steps from cash count (only non-zero amounts)
 */
const createDeliverySteps = (cashCount: CashCount) => {
  const steps: Array<{
    key: keyof CashCount;
    quantity: number;
    label: string;
    value: number;
  }> = [];

  // Order for delivery steps (coins first, then bills)
  const allDenoms = [
    ...Object.entries(DENOMINATIONS.COINS),
    ...Object.entries(DENOMINATIONS.BILLS)
  ];

  allDenoms.forEach(([key, denom]) => {
    const quantity = cashCount[key as keyof CashCount];
    if (quantity > 0) {
      steps.push({
        key: key as keyof CashCount,
        quantity,
        label: denom.name,
        value: denom.value
      });
    }
  });

  return steps;
};

/**
 * Create verification steps from cash count (only non-zero amounts)
 */
const createVerificationSteps = (cashCount: CashCount) => {
  return createDeliverySteps(cashCount); // Same structure
};

/**
 * Calculate total value of cash count
 */
export const calculateCashValue = (cashCount: CashCount): number => {
  let total = 0;
  
  Object.entries(DENOMINATIONS.COINS).forEach(([key, denom]) => {
    total += cashCount[key as keyof CashCount] * denom.value;
  });
  
  Object.entries(DENOMINATIONS.BILLS).forEach(([key, denom]) => {
    total += cashCount[key as keyof CashCount] * denom.value;
  });
  
  return Math.round(total * 100) / 100;
};
