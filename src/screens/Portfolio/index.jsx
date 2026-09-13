import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Wallet, TrendingUp, TrendingDown, Plus, 
  ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet 
} from 'lucide-react';
import { theme } from '../../theme/designTokens';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieDonutPrimitive } from '../../charts/primitives/PieDonutPrimitive';
import { LineChartPrimitive } from '../../charts/primitives/LineChartPrimitive';
import { BarChartPrimitive } from '../../charts/primitives/BarChartPrimitive';

export function PortfolioScreen({
  marketProvider = null,
  onSelectAsset = null
}) {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('p-1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketProvider) return;
    marketProvider.getPortfolio().then(data => {
      setPortfolios(data);
      setLoading(false);
    });
  }, [marketProvider]);

  const activePortfolio = portfolios.find(p => p.id === selectedPortfolioId) || portfolios[0];

  // Calculate Portfolio Value & Allocations dynamically
  const portfolioStats = useMemo(() => {
    if (!activePortfolio) return { totalVal: 0, totalPnl: 0, dayPnl: 0, allocations: [], sectorData: [] };

    let totalVal = activePortfolio.cashBalance || 0;
    let totalInvested = 0;
    const allocations = [];
    const sectorMap = {};

    activePortfolio.positions.forEach(pos => {
      // Mock quote price lookups
      const mockPrices = { NVDA: 128.45, AAPL: 224.20, BTC: 64250.00, MSFT: 448.90, SOL: 154.80, ETH: 3480.50, PLTR: 32.40 };
      const currentPrice = mockPrices[pos.symbol] || pos.entryPrice * 1.1;

      const posVal = pos.shares * currentPrice;
      const costBasis = pos.shares * pos.entryPrice;
      
      totalVal += posVal;
      totalInvested += costBasis;

      allocations.push({
        name: pos.symbol,
        value: posVal,
        shares: pos.shares,
        entryPrice: pos.entryPrice,
        currentPrice: currentPrice,
        pnlVal: posVal - costBasis,
        pnlPct: ((posVal - costBasis) / costBasis) * 100
      });
    });

    const totalPnl = totalVal - totalInvested - (activePortfolio.cashBalance || 0);

    return {
      totalVal,
      totalInvested,
      totalPnl,
      totalPnlPct: totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0,
      allocations
    };
  }, [activePortfolio]);

  if (loading || !activePortfolio) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
        Loading Portfolio Analytics...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Portfolio Selector & Top Stats Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Net Worth Card */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px'
        }}>
          <div style={{ fontSize: '12px', color: theme.colors.textMuted, textTransform: 'uppercase' }}>
            Total Portfolio Value
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: theme.fonts.mono, marginTop: '4px' }}>
            {formatCurrency(portfolioStats.totalVal)}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: portfolioStats.totalPnl >= 0 ? theme.colors.gain : theme.colors.loss,
              fontFamily: theme.fonts.mono
            }}>
              {portfolioStats.totalPnl >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalPnl)} ({formatPercent(portfolioStats.totalPnlPct)})
            </span>
            <span style={{ fontSize: '11px', color: theme.colors.textMuted }}>All-Time P&L</span>
          </div>
        </div>

        {/* Cash & Invested Capital */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted, textTransform: 'uppercase' }}>
              Invested Capital
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: theme.fonts.mono, marginTop: '4px' }}>
              {formatCurrency(portfolioStats.totalInvested)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted, textTransform: 'uppercase' }}>
              Available Cash
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: theme.fonts.mono, marginTop: '4px', color: theme.colors.accentCyan }}>
              {formatCurrency(activePortfolio.cashBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Asset Allocation Donut + Holdings Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Donut Asset Allocation */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: 0, marginBottom: '16px', color: theme.colors.textSecondary }}>
            Asset Weight Allocation
          </h3>
          <PieDonutPrimitive
            data={portfolioStats.allocations}
            height={260}
            isDonut={true}
            dataKey="value"
            nameKey="name"
          />
        </div>

        {/* Holdings Table */}
        <div style={{
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px',
          gridColumn: 'span 2'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: 0, marginBottom: '16px', color: theme.colors.textSecondary }}>
            Current Open Positions
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: theme.fonts.main }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.border}`, textAlign: 'left', color: theme.colors.textMuted, fontSize: '11px' }}>
                  <th style={{ padding: '8px 12px' }}>ASSET</th>
                  <th style={{ padding: '8px 12px' }}>POS SHARES</th>
                  <th style={{ padding: '8px 12px' }}>AVG COST</th>
                  <th style={{ padding: '8px 12px' }}>CURRENT PRICE</th>
                  <th style={{ padding: '8px 12px' }}>MARKET VALUE</th>
                  <th style={{ padding: '8px 12px' }}>UNREALIZED P&L</th>
                </tr>
              </thead>
              <tbody>
                {portfolioStats.allocations.map((pos) => {
                  const isPos = pos.pnlVal >= 0;
                  return (
                    <tr
                      key={pos.name}
                      onClick={() => onSelectAsset && onSelectAsset(pos.name)}
                      style={{
                        borderBottom: `1px solid ${theme.colors.border}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.bgCardElevated}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px', fontWeight: 800, fontFamily: theme.fonts.mono, color: '#fff' }}>
                        {pos.name}
                      </td>
                      <td style={{ padding: '12px', fontFamily: theme.fonts.mono }}>
                        {pos.shares}
                      </td>
                      <td style={{ padding: '12px', fontFamily: theme.fonts.mono }}>
                        {formatCurrency(pos.entryPrice)}
                      </td>
                      <td style={{ padding: '12px', fontFamily: theme.fonts.mono, fontWeight: 700 }}>
                        {formatCurrency(pos.currentPrice)}
                      </td>
                      <td style={{ padding: '12px', fontFamily: theme.fonts.mono, fontWeight: 700 }}>
                        {formatCurrency(pos.value)}
                      </td>
                      <td style={{ padding: '12px', fontFamily: theme.fonts.mono, fontWeight: 700, color: isPos ? theme.colors.gain : theme.colors.loss }}>
                        {isPos ? '+' : ''}{formatCurrency(pos.pnlVal)} ({formatPercent(pos.pnlPct)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
