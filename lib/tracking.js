import { sql } from './db';

export async function recordPageView(shopId, pageId) {
  try {
    await sql`INSERT INTO page_views (shop_id, page_id) VALUES (${shopId}, ${pageId})`;
  } catch {
    // Analytics must never break the storefront.
  }
}
