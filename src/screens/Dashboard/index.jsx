import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Flame, ShieldAlert, 
  ArrowUpRight, ArrowDownRight, Compass, Layers, PieChart 
} from 'lucide-react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import { LineChartPrimitive } from '../../charts/primitives/LineChartPrimitive';
import { BarChartPrimitive } from '../../charts/primitives/BarChartPrimitive';

export function DashboardScreen({
  marketProvider = null,
  onSelectAsset = null
}) {
  const [marketOverview, setMarketOverview] = useState(null);
  const [movers, setMovers] = useState({ gainers: [], losers: [], mostActive: [] });
  const [sectors, setSectors] = useState([]);
  const [activeMoverTab, setActiveMoverTab] = useState('gainers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketProvider) return;
    let isMounted = true;

    Promise.all([
      marketProvider.getMarketOverview(),
      marketProvider.getMovers(),
      marketProvider.getSectors()
    ]).then(([overview, moversData, sectorsData]) => {
      if (isMounted) {
        setMarketOverview(overview);
        setMovers(moversData);
        setSectors(sectorsData);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [marketProvider]);

  if (loading || !marketOverview) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
        Loading MarketLens Dashboard...
      </div>
    );
  }

  const moverList = movers[activeMoverTab] || [];

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Top Global Indices & Assets Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {marketOverview.indices.concat([marketOverview.btc, marketOverview.gold]).map(asset => {
          if (!asset) return null;
          const isPos = asset.changePercent >= 0;

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset && onSelectAsset(asset.symbol)}
              style={{
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.lg,
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.borderLight;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.colors.textSecondary }}>{asset.name}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: isPos ? theme.colors.gain : theme.colors.loss,
                  background: isPos ? theme.colors.gainBg : theme.colors.lossBg,
                  fontFamily: theme.fonts.mono
                }}>
                  {formatPercent(asset.changePercent)}
                </span>
              </div>

              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: theme.fonts.mono, marginTop: '8px' }}>
                {formatCurrency(asset.price)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Market Breadth, Sentiment & Movers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Market Movers Card */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px'
        }}>
          {/* Movers Header & Tab Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color={theme.colors.accentGold} /> Market Movers
            </h3>

            <div style={{ display: 'flex', background: theme.colors.bgDark, padding: '3px', borderRadius: theme.radius.md }}>
              <button
                onClick={() => setActiveMoverTab('gainers')}
                style={{
                  padding: '4px 10px',
                  borderRadius: theme.radius.sm,
                  border: 'none',
                  background: activeMoverTab === 'gainers' ? theme.colors.gainBg : 'transparent',
                  color: activeMoverTab === 'gainers' ? theme.colors.gain : theme.colors.textMuted,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Gainers
              </button>
              <button
                onClick={() => setActiveMoverTab('losers')}
                style={{
                  padding: '4px 10px',
                  borderRadius: theme.radius.sm,
                  border: 'none',
                  background: activeMoverTab === 'losers' ? theme.colors.lossBg : 'transparent',
                  color: activeMoverTab === 'losers' ? theme.colors.loss : theme.colors.textMuted,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Losers
              </button>
              <button
                onClick={() => setActiveMoverTab('mostActive')}
                style={{
                  padding: '4px 10px',
                  borderRadius: theme.radius.sm,
                  border: 'none',
                  background: activeMoverTab === 'mostActive' ? theme.colors.bgCardElevated : 'transparent',
                  color: activeMoverTab === 'mostActive' ? '#fff' : theme.colors.textMuted,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Active
              </button>
            </div>
          </div>

          {/* Movers List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {moverList.map(item => {
              const isPos = item.changePercent >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => onSelectAsset && onSelectAsset(item.symbol)}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: theme.colors.bgCardElevated,
                    borderRadius: theme.radius.md,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.colors.borderLight}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      fontFamily: theme.fonts.mono,
                      width: '55px'
                    }}>
                      {item.symbol}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.colors.textMuted, maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: theme.fonts.mono }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                      {formatCurrency(item.price)}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: isPos ? theme.colors.gain : theme.colors.loss }}>
                      {formatPercent(item.changePercent)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Performance Bar Breakdown */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color={theme.colors.accentCyan} /> Sector Performance
          </h3>

          <BarChartPrimitive
            data={sectors}
            height={280}
            horizontal={true}
            dataKey="changePercent"
            nameKey="name"
            colorKey="changePercent"
            valueFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`}
          />
        </div>

        {/* Market Breadth & Sentiment Card */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color={theme.colors.accentPurple} /> Market Sentiment & Breadth
            </h3>

            {/* Fear & Greed Meter */}
            <div style={{
              background: theme.colors.bgCardElevated,
              padding: '16px',
              borderRadius: theme.radius.lg,
              border: `1px solid ${theme.colors.border}`,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: theme.colors.textMuted, textTransform: 'uppercase' }}>
                Fear & Greed Index
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: theme.colors.gain, fontFamily: theme.fonts.mono, marginTop: '4px' }}>
                {marketOverview.fearAndGreed} <span style={{ fontSize: '14px', textTransform: 'uppercase', color: theme.colors.gain }}>GREED</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: theme.colors.bgDark, borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${marketOverview.fearAndGreed}%`, height: '100%', background: theme.colors.gain }} />
              </div>
            </div>

            {/* Advancing vs Declining */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', fontFamily: theme.fonts.mono }}>
              <div style={{ background: theme.colors.gainBg, padding: '12px', borderRadius: theme.radius.md, border: `1px solid rgba(16, 185, 129, 0.3)` }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '11px' }}>ADVANCING</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.gain, marginTop: '4px' }}>
                  {marketOverview.marketBreadth.advancing} Assets
                </div>
              </div>

              <div style={{ background: theme.colors.lossBg, padding: '12px', borderRadius: theme.radius.md, border: `1px solid rgba(239, 68, 68, 0.3)` }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '11px' }}>DECLINING</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.loss, marginTop: '4px' }}>
                  {marketOverview.marketBreadth.declining} Assets
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
