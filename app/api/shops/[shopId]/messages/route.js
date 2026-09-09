import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  if (!/^\d+$/.test(shopId)) return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });

  const [shop] = await sql`SELECT id FROM shops WHERE id = ${shopId} AND user_id = ${user.id}`;
  if (!shop) return NextResponse.json({ error: 'Projekt nicht gefunden.' }, { status: 404 });

  const messages = await sql`
    SELECT id, name, email, message, created_at FROM messages
    WHERE shop_id = ${shop.id} ORDER BY created_at DESC LIMIT 100
  `;
  return NextResponse.json({ messages });
}

export async function POST(request, { params }) {
  const { shopId } = await params;
  if (!/^\d+$/.test(shopId)) return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });

  const [shop] = await sql`SELECT id FROM shops WHERE id = ${shopId}`;
  if (!shop) return NextResponse.json({ error: 'Projekt nicht gefunden.' }, { status: 404 });

  const { name, email, message } = await request.json();
  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json({ error: 'Bitte Name, eine gültige E-Mail und eine Nachricht angeben.' }, { status: 400 });
  }

  await sql`
    INSERT INTO messages (shop_id, name, email, message)
    VALUES (${shop.id}, ${String(name).slice(0, 200)}, ${String(email).slice(0, 200)}, ${String(message).slice(0, 4000)})
  `;

  return NextResponse.json({ ok: true }, { status: 201 });
}
