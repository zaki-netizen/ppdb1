"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Document {
  id: number;
  registration_id: number;
  document_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  registration: {
    id: number;
    registration_number: string;
    user: {
      full_name: string;
      email: string;
    };
  };
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function DocumentVerificationPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // In a real app, you'd have a dedicated admin documents endpoint
      // For now, we'll fetch all documents (admin only)
      const response = await fetch('/api/documents?registrationId=1');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      addToast('error', 'Gagal mengambil data dokumen');
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async (docId: number, status: 'approved' | 'rejected', reason?: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/documents/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId, status, rejectionReason: reason }),
      });

      if (response.ok) {
        addToast('success', `Dokumen berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
        setSelectedDoc(null);
        setRejectReason('');
        fetchDocuments();
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Gagal memproses dokumen');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      addToast('error', 'Terjadi kesalahan saat memproses');
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getDocTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      KK: '🏠',
      Akta: '📜',
      Sertifikat: '🏆',
      Raport: '📚',
    };
    return icons[type] || '📄';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
    };
    return badges[status] || badges.pending;
  };

  const filteredDocuments = filter === 'all'
    ? documents
    : documents.filter((d) => d.verification_status === filter);

  const pendingCount = documents.filter((d) => d.verification_status === 'pending').length;

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <span className="inline-block animate-spin text-4xl text-blue-600">⟳</span>
            <span className="ml-4 text-lg text-gray-600">Memuat dokumen...</span>
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Kembali
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Verifikasi Dokumen</h1>
            </div>
            <p className="text-gray-600 mt-1">
              Periksa dan verifikasi kelengkapan berkas pendaftar
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
              {pendingCount} dokumen menunggu verifikasi
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'pending' ? `Pending (${pendingCount})` : f === 'approved' ? 'Disetujui' : 'Ditolak'}
            </button>
          ))}
        </div>

        {/* Document List */}
        {filteredDocuments.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'pending' ? 'Tidak ada dokumen pending' : 'Tidak ada dokumen'}
            </h3>
            <p className="text-gray-500">
              {filter === 'pending'
                ? 'Semua dokumen sudah diverifikasi'
                : 'Tidak ada dokumen dalam kategori ini'}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => {
              const badge = getStatusBadge(doc.verification_status);
              return (
                <Card
                  key={doc.id}
                  className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedDoc?.id === doc.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex gap-4">
                    {/* Document Icon */}
                    <div className="text-4xl">{getDocTypeIcon(doc.document_type)}</div>

                    {/* Document Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {doc.document_type}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doc.registration.user.full_name}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>No. Reg: {doc.registration.registration_number}</p>
                        <p>Size: {formatFileSize(doc.file_size)}</p>
                        <p>Upload: {formatDate(doc.created_at)}</p>
                      </div>

                      {doc.verification_status === 'rejected' && doc.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          Alasan penolakan: {doc.rejection_reason}
                        </div>
                      )}

                      {/* Actions */}
                      {doc.verification_status === 'pending' && (
                        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            onClick={() => verifyDocument(doc.id, 'approved')}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✓ Setuju
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDoc(doc)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            ✗ Tolak
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6">
              <h2 className="text-xl font-bold mb-4">Detail Dokumen</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Jenis Dokumen</p>
                    <p className="font-semibold">
                      {getDocTypeIcon(selectedDoc.document_type)} {selectedDoc.document_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      getStatusBadge(selectedDoc.verification_status).bg
                    } ${getStatusBadge(selectedDoc.verification_status).text}`}>
                      {getStatusBadge(selectedDoc.verification_status).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nama Pemohon</p>
                    <p className="font-semibold">{selectedDoc.registration.user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedDoc.registration.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">No. Registrasi</p>
                    <p className="font-semibold">{selectedDoc.registration.registration_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="font-semibold">{formatFileSize(selectedDoc.file_size)}</p>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  {selectedDoc.mime_type.includes('image') ? (
                    <img
                      src={selectedDoc.file_path}
                      alt={selectedDoc.document_type}
                      className="max-h-64 mx-auto rounded"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-600">PDF Document</p>
                      <a
                        href={selectedDoc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Buka di tab baru
                      </a>
                    </div>
                  )}
                </div>

                {/* Rejection Reason Input */}
                {selectedDoc.verification_status === 'pending' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alasan Penolakan (opsional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Masukkan alasan penolakan..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDoc(null);
                    setRejectReason('');
                  }}
                  className="flex-1"
                >
                  Tutup
                </Button>
                {selectedDoc.verification_status === 'pending' && (
                  <>
                    <Button
                      onClick={() => verifyDocument(selectedDoc.id, 'approved')}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      ✓ Setujui
                    </Button>
                    <Button
                      onClick={() => verifyDocument(selectedDoc.id, 'rejected', rejectReason)}
                      disabled={processing}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      ✗ Tolak
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}