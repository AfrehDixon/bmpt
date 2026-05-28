import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import InfoBanner from '@/components/public/InfoBanner';
import PromoModal from '@/components/public/PromoModal';
import { getSettings, getActiveBanner, getActivePromotion, getNavItems } from '@/lib/cms';

// Render public pages on demand (SSR) and rely on Redis (`cached()` in
// lib/cms.ts) for the hot path. This avoids opening a DB connection per
// page at build time — important on shared/limited Postgres — and means
// CMS edits go live immediately rather than waiting for an ISR window.
export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, banner, promo, navItems] = await Promise.all([
    getSettings(),
    getActiveBanner(),
    getActivePromotion(),
    getNavItems(),
  ]);

  return (
    <>
      <InfoBanner
        banner={
          banner
            ? {
                id: banner.id,
                message: banner.message,
                linkText: banner.linkText,
                linkUrl: banner.linkUrl,
                type: banner.type,
              }
            : null
        }
      />
      <Navbar
        brandName={settings.brandName}
        tagline={settings.tagline}
        logoUrl={settings.logoUrl}
        navItems={navItems}
      />
      <main>{children}</main>
      <Footer settings={settings} />
      <PromoModal
        promo={
          promo
            ? {
                id: promo.id,
                title: promo.title,
                body: promo.body,
                imageUrl: promo.imageUrl,
                ctaText: promo.ctaText,
                ctaLink: promo.ctaLink,
                updatedAt: new Date(promo.updatedAt).toISOString(),
              }
            : null
        }
      />
    </>
  );
}
