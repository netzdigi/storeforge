import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request, { params }) {
  const { shopId } = await params;
  if (!/^\d+$/.test(shopId)) return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });

  const [shop] = await sql`SELECT id FROM shops WHERE id = ${shopId}`;
  if (!shop) return NextResponse.json({ error: 'Shop nicht gefunden.' }, { status: 404 });

  const { productId, name, email, quantity } = await request.json();
  const qty = Number.parseInt(quantity, 10);
  if (!name || !email || !EMAIL_RE.test(email) || !Number.isInteger(qty) || qty < 1 || qty > 100) {
    return NextResponse.json(
      { error: 'Bitte Name, eine gültige E-Mail und eine Menge zwischen 1 und 100 angeben.' },
      { status: 400 }
    );
  }

  const [product] = await sql`
    SELECT id, name, price_cents FROM products WHERE id = ${productId} AND shop_id = ${shop.id}
  `;
  if (!product) return NextResponse.json({ error: 'Produkt nicht gefunden.' }, { status: 404 });

  const totalCents = product.price_cents * qty;
  await sql`
    INSERT INTO orders (shop_id, product_id, product_name, customer_name, customer_email, quantity, total_cents)
    VALUES (
      ${shop.id}, ${product.id}, ${product.name},
      ${String(name).slice(0, 200)}, ${String(email).slice(0, 200)},
      ${qty}, ${totalCents}
    )
  `;

  return NextResponse.json({ ok: true }, { status: 201 });
}
