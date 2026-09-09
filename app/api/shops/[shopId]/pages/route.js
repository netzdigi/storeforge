import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getOwnedShop } from '@/lib/shops';

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Projekt nicht gefunden.' }, { status: 404 });

  const pages = await sql`
    SELECT id, title, slug, is_home, position FROM pages
    WHERE shop_id = ${shop.id} ORDER BY position ASC
  `;
  return NextResponse.json({ pages });
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Projekt nicht gefunden.' }, { status: 404 });

  const { title, slug } = await request.json();
  if (!title || !slug || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'Titel und eine gültige URL-Kennung (Kleinbuchstaben, Zahlen, Bindestriche) sind erforderlich.' },
      { status: 400 }
    );
  }

  const existing = await sql`SELECT id FROM pages WHERE shop_id = ${shop.id} AND slug = ${slug}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Diese URL-Kennung ist auf diesem Projekt schon vergeben.' }, { status: 409 });
  }

  const [{ next_position }] = await sql`
    SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM pages WHERE shop_id = ${shop.id}
  `;

  const [page] = await sql`
    INSERT INTO pages (shop_id, title, slug, is_home, position)
    VALUES (${shop.id}, ${title}, ${slug}, false, ${next_position})
    RETURNING id, title, slug, is_home, position
  `;

  return NextResponse.json({ page }, { status: 201 });
}
