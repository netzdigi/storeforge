import { sql } from './db';

export async function getOwnedPage(pageId, userId) {
  if (!/^\d+$/.test(pageId)) return null;
  const [page] = await sql`
    SELECT pages.id, pages.shop_id, pages.is_home, shops.type AS shop_type
    FROM pages
    JOIN shops ON shops.id = pages.shop_id
    WHERE pages.id = ${pageId} AND shops.user_id = ${userId}
  `;
  return page;
}
