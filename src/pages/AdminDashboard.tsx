import { useState } from 'react';
import { Calendar, Image, Star, Settings, LogOut, Menu, X, Stethoscope } from 'lucide-react';
import { BookingsView } from './admin/BookingsView';
import { GalleryView } from './admin/GalleryView';
import { ReviewsView } from './admin/ReviewsView';
import { SiteSettingsView } from './admin/SiteSettingsView';

type Tab = 'bookings' | 'gallery' | 'reviews' | 'settings';

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'bookings',  label: 'Bookings',      icon: <Calendar size={18} /> },
  { id: 'gallery',   label: 'Gallery',        icon: <Image size={18} /> },
  { id: 'reviews',   label: 'Reviews',        icon: <Star size={18} /> },
  { id: 'settings',  label: 'Site Settings',  icon: <Settings size={18} /> },
];

export function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [menuOpen, setMenuOpen] = useState(false);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    setMenuOpen(false);
  }

  const sidebarItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 16px', borderRadius: '12px', cursor: 'pointer',
    fontWeight: active ? 700 : 500, fontSize: '0.92rem',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? '#fff' : 'var(--ink)',
    border: 'none', width: '100%', textAlign: 'left',
    transition: 'all 150ms ease',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'inherit' }}>

      {/* Sidebar — Desktop */}
      <aside style={{ width: '240px', background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0 }}
        className="admin-sidebar-desktop">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '20px', marginBottom: '16px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Stethoscope size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.2 }}>Save Dental</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={sidebarItemStyle(activeTab === item.id)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'none', width: '100%', marginTop: '16px', transition: 'all 150ms' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Mobile Header */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between' }}
        className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink)' }}>Admin Panel</span>
        </div>
        <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: '4px' }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: '57px', left: 0, right: 0, background: 'var(--surface)', borderBottom: '1px solid var(--line)', zIndex: 999, padding: '8px 16px 16px' }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => selectTab(item.id)} style={{ ...sidebarItemStyle(activeTab === item.id), width: '100%', marginBottom: '4px' }}>
              {item.icon}{item.label}
            </button>
          ))}
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'none', width: '100%', marginTop: '8px' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', maxWidth: '1100px' }} className="admin-main">
        {activeTab === 'bookings'  && <BookingsView token={token} />}
        {activeTab === 'gallery'   && <GalleryView  token={token} />}
        {activeTab === 'reviews'   && <ReviewsView  token={token} />}
        {activeTab === 'settings'  && <SiteSettingsView token={token} />}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-main { padding: 76px 16px 24px !important; }
        }
      `}</style>
    </div>
  );
}
