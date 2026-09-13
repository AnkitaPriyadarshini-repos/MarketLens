// Comprehensive Market Data for MarketLens

export const MARKET_ASSETS = [
  // US Tech Giants & Stocks
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Stocks',
    sector: 'Technology',
    subSector: 'Semiconductors',
    price: 128.45,
    change: 4.82,
    changePercent: 3.90,
    volume: '54.2M',
    marketCap: '3.16T',
    peRatio: 72.4,
    eps: 1.77,
    dividendYield: '0.03%',
    high52w: 140.76,
    low52w: 39.23,
    rsi: 68.4,
    description: 'NVIDIA Corporation designs graphics processing units (GPUs) for gaming and professional markets, as well as system on a chip units for mobile computing and automotive applications. It dominates the artificial intelligence hardware landscape.',
    sentiment: 'Strong Bullish',
    aiScore: 94,
    bearPriceTarget: 105.00,
    bullPriceTarget: 165.00
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Stocks',
    sector: 'Technology',
    subSector: 'Consumer Electronics',
    price: 224.20,
    change: -1.15,
    changePercent: -0.51,
    volume: '42.8M',
    marketCap: '3.43T',
    peRatio: 34.2,
    eps: 6.56,
    dividendYield: '0.45%',
    high52w: 237.23,
    low52w: 164.08,
    rsi: 54.2,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services, including Apple Intelligence integration.',
    sentiment: 'Bullish',
    aiScore: 88,
    bearPriceTarget: 195.00,
    bullPriceTarget: 260.00
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'Stocks',
    sector: 'Technology',
    subSector: 'Software - Infrastructure',
    price: 448.90,
    change: 2.30,
    changePercent: 0.52,
    volume: '19.4M',
    marketCap: '3.34T',
    peRatio: 38.1,
    eps: 11.80,
    dividendYield: '0.67%',
    high52w: 468.35,
    low52w: 309.45,
    rsi: 58.1,
    description: 'Microsoft develops and supports software, services, devices and solutions including Azure Cloud, Copilot AI integrations, Windows, Office 365, and LinkedIn.',
    sentiment: 'Bullish',
    aiScore: 91,
    bearPriceTarget: 410.00,
    bullPriceTarget: 510.00
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'Stocks',
    sector: 'Consumer Cyclical',
    subSector: 'Auto Manufacturers',
    price: 248.50,
    change: 12.40,
    changePercent: 5.25,
    volume: '98.5M',
    marketCap: '789.2B',
    peRatio: 64.8,
    eps: 3.83,
    dividendYield: 'N/A',
    high52w: 271.00,
    low52w: 138.80,
    rsi: 71.2,
    description: 'Tesla designs, develops, manufactures, sells, and leases electric vehicles, energy storage systems, solar panels, and offers Full Self-Driving (FSD) and Robotaxi autonomous tech.',
    sentiment: 'Neutral / Volatile',
    aiScore: 79,
    bearPriceTarget: 170.00,
    bullPriceTarget: 310.00
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    category: 'Stocks',
    sector: 'Consumer Cyclical',
    subSector: 'Internet Retail',
    price: 186.30,
    change: 1.85,
    changePercent: 1.00,
    volume: '31.2M',
    marketCap: '1.94T',
    peRatio: 41.5,
    eps: 4.49,
    dividendYield: 'N/A',
    high52w: 201.20,
    low52w: 118.35,
    rsi: 52.8,
    description: 'Amazon focuses on e-commerce, cloud computing (AWS), online advertising, digital streaming, and artificial intelligence.',
    sentiment: 'Bullish',
    aiScore: 89,
    bearPriceTarget: 160.00,
    bullPriceTarget: 225.00
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'Stocks',
    sector: 'Communication Services',
    subSector: 'Internet Content & Information',
    price: 179.80,
    change: -0.90,
    changePercent: -0.50,
    volume: '24.1M',
    marketCap: '2.21T',
    peRatio: 26.4,
    eps: 6.81,
    dividendYield: '0.44%',
    high52w: 191.75,
    low52w: 120.21,
    rsi: 48.9,
    description: 'Alphabet offers Google Search, YouTube, Android, Google Cloud, Gemini AI, Waymo autonomous driving, and hardware products.',
    sentiment: 'Bullish',
    aiScore: 87,
    bearPriceTarget: 155.00,
    bullPriceTarget: 215.00
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    category: 'Stocks',
    sector: 'Communication Services',
    subSector: 'Internet Content & Information',
    price: 512.40,
    change: 8.60,
    changePercent: 1.71,
    volume: '14.8M',
    marketCap: '1.30T',
    peRatio: 28.2,
    eps: 18.17,
    dividendYield: '0.39%',
    high52w: 542.81,
    low52w: 279.40,
    rsi: 62.3,
    description: 'Meta Platforms builds technologies that help people connect, find communities, and grow businesses across Facebook, Instagram, WhatsApp, and Llama open AI models.',
    sentiment: 'Strong Bullish',
    aiScore: 92,
    bearPriceTarget: 450.00,
    bullPriceTarget: 600.00
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    category: 'Stocks',
    sector: 'Technology',
    subSector: 'Semiconductors',
    price: 156.10,
    change: 3.40,
    changePercent: 2.23,
    volume: '45.1M',
    marketCap: '252.4B',
    peRatio: 112.5,
    eps: 1.39,
    dividendYield: 'N/A',
    high52w: 227.30,
    low52w: 93.12,
    rsi: 59.7,
    description: 'AMD operates as a semiconductor company offering x86 microprocessors, GPUs, data center accelerators (MI300 series), and chipsets.',
    sentiment: 'Bullish',
    aiScore: 84,
    bearPriceTarget: 130.00,
    bullPriceTarget: 195.00
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    category: 'Stocks',
    sector: 'Financial',
    subSector: 'Diversified Banking',
    price: 214.60,
    change: -1.40,
    changePercent: -0.65,
    volume: '8.3M',
    marketCap: '612.8B',
    peRatio: 12.4,
    eps: 17.30,
    dividendYield: '2.14%',
    high52w: 218.40,
    low52w: 135.20,
    rsi: 53.1,
    description: 'JPMorgan Chase is a global financial services firm providing investment banking, asset management, treasury services, and commercial banking.',
    sentiment: 'Neutral',
    aiScore: 81,
    bearPriceTarget: 190.00,
    bullPriceTarget: 240.00
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    category: 'Stocks',
    sector: 'Energy',
    subSector: 'Oil & Gas Integrated',
    price: 118.90,
    change: 2.10,
    changePercent: 1.80,
    volume: '15.6M',
    marketCap: '472.1B',
    peRatio: 14.1,
    eps: 8.43,
    dividendYield: '3.20%',
    high52w: 123.75,
    low52w: 95.77,
    rsi: 61.0,
    description: 'Exxon Mobil explores for and produces crude oil and natural gas in the United States, Guyana, Permian Basin, and internationally.',
    sentiment: 'Bullish',
    aiScore: 78,
    bearPriceTarget: 102.00,
    bullPriceTarget: 135.00
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies Inc.',
    category: 'Stocks',
    sector: 'Technology',
    subSector: 'Software - Infrastructure',
    price: 32.40,
    change: 1.85,
    changePercent: 6.06,
    volume: '67.4M',
    marketCap: '72.1B',
    peRatio: 98.2,
    eps: 0.33,
    dividendYield: 'N/A',
    high52w: 33.60,
    low52w: 13.68,
    rsi: 74.5,
    description: 'Palantir builds software platforms (Gotham, Foundry, AIP) for defence agencies, government intelligence, and enterprise commercial analytics.',
    sentiment: 'Strong Bullish',
    aiScore: 90,
    bearPriceTarget: 24.00,
    bullPriceTarget: 42.00
  },

  // Crypto Assets
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'Crypto',
    sector: 'Layer 1 Blockchain',
    subSector: 'Store of Value',
    price: 64250.00,
    change: 1840.00,
    changePercent: 2.95,
    volume: '28.4B',
    marketCap: '1.26T',
    peRatio: 'N/A',
    eps: 'N/A',
    dividendYield: 'N/A',
    high52w: 73750.00,
    low52w: 24900.00,
    rsi: 64.2,
    description: 'Bitcoin is the world’s first decentralized cryptocurrency, powered by a Proof-of-Work blockchain network and hard-capped 21 million total supply limit.',
    sentiment: 'Strong Bullish',
    aiScore: 95,
    bearPriceTarget: 52000.00,
    bullPriceTarget: 88000.00
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'Crypto',
    sector: 'Layer 1 Blockchain',
    subSector: 'Smart Contracts',
    price: 3480.50,
    change: 85.20,
    changePercent: 2.51,
    volume: '14.2B',
    marketCap: '418.5B',
    peRatio: 'N/A',
    eps: 'N/A',
    dividendYield: '3.1% Staking',
    high52w: 4090.00,
    low52w: 1520.00,
    rsi: 58.7,
    description: 'Ethereum is a decentralized, open-source blockchain featuring smart contract functionality, powering DeFi, NFTs, and Layer 2 rollup scaling solutions.',
    sentiment: 'Bullish',
    aiScore: 90,
    bearPriceTarget: 2800.00,
    bullPriceTarget: 4800.00
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    category: 'Crypto',
    sector: 'Layer 1 Blockchain',
    subSector: 'High Throughput L1',
    price: 154.80,
    change: 9.40,
    changePercent: 6.46,
    volume: '4.8B',
    marketCap: '72.3B',
    peRatio: 'N/A',
    eps: 'N/A',
    dividendYield: '6.8% Staking',
    high52w: 209.80,
    low52w: 17.40,
    rsi: 69.1,
    description: 'Solana is a high-performance blockchain supporting builders around the globe to scale crypto apps featuring sub-second finality and ultra-low fees.',
    sentiment: 'Strong Bullish',
    aiScore: 92,
    bearPriceTarget: 110.00,
    bullPriceTarget: 240.00
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    category: 'Crypto',
    sector: 'Layer 1 Blockchain',
    subSector: 'Exchange Ecosystem',
    price: 575.20,
    change: 4.80,
    changePercent: 0.84,
    volume: '1.1B',
    marketCap: '84.1B',
    peRatio: 'N/A',
    eps: 'N/A',
    dividendYield: 'N/A',
    high52w: 720.60,
    low52w: 204.10,
    rsi: 51.4,
    description: 'BNB powers the BNB Chain ecosystem, offering utility token benefits across Binance exchange, launchpools, and decentralized Web3 applications.',
    sentiment: 'Neutral',
    aiScore: 82,
    bearPriceTarget: 480.00,
    bullPriceTarget: 750.00
  },

  // Major Indices & Macro
  {
    symbol: '^GSPC',
    name: 'S&P 500 Index',
    category: 'Indices',
    sector: 'Index',
    subSector: 'US Equities Benchmark',
    price: 5540.25,
    change: 28.50,
    changePercent: 0.52,
    volume: '3.8B',
    marketCap: 'N/A',
    peRatio: 26.8,
    eps: 'N/A',
    dividendYield: '1.32%',
    high52w: 5669.67,
    low52w: 4103.78,
    rsi: 61.2,
    description: 'The Standard and Poor’s 500 is a stock market index tracking the stock performance of 500 leading companies listed on stock exchanges in the United States.',
    sentiment: 'Bullish',
    aiScore: 86,
    bearPriceTarget: 5100.00,
    bullPriceTarget: 5900.00
  },
  {
    symbol: '^IXIC',
    name: 'NASDAQ Composite',
    category: 'Indices',
    sector: 'Index',
    subSector: 'US Tech Benchmark',
    price: 17680.10,
    change: 142.30,
    changePercent: 0.81,
    volume: '5.1B',
    marketCap: 'N/A',
    peRatio: 31.4,
    eps: 'N/A',
    dividendYield: '0.85%',
    high52w: 18671.07,
    low52w: 12543.86,
    rsi: 63.8,
    description: 'The Nasdaq Composite is a stock market index that includes almost all stocks listed on the Nasdaq stock exchange, weighted heavily toward technology.',
    sentiment: 'Bullish',
    aiScore: 89,
    bearPriceTarget: 16000.00,
    bullPriceTarget: 19500.00
  },

  // Commodities & Forex
  {
    symbol: 'GOLD',
    name: 'Gold Spot / USD',
    category: 'Commodities',
    sector: 'Precious Metals',
    subSector: 'Safe Haven',
    price: 2485.40,
    change: 18.20,
    changePercent: 0.74,
    volume: '185K',
    marketCap: '16.2T',
    peRatio: 'N/A',
    eps: 'N/A',
    dividendYield: 'N/A',
    high52w: 2531.60,
    low52w: 1810.50,
    rsi: 66.5,
    description: 'Gold is traditionally viewed as a primary inflation hedge, store of value, and central bank reserve asset during geopolitical uncertainty.',
    sentiment: 'Strong Bullish',
    aiScore: 91,
    bearPriceTarget: 2300.00,
    bullPriceTarget: 2750.00
  },
  {
    symbol: 'OIL',
    name: 'WTI Crude Oil',
    category: 'Commodities',
    sector: 'Energy',
    subSector: 'Petroleum',
    price: 76.40,
    change: -1.20,
    changePercent: -1.55,
    volume: '340K',
    marketCap: 'N/A',
    peRatio: 'N/A',
    eps: 'N/A',
    dividendYield: 'N/A',
    high52w: 95.03,
    low52w: 67.70,
    rsi: 44.2,
    description: 'West Texas Intermediate (WTI) crude oil serves as one of the main global benchmark prices for global energy consumption.',
    sentiment: 'Neutral',
    aiScore: 72,
    bearPriceTarget: 65.00,
    bullPriceTarget: 88.00
  }
];

