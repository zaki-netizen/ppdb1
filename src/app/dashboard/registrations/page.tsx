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
  current_rank: number | null;
  gpa: string;
  total_score: string;
  city: string;
  province: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
    phone_number: string;
  };
  school?: {
    name: string;
  };
  pathway?: {
    pathway_name: string;
  };
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      addToast('error', 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, status: 'verified' | 'rejected') => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/registrations/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        addToast('success', `Pendaftaran berhasil di${status === 'verified' ? 'verifikasi' : 'tolak'}`);
        fetchRegistrations();
        setSelectedReg(null);
      } else {
        addToast('error', 'Gagal memproses');
      }
    } catch (error) {
      addToast('error', 'Terjadi kesalahan');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRegs = registrations.filter((reg) => {
    const matchesFilter = filter === 'all' || reg.verification_status === filter;
    const matchesSearch =
      searchQuery === '' ||
      reg.nisn.includes(searchQuery) ||
      reg.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      verified: { bg: 'bg-green-100', text: 'text-green-800' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800' },
      waitlist: { bg: 'bg-orange-100', text: 'text-orange-800' },
    };
    const s = styles[status] || styles.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <span className="text-4xl animate-spin text-blue-600">⟳</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gray-50">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${
              t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">📋 Kelola Pendaftaran</h1>
            <p className="text-gray-600">Total: {registrations.length} pendaftar</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Cari NISN, No. Registrasi, Nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[250px] px-4 py-2 border rounded-lg"
            />
            <div className="flex gap-2">
              {['all', 'pending', 'verified', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pendaftar</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">No. Reg</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sekolah</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nilai</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredRegs.map((reg, index) => (
                    <tr key={reg.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{reg.user?.full_name || '-'}</p>
                          <p className="text-xs text-gray-500">{reg.nisn}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{reg.registration_number}</td>
                      <td className="px-4 py-3 text-sm">
                        {reg.school?.name || '-'}
                        <br />
                        <span className="text-xs text-gray-500">{reg.pathway?.pathway_name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{reg.gpa}</p>
                          <p className="text-xs text-gray-500">Score: {reg.total_score}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {getStatusBadge(reg.verification_status)}
                          {getStatusBadge(reg.selection_status)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Detail →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Detail Pendaftaran</h2>
              <button onClick={() => setSelectedReg(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Nama Lengkap</label>
                  <p className="font-medium">{selectedReg.user?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">NISN</label>
                  <p className="font-mono">{selectedReg.nisn}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p>{selectedReg.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">No. HP</label>
                  <p>{selectedReg.user?.phone_number}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm text-gray-500">No. Registrasi</label>
                <p className="font-mono font-bold">{selectedReg.registration_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Sekolah</label>
                  <p>{selectedReg.school?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Jalur</label>
                  <p>{selectedReg.pathway?.pathway_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Nilai GPA</label>
                  <p>{selectedReg.gpa}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Total Score</label>
                  <p>{selectedReg.total_score}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm text-gray-500">Alamat</label>
                <p>{selectedReg.city}, {selectedReg.province}</p>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm text-gray-500">Status</label>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(selectedReg.registration_status)}
                  {getStatusBadge(selectedReg.verification_status)}
                  {getStatusBadge(selectedReg.selection_status)}
                </div>
              </div>

              {selectedReg.verification_status === 'pending' && (
                <div className="border-t pt-4 flex gap-3">
                  <button
                    onClick={() => handleVerify(selectedReg.id, 'verified')}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    ✅ Verifikasi
                  </button>
                  <button
                    onClick={() => handleVerify(selectedReg.id, 'rejected')}
                    disabled={processing}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    ❌ Tolak
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
