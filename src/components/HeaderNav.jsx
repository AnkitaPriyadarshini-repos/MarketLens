import React from 'react';
import { Search, Bot, Activity, Star, Layers, ShieldCheck, Zap, Cpu } from 'lucide-react';
import { theme } from '../theme/designTokens';

export function HeaderNav({
  onOpenSearch = null,
  onOpenAi = null,
  activeTab = 'dashboard',
  onSelectTab = null
}) {
  return (
    <header style={{
      width: '100%',
      background: theme.colors.bgCard,
      borderBottom: `1px solid ${theme.colors.border}`,
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: theme.fonts.main
    }}>
      {/* Brand Logo & Name */}
      <div 
        onClick={() => onSelectTab && onSelectTab('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: theme.radius.md,
          background: `linear-gradient(135deg, ${theme.colors.accentPrimary} 0%, ${theme.colors.accentPurple} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          boxShadow: theme.shadows.glowBlue
        }}>
          <Activity size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: theme.fonts.display, tracking: '-0.02em' }}>
            Cute Stocks <span style={{ color: theme.colors.accentCyan, fontSize: '13px', background: 'rgba(6, 182, 212, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>PRO</span>
          </div>
        </div>
      </div>

      {/* Global Search Bar Button */}
      <div
        onClick={onOpenSearch}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: theme.colors.bgDark,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: '8px 16px',
          color: theme.colors.textMuted,
          fontSize: '13px',
          cursor: 'pointer',
          width: '320px'
        }}
      >
        <Search size={16} />
        <span style={{ flex: 1 }}>Search assets, stocks, crypto...</span>
        <kbd style={{
          background: theme.colors.bgCardElevated,
          border: `1px solid ${theme.colors.borderLight}`,
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '11px',
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.mono
        }}>
          ⌘K
        </kbd>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={onOpenAi}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: theme.radius.md,
            background: 'rgba(245, 158, 11, 0.15)',
            border: `1px solid rgba(245, 158, 11, 0.4)`,
            color: theme.colors.accentGold,
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Zap size={16} /> LensAI
        </button>
      </div>
    </header>
  );
}