// Historical Chart Data Generator
export function generateChartData(assetSymbol, timeframe = '1M') {
  const baseAsset = MARKET_ASSETS.find(a => a.symbol === assetSymbol) || MARKET_ASSETS[0];
  const currentPrice = baseAsset.price;
  
  let pointsCount = 30;
  let volatility = 0.015;
  let dateStepDays = 1;

  if (timeframe === '1D') {
    pointsCount = 48; // 5-minute ticks over 4 hours or trading day
    volatility = 0.004;
  } else if (timeframe === '1W') {
    pointsCount = 35; // hourly ticks
    volatility = 0.008;
  } else if (timeframe === '1M') {
    pointsCount = 30;
    volatility = 0.018;
  } else if (timeframe === '6M') {
    pointsCount = 60;
    volatility = 0.035;
  } else if (timeframe === '1Y') {
    pointsCount = 52; // weekly bars
    volatility = 0.05;
  } else if (timeframe === 'ALL') {
    pointsCount = 80;
    volatility = 0.08;
  }

  const data = [];
  let price = currentPrice * (1 - volatility * (pointsCount / 4));
  const now = new Date();

  for (let i = pointsCount - 1; i >= 0; i--) {
    const timeLabel = new Date(now.getTime() - i * (24 * 60 * 60 * 1000 * (timeframe === '1D' ? 0.02 : timeframe === '1W' ? 0.2 : 1)));
    
    const randomWalk = (Math.random() - 0.47) * volatility * price;
    price = Math.max(1, price + randomWalk);
    
    // Final point matches current price exact
    if (i === 0) price = currentPrice;

    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, price) * (1 + Math.random() * 0.008);
    const low = Math.min(open, price) * (1 - Math.random() * 0.008);
    const close = price;
    const volume = Math.floor(Math.random() * 1000000 + 500000);

    data.push({
      date: timeframe === '1D' ? timeLabel.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : timeLabel.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      price: parseFloat(close.toFixed(2)),
      volume: volume,
      // Technical indicators
      sma20: parseFloat((close * (1 + Math.sin(i / 5) * 0.02)).toFixed(2)),
      sma50: parseFloat((close * (1 - Math.cos(i / 8) * 0.03)).toFixed(2)),
      bollingerUpper: parseFloat((close * 1.04).toFixed(2)),
      bollingerLower: parseFloat((close * 0.96).toFixed(2)),
      rsi: Math.floor(40 + Math.sin(i) * 30 + Math.random() * 10)
    });
  }

  return data;
}

