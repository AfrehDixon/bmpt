import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

/** Use in admin server components / actions. Redirects to login if absent. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/login');
  return session;
}

/** Boolean check for use inside server actions / API routes. */
export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session?.user);
}
