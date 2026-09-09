import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getOwnedPage } from '@/lib/pages';
import { BLOCK_TYPES, sanitizeBlockContent } from '@/lib/blockTypes';

const VALID_TYPES = BLOCK_TYPES.map((b) => b.type);

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { pageId } = await params;
  const page = await getOwnedPage(pageId, user.id);
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 });

  const blocks = await sql`
    SELECT id, type, content, position FROM blocks
    WHERE page_id = ${page.id} ORDER BY position ASC
  `;
  return NextResponse.json({ blocks });
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { pageId } = await params;
  const page = await getOwnedPage(pageId, user.id);
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 });

  const { type, content } = await request.json();
  const typeDef = BLOCK_TYPES.find((b) => b.type === type);
  if (!typeDef) {
    return NextResponse.json({ error: 'Ungültiger Block-Typ.' }, { status: 400 });
  }
  if (typeDef.shopOnly && page.shop_type !== 'shop') {
    return NextResponse.json({ error: 'Dieser Block ist nur für Online-Shops verfügbar.' }, { status: 400 });
  }

  const [{ next_position }] = await sql`
    SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM blocks WHERE page_id = ${page.id}
  `;

  const [block] = await sql`
    INSERT INTO blocks (page_id, type, content, position)
    VALUES (
      ${page.id},
      ${type},
      ${JSON.stringify(sanitizeBlockContent(type, content))}::jsonb,
      ${next_position}
    )
    RETURNING id, type, content, position
  `;
  return NextResponse.json({ block }, { status: 201 });
}
