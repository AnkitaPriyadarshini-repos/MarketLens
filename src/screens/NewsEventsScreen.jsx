import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar as CalendarIcon, ExternalLink, Zap, ShieldAlert } from 'lucide-react';
import { theme } from '../theme/designTokens';

export function NewsEventsScreen({
  marketProvider = null,
  onSelectAsset = null
}) {
  const [news, setNews] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('news'); // 'news' | 'calendar'

  useEffect(() => {
    if (!marketProvider) return;
    Promise.all([
      marketProvider.getNews(),
      marketProvider.getCalendar()
    ]).then(([newsData, calendarData]) => {
      setNews(newsData);
      setCalendar(calendarData);
      setLoading(false);
    });
  }, [marketProvider]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
        Loading Financial News & Economic Calendar...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', fontFamily: theme.fonts.main, color: theme.colors.textPrimary }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={20} color={theme.colors.accentGold} /> Financial Intelligence & Macro Calendar
          </h2>
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
            Real-Time Wire Feeds & Scheduled Economic Catalysts
          </span>
        </div>

        <div style={{ display: 'flex', background: theme.colors.bgDark, padding: '3px', borderRadius: theme.radius.md }}>
          <button
            onClick={() => setActiveTab('news')}
            style={{
              padding: '6px 14px',
              borderRadius: theme.radius.sm,
              border: 'none',
              background: activeTab === 'news' ? theme.colors.accentPrimary : 'transparent',
              color: activeTab === 'news' ? '#fff' : theme.colors.textMuted,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Market News ({news.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '6px 14px',
              borderRadius: theme.radius.sm,
              border: 'none',
              background: activeTab === 'calendar' ? theme.colors.accentPrimary : 'transparent',
              color: activeTab === 'calendar' ? '#fff' : theme.colors.textMuted,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Economic Calendar ({calendar.length})
          </button>
        </div>
      </div>

      {activeTab === 'news' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {news.map(item => (
            <div
              key={item.id}
              style={{
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.xl,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: theme.colors.accentCyan }}>{item.source}</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>• {item.time}</span>
                  <span style={{ fontSize: '11px', background: theme.colors.bgDark, padding: '2px 8px', borderRadius: '4px', color: theme.colors.textSecondary }}>{item.category}</span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  color: item.sentiment.includes('Bullish') ? theme.colors.gain : theme.colors.loss,
                  background: item.sentiment.includes('Bullish') ? theme.colors.gainBg : theme.colors.lossBg
                }}>
                  {item.sentiment} ({item.impactScore}/100 Impact)
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff', lineHeight: 1.4 }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                {item.summary}
              </p>

              {/* Related Ticker Tags */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {item.tickers.map(sym => (
                  <button
                    key={sym}
                    onClick={() => onSelectAsset && onSelectAsset(sym)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: theme.radius.sm,
                      background: theme.colors.bgCardElevated,
                      border: `1px solid ${theme.colors.borderLight}`,
                      color: theme.colors.textPrimary,
                      fontSize: '11px',
                      fontFamily: theme.fonts.mono,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ${sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {calendar.map(item => (
            <div
              key={item.id}
              style={{
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.xl,
                padding: '16px 20px',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: theme.colors.textMuted, fontFamily: theme.fonts.mono }}>
                  {item.date} • {item.country}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                  {item.event}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', fontFamily: theme.fonts.mono, fontSize: '13px' }}>
                <div><span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>FORECAST</span> <b style={{ color: '#fff' }}>{item.forecast}</b></div>
                <div><span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>PREVIOUS</span> <b style={{ color: '#fff' }}>{item.previous}</b></div>
                <div><span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>IMPACT</span> <b style={{ color: theme.colors.accentGold }}>{item.impact}</b></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
