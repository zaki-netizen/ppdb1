"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';

interface Registration {
  id: number;
  registration_number: string;
  nisn: string;
  registration_status: string;
  verification_status: string;
  selection_status: string;
  daftar_ulang_completed: boolean;
  current_rank: number | null;
  gpa: string;
  total_score: string;
  created_at: string;
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

export default function CekHasilPage() {
  const { data: session, status } = useSession();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated' && session?.user) {
      const email = (session.user as any)?.email || '';
      setUserEmail(email);
      fetchData(email);
    } else {
      setLoading(false);
    }
  }, [status, session]);

  const fetchData = async (email: string) => {
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        let regs: Registration[] = Array.isArray(data) ? data : [];

        // Filter by user email
        if (email) {
          regs = regs.filter(r => r.user?.email === email);
        }

        setRegistrations(regs);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      incomplete: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Belum Lengkap' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Terkirim' },
      verified: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terverifikasi' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: '🎉 DITERIMA' },
      waitlist: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Daftar Tunggu' },
    };
    const s = styles[status] || styles.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
          <span className="text-5xl animate-bounce">📚</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/student" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
          ← Kembali ke Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 Cek Hasil Seleksi</h1>
        <p className="text-gray-600 mb-6">Email: {userEmail}</p>

        {registrations.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">Tidak Ada Pendaftaran</h2>
            <p className="text-gray-600 mb-4">Email ini belum memiliki pendaftaran.</p>
            <Link href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Daftar Sekarang
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <Card key={reg.id} className={`p-6 ${reg.selection_status === 'accepted' ? 'bg-green-50 border-green-200' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{reg.school?.name || 'Sekolah'}</h3>
                    <p className="text-sm text-gray-500 font-mono">{reg.registration_number}</p>
                  </div>
                  {getStatusBadge(reg.selection_status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">NISN:</span>
                    <p className="font-medium">{reg.nisn}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Jalur:</span>
                    <p className="font-medium">{reg.pathway?.pathway_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ranking:</span>
                    <p className="font-bold text-2xl text-green-600">
                      {reg.current_rank ? `#${reg.current_rank}` : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Nilai Total:</span>
                    <p className="font-bold text-green-600">{reg.total_score}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <span className="text-xs text-gray-500">Status Pendaftaran:</span>
                  {getStatusBadge(reg.registration_status)}
                  {getStatusBadge(reg.verification_status)}
                </div>

                {reg.selection_status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <Link
                      href="/dashboard/student/daftar-ulang"
                      className="block w-full bg-green-600 text-white py-3 rounded-lg font-bold text-center hover:bg-green-700"
                    >
                      🎉 Daftar Ulang Sekarang
                    </Link>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">📅 Timeline:</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded ${reg.registration_status === 'submitted' || reg.registration_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      ✓ Pendaftaran
                    </span>
                    <span>→</span>
                    <span className={`px-2 py-1 rounded ${reg.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      ✓ Verifikasi
                    </span>
                    <span>→</span>
                    <span className={`px-2 py-1 rounded ${reg.selection_status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {reg.selection_status === 'accepted' ? '✓ Diterima' : '⏳ Seleksi'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">💡 Informasi</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pengumuman hasil akan diupdate secara berkala</li>
            <li>• Hubungi admin jika ada pertanyaan</li>
            <li>• Pendaftaran ulang untuk yang diterima: 27-30 Juni 2026</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}