import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import InfoBanner from '@/components/public/InfoBanner';
import PromoModal from '@/components/public/PromoModal';
import { getSettings, getActiveBanner, getActivePromotion, getNavItems } from '@/lib/cms';

// Public pages use ISR — Next.js renders the HTML once, serves it from
// cache for `revalidate` seconds, then regenerates on the next request.
// Together with the Redis layer in lib/cms.ts and React's request-scoped
// cache(), most pageviews cost 0 DB queries and 0 Redis round-trips.
//
// CMS edits don't have to wait for the 5-min window: every admin write
// in app/admin/actions.ts calls `clearCmsCache()` + `revalidatePath('/',
// 'layout')`, which drops both the Redis cache AND this rendered HTML
// — so the next pageview after a save renders fresh content immediately.
export const revalidate = 6000;

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
