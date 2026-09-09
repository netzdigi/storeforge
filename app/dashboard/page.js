import Link from 'next/link';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import CreateShopForm from './CreateShopForm';

const TYPE_ICON = { shop: '🛍️', website: '🌐' };
const TYPE_LABEL = { shop: 'Online-Shop', website: 'Webseite' };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const shops = await sql`
    SELECT id, name, slug, tagline, type FROM shops WHERE user_id = ${user.id} ORDER BY created_at DESC
  `;

  return (
    <>
      <div className="dashboard-header">
        <h1>Deine Projekte</h1>
      </div>

      {shops.length === 0 ? (
        <div className="empty-state">Du hast noch kein Projekt. Erstelle dein erstes Projekt unten.</div>
      ) : (
        <div className="shop-grid">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/dashboard/shops/${shop.id}`} className="shop-card">
              <h3>
                {TYPE_ICON[shop.type] || ''} {shop.name}
              </h3>
              <div className="slug">/s/{shop.slug}</div>
              <span className="type-badge" style={{ marginLeft: 0, marginTop: 8 }}>
                {TYPE_LABEL[shop.type] || shop.type}
              </span>
              {shop.tagline && (
                <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>{shop.tagline}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="card" style={{ maxWidth: 480 }}>
        <h2 style={{ marginTop: 0 }}>Neues Projekt erstellen</h2>
        <CreateShopForm />
      </div>
    </>
  );
}
