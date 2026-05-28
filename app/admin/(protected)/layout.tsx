import { requireAdmin } from '@/lib/admin';
import Sidebar from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userName={session.user.name || 'Admin'} />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
