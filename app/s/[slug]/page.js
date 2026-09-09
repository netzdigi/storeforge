import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { StorefrontBody } from '@/components/StoreBlocks';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [shop] = await sql`SELECT name, tagline FROM shops WHERE slug = ${slug}`;
  if (!shop) return {};
  return { title: `${shop.name} – Storeforge`, description: shop.tagline || undefined };
}

export default async function StorefrontHomePage({ params }) {
  const { slug } = await params;
  const [shop] = await sql`SELECT id, name, tagline, type FROM shops WHERE slug = ${slug}`;
  if (!shop) notFound();

  const [homePage] = await sql`
    SELECT id FROM pages WHERE shop_id = ${shop.id} AND is_home = true
  `;
  if (!homePage) notFound();

  const [products, blocks, pages] = await Promise.all([
    shop.type === 'shop'
      ? sql`
          SELECT id, name, description, price_cents, image_url FROM products
          WHERE shop_id = ${shop.id} ORDER BY created_at DESC
        `
      : Promise.resolve([]),
    sql`
      SELECT id, type, content FROM blocks
      WHERE page_id = ${homePage.id} ORDER BY position ASC
    `,
    sql`
      SELECT id, title, slug, is_home FROM pages
      WHERE shop_id = ${shop.id} ORDER BY position ASC
    `,
  ]);

  return (
    <StorefrontBody
      shopId={shop.id}
      shopName={shop.name}
      tagline={shop.tagline}
      shopSlug={slug}
      pages={pages}
      currentPageId={homePage.id}
      blocks={blocks}
      products={products}
    />
  );
}
