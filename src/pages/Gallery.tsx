import { API_BASE } from '../api';
import { useQuery } from '@tanstack/react-query';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

export function Gallery() {
  const { data: gallery, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/gallery`);
      return res.json();
    }
  });

  return (
    <div className="page-container" style={{ paddingTop: '100px' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2>Smile Transformations</h2>
        <p style={{ color: 'var(--muted)' }}>See the results of our expert dental care</p>
      </div>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading gallery...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {gallery?.map((item: any) => (
            <div key={item.id} className="reveal" style={{ border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow)', background: 'var(--surface)' }}>
              <BeforeAfterSlider 
                beforeUrl={`${API_BASE}${item.before_url}`} 
                afterUrl={`${API_BASE}${item.after_url}`} 
              />
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--ink)' }}>{item.title}</h3>
                {item.description && <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem' }}>{item.description}</p>}
              </div>
            </div>
          ))}
          {gallery?.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted)' }}>No gallery items yet.</p>}
        </div>
      )}
    </div>
  );
}
