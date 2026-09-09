'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductForm({ shopId }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError('Bitte gib einen gültigen Preis an.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, priceCents, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Produkt konnte nicht erstellt werden.');
        return;
      }
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      router.refresh();
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label htmlFor="product-name">Name</label>
        <input id="product-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="product-description">Beschreibung (optional)</label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="product-price">Preis (€)</label>
        <input
          id="product-price"
          required
          type="text"
          inputMode="decimal"
          placeholder="19,99"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="product-image">Bild-URL (optional)</label>
        <input
          id="product-image"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Wird hinzugefügt…' : 'Produkt hinzufügen'}
      </button>
    </form>
  );
}
