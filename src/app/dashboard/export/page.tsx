"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'registrations',
    label: 'Data Pendaftaran',
    description: 'Export semua data pendaftaran siswa baru',
    icon: '📋',
  },
  {
    id: 'verified',
    label: 'Pendaftar Terverifikasi',
    description: 'Export pendaftar yang sudah diverifikasi',
    icon: '✅',
  },
  {
    id: 'pending',
    label: 'Pendaftar Pending',
    description: 'Export pendaftar yang belum diverifikasi',
    icon: '⏳',
  },
  {
    id: 'accepted',
    label: 'Hasil Diterima',
    description: 'Export siswa yang diterima berdasarkan ranking',
    icon: '🎓',
  },
];

export default function ExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleExport = async (type: string) => {
    setExporting(type);

    try {
      // Fetch data based on type
      const response = await fetch(`/api/export?type=${type}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();

      // Convert to CSV
      if (data.length === 0) {
        showToast('error', 'Tidak ada data untuk di-export');
        setExporting(null);
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row: any) =>
          headers.map((h) => `"${row[h] ?? ''}"`).join(',')
        ),
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ppdb-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showToast('success', `Berhasil export ${data.length} data!`);
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', 'Gagal export data');
    } finally {
      setExporting(null);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">📥 Export Data</h1>
          <p className="text-gray-600">Download data PPDB dalam format CSV</p>
        </div>

        {/* Export Options */}
        <div className="grid md:grid-cols-2 gap-4">
          {exportOptions.map((option) => (
            <Card key={option.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleExport(option.id)}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                <div className="flex items-center">
                  {exporting === option.id ? (
                    <span className="text-2xl animate-spin text-blue-600">⟳</span>
                  ) : (
                    <span className="text-2xl text-gray-400">→</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Informasi</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• File yang di-export berformat CSV yang bisa dibuka dengan Excel/Google Sheets</li>
            <li>• Data termasuk semua field sesuai kategori yang dipilih</li>
            <li>• Pastikan koneksi internet stabil saat export data besar</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
