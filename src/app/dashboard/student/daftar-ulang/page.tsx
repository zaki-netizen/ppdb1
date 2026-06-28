"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';

interface Registration {
  id: number;
  registration_number: string;
  nisn: string;
  selection_status: string;
  daftar_ulang_completed: boolean;
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

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function DaftarUlangPage() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [formData, setFormData] = useState({
    registrationId: '',
    studentName: '',
    nisn: '',
    schoolName: '',
    parentName: '',
    parentPhone: '',
    ijazahChecked: false,
    kkChecked: false,
    raportChecked: false,
    fotoChecked: false,
    sertifikatChecked: false,
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
        console.log('Daftar Ulang - User email:', userEmail);

        if (userEmail) {
          allRegs = allRegs.filter((r) =>
            r.user?.email === userEmail
          );
        }

        // Only accepted registrations
        const acceptedRegs = allRegs.filter((r) =>
          r.selection_status === 'accepted'
        );
        setRegistrations(acceptedRegs);

        if (acceptedRegs.length > 0) {
          const reg = acceptedRegs[0];
          setFormData(prev => ({
            ...prev,
            registrationId: reg.id.toString(),
            studentName: reg.user?.full_name || '',
            nisn: reg.nisn || '',
            schoolName: reg.school?.name || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleFileChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [`${field}Checked`]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ijazahChecked || !formData.kkChecked || !formData.raportChecked || !formData.fotoChecked) {
      addToast('error', 'Dokumen wajib: Ijazah, KK, Raport, Foto');
      return;
    }

    if (!formData.parentName.trim() || !formData.parentPhone.trim()) {
      addToast('error', 'Data orang tua wajib diisi');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/daftar-ulang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: formData.registrationId,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        addToast('success', 'Pendaftaran ulang berhasil!');
      } else {
        addToast('error', 'Gagal mengirim');
      }
    } catch (error) {
      addToast('error', 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">📚</div>
            <p className="text-lg text-gray-600">Memuat...</p>
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
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.type === 'success' ? '✓' : '✗'} {t.message}
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/student" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
          ← Kembali ke Dashboard
        </Link>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">🎓</div>
            <div>
              <h1 className="text-2xl font-bold">Pendaftaran Ulang</h1>
              <p className="text-gray-600">Lengkapi data dan upload dokumen</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <h2 className="font-bold mb-3">📋 Informasi Pendaftaran</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><strong>No. Registrasi:</strong> {registrations[0].registration_number}</p>
            <p><strong>Sekolah:</strong> {registrations[0].school?.name}</p>
            <p><strong>Jalur:</strong> {registrations[0].pathway?.pathway_name}</p>
            <p><strong>Ranking:</strong> #{registrations[0].current_rank}</p>
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg">👤 Data Siswa</h3>
              <input
                type="text"
                value={formData.studentName}
                onChange={e => setFormData({...formData, studentName: e.target.value})}
                placeholder="Nama Lengkap Siswa"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={formData.nisn}
                placeholder="NISN"
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                readOnly
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">👨‍👩‍👧 Data Orang Tua/Wali</h3>
              <input
                type="text"
                value={formData.parentName}
                onChange={e => setFormData({...formData, parentName: e.target.value})}
                placeholder="Nama Lengkap Orang Tua"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                placeholder="No. HP Orang Tua"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">📄 Upload Dokumen</h3>
              <p className="text-sm text-gray-600">Centang dokumen yang akan diupload</p>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-red-50 border-red-200">
                  <input
                    type="checkbox"
                    checked={formData.ijazahChecked}
                    onChange={e => handleFileChange('ijazah', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-red-800">📜 Ijazah *WAJIB*</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-red-50 border-red-200">
                  <input
                    type="checkbox"
                    checked={formData.kkChecked}
                    onChange={e => handleFileChange('kk', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-red-800">🏠 Kartu Keluarga *WAJIB*</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-red-50 border-red-200">
                  <input
                    type="checkbox"
                    checked={formData.raportChecked}
                    onChange={e => handleFileChange('raport', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-red-800">📚 Raport Semester 5 *WAJIB*</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-red-50 border-red-200">
                  <input
                    type="checkbox"
                    checked={formData.fotoChecked}
                    onChange={e => handleFileChange('foto', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-red-800">📷 Pas Foto 3x4 *WAJIB*</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 border-gray-200">
                  <input
                    type="checkbox"
                    checked={formData.sertifikatChecked}
                    onChange={e => handleFileChange('sertifikat', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-gray-700">🏆 Sertifikat Prestasi (OPSIONAL)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="animate-spin">⟳</span> Mengirim...</>
              ) : (
                '✅ Konfirmasi Pendaftaran Ulang'
              )}
            </button>
          </form>
        </Card>

        <Card className="p-4 mt-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ Informasi Penting</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Bawa dokumen asli saat daftar ulang fisik</li>
            <li>• Batas akhir: 30 Juni 2026</li>
            <li>• Dokumen wajib: Ijazah, KK, Raport, Foto</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
