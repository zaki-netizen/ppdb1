"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { FileUpload, UploadedFile } from '@/components/FileUpload';

interface Registration {
  id: number;
  registration_number: string;
  nisn: string;
  selection_status: string;
  daftar_ulang_completed: boolean;
  parent_name: string | null;
  parent_phone: string | null;
  current_rank: number | null;
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

interface DocumentStatus {
  uploaded: string[];
  required: string[];
  missing: string[];
  uploadedDetails: any[];
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Document types required for daftar ulang
const REQUIRED_DOCS = [
  { type: 'Ijazah' as const, label: 'Ijazah/Surat Keterangan Lulus', icon: '📜', required: true },
  { type: 'KK' as const, label: 'Kartu Keluarga', icon: '🏠', required: true },
  { type: 'Raport' as const, label: 'Raport Semester 1-5', icon: '📚', required: true },
  { type: 'Foto' as const, label: 'Pas Foto 3x4', icon: '📷', required: true },
  { type: 'Akta' as const, label: 'Akta Kelahiran', icon: '📋', required: true },
  { type: 'Sertifikat' as const, label: 'Sertifikat Prestasi', icon: '🏆', required: false },
];

export default function DaftarUlangPage() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Set<string>>(new Set());
  const [currentRegId, setCurrentRegId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    studentName: '',
    nisn: '',
    schoolName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    notes: '',
  });

  useEffect(() => {
    fetchAcceptedRegistrations();
  }, [session]);

  const fetchAcceptedRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        let allRegs: Registration[] = Array.isArray(data) ? data : [];

        // Filter by user email from session
        const userEmail = (session?.user as any)?.email;

        if (userEmail) {
          allRegs = allRegs.filter((r) => r.user?.email === userEmail);
        }

        // Only accepted registrations
        const acceptedRegs = allRegs.filter((r) => r.selection_status === 'accepted');
        setRegistrations(acceptedRegs);

