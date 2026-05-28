import { getServices } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo';
import Icon from '@/components/Icon';
import Reveal from '@/components/Reveal';
import PageHeader from '@/components/public/PageHeader';

export const revalidate = 60;

export async function generateMetadata() {
  return buildMetadata('services', {
    title: 'Our Services',
    description: 'Custom IT and business solutions from BMPT Solutions.',
    path: '/services',
  });
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader title="Services" crumb="Services" />
      <div className="container-bmpt py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our Services</p>
          <h2 className="section-heading mt-3">Custom Solutions for Your Successful Business</h2>
        </Reveal>

        <div className="mt-16 space-y-20">
          {services.map((s, i) => (
            <section key={s.id} id={s.slug} className="scroll-mt-28">
              <Reveal>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white">
                    <Icon name={s.icon} size={30} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-brand-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-navy">{s.title}</h3>
                  </div>
                </div>
                <div
                  className="prose-bmpt mt-6 max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: s.body || `<p>${s.shortDesc}</p>` }}
                />
              </Reveal>
              {i < services.length - 1 && <hr className="mt-16 border-slate-100" />}
            </section>
          ))}
          {services.length === 0 && <p className="text-center text-slate-500">Services coming soon.</p>}
        </div>
      </div>
    </>
  );
}
