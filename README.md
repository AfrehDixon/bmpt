# BMPT Solutions Website + CMS

The marketing website for **BMPT Solutions** (bmptsolutions.com), rebuilt as
a fully content-managed Next.js application. Nothing on the public site is
static — every page (nav, hero, services, about, blog, banners, promotion
modal, SEO tags) is rendered from the database and editable from the admin
CMS at `/admin`.

This project is **independent** of `bmptbooks-help`. It shares the brand
design system (cyan `#00B0F7`, navy `#04015A`, Inter + Plus Jakarta Sans)
but has its own database, its own admin and its own deployment.

---

## Stack

| Concern        | Tool                                                  |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js 14 (App Router) + TypeScript                  |
| Styling        | Tailwind CSS + framer-motion (minimal animations)     |
| Database       | PostgreSQL via Prisma                                 |
| Cache          | Redis (ioredis) — every CMS read is read-through      |
| Media storage  | AWS S3 (presigned PUT uploads, descriptive keys)      |
| Auth (admin)   | NextAuth Credentials provider, bcrypt password hash   |
| Icons          | lucide-react                                          |
| SEO            | Per-page CMS metadata + `app/sitemap.ts` + `robots.ts`|

---

## Project layout

```
app/
  (public)/             ← marketing site (everything dynamic)
    layout.tsx          ← navbar, footer, info banner, promo modal
    page.tsx            ← home (hero, stats, about, features, services, CTA, partners)
    about/, services/, contact/, blog/, blog/[slug]/
  admin/
    layout.tsx          ← pass-through
    login/page.tsx      ← sign-in
    (protected)/
      layout.tsx        ← sidebar + requireAdmin guard
      page.tsx          ← dashboard
      settings/         ← brand & contact
      hero/             ← homepage carousel
      stats/, features/, services/, about/, vendors/
      blog/             ← posts (HTML body)
      banners/          ← top info bar
      promotions/       ← page-load modal
      seo/              ← per-page SEO + sitemap info
      messages/         ← contact form inbox
      media/            ← S3 media library
  api/
    auth/[...nextauth]/ ← NextAuth handler
    contact/            ← public form submission
    upload/             ← presigned S3 PUT URL (admin only)
  sitemap.ts            ← /sitemap.xml (incl. all published posts)
  robots.ts             ← /robots.txt (blocks /admin and /api)

components/
  Providers.tsx, Icon.tsx, Reveal.tsx
  public/ Navbar, Footer, InfoBanner, PromoModal, HeroCarousel,
          ContactForm, VendorsMarquee, PageHeader
  admin/  Sidebar, CrudManager, ImageField

lib/
  prisma.ts, redis.ts (cached(), invalidate()),
  s3.ts (createUploadUrl, descriptive keys),
  auth.ts (NextAuth config), admin.ts (requireAdmin),
  cms.ts (cached read helpers), seo.ts (buildMetadata)

prisma/
  schema.prisma, seed.ts (seeds every page's content + first admin)

scripts/
  setup-s3.ts           ← create + configure the S3 bucket

_legacy/                ← old static site, kept for reference only
```

---

## Local development

### Prerequisites
- Node 18+ (Node 20/22/24 all fine)
- PostgreSQL 14+
- Redis (optional but recommended — site still works if Redis is down,
  just without read-through caching)

### Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# → edit DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, AWS_* and SEED_ADMIN_*

# 3. Create the database (one-time)
createdb bmptsolutions_website

# 4. Run migrations and seed
npm run db:migrate          # applies prisma/migrations
npm run db:seed             # seeds settings, hero, services, about, SEO + admin user

