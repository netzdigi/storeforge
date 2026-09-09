import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import AddProductForm from './AddProductForm';
import ProductList from './ProductList';
import BlockEditor from './BlockEditor';
import PageSwitcher from './PageSwitcher';

const TYPE_LABEL = { shop: 'Online-Shop', website: 'Webseite' };

export default async function ShopPage({ params, searchParams }) {
  const { shopId } = await params;
  const { page: pageIdParam } = await searchParams;
  if (!/^\d+$/.test(shopId)) notFound();

  const user = await getCurrentUser();
  const [shop] = await sql`
    SELECT id, name, slug, tagline, type FROM shops WHERE id = ${shopId} AND user_id = ${user.id}
  `;
  if (!shop) notFound();

  const pages = await sql`
    SELECT id, title, slug, is_home FROM pages WHERE shop_id = ${shop.id} ORDER BY position ASC
  `;

  const currentPage =
    (pageIdParam && pages.find((p) => String(p.id) === pageIdParam)) ||
    pages.find((p) => p.is_home) ||
    pages[0];
  if (!currentPage) notFound();

  const products =
    shop.type === 'shop'
      ? await sql`
          SELECT id, name, description, price_cents, image_url FROM products
          WHERE shop_id = ${shop.id} ORDER BY created_at DESC
        `
      : [];

  const blocks = await sql`
    SELECT id, type, content, position FROM blocks
    WHERE page_id = ${currentPage.id} ORDER BY position ASC
  `;

  const messages = await sql`
    SELECT id, name, email, message, created_at FROM messages
    WHERE shop_id = ${shop.id} ORDER BY created_at DESC LIMIT 20
  `;
  const subscribers = await sql`
    SELECT id, email, created_at FROM subscribers
    WHERE shop_id = ${shop.id} ORDER BY created_at DESC LIMIT 20
  `;

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>
            {shop.name}
            <span className="type-badge">{TYPE_LABEL[shop.type] || shop.type}</span>
          </h1>
          <Link href={`/s/${shop.slug}`} target="_blank" style={{ color: 'var(--accent)' }}>
            /s/{shop.slug} ↗
          </Link>
        </div>
        <Link href="/dashboard" className="btn">← Zurück</Link>
      </div>

      <h2>Seite gestalten</h2>
      <PageSwitcher shopId={shop.id} pages={pages} currentPageId={currentPage.id} />
      <BlockEditor
        key={currentPage.id}
        pageId={currentPage.id}
        initialBlocks={blocks}
        shopId={shop.id}
        shopName={shop.name}
        shopTagline={shop.tagline}
        shopSlug={shop.slug}
        pages={pages}
        currentPageId={currentPage.id}
        products={products}
        projectType={shop.type}
      />

      {shop.type === 'shop' && (
        <>
          <h2 style={{ marginTop: 48 }}>Produkte</h2>
          <ProductList shopId={shop.id} initialProducts={products} />

          <div className="card" style={{ maxWidth: 480 }}>
            <h2 style={{ marginTop: 0 }}>Produkt hinzufügen</h2>
            <AddProductForm shopId={shop.id} />
          </div>
        </>
      )}

      <h2 style={{ marginTop: 48 }}>Posteingang</h2>
      <div className="inbox-grid">
        <div>
          <h3>Kontaktanfragen ({messages.length})</h3>
          {messages.length === 0 ? (
            <div className="empty-state">Noch keine Nachrichten.</div>
          ) : (
            <div className="product-list">
              {messages.map((m) => (
                <div key={m.id} className="product-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <strong>
                    {m.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>&lt;{m.email}&gt;</span>
                  </strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3>Newsletter-Abonnenten ({subscribers.length})</h3>
          {subscribers.length === 0 ? (
            <div className="empty-state">Noch keine Abonnenten.</div>
          ) : (
            <div className="product-list">
              {subscribers.map((s) => (
                <div key={s.id} className="product-row">
                  <span>{s.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
