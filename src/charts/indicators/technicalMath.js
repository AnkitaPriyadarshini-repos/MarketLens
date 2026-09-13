/**
 * Financial Technical Analysis Math Engine
 * Calculates SMA, EMA, WMA, VWAP, Bollinger Bands, RSI, MACD, Stochastic Oscillator, ATR, and OBV
 */

export function calculateIndicators(data) {
  if (!data || data.length === 0) return [];

  const result = data.map(item => ({ ...item }));
  const n = result.length;

  // 1. SMA (Simple Moving Average 20 & 50)
  calculateSMA(result, 20, 'sma20');
  calculateSMA(result, 50, 'sma50');

  // 2. EMA (Exponential Moving Average 12 & 26)
  calculateEMA(result, 12, 'ema12');
  calculateEMA(result, 26, 'ema26');

  // 3. WMA (Weighted Moving Average 14)
  calculateWMA(result, 14, 'wma14');

  // 4. VWAP (Volume Weighted Average Price)
  calculateVWAP(result, 'vwap');

  // 5. Bollinger Bands (20-period, 2 stddev)
  calculateBollingerBands(result, 20, 2);

  // 6. RSI (Relative Strength Index 14)
  calculateRSI(result, 14, 'rsi');

  // 7. MACD (12, 26, 9)
  calculateMACD(result);

  // 8. Stochastic Oscillator (14, 3)
  calculateStochastic(result, 14, 3);

  // 9. ATR (Average True Range 14)
  calculateATR(result, 14);

  // 10. OBV (On-Balance Volume)
  calculateOBV(result);

  return result;
}

function calculateSMA(data, period, key) {
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      data[i][key] = null;
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close || data[j].price;
    }
    data[i][key] = parseFloat((sum / period).toFixed(2));
  }
}

function calculateEMA(data, period, key) {
  const k = 2 / (period + 1);
  let prevEMA = 0;

  for (let i = 0; i < data.length; i++) {
    const val = data[i].close || data[i].price;
    if (i === 0) {
      prevEMA = val;
      data[i][key] = parseFloat(val.toFixed(2));
    } else {
      prevEMA = val * k + prevEMA * (1 - k);
      data[i][key] = parseFloat(prevEMA.toFixed(2));
    }
  }
}

function calculateWMA(data, period, key) {
  const denominator = (period * (period + 1)) / 2;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      data[i][key] = null;
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const weight = j + 1;
      const index = i - period + 1 + j;
      sum += (data[index].close || data[index].price) * weight;
    }
    data[i][key] = parseFloat((sum / denominator).toFixed(2));
  }
}

function calculateVWAP(data, key) {
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < data.length; i++) {
    const high = data[i].high || data[i].price;
    const low = data[i].low || data[i].price;
    const close = data[i].close || data[i].price;
    const typicalPrice = (high + low + close) / 3;
    const vol = data[i].volume || 10000;

    cumulativeTPV += typicalPrice * vol;
    cumulativeVolume += vol;

    data[i][key] = parseFloat((cumulativeTPV / cumulativeVolume).toFixed(2));
  }
}

function calculateBollingerBands(data, period, stdDevMultiplier) {
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      data[i].bollingerUpper = null;
      data[i].bollingerMiddle = null;
      data[i].bollingerLower = null;
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close || data[j].price;
    }
    const mean = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const val = data[j].close || data[j].price;
      varianceSum += Math.pow(val - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    data[i].bollingerMiddle = parseFloat(mean.toFixed(2));
    data[i].bollingerUpper = parseFloat((mean + stdDev * stdDevMultiplier).toFixed(2));
    data[i].bollingerLower = parseFloat((mean - stdDev * stdDevMultiplier).toFixed(2));
  }
}

function calculateRSI(data, period = 14, key = 'rsi') {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period && i < data.length; i++) {
    const diff = (data[i].close || data[i].price) - (data[i - 1].close || data[i - 1].price);
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      data[i][key] = 50; // default initial midpoint
      continue;
    }

    const diff = (data[i].close || data[i].price) - (data[i - 1].close || data[i - 1].price);
    const currentGain = diff >= 0 ? diff : 0;
    const currentLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      data[i][key] = 100;
    } else {
      const rs = avgGain / avgLoss;
      data[i][key] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
    }
  }
}

function calculateMACD(data) {
  calculateEMA(data, 12, '_ema12');
  calculateEMA(data, 26, '_ema26');

  for (let i = 0; i < data.length; i++) {
    data[i].macdLine = parseFloat((data[i]._ema12 - data[i]._ema26).toFixed(2));
  }

  // Signal line = 9-period EMA of MACD Line
  const k = 2 / (9 + 1);
  let prevSignal = data[0].macdLine;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      data[i].macdSignal = data[i].macdLine;
    } else {
      prevSignal = data[i].macdLine * k + prevSignal * (1 - k);
      data[i].macdSignal = parseFloat(prevSignal.toFixed(2));
    }
    data[i].macdHist = parseFloat((data[i].macdLine - data[i].macdSignal).toFixed(2));
    delete data[i]._ema12;
    delete data[i]._ema26;
  }
}

function calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      data[i].stochK = 50;
      data[i].stochD = 50;
      continue;
    }

    let lowestLow = Infinity;
    let highestHigh = -Infinity;

    for (let j = i - kPeriod + 1; j <= i; j++) {
      const low = data[j].low || data[j].price;
      const high = data[j].high || data[j].price;
      if (low < lowestLow) lowestLow = low;
      if (high > highestHigh) highestHigh = high;
    }

    const currentClose = data[i].close || data[i].price;
    const kVal = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    data[i].stochK = parseFloat(kVal.toFixed(2));
  }

  // Calculate %D as SMA of %K
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod + dPeriod - 2) {
      data[i].stochD = data[i].stochK;
      continue;
    }
    let sumK = 0;
    for (let j = i - dPeriod + 1; j <= i; j++) {
      sumK += data[j].stochK;
    }
    data[i].stochD = parseFloat((sumK / dPeriod).toFixed(2));
  }
}

function calculateATR(data, period = 14) {
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      data[i].atr = (data[i].high || data[i].price) - (data[i].low || data[i].price);
      continue;
    }

    const high = data[i].high || data[i].price;
    const low = data[i].low || data[i].price;
    const prevClose = data[i - 1].close || data[i - 1].price;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    if (i < period) {
      data[i].atr = parseFloat(tr.toFixed(2));
    } else {
      data[i].atr = parseFloat(((data[i - 1].atr * (period - 1) + tr) / period).toFixed(2));
    }
  }
}

function calculateOBV(data) {
  let currentOBV = 0;
  for (let i = 0; i < data.length; i++) {
    const vol = data[i].volume || 10000;
    if (i === 0) {
      data[i].obv = currentOBV;
    } else {
      const close = data[i].close || data[i].price;
      const prevClose = data[i - 1].close || data[i - 1].price;

      if (close > prevClose) {
        currentOBV += vol;
      } else if (close < prevClose) {
        currentOBV -= vol;
      }
      data[i].obv = currentOBV;
    }
  }
}
