import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getOwnedShop } from '@/lib/shops';

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId, pageId } = await params;
  if (!/^\d+$/.test(pageId)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Projekt nicht gefunden.' }, { status: 404 });

  const [page] = await sql`SELECT id, is_home FROM pages WHERE id = ${pageId} AND shop_id = ${shop.id}`;
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 });
  if (page.is_home) {
    return NextResponse.json({ error: 'Die Startseite kann nicht gelöscht werden.' }, { status: 400 });
  }

  await sql`DELETE FROM pages WHERE id = ${page.id}`;
  return NextResponse.json({ ok: true });
}
