import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { SEVERITY_COLOR, SEVERITY_LABEL, TYPE_ICON, STATUS_COLOR, STATUS_LABEL, timeAgo } from '../utils/helpers.js';

export default function IncidentCard({ incident, onClick, selected }) {
  const { type, severity, department, summary, status, address, created_at } = incident;

  return (
    <div
      onClick={() => onClick && onClick(incident)}
      style={{
        background: selected ? 'rgba(0,212,170,0.06)' : 'var(--bg3)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
        transition: 'all 0.15s', marginBottom: 8,
        borderLeft: `3px solid ${SEVERITY_COLOR(severity)}`
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--border2)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{TYPE_ICON[type] || '⚠️'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
              color: SEVERITY_COLOR(severity), background: `${SEVERITY_COLOR(severity)}18`,
              padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5
            }}>{SEVERITY_LABEL(severity)}</span>
            <span style={{
              fontSize: 9, fontFamily: 'var(--font-mono)', color: STATUS_COLOR[status],
              background: `${STATUS_COLOR[status]}15`, padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5
            }}>{STATUS_LABEL[status]}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>{department}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 5, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {summary}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={10} /> {address}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
              <Clock size={10} /> {timeAgo(created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
