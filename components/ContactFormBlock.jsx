'use client';

import { useState } from 'react';

export default function ContactFormBlock({ shopId, heading, buttonLabel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`/api/shops/${shopId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Senden fehlgeschlagen.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="container block-section" style={{ textAlign: 'center' }}>
        <h2>{heading}</h2>
        <p style={{ color: 'var(--accent)' }}>Danke! Deine Nachricht wurde gesendet.</p>
      </div>
    );
  }

  return (
    <div className="container block-section">
      <h2 style={{ textAlign: 'center' }}>{heading}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto' }}>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label>Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>E-Mail</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Nachricht</label>
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'} style={{ width: '100%' }}>
          {status === 'sending' ? 'Wird gesendet…' : buttonLabel}
        </button>
      </form>
    </div>
  );
}
