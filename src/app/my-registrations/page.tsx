"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Registration {
  id: number;
  registration_number: string;
  registration_status: string;
  verification_status: string;
  created_at: string;
}

export default function MyRegistrationsPage() {
  const [loading] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      incomplete: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Belum Lengkap' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terverifikasi' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
    };
    return badges[status] || badges.incomplete;
  };

  if (loading) {
    return (
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <span className="inline-block animate-spin text-4xl text-blue-600">⟳</span>
            <span className="ml-4 text-lg text-gray-600">Memuat...</span>
          </div>
        </div>
      </main>
    );
  }

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