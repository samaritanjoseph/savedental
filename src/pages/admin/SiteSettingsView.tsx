import { API_BASE } from '../../api';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Globe, Clock, MapPin, AlertTriangle, Image, Type, RefreshCw } from 'lucide-react';

const defaultSettings = {
  // Clinic Info
  clinicName: 'Save Dental Clinic',
  tagline: 'Your smile, your schedule.',
  primaryPhone: '0802 XXX XXXX',
  secondaryPhone: '0902 XXX XXXX',
  whatsappNumber: '2348XXXXXXXXX',
  email: 'info@savedental.com',
  address: 'Dikat House, 1st Floor, A1 No. 60 Ring Road, Ibadan, Oyo State',
  googleMapsUrl: 'https://maps.google.com/?q=Save+Dental+Clinic+Ring+Road+Ibadan',
  // Hours
  monFriHours: '8am – 6pm',
  satHours: '9am – 5pm',
  sunHours: '12pm – 4pm',
  // Notice banner
  noticeBannerEnabled: false,
  noticeBannerText: '',
  noticeBannerColor: '#07863f',
  // Hero section
  heroHeadline: 'Your Smile, Our Priority.',
  heroSubtext: 'Professional dental care in Ibadan. Easy booking, expert treatment, trusted by hundreds of patients.',
  // Social
  instagramUrl: 'https://instagram.com/savedental',
  facebookUrl: '',
  tiktokUrl: '',
};

type Settings = typeof defaultSettings;

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 20px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--surface-soft)',
      }}>
        <Icon size={18} style={{ color: 'var(--primary)' }} />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px', display: 'grid', gap: '16px' }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: '6px', fontSize: '0.8rem' }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--line)',
  background: 'var(--surface-soft)',
  color: 'var(--ink)',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};

export function SiteSettingsView({ token }: { token?: string }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (!res.ok) return defaultSettings;
      const json = await res.json();
      return { ...defaultSettings, ...json };
    }
  });

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (newSettings: Settings) => {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(newSettings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  });

  function update(key: keyof Settings, value: any) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveMutation.mutate(settings);
  }

  function handleReset() {
    if (window.confirm('Reset all settings to default values?')) {
      setSettings(defaultSettings);
    }
  }

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading settings...</div>;

  return (
    <div className="admin-panel">
      <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Site Settings</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
            Control clinic info, hours, and content shown on the website.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleReset} className="action-btn cancel" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Reset
          </button>
          <button onClick={handleSave} disabled={saveMutation.isPending} className="action-btn confirm" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px' }}>
            <Save size={14} /> {saveMutation.isPending ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Notice Banner */}
        <Section title="Notice Banner" icon={AlertTriangle}>
          <Field label="Show notice banner on website?">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.noticeBannerEnabled}
                onChange={e => update('noticeBannerEnabled', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
                {settings.noticeBannerEnabled ? '🟢 Banner is VISIBLE to visitors' : '⚫ Banner is hidden'}
              </span>
            </label>
          </Field>
          {settings.noticeBannerEnabled && (
            <>
              <Field label="Banner message" hint="e.g. closed on public holidays, special hours">
                <input style={inputStyle} value={settings.noticeBannerText} onChange={e => update('noticeBannerText', e.target.value)} placeholder="We will be closed on 1st October. Happy Independence Day!" />
              </Field>
              <Field label="Banner background colour">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="color" value={settings.noticeBannerColor} onChange={e => update('noticeBannerColor', e.target.value)} style={{ width: '48px', height: '38px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }} />
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{settings.noticeBannerColor}</span>
                </div>
              </Field>
            </>
          )}
        </Section>

        {/* Clinic Info */}
        <Section title="Clinic Information" icon={Globe}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Clinic Name"><input style={inputStyle} value={settings.clinicName} onChange={e => update('clinicName', e.target.value)} /></Field>
            <Field label="Tagline" hint="shown under hero"><input style={inputStyle} value={settings.tagline} onChange={e => update('tagline', e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Primary Phone"><input style={inputStyle} value={settings.primaryPhone} onChange={e => update('primaryPhone', e.target.value)} placeholder="+234 XXX XXX XXXX" /></Field>
            <Field label="Secondary Phone"><input style={inputStyle} value={settings.secondaryPhone} onChange={e => update('secondaryPhone', e.target.value)} placeholder="+234 XXX XXX XXXX" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="WhatsApp Number" hint="digits only, with country code"><input style={inputStyle} value={settings.whatsappNumber} onChange={e => update('whatsappNumber', e.target.value)} placeholder="2348XXXXXXXXX" /></Field>
            <Field label="Email"><input style={inputStyle} type="email" value={settings.email} onChange={e => update('email', e.target.value)} /></Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location" icon={MapPin}>
          <Field label="Full Address">
            <input style={inputStyle} value={settings.address} onChange={e => update('address', e.target.value)} />
          </Field>
          <Field label="Google Maps Link" hint="paste URL from Google Maps share button">
            <input style={inputStyle} value={settings.googleMapsUrl} onChange={e => update('googleMapsUrl', e.target.value)} />
          </Field>
        </Section>

        {/* Opening Hours */}
        <Section title="Opening Hours" icon={Clock}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="Mon – Fri"><input style={inputStyle} value={settings.monFriHours} onChange={e => update('monFriHours', e.target.value)} placeholder="8am – 6pm" /></Field>
            <Field label="Saturday"><input style={inputStyle} value={settings.satHours} onChange={e => update('satHours', e.target.value)} placeholder="9am – 5pm" /></Field>
            <Field label="Sunday"><input style={inputStyle} value={settings.sunHours} onChange={e => update('sunHours', e.target.value)} placeholder="12pm – 4pm" /></Field>
          </div>
        </Section>

        {/* Hero Section */}
        <Section title="Homepage Hero Text" icon={Type}>
          <Field label="Main Headline" hint="large bold text at the top of the homepage">
            <input style={inputStyle} value={settings.heroHeadline} onChange={e => update('heroHeadline', e.target.value)} />
          </Field>
          <Field label="Sub-text / Description">
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
              value={settings.heroSubtext}
              onChange={e => update('heroSubtext', e.target.value)}
            />
          </Field>
        </Section>

        {/* Social Links */}
        <Section title="Social Media Links" icon={Image}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="Instagram URL"><input style={inputStyle} value={settings.instagramUrl} onChange={e => update('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." /></Field>
            <Field label="Facebook URL" hint="optional"><input style={inputStyle} value={settings.facebookUrl} onChange={e => update('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." /></Field>
            <Field label="TikTok URL" hint="optional"><input style={inputStyle} value={settings.tiktokUrl} onChange={e => update('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@..." /></Field>
          </div>
        </Section>

        {/* Live Preview of banner */}
        {settings.noticeBannerEnabled && settings.noticeBannerText && (
          <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>BANNER PREVIEW</p>
            <div style={{
              background: settings.noticeBannerColor,
              color: '#fff',
              textAlign: 'center',
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '10px',
            }}>
              {settings.noticeBannerText}
            </div>
          </div>
        )}

        {/* Save button bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
          <button onClick={handleReset} className="action-btn cancel" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Reset to defaults
          </button>
          <button onClick={handleSave} disabled={saveMutation.isPending} className="btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> {saveMutation.isPending ? 'Saving...' : saved ? '✓ All Changes Saved!' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useSiteSettings(): Settings {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (!res.ok) return defaultSettings;
      const json = await res.json();
      return { ...defaultSettings, ...json };
    }
  });
  return data || defaultSettings;
}
