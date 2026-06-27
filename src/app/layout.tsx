import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
