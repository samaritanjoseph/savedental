import { useState, useRef, useEffect } from 'react';

export function BeforeAfterSlider({ beforeUrl, afterUrl }: { beforeUrl: string, afterUrl: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: any) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    let pos = ((x - left) / width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPos(pos);
  };

  const startDrag = () => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  };

  const stopDrag = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchend', stopDrag);
  };

  useEffect(() => {
    return () => {
      stopDrag();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="ba-slider"
      onMouseDown={handleMove}
      onTouchStart={handleMove}
      onMouseDownCapture={startDrag}
      onTouchStartCapture={startDrag}
    >
      <img src={beforeUrl} alt="Before" className="ba-img" />
      <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, zIndex: 1 }}>Before</span>
      
      <div className="ba-after" style={{ width: `${sliderPos}%` }}>
        <img src={afterUrl} alt="After" />
        <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, zIndex: 1 }}>After</span>
      </div>
      
      <div className="ba-handle" style={{ left: `${sliderPos}%` }} />
    </div>
  );
}
