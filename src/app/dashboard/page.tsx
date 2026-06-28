"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationBell } from '@/components/NotificationBell';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, verified: 0, rejected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [toasts, setToasts] = useState<Array<{id: string, type: 'success' | 'error' | 'info', message: string}>>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const regResponse = await fetch('/api/registrations');
        if (regResponse.ok) {
          const data = await regResponse.json();
          const registrations = Array.isArray(data) ? data : data.data || [];

          const total = registrations.length;
          const verified = registrations.filter((r: any) => r.verification_status === 'approved').length;
          const rejected = registrations.filter((r: any) => r.verification_status === 'rejected').length;
          const pending = registrations.filter((r: any) => r.verification_status === 'pending').length;

          setStats({ total, verified, rejected, pending });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleRecalculateRankings = async () => {
    setRecalculating(true);
    try {
      const response = await fetch('/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        addToast('success', `Ranking berhasil dihitung ulang! ${data.totalRanked} pendaftar di-ranking.`);
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Gagal menghitung ranking');
      }
    } catch (error) {
      console.error('Error recalculating rankings:', error);
      addToast('error', 'Terjadi kesalahan saat menghitung ranking');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <span className="inline-block animate-spin text-4xl text-blue-600">⟳</span>
            <span className="ml-4 text-lg text-gray-600">Memuat dashboard...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg animate-fade-in ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {toast.type === 'success' ? '✓ ' : toast.type === 'error' ? '✗ ' : 'ℹ '}
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600">Sistem PPDB 2026 - Monitoring & Kontrol</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Kembali ke Beranda
            </Link>
            <NotificationBell />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-l-4 border-l-blue-500">
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-2">Total Pendaftar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-l-4 border-l-green-500">
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-2">Terverifikasi</p>
                <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-l-4 border-l-red-500">
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-2">Ditolak</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-l-4 border-l-yellow-500">
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">⚡ Aksi Cepat</h2>
          <div className="space-y-3">
            <button
              onClick={handleRecalculateRankings}
              disabled={recalculating}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {recalculating ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Menghitung...
                </>
              ) : (
                '📊 Hitung Ranking'
              )}
            </button>
            <Link href="/dashboard/notifications" className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold text-center transition-colors">
              📬 Kirim Notifikasi
            </Link>
            <Link href="/dashboard/export" className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold text-center transition-colors">
              📥 Export Data
            </Link>
            <Link href="/dashboard/verify" className="block w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold text-center transition-colors">
              ✅ Verifikasi Batch
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/registrations" className="block p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">👥</div>
              <div>
                <h3 className="font-semibold text-gray-900">Kelola Pendaftaran</h3>
                <p className="text-sm text-gray-500">Lihat & verifikasi semua pendaftar</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/documents" className="block p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📄</div>
              <div>
                <h3 className="font-semibold text-gray-900">Verifikasi Dokumen</h3>
                <p className="text-sm text-gray-500">Periksa & approve berkas</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/reports" className="block p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="font-semibold text-gray-900">Laporan</h3>
                <p className="text-sm text-gray-500">Generate laporan & statistik</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}