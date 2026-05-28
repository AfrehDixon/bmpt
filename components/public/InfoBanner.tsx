'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

type Banner = {
  id: string;
  message: string;
  linkText: string;
  linkUrl: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'PROMO';
};

const styles: Record<Banner['type'], string> = {
  INFO: 'bg-brand-500 text-white',
  SUCCESS: 'bg-emerald-500 text-white',
  WARNING: 'bg-amber-500 text-navy',
  PROMO: 'bg-navy text-white',
};

/**
 * Thin dismissible info bar shown above the navbar. Content is fully
 * CMS-managed; dismissal is remembered per-banner via localStorage so a
 * freshly published banner re-appears for everyone.
 */
export default function InfoBanner({ banner }: { banner: Banner | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!banner) return;
    const dismissed = localStorage.getItem(`bmpt_banner_${banner.id}`);
    if (!dismissed) setVisible(true);
  }, [banner]);

  if (!banner || !visible) return null;

  return (
    <div className={`${styles[banner.type]} animate-slide-down`}>
      <div className="container-bmpt relative flex items-center justify-center gap-3 py-2 text-center text-sm">
        <p className="font-medium">
          {banner.message}{' '}
          {banner.linkText && banner.linkUrl && (
            <Link href={banner.linkUrl} className="font-semibold underline underline-offset-2">
              {banner.linkText}
            </Link>
          )}
        </p>
        <button
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(`bmpt_banner_${banner.id}`, '1');
            setVisible(false);
          }}
          className="absolute right-4 opacity-80 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
