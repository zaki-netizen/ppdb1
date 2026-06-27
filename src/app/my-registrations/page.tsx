"use client";

import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function MyRegistrationsPage() {
  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pendaftaran Saya</h1>
              <p className="text-gray-600">Kelola pendaftaran dan upload dokumen</p>
            </div>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              + Pendaftaran Baru
            </Link>
          </div>
        </div>

        {/* Empty State */}
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Belum Ada Pendaftaran
          </h3>
          <p className="text-gray-500 mb-6">
            Anda belum melakukan pendaftaran. Silakan daftar terlebih dahulu.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Daftar Sekarang
          </Link>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}