        if (acceptedRegs.length > 0) {
          const reg = acceptedRegs[0];
          setCurrentRegId(reg.id);
          setFormData(prev => ({
            ...prev,
            studentName: reg.user?.full_name || '',
            nisn: reg.nisn || '',
            schoolName: reg.school?.name || '',
            parentName: reg.parent_name || '',
            parentPhone: reg.parent_phone || '',
          }));

          // Fetch document status
          fetchDocumentStatus(reg.id);
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      addToast('error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentStatus = async (regId: number) => {
    try {
      const response = await fetch(`/api/daftar-ulang?registrationId=${regId}`);
      if (response.ok) {
        const data = await response.json();
        setDocumentStatus(data.documents);
        setUploadedDocuments(new Set(data.documents.uploaded));
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
    }
  };

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleUploadComplete = (docType: string, file: UploadedFile) => {
    if (file.status === 'success') {
      setUploadedDocuments(prev => new Set([...prev, docType]));
      addToast('success', `${docType} berhasil diupload`);

      // Refresh document status
      if (currentRegId) {
        fetchDocumentStatus(currentRegId);
      }
    }
  };

  const handleUploadError = (error: string) => {
    addToast('error', error);
  };

  const isAllDocumentsUploaded = () => {
    const requiredTypes = REQUIRED_DOCS.filter(d => d.required).map(d => d.type);
    return requiredTypes.every(type => uploadedDocuments.has(type));
  };

  const getMissingDocuments = () => {
    const requiredTypes = REQUIRED_DOCS.filter(d => d.required).map(d => d.type);
    return requiredTypes.filter(type => !uploadedDocuments.has(type));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate documents
    if (!isAllDocumentsUploaded()) {
      const missing = getMissingDocuments();
      addToast('error', `Dokumen wajib belum lengkap: ${missing.join(', ')}`);
      return;
    }

    // Validate parent data
    if (!formData.parentName.trim()) {
      addToast('error', 'Nama orang tua wajib diisi');
      return;
    }

    if (!formData.parentPhone.trim()) {
      addToast('error', 'No. HP orang tua wajib diisi');
      return;
    }

    if (!currentRegId) {
      addToast('error', 'Registration ID tidak ditemukan');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/daftar-ulang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: currentRegId.toString(),
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          parentEmail: formData.parentEmail,
          documentTypes: Array.from(uploadedDocuments),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        addToast('success', '🎉 Pendaftaran ulang berhasil!');
      } else {
        addToast('error', data.error || 'Gagal mengirim');
      }
    } catch (error) {
      console.error('Submit error:', error);
      addToast('error', 'Terjadi kesalahan server');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">📚</div>
            <p className="text-lg text-gray-600">Memuat data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (registrations.length === 0) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard/student" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Kembali ke Dashboard
          </Link>

          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h1 className="text-2xl font-bold mb-2">Belum Ada Pendaftaran Diterima</h1>
            <p className="text-gray-600 mb-6">
              Anda belum memiliki pendaftaran yang diterima.
            </p>
            <Link href="/dashboard/student/cek-hasil" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Cek Hasil Seleksi
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center bg-green-50 border-green-200">
            <div className="text-7xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">Pendaftaran Ulang Berhasil!</h1>
            <p className="text-green-700 mb-6">
              Terima kasih telah melengkapi pendaftaran ulang.
            </p>
            <div className="bg-white rounded-lg p-4 text-left mb-6">
              <p><strong>Siswa:</strong> {formData.studentName}</p>
              <p><strong>NISN:</strong> {formData.nisn}</p>
              <p><strong>Sekolah:</strong> {formData.schoolName}</p>
              <p><strong>Orang Tua:</strong> {formData.parentName}</p>
              <p><strong>No. HP:</strong> {formData.parentPhone}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
              <h3 className="font-bold text-yellow-800 mb-2">📌 Langkah Selanjutnya:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Datang ke sekolah untuk verifikasi dokumen asli</li>
                <li>• Bawa dokumen asli: Ijazah, KK, Akta, Raport, Pas Foto</li>
                <li>• Batas akhir: 30 Juni 2026</li>
              </ul>
            </div>
            <Link href="/dashboard/student" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 inline-block">
              Kembali ke Dashboard
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg animate-slide-in ${
              t.type === 'success' ? 'bg-green-500' :
              t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'} {t.message}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/student" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
          ← Kembali ke Dashboard
        </Link>

        {/* Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎓</div>
            <div>
              <h1 className="text-2xl font-bold">Pendaftaran Ulang</h1>
              <p className="text-gray-600">Lengkapi data dan upload dokumen persyaratan</p>
            </div>
          </div>
        </Card>

        {/* Registration Info */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <h2 className="font-bold mb-3">📋 Informasi Pendaftaran</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">No. Registrasi</p>
              <p className="font-semibold">{registrations[0].registration_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Sekolah</p>
              <p className="font-semibold">{registrations[0].school?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Jalur</p>
              <p className="font-semibold">{registrations[0].pathway?.pathway_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Peringkat</p>
              <p className="font-semibold">#{registrations[0].current_rank || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Upload Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">📄 Upload Dokumen Wajib</h3>
                <p className="text-sm text-gray-600">Upload semua dokumen yang diperlukan</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isAllDocumentsUploaded()
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {isAllDocumentsUploaded() ? '✓ Lengkap' : `${getMissingDocuments().length} belum`}
              </div>
            </div>

            {/* Document Checklist */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {REQUIRED_DOCS.map((doc) => {
                const isUploaded = uploadedDocuments.has(doc.type);
                return (
                  <div
                    key={doc.type}
                    className={`p-4 border rounded-lg transition-all ${
                      isUploaded
                        ? 'bg-green-50 border-green-200'
                        : doc.required
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{doc.icon}</span>
                      <div className="flex-1">
                        <p className={`font-semibold ${isUploaded ? 'text-green-700' : 'text-gray-700'}`}>
                          {doc.type}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-500">{doc.label}</p>
                      </div>
                      {isUploaded && (
                        <span className="text-green-600 text-xl">✓</span>
                      )}
                    </div>

                    {/* Upload Component */}
                    {currentRegId && (
                      <FileUpload
                        registrationId={currentRegId.toString()}
                        documentType={doc.type as 'KK' | 'Akta' | 'Sertifikat' | 'Raport'}
                        onUploadComplete={(file) => handleUploadComplete(doc.type, file)}
                        onUploadError={handleUploadError}
                        className="mt-2"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Uploaded Documents List */}
            {documentStatus && documentStatus.uploadedDetails.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Dokumen yang sudah diupload:</h4>
                <ul className="text-sm space-y-1">
                  {documentStatus.uploadedDetails.map((doc: any) => (
                    <li key={doc.id} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{doc.document_type}</span>
                      <span className="text-gray-400">- {(doc.file_size / 1024).toFixed(1)} KB</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        doc.verification_status === 'approved' ? 'bg-green-100 text-green-700' :
                        doc.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.verification_status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Parent Data Section */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">👨‍👩‍👧 Data Orang Tua/Wali</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Lengkap Orang Tua <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={e => setFormData({...formData, parentName: e.target.value})}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  No. HP Orang Tua <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                  placeholder="08xxxxxxxxxx"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Email Orang Tua (Opsional)
                </label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={e => setFormData({...formData, parentEmail: e.target.value})}
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Student Data (Read-only) */}
          <Card className="p-6 bg-gray-50">
            <h3 className="font-bold text-lg mb-4">👤 Data Siswa</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.studentName}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NISN</label>
                <input
                  type="text"
                  value={formData.nisn}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </div>
            </div>
          </Card>

          {/* Important Information */}
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Informasi Penting</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Dokumen dengan tanda <span className="text-red-500">*</span> wajib diupload</li>
              <li>• Format file: PDF, JPG, PNG (maksimal 5MB per file)</li>
              <li>• Bawa dokumen asli saat verifikasi fisik ke sekolah</li>
              <li>• Batas akhir pendaftaran ulang: <strong>30 Juni 2026</strong></li>
            </ul>
          </Card>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !isAllDocumentsUploaded()}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              submitting || !isAllDocumentsUploaded()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {submitting ? (
              <>
                <span className="animate-spin">⟳</span>
                Menyimpan...
              </>
            ) : !isAllDocumentsUploaded() ? (
              <>
                ⚠️ Upload semua dokumen wajib terlebih dahulu
              </>
            ) : (
              '✅ Konfirmasi Pendaftaran Ulang'
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
