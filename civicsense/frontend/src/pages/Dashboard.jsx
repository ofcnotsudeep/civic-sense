import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Filter, Search, ChevronDown } from 'lucide-react';
import StatsBar from '../components/StatsBar.jsx';
import MapView from '../components/MapView.jsx';
import IncidentCard from '../components/IncidentCard.jsx';
import ReportModal from '../components/ReportModal.jsx';
import { getIncidents, getStats } from '../utils/api.js';

const TYPES = ['all', 'pothole', 'garbage', 'streetlight', 'waterlogging', 'other'];
const STATUSES = ['all', 'open', 'in-progress', 'resolved'];

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const [inc, st] = await Promise.all([getIncidents(params), getStats()]);
      setIncidents(inc.data);
      setStats(st.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const refresh = async () => { setRefreshing(true); await load(); };

  const filtered = incidents.filter(i =>
    !search || i.summary.toLowerCase().includes(search.toLowerCase()) ||
    i.address.toLowerCase().includes(search.toLowerCase()) ||
    i.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewIncident = (incident) => {
    setIncidents(prev => [incident, ...prev]);
    setSelectedId(incident.id);
    load(); // refresh stats too
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>LIVE DASHBOARD</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Urban Incident Monitor</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={refresh} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text2)', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12
          }}>
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
          <button onClick={() => setShowReport(true)} style={{
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            color: '#0a0c10', padding: '8px 14px', display: 'flex', alignItems: 'center',
            gap: 6, fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 0.5
          }}>
            <Plus size={14} />
            REPORT INCIDENT
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Body: Map + Sidebar */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)' }}>
              <RefreshCw size={24} className="spin" style={{ marginRight: 10 }} />
              Loading map...
            </div>
          ) : (
            <MapView
              incidents={filtered}
              selectedId={selectedId}
              onSelectIncident={(inc) => setSelectedId(inc.id)}
            />
          )}
          {/* Map overlay - incident count */}
          <div style={{
            position: 'absolute', top: 14, left: 14, zIndex: 500,
            background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>SHOWING</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{filtered.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>incidents</div>
          </div>
        </div>

        {/* Incident List Sidebar */}
        <div style={{
          width: 340, background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Filters */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents..."
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '7px 10px 7px 30px', color: 'var(--text)', fontSize: 12, outline: 'none'
                }}
              />
            </div>

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={{
                  padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 11,
                  background: typeFilter === t ? 'var(--accent)' : 'var(--bg3)',
                  color: typeFilter === t ? '#0a0c10' : 'var(--text3)',
                  fontWeight: typeFilter === t ? 700 : 400, textTransform: 'capitalize',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '3px 9px', borderRadius: 20, fontSize: 10,
                  border: `1px solid ${statusFilter === s ? 'var(--accent2)' : 'var(--border)'}`,
                  background: statusFilter === s ? 'rgba(0,152,255,0.15)' : 'transparent',
                  color: statusFilter === s ? 'var(--accent2)' : 'var(--text3)',
                  fontWeight: statusFilter === s ? 600 : 400, textTransform: 'capitalize',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px' }}>
            {loading ? (
              <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 30, fontSize: 13 }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 30, fontSize: 13 }}>No incidents found</div>
            ) : (
              filtered.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  selected={incident.id === selectedId}
                  onClick={(inc) => setSelectedId(inc.id === selectedId ? null : inc.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onSuccess={handleNewIncident}
        />
      )}
    </div>
  );
}
