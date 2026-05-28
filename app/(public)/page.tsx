import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Phone } from 'lucide-react';
import {
  getHeroSlides,
  getStats,
  getFeatures,
  getServices,
  getAboutSections,
  getVendors,
  getSettings,
} from '@/lib/cms';
import { buildMetadata } from '@/lib/seo';
import Icon from '@/components/Icon';
import Reveal from '@/components/Reveal';
import HeroCarousel from '@/components/public/HeroCarousel';
import ContactForm from '@/components/public/ContactForm';
import VendorsMarquee from '@/components/public/VendorsMarquee';

export const revalidate = 60;

export async function generateMetadata() {
  return buildMetadata('home', {
    title: 'BMPT Solutions — Enabling Potentials',
    description:
      'Technology-driven business growth solutions: accounting, business structuring, software and management support.',
    path: '/',
  });
}

export default async function HomePage() {
  const [slides, stats, features, services, about, vendors, settings] = await Promise.all([
    getHeroSlides(),
    getStats(),
    getFeatures(),
    getServices(),
    getAboutSections(),
    getVendors(),
    getSettings(),
  ]);

  const overview = about.find((a) => a.key === 'overview') ?? about[0];

  return (
    <>
      <HeroCarousel slides={slides} />

      {/* Stats */}
      {stats.length > 0 && (
        <section className="relative z-10 -mt-16 px-4">
          <div className="container-bmpt grid gap-5 sm:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.1}>
                <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-slate-100">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon name={s.icon} size={26} />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-navy">
                      {s.value}
                      {s.suffix}
                    </p>
                    <p className="text-sm text-slate-500">{s.label}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      {overview && (
        <section className="container-bmpt grid items-center gap-12 py-24 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">About Us</p>
            <h2 className="section-heading mt-3">The Best Business &amp; IT Solution</h2>
            <p className="mt-5 leading-relaxed text-slate-600">{overview.body}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {['Award Winning', 'Professional Staff', '24/7 Support', 'Fair Prices'].map((f) => (
                <p key={f} className="flex items-center gap-2 text-sm font-medium text-navy">
                  <CheckCircle size={18} className="text-brand-500" />
                  {f}
                </p>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
                <Phone size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Call to ask any question</p>
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="font-display text-lg font-bold text-navy">
                  {settings.phone}
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={overview.imageUrl || '/images/about-overview.jpg'}
                alt="About BMPT Solutions"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
        </section>
      )}

      {/* Features */}
      {features.length > 0 && (
        <section className="bg-slate-50 py-24">
          <div className="container-bmpt">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Why Choose Us</p>
              <h2 className="section-heading mt-3">We Help Grow Your Business Exponentially</h2>
            </Reveal>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.08}>
                  <div className="card-soft h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500 text-white">
                      <Icon name={f.icon} size={26} />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-navy">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="container-bmpt py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Our Services</p>
            <h2 className="section-heading mt-3">Custom Solutions for Your Successful Business</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <Link href={`/services#${s.slug}`} className="card-soft group block h-full">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-white transition-colors group-hover:bg-brand-500">
                    <Icon name={s.icon} size={26} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-navy">{s.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{s.shortDesc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    Read more <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Quote / contact CTA */}
      <section className="bg-navy py-24">
        <div className="container-bmpt grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow !text-brand-300">Request For Help</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Need Help? Feel Free to Contact Us
            </h2>
            <p className="mt-5 leading-relaxed text-slate-300">
              Our solutions are designed to help you manage and understand your business finances well.
              Let us handle the tedious accounting and bookkeeping work so you can focus on what brings
              you revenue. Make us your business growth partners today.
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                <CheckCircle size={18} className="text-brand-400" /> Reply within 24 hours
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle size={18} className="text-brand-400" /> 24 hrs telephone support
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
              <ContactForm variant="dark" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Partners */}
      {vendors.length > 0 && (
        <section className="container-bmpt py-16">
          <Reveal className="mb-6 text-center">
            <p className="eyebrow">Our Partners</p>
          </Reveal>
          <VendorsMarquee vendors={vendors} />
        </section>
      )}
    </>
  );
}
