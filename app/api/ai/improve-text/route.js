import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { callClaude } from '@/lib/ai';

const KIND_HINTS = {
  heading: 'eine kurze, prägnante Überschrift',
  paragraph: 'einen Fließtext-Absatz',
  quote: 'ein Kunden-Zitat/Testimonial',
  answer: 'die Antwort auf eine FAQ-Frage',
};

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { text, kind } = await request.json();
  if (!text || !String(text).trim()) {
    return NextResponse.json({ error: 'Kein Text zum Verbessern angegeben.' }, { status: 400 });
  }

  const hint = KIND_HINTS[kind] || 'einen Website-Text';

  try {
    const result = await callClaude({
      system: `Du bist ein erfahrener Werbetexter. Verbessere ${hint} für eine Unternehmens-Website: klarer, überzeugender, natürlicher formuliert. Behalte Sprache und ungefähre Länge bei. Antworte NUR mit dem verbesserten Text, ohne Anführungszeichen, Erklärungen oder Kommentare.`,
      messages: [{ role: 'user', content: String(text).slice(0, 4000) }],
      maxTokens: 600,
    });
    return NextResponse.json({ text: result.trim() });
  } catch (err) {
    return NextResponse.json(
      { error: 'KI-Anfrage fehlgeschlagen. Ist ANTHROPIC_API_KEY gesetzt?' },
      { status: 502 }
    );
  }
}
