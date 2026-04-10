import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, RefreshCw, BarChart2 } from 'lucide-react';
import { getIncidents, getStats, updateStatus } from '../utils/api.js';
import { SEVERITY_COLOR, SEVERITY_LABEL, TYPE_ICON, STATUS_COLOR, STATUS_LABEL, DEPT_COLOR, timeAgo } from '../utils/helpers.js';

export default function AdminPanel() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('all');
  const [updating, setUpdating] = useState({});

  const load = async () => {
    try {
      const [inc, st] = await Promise.all([getIncidents(), getStats()]);
      setIncidents(inc.data);
      setStats(st.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(p => ({ ...p, [id]: true }));
    try {
      const res = await updateStatus(id, status);
      setIncidents(prev => prev.map(i => i.id === id ? res.data : i));
      load(); // refresh stats
    } finally {
      setUpdating(p => ({ ...p, [id]: false }));
    }
  };

  const depts = ['all', ...new Set(incidents.map(i => i.department))];
  const filtered = deptFilter === 'all' ? incidents : incidents.filter(i => i.department === deptFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>DEPARTMENT VIEW</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Admin Control Panel</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* Dept stats cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {stats.byDept?.map(({ department, count }) => (
              <div key={department} style={{
                background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)',
                padding: '14px 16px', borderLeft: `3px solid ${DEPT_COLOR[department] || 'var(--accent)'}`
              }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{department}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: DEPT_COLOR[department] || 'var(--accent)' }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>active incidents</div>
              </div>
            ))}
            <div style={{
              background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)',
              padding: '14px 16px', borderLeft: '3px solid var(--red)'
            }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Critical</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--red)' }}>{stats.critical}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>severity ≥ 8</div>
            </div>
          </div>
        )}

        {/* Dept filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Filter:</span>
          {depts.map(d => (
            <button key={d} onClick={() => setDeptFilter(d)} style={{
              padding: '5px 12px', borderRadius: 20, border: `1px solid ${deptFilter === d ? (DEPT_COLOR[d] || 'var(--accent)') : 'var(--border)'}`,
              background: deptFilter === d ? `${(DEPT_COLOR[d] || 'var(--accent)')}18` : 'transparent',
              color: deptFilter === d ? (DEPT_COLOR[d] || 'var(--accent)') : 'var(--text3)',
              fontSize: 12, fontWeight: deptFilter === d ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s'
            }}>{d === 'all' ? 'All Depts' : d}</button>
          ))}
        </div>

        {/* Incidents table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
            <RefreshCw size={24} className="spin" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(incident => (
              <div key={incident.id} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                borderLeft: `3px solid ${SEVERITY_COLOR(incident.severity)}`,
                transition: 'border-color 0.2s', animation: 'fadeUp 0.2s ease'
              }}>
                {/* Icon + type */}
                <div style={{ flexShrink: 0, textAlign: 'center', width: 40 }}>
                  <div style={{ fontSize: 24 }}>{TYPE_ICON[incident.type] || '⚠️'}</div>
                  <div style={{ fontSize: 9, color: SEVERITY_COLOR(incident.severity), fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 2 }}>
                    {incident.severity}/10
                  </div>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: SEVERITY_COLOR(incident.severity), background: `${SEVERITY_COLOR(incident.severity)}18`,
                      padding: '2px 6px', borderRadius: 4
                    }}>{SEVERITY_LABEL(incident.severity)}</span>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, textTransform: 'capitalize' }}>
                      {incident.type}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{timeAgo(incident.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>{incident.summary}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    📍 {incident.address} · Action: <span style={{ color: 'var(--text2)' }}>{incident.immediate_action}</span>
                  </div>
                </div>

                {/* Department badge */}
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div style={{
                    background: `${DEPT_COLOR[incident.department] || 'var(--accent)'}18`,
                    color: DEPT_COLOR[incident.department] || 'var(--accent)',
                    border: `1px solid ${DEPT_COLOR[incident.department] || 'var(--accent)'}40`,
                    borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, marginBottom: 6
                  }}>{incident.department}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{incident.estimated_hours}h est.</div>
                </div>

                {/* Status actions */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
                  <div style={{
                    fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                    color: STATUS_COLOR[incident.status], textAlign: 'center',
                    background: `${STATUS_COLOR[incident.status]}12`, padding: '3px 8px',
                    borderRadius: 6, letterSpacing: 0.5, marginBottom: 4
                  }}>{STATUS_LABEL[incident.status]}</div>

                  {incident.status === 'open' && (
                    <button
                      onClick={() => handleStatusUpdate(incident.id, 'in-progress')}
                      disabled={updating[incident.id]}
                      style={{
                        width: '100%', padding: '6px', borderRadius: 8,
                        border: '1px solid var(--amber)', background: 'rgba(255,184,48,0.08)',
                        color: 'var(--amber)', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {updating[incident.id] ? '...' : '▶ Start Work'}
                    </button>
                  )}
                  {incident.status === 'in-progress' && (
                    <button
                      onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                      disabled={updating[incident.id]}
                      style={{
                        width: '100%', padding: '6px', borderRadius: 8,
                        border: '1px solid var(--green)', background: 'rgba(0,200,117,0.08)',
                        color: 'var(--green)', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {updating[incident.id] ? '...' : '✓ Resolve'}
                    </button>
                  )}
                  {incident.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate(incident.id, 'open')}
                      disabled={updating[incident.id]}
                      style={{
                        width: '100%', padding: '6px', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text3)', fontSize: 11, cursor: 'pointer'
                      }}
                    >
                      ↺ Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
