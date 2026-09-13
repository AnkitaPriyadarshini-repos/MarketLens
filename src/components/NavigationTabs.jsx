import React from 'react';
import { 
  LayoutDashboard, LineChart, BarChart2, Wallet, 
  Star, Grid, Calendar, Newspaper, Cpu 
} from 'lucide-react';
import { theme } from '../theme/designTokens';

export function NavigationTabs({
  activeTab = 'dashboard',
  onSelectTab = null
}) {
  const tabs = [
    { id: 'dashboard', label: 'Market Overview', icon: LayoutDashboard },
    { id: 'asset', label: 'Asset Studio', icon: LineChart },
    { id: 'tech', label: 'Technical Analysis', icon: BarChart2 },
    { id: 'portfolio', label: 'Portfolio Analytics', icon: Wallet },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'heatmap', label: 'Market Heatmap', icon: Grid },
    { id: 'calendar', label: 'Activity Calendar', icon: Calendar },
    { id: 'news', label: 'News & Events', icon: Newspaper },
    { id: 'benchmark', label: 'Graphics Benchmark', icon: Cpu }
  ];

  return (
    <div style={{
      width: '100%',
      background: theme.colors.bgCard,
      borderBottom: `1px solid ${theme.colors.border}`,
      padding: '0 24px',
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      fontFamily: theme.fonts.main
    }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => onSelectTab && onSelectTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: isActive ? theme.colors.accentPrimary : theme.colors.textMuted,
              borderBottom: isActive ? `2px solid ${theme.colors.accentPrimary}` : '2px solid transparent',
              fontSize: '13px',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon size={16} color={isActive ? theme.colors.accentPrimary : theme.colors.textMuted} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