// Financial News Feed
export const MOCK_NEWS = [
  {
    id: 1,
    title: 'NVIDIA Unveils Next-Gen AI Chip Architecture at GTC Tech Summit',
    source: 'Financial Times',
    time: '20 mins ago',
    category: 'Technology',
    sentiment: 'Bullish',
    impactScore: 92,
    summary: 'NVIDIA announced its updated Blackwell Ultra GPU suite, projecting a 3.5x increase in AI model training efficiency and triggering upgrade cycles among hyperscalers.',
    tickers: ['NVDA', 'MSFT', 'AMD', 'GOOGL']
  },
  {
    id: 2,
    title: 'Federal Reserve Signals Potential 25bps Rate Cut Following Moderate CPI Inflation Data',
    source: 'Bloomberg News',
    time: '1 hour ago',
    category: 'Macroeconomy',
    sentiment: 'Bullish',
    impactScore: 88,
    summary: 'Federal Reserve officials noted persistent cooling in core PCE inflation figures, paving the way for dovish monetary policy shifts in the upcoming FOMC meeting.',
    tickers: ['^GSPC', '^IXIC', 'GOLD']
  },
  {
    id: 3,
    title: 'Bitcoin Surges Past $64,000 as Institutional Spot ETF Inflows Reach Record $850M Daily',
    source: 'CoinDesk',
    time: '2 hours ago',
    category: 'Crypto',
    sentiment: 'Strong Bullish',
    impactScore: 94,
    summary: 'Accelerated spot Bitcoin ETF accumulation from BlackRock and Fidelity pushed BTC liquid supply on exchanges to 5-year lows.',
    tickers: ['BTC', 'ETH', 'SOL']
  },
  {
    id: 4,
    title: 'Tesla Robotaxi Event Preview: Wall Street Weighs FSD Unsupervised Regulatory Approval',
    source: 'Wall Street Journal',
    time: '3 hours ago',
    category: 'Stocks',
    sentiment: 'Neutral',
    impactScore: 81,
    summary: 'Analysts present divergent valuation estimates ahead of Tesla Cybercab demonstration, highlighting hardware costs vs software high-margin licensing potential.',
    tickers: ['TSLA']
  },
  {
    id: 5,
    title: 'Global Energy Sector Rallies as Crude Supplies Tighten in Middle East Shipping Hubs',
    source: 'Reuters',
    time: '4 hours ago',
    category: 'Commodities',
    sentiment: 'Bullish',
    impactScore: 76,
    summary: 'Exxon Mobil and Chevron led energy index gains following inventory drawdowns reported by the EIA.',
    tickers: ['OIL', 'XOM']
  }
];

