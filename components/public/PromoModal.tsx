'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type Promo = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaText: string;
  ctaLink: string;
  updatedAt: string;
};

/**
 * Promotion modal that appears shortly after the page loads when the
 * admin has an active promotion. Dismissal is remembered per-promotion
 * (keyed by id + updatedAt) so editing/republishing re-shows it.
 */
export default function PromoModal({ promo }: { promo: Promo | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!promo) return;
    const key = `bmpt_promo_${promo.id}_${promo.updatedAt}`;
    if (sessionStorage.getItem(key)) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [promo]);

  function dismiss() {
    if (promo) {
      sessionStorage.setItem(`bmpt_promo_${promo.id}_${promo.updatedAt}`, '1');
    }
    setOpen(false);
  }

  if (!promo) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-navy shadow hover:bg-white"
            >
              <X size={18} />
            </button>

            {promo.imageUrl && (
              <div className="relative h-44 w-full">
                <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover" />
              </div>
            )}

            <div className="p-7 text-center">
              <h3 className="font-display text-2xl font-bold text-navy">{promo.title}</h3>
              {promo.body && <p className="mt-3 text-sm leading-relaxed text-slate-600">{promo.body}</p>}
              <Link href={promo.ctaLink} onClick={dismiss} className="btn-primary mt-6">
                {promo.ctaText}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
