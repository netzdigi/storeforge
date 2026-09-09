'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BLOCK_TYPES } from '@/lib/blockTypes';
import { StorefrontBody } from '@/components/StoreBlocks';

const TYPE_ICON = {
  heading: '🔠',
  text: '📄',
  image: '🖼️',
  hero: '🎯',
  button: '🔘',
  gallery: '🖼️',
  features: '▦',
  countdown: '⏰',
  stats: '📊',
  pricing: '💳',
  before_after: '🔀',
  sticky_cta: '📌',
  testimonials: '💬',
  faq: '❓',
  social: '🔗',
  contact: '✉️',
  newsletter: '📬',
  products: '🛍️',
};

function blockLabel(type) {
  return BLOCK_TYPES.find((b) => b.type === type)?.label || type;
}

function RepeatEditor({ items, onChange, addLabel, renderFields, emptyItem, max }) {
  function updateItem(index, next) {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  }
  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }
  function addItem() {
    onChange([...items, emptyItem]);
  }
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="repeat-item">
          <button type="button" className="repeat-remove" onClick={() => removeItem(index)}>✕</button>
          {renderFields(item, (next) => updateItem(index, next))}
        </div>
      ))}
      {items.length < max && (
        <button type="button" className="repeat-add" onClick={addItem}>{addLabel}</button>
      )}
    </div>
  );
}

function ImproveButton({ value, kind, onImproved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    if (!value || !value.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, kind }),
      });
      const data = await res.json();
      if (res.ok) {
        onImproved(data.text);
      } else {
        setError(data.error || 'Fehlgeschlagen.');
      }
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="ai-btn-wrap">
      <button type="button" className="ai-btn" onClick={handleClick} disabled={busy} title="Mit KI verbessern">
        {busy ? '✨ …' : '✨ Verbessern'}
      </button>
      {error && <span className="ai-btn-error">{error}</span>}
    </span>
  );
}

function FieldLabel({ children, ai }) {
  return (
    <div className="field-label-row">
      <label>{children}</label>
      {ai}
    </div>
  );
}

