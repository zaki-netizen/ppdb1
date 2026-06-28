"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';

interface Registration {
  id: number;
  registration_number: string;
  nisn: string;
  registration_status: string;
  verification_status: string;
  selection_status: string;
  current_rank: number | null;
  user?: {
    full_name: string;
    email: string;
  };
  school?: {
    name: string;
  };
  pathway?: {
    pathway_name: string;
  };
  city: string;
  province: string;
  created_at: string;
}

export default function MyRegistrationsPage() {
  const { data: session, status } = useSession();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      setError(null);

      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const email = session.user.email;
        console.log('[MyRegistrations] Fetching for email:', email);

        const response = await fetch(`/api/registrations?email=${encodeURIComponent(email)}`);

        if (!response.ok) {
          throw new Error('Gagal mengambil data dari server');
        }

        const data = await response.json();
        console.log('[MyRegistrations] API Response:', data);

        const regs: Registration[] = Array.isArray(data) ? data : data.data || [];
        setRegistrations(regs);
      } catch (err) {
        console.error('[MyRegistrations] Error:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchRegistrations();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      incomplete: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Belum Lengkap' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Terkirim' },
      verified: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terverifikasi' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: '🎉 Diterima' },
      waitlist: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Daftar Tunggu' },
    };
    const style = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">📋</div>
              <span className="inline-block animate-spin text-4xl text-blue-600 mb-4">⟳</span>
              <p className="text-lg text-gray-600">Memuat data pendaftaran...</p>
            </div>
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
              <h1 className="text-3xl font-bold text-gray-900">📋 Pendaftaran Saya</h1>
              <p className="text-gray-600">
                {session?.user?.email ? `Login sebagai ${session.user.email}` : 'Halaman pendaftar'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Refresh
              </button>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                + Pendaftaran Baru
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Klik untuk refresh
            </button>
          </div>
        )}

        {/* Not Logged In */}
        {!session?.user ? (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Login Diperlukan
            </h3>
            <p className="text-gray-500 mb-6">
              Silakan login untuk melihat pendaftaran Anda.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Login Sekarang
            </Link>
          </Card>
        ) : registrations.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <Card key={reg.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      🏫 {reg.school?.name || 'Sekolah Tidak Diketahui'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      No. Registrasi: <strong className="font-mono">{reg.registration_number}</strong>
                    </p>
                    {reg.user && (
                      <p className="text-xs text-gray-400">
                        Pendaftar: {reg.user.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(reg.selection_status)}
                    {getStatusBadge(reg.verification_status)}
                    {getStatusBadge(reg.registration_status)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">NISN:</span>
                    <span className="ml-2 font-medium font-mono">{reg.nisn}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Jalur:</span>
                    <span className="ml-2 font-medium">{reg.pathway?.pathway_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kota:</span>
                    <span className="ml-2 font-medium">{reg.city || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ranking:</span>
                    <span className={`ml-2 font-bold ${reg.current_rank ? 'text-green-600' : 'text-gray-500'}`}>
                      {reg.current_rank ? `#${reg.current_rank}` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tanggal Daftar:</span>
                    <span className="ml-2 font-medium">
                      {reg.created_at ? new Date(reg.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : '-'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
                  <Link
                    href={`/my-registrations/${reg.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    📄 Detail →
                  </Link>
                  <Link
                    href="/dashboard/student"
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    📊 Dashboard →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

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