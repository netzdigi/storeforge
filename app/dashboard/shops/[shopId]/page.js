import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import AddProductForm from './AddProductForm';
import ProductList from './ProductList';
import BlockEditor from './BlockEditor';

export default async function ShopPage({ params }) {
  const { shopId } = await params;
  if (!/^\d+$/.test(shopId)) notFound();

  const user = await getCurrentUser();
  const [shop] = await sql`
    SELECT id, name, slug, tagline FROM shops WHERE id = ${shopId} AND user_id = ${user.id}
  `;
  if (!shop) notFound();

  const products = await sql`
    SELECT id, name, description, price_cents, image_url FROM products
    WHERE shop_id = ${shop.id} ORDER BY created_at DESC
  `;

  const blocks = await sql`
    SELECT id, type, content, position FROM blocks
    WHERE shop_id = ${shop.id} ORDER BY position ASC
  `;

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>{shop.name}</h1>
          <Link href={`/s/${shop.slug}`} target="_blank" style={{ color: 'var(--accent)' }}>
            /s/{shop.slug} ↗
          </Link>
        </div>
        <Link href="/dashboard" className="btn">← Zurück</Link>
      </div>

      <h2>Seite gestalten</h2>
      <BlockEditor shopId={shop.id} initialBlocks={blocks} />

      <h2 style={{ marginTop: 48 }}>Produkte</h2>
      <ProductList shopId={shop.id} initialProducts={products} />

      <div className="card" style={{ maxWidth: 480 }}>
        <h2 style={{ marginTop: 0 }}>Produkt hinzufügen</h2>
        <AddProductForm shopId={shop.id} />
      </div>
    </>
  );
}
