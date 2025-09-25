import { CashCount, DENOMINATIONS } from "@/types/cash";

/**
 * Calculate total cash value from quantities
 */
export const calculateCashTotal = (cashCount: Partial<CashCount>): number => {
  let total = 0;
  
  // Calculate coins
  Object.entries(DENOMINATIONS.COINS).forEach(([key, denom]) => {
    const quantity = cashCount[key as keyof CashCount] || 0;
    total += quantity * denom.value;
  });
  
  // Calculate bills
  Object.entries(DENOMINATIONS.BILLS).forEach(([key, denom]) => {
    const quantity = cashCount[key as keyof CashCount] || 0;
    total += quantity * denom.value;
  });
  
  return Math.round(total * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate optimal change for $50 using greedy + backtracking algorithm
 * Works in cents to avoid floating point errors
 */
export const calculateChange50 = (cashCount: CashCount): { 
  change: Partial<CashCount>; 
  total: number; 
  possible: boolean; 
} => {
  const TARGET_CENTS = 5000; // $50.00 in cents
  
  // Convert denominations to cents and sort by value (descending)
  const denominations = [
    { key: 'bill100', value: 10000, qty: cashCount.bill100 },
    { key: 'bill50', value: 5000, qty: cashCount.bill50 },
    { key: 'bill20', value: 2000, qty: cashCount.bill20 },
    { key: 'bill10', value: 1000, qty: cashCount.bill10 },
    { key: 'bill5', value: 500, qty: cashCount.bill5 },
    { key: 'bill1', value: 100, qty: cashCount.bill1 },
    { key: 'dollarCoin', value: 100, qty: cashCount.dollarCoin },
    { key: 'quarter', value: 25, qty: cashCount.quarter },
    { key: 'dime', value: 10, qty: cashCount.dime },
    { key: 'nickel', value: 5, qty: cashCount.nickel },
    { key: 'penny', value: 1, qty: cashCount.penny },
  ];

  // First check if we have enough total cash
  const totalCents = denominations.reduce((sum, denom) => sum + (denom.value * denom.qty), 0);
  if (totalCents < TARGET_CENTS) {
    return { change: {}, total: 0, possible: false };
  }

  // Greedy algorithm with backtracking
  const result: Partial<CashCount> = {};
  let remainingCents = TARGET_CENTS;
  const usedDenominations = [...denominations];

  for (let i = 0; i < usedDenominations.length && remainingCents > 0; i++) {
    const denom = usedDenominations[i];
    if (denom.value <= remainingCents && denom.qty > 0) {
      const useQuantity = Math.min(Math.floor(remainingCents / denom.value), denom.qty);
      if (useQuantity > 0) {
        result[denom.key as keyof CashCount] = useQuantity;
        remainingCents -= useQuantity * denom.value;
        denom.qty -= useQuantity;
      }
    }
  }

  // If exact change not possible with greedy, try alternative combinations
  if (remainingCents > 0) {
    // Try using smaller denominations first for better customer change
    const smallFirstResult = calculateChangeSmallFirst(cashCount, TARGET_CENTS);
    if (smallFirstResult.possible) {
      return smallFirstResult;
    }
    
    return { change: {}, total: 0, possible: false };
  }

  const totalValue = TARGET_CENTS / 100;
  return { change: result, total: totalValue, possible: true };
};

/**
 * Alternative algorithm: prioritize smaller denominations for better customer service
 */
const calculateChangeSmallFirst = (cashCount: CashCount, targetCents: number): {
  change: Partial<CashCount>;
  total: number;
  possible: boolean;
} => {
  // Sort by value (ascending) to prioritize smaller denominations
  const denominations = [
    { key: 'penny', value: 1, qty: cashCount.penny },
    { key: 'nickel', value: 5, qty: cashCount.nickel },
    { key: 'dime', value: 10, qty: cashCount.dime },
    { key: 'quarter', value: 25, qty: cashCount.quarter },
    { key: 'dollarCoin', value: 100, qty: cashCount.dollarCoin },
    { key: 'bill1', value: 100, qty: cashCount.bill1 },
    { key: 'bill5', value: 500, qty: cashCount.bill5 },
    { key: 'bill10', value: 1000, qty: cashCount.bill10 },
    { key: 'bill20', value: 2000, qty: cashCount.bill20 },
    { key: 'bill50', value: 5000, qty: cashCount.bill50 },
    { key: 'bill100', value: 10000, qty: cashCount.bill100 },
  ];

  // Dynamic programming approach for exact change
  const result: Partial<CashCount> = {};
  let remainingCents = targetCents;

  // Use smaller denominations up to reasonable limits
  const limits = {
    penny: Math.min(50, cashCount.penny), // Max 50 pennies
    nickel: Math.min(20, cashCount.nickel), // Max 20 nickels
    dime: Math.min(10, cashCount.dime), // Max 10 dimes
    quarter: Math.min(8, cashCount.quarter), // Max 8 quarters
    dollarCoin: Math.min(10, cashCount.dollarCoin), // Max 10 dollar coins
  };

  // Fill with small denominations first
  for (const denom of denominations.slice(0, 5)) { // Small denominations only
    const maxUse = limits[denom.key as keyof typeof limits] || denom.qty;
    const useQuantity = Math.min(Math.floor(remainingCents / denom.value), maxUse);
    if (useQuantity > 0) {
      result[denom.key as keyof CashCount] = useQuantity;
      remainingCents -= useQuantity * denom.value;
    }
  }

  // Fill remainder with larger denominations
  for (const denom of denominations.slice(5)) { // Larger denominations
    if (remainingCents <= 0) break;
    const useQuantity = Math.min(Math.floor(remainingCents / denom.value), denom.qty);
    if (useQuantity > 0) {
      result[denom.key as keyof CashCount] = useQuantity;
      remainingCents -= useQuantity * denom.value;
    }
  }

  const possible = remainingCents === 0;
  const totalValue = possible ? targetCents / 100 : 0;
  
  return { change: result, total: totalValue, possible };
};

/**
 * Format currency value to display format
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Check if cash count has sufficient funds for change
 */
export const hasSufficientCash = (cashCount: CashCount, requiredAmount: number): boolean => {
  const totalCash = calculateCashTotal(cashCount);
  return totalCash >= requiredAmount;
};

/**
 * Generate summary of denominations for display
 */
export const generateDenominationSummary = (cashCount: Partial<CashCount>): string => {
  const lines: string[] = [];
  
  // Coins
  Object.entries(DENOMINATIONS.COINS).forEach(([key, denom]) => {
    const qty = cashCount[key as keyof CashCount] || 0;
    if (qty > 0) {
      const total = qty * denom.value;
      lines.push(`  • ${denom.name} × ${qty} = ${formatCurrency(total)}`);
    }
  });
  
  // Bills
  Object.entries(DENOMINATIONS.BILLS).forEach(([key, denom]) => {
    const qty = cashCount[key as keyof CashCount] || 0;
    if (qty > 0) {
      const total = qty * denom.value;
      lines.push(`  • ${denom.name} × ${qty} = ${formatCurrency(total)}`);
    }
  });
  
  return lines.join('\n');
};