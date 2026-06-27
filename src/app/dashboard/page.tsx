"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationBell } from '@/components/NotificationBell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stats {
  total: number;
  verified: number;
  rejected: number;
  pending: number;
}

interface RecentRegistration {
  id: number;
  registration_number: string;
  registration_status: string;
  verification_status: string;
  selection_status: string;
  created_at: string;
  user: {
    full_name: string;
  };
  school: {
    name: string;
  } | null;
}

interface SchoolQuota {
  school_id: number;
  school_name: string;
  pathway_name: string;
  quota: number;
  registered: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, rejected: 0, pending: 0 });
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [schoolQuotas, setSchoolQuotas] = useState<SchoolQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch registrations for stats
      const regResponse = await fetch('/api/registrations');
      if (regResponse.ok) {
        const data = await regResponse.json();
        const registrations = Array.isArray(data) ? data : data.data || [];

        // Calculate stats
        const total = registrations.length;
        const verified = registrations.filter((r: any) => r.verification_status === 'approved').length;
        const rejected = registrations.filter((r: any) => r.verification_status === 'rejected').length;
        const pending = registrations.filter((r: any) => r.verification_status === 'pending').length;

        setStats({ total, verified, rejected, pending });
        setRecentRegistrations(registrations.slice(0, 10));
      }

      // Fetch rankings for quota info
      const rankingResponse = await fetch('/api/rankings?limit=1000');
      if (rankingResponse.ok) {
        const rankingData = await rankingResponse.json();
        // Group by school and pathway
        const quotaMap = new Map<string, SchoolQuota>();

        rankingData.data?.forEach((result: any) => {
          const key = `${result.school_id}-${result.pathway_id}`;
          if (!quotaMap.has(key)) {
            quotaMap.set(key, {
              school_id: result.school_id,
              school_name: result.school?.name || 'Unknown',
              pathway_name: result.pathway?.pathway_name || 'Unknown',
              quota: 100,
              registered: 0,
            });
          }
          const quota = quotaMap.get(key)!;
          if (result.status === 'accepted') {
            quota.registered++;
          }
        });

        setSchoolQuotas(Array.from(quotaMap.values()));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast('error', 'Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

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
        fetchDashboardData();
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified' },
      incomplete: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Incomplete' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
      waitlist: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Waitlist' },
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Recent Registrations */}
          <div className="md:col-span-2">
            <Card className="p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Pendaftaran Terbaru</h2>
                <Link href="/dashboard/registrations" className="text-sm text-blue-600 hover:text-blue-700">
                  Lihat semua →
                </Link>
              </div>
              <div className="overflow-x-auto">
                {recentRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p>Belum ada pendaftaran</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-2">No. Reg</th>
                        <th className="text-left py-3 px-2">Nama</th>
                        <th className="text-left py-3 px-2">Sekolah</th>
                        <th className="text-left py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegistrations.map((reg) => (
                        <tr key={reg.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-mono text-xs">
                            {reg.registration_number}
                          </td>
                          <td className="py-3 px-2">{reg.user.full_name}</td>
                          <td className="py-3 px-2">{reg.school?.name || '-'}</td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(reg.registration_status)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
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

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-700 mb-3">📈 Statistik Cepat</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Verifikasi Rate:</span>
                  <span className="font-semibold">
                    {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reject Rate:</span>
                  <span className="font-semibold">
                    {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-semibold">{stats.pending}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quota Status */}
        <Card className="p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">📊 Status Kuota Sekolah</h2>
            <Link href="/dashboard/schools" className="text-sm text-blue-600 hover:text-blue-700">
              Kelola sekolah →
            </Link>
          </div>
          {schoolQuotas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏫</div>
              <p>Belum ada data kuota</p>
              <p className="text-sm">Data akan muncul setelah ada pendaftar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schoolQuotas.map((quota, index) => {
                const percentage = quota.quota > 0 ? (quota.registered / quota.quota) * 100 : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-900">
                        {quota.school_name}
                      </span>
                      <span className="text-gray-600">
                        {quota.pathway_name}: {quota.registered}/{quota.quota}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          percentage >= 100 ? 'bg-green-500' :
                          percentage >= 75 ? 'bg-blue-500' :
                          percentage >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

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