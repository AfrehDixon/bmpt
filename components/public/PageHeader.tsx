import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({
  title,
  crumb,
}: {
  title: string;
  crumb: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy py-20">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #00B0F7 0, transparent 40%), radial-gradient(circle at 80% 70%, #00B0F7 0, transparent 35%)',
        }}
      />
      <div className="container-bmpt relative text-center">
        <h1 className="animate-fade-in-up font-display text-4xl font-bold text-white sm:text-5xl">
          {title}
        </h1>
        <nav className="mt-4 flex items-center justify-center gap-1 text-sm text-slate-300">
          <Link href="/" className="hover:text-brand-400">
            Home
          </Link>
          <ChevronRight size={16} />
          <span className="text-brand-400">{crumb}</span>
        </nav>
      </div>
    </section>
  );
}
