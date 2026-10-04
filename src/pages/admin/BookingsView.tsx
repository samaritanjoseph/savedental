import { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle, XCircle, Trash2, Search, RefreshCw } from 'lucide-react';
import { API_BASE } from '../../api';

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  created_at: string;
}

const statusColor: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: 'rgba(234,179,8,0.15)',   color: '#b45309' },
  Confirmed: { bg: 'rgba(7,134,63,0.15)',     color: '#07863f' },
  Cancelled: { bg: 'rgba(239,68,68,0.15)',    color: '#dc2626' },
};

export function BookingsView({ token }: { token: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  async function updateStatus(id: number, status: string) {
    setActionLoading(id);
    try {
      await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b));
    } finally { setActionLoading(null); }
  }

  async function deleteBooking(id: number) {
    if (!confirm('Delete this booking?')) return;
    setActionLoading(id);
    try {
      await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev => prev.filter(b => b.id !== id));
    } finally { setActionLoading(null); }
  }

  const filtered = bookings.filter(b => {
    const matchSearch = search === '' || b.name.toLowerCase().includes(search.toLowerCase()) || b.date.includes(search) || b.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const s: Record<string, React.CSSProperties> = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
    title: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px' },
    controls: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-soft)', border: '1.5px solid var(--line)', borderRadius: '10px', padding: '8px 14px' },
    searchInput: { background: 'none', border: 'none', outline: 'none', color: 'var(--ink)', fontSize: '0.9rem', width: '180px' },
    select: { background: 'var(--surface-soft)', border: '1.5px solid var(--line)', borderRadius: '10px', padding: '8px 12px', color: 'var(--ink)', fontSize: '0.85rem', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px 16px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', borderBottom: '1px solid var(--line)', background: 'var(--surface-soft)' },
    td: { padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink)', borderBottom: '1px solid var(--line)', verticalAlign: 'middle' as const },
    muted: { fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' },
    actions: { display: 'flex', gap: '6px', alignItems: 'center' },
    btn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 150ms' },
    empty: { textAlign: 'center' as const, padding: '60px', color: 'var(--muted)' },
  };

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}><Calendar size={22} /> Bookings <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 400 }}>({filtered.length})</span></h2>
        <div style={s.controls}>
          <div style={s.searchBox}>
            <Search size={15} color="var(--muted)" />
            <input style={s.searchInput} placeholder="Search name, date, service…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {['All', 'Pending', 'Confirmed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={fetchBookings} style={{ ...s.btn, background: 'var(--surface-soft)', color: 'var(--ink)', border: '1.5px solid var(--line)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={s.empty}>Loading bookings…</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>No bookings found</div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Patient', 'Service', 'Date & Time', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const sc = statusColor[b.status] || statusColor.Pending;
                const busy = actionLoading === b.id;
                return (
                  <tr key={b.id} style={{ transition: 'background 150ms' }}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>{b.name}</div>
                      {b.notes && <div style={s.muted} title={b.notes}>📝 {b.notes.slice(0, 40)}{b.notes.length > 40 ? '…' : ''}</div>}
                    </td>
                    <td style={s.td}>{b.service}</td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>{b.date}</div>
                      <div style={s.muted}>{b.time}</div>
                    </td>
                    <td style={s.td}>
                      <div>{b.phone}</div>
                      <div style={s.muted}>{b.email}</div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...sc, padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        {b.status !== 'Confirmed' && (
                          <button onClick={() => updateStatus(b.id, 'Confirmed')} disabled={busy} style={{ ...s.btn, background: 'rgba(7,134,63,0.12)', color: '#07863f' }} title="Confirm">
                            <CheckCircle size={14} /> Confirm
                          </button>
                        )}
                        {b.status !== 'Cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'Cancelled')} disabled={busy} style={{ ...s.btn, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }} title="Cancel">
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                        <button onClick={() => deleteBooking(b.id)} disabled={busy} style={{ ...s.btn, background: 'rgba(239,68,68,0.1)', color: '#dc2626', padding: '6px 8px' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
