'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BLOCK_TYPES } from '@/lib/blockTypes';
import { StorefrontBody } from '@/components/StoreBlocks';

function blockLabel(type) {
  return BLOCK_TYPES.find((b) => b.type === type)?.label || type;
}

function BlockFields({ type, content, onChange }) {
  if (type === 'heading') {
    return (
      <div className="field">
        <label>Text</label>
        <input value={content.text || ''} onChange={(e) => onChange({ text: e.target.value })} />
      </div>
    );
  }
  if (type === 'text') {
    return (
      <div className="field">
        <label>Text</label>
        <textarea value={content.text || ''} onChange={(e) => onChange({ text: e.target.value })} />
      </div>
    );
  }
  if (type === 'image') {
    return (
      <>
        <div className="field">
          <label>Bild-URL</label>
          <input value={content.url || ''} onChange={(e) => onChange({ ...content, url: e.target.value })} />
        </div>
        <div className="field">
          <label>Alt-Text</label>
          <input value={content.alt || ''} onChange={(e) => onChange({ ...content, alt: e.target.value })} />
        </div>
      </>
    );
  }
  return <p style={{ color: 'var(--text-muted)' }}>Zeigt die Produktübersicht deines Shops.</p>;
}

export default function BlockEditor({ shopId, initialBlocks, shopName, shopTagline, products }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [editingId, setEditingId] = useState(null);
  const [draftContent, setDraftContent] = useState({});
  const [newType, setNewType] = useState('heading');
  const [newContent, setNewContent] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [device, setDevice] = useState('desktop');

  const previewBlocks = useMemo(
    () => blocks.map((b) => (b.id === editingId ? { ...b, content: draftContent } : b)),
    [blocks, editingId, draftContent]
  );

  async function reorder(nextBlocks) {
    setBlocks(nextBlocks);
    await fetch(`/api/shops/${shopId}/blocks/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: nextBlocks.map((b) => b.id) }),
    });
    router.refresh();
  }

  function moveBlock(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    reorder(next);
  }

  function startEdit(block) {
    setEditingId(block.id);
    setDraftContent(block.content);
  }

  async function saveEdit(blockId) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/shops/${shopId}/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draftContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Speichern fehlgeschlagen.');
        return;
      }
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? data.block : b)));
      setEditingId(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteBlock(blockId) {
    setBusy(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/blocks/${blockId}`, { method: 'DELETE' });
      if (res.ok) {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function addBlock(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType, content: newContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Block konnte nicht hinzugefügt werden.');
        return;
      }
      setBlocks((prev) => [...prev, data.block]);
      setNewContent({});
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="builder">
      <div className="builder-sidebar">
        {error && <div className="form-error">{error}</div>}

        {blocks.length === 0 ? (
          <div className="empty-state">
            Noch keine Inhalte. Ohne eigene Blöcke zeigt deine Storefront automatisch die Produktübersicht.
          </div>
        ) : (
          <div className="product-list">
            {blocks.map((block, index) => (
              <div key={block.id} className="product-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <strong>{blockLabel(block.type)}</strong>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" disabled={index === 0 || busy} onClick={() => moveBlock(index, -1)}>↑</button>
                    <button className="btn" disabled={index === blocks.length - 1 || busy} onClick={() => moveBlock(index, 1)}>↓</button>
                    {editingId === block.id ? (
                      <>
                        <button className="btn btn-primary" disabled={busy} onClick={() => saveEdit(block.id)}>Speichern</button>
                        <button className="btn" disabled={busy} onClick={() => setEditingId(null)}>Abbrechen</button>
                      </>
                    ) : (
                      block.type !== 'products' && (
                        <button className="btn" disabled={busy} onClick={() => startEdit(block)}>Bearbeiten</button>
                      )
                    )}
                    <button className="btn btn-danger" disabled={busy} onClick={() => deleteBlock(block.id)}>Löschen</button>
                  </div>
                </div>
                {editingId === block.id ? (
                  <div style={{ marginTop: 12 }}>
                    <BlockFields type={block.type} content={draftContent} onChange={setDraftContent} />
                  </div>
                ) : (
                  block.type !== 'products' && (
                    <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                      {block.type === 'image' ? block.content.url : block.content.text}
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Block hinzufügen</h2>
          <form onSubmit={addBlock}>
            <div className="field">
              <label>Typ</label>
              <select
                value={newType}
                onChange={(e) => {
                  setNewType(e.target.value);
                  setNewContent({});
                }}
              >
                {BLOCK_TYPES.map((bt) => (
                  <option key={bt.type} value={bt.type}>{bt.label}</option>
                ))}
              </select>
            </div>
            <BlockFields type={newType} content={newContent} onChange={setNewContent} />
            <button className="btn btn-primary" type="submit" disabled={busy}>Hinzufügen</button>
          </form>
        </div>
      </div>

      <div className="builder-preview">
        <div className="preview-toolbar">
          <button
            className={device === 'desktop' ? 'device-btn active' : 'device-btn'}
            onClick={() => setDevice('desktop')}
          >
            🖥 Desktop
          </button>
          <button
            className={device === 'mobile' ? 'device-btn active' : 'device-btn'}
            onClick={() => setDevice('mobile')}
          >
            📱 Mobile
          </button>
        </div>
        <div className={device === 'mobile' ? 'preview-frame is-mobile' : 'preview-frame'}>
          <div className="preview-scroll">
            <StorefrontBody shopName={shopName} tagline={shopTagline} blocks={previewBlocks} products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
