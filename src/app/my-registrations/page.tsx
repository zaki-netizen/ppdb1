"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/FileUpload';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface Registration {
  id: number;
  registration_number: string;
  registration_status: string;
  verification_status: string;
  created_at: string;
}

export default function MyRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      addToast('error', 'Gagal mengambil data pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadComplete = () => {
    addToast('success', 'Dokumen berhasil diunggah!');
  };

  const handleFileUploadError = (error: string) => {
    addToast('error', error);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      incomplete: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Belum Lengkap' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terverifikasi' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
    };
    return badges[status] || badges.incomplete;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg animate-fade-in ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? '✓ ' : '✗ '} {toast.message}
          </div>
        ))}
      </div>

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

        {/* Registrations List */}
        {registrations.length === 0 ? (
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
            {registrations.map((reg) => {
              const badge = getStatusBadge(reg.registration_status);
              return (
                <Card key={reg.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-mono font-bold text-lg text-gray-900">
                          {reg.registration_number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Terdaftar: {formatDate(reg.created_at)}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className={reg.verification_status === 'approved' ? 'text-green-600' : 'text-gray-600'}>
                          {reg.verification_status === 'approved' ? '✓' : '○'} Verifikasi
                        </span>
                        <span className={reg.registration_status === 'submitted' ? 'text-green-600' : 'text-gray-600'}>
                          {reg.registration_status === 'submitted' ? '✓' : '○'} Submitted
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRegistration(reg);
                          setShowUploadModal(true);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        📤 Upload Dokumen
                      </button>
                      <Link
                        href={`/results?registration=${reg.registration_number}`}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        📊 Lihat Hasil
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Document Upload Modal */}
        {showUploadModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upload Dokumen</h2>
                  <p className="text-gray-600 text-sm">
                    No. Registrasi: {selectedRegistration.registration_number}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedRegistration(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* KK Upload */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🏠 Kartu Keluarga (KK)
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Scan/foto KK asli dengan format PDF, JPG, atau PNG (maks 5MB)
                  </p>
                  <FileUpload
                    registrationId={selectedRegistration.id.toString()}
                    documentType="KK"
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleFileUploadError}
                  />
                </div>

                {/* Akta Upload */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    📜 Akta Kelahiran
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Scan/foto Akta Kelahiran dengan format PDF, JPG, atau PNG (maks 5MB)
                  </p>
                  <FileUpload
                    registrationId={selectedRegistration.id.toString()}
                    documentType="Akta"
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleFileUploadError}
                  />
                </div>

                {/* Sertifikat Upload */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🏆 Sertifikat Prestasi
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Scan/foto sertifikat prestasi (jika ada) dengan format PDF, JPG, atau PNG (maks 5MB)
                  </p>
                  <FileUpload
                    registrationId={selectedRegistration.id.toString()}
                    documentType="Sertifikat"
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleFileUploadError}
                  />
                </div>

                {/* Raport Upload */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    📚 Raport
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Scan/foto rapor semester 1-5 dengan format PDF, JPG, atau PNG (maks 5MB)
                  </p>
                  <FileUpload
                    registrationId={selectedRegistration.id.toString()}
                    documentType="Raport"
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleFileUploadError}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedRegistration(null);
                  }}
                  className="w-full"
                >
                  Selesai
                </Button>
              </div>
            </Card>
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