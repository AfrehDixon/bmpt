import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MediaAdmin() {
  const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Media Library</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every image uploaded through the CMS is stored on S3 and listed here. Filenames are descriptive
        (purpose/slug-timestamp.ext) so you can find them later.
      </p>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-400">
          <p className="text-sm">No uploads yet. Upload images from any editor and they will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((m) => (
            <a
              key={m.id}
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-square bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || m.filename} className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
              </div>
              <div className="space-y-1 p-3">
                <p className="truncate text-xs font-medium text-navy">{m.filename}</p>
                <p className="truncate text-[10px] text-slate-400">{m.key}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
