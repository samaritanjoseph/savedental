import { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { API_BASE } from '../../api';

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  is_approved: number;
  created_at: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={14} fill={n <= rating ? '#f59e0b' : 'none'} color={n <= rating ? '#f59e0b' : 'var(--muted)'} />
      ))}
    </div>
  );
}

export function ReviewsView({ token }: { token: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Approved' | 'Pending'>('All');
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function toggleApprove(review: Review) {
    setActionId(review.id);
    try {
      await fetch(`${API_BASE}/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_approved: review.is_approved ? 0 : 1 }),
      });
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: r.is_approved ? 0 : 1 } : r));
    } finally { setActionId(null); }
  }

  async function deleteReview(id: number) {
    if (!confirm('Delete this review permanently?')) return;
    setActionId(id);
    try {
      await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(prev => prev.filter(r => r.id !== id));
    } finally { setActionId(null); }
  }

  const filtered = reviews.filter(r => {
    if (filter === 'Approved') return r.is_approved === 1;
    if (filter === 'Pending') return r.is_approved === 0;
    return true;
  });

  const pendingCount = reviews.filter(r => r.is_approved === 0).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={22} /> Reviews
          {pendingCount > 0 && (
            <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
              {pendingCount} pending
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['All', 'Pending', 'Approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: '20px', border: '1.5px solid var(--line)', background: filter === f ? 'var(--primary)' : 'var(--surface-soft)', color: filter === f ? '#fff' : 'var(--ink)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
              {f}
            </button>
          ))}
          <button onClick={fetchReviews} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'var(--surface-soft)', border: '1.5px solid var(--line)', borderRadius: '10px', color: 'var(--ink)', fontSize: '0.82rem', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading reviews…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>No reviews found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(review => {
            const approved = review.is_approved === 1;
            const busy = actionId === review.id;
            return (
              <div key={review.id} style={{ background: 'var(--surface)', border: `1px solid ${approved ? 'rgba(7,134,63,0.25)' : 'var(--line)'}`, borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: approved ? 'rgba(7,134,63,0.15)' : 'var(--surface-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {review.name.charAt(0).toUpperCase()}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--ink)', marginRight: '10px' }}>{review.name}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                      background: approved ? 'rgba(7,134,63,0.12)' : 'rgba(234,179,8,0.15)',
                      color: approved ? '#07863f' : '#b45309'
                    }}>
                      {approved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px', color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.5 }}>{review.comment}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(review.created_at).toLocaleDateString()}</div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleApprove(review)}
                    disabled={busy}
                    title={approved ? 'Remove approval' : 'Approve'}
                    style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, background: approved ? 'rgba(239,68,68,0.1)' : 'rgba(7,134,63,0.12)', color: approved ? '#dc2626' : '#07863f' }}
                  >
                    {approved ? <><XCircle size={14} /> Unapprove</> : <><CheckCircle size={14} /> Approve</>}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={busy}
                    title="Delete"
                    style={{ padding: '8px', borderRadius: '10px', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', background: 'rgba(239,68,68,0.1)', color: '#dc2626', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
