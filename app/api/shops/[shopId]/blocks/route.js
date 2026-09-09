import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getOwnedShop } from '@/lib/shops';
import { BLOCK_TYPES, sanitizeBlockContent } from '@/lib/blockTypes';

const VALID_TYPES = BLOCK_TYPES.map((b) => b.type);

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Shop nicht gefunden.' }, { status: 404 });

  const blocks = await sql`
    SELECT id, type, content, position FROM blocks
    WHERE shop_id = ${shop.id} ORDER BY position ASC
  `;
  return NextResponse.json({ blocks });
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { shopId } = await params;
  const shop = await getOwnedShop(shopId, user.id);
  if (!shop) return NextResponse.json({ error: 'Shop nicht gefunden.' }, { status: 404 });

  const { type, content } = await request.json();
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Ungültiger Block-Typ.' }, { status: 400 });
  }

  const [{ next_position }] = await sql`
    SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM blocks WHERE shop_id = ${shop.id}
  `;

  const [block] = await sql`
    INSERT INTO blocks (shop_id, type, content, position)
    VALUES (
      ${shop.id},
      ${type},
      ${JSON.stringify(sanitizeBlockContent(type, content))}::jsonb,
      ${next_position}
    )
    RETURNING id, type, content, position
  `;
  return NextResponse.json({ block }, { status: 201 });
}
