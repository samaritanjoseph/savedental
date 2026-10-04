import { useState, useEffect, useCallback, useRef } from 'react';
import { Image, Upload, Trash2, RefreshCw, X } from 'lucide-react';
import { API_BASE } from '../../api';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  before_url: string;
  after_url: string;
  created_at: string;
}

export function GalleryView({ token }: { token: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState('');
  const [afterPreview, setAfterPreview] = useState('');
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gallery`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function handleFileChange(type: 'before' | 'after', file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'before') { setBeforeFile(file); setBeforePreview(url); }
    else { setAfterFile(file); setAfterPreview(url); }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!beforeFile || !afterFile) return setUploadError('Please select both before and after images');
    setUploadError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('before', beforeFile);
      form.append('after', afterFile);
      const res = await fetch(`${API_BASE}/api/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Reset form
      setTitle(''); setDescription('');
      setBeforeFile(null); setAfterFile(null);
      setBeforePreview(''); setAfterPreview('');
      if (beforeRef.current) beforeRef.current.value = '';
      if (afterRef.current) afterRef.current.value = '';
      await fetchItems();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('Delete this gallery item?')) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(prev => prev.filter(i => i.id !== id));
    } finally { setDeletingId(null); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    border: '1.5px solid var(--line)', borderRadius: '10px',
    background: 'var(--surface-soft)', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image size={22} /> Before &amp; After Gallery <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 400 }}>({items.length} items)</span>
        </h2>
        <button onClick={fetchItems} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--surface-soft)', border: '1.5px solid var(--line)', borderRadius: '10px', color: 'var(--ink)', fontSize: '0.85rem', cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Upload Form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '20px', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
          <Upload size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Upload New Before &amp; After
        </h3>
        <form onSubmit={handleUpload}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Title *</label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Teeth Whitening Result" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Description (optional)</label>
              <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Before */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Before Photo *</label>
              <div
                onClick={() => beforeRef.current?.click()}
                style={{ border: '2px dashed var(--line)', borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'center', background: 'var(--surface-soft)', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {beforePreview
                  ? <img src={beforePreview} alt="before preview" style={{ maxHeight: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                  : <><Upload size={24} color="var(--muted)" /><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Click to upload</span></>
                }
              </div>
              <input ref={beforeRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange('before', e.target.files?.[0] || null)} />
            </div>

            {/* After */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>After Photo *</label>
              <div
                onClick={() => afterRef.current?.click()}
                style={{ border: '2px dashed var(--line)', borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'center', background: 'var(--surface-soft)', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {afterPreview
                  ? <img src={afterPreview} alt="after preview" style={{ maxHeight: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                  : <><Upload size={24} color="var(--muted)" /><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Click to upload</span></>
                }
              </div>
              <input ref={afterRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange('after', e.target.files?.[0] || null)} />
            </div>
          </div>

          {uploadError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>
              ❌ {uploadError}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            style={{ padding: '12px 24px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? 'Uploading…' : '⬆ Upload Photos'}
          </button>
        </form>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading gallery…</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>No gallery items yet. Upload your first before &amp; after!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <img src={`${API_BASE}${item.before_url}`} alt="Before" style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', textAlign: 'center' }}>BEFORE</div>
                </div>
                <div>
                  <img src={`${API_BASE}${item.after_url}`} alt="After" style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '6px 10px', background: 'rgba(7,134,63,0.1)', fontSize: '0.7rem', fontWeight: 700, color: '#07863f', textAlign: 'center' }}>AFTER</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{item.title}</div>
                  {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>{item.description}</div>}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={deletingId === item.id}
                  style={{ padding: '8px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Delete"
                >
                  {deletingId === item.id ? <X size={16} /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
