import { Phone, Mail, MapPin } from 'lucide-react';
import { getSettings } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo';
import Reveal from '@/components/Reveal';
import PageHeader from '@/components/public/PageHeader';
import ContactForm from '@/components/public/ContactForm';

export const revalidate = 6000;

export async function generateMetadata() {
  return buildMetadata('contact', {
    title: 'Contact Us',
    description: 'Get in touch with BMPT Solutions.',
    path: '/contact',
  });
}

export default async function ContactPage() {
  const settings = await getSettings();

  const cards = [
    { Icon: Phone, label: 'Call to ask any question', value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}` },
    { Icon: Mail, label: 'Email to get quick response', value: settings.email, href: `mailto:${settings.email}` },
    { Icon: MapPin, label: 'Visit our office', value: settings.address, href: undefined },
  ];

  return (
    <>
      <PageHeader title="Contact Us" crumb="Contact" />
      <div className="container-bmpt py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Contact Us</p>
          <h2 className="section-heading mt-3">If You Have Any Query, Feel Free To Contact Us</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.1}>
              <div className="card-soft flex h-full flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                  <c.Icon size={24} />
                </div>
                <p className="mt-4 text-sm text-slate-500">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="mt-1 font-display font-semibold text-navy hover:text-brand-600">
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 font-display font-semibold text-navy">{c.value}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
              {settings.mapEmbedUrl ? (
                <iframe
                  src={settings.mapEmbedUrl}
                  className="h-full min-h-[420px] w-full"
                  loading="lazy"
                  title="Office location"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex min-h-[420px] items-center justify-center bg-slate-50 text-slate-400">
                  Map unavailable
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
              <h3 className="font-display text-xl font-bold text-navy">Send us a message</h3>
              <p className="mt-1 text-sm text-slate-500">We typically reply within 24 hours.</p>
              <div className="mt-6">
                <ContactForm variant="light" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
