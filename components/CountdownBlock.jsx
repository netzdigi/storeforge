'use client';

import { useEffect, useState } from 'react';

function getRemaining(deadline) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function CountdownBlock({ heading, deadline, buttonLabel, buttonUrl }) {
  const [remaining, setRemaining] = useState(() => getRemaining(deadline));

  useEffect(() => {
    setRemaining(getRemaining(deadline));
    const id = setInterval(() => setRemaining(getRemaining(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;

  return (
    <div className="container block-section countdown-block">
      {heading && <h2>{heading}</h2>}
      {remaining ? (
        <div className="countdown-grid">
          <div className="countdown-unit"><strong>{remaining.days}</strong><span>Tage</span></div>
          <div className="countdown-unit"><strong>{remaining.hours}</strong><span>Std</span></div>
          <div className="countdown-unit"><strong>{remaining.minutes}</strong><span>Min</span></div>
          <div className="countdown-unit"><strong>{remaining.seconds}</strong><span>Sek</span></div>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>Das Angebot ist abgelaufen.</p>
      )}
      {buttonLabel && buttonUrl && (
        <a href={buttonUrl} className="btn btn-primary" style={{ marginTop: 12 }}>{buttonLabel}</a>
      )}
    </div>
  );
}
