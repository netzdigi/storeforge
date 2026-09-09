'use client';

import { useState } from 'react';

export default function OrderButton({ shopId, productId }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`/api/shops/${shopId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name, email, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Bestellung fehlgeschlagen.');
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className="order-success">Danke! Deine Bestellung ist eingegangen.</p>;
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-primary small" onClick={() => setOpen(true)}>
        Bestellen
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="order-form">
      {error && <div className="form-error">{error}</div>}
      <input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <input
        type="email"
        placeholder="E-Mail"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="number"
        min="1"
        max="100"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="order-qty"
      />
      <button type="submit" className="btn btn-primary small" disabled={status === 'sending'}>
        {status === 'sending' ? '…' : 'Bestätigen'}
      </button>
    </form>
  );
}
