import { prisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsAdmin() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Site Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Brand identity, contact details and social links shown across the public website.
      </p>
      <div className="mt-6">
        <SettingsForm initial={settings ?? null} />
      </div>
    </div>
  );
}