# 5. Start
npm run dev
# → http://localhost:3000              public site
# → http://localhost:3000/admin/login  CMS (use SEED_ADMIN_EMAIL/PASSWORD)
```

If you ever change the schema:
```bash
npm run db:migrate -- --name <change_description>
```

To inspect data:
```bash
npm run db:studio   # opens Prisma Studio at http://localhost:5555
```

---

## Production / server deployment

### 1. Provision

| Service     | Notes                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Postgres    | Managed (Neon / RDS / Supabase) or self-hosted. Create a database named `bmptsolutions_website`. |
| Redis       | Managed (Upstash / Elasticache) or self-hosted. Optional but recommended. |
| AWS S3      | One bucket per environment (e.g. `bmptsolutions-website-media`).         |
| Node host   | Vercel, Render, Fly.io, or any Node host that can run `next start`.      |

### 2. Environment

Set the same variables as `.env.example`. At minimum:
- `DATABASE_URL` — production Postgres (with `?sslmode=require` for managed)
- `REDIS_URL` — production Redis (or omit to disable caching)
- `NEXTAUTH_URL` — public URL (`https://bmptsolutions.com`)
- `NEXTAUTH_SECRET` — long random string (`openssl rand -hex 32`)
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_S3_BASE_URL`
- `NEXT_PUBLIC_APP_URL` — same as `NEXTAUTH_URL`
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — used **once** by the seed

### 3. One-time setup on the server

```bash
npm ci
npm run db:deploy        # applies migrations without prompting
npm run db:seed          # seeds initial content (idempotent)
npm run s3:setup         # creates the S3 bucket + CORS + public-read policy
npm run build
npm run start
```

### 4. Updating content

Content lives in Postgres + S3 — deploys don't touch it. Anyone with admin
credentials can sign in at `/admin/login` and edit:

- **Site Settings** — brand, contact details, social, footer credit
- **Navigation Menu** — every link in the top nav (incl. dropdowns)
- **Custom Pages** — build entirely new pages (e.g. `/products`) with sections
- **Admin Users** — add additional admins (super-admin only)
- **Hero Slides** — homepage carousel
- **Stats / Facts** — homepage counters
- **Why Choose Us** — features list
- **Services** — title + short + full HTML body
- **About Sections** — overview / mission / vision blocks
- **Partners** — vendor logo carousel
- **Blog Posts** — slug, body, cover image, publish toggle
- **Info Banners** — top dismissible bar (info / success / warning / promo)
- **Promotions** — modal that appears shortly after page load
- **SEO Metadata** — per-page title, description, keywords, OG image
- **Messages** — inbox of contact-form submissions
- **Media** — S3 upload history

Saves flush the Redis `cms:*` cache and revalidate the layout, so changes
appear on the public site within seconds.

---

## Data model

All models live in [prisma/schema.prisma](prisma/schema.prisma). Summary:

| Model            | What it stores                                            |
| ---------------- | --------------------------------------------------------- |
| `AdminUser`      | CMS sign-in accounts (bcrypt password hash, role)         |
| `SiteSetting`    | Singleton row (id `default`) for global brand + contact   |
| `HeroSlide`      | Homepage carousel slides (image, headline, CTA)           |
| `Stat`           | Homepage counters (label, value, icon)                    |
| `Feature`        | "Why choose us" cards                                     |
| `Service`        | Service definitions with slug + rich HTML body            |
| `AboutSection`   | Overview / mission / vision blocks (keyed)                |
| `Vendor`         | Partner logos                                             |
| `BlogPost`       | Title, slug, excerpt, HTML body, cover, publish state     |
| `ContactMessage` | Public contact-form submissions                           |
| `Banner`         | Top info bar (one active = shown)                         |
| `Promotion`      | Page-load modal (date range optional)                     |
| `SeoMeta`        | Per-page SEO (page key, title, description, OG image)     |
| `MediaAsset`     | S3 upload history (key, public url, alt text)             |
| `NavItem`        | Public-site nav links (self-relation `parentId` for sub-nav) |
| `Page`           | Custom page (slug, hero, SEO, publish state)              |
| `PageSection`    | One section of a custom page (heading + body + image + layout) |

The seed script in [prisma/seed.ts](prisma/seed.ts) is **idempotent** — it
upserts the singleton + admin and resets the collection tables, so re-running
it is safe.

---

## Navigation menu (CMS-driven, supports sub-nav)

The top navigation is **not** hard-coded. Every link is a row in `nav_items`
managed at `/admin/nav`. Each item has:

- **Label** — what the user sees
- **Link / URL** — internal path (`/about`, `/services#software-solutions`)
  or full external URL (`https://…`)
- **Parent menu** — leave empty for a top-level link, or pick an existing
  top-level link to make this item a dropdown entry under it
- **Order** — lower numbers appear first
- **Open in new tab** — adds `target="_blank"` rel="noreferrer"
- **Active** — toggle to hide a link without deleting it

### Sub-nav (dropdowns)

One level of dropdown is supported (children can't have children — keeps
the UX clean and matches what every realistic company site needs).

- **Desktop:** hover a parent link to reveal its children in a white panel
  with a slide/fade animation.
- **Mobile:** tap the chevron next to a parent to expand its children
  inline.

The seed creates a working example: a **Services** parent with all five
services as child entries (`/services#accounting-bookkeeping`, etc.). Edit
or delete them at `/admin/nav` — re-running the seed will not overwrite an
existing menu, so the admin always stays in control.

Internally the nav is loaded through `getNavItems()` in [lib/cms.ts](lib/cms.ts),
which builds the parent → children tree, caches it in Redis (`cms:nav`) for
60s, and invalidates it on every save in [app/admin/actions.ts](app/admin/actions.ts).

---

## Building a new page (e.g. /products)

The whole point of the **Custom Pages** editor is that adding a new nav
item doesn't require a developer. There are two ways to do it:

