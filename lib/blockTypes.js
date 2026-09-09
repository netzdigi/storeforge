export const BLOCK_TYPES = [
  { type: 'heading', label: 'Überschrift' },
  { type: 'text', label: 'Textabsatz' },
  { type: 'image', label: 'Bild' },
  { type: 'products', label: 'Produktübersicht' },
];

export function sanitizeBlockContent(type, content) {
  if (type === 'heading' || type === 'text') {
    return { text: String(content?.text || '').slice(0, 2000) };
  }
  if (type === 'image') {
    return {
      url: String(content?.url || '').slice(0, 2000),
      alt: String(content?.alt || '').slice(0, 200),
    };
  }
  return {};
}
