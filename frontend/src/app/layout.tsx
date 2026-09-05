import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: '1Fi — Shop on Mutual-Fund-backed EMIs',
    template: '%s | 1Fi',
  },
  description:
    'The 1Fi Marketplace — buy the products you love on no-cost EMIs backed by your mutual funds. No CIBIL check, instant approval.',
  applicationName: '1Fi',
  icons: {
    icon: 'https://pay.1fi.in/favicon/favicon.svg',
    shortcut: 'https://pay.1fi.in/favicon/favicon.svg',
    apple: 'https://pay.1fi.in/favicon/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#712CDC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
