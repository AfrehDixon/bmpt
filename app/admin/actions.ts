'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';
import { authOptions } from '@/lib/auth';
import { clearCmsCache } from '@/lib/redis';

/**
 * Generic CRUD server actions used by the admin CrudManager. The data
 * payload is already type-coerced on the client (numbers, booleans,
 * dates), so here we just upsert / delete by Prisma model name and flush
 * caches so the public site reflects changes immediately.
 */

// Allow-list of editable models → maps to prisma client accessor.
const MODELS = {
  HeroSlide: 'heroSlide',
  Stat: 'stat',
  Feature: 'feature',
  Service: 'service',
  AboutSection: 'aboutSection',
  Vendor: 'vendor',
  BlogPost: 'blogPost',
  Banner: 'banner',
  Promotion: 'promotion',
  SeoMeta: 'seoMeta',
  MediaAsset: 'mediaAsset',
  NavItem: 'navItem',
  Page: 'page',
  PageSection: 'pageSection',
} as const;

type ModelName = keyof typeof MODELS;

function client(model: ModelName) {
  const accessor = MODELS[model];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[accessor];
}

async function refresh() {
  await clearCmsCache();
  revalidatePath('/', 'layout');
}

export async function saveRecord(
  model: ModelName,
  id: string | null,
  data: Record<string, unknown>,
) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };
  if (!MODELS[model]) return { error: 'Unknown model' };

  // Coerce date-ish strings to Date | null for known datetime fields.
  for (const key of ['startsAt', 'endsAt', 'publishedAt']) {
    if (key in data) {
      const v = data[key];
      data[key] = v ? new Date(v as string) : null;
    }
  }

  // Nullable foreign keys come back as "" from <select>; Prisma needs null.
  for (const key of ['parentId', 'authorId']) {
    if (key in data && data[key] === '') data[key] = null;
  }

  try {
    if (id) {
      await client(model).update({ where: { id }, data });
    } else {
      await client(model).create({ data });
    }
    await refresh();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Save failed' };
  }
}

export async function deleteRecord(model: ModelName, id: string) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };
  if (!MODELS[model]) return { error: 'Unknown model' };
  try {
    await client(model).delete({ where: { id } });
    await refresh();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Delete failed' };
  }
}

export async function toggleActive(model: ModelName, id: string, field: string, value: boolean) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };
  try {
    await client(model).update({ where: { id }, data: { [field]: value } });
    await refresh();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Update failed' };
  }
}

/** Singleton site settings save. */
export async function saveSettings(data: Record<string, unknown>) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };
  try {
    await prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    await refresh();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Save failed' };
  }
}

/** Mark a contact message read/unread or delete it. */
export async function setMessageRead(id: string, isRead: boolean) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };
  await prisma.contactMessage.update({ where: { id }, data: { isRead } });
  revalidatePath('/admin/messages');
  return { ok: true };
}

export async function deleteMessage(id: string) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath('/admin/messages');
  return { ok: true };
}

// ─── Admin users ─────────────────────────────────────────────

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };
  // We trust the DB role over what's in the JWT in case it changed.
  const me = await prisma.adminUser.findUnique({
    where: { id: (session.user as { id?: string }).id },
  });
  if (!me || me.role !== 'SUPER_ADMIN') return { error: 'Only super admins can manage users' };
  return { me };
}

export async function createAdminUser(input: {
  email: string;
  name: string;
  password: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
}) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return { error: auth.error };

  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || input.password.length < 8) {
    return { error: 'Email and a password of at least 8 characters are required' };
  }
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return { error: 'An admin with that email already exists' };

  await prisma.adminUser.create({
    data: {
      email,
      name: input.name.trim() || email,
      role: input.role,
      passwordHash: await bcrypt.hash(input.password, 10),
    },
  });
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function updateAdminUser(input: {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
  isActive: boolean;
  newPassword?: string;
}) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return { error: auth.error };

  // Don't let a super admin demote / deactivate themselves out of access.
  if (input.id === auth.me.id && (input.role !== 'SUPER_ADMIN' || !input.isActive)) {
    return { error: "You can't change your own role or deactivate yourself." };
  }

  // Refuse to leave the system with zero active super admins.
  if (input.role !== 'SUPER_ADMIN' || !input.isActive) {
    const target = await prisma.adminUser.findUnique({ where: { id: input.id } });
    if (target?.role === 'SUPER_ADMIN' && target.isActive) {
      const activeSupers = await prisma.adminUser.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });
      if (activeSupers <= 1) {
        return { error: 'At least one active super admin must remain.' };
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    name: input.name.trim(),
    role: input.role,
    isActive: input.isActive,
  };
  if (input.newPassword) {
    if (input.newPassword.length < 8) return { error: 'New password must be at least 8 characters.' };
    data.passwordHash = await bcrypt.hash(input.newPassword, 10);
  }

  await prisma.adminUser.update({ where: { id: input.id }, data });
  revalidatePath('/admin/users');
  return { ok: true };
}

// ─── Nav-to-page shortcut ───────────────────────────────────
//
// Lets the admin go from a nav item straight to the page editor:
//   /admin/nav  →  click "Add content"  →  /admin/pages/<new-page-id>
//
// If a page already exists at the derived slug we just return its id.

const RESERVED_SLUGS = new Set([
  'about', 'services', 'contact', 'blog', 'admin', 'api',
  'sitemap.xml', 'robots.txt', '_next', 'images',
]);

/** Parse a nav href into a single-segment slug, or null if it can't map to a Page. */
async function deriveNavSlug(href: string): Promise<string | null> {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return null; // external
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return null;

  // strip query + hash, then leading/trailing slashes
  const path = href.split('#')[0].split('?')[0].replace(/^\/+|\/+$/g, '');
  if (!path) return null;                  // root "/" → home (built-in)
  if (path.includes('/')) return null;     // multi-segment paths aren't single Pages
  if (RESERVED_SLUGS.has(path)) return null;
  if (!/^[a-z0-9-]+$/i.test(path)) return null;
  return path.toLowerCase();
}

export async function createPageForNav(navItemId: string) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };

  const nav = await prisma.navItem.findUnique({ where: { id: navItemId } });
  if (!nav) return { error: 'Nav item not found' };

  const slug = await deriveNavSlug(nav.href);
  if (!slug) {
    return {
      error:
        "This link can't be mapped to a custom page (it's external, a built-in page, or has a nested path).",
    };
  }

  // Already a page at this slug? Just return it.
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) {
    revalidatePath('/admin/nav');
    return { ok: true, pageId: existing.id, slug };
  }

  const page = await prisma.page.create({
    data: {
      slug,
      title: nav.label,
      heroTitle: nav.label,
      heroSubtitle: '',
      showHeader: true,
      isPublished: false,
    },
  });
  revalidatePath('/admin/nav');
  revalidatePath('/admin/pages');
  return { ok: true, pageId: page.id, slug };
}

export async function deleteAdminUser(id: string) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return { error: auth.error };
  if (id === auth.me.id) return { error: "You can't delete your own account." };

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (target?.role === 'SUPER_ADMIN' && target.isActive) {
    const activeSupers = await prisma.adminUser.count({
      where: { role: 'SUPER_ADMIN', isActive: true },
    });
    if (activeSupers <= 1) return { error: 'At least one active super admin must remain.' };
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath('/admin/users');
  return { ok: true };
}
