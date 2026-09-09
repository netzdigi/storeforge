'use client';

import { useState } from 'react';

export default function StickyCtaBlock({ text, buttonLabel, buttonUrl }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !buttonUrl) return null;

  return (
    <div className="sticky-cta">
      {text && <span>{text}</span>}
      <div className="sticky-cta-actions">
        <a href={buttonUrl} className="btn btn-primary small">{buttonLabel}</a>
        <button className="sticky-cta-close" onClick={() => setDismissed(true)} aria-label="Schließen">✕</button>
      </div>
    </div>
  );
}
