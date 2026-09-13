/**
 * AxisEngine Utility - Adaptive Tick Generation & Financial Formatting
 * Computes human-friendly round ticks and magnitude-aware price/volume formatting
 */

export function generateNiceTicks(min: number, max: number, maxTicks = 6): number[] {
  if (isNaN(min) || isNaN(max) || min === max) {
    return [min || 0];
  }

  const range = max - min;
  const rawStep = range / Math.max(1, maxTicks - 1);
  const exponent = Math.floor(Math.log10(rawStep));
  const fraction = rawStep / Math.pow(10, exponent);

  let niceFraction = 1;
  if (fraction <= 1.5) niceFraction = 1;
  else if (fraction <= 3) niceFraction = 2;
  else if (fraction <= 7) niceFraction = 5;
  else niceFraction = 10;

  const step = niceFraction * Math.pow(10, exponent);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let val = niceMin; val <= niceMax + step * 0.5; val += step) {
    if (val >= min - step * 0.1 && val <= max + step * 0.1) {
      ticks.push(Number(val.toFixed(6)));
    }
  }

  return ticks.length ? ticks : [min, max];
}

export function formatAdaptivePrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) return '$0.00';

  const absPrice = Math.abs(price);
  if (absPrice >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (absPrice >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (absPrice >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
}

export function formatCompactVolume(volume: number | null | undefined): string {
  if (!volume || isNaN(volume) || volume <= 0) return '0';

  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(2)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  } else {
    return `${Math.round(volume)}`;
  }
}
