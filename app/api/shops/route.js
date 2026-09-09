import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;
const PROJECT_TYPES = ['shop', 'website'];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const shops = await sql`
    SELECT id, name, slug, tagline, type, created_at FROM shops
    WHERE user_id = ${user.id} ORDER BY created_at DESC
  `;
  return NextResponse.json({ shops });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { name, slug, tagline, type } = await request.json();
  if (!name || !slug || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'Name und eine gültige URL-Kennung (Kleinbuchstaben, Zahlen, Bindestriche) sind erforderlich.' },
      { status: 400 }
    );
  }
  if (!PROJECT_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Bitte wähle einen Projekttyp aus.' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM shops WHERE slug = ${slug}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Diese URL-Kennung ist bereits vergeben.' }, { status: 409 });
  }

  const [shop] = await sql`
    INSERT INTO shops (user_id, name, slug, tagline, type)
    VALUES (${user.id}, ${name}, ${slug}, ${tagline || null}, ${type})
    RETURNING id, name, slug, tagline, type, created_at
  `;

  await sql`
    INSERT INTO pages (shop_id, title, slug, is_home, position)
    VALUES (${shop.id}, 'Start', '', true, 0)
  `;

  return NextResponse.json({ shop }, { status: 201 });
}
