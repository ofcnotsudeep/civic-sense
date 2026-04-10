import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Incidents', value: stats.total, icon: Zap, color: 'var(--accent2)' },
    { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'var(--red)' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'var(--amber)' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'var(--green)' },
    { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: '#ff4d6d', bg: 'rgba(255,77,109,0.08)' },
    { label: 'Avg Severity', value: stats.avgSeverity, icon: Zap, color: 'var(--amber)' },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, padding: '14px 18px',
      borderBottom: '1px solid var(--border)', background: 'var(--bg2)'
    }}>
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} style={{
          background: bg || 'var(--bg3)', borderRadius: 10, padding: '10px 12px',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Icon size={15} color={color} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value ?? '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
