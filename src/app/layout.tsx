import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from './providers';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  axes:    ['SOFT', 'WONK'],
  variable:'--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s — T&J CRM',
    default:  'T&J CRM',
  },
  description: 'Multi-Tenant LinkedIn Outreach CRM für T&J Consulting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${fraunces.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
