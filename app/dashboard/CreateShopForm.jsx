'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const PROJECT_TYPES = [
  { value: 'shop', icon: '🛍️', label: 'Online-Shop', description: 'Produkte verkaufen, mit Produktübersicht.' },
  { value: 'website', icon: '🌐', label: 'Webseite', description: 'Reine Informationsseite, ohne Produkte.' },
];

export default function CreateShopForm() {
  const router = useRouter();
  const [type, setType] = useState('shop');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleNameChange(value) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, tagline, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Projekt konnte nicht erstellt werden.');
        return;
      }
      router.push(`/dashboard/shops/${data.shop.id}`);
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
        <label>Was möchtest du bauen?</label>
        <div className="type-picker">
          {PROJECT_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              className={type === pt.value ? 'type-card active' : 'type-card'}
              onClick={() => setType(pt.value)}
            >
              <span className="type-card-icon">{pt.icon}</span>
              <span className="type-card-label">{pt.label}</span>
              <span className="type-card-desc">{pt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="shop-name">Name</label>
        <input id="shop-name" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="shop-slug">URL: /s/</label>
        <input
          id="shop-slug"
          required
          pattern="[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="shop-tagline">Kurzbeschreibung (optional)</label>
        <input id="shop-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Wird erstellt…' : 'Projekt erstellen'}
      </button>
    </form>
  );
}
