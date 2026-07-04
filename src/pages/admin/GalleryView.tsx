import { API_BASE } from '../../api';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';

export function GalleryView({ token }: { token: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const { data: gallery, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/gallery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE}/api/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setTitle('');
      setDescription('');
      if (beforeRef.current) beforeRef.current.value = '';
      if (afterRef.current) afterRef.current.value = '';
    },
    onSettled: () => setUploading(false)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_BASE}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeRef.current?.files?.[0] || !afterRef.current?.files?.[0]) return alert(t("admin.dashboard.gallery.select_both", { defaultValue: "Select both images" }));
    
    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('before', beforeRef.current.files[0]);
    formData.append('after', afterRef.current.files[0]);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>{t("admin.dashboard.gallery.title", { defaultValue: "Gallery Management" })}</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', background: 'var(--surface-soft)', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 45%' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>{t("admin.dashboard.gallery.image_title", { defaultValue: "Title" })}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }} placeholder={t("admin.dashboard.gallery.title_placeholder", { defaultValue: "e.g. Braces 6 Months" })} />
          </div>
          <div style={{ flex: '1 1 45%' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>Description (Optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }} placeholder="Brief description of the transformation" />
          </div>
          <div style={{ flex: '1 1 30%' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>{t("admin.dashboard.gallery.before_image", { defaultValue: "Before Image" })}</label>
            <input type="file" ref={beforeRef} accept="image/*" required style={{ width: '100%', padding: '7px', background: 'var(--surface)', color: 'var(--ink)', borderRadius: '6px', border: '1px solid var(--line)' }} />
          </div>
          <div style={{ flex: '1 1 30%' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>{t("admin.dashboard.gallery.after_image", { defaultValue: "After Image" })}</label>
            <input type="file" ref={afterRef} accept="image/*" required style={{ width: '100%', padding: '7px', background: 'var(--surface)', color: 'var(--ink)', borderRadius: '6px', border: '1px solid var(--line)' }} />
          </div>
          <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" disabled={uploading} className="action-btn confirm" style={{ height: '40px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} /> {uploading ? t("admin.dashboard.gallery.uploading", { defaultValue: "Uploading..." }) : t("admin.dashboard.gallery.upload_images", { defaultValue: "Upload Images" })}
            </button>
          </div>
        </form>

        {isLoading ? <p>{t("admin.dashboard.overview.loading", { defaultValue: "Loading..." })}</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.dashboard.gallery.image_title", { defaultValue: "Title" })}</th>
                <th>Preview</th>
                <th>{t("admin.dashboard.patients.actions", { defaultValue: "Actions" })}</th>
              </tr>
            </thead>
            <tbody>
              {gallery?.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    {item.description && <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>{item.description}</p>}
                  </td>
                  <td style={{ width: '300px' }}>
                    <div style={{ width: '100%', height: '150px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <BeforeAfterSlider beforeUrl={`${API_BASE}${item.before_url}`} afterUrl={`${API_BASE}${item.after_url}`} />
                    </div>
                  </td>
                  <td>
                    <button onClick={() => deleteMutation.mutate(item.id)} className="action-btn cancel" title={t("admin.dashboard.users.delete", { defaultValue: "Delete" })}>
                      <Trash2 size={16} /> {t("admin.dashboard.users.delete", { defaultValue: "Delete" })}
                    </button>
                  </td>
                </tr>
              ))}
              {gallery?.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>{t("admin.dashboard.gallery.no_items", { defaultValue: "No items in gallery." })}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
