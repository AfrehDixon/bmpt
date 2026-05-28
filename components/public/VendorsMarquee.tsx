import Image from 'next/image';

type Vendor = { id: string; name: string; imageUrl: string };

/** Continuous logo marquee built purely with CSS animation. */
export default function VendorsMarquee({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) return null;
  const loop = [...vendors, ...vendors];
  return (
    <div className="relative overflow-hidden py-4">
      <div className="flex w-max animate-marquee items-center gap-16">
        {loop.map((v, i) => (
          <div key={`${v.id}-${i}`} className="relative h-16 w-40 shrink-0 grayscale transition hover:grayscale-0">
            <Image src={v.imageUrl} alt={v.name} fill className="object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
