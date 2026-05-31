import Image from 'next/image';
import { getAboutSections } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo';
import Reveal from '@/components/Reveal';
import PageHeader from '@/components/public/PageHeader';

export const revalidate = 6000;

export async function generateMetadata() {
  return buildMetadata('about', {
    title: 'About Us',
    description: 'Learn about BMPT Solutions — our overview, mission and vision.',
    path: '/about',
  });
}

export default async function AboutPage() {
  const sections = await getAboutSections();

  return (
    <>
      <PageHeader title="About Us" crumb="About" />
      <div className="container-bmpt space-y-24 py-24">
        {sections.map((s, i) => (
          <section
            key={s.id}
            className={`grid items-center gap-12 lg:grid-cols-2 ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
          >
            <Reveal>
              <p className="eyebrow">{s.heading}</p>
              <h2 className="section-heading mt-3">{s.heading}</h2>
              <p className="mt-5 leading-relaxed text-slate-600">{s.body}</p>
            </Reveal>
            {s.imageUrl && (
              <Reveal delay={0.15}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
                  <Image src={s.imageUrl} alt={s.heading} fill className="object-cover" />
                </div>
              </Reveal>
            )}
          </section>
        ))}
        {sections.length === 0 && (
          <p className="text-center text-slate-500">Content coming soon.</p>
        )}
      </div>
    </>
  );
}
