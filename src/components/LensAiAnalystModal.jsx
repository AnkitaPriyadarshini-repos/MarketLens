import React, { useState } from 'react';
import { Bot, Zap, X, Send, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';
import { theme } from '../theme/designTokens';

export function LensAiAnalystModal({
  isOpen = false,
  onClose = null,
  asset = null
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I'm LensAI, your financial intelligence analyst. Ask me anything about technical patterns, risk profiles, or target scenarios for ${asset ? asset.symbol : 'global markets'}.`
    }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      let replyText = `Based on current technical indicators for ${asset ? asset.symbol : 'this asset'}, the 20-day SMA is signaling strong momentum with an RSI of ${asset?.rsi || 65}. Key resistance is identified near $${asset ? (asset.price * 1.08).toFixed(2) : '150.00'}. Risk score stands at 3/10.`;
      if (textToSend.toLowerCase().includes('risk')) {
        replyText = `Risk Assessment for ${asset?.symbol || 'Asset'}: Low-to-moderate beta. High cash reserves and dominant market share keep downside risk hedged against broader market volatility.`;
      } else if (textToSend.toLowerCase().includes('target')) {
        replyText = `Price Targets: Bullish Scenario = $${asset?.bullPriceTarget || 180} | Bearish Scenario = $${asset?.bearPriceTarget || 110}. Institutional accumulation metrics remain net-positive.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: replyText }]);
      setThinking(false);
    }, 700);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '520px',
      background: theme.colors.bgCard,
      border: `1px solid ${theme.colors.borderLight}`,
      borderRadius: theme.radius.xl,
      boxShadow: theme.shadows.card,
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: theme.fonts.main
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        background: theme.colors.bgCardElevated,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color={theme.colors.accentGold} />
          <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff', fontFamily: theme.fonts.display }}>
            LensAI Analyst Assistant
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages Scroll Viewport */}
      <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              background: m.sender === 'user' ? theme.colors.accentPrimary : theme.colors.bgCardElevated,
              color: '#fff',
              padding: '10px 14px',
              borderRadius: theme.radius.lg,
              fontSize: '13px',
              maxWidth: '85%',
              lineHeight: 1.4
            }}
          >
            {m.text}
          </div>
        ))}
        {thinking && (
          <div style={{ fontSize: '12px', color: theme.colors.textMuted, fontStyle: 'italic' }}>
            LensAI is analyzing order books & RSI indicators...
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ padding: '8px 12px', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: `1px solid ${theme.colors.border}` }}>
        <button
          onClick={() => handleSend(`What is the technical target for ${asset?.symbol}?`)}
          style={{ padding: '4px 8px', borderRadius: theme.radius.sm, background: theme.colors.bgDark, border: 'none', color: theme.colors.accentCyan, fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Targets?
        </button>
        <button
          onClick={() => handleSend(`Analyze downside risk score`)}
          style={{ padding: '4px 8px', borderRadius: theme.radius.sm, background: theme.colors.bgDark, border: 'none', color: theme.colors.accentGold, fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Risk Score?
        </button>
      </div>

      {/* Input Form */}
      <div style={{ padding: '10px', display: 'flex', gap: '8px', borderTop: `1px solid ${theme.colors.border}` }}>
        <input
          type="text"
          placeholder="Ask LensAI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, background: theme.colors.bgDark, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
        />
        <button
          onClick={() => handleSend()}
          style={{ padding: '8px 12px', borderRadius: theme.radius.md, background: theme.colors.accentPrimary, border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
