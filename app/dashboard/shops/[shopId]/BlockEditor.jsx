'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BLOCK_TYPES } from '@/lib/blockTypes';
import { StorefrontBody } from '@/components/StoreBlocks';

const TYPE_ICON = {
  heading: '🔠',
  text: '📄',
  image: '🖼️',
  products: '🛍️',
};

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
  return <p style={{ color: 'var(--text-muted)' }}>Zeigt die Produktübersicht deines Shops. Keine Einstellungen nötig.</p>;
}

export default function BlockEditor({ shopId, initialBlocks, shopName, shopTagline, products }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedId, setSelectedId] = useState(initialBlocks[0]?.id ?? null);
  const [draftContent, setDraftContent] = useState(initialBlocks[0]?.content ?? {});
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState('heading');
  const [newContent, setNewContent] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [device, setDevice] = useState('desktop');

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;

  const previewBlocks = useMemo(
    () => blocks.map((b) => (b.id === selectedId && !adding ? { ...b, content: draftContent } : b)),
    [blocks, selectedId, draftContent, adding]
  );

  function selectBlock(block) {
    setAdding(false);
    setSelectedId(block.id);
    setDraftContent(block.content);
    setError('');
  }

  function startAdd() {
    setAdding(true);
    setSelectedId(null);
    setNewType('heading');
    setNewContent({});
    setError('');
  }

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
        if (selectedId === blockId) setSelectedId(null);
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
      setAdding(false);
      setSelectedId(data.block.id);
      setDraftContent(data.block.content);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="builder3">
      <div className="builder-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <strong style={{ fontSize: '.92rem' }}>{shopName}</strong>
          <span className="save-status"><span className="dot"></span>Automatisch gespeichert</span>
        </div>
        <div className="device-toggle-icons">
          <button
            className={device === 'desktop' ? 'icon-btn active' : 'icon-btn'}
            onClick={() => setDevice('desktop')}
            title="Desktop-Ansicht"
          >
            🖥
          </button>
          <button
            className={device === 'mobile' ? 'icon-btn active' : 'icon-btn'}
            onClick={() => setDevice('mobile')}
            title="Mobile-Ansicht"
          >
            📱
          </button>
        </div>
      </div>

      <div className="builder-tree">
        {blocks.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', padding: '4px 6px 12px' }}>
            Noch keine Blöcke. Ohne eigene Blöcke zeigt deine Storefront automatisch die Produktübersicht.
          </p>
        )}
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={selectedId === block.id && !adding ? 'tree-row active' : 'tree-row'}
            onClick={() => selectBlock(block)}
          >
            <span className="tree-label">
              <span>{TYPE_ICON[block.type]}</span>
              {blockLabel(block.type)}
            </span>
            <span className="tree-actions" onClick={(e) => e.stopPropagation()}>
              <button className="tree-action-btn" disabled={index === 0 || busy} onClick={() => moveBlock(index, -1)}>↑</button>
              <button className="tree-action-btn" disabled={index === blocks.length - 1 || busy} onClick={() => moveBlock(index, 1)}>↓</button>
            </span>
          </div>
        ))}
        <div className="tree-add" onClick={startAdd}>+ Block hinzufügen</div>
      </div>

      <div className="builder-center">
        <div className={device === 'mobile' ? 'preview-frame is-mobile' : 'preview-frame'}>
          <div className="preview-scroll">
            <StorefrontBody shopName={shopName} tagline={shopTagline} blocks={previewBlocks} products={products} />
          </div>
        </div>
      </div>

      <div className="builder-panel">
        {error && <div className="form-error">{error}</div>}

        {adding ? (
          <>
            <h3 style={{ marginTop: 0 }}>Block hinzufügen</h3>
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={busy}>Hinzufügen</button>
                <button className="btn" type="button" disabled={busy} onClick={() => setAdding(false)}>Abbrechen</button>
              </div>
            </form>
          </>
        ) : selectedBlock ? (
          <>
            <h3 style={{ marginTop: 0 }}>{blockLabel(selectedBlock.type)}</h3>
            <BlockFields type={selectedBlock.type} content={draftContent} onChange={setDraftContent} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectedBlock.type !== 'products' && (
                <button className="btn btn-primary" disabled={busy} onClick={() => saveEdit(selectedBlock.id)}>Speichern</button>
              )}
              <button className="btn btn-danger" disabled={busy} onClick={() => deleteBlock(selectedBlock.id)}>Löschen</button>
            </div>
          </>
        ) : (
          <p className="builder-panel-empty">Wähle links einen Block aus, um ihn zu bearbeiten.</p>
        )}
      </div>
    </div>
  );
}
