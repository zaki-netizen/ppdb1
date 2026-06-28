"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Stats {
  total: number;
  verified: number;
  rejected: number;
  pending: number;
  accepted: number;
  bySchool: Record<string, number>;
  byPathway: Record<string, number>;
  averageGPA: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    verified: 0,
    rejected: 0,
    pending: 0,
    accepted: 0,
    bySchool: {},
    byPathway: {},
    averageGPA: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        const registrations = Array.isArray(data) ? data : [];

        // Calculate stats
        const total = registrations.length;
        const verified = registrations.filter((r: any) => r.verification_status === 'verified').length;
        const rejected = registrations.filter((r: any) => r.verification_status === 'rejected').length;
        const pending = registrations.filter((r: any) => r.verification_status === 'pending').length;
        const accepted = registrations.filter((r: any) => r.selection_status === 'accepted').length;

        // By school
        const bySchool: Record<string, number> = {};
        registrations.forEach((r: any) => {
          const schoolName = r.school?.name || 'Unknown';
          bySchool[schoolName] = (bySchool[schoolName] || 0) + 1;
        });

        // By pathway
        const byPathway: Record<string, number> = {};
        registrations.forEach((r: any) => {
          const pathwayName = r.pathway?.pathway_name || 'Unknown';
          byPathway[pathwayName] = (byPathway[pathwayName] || 0) + 1;
        });

        // Average GPA
        const totalGPA = registrations.reduce((sum: number, r: any) => {
          return sum + (parseFloat(r.gpa) || 0);
        }, 0);
        const averageGPA = total > 0 ? (totalGPA / total).toFixed(2) : '0';

        setStats({
          total,
          verified,
          rejected,
          pending,
          accepted,
          bySchool,
          byPathway,
          averageGPA: parseFloat(averageGPA as string),
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
          <span className="text-4xl animate-spin text-blue-600">⟳</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">📊 Laporan & Statistik</h1>
          <p className="text-gray-600">Statistik PPDB 2026</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">Total Pendaftar</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">Terverifikasi</p>
            <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">Ditolak</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">Diterima</p>
            <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">Rata-rata GPA</p>
            <p className="text-3xl font-bold text-blue-600">{stats.averageGPA}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-1">Verifikasi Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* By School */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">📍 Pendaftar per Sekolah</h3>
            <div className="space-y-3">
              {Object.entries(stats.bySchool).length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada data</p>
              ) : (
                Object.entries(stats.bySchool)
                  .sort((a, b) => b[1] - a[1])
                  .map(([school, count]) => (
                    <div key={school}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate">{school}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>

          {/* By Pathway */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">🛤️ Pendaftar per Jalur</h3>
            <div className="space-y-3">
              {Object.entries(stats.byPathway).length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada data</p>
              ) : (
                Object.entries(stats.byPathway)
                  .sort((a, b) => b[1] - a[1])
                  .map(([pathway, count]) => (
                    <div key={pathway}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{pathway}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>

        {/* Verification Progress */}
        <Card className="p-6 mt-6">
          <h3 className="font-bold text-lg mb-4">📈 Progress Verifikasi</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex h-8 rounded-full overflow-hidden bg-gray-200">
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(stats.verified / stats.total) * 100 || 0}%` }}
                >
                  {stats.verified > 0 && stats.verified}
                </div>
                <div
                  className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(stats.pending / stats.total) * 100 || 0}%` }}
                >
                  {stats.pending > 0 && stats.pending}
                </div>
                <div
                  className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(stats.rejected / stats.total) * 100 || 0}%` }}
                >
                  {stats.rejected > 0 && stats.rejected}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Terverifikasi ({((stats.verified / stats.total) * 100 || 0).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Pending ({((stats.pending / stats.total) * 100 || 0).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Ditolak ({((stats.rejected / stats.total) * 100 || 0).toFixed(1)}%)</span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
