'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PageSwitcher({ shopId, pages, currentPageId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function goToPage(page) {
    const next = new URLSearchParams(searchParams);
    if (page.is_home) {
      next.delete('page');
    } else {
      next.set('page', page.id);
    }
    const query = next.toString();
    router.push(query ? `?${query}` : '?');
  }

  async function addPage(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Seite konnte nicht erstellt werden.');
        return;
      }
      setAdding(false);
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      router.push(`?page=${data.page.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deletePage(page) {
    if (!window.confirm(`Seite „${page.title}“ wirklich löschen?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/pages/${page.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (page.id === currentPageId) router.push('?');
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-switcher">
      {error && <div className="form-error" style={{ flexBasis: '100%' }}>{error}</div>}
      {pages.map((page) => (
        <div key={page.id} className={page.id === currentPageId ? 'page-tab active' : 'page-tab'}>
          <button type="button" disabled={busy} onClick={() => goToPage(page)}>{page.title}</button>
          {!page.is_home && (
            <span className="page-tab-delete" onClick={() => deletePage(page)}>✕</span>
          )}
        </div>
      ))}
      {adding ? (
        <form onSubmit={addPage} className="page-add-form">
          <input
            placeholder="Titel"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
          <input
            placeholder="url-kennung"
            required
            pattern="[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
          <button className="btn btn-primary small" type="submit" disabled={busy}>Erstellen</button>
          <button className="btn small" type="button" onClick={() => setAdding(false)}>Abbrechen</button>
        </form>
      ) : (
        <button className="page-tab-add" type="button" onClick={() => setAdding(true)}>+ Seite</button>
      )}
    </div>
  );
}
