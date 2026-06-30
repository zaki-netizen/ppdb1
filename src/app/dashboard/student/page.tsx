"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Registration {
  id: number;
  registration_number: string;
  nisn: string;
  registration_status: string;
  verification_status: string;
  selection_status: string;
  daftar_ulang_completed: boolean;
  current_rank: number | null;
  gpa: string;
  total_score: string;
  city: string;
  province: string;
  created_at: string;
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
}

export default function StudentDashboard() {
  const [session, setSession] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session first
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        if (!sessionData || !sessionData.email) {
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(sessionData);
        console.log('[DEBUG] Logged in as:', sessionData.email);

        // Fetch registrations
        const regRes = await fetch('/api/registrations');
        const regData = await regRes.json();

        // Filter by current user email
        const regs: Registration[] = Array.isArray(regData)
          ? regData.filter((r: any) => r.user?.email === sessionData.email)
          : [];
        console.log('[DEBUG] Found registrations:', regs.length);

        setRegistrations(regs);
      } catch (err) {
        console.error('[DEBUG] Error:', err);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      incomplete: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Belum Lengkap' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Terkirim' },
      verified: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terverifikasi' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: '🎉 DITERIMA' },
      waitlist: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Daftar Tunggu' },
    };
    const s = styles[status] || styles.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">📚</div>
            <p className="text-lg text-gray-600">Memuat data pendaftaran...</p>
          </div>
        </div>
      </main>
    );
  }

  // Not authenticated state
  if (!session) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Diperlukan</h2>
            <p className="text-gray-600 mb-6">Silakan login untuk melihat status pendaftaran Anda.</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
              Login Sekarang
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎓 Dashboard Peserta</h1>
            <p className="text-gray-600">Selamat datang di Portal PPDB!</p>
            {session?.email && <p className="text-sm text-gray-500">Login sebagai: {session.email}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative">
              <span className="text-2xl">🔔</span>
            </Link>
            <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
              Logout
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/register" className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="font-semibold text-gray-900">Pendaftaran Baru</p>
          </Link>
          <Link href="/dashboard/student/cek-hasil" className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="text-3xl mb-2">🎓</div>
            <p className="font-semibold text-gray-900">Cek Hasil</p>
          </Link>
          <Link href="/dashboard/student/daftar-ulang" className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold text-gray-900">Daftar Ulang</p>
          </Link>
        </div>

        {/* Error State */}
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

        {/* Registrations */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📊 Status Pendaftaran Saya</h2>
          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-600 mb-2">Belum ada pendaftaran</p>
              <p className="text-sm text-gray-500 mb-4">
                Anda belum melakukan pendaftaran. Silakan daftar terlebih dahulu.
              </p>
              <Link href="/register" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 inline-block">
                Daftar Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div key={reg.id} className={`border rounded-lg p-4 ${reg.selection_status === 'accepted' ? 'border-green-500 bg-green-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{reg.school?.name || 'Sekolah'}</p>
                      <p className="text-sm text-gray-500 font-mono">{reg.registration_number}</p>
                      {reg.user && (
                        <p className="text-xs text-gray-400">Pendaftar: {reg.user.full_name}</p>
                      )}
                    </div>
                    {getStatusBadge(reg.selection_status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <span className="text-gray-500">Jalur:</span>
                      <p className="font-medium">{reg.pathway?.pathway_name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ranking:</span>
                      <p className="font-bold text-lg text-green-600">
                        {reg.current_rank ? `#${reg.current_rank}` : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Skor:</span>
                      <p className="font-medium">{reg.total_score || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>
                      <p className="font-medium">{reg.created_at ? new Date(reg.created_at).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs text-gray-500">Status:</span>
                    {getStatusBadge(reg.registration_status)}
                    {getStatusBadge(reg.verification_status)}
                  </div>
                  {reg.selection_status === 'accepted' && (
                    reg.daftar_ulang_completed ? (
                      <div className="mt-3 bg-green-100 text-green-800 py-2 px-4 rounded-lg font-bold text-center">
                        ✅ Pendaftaran Ulang Completed
                      </div>
                    ) : (
                      <Link href="/dashboard/student/daftar-ulang" className="block mt-3 bg-green-600 text-white py-2 rounded-lg font-bold text-center hover:bg-green-700">
                        🎉 Daftar Ulang Sekarang
                      </Link>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Pastikan data sesuai dokumen asli</li>
              <li>• Cek secara berkala untuk update</li>
              <li>• Hubungi admin jika ada pertanyaan</li>
            </ul>
          </Card>
          <Card className="p-6 bg-orange-50 border-orange-200">
            <h3 className="font-bold text-orange-900 mb-3">📞 Kontak</h3>
            <ul className="text-sm text-orange-800 space-y-2">
              <li>• Email: admin@ppdb.test</li>
              <li>• Jam: 08:00 - 16:00 WIB</li>
            </ul>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}