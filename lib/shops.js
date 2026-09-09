import { sql } from './db';

export async function getOwnedShop(shopId, userId) {
  if (!/^\d+$/.test(shopId)) return null;
  const [shop] = await sql`SELECT id FROM shops WHERE id = ${shopId} AND user_id = ${userId}`;
  return shop;
}
