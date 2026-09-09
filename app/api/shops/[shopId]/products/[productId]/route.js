import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId, productId } = await params;
  if (!/^\d+$/.test(shopId) || !/^\d+$/.test(productId)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const [shop] = await sql`SELECT id FROM shops WHERE id = ${shopId} AND user_id = ${user.id}`;
  if (!shop) return NextResponse.json({ error: 'Shop nicht gefunden.' }, { status: 404 });

  await sql`DELETE FROM products WHERE id = ${productId} AND shop_id = ${shop.id}`;
  return NextResponse.json({ ok: true });
}
