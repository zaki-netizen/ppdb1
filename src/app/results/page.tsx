"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SelectionResult {
  id: number;
  final_rank: number;
  final_score: string;
  status: 'accepted' | 'rejected' | 'waitlist';
  announcement_date: string | null;
  registration: {
    id: number;
    nisn: string;
    registration_number: string;
    registration_status: string;
    gpa: string | null;
    certificate_points: number | null;
    total_score: string | null;
    user: {
      full_name: string;
    };
  };
  school: {
    id: number;
    name: string;
    level: string;
  };
  pathway: {
    id: number;
    pathway_name: string;
  };
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function ResultsPage() {
  const [searchType, setSearchType] = useState<'nisn' | 'registration'>('nisn');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SelectionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      addToast('error', 'Masukkan NISN atau Nomor Registrasi');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Search by fetching all results and filtering client-side
      // In production, you'd have a dedicated search endpoint
      const response = await fetch('/api/rankings');

      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }

      const data = await response.json();

      // Filter results based on search query
      const filteredResults = data.data.filter((result: SelectionResult) => {
        if (searchType === 'nisn') {
          return result.registration.nisn === searchQuery;
        } else {
          return result.registration.registration_number.toLowerCase().includes(searchQuery.toLowerCase());
        }
      });

      setResults(filteredResults);

      if (filteredResults.length === 0) {
        addToast('info', 'Tidak ada hasil yang ditemukan. Pastikan NISN/No. Registrasi benar.');
      } else {
        addToast('success', `Ditemukan ${filteredResults.length} hasil`);
      }
    } catch (error) {
      console.error('Search error:', error);
      addToast('error', 'Terjadi kesalahan saat mencari hasil');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'DITERIMA' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'DITOLAK' },
      waitlist: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'CADANGAN' },
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'MENUNGGU' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusGradient = (status: string) => {
    const gradients = {
      accepted: 'from-green-50 to-green-100',
      rejected: 'from-red-50 to-red-100',
      waitlist: 'from-yellow-50 to-yellow-100',
      pending: 'from-gray-50 to-gray-100',
    };
    return gradients[status as keyof typeof gradients] || gradients.pending;
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎓 Pengumuman Hasil Seleksi
          </h1>
          <p className="text-gray-600">PPDB 2026 - Sistem Penerimaan Peserta Didik Baru</p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🔍 Cari Hasil Anda</h2>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Type Toggle */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="nisn"
                  checked={searchType === 'nisn'}
                  onChange={() => setSearchType('nisn')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Cari dengan NISN</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="registration"
                  checked={searchType === 'registration'}
                  onChange={() => setSearchType('registration')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Cari dengan No. Registrasi</span>
              </label>
            </div>

            {/* Search Input */}
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder={
                  searchType === 'nisn'
                    ? 'Masukkan 16 digit NISN'
                    : 'Masukkan No. Registrasi (contoh: REG-123456-789)'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-lg py-3"
                maxLength={searchType === 'nisn' ? 16 : 50}
              />
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <span className="inline-block animate-spin">⟳</span>
                ) : (
                  'Cari'
                )}
              </Button>
            </div>
          </form>

          {/* Quick Demo Buttons */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Demo - klik untuk otomatis isi:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSearchType('nisn');
                  setSearchQuery('1234567890123456');
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                NISN Demo
              </button>
              <button
                onClick={() => {
                  setSearchType('registration');
                  setSearchQuery('REG-');
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                No. Registrasi
              </button>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-500">
                  Pastikan NISN atau No. Registrasi yang Anda masukkan sudah benar.
                  <br />
                  Hasil seleksi belum diumumkan atau data tidak ditemukan.
                </p>
              </Card>
            ) : (
              results.map((result) => (
                <Card
                  key={result.id}
                  className={`p-6 shadow-lg bg-gradient-to-r ${getStatusGradient(result.status)}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column - Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Nomor Registrasi</p>
                          <p className="text-lg font-bold text-gray-900">
                            {result.registration.registration_number}
                          </p>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Nama Peserta</p>
                          <p className="font-semibold text-gray-900">
                            {result.registration.user.full_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">NISN</p>
                          <p className="font-semibold text-gray-900">
                            {result.registration.nisn}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sekolah Tujuan</p>
                          <p className="font-semibold text-gray-900">
                            {result.school.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Jalur Pendaftaran</p>
                          <p className="font-semibold text-gray-900">
                            {result.pathway.pathway_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Scores */}
                    <div className="md:w-64 space-y-4">
                      <div className="bg-white bg-opacity-70 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Skor</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {parseFloat(result.final_score).toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-white bg-opacity-70 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Peringkat</p>
                        <p className="text-3xl font-bold text-gray-900">
                          #{result.final_rank}
                        </p>
                      </div>

                      {result.announcement_date && (
                        <div className="text-xs text-gray-500 text-center">
                          Diumumkan: {new Date(result.announcement_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status-specific message */}
                  {result.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-green-500 bg-opacity-20 rounded-lg">
                      <p className="text-green-800 font-semibold">
                        🎉 Selamat! Anda dinyatakan diterima di {result.school.name}.
                        Silakan lakukan daftar ulang sesuai jadwal yang ditentukan.
                      </p>
                    </div>
                  )}
                  {result.status === 'waitlist' && (
                    <div className="mt-4 p-4 bg-yellow-500 bg-opacity-20 rounded-lg">
                      <p className="text-yellow-800 font-semibold">
                        ⏳ Anda masuk dalam daftar tunggu. Tetap pantau informasi lebih lanjut.
                      </p>
                    </div>
                  )}
                  {result.status === 'rejected' && (
                    <div className="mt-4 p-4 bg-red-500 bg-opacity-20 rounded-lg">
                      <p className="text-red-800 font-semibold">
                        😔 Mohon maaf, Anda belum diterima. Jangan menyerah, masih ada kesempatan di jalur lain.
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Info Box */}
        {!hasSearched && (
          <Card className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Informasi Penting</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Pengumuman hasil seleksi resmi diumumkan pada <strong>15 Juni 2026</strong></li>
              <li>• Gunakan NISN atau Nomor Registrasi untuk melihat hasil</li>
              <li>• Nomor Registrasi terdapat di bukti pendaftaran Anda</li>
              <li>• Hubungi panitia jika ada kendala dalam pencarian</li>
            </ul>
          </Card>
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