import React, { useState, useRef } from 'react';
import { X, Upload, MapPin, Send, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { submitReport } from '../utils/api.js';
import { SEVERITY_COLOR, TYPE_ICON } from '../utils/helpers.js';

export default function ReportModal({ onClose, onSuccess }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!text && !image) { setError('Add a photo or description'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      if (image) fd.append('image', image);
      if (text) fd.append('text', text);
      if (address) fd.append('address', address);
      const res = await submitReport(fd);
      setResult(res.data);
      onSuccess && onSuccess(res.data.incident);
    } catch (e) {
      setError(e.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)',
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
        animation: 'fadeUp 0.2s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--accent)', letterSpacing: 1 }}>REPORT INCIDENT</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>AI will classify and route automatically</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {!result ? (
          <div style={{ padding: 20 }}>
            {/* Image Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !imagePreview && fileRef.current.click()}
              style={{
                border: `2px dashed ${imagePreview ? 'var(--accent)' : 'var(--border2)'}`,
                borderRadius: 12, minHeight: 160, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: imagePreview ? 'default' : 'pointer',
                marginBottom: 14, position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }} />
                  <button onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }} style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)',
                    border: 'none', borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                  }}>
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                  <Upload size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <div style={{ fontSize: 13 }}>Drop photo or click to upload</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG up to 5MB</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />

            {/* Text description */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the problem (optional if photo provided)..."
              rows={3}
              style={{
                width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 13,
                resize: 'none', outline: 'none', marginBottom: 12, transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />

            {/* Address */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Location / Area (e.g. Connaught Place, Delhi)"
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 12px 10px 34px', color: 'var(--text)', fontSize: 13,
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(255,77,109,0.08)', borderRadius: 8 }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: loading ? 'var(--border)' : 'var(--accent)', color: loading ? 'var(--text3)' : '#0a0c10',
                fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, transition: 'all 0.2s', fontFamily: 'var(--font-mono)'
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="spin" />
                  ANALYZING WITH AI...
                </>
              ) : (
                <>
                  <Send size={16} />
                  SUBMIT & ANALYZE
                </>
              )}
            </button>
          </div>
        ) : (
          /* Success state */
          <div style={{ padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <CheckCircle size={40} color="var(--accent)" style={{ marginBottom: 10 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', letterSpacing: 1 }}>INCIDENT LOGGED</div>
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {/* Severity bar */}
              <div style={{
                background: SEVERITY_COLOR(result.incident.severity), height: 4,
                width: `${result.incident.severity * 10}%`, transition: 'width 1s ease'
              }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{TYPE_ICON[result.incident.type] || '⚠️'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', textTransform: 'capitalize' }}>{result.incident.type}</div>
                    <div style={{ fontSize: 11, color: SEVERITY_COLOR(result.incident.severity), fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      SEVERITY {result.incident.severity}/10
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Routed to</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent2)' }}>{result.incident.department}</div>
                  </div>
                </div>

                {[
                  { label: 'Summary', val: result.incident.summary },
                  { label: 'Action Required', val: result.incident.immediate_action },
                  { label: 'Est. Resolution', val: `${result.incident.estimated_hours}h` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onClose} style={{
              width: '100%', marginTop: 14, padding: '11px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13
            }}>
              CLOSE & VIEW MAP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
