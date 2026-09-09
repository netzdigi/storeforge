export const BLOCK_TYPES = [
  { type: 'heading', label: 'Überschrift' },
  { type: 'text', label: 'Textabsatz' },
  { type: 'image', label: 'Bild' },
  { type: 'hero', label: 'Hero-Bereich' },
  { type: 'button', label: 'Button / Call-to-Action' },
  { type: 'gallery', label: 'Bildergalerie' },
  { type: 'features', label: 'Feature-Grid' },
  { type: 'countdown', label: 'Countdown-Timer' },
  { type: 'stats', label: 'Kennzahlen-Leiste' },
  { type: 'pricing', label: 'Preistabelle' },
  { type: 'before_after', label: 'Vorher-Nachher' },
  { type: 'sticky_cta', label: 'Sticky-CTA-Leiste' },
  { type: 'testimonials', label: 'Testimonials' },
  { type: 'faq', label: 'FAQ' },
  { type: 'social', label: 'Social-Media-Links' },
  { type: 'contact', label: 'Kontaktformular' },
  { type: 'newsletter', label: 'Newsletter-Anmeldung' },
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
  if (type === 'countdown') {
    return {
      heading: clampText(content?.heading, 200),
      deadline: clampText(content?.deadline, 40),
      buttonLabel: clampText(content?.buttonLabel, 60),
      buttonUrl: clampText(content?.buttonUrl, 2000),
    };
  }
  if (type === 'stats') {
    const items = Array.isArray(content?.items) ? content.items : [];
    return {
      items: items.slice(0, 6).map((item) => ({
        value: clampText(item?.value, 20),
        label: clampText(item?.label, 60),
      })),
    };
  }
  if (type === 'pricing') {
    const plans = Array.isArray(content?.plans) ? content.plans : [];
    return {
      plans: plans.slice(0, 4).map((plan) => ({
        name: clampText(plan?.name, 60),
        price: clampText(plan?.price, 30),
        period: clampText(plan?.period, 30),
        features: clampText(plan?.features, 1000),
        buttonLabel: clampText(plan?.buttonLabel, 60),
        buttonUrl: clampText(plan?.buttonUrl, 2000),
        highlighted: Boolean(plan?.highlighted),
      })),
    };
  }
  if (type === 'before_after') {
    return {
      beforeUrl: clampText(content?.beforeUrl, 2000),
      afterUrl: clampText(content?.afterUrl, 2000),
      beforeLabel: clampText(content?.beforeLabel, 40) || 'Vorher',
      afterLabel: clampText(content?.afterLabel, 40) || 'Nachher',
    };
  }
  if (type === 'sticky_cta') {
    return {
      text: clampText(content?.text, 200),
      buttonLabel: clampText(content?.buttonLabel, 60) || 'Jetzt sichern',
      buttonUrl: clampText(content?.buttonUrl, 2000),
    };
  }
  if (type === 'testimonials') {
    const items = Array.isArray(content?.items) ? content.items : [];
    return {
      items: items.slice(0, 12).map((item) => ({
        quote: clampText(item?.quote, 500),
        author: clampText(item?.author, 100),
        role: clampText(item?.role, 100),
      })),
    };
  }
  if (type === 'faq') {
    const items = Array.isArray(content?.items) ? content.items : [];
    return {
      items: items.slice(0, 20).map((item) => ({
        question: clampText(item?.question, 200),
        answer: clampText(item?.answer, 1000),
      })),
    };
  }
  if (type === 'social') {
    const links = Array.isArray(content?.links) ? content.links : [];
    return {
      links: links.slice(0, 10).map((link) => ({
        platform: clampText(link?.platform, 40),
        url: clampText(link?.url, 2000),
      })),
    };
  }
  if (type === 'contact') {
    return {
      heading: clampText(content?.heading, 200) || 'Kontaktiere uns',
      buttonLabel: clampText(content?.buttonLabel, 60) || 'Nachricht senden',
    };
  }
  if (type === 'newsletter') {
    return {
      heading: clampText(content?.heading, 200) || 'Bleib auf dem Laufenden',
      buttonLabel: clampText(content?.buttonLabel, 60) || 'Anmelden',
    };
  }
  return {};
}
