import { prisma } from '@/lib/prisma';
import MessagesList from './MessagesList';

export const dynamic = 'force-dynamic';

export default async function MessagesAdmin() {
  const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Contact Messages</h1>
      <p className="mt-1 text-sm text-slate-500">{rows.length} message{rows.length === 1 ? '' : 's'}</p>
      <div className="mt-6">
        <MessagesList
          rows={rows.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
