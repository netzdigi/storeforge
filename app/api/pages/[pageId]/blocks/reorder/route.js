import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getOwnedPage } from '@/lib/pages';

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { pageId } = await params;
  const page = await getOwnedPage(pageId, user.id);
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 });

  const { order } = await request.json();
  if (!Array.isArray(order) || order.some((id) => !Number.isInteger(id))) {
    return NextResponse.json({ error: 'Ungültige Reihenfolge.' }, { status: 400 });
  }

  const owned = await sql`SELECT id FROM blocks WHERE page_id = ${page.id}`;
  const ownedIds = new Set(owned.map((b) => b.id));
  if (order.length !== ownedIds.size || order.some((id) => !ownedIds.has(id))) {
    return NextResponse.json({ error: 'Reihenfolge stimmt nicht mit den Blöcken überein.' }, { status: 400 });
  }

  await Promise.all(
    order.map((id, index) => sql`UPDATE blocks SET position = ${index} WHERE id = ${id} AND page_id = ${page.id}`)
  );

  return NextResponse.json({ ok: true });
}
