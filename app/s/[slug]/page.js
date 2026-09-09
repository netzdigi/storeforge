import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { StorefrontBody } from '@/components/StoreBlocks';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [shop] = await sql`SELECT name, tagline FROM shops WHERE slug = ${slug}`;
  if (!shop) return {};
  return { title: `${shop.name} – Storeforge`, description: shop.tagline || undefined };
}

export default async function StorefrontPage({ params }) {
  const { slug } = await params;
  const [shop] = await sql`SELECT id, name, tagline FROM shops WHERE slug = ${slug}`;
  if (!shop) notFound();

  const [products, blocks] = await Promise.all([
    sql`
      SELECT id, name, description, price_cents, image_url FROM products
      WHERE shop_id = ${shop.id} ORDER BY created_at DESC
    `,
    sql`
      SELECT id, type, content FROM blocks
      WHERE shop_id = ${shop.id} ORDER BY position ASC
    `,
  ]);

  return <StorefrontBody shopName={shop.name} tagline={shop.tagline} blocks={blocks} products={products} />;
}
