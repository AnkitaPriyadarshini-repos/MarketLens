import React, { useState, useEffect } from 'react';
import { theme } from './theme/designTokens';
import { MarketProvider } from './data/MarketDataProvider';
import { HeaderNav } from './components/HeaderNav';
import { TickerTape } from './components/TickerTape';
import { NavigationTabs } from './components/NavigationTabs';
import { SearchModal } from './components/SearchModal';
import { LensAiAnalystModal } from './components/LensAiAnalystModal';
import { PriceAlertModal } from './components/PriceAlertModal';

// Screens
import { DashboardScreen } from './screens/Dashboard';
import { AssetDetailScreen } from './screens/AssetDetail';
import { TechnicalAnalysisScreen } from './screens/TechnicalAnalysis';
import { PortfolioScreen } from './screens/Portfolio';
import { WatchlistScreen } from './screens/Watchlist';
import { MarketHeatmapScreen } from './screens/MarketHeatmap';
import { CalendarHeatmapScreen } from './screens/CalendarHeatmap';
import { NewsEventsScreen } from './screens/NewsEvents';
import { PerformanceBenchmarkScreen } from './screens/Performance';

export function App() {
  const queryTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
  const [activeTab, setActiveTab] = useState(queryTab || 'dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [allAssets, setAllAssets] = useState([]);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Load active asset object
  useEffect(() => {
    MarketProvider.getQuote(selectedSymbol).then(asset => setSelectedAsset(asset));
  }, [selectedSymbol]);

  // Load marquee assets
  useEffect(() => {
    MarketProvider.searchAssets('').then(res => setAllAssets(res));
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectAsset = (symbol) => {
    setSelectedSymbol(symbol);
    setActiveTab('asset');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.bgDark, display: 'flex', flexDirection: 'column' }}>
      {/* Top Sticky Header */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Marquee Ticker Bar */}
      <TickerTape assets={allAssets} onSelectAsset={handleSelectAsset} />

      {/* Navigation Sub-Tabs */}
      <NavigationTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <DashboardScreen marketProvider={MarketProvider} onSelectAsset={handleSelectAsset} />
        )}
        {activeTab === 'asset' && (
          <AssetDetailScreen
            asset={selectedAsset}
            marketProvider={MarketProvider}
            onOpenAlerts={() => setIsAlertOpen(true)}
          />
        )}
        {activeTab === 'tech' && (
          <TechnicalAnalysisScreen asset={selectedAsset} marketProvider={MarketProvider} />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioScreen marketProvider={MarketProvider} onSelectAsset={handleSelectAsset} />
        )}
        {activeTab === 'watchlist' && (
          <WatchlistScreen
            marketProvider={MarketProvider}
            onSelectAsset={handleSelectAsset}
            onOpenAlerts={() => setIsAlertOpen(true)}
          />
        )}
        {activeTab === 'heatmap' && (
          <MarketHeatmapScreen marketProvider={MarketProvider} onSelectAsset={handleSelectAsset} />
        )}
        {activeTab === 'calendar' && (
          <CalendarHeatmapScreen />
        )}
        {activeTab === 'news' && (
          <NewsEventsScreen marketProvider={MarketProvider} onSelectAsset={handleSelectAsset} />
        )}
        {activeTab === 'benchmark' && (
          <PerformanceBenchmarkScreen />
        )}
      </main>

      {/* Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        marketProvider={MarketProvider}
        onSelectAsset={handleSelectAsset}
      />

      <LensAiAnalystModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        asset={selectedAsset}
      />

      <PriceAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        asset={selectedAsset}
      />
    </div>
  );
}
export default App;
