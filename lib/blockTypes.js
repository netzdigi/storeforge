export const BLOCK_TYPES = [
  { type: 'heading', label: 'Überschrift' },
  { type: 'text', label: 'Textabsatz' },
  { type: 'image', label: 'Bild' },
  { type: 'hero', label: 'Hero-Bereich' },
  { type: 'button', label: 'Button / Call-to-Action' },
  { type: 'gallery', label: 'Bildergalerie' },
  { type: 'features', label: 'Feature-Grid' },
  { type: 'products', label: 'Produktübersicht', shopOnly: true },
];

function clampText(value, max) {
  return String(value || '').slice(0, max);
}

export function sanitizeBlockContent(type, content) {
  if (type === 'heading' || type === 'text') {
    return { text: clampText(content?.text, 2000) };
  }
  if (type === 'image') {
    return {
      url: clampText(content?.url, 2000),
      alt: clampText(content?.alt, 200),
    };
  }
  if (type === 'hero') {
    return {
      heading: clampText(content?.heading, 200),
      subtext: clampText(content?.subtext, 500),
      imageUrl: clampText(content?.imageUrl, 2000),
      buttonLabel: clampText(content?.buttonLabel, 60),
      buttonUrl: clampText(content?.buttonUrl, 2000),
    };
  }
  if (type === 'button') {
    return {
      label: clampText(content?.label, 60),
      url: clampText(content?.url, 2000),
    };
  }
  if (type === 'gallery') {
    const images = Array.isArray(content?.images) ? content.images : [];
    return {
      images: images.slice(0, 20).map((img) => ({
        url: clampText(img?.url, 2000),
        alt: clampText(img?.alt, 200),
      })),
    };
  }
  if (type === 'features') {
    const items = Array.isArray(content?.items) ? content.items : [];
    return {
      items: items.slice(0, 12).map((item) => ({
        icon: clampText(item?.icon, 8),
        title: clampText(item?.title, 100),
        text: clampText(item?.text, 300),
      })),
    };
  }
  return {};
}