**Quick way (recommended)** — straight from the nav editor:
1. At `/admin/nav` → "Add Menu Item". Set label `Products`, link `/products`.
2. Save. The new row shows **Add content** in the Content column.
3. Click **Add content** — a matching draft page is created and the editor
   opens immediately. Add sections, then flip **Published** on.

**Manual way** — start from the pages list:
1. At `/admin/pages` → "New Page". Pick a title and slug (`products`).
2. Add sections and publish.
3. At `/admin/nav` add a link pointing to `/products`. The Content column
   will now say **Edit content** and link straight back here.

Either way each **section** has:
- **Layout** — image-left, image-right, text-only, full-width image,
  or centered card
- **Background** — white / light / navy / brand cyan
- **Eyebrow + heading + HTML body**
- **Image** (uploaded or picked from the media library)
- **Optional CTA button** (text + link)

The public catch-all route at [app/(public)/[slug]/page.tsx](app/(public)/[slug]/page.tsx)
serves any published page. The slugs `about`, `services`, `contact`,
`blog`, `admin` and `api` are reserved (those are real routes).

## Admin users

`/admin/users` (super-admin only) lists every admin and lets you add,
edit and delete additional ones. The guard rails:

- Passwords are hashed with bcrypt; min 8 characters.
- You can't delete yourself, demote yourself out of SUPER_ADMIN, or
  deactivate yourself.
- The system refuses to leave zero active super admins (so admins can
  never lock everyone out).
- The first admin is created by `npm run db:seed` using `SEED_ADMIN_*`.

Roles:
- `SUPER_ADMIN` — can do everything, including manage other admins.
- `EDITOR` — can edit all content but can't manage admins.

## Image / media naming convention

Uploads go to S3 via presigned PUT. Object keys are built in
[lib/s3.ts](lib/s3.ts#L26) as:

```
<purpose>/<slugified-filename>-<timestamp>.<ext>
```

Each editor passes a meaningful `purpose` (`hero`, `services`, `about`,
`blog`, `promotions`, `partners`, `seo`, `brand`) so every object name
describes what it is, exactly as the brief asked.

---

## Cache + revalidation

- Public reads go through `cached(key, loader, ttl)` in
  [lib/redis.ts](lib/redis.ts) → namespace `cms:*`, default 60s TTL.
- Every admin write calls `clearCmsCache()` and `revalidatePath('/', 'layout')`
  via [app/admin/actions.ts](app/admin/actions.ts), so the public site
  drops both Redis and Next's fetch cache and rebuilds on the next request.
- If Redis is unreachable, the cache layer is a no-op and reads go straight
  to Postgres — the site doesn't break.

---

## SEO

- Per-page meta is rendered by `buildMetadata(page, fallback)` in
  [lib/seo.ts](lib/seo.ts), reading from the `SeoMeta` table.
- `app/sitemap.ts` lists every static route plus every published blog post.
- `app/robots.ts` allows the public site but blocks `/admin` and `/api`.
- The `<head>` includes Open Graph + Twitter cards from the same metadata.

---

## Banner + promotion behaviour

- **InfoBanner** ([components/public/InfoBanner.tsx](components/public/InfoBanner.tsx))
  is rendered at the top of the public layout when one banner is active.
  Dismissal is per-banner in `localStorage`, so publishing a new one
  re-shows it for everyone.
- **PromoModal** ([components/public/PromoModal.tsx](components/public/PromoModal.tsx))
  fades in ~1.2s after the page loads when a promotion is active and
  within its `startsAt`/`endsAt` window. Dismissal is keyed by promo id +
  `updatedAt` in `sessionStorage`, so editing a promotion re-shows it.

---

## Useful scripts

| Command                | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the dev server with HMR                           |
| `npm run build`        | `prisma generate` + `next build`                        |
| `npm run start`        | Run the built app                                       |
| `npm run db:migrate`   | Create + apply a new migration locally                  |
| `npm run db:deploy`    | Apply existing migrations (production)                  |
| `npm run db:push`      | Sync schema without a migration (dev only)              |
| `npm run db:studio`    | Open Prisma Studio                                      |
| `npm run db:seed`      | Run `prisma/seed.ts` (admin user + content seed)        |
| `npm run db:generate`  | Regenerate the Prisma client                            |
| `npm run s3:setup`     | Create/configure the AWS S3 bucket for media uploads    |

---

## First admin login

After `npm run db:seed`, sign in at `/admin/login` with:

- **Email:** value of `SEED_ADMIN_EMAIL` (default `bmptsolutions10@gmail.com`)
- **Password:** value of `SEED_ADMIN_PASSWORD` (default `ChangeMe123!`)

**Change the password from the database after first login** — there isn't a
public sign-up flow on purpose. To add more admins, insert rows into
`admin_users` with a bcrypt-hashed password.
