import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';

function formatPrice(cents) {
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

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

  const products = await sql`
    SELECT id, name, description, price_cents, image_url FROM products
    WHERE shop_id = ${shop.id} ORDER BY created_at DESC
  `;

  return (
    <>
      <div className="storefront-header container">
        <h1>{shop.name}</h1>
        {shop.tagline && <p>{shop.tagline}</p>}
      </div>

      <div className="container">
        {products.length === 0 ? (
          <div className="empty-state">Dieser Shop hat noch keine Produkte.</div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {product.image_url && <img src={product.image_url} alt={product.name} />}
                <div className="product-body">
                  <h3>{product.name}</h3>
                  {product.description && <p>{product.description}</p>}
                  <div className="price">{formatPrice(product.price_cents)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer">Powered by Storeforge</footer>
    </>
  );
}
