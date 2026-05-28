import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bmptsolutions.com';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'BMPT Solutions — Enabling Potentials',
    template: '%s | BMPT Solutions',
  },
  description:
    'BMPT Solutions is a technology-driven business service firm providing business growth solutions.',
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
