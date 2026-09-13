// MarketDataProvider Data Abstraction Layer

import { 
  MARKET_ASSETS, 
  generateChartData, 
  MOCK_NEWS, 
  MOCK_CALENDAR, 
  INITIAL_PORTFOLIOS 
} from './mockMarketData.js';
import { calculateIndicators } from '../charts/indicators/technicalMath.js';

export class MarketDataProvider {
  searchAssets(query) { throw new Error('Not implemented'); }
  getQuote(symbol) { throw new Error('Not implemented'); }
  getHistoricalPrices(symbol, timeframe) { throw new Error('Not implemented'); }
  getOHLC(symbol, timeframe) { throw new Error('Not implemented'); }
  getMarketOverview() { throw new Error('Not implemented'); }
  getMovers() { throw new Error('Not implemented'); }
  getSectors() { throw new Error('Not implemented'); }
  getNews() { throw new Error('Not implemented'); }
  getCalendar() { throw new Error('Not implemented'); }
  getPortfolio() { throw new Error('Not implemented'); }
  getWatchlist() { throw new Error('Not implemented'); }
}

export class MockMarketDataProvider extends MarketDataProvider {
  privateAssets = MARKET_ASSETS;

  async searchAssets(query) {
    if (!query) return this.privateAssets.slice(0, 10);
    const q = query.toLowerCase().trim();
    return this.privateAssets.filter(
      a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.sector?.toLowerCase().includes(q)
    );
  }

  async getQuote(symbol) {
    const found = this.privateAssets.find(a => a.symbol === symbol.toUpperCase());
    if (found) return { ...found };
    return { ...this.privateAssets[0], symbol };
  }

  async getHistoricalPrices(symbol, timeframe = '1M') {
    const rawData = generateChartData(symbol, timeframe);
    return calculateIndicators(rawData);
  }

  async getOHLC(symbol, timeframe = '1M') {
    return this.getHistoricalPrices(symbol, timeframe);
  }

  async getMarketOverview() {
    const indices = this.privateAssets.filter(a => a.category === 'Indices');
    const btc = this.privateAssets.find(a => a.symbol === 'BTC');
    const gold = this.privateAssets.find(a => a.symbol === 'GOLD');

    const totalGainers = this.privateAssets.filter(a => a.changePercent > 0).length;
    const totalLosers = this.privateAssets.filter(a => a.changePercent < 0).length;

    return {
      indices,
      btc,
      gold,
      fearAndGreed: 68,
      marketBreadth: {
        advancing: totalGainers,
        declining: totalLosers,
        ratio: (totalGainers / (totalGainers + totalLosers)).toFixed(2)
      }
    };
  }

  async getMovers() {
    const sortedByChange = [...this.privateAssets].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sortedByChange.slice(0, 5);
    const losers = sortedByChange.slice(-5).reverse();
    const mostActive = [...this.privateAssets].sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume)).slice(0, 5);

    return { gainers, losers, mostActive };
  }

  async getSectors() {
    const sectorMap = {};

    this.privateAssets.forEach(a => {
      const sec = a.sector || 'Other';
      if (!sectorMap[sec]) {
        sectorMap[sec] = { count: 0, totalChange: 0, assets: [] };
      }
      sectorMap[sec].count += 1;
      sectorMap[sec].totalChange += a.changePercent;
      sectorMap[sec].assets.push(a);
    });

    return Object.keys(sectorMap).map(secName => ({
      name: secName,
      changePercent: parseFloat((sectorMap[secName].totalChange / sectorMap[secName].count).toFixed(2)),
      count: sectorMap[secName].count,
      assets: sectorMap[secName].assets
    }));
  }

  async getNews() {
    return MOCK_NEWS;
  }

  async getCalendar() {
    return MOCK_CALENDAR;
  }

  async getPortfolio() {
    return INITIAL_PORTFOLIOS;
  }

  async getWatchlist() {
    return this.privateAssets.slice(0, 8);
  }
}

export const MarketProvider = new MockMarketDataProvider();

