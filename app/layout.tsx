import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ORDA Direct | Direct Ordering Platform for Food Businesses',
  description:
    'ORDA Direct is a direct-ordering platform for restaurants, food trucks, pop-ups, caterers, and food businesses that want customers ordering directly.',

  openGraph: {
    title: 'ORDA Direct',
    description:
      'ORDA Direct is a direct-ordering platform for restaurants, food trucks, pop-ups, caterers, and food businesses that want customers ordering directly.',
    url: 'https://www.ordadirect.com',
    siteName: 'ORDA Direct',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'ORDA Direct',
    description:
      'ORDA Direct is a direct-ordering platform for restaurants, food trucks, pop-ups, caterers, and food businesses that want customers ordering directly.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
