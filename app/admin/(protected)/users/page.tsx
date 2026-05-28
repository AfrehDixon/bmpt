import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import UsersManager from './UsersManager';

export const dynamic = 'force-dynamic';

export default async function UsersAdmin() {
  const session = await getServerSession(authOptions);
  const myId = (session?.user as { id?: string } | undefined)?.id ?? null;

  // Confirm the viewer is actually SUPER_ADMIN against the DB
  // (the UI also gracefully degrades for EDITORs).
  const me = myId ? await prisma.adminUser.findUnique({ where: { id: myId } }) : null;
  const isSuper = me?.role === 'SUPER_ADMIN';

  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Admin Users</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage who can sign in to the CMS. {isSuper ? 'You are a super admin.' : 'Only super admins can add or modify users.'}
      </p>
      <div className="mt-6">
        <UsersManager
          isSuper={isSuper}
          currentUserId={myId}
          users={users.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
