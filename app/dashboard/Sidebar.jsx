'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

const TYPE_ICON = { shop: '🛍️', website: '🌐' };

export default function Sidebar({ shops, email }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="sidebar-brand">Storeforge</Link>

      <nav className="sidebar-nav">
        <Link
          href="/dashboard"
          className={pathname === '/dashboard' ? 'sidebar-link active' : 'sidebar-link'}
        >
          🏠 Übersicht
        </Link>

        {shops.length > 0 && <div className="sidebar-section-label">Projekte</div>}
        {shops.map((shop) => {
          const href = `/dashboard/shops/${shop.id}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link key={shop.id} href={href} className={isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span>{TYPE_ICON[shop.type] || '📄'} {shop.name}</span>
            </Link>
          );
        })}

        <Link href="/dashboard#neues-projekt" className="sidebar-link sidebar-link-add">
          + Neues Projekt
        </Link>
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-email">{email}</span>
        <LogoutButton />
      </div>
    </aside>
  );
}
