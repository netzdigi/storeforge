'use client';

import { useEffect, useRef, useState } from 'react';

export default function BeforeAfterBlock({ beforeUrl, afterUrl, beforeLabel, afterLabel }) {
  const [pos, setPos] = useState(50);
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function updateFromClientX(clientX) {
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }

  function handlePointerDown(e) {
    draggingRef.current = true;
    updateFromClientX(e.clientX);
  }
  function handlePointerMove(e) {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  }
  function stopDragging() {
    draggingRef.current = false;
  }

  if (!beforeUrl || !afterUrl) return null;

  return (
    <div className="container block-section">
      <div
        ref={containerRef}
        className="before-after"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
      >
        <img src={afterUrl} alt={afterLabel} className="ba-image ba-after" />
        <div className="ba-before-wrap" style={{ width: `${pos}%` }}>
          <img src={beforeUrl} alt={beforeLabel} className="ba-image" style={{ width: width || '100%' }} />
        </div>
        <div className="ba-handle" style={{ left: `${pos}%` }}>
          <span>↔</span>
        </div>
        <span className="ba-label ba-label-left">{beforeLabel}</span>
        <span className="ba-label ba-label-right">{afterLabel}</span>
      </div>
    </div>
  );
}
