import { API_BASE } from '../api';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Reviews() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/reviews`);
      return res.json();
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, comment })
      });
      if (!res.ok) throw new Error('Submission failed');
    },
    onSuccess: () => {
      setSubmitted(true);
      setName('');
      setRating(5);
      setComment('');
    }
  });

  // Auto-play the slider every 5 seconds
  useEffect(() => {
    if (!reviews || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews]);

  const handlePrev = () => {
    if (!reviews) return;
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!reviews) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="section-pad" style={{ background: 'var(--surface-soft)' }} id="reviews">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
          {/* Decorative tooth SVG */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 4C22 4 14 11 14 22c0 6 2 11 4 16l4 18h4l2-12c1-4 2-6 4-6s3 2 4 6l2 12h4l4-18c2-5 4-10 4-16C46 11 42 4 32 4z" fill="var(--primary)" opacity="0.15"/>
              <path d="M32 4C22 4 14 11 14 22c0 6 2 11 4 16l4 18h4l2-12c1-4 2-6 4-6s3 2 4 6l2 12h4l4-18c2-5 4-10 4-16C46 11 42 4 32 4z" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>{t('reviews.title', { defaultValue: 'Patient Testimonials' })}</h2>
          <p style={{ color: 'var(--muted)' }}>{t('reviews.subtitle', { defaultValue: 'See what our patients have to say about their experience.' })}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          {/* Reviews Slider */}
          <div style={{ flex: '1 1 55%', minWidth: '300px', position: 'relative' }}>
            {isLoading ? (
              <p>Loading reviews...</p>
            ) : reviews && reviews.length > 0 ? (
              <div style={{ position: 'relative', overflow: 'hidden', padding: '10px 0' }}>
                {/* Cards Container */}
                <div style={{
                  display: 'flex',
                  transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}>
                  {reviews.map((review: any, idx: number) => {
                    // Pick a gradient from a palette for each avatar
                    const avatarGradients = [
                      'linear-gradient(135deg,#07863f,#9fd34f)',
                      'linear-gradient(135deg,#0070f3,#00c6fb)',
                      'linear-gradient(135deg,#f58220,#f7c948)',
                      'linear-gradient(135deg,#8b5cf6,#ec4899)',
                      'linear-gradient(135deg,#06b6d4,#3b82f6)',
                      'linear-gradient(135deg,#ef4444,#f97316)',
                    ];
                    const gradient = avatarGradients[idx % avatarGradients.length];
                    const initials = review.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase();

                    return (
                      <div key={review.id} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '10px' }}>
                        <div style={{
                          background: 'var(--surface)',
                          padding: '36px 36px 28px',
                          borderRadius: '24px',
                          boxShadow: 'var(--shadow)',
                          border: '1px solid var(--line)',
                          minHeight: '220px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '18px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          {/* Big decorative quote SVG top-right */}
                          <svg style={{ position: 'absolute', top: 16, right: 20, opacity: 0.07 }} width="72" height="72" viewBox="0 0 24 24" fill="var(--primary)">
                            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                          </svg>

                          {/* Stars */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={18} fill={i < review.rating ? 'var(--accent)' : 'transparent'} stroke={i < review.rating ? 'var(--accent)' : 'var(--muted)'} />
                            ))}
                          </div>

                          {/* Quote text */}
                          <p style={{ fontStyle: 'italic', color: 'var(--ink)', fontSize: '1.1rem', lineHeight: '1.7', margin: 0, flex: 1 }}>
                            "{t(`reviews.comments.${review.name}`, { defaultValue: review.comment })}"
                          </p>

                          {/* Author row with avatar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px solid var(--line)', paddingTop: '18px' }}>
                            {/* Avatar circle with initials */}
                            <div style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              background: gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem',
                              color: '#fff',
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}>
                              {initials}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', margin: 0 }}>{review.name}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {/* Verified badge icon */}
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                  <polyline points="9 12 11 14 15 10"/>
                                </svg>
                                {t('reviews.verified', { defaultValue: 'Verified Patient' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Slider Controls: dots + arrows */}
                {reviews.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                    <button onClick={handlePrev} style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                      <ChevronLeft size={20} />
                    </button>
                    {/* Dot indicators */}
                    <div style={{ display: 'flex', gap: '7px' }}>
                      {reviews.map((_: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          style={{
                            width: currentIndex === i ? '22px' : '9px',
                            height: '9px',
                            borderRadius: '9px',
                            background: currentIndex === i ? 'var(--primary)' : 'var(--line)',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </div>
                    <button onClick={handleNext} style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', textAlign: 'center' }}>{t('reviews.no_reviews', { defaultValue: 'No reviews yet. Be the first to share your experience!' })}</p>
            )}
          </div>

          {/* Review Form */}
          <div style={{ flex: '1 1 35%', minWidth: '300px', background: 'var(--surface)', padding: '30px', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--line)' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--ink)' }}>{t('reviews.leave', { defaultValue: 'Leave a Review' })}</h3>
            {submitted ? (
              <div style={{ padding: '20px', background: 'rgba(7, 134, 63, 0.1)', color: 'var(--primary)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--primary)' }}>
                {t('reviews.success', { defaultValue: 'Thank you! Your review has been submitted and is pending approval.' })}
              </div>
            ) : (
              <form onSubmit={submitMutation.mutate}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--ink)' }}>{t('reviews.name', { defaultValue: 'Name' })}</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface-soft)', color: 'var(--ink)' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--ink)' }}>{t('reviews.rating', { defaultValue: 'Rating' })}</label>
                  <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={24} 
                        fill={star <= rating ? 'var(--accent)' : 'transparent'} 
                        color={star <= rating ? 'var(--accent)' : 'var(--muted)'}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--ink)' }}>{t('reviews.comment', { defaultValue: 'Comment' })}</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={4} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface-soft)', color: 'var(--ink)', resize: 'vertical' }}></textarea>
                </div>
                <button type="submit" disabled={submitMutation.isPending} className="btn primary" style={{ width: '100%' }}>
                  {submitMutation.isPending ? t('reviews.submitting', { defaultValue: 'Submitting...' }) : t('reviews.submit', { defaultValue: 'Submit Review' })}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
