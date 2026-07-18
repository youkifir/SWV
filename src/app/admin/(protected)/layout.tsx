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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1000 }}>{children}</main>
    </div>
  );
}
