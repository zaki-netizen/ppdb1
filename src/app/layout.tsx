import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPDB Portal - Sistem Penerimaan Peserta Didik Baru',
  description:
    'Platform pendaftaran online untuk penerimaan peserta didik baru di sekolah',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}