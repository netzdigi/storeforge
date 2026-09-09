import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import LogoutButton from './LogoutButton';

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <div className="dashboard-shell">
      <nav className="dashboard-nav container">
        <Link href="/dashboard" className="nav-brand">Storeforge</Link>
        <div className="nav-links">
          <span style={{ color: 'var(--text-muted)' }}>{user?.email}</span>
          <LogoutButton />
        </div>
      </nav>
      <main className="dashboard-main container">{children}</main>
    </div>
  );
}
