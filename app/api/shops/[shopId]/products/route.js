import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

async function getOwnedShop(shopId, userId) {
  if (!/^\d+$/.test(shopId)) return null;
  const [shop] = await sql`SELECT id FROM shops WHERE id = ${shopId} AND user_id = ${userId}`;
  return shop;
}

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Shop nicht gefunden.' }, { status: 404 });

  const products = await sql`
    SELECT id, name, description, price_cents, image_url, created_at FROM products
    WHERE shop_id = ${shop.id} ORDER BY created_at DESC
  `;
  return NextResponse.json({ products });
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Shop nicht gefunden.' }, { status: 404 });

  const { name, description, priceCents, imageUrl } = await request.json();
  if (!name || !Number.isInteger(priceCents) || priceCents < 0) {
    return NextResponse.json(
      { error: 'Name und ein gültiger Preis (in Cent) sind erforderlich.' },
      { status: 400 }
    );
  }

  const [product] = await sql`
    INSERT INTO products (shop_id, name, description, price_cents, image_url)
    VALUES (${shop.id}, ${name}, ${description || null}, ${priceCents}, ${imageUrl || null})
    RETURNING id, name, description, price_cents, image_url, created_at
  `;
  return NextResponse.json({ product }, { status: 201 });
}
