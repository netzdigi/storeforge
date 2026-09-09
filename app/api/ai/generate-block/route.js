import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { callClaude } from '@/lib/ai';
import { sanitizeBlockContent } from '@/lib/blockTypes';

const VALID_TYPES = [
  'heading', 'text', 'image', 'hero', 'button', 'gallery', 'features',
  'countdown', 'stats', 'pricing', 'before_after', 'testimonials', 'faq',
  'social', 'contact', 'newsletter',
];

const SCHEMA = `
- heading: {"text": string}
- text: {"text": string}
- image: {"url": "", "alt": string}
- hero: {"heading": string, "subtext": string, "imageUrl": "", "buttonLabel": string, "buttonUrl": string}
- button: {"label": string, "url": string}
- gallery: {"images": [{"url": "", "alt": string}, ...]}
- features: {"items": [{"icon": string (ein passendes Emoji), "title": string, "text": string}, ... 3-4 Einträge]}
- countdown: {"heading": string, "deadline": "", "buttonLabel": string, "buttonUrl": string}
- stats: {"items": [{"value": string, "label": string}, ... 2-4 Einträge]}
- pricing: {"plans": [{"name": string, "price": string, "period": string, "features": string (Zeilen mit \\n getrennt), "buttonLabel": string, "buttonUrl": string, "highlighted": boolean}, ... 2-3 Pläne]}
- before_after: {"beforeUrl": "", "afterUrl": "", "beforeLabel": string, "afterLabel": string}
- testimonials: {"items": [{"quote": string, "author": string, "role": string}, ... 2-3 Einträge]}
- faq: {"items": [{"question": string, "answer": string}, ... 3-5 Einträge]}
- social: {"links": [{"platform": string, "url": string}, ...]}
- contact: {"heading": string, "buttonLabel": string}
- newsletter: {"heading": string, "buttonLabel": string}
`.trim();

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { prompt, shopName, shopTagline, projectType } = await request.json();
  if (!prompt || !String(prompt).trim()) {
    return NextResponse.json({ error: 'Bitte beschreibe, was der Block enthalten soll.' }, { status: 400 });
  }

  const system = `Du hilfst beim Erstellen von Website-Bausteinen für "${shopName}"${shopTagline ? ` (${shopTagline})` : ''}, ${projectType === 'shop' ? 'einen Online-Shop' : 'eine Webseite'}.
Wähle GENAU EINEN Blocktyp aus dieser Liste und erzeuge dafür passenden, konkreten Inhalt in Bezug auf die Nutzeranfrage (keine Platzhaltertexte wie "Lorem Ipsum" oder "[Name einfügen]"):
${SCHEMA}
Bild-URLs (url, imageUrl, beforeUrl, afterUrl) immer als leeren String "" zurückgeben, da noch keine Bilder existieren.
Antworte AUSSCHLIESSLICH mit einem einzigen JSON-Objekt der Form {"type": "<blocktyp>", "content": {...}}, ohne Markdown-Codeblock, ohne Erklärung davor oder danach.`;

  try {
    const raw = await callClaude({
      system,
      messages: [{ role: 'user', content: String(prompt).slice(0, 1000) }],
      maxTokens: 1200,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Keine gültige Antwort erhalten.');
    const parsed = JSON.parse(jsonMatch[0]);

    if (!VALID_TYPES.includes(parsed.type)) {
      throw new Error('Unbekannter Blocktyp.');
    }

    const content = sanitizeBlockContent(parsed.type, parsed.content);
    return NextResponse.json({ type: parsed.type, content });
  } catch (err) {
    return NextResponse.json(
      { error: 'KI-Generierung fehlgeschlagen. Ist ANTHROPIC_API_KEY gesetzt?' },
      { status: 502 }
    );
  }
}
