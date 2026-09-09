import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getOwnedPage } from '@/lib/pages';
import { sanitizeBlockContent } from '@/lib/blockTypes';

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { pageId, blockId } = await params;
  if (!/^\d+$/.test(blockId)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const page = await getOwnedPage(pageId, user.id);
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 });

  const [existing] = await sql`SELECT id, type FROM blocks WHERE id = ${blockId} AND page_id = ${page.id}`;
  if (!existing) return NextResponse.json({ error: 'Block nicht gefunden.' }, { status: 404 });

  const { content } = await request.json();
  const [block] = await sql`
    UPDATE blocks SET content = ${JSON.stringify(sanitizeBlockContent(existing.type, content))}::jsonb
    WHERE id = ${existing.id}
    RETURNING id, type, content, position
  `;
  return NextResponse.json({ block });
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { pageId, blockId } = await params;
  if (!/^\d+$/.test(blockId)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const page = await getOwnedPage(pageId, user.id);
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 });

  await sql`DELETE FROM blocks WHERE id = ${blockId} AND page_id = ${page.id}`;
  return NextResponse.json({ ok: true });
}