// Economic Calendar Events
export const MOCK_CALENDAR = [
  {
    id: 'c1',
    date: 'Today, 14:00 EST',
    event: 'US Fed Interest Rate Decision (FOMC)',
    country: '🇺🇸 US',
    importance: 'High',
    forecast: '5.25%',
    previous: '5.50%',
    actual: '5.25%',
    impact: 'Dovish'
  },
  {
    id: 'c2',
    date: 'Tomorrow, 08:30 EST',
    event: 'Core CPI Inflation (YoY)',
    country: '🇺🇸 US',
    importance: 'High',
    forecast: '3.1%',
    previous: '3.2%',
    actual: 'Pending',
    impact: 'High Volatility'
  },
  {
    id: 'c3',
    date: 'Sep 18, Post-Market',
    event: 'NVIDIA Q3 Earnings Conference Call',
    country: '🇺🇸 US',
    importance: 'High',
    forecast: '$0.65 EPS',
    previous: '$0.52 EPS',
    actual: 'Pending',
    impact: 'Tech Catalyst'
  },
  {
    id: 'c4',
    date: 'Sep 20, 10:00 EST',
    event: 'ECB Monetary Policy Meeting & Draghi Speech',
    country: '🇪🇺 EU',
    importance: 'Medium',
    forecast: '3.50%',
    previous: '3.75%',
    actual: 'Pending',
    impact: 'Forex'
  }
];

