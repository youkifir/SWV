import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminSession();
  if (!authed) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <main className="admin-main">{children}</main>
    </div>
  );
}
