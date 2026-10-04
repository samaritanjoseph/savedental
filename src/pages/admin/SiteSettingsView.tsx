import { useState, useEffect, useCallback } from 'react';
import { Settings, Save, RefreshCw, CheckCircle } from 'lucide-react';
import { API_BASE } from '../../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SETTINGS = {
  clinicName: 'Save Dental Clinic',
  tagline: 'Your Smile, Our Priority',
  phone1: '+234 815 228 7675',
  phone2: '+234 702 598 9518',
  whatsapp: '+2348152287675',
  email: 'savedental@gmail.com',
  address: 'Ibadan, Oyo State, Nigeria',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  hours: {
    Monday: '8:00 AM – 6:00 PM',
    Tuesday: '8:00 AM – 6:00 PM',
    Wednesday: '8:00 AM – 6:00 PM',
    Thursday: '8:00 AM – 6:00 PM',
    Friday: '8:00 AM – 6:00 PM',
    Saturday: '9:00 AM – 3:00 PM',
    Sunday: 'Closed',
  },
  noticeBannerEnabled: false,
  noticeBannerMessage: '',
  noticeBannerColor: '#07863f',
};

export function SiteSettingsView({ token }: { token: string }) {
  const [settings, setSettings] = useState<typeof DEFAULT_SETTINGS>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const data = await res.json();
      setSettings(prev => ({ ...prev, ...data }));
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  function setHour(day: string, value: string) {
    setSettings(prev => ({ ...prev, hours: { ...prev.hours, [day]: value } }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    border: '1.5px solid var(--line)', borderRadius: '10px',
    background: 'var(--surface-soft)', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' };
  const sectionStyle: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px', marginBottom: '20px' };
  const sectionTitle: React.CSSProperties = { margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', paddingBottom: '12px', borderBottom: '1px solid var(--line)' };
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading settings…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={22} /> Site Settings
        </h2>
        <button onClick={() => fetchSettings()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--surface-soft)', border: '1.5px solid var(--line)', borderRadius: '10px', color: 'var(--ink)', fontSize: '0.85rem', cursor: 'pointer' }}>
          <RefreshCw size={14} /> Reload
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* Clinic Info */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>🏥 Clinic Info</h3>
          <div style={{ ...gridStyle, marginBottom: '14px' }}>
            <div><label style={labelStyle}>Clinic Name</label><input style={inputStyle} value={settings.clinicName} onChange={e => setSettings(p => ({ ...p, clinicName: e.target.value }))} /></div>
            <div><label style={labelStyle}>Tagline</label><input style={inputStyle} value={settings.tagline} onChange={e => setSettings(p => ({ ...p, tagline: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Address</label><input style={inputStyle} value={settings.address} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} /></div>
          <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={settings.email} onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} /></div>
        </div>

        {/* Phone Numbers */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>📞 Phone Numbers</h3>
          <div style={gridStyle}>
            <div><label style={labelStyle}>Primary Line</label><input style={inputStyle} value={settings.phone1} onChange={e => setSettings(p => ({ ...p, phone1: e.target.value }))} placeholder="+234 xxx xxx xxxx" /></div>
            <div><label style={labelStyle}>Secondary Line</label><input style={inputStyle} value={settings.phone2} onChange={e => setSettings(p => ({ ...p, phone2: e.target.value }))} placeholder="+234 xxx xxx xxxx" /></div>
          </div>
          <div style={{ marginTop: '14px' }}><label style={labelStyle}>WhatsApp Number (with country code, no spaces)</label><input style={inputStyle} value={settings.whatsapp} onChange={e => setSettings(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+2348152287675" /></div>
        </div>

        {/* Social Links */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>🔗 Social Media Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Instagram URL</label><input style={inputStyle} value={settings.instagramUrl} onChange={e => setSettings(p => ({ ...p, instagramUrl: e.target.value }))} placeholder="https://instagram.com/yourhandle" /></div>
            <div><label style={labelStyle}>Facebook URL</label><input style={inputStyle} value={settings.facebookUrl} onChange={e => setSettings(p => ({ ...p, facebookUrl: e.target.value }))} placeholder="https://facebook.com/yourpage" /></div>
            <div><label style={labelStyle}>TikTok URL</label><input style={inputStyle} value={settings.tiktokUrl} onChange={e => setSettings(p => ({ ...p, tiktokUrl: e.target.value }))} placeholder="https://tiktok.com/@yourhandle" /></div>
          </div>
        </div>

        {/* Opening Hours */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>🕐 Opening Hours</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DAYS.map(day => (
              <div key={day} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' }}>{day}</span>
                <input style={inputStyle} value={(settings.hours as Record<string, string>)[day] || ''} onChange={e => setHour(day, e.target.value)} placeholder="e.g. 8:00 AM – 6:00 PM or Closed" />
              </div>
            ))}
          </div>
        </div>

        {/* Notice Banner */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>📢 Notice Banner</h3>
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={!!settings.noticeBannerEnabled}
                onChange={e => setSettings(p => ({ ...p, noticeBannerEnabled: e.target.checked }))}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>Show notice banner on the site</span>
            </label>
          </div>
          {settings.noticeBannerEnabled && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Banner Message</label>
                <input style={inputStyle} value={settings.noticeBannerMessage} onChange={e => setSettings(p => ({ ...p, noticeBannerMessage: e.target.value }))} placeholder="e.g. 🎄 Closed for Christmas Dec 25–26. Happy holidays!" />
              </div>
              <div>
                <label style={labelStyle}>Banner Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="color" value={settings.noticeBannerColor} onChange={e => setSettings(p => ({ ...p, noticeBannerColor: e.target.value }))} style={{ width: '48px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }} />
                  <input style={{ ...inputStyle, maxWidth: '140px' }} value={settings.noticeBannerColor} onChange={e => setSettings(p => ({ ...p, noticeBannerColor: e.target.value }))} placeholder="#07863f" />
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: settings.noticeBannerColor, color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                    Preview: {settings.noticeBannerMessage || 'Your message here'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#dc2626', marginBottom: '16px' }}>
            ❌ {error}
          </div>
        )}

        {saved && (
          <div style={{ padding: '12px 16px', background: 'rgba(7,134,63,0.12)', border: '1px solid rgba(7,134,63,0.3)', borderRadius: '12px', color: '#07863f', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> Settings saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: saving ? 'var(--muted)' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          <Save size={18} /> {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