// Sample Pre-populated User Portfolios
export const INITIAL_PORTFOLIOS = [
  {
    id: 'p-1',
    name: 'Growth & Tech Focus',
    cashBalance: 14500.00,
    positions: [
      { id: 'pos-1', symbol: 'NVDA', shares: 85, entryPrice: 94.20, addedDate: '2024-03-15' },
      { id: 'pos-2', symbol: 'AAPL', shares: 40, entryPrice: 182.50, addedDate: '2024-01-10' },
      { id: 'pos-3', symbol: 'BTC', shares: 0.85, entryPrice: 42100.00, addedDate: '2023-11-20' },
      { id: 'pos-4', symbol: 'MSFT', shares: 25, entryPrice: 380.00, addedDate: '2024-02-01' }
    ]
  },
  {
    id: 'p-2',
    name: 'Crypto Moonshots',
    cashBalance: 5200.00,
    positions: [
      { id: 'pos-5', symbol: 'SOL', shares: 120, entryPrice: 78.40, addedDate: '2023-12-12' },
      { id: 'pos-6', symbol: 'ETH', shares: 8.5, entryPrice: 2450.00, addedDate: '2024-01-05' },
      { id: 'pos-7', symbol: 'PLTR', shares: 350, entryPrice: 18.90, addedDate: '2024-04-10' }
    ]
  }
];
