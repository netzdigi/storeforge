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

  const subscribers = await sql`
    SELECT id, email, created_at FROM subscribers
    WHERE shop_id = ${shop.id} ORDER BY created_at DESC LIMIT 500
  `;
  return NextResponse.json({ subscribers });
}

export async function POST(request, { params }) {
  const { shopId } = await params;
  if (!/^\d+$/.test(shopId)) return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });

  const [shop] = await sql`SELECT id FROM shops WHERE id = ${shopId}`;
  if (!shop) return NextResponse.json({ error: 'Projekt nicht gefunden.' }, { status: 404 });

  const { email } = await request.json();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 });
  }

  await sql`
    INSERT INTO subscribers (shop_id, email)
    VALUES (${shop.id}, ${String(email).slice(0, 200).toLowerCase()})
    ON CONFLICT (shop_id, email) DO NOTHING
  `;

  return NextResponse.json({ ok: true }, { status: 201 });
}
