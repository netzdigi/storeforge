import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';

function formatPrice(cents) {
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function ProductGrid({ products }) {
  if (products.length === 0) {
    return <div className="empty-state">Dieser Shop hat noch keine Produkte.</div>;
  }
  return (
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
  );
}

function Block({ block, products }) {
  if (block.type === 'heading') {
    return (
      <div className="container block-section">
        <h2>{block.content.text}</h2>
      </div>
    );
  }
  if (block.type === 'text') {
    return (
      <div className="container block-section">
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{block.content.text}</p>
      </div>
    );
  }
  if (block.type === 'image') {
    return (
      <div className="container block-section">
        {block.content.url && <img src={block.content.url} alt={block.content.alt || ''} style={{ maxWidth: '100%', borderRadius: 'var(--radius)' }} />}
      </div>
    );
  }
  if (block.type === 'products') {
    return (
      <div className="container">
        <ProductGrid products={products} />
      </div>
    );
  }
  return null;
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

  return (
    <>
      <div className="storefront-header container">
        <h1>{shop.name}</h1>
        {shop.tagline && <p>{shop.tagline}</p>}
      </div>

      {blocks.length === 0 ? (
        <div className="container">
          <ProductGrid products={products} />
        </div>
      ) : (
        blocks.map((block) => <Block key={block.id} block={block} products={products} />)
      )}

      <footer className="footer">Powered by Storeforge</footer>
    </>
  );
}
