// Cute Stocks Pro - Production Design System Tokens

export const theme = {
  colors: {
    bgDark: '#090d16',
    bgCard: '#0f172a',
    bgCardHover: '#131d35',
    bgCardElevated: '#1e293b',
    border: '#1e293b',
    borderLight: '#334155',
    borderFocus: '#3b82f6',

    // Financial movement colors
    gain: '#10b981',        // Emerald Green
    gainBg: 'rgba(16, 185, 129, 0.12)',
    gainGlow: 'rgba(16, 185, 129, 0.35)',
    
    loss: '#ef4444',        // Crimson Red
    lossBg: 'rgba(239, 68, 68, 0.12)',
    lossGlow: 'rgba(239, 68, 68, 0.35)',

    neutral: '#94a3b8',
    neutralBg: 'rgba(148, 163, 184, 0.1)',

    // Accents
    accentPrimary: '#3b82f6',  // Vivid Blue
    accentCyan: '#06b6d4',     // Electric Cyan
    accentPurple: '#8b5cf6',   // Royal Violet
    accentGold: '#f59e0b',     // Amber Gold
    accentIndigo: '#6366f1',

    // Text hierarchy
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textDisabled: '#475569',

    // Chart default palettes
    chartSeries: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#34d399', '#f43f5e']
  },

  fonts: {
    main: "'Inter', system-ui, -apple-system, sans-serif",
    display: "'Outfit', 'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace"
  },

  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px'
  },

  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    glowGain: '0 0 20px -3px rgba(16, 185, 129, 0.4)',
    glowLoss: '0 0 20px -3px rgba(239, 68, 68, 0.4)',
    glowBlue: '0 0 25px -5px rgba(59, 130, 246, 0.4)'
  }
};
