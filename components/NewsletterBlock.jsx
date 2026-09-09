'use client';

import { useState } from 'react';

export default function NewsletterBlock({ shopId, heading, buttonLabel }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`/api/shops/${shopId}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Anmeldung fehlgeschlagen.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setEmail('');
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="container block-section" style={{ textAlign: 'center' }}>
        <h2>{heading}</h2>
        <p style={{ color: 'var(--accent)' }}>Danke für deine Anmeldung!</p>
      </div>
    );
  }

  return (
    <div className="container block-section" style={{ textAlign: 'center' }}>
      <h2>{heading}</h2>
      <form onSubmit={handleSubmit} className="newsletter-form">
        {error && <div className="form-error" style={{ flexBasis: '100%' }}>{error}</div>}
        <input
          type="email"
          required
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Wird gesendet…' : buttonLabel}
        </button>
      </form>
    </div>
  );
}
