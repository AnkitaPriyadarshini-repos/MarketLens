// Financial & Data Formatting Utilities for Cute Stocks Pro

export function formatCurrency(amount, currency = 'USD', decimals = 2) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  
  if (Math.abs(amount) >= 1e12) {
    return `$${(amount / 1e12).toFixed(2)}T`;
  }
  if (Math.abs(amount) >= 1e9) {
    return `$${(amount / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1e6) {
    return `$${(amount / 1e6).toFixed(2)}M`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

export function formatPercent(percent, includeSign = true) {
  if (percent === undefined || percent === null || isNaN(percent)) return '0.00%';
  const num = parseFloat(percent);
  const sign = includeSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

export function getChangeColorClass(change) {
  if (change > 0) return 'text-gain';
  if (change < 0) return 'text-loss';
  return 'text-neutral';
}
