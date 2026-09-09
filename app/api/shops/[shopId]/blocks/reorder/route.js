import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getOwnedShop } from '@/lib/shops';

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Shop nicht gefunden.' }, { status: 404 });

  const { order } = await request.json();
  if (!Array.isArray(order) || order.some((id) => !Number.isInteger(id))) {
    return NextResponse.json({ error: 'Ungültige Reihenfolge.' }, { status: 400 });
  }

  const owned = await sql`SELECT id FROM blocks WHERE shop_id = ${shop.id}`;
  const ownedIds = new Set(owned.map((b) => b.id));
  if (order.length !== ownedIds.size || order.some((id) => !ownedIds.has(id))) {
    return NextResponse.json({ error: 'Reihenfolge stimmt nicht mit den Blöcken überein.' }, { status: 400 });
  }

  await Promise.all(
    order.map((id, index) => sql`UPDATE blocks SET position = ${index} WHERE id = ${id} AND shop_id = ${shop.id}`)
  );

  return NextResponse.json({ ok: true });
}