function BlockFields({ type, content, onChange }) {
  if (type === 'heading') {
    return (
      <div className="field">
        <FieldLabel ai={<ImproveButton value={content.text} kind="heading" onImproved={(t) => onChange({ text: t })} />}>
          Text
        </FieldLabel>
        <input value={content.text || ''} onChange={(e) => onChange({ text: e.target.value })} />
      </div>
    );
  }
  if (type === 'text') {
    return (
      <div className="field">
        <FieldLabel ai={<ImproveButton value={content.text} kind="paragraph" onImproved={(t) => onChange({ text: t })} />}>
          Text
        </FieldLabel>
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
  if (type === 'hero') {
    return (
      <>
        <div className="field">
          <FieldLabel ai={<ImproveButton value={content.heading} kind="heading" onImproved={(t) => onChange({ ...content, heading: t })} />}>
            Überschrift
          </FieldLabel>
          <input value={content.heading || ''} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
        </div>
        <div className="field">
          <FieldLabel ai={<ImproveButton value={content.subtext} kind="paragraph" onImproved={(t) => onChange({ ...content, subtext: t })} />}>
            Untertext
          </FieldLabel>
          <textarea value={content.subtext || ''} onChange={(e) => onChange({ ...content, subtext: e.target.value })} />
        </div>
        <div className="field">
          <label>Bild-URL (optional)</label>
          <input value={content.imageUrl || ''} onChange={(e) => onChange({ ...content, imageUrl: e.target.value })} />
        </div>
        <div className="field">
          <label>Button-Text (optional)</label>
          <input value={content.buttonLabel || ''} onChange={(e) => onChange({ ...content, buttonLabel: e.target.value })} />
        </div>
        <div className="field">
          <label>Button-Link (optional)</label>
          <input value={content.buttonUrl || ''} onChange={(e) => onChange({ ...content, buttonUrl: e.target.value })} />
        </div>
      </>
    );
  }
  if (type === 'button') {
    return (
      <>
        <div className="field">
          <label>Button-Text</label>
          <input value={content.label || ''} onChange={(e) => onChange({ ...content, label: e.target.value })} />
        </div>
        <div className="field">
          <label>Link (URL)</label>
          <input value={content.url || ''} onChange={(e) => onChange({ ...content, url: e.target.value })} />
        </div>
      </>
    );
  }
  if (type === 'gallery') {
    const images = content.images || [];
    return (
      <div className="field">
        <label>Bilder</label>
        <RepeatEditor
          items={images}
          onChange={(images) => onChange({ images })}
          addLabel="+ Bild hinzufügen"
          emptyItem={{ url: '', alt: '' }}
          max={20}
          renderFields={(img, update) => (
            <>
              <div className="field">
                <label>Bild-URL</label>
                <input value={img.url || ''} onChange={(e) => update({ ...img, url: e.target.value })} />
              </div>
              <div className="field">
                <label>Alt-Text</label>
                <input value={img.alt || ''} onChange={(e) => update({ ...img, alt: e.target.value })} />
              </div>
            </>
          )}
        />
      </div>
    );
  }
  if (type === 'features') {
    const items = content.items || [];
    return (
      <div className="field">
        <label>Merkmale</label>
        <RepeatEditor
          items={items}
          onChange={(items) => onChange({ items })}
          addLabel="+ Merkmal hinzufügen"
          emptyItem={{ icon: '', title: '', text: '' }}
          max={12}
          renderFields={(item, update) => (
            <>
              <div className="field">
                <label>Icon (Emoji, optional)</label>
                <input value={item.icon || ''} onChange={(e) => update({ ...item, icon: e.target.value })} />
              </div>
              <div className="field">
                <label>Titel</label>
                <input value={item.title || ''} onChange={(e) => update({ ...item, title: e.target.value })} />
              </div>
              <div className="field">
                <label>Text</label>
                <textarea value={item.text || ''} onChange={(e) => update({ ...item, text: e.target.value })} />
              </div>
            </>
          )}
        />
      </div>
    );
  }
  if (type === 'countdown') {
    return (
      <>
        <div className="field">
          <label>Überschrift (optional)</label>
          <input value={content.heading || ''} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
        </div>
        <div className="field">
          <label>Ablaufdatum &amp; -zeit</label>
          <input
            type="datetime-local"
            value={content.deadline || ''}
            onChange={(e) => onChange({ ...content, deadline: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Button-Text (optional)</label>
          <input value={content.buttonLabel || ''} onChange={(e) => onChange({ ...content, buttonLabel: e.target.value })} />
        </div>
        <div className="field">
          <label>Button-Link (optional)</label>
          <input value={content.buttonUrl || ''} onChange={(e) => onChange({ ...content, buttonUrl: e.target.value })} />
        </div>
      </>
    );
  }
  if (type === 'stats') {
    const items = content.items || [];
    return (
      <div className="field">
        <label>Kennzahlen</label>
        <RepeatEditor
          items={items}
          onChange={(items) => onChange({ items })}
          addLabel="+ Kennzahl hinzufügen"
          emptyItem={{ value: '', label: '' }}
          max={6}
          renderFields={(item, update) => (
            <>
              <div className="field">
                <label>Wert (z. B. 500+)</label>
                <input value={item.value || ''} onChange={(e) => update({ ...item, value: e.target.value })} />
              </div>
              <div className="field">
                <label>Beschriftung</label>
                <input value={item.label || ''} onChange={(e) => update({ ...item, label: e.target.value })} />
              </div>
            </>
          )}
        />
      </div>
    );
  }
  if (type === 'pricing') {
    const plans = content.plans || [];
    return (
      <div className="field">
        <label>Preispläne</label>
        <RepeatEditor
          items={plans}
          onChange={(plans) => onChange({ plans })}
          addLabel="+ Plan hinzufügen"
          emptyItem={{ name: '', price: '', period: '', features: '', buttonLabel: '', buttonUrl: '', highlighted: false }}
          max={4}
          renderFields={(plan, update) => (
            <>
              <div className="field">
                <label>Name</label>
                <input value={plan.name || ''} onChange={(e) => update({ ...plan, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Preis (z. B. 29€)</label>
                <input value={plan.price || ''} onChange={(e) => update({ ...plan, price: e.target.value })} />
              </div>
              <div className="field">
                <label>Zeitraum (optional, z. B. /Monat)</label>
                <input value={plan.period || ''} onChange={(e) => update({ ...plan, period: e.target.value })} />
              </div>
              <div className="field">
                <label>Merkmale (eine Zeile pro Merkmal)</label>
                <textarea value={plan.features || ''} onChange={(e) => update({ ...plan, features: e.target.value })} />
              </div>
              <div className="field">
                <label>Button-Text</label>
                <input value={plan.buttonLabel || ''} onChange={(e) => update({ ...plan, buttonLabel: e.target.value })} />
              </div>
              <div className="field">
                <label>Button-Link</label>
                <input value={plan.buttonUrl || ''} onChange={(e) => update({ ...plan, buttonUrl: e.target.value })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={Boolean(plan.highlighted)}
                  onChange={(e) => update({ ...plan, highlighted: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                Als „Beliebt" hervorheben
              </label>
            </>
          )}
        />
      </div>
    );
  }
  if (type === 'before_after') {
    return (
      <>
        <div className="field">
          <label>Bild-URL „Vorher"</label>
          <input value={content.beforeUrl || ''} onChange={(e) => onChange({ ...content, beforeUrl: e.target.value })} />
        </div>
        <div className="field">
          <label>Beschriftung „Vorher"</label>
          <input value={content.beforeLabel || ''} onChange={(e) => onChange({ ...content, beforeLabel: e.target.value })} />
        </div>
        <div className="field">
          <label>Bild-URL „Nachher"</label>
          <input value={content.afterUrl || ''} onChange={(e) => onChange({ ...content, afterUrl: e.target.value })} />
        </div>
        <div className="field">
          <label>Beschriftung „Nachher"</label>
          <input value={content.afterLabel || ''} onChange={(e) => onChange({ ...content, afterLabel: e.target.value })} />
        </div>
      </>
    );
  }
  if (type === 'sticky_cta') {
    return (
      <>
        <div className="field">
          <label>Text (optional)</label>
          <input value={content.text || ''} onChange={(e) => onChange({ ...content, text: e.target.value })} />
        </div>
        <div className="field">
          <label>Button-Text</label>
          <input value={content.buttonLabel || ''} onChange={(e) => onChange({ ...content, buttonLabel: e.target.value })} />
        </div>
        <div className="field">
          <label>Button-Link</label>
          <input value={content.buttonUrl || ''} onChange={(e) => onChange({ ...content, buttonUrl: e.target.value })} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>
          Bleibt beim Scrollen am unteren Bildschirmrand sichtbar.
        </p>
      </>
    );
  }
  if (type === 'testimonials') {
    const items = content.items || [];
    return (
      <div className="field">
        <label>Stimmen</label>
        <RepeatEditor
          items={items}
          onChange={(items) => onChange({ items })}
          addLabel="+ Stimme hinzufügen"
          emptyItem={{ quote: '', author: '', role: '' }}
          max={12}
          renderFields={(item, update) => (
            <>
              <div className="field">
                <FieldLabel ai={<ImproveButton value={item.quote} kind="quote" onImproved={(t) => update({ ...item, quote: t })} />}>
                  Zitat
                </FieldLabel>
                <textarea value={item.quote || ''} onChange={(e) => update({ ...item, quote: e.target.value })} />
              </div>
              <div className="field">
                <label>Name</label>
                <input value={item.author || ''} onChange={(e) => update({ ...item, author: e.target.value })} />
              </div>
              <div className="field">
                <label>Rolle / Firma (optional)</label>
                <input value={item.role || ''} onChange={(e) => update({ ...item, role: e.target.value })} />
              </div>
            </>
          )}
        />
      </div>
    );
  }
  if (type === 'faq') {
    const items = content.items || [];
    return (
      <div className="field">
        <label>Fragen</label>
        <RepeatEditor
          items={items}
          onChange={(items) => onChange({ items })}
          addLabel="+ Frage hinzufügen"
          emptyItem={{ question: '', answer: '' }}
          max={20}
          renderFields={(item, update) => (
            <>
              <div className="field">
                <label>Frage</label>
                <input value={item.question || ''} onChange={(e) => update({ ...item, question: e.target.value })} />
              </div>
              <div className="field">
                <FieldLabel ai={<ImproveButton value={item.answer} kind="answer" onImproved={(t) => update({ ...item, answer: t })} />}>
                  Antwort
                </FieldLabel>
                <textarea value={item.answer || ''} onChange={(e) => update({ ...item, answer: e.target.value })} />
              </div>
            </>
          )}
        />
      </div>
    );
  }
  if (type === 'social') {
    const links = content.links || [];
    return (
      <div className="field">
        <label>Links</label>
        <RepeatEditor
          items={links}
          onChange={(links) => onChange({ links })}
          addLabel="+ Link hinzufügen"
          emptyItem={{ platform: '', url: '' }}
          max={10}
          renderFields={(link, update) => (
            <>
              <div className="field">
                <label>Plattform (z. B. Instagram)</label>
                <input value={link.platform || ''} onChange={(e) => update({ ...link, platform: e.target.value })} />
              </div>
              <div className="field">
                <label>Link (URL)</label>
                <input value={link.url || ''} onChange={(e) => update({ ...link, url: e.target.value })} />
              </div>
            </>
          )}
        />
      </div>
    );
  }
  if (type === 'contact') {
    return (
      <>
        <div className="field">
          <label>Überschrift</label>
          <input value={content.heading || ''} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
        </div>
        <div className="field">
          <label>Button-Text</label>
          <input value={content.buttonLabel || ''} onChange={(e) => onChange({ ...content, buttonLabel: e.target.value })} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>
          Name, E-Mail und Nachricht sind fest vorgegeben. Eingesendete Nachrichten findest du weiter unten im „Posteingang“.
        </p>
      </>
    );
  }
  if (type === 'newsletter') {
    return (
      <>
        <div className="field">
          <label>Überschrift</label>
          <input value={content.heading || ''} onChange={(e) => onChange({ ...content, heading: e.target.value })} />
        </div>
        <div className="field">
          <label>Button-Text</label>
          <input value={content.buttonLabel || ''} onChange={(e) => onChange({ ...content, buttonLabel: e.target.value })} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>
          Angemeldete E-Mails findest du weiter unten im „Posteingang“.
        </p>
      </>
    );
  }
  return <p style={{ color: 'var(--text-muted)' }}>Zeigt die Produktübersicht deines Shops. Keine Einstellungen nötig.</p>;
}

function AIBlockGenerator({ shopName, shopTagline, projectType, onGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/ai/generate-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, shopName, shopTagline, projectType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Generierung fehlgeschlagen.');
        return;
      }
      onGenerated(data.type, data.content);
      setPrompt('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-generator">
      <label>✨ Mit KI erstellen</label>
      {error && <div className="form-error">{error}</div>}
      <textarea
        placeholder="z. B. „Hero-Bereich für unser neues Sommer-Angebot“"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button type="button" className="btn" disabled={busy || !prompt.trim()} onClick={handleGenerate}>
        {busy ? 'Wird generiert…' : 'Generieren'}
      </button>
    </div>
  );
}

export default function BlockEditor({ pageId, initialBlocks, shopId, shopName, shopTagline, shopSlug, pages, currentPageId, products, projectType }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedId, setSelectedId] = useState(initialBlocks[0]?.id ?? null);
  const [draftContent, setDraftContent] = useState(initialBlocks[0]?.content ?? {});
  const [adding, setAdding] = useState(false);
  const availableTypes = useMemo(
    () => BLOCK_TYPES.filter((bt) => !bt.shopOnly || projectType === 'shop'),
    [projectType]
  );
  const [newType, setNewType] = useState(availableTypes[0]?.type ?? 'heading');
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
    setNewType(availableTypes[0]?.type ?? 'heading');
    setNewContent({});
    setError('');
  }

  async function reorder(nextBlocks) {
    setBlocks(nextBlocks);
    await fetch(`/api/pages/${pageId}/blocks/reorder`, {
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
      const res = await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
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
      const res = await fetch(`/api/pages/${pageId}/blocks/${blockId}`, { method: 'DELETE' });
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
      const res = await fetch(`/api/pages/${pageId}/blocks`, {
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
            Noch keine Blöcke. Ohne eigene Blöcke zeigt diese Seite automatisch die Produktübersicht.
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
            <StorefrontBody
              shopId={shopId}
              shopName={shopName}
              tagline={shopTagline}
              shopSlug={shopSlug}
              pages={pages}
              currentPageId={currentPageId}
              blocks={previewBlocks}
              products={products}
            />
          </div>
        </div>
      </div>

      <div className="builder-panel">
        {error && <div className="form-error">{error}</div>}

        {adding ? (
          <>
            <h3 style={{ marginTop: 0 }}>Block hinzufügen</h3>
            <AIBlockGenerator
              shopName={shopName}
              shopTagline={shopTagline}
              projectType={projectType}
              onGenerated={(type, generatedContent) => {
                setNewType(type);
                setNewContent(generatedContent);
              }}
            />
            <div className="ai-divider">oder manuell</div>
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
                  {availableTypes.map((bt) => (
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
