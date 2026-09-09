import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/components/StoreBlocks';

function Sparkline({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="spark-svg">
      {data.map((d, i) => {
        const h = d.value > 0 ? Math.max((d.value / max) * 28, 2) : 0;
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.18}
            y={32 - h}
            width={barWidth * 0.64}
            height={h}
            rx="1"
            className="spark-bar"
          >
            <title>{d.title}</title>
          </rect>
        );
      })}
    </svg>
  );
}

function StatTile({ label, value, sub, data }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{value}</div>
      {sub && <div className="stat-tile-sub">{sub}</div>}
      <Sparkline data={data} />
    </div>
  );
}

export default async function AnalyticsPage({ params }) {
  const { shopId } = await params;
  if (!/^\d+$/.test(shopId)) notFound();

  const user = await getCurrentUser();
  const [shop] = await sql`
    SELECT id, name, slug FROM shops WHERE id = ${shopId} AND user_id = ${user.id}
  `;
  if (!shop) notFound();

  const [viewStats] = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS last7
    FROM page_views WHERE shop_id = ${shop.id}
  `;
  const [orderStats] = await sql`
    SELECT COUNT(*)::int AS count, COALESCE(SUM(total_cents), 0)::int AS revenue_cents
    FROM orders WHERE shop_id = ${shop.id}
  `;

  const daily = await sql`
    SELECT
      to_char(d.day, 'DD.MM.') AS label,
      COALESCE(pv.views, 0)::int AS views,
      COALESCE(o.orders, 0)::int AS orders,
      COALESCE(o.revenue_cents, 0)::int AS revenue_cents
    FROM generate_series(current_date - interval '13 days', current_date, interval '1 day') AS d(day)
    LEFT JOIN (
      SELECT date_trunc('day', created_at) AS day, COUNT(*) AS views
      FROM page_views WHERE shop_id = ${shop.id}
      GROUP BY 1
    ) pv ON pv.day = d.day
    LEFT JOIN (
      SELECT date_trunc('day', created_at) AS day, COUNT(*) AS orders, SUM(total_cents) AS revenue_cents
      FROM orders WHERE shop_id = ${shop.id}
      GROUP BY 1
    ) o ON o.day = d.day
    ORDER BY d.day ASC
  `;

  const viewsData = daily.map((d) => ({ value: d.views, title: `${d.label}: ${d.views} Aufrufe` }));
  const ordersData = daily.map((d) => ({ value: d.orders, title: `${d.label}: ${d.orders} Bestellungen` }));
  const revenueData = daily.map((d) => ({ value: d.revenue_cents, title: `${d.label}: ${formatPrice(d.revenue_cents)}` }));

  const recentOrders = await sql`
    SELECT id, product_name, customer_name, customer_email, quantity, total_cents, created_at
    FROM orders WHERE shop_id = ${shop.id} ORDER BY created_at DESC LIMIT 20
  `;

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>{shop.name}</h1>
          <Link href={`/dashboard/shops/${shop.id}`} style={{ color: 'var(--accent)' }}>
            ← Zurück zum Projekt
          </Link>
        </div>
      </div>

      <h2>Statistiken (letzte 14 Tage)</h2>
      <div className="stat-tiles">
        <StatTile
          label="Seitenaufrufe"
          value={viewStats.total}
          sub={`${viewStats.last7} in den letzten 7 Tagen`}
          data={viewsData}
        />
        <StatTile label="Bestellungen" value={orderStats.count} data={ordersData} />
        <StatTile label="Umsatz" value={formatPrice(orderStats.revenue_cents)} data={revenueData} />
      </div>

      <h2 style={{ marginTop: 40 }}>Letzte Bestellungen</h2>
      {recentOrders.length === 0 ? (
        <div className="empty-state">Noch keine Bestellungen.</div>
      ) : (
        <div className="product-list">
          {recentOrders.map((o) => (
            <div key={o.id} className="product-row">
              <div>
                <strong>{o.product_name}</strong> × {o.quantity}
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
                  {o.customer_name} &lt;{o.customer_email}&gt;
                </p>
              </div>
              <span className="price">{formatPrice(o.total_cents)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
