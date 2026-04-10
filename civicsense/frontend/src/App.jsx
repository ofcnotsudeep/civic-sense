import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import { LayoutDashboard, ShieldAlert, Menu, X } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0a0c10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: 1 }}>CIVICSENSE</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>AI URBAN INTEL</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {[
            { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
            { id: 'admin', label: 'Admin Panel', icon: ShieldAlert },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, border: 'none',
              background: page === id ? 'rgba(0,212,170,0.1)' : 'transparent',
              color: page === id ? 'var(--accent)' : 'var(--text2)',
              fontSize: 13, fontWeight: page === id ? 600 : 400,
              marginBottom: 2, transition: 'all 0.15s', textAlign: 'left'
            }}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            POWERED BY<br/>
            <span style={{ color: 'var(--accent2)' }}>CLAUDE AI</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {page === 'dashboard' ? <Dashboard /> : <AdminPanel />}
      </main>
    </div>
  );
}
