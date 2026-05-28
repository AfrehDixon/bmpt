/**
 * Seed the BMPT Solutions website with the content migrated from the
 * old static site. Idempotent — safe to re-run (uses upserts / deletes).
 *
 *   npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Local images shipped in /public/images. Once S3 is configured you can
// re-upload these through the admin Media library and swap the URLs.
const img = (name: string) => `/images/${name}`;

async function main() {
  console.log('🌱 Seeding BMPT Solutions website…');

  // ── Admin user ───────────────────────────────────────────────
  const email = (process.env.SEED_ADMIN_EMAIL || 'bmptsolutions10@gmail.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { name: process.env.SEED_ADMIN_NAME || 'BMPT Admin', isActive: true },
    create: {
      email,
      name: process.env.SEED_ADMIN_NAME || 'BMPT Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`   ✓ admin user: ${admin.email}`);

  // ── Site settings ────────────────────────────────────────────
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      brandName: 'BMPT Solutions',
      tagline: 'Enabling potentials',
      logoUrl: img('bmpt-logo.png'),
      phone: '+233 20 587 6724',
      phoneAlt: '+233 20 587 6724',
      email: 'info@bmptsolutions.com',
      address: 'Building No. 49, 01, North Legon',
      aboutShort:
        'BMPT Solutions is a technology-driven business service firm that specializes in providing business growth solutions to businesses.',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.5!2d-0.1893425!3d5.6839749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwNDEnMDIuMyJOIDDCsDExJzIxLjYiVw!5e0!3m2!1sen!2sgh!4v1700000000000',
      facebookUrl: '#',
      twitterUrl: '#',
      linkedinUrl: '#',
      instagramUrl: '#',
      footerNote: 'Designed by @bmptsolution',
    },
  });
  console.log('   ✓ site settings');

  // ── Hero slides ──────────────────────────────────────────────
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: [
      { title: 'Business Formalization & Regulatory Compliance', imageUrl: img('hero-business-formalization.jpg'), order: 1 },
      { title: 'Business Structuring & Internal Control Systems', imageUrl: img('hero-business-structuring.avif'), order: 2 },
      { title: 'Business Management Support', imageUrl: img('hero-business-management.jpg'), order: 3 },
      { title: 'Sales & Marketing Training', imageUrl: img('hero-sales-marketing.jpg'), order: 4 },
      { title: 'Branding Solutions', imageUrl: img('hero-branding-solutions.jpg'), order: 5 },
    ],
  });
  console.log('   ✓ hero slides');

  // ── Stats / facts ────────────────────────────────────────────
  await prisma.stat.deleteMany();
  await prisma.stat.createMany({
    data: [
      { label: 'Happy Clients', value: 20, suffix: '+', icon: 'Users', order: 1 },
      { label: 'Projects Done', value: 11, suffix: '+', icon: 'CheckCircle2', order: 2 },
      { label: 'Awards Won', value: 2, suffix: '', icon: 'Award', order: 3 },
    ],
  });
  console.log('   ✓ stats');

  // ── Features / why choose us ─────────────────────────────────
  await prisma.feature.deleteMany();
  await prisma.feature.createMany({
    data: [
      { title: 'Best In Industry', description: 'Leading provider of innovative business growth solutions.', icon: 'Boxes', order: 1 },
      { title: 'Award Winning', description: 'Recognized for excellence in delivering sustainable solutions.', icon: 'Award', order: 2 },
      { title: 'Professional Staff', description: 'Expert team dedicated to helping businesses succeed.', icon: 'UsersRound', order: 3 },
      { title: '24/7 Support', description: 'Round-the-clock assistance to ensure seamless business operations.', icon: 'Headphones', order: 4 },
    ],
  });
  console.log('   ✓ features');

  // ── Services ─────────────────────────────────────────────────
  await prisma.service.deleteMany();
  const services = [
    {
      slug: 'accounting-bookkeeping-solution',
      title: 'Accounting & Bookkeeping Solution',
      shortDesc:
        'Our accounting solutions are designed to help you create wealth, preserve wealth and manage your taxes by providing the highest standard of financial services available.',
      icon: 'Calculator',
      order: 1,
      body: `<p>Our accounting solutions are designed to help you create wealth, preserve wealth and manage your taxes by providing the highest standard of financial services available.</p>
<p>We provide support in Bookkeeping setup, preparation of final accounts and Accounts reconciliations. We offer you with the simplest and most convenient way to keep track of your expenses and income. Take control of your finances, save time for your core business activities.</p>
<h3>Our Accounting &amp; Financial services include:</h3>
<ul>
<li>Monthly/quarterly accounts</li>
<li>Bookkeeping setup</li>
<li>Bookkeeping services</li>
<li>Financial Statements</li>
<li>Cash flow forecasting and planning</li>
<li>Tax &amp; Regulatory compliance services</li>
</ul>`,
    },
    {
      slug: 'business-structuring-formalisation',
      title: 'Business Structuring & Formalisation',
      shortDesc:
        'Starting a new business is often one of the most exciting and satisfying things. However, the decision of choosing the type of entity is of utmost importance and cannot be taken lightly.',
      icon: 'Building2',
      order: 2,
      body: `<p>Starting a new business is often one of the most exciting and satisfying things. However, the decision of choosing the type of entity is of utmost importance and cannot be taken lightly. Choosing the form of entity of your business has longstanding tax implications, positive or negative. We help business owners decide on the most suitable arrangements and structures for their business types, navigate through the registration procedures, and facilitate in getting the registration done in time with no stress.</p>
<p>For existing businesses, we help our clients to review their systems and processes, validate the right processes &amp; identify gaps, propose and implement new models and systems that allow them to run more efficiently and effectively.</p>
<h3>Our Business Structuring &amp; Formalisation services include:</h3>
<ul>
<li>Company incorporations</li>
<li>Business start-ups and planning advice</li>
<li>Financial information systems</li>
<li>Business Systems &amp; Processes Review</li>
</ul>`,
    },
    {
      slug: 'software-solutions',
      title: 'Software Solutions',
      shortDesc:
        'Technology has become a critical element in being able to run any business enterprise smoothly and efficiently today. A prompt, responsive, secure and flexible IT infrastructure is the requirement of every business.',
      icon: 'Code2',
      order: 3,
      body: `<p>Technology has become a critical element in being able to run any business enterprise smoothly and efficiently today. A prompt, responsive, secure and flexible IT infrastructure is the requirement of every business. To succeed, it is imperative that businesses have access to the best technology tools and services at competitive costs so as to be more efficient and effective.</p>
<p>BMPT Solutions provide end-to-end Enterprise Resource Planning systems and Technical Support that help clients enjoy secure and scalable IT infrastructure for business processes. We offer a variety of detailed and cost-saving software and networking solutions that gives you total control of all functions and activities in your business.</p>
<h3>Products:</h3>
<ul>
<li>Business Management System</li>
<li>School Management System</li>
<li>Hospital Management System</li>
<li>Church Management System</li>
<li>Hotel Management Solution</li>
</ul>
<h3>Software Features:</h3>
<ul>
<li><strong>Sales Management:</strong> Monitor sales and ensure management decisions is accurately done.</li>
<li><strong>Payables and Receivables Management:</strong> Automate and streamline your payment and settlement processes, as well as control your revenue collection.</li>
<li><strong>Finance Management:</strong> Plan your financial performances and structure your organization.</li>
<li><strong>Inventory Management:</strong> Stay up-to-date with your inventory level at all times and track your stock.</li>
<li><strong>Accounting &amp; Bookkeeping:</strong> Manage your accounts, credits, profits, expenses, interests with ease and confidence.</li>
<li><strong>Purchase Management:</strong> Stay on top of inventory, increases revenue, customer satisfaction.</li>
<li><strong>Customer Relationship Management</strong></li>
</ul>`,
    },
    {
      slug: 'training-support',
      title: 'Training & Support',
      shortDesc:
        'We provide comprehensive training on usage and maintenance of our systems. We partner with you to ensure that your organisation gets the best of its available resources.',
      icon: 'GraduationCap',
      order: 4,
      body: `<p>We provide comprehensive training on usage and maintenance of our systems. We partner with you to ensure that your organisation gets the best of its available resources.</p>
<p>We also train on prudent methods of financial management and business performance strategies.</p>
<p>Our business services and support programs are designed to keep your systems running at optimum levels at all times.</p>`,
    },
    {
      slug: 'business-support',
      title: 'Business Support',
      shortDesc:
        'We provide Outsourced Management Support for business turnaround.',
      icon: 'LineChart',
      order: 5,
      body: `<p>We provide Outsourced Management Support for business turnaround — partnering with you to manage and improve operations, processes and performance so your business can recover, grow and thrive.</p>`,
    },
  ];
  for (const s of services) await prisma.service.create({ data: s });
  console.log(`   ✓ ${services.length} services`);

  // ── About sections ───────────────────────────────────────────
  await prisma.aboutSection.deleteMany();
  await prisma.aboutSection.createMany({
    data: [
      {
        key: 'overview',
        heading: 'Overview',
        body: 'BMPT Solutions is a technology-driven business service firm that specializes in providing business growth solutions to businesses. We believe that businesses; particularly small and medium sized businesses, are the engines of growth for social and economic development as well as strong catalyst for poverty alleviation across the globe; and they have the inherent potential to succeed.',
        imageUrl: img('about-overview.jpg'),
        order: 1,
      },
      {
        key: 'mission',
        heading: 'Mission',
        body: 'Our mission is to increase the prosperity of our clients by providing them with total accounting, marketing and management support solutions.',
        imageUrl: img('about-mission.jpg'),
        order: 2,
      },
      {
        key: 'vision',
        heading: 'Vision',
        body: 'To become a globally recognized partner for wealth and job creation in Africa.',
        imageUrl: img('about-vision.jpg'),
        order: 3,
      },
    ],
  });
  console.log('   ✓ about sections');

  // ── Navigation menu (top-level + sub-nav example) ────────────
  // Only seed the nav once — the admin owns it after that. Re-running
  // the seed will not overwrite an existing nav.
  const navCount = await prisma.navItem.count();
  if (navCount === 0) {
    await prisma.navItem.create({ data: { label: 'Home', href: '/', order: 1 } });
    await prisma.navItem.create({ data: { label: 'About', href: '/about', order: 2 } });

    // "Services" with a dropdown of all seeded services as children.
    const servicesParent = await prisma.navItem.create({
      data: { label: 'Services', href: '/services', order: 3 },
    });
    let childOrder = 1;
    for (const s of services) {
      await prisma.navItem.create({
        data: {
          label: s.title,
          href: `/services#${s.slug}`,
          order: childOrder++,
          parentId: servicesParent.id,
        },
      });
    }

    await prisma.navItem.create({ data: { label: 'Blog', href: '/blog', order: 4 } });
    await prisma.navItem.create({ data: { label: 'Contact', href: '/contact', order: 5 } });
    console.log('   ✓ navigation menu (top-level + Services sub-nav)');
  } else {
    console.log('   • navigation menu already exists — leaving the admin in control');
  }

  // ── Vendors / partners ───────────────────────────────────────
  await prisma.vendor.deleteMany();
  await prisma.vendor.createMany({
    data: [
      { name: 'Partner 1', imageUrl: img('partner-1.jpg'), order: 1 },
      { name: 'Partner 2', imageUrl: img('partner-2.jpg'), order: 2 },
      { name: 'Partner 3', imageUrl: img('partner-3.jpg'), order: 3 },
      { name: 'Partner 4', imageUrl: img('partner-4.jpg'), order: 4 },
    ],
  });
  console.log('   ✓ vendors');

  // ── SEO metadata per page ────────────────────────────────────
  const seoRows = [
    {
      page: 'home',
      title: 'BMPT Solutions — Enabling Potentials | Business Growth Solutions',
      description:
        'BMPT Solutions is a technology-driven business service firm providing accounting, business structuring, software and management support solutions to help businesses succeed.',
      keywords:
        'BMPT Solutions, business growth, accounting, bookkeeping, business structuring, software solutions, Ghana, North Legon',
    },
    {
      page: 'about',
      title: 'About Us — BMPT Solutions',
      description:
        'Learn about BMPT Solutions — our overview, mission and vision to increase the prosperity of our clients and become a globally recognized partner for wealth and job creation in Africa.',
      keywords: 'about BMPT Solutions, mission, vision, business consulting Ghana',
    },
    {
      page: 'services',
      title: 'Our Services — BMPT Solutions',
      description:
        'Custom IT and business solutions: Accounting & Bookkeeping, Business Structuring & Formalisation, Software Solutions, Training & Support and Business Support.',
      keywords:
        'accounting, bookkeeping, business structuring, software solutions, training, business support, ERP, management systems',
    },
    {
      page: 'contact',
      title: 'Contact Us — BMPT Solutions',
      description:
        'Get in touch with BMPT Solutions. Call +233 20 587 6724, email info@bmptsolutions.com or visit us at Building No. 49, 01, North Legon.',
      keywords: 'contact BMPT Solutions, North Legon, business consulting contact',
    },
    {
      page: 'blog',
      title: 'Blog — BMPT Solutions',
      description: 'News, insights and articles from BMPT Solutions.',
      keywords: 'BMPT Solutions blog, business insights, news',
    },
  ];
  for (const row of seoRows) {
    await prisma.seoMeta.upsert({ where: { page: row.page }, update: row, create: row });
  }
  console.log('   ✓ SEO metadata');

  // ── Sample banner (inactive by default) ──────────────────────
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.create({
      data: {
        message: '🎉 New: BMPTBooks accounting software is now available. Talk to us about getting started.',
        linkText: 'Learn more',
        linkUrl: '/services',
        type: 'PROMO',
        isActive: false,
      },
    });
  }

  // ── Sample promotion (inactive by default) ───────────────────
  const promoCount = await prisma.promotion.count();
  if (promoCount === 0) {
    await prisma.promotion.create({
      data: {
        title: 'Free 30-minute business consultation',
        body: 'Book a complimentary consultation with our team and discover how BMPT Solutions can unlock your business potential.',
        imageUrl: img('about-the-best-it-solution.jpg'),
        ctaText: 'Book now',
        ctaLink: '/contact',
        isActive: false,
      },
    });
  }

  // ── Sample blog post ─────────────────────────────────────────
  const postCount = await prisma.blogPost.count();
  if (postCount === 0) {
    await prisma.blogPost.create({
      data: {
        slug: 'welcome-to-bmpt-solutions',
        title: 'Welcome to the new BMPT Solutions website',
        excerpt:
          'We have rebuilt our website with a fully managed content system so we can share more insights with you.',
        body: '<p>Welcome! Our new website is powered by a content management system, which means we can now publish news, insights and updates more easily. Stay tuned for articles on accounting, business structuring, software and growth strategy.</p>',
        coverImage: img('about-the-best-it-solution.jpg'),
        category: 'News',
        isPublished: true,
        publishedAt: new Date(),
        authorId: admin.id,
      },
    });
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
