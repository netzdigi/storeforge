import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { StorefrontBody } from '@/components/StoreBlocks';
import { recordPageView } from '@/lib/tracking';

export async function generateMetadata({ params }) {
  const { slug, pageSlug } = await params;
  const [row] = await sql`
    SELECT shops.name AS shop_name, pages.title AS page_title
    FROM pages JOIN shops ON shops.id = pages.shop_id
    WHERE shops.slug = ${slug} AND pages.slug = ${pageSlug}
  `;
  if (!row) return {};
  return { title: `${row.page_title} – ${row.shop_name}` };
}

export default async function StorefrontSubPage({ params }) {
  const { slug, pageSlug } = await params;
  const [shop] = await sql`SELECT id, name, tagline, type FROM shops WHERE slug = ${slug}`;
  if (!shop) notFound();

  const [page] = await sql`
    SELECT id FROM pages WHERE shop_id = ${shop.id} AND slug = ${pageSlug} AND is_home = false
  `;
  if (!page) notFound();

  await recordPageView(shop.id, page.id);

  const [products, blocks, pages] = await Promise.all([
    shop.type === 'shop'
      ? sql`
          SELECT id, name, description, price_cents, image_url FROM products
          WHERE shop_id = ${shop.id} ORDER BY created_at DESC
        `
      : Promise.resolve([]),
    sql`
      SELECT id, type, content FROM blocks
      WHERE page_id = ${page.id} ORDER BY position ASC
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
      currentPageId={page.id}
      blocks={blocks}
      products={products}
    />
  );
}
