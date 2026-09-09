import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import Sidebar from './Sidebar';

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  const shops = await sql`
    SELECT id, name, type FROM shops WHERE user_id = ${user.id} ORDER BY created_at DESC
  `;

  return (
    <div className="dashboard-shell-v2">
      <Sidebar shops={shops} email={user?.email} />
      <main className="dashboard-main container">{children}</main>
    </div>
  );
}
