"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface SearchResult {
  id: number;
  registration_number: string;
  nisn: string;
  registration_status: string;
  verification_status: string;
  selection_status: string;
  current_rank: number | null;
  school?: {
    name: string;
  };
  pathway?: {
    pathway_name: string;
  };
}

export default function ResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || 'Terjadi kesalahan');
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Terjadi kesalahan koneksi');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ DITERIMA' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: '❌ DITOLAK' },
      waitlist: { bg: 'bg-orange-100', text: 'text-orange-700', label: '⏳ DAFTAR TUNGGU' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⏳ MENUNGGU' },
      verified: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📋 VERIFIKASI' },
      submitted: { bg: 'bg-gray-100', text: 'text-gray-700', label: '📝 TERKIRIM' },
    };
    const style = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 Pengumuman Hasil Seleksi</h1>
          <p className="text-gray-600">PPDB 2026 - SMA Negeri</p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">🔍 Cari Hasil Pendaftaran</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan NISN atau No. Registrasi"
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-blue-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Cari...
                </>
              ) : (
                '🔍 Cari'
              )}
            </button>
          </form>
        </Card>

        {/* Results */}
        {searched && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <span className="inline-block animate-spin text-4xl text-blue-600">⟳</span>
                <p className="mt-4 text-gray-600">Mencari...</p>
              </div>
            ) : error ? (
              <Card className="p-6 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium">{error}</p>
              </Card>
            ) : results.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Data Tidak Ditemukan
                </h3>
                <p className="text-gray-500">
                  Tidak ada hasil untuk &quot;{searchQuery}&quot;. Pastikan NISN atau No. Registrasi benar.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {results.map((result) => (
                  <Card key={result.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {result.school?.name || 'Sekolah'}
                        </h3>
                        <p className="text-gray-600">
                          {result.pathway?.pathway_name || 'Jalur'}
                        </p>
                      </div>
                      {getStatusBadge(result.selection_status)}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">No. Registrasi:</span>
                          <p className="font-bold text-gray-900">{result.registration_number}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">NISN:</span>
                          <p className="font-bold text-gray-900">{result.nisn}</p>
                        </div>
                        {result.current_rank && (
                          <div>
                            <span className="text-gray-500">Ranking:</span>
                            <p className="font-bold text-2xl text-blue-600">#{result.current_rank}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {getStatusBadge(result.registration_status)}
                      {getStatusBadge(result.verification_status)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Box - Shown before search */}
        {!searched && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-blue-900 mb-2">📌 Informasi Penting</h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Masukkan <strong>NISN</strong> atau <strong>No. Registrasi</strong> untuk melihat hasil</li>
              <li>• No. Registrasi formato: <code className="bg-blue-100 px-2 py-1 rounded">REG-2026-XXXXXX-XXX</code></li>
              <li>• Pengumuman hasil resmi akan diumumkan pada <strong>26 Juni 2026</strong></li>
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}