import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

type Settings = {
  brandName: string;
  aboutShort: string;
  address: string;
  email: string;
  phone: string;
  footerNote: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
};

export default function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const socials = [
    { url: settings.facebookUrl, Icon: Facebook },
    { url: settings.twitterUrl, Icon: Twitter },
    { url: settings.linkedinUrl, Icon: Linkedin },
    { url: settings.instagramUrl, Icon: Instagram },
  ].filter((s) => s.url);

  return (
    <footer className="mt-20 bg-navy text-slate-300">
      <div className="container-bmpt grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <h3 className="font-display text-2xl font-bold text-white">{settings.brandName}</h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            {settings.aboutShort}
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ url, Icon }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-500"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Get In Touch</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand-400" />
              <span>{settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-brand-400" />
              <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-brand-400" />
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-white">{settings.phone}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About Us' },
              { href: '/services', label: 'Our Services' },
              { href: '/blog', label: 'Blog' },
              { href: '/contact', label: 'Contact Us' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-brand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-bmpt flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {year} {settings.brandName}. All rights reserved.</p>
          <p>{settings.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
