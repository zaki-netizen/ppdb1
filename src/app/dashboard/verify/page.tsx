"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Registration {
  id: number;
  registration_number: string;
  nisn: string;
  verification_status: string;
  user: {
    full_name: string;
    email: string;
  };
  school?: {
    name: string;
  };
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function BatchVerifyPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        const pending = (Array.isArray(data) ? data : []).filter(
          (r: Registration) => r.verification_status === 'pending'
        );
        setRegistrations(pending);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === registrations.length) {
      setSelected([]);
    } else {
      setSelected(registrations.map((r) => r.id));
    }
  };

  const handleBatchVerify = async (status: 'verified' | 'rejected') => {
    if (selected.length === 0) {
      addToast('error', 'Pilih pendaftar terlebih dahulu');
      return;
    }

    setProcessing(true);
    let success = 0;
    let failed = 0;

    for (const id of selected) {
      try {
        const response = await fetch(`/api/registrations/${id}/verify`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    setProcessing(false);
    addToast(
      success > 0 ? 'success' : 'error',
      `${status === 'verified' ? 'Diverifikasi' : 'Ditolak'}: ${success} berhasil${failed > 0 ? `, ${failed} gagal` : ''}`
    );
    setSelected([]);
    fetchPendingRegistrations();
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">✅ Verifikasi Batch</h1>
          <p className="text-gray-600">
            {registrations.length} pendaftar menunggu verifikasi
          </p>
        </div>

        {/* Actions */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.length === registrations.length && registrations.length > 0}
                  onChange={toggleAll}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium">
                  Pilih Semua ({selected.length}/{registrations.length})
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleBatchVerify('verified')}
                disabled={processing || selected.length === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  '✅'
                )}
                Verifikasi Terpilih
              </button>
              <button
                onClick={() => handleBatchVerify('rejected')}
                disabled={processing || selected.length === 0}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  '❌'
                )}
                Tolak Terpilih
              </button>
            </div>
          </div>
        </Card>

        {/* List */}
        <Card className="overflow-hidden">
          {registrations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-lg font-medium">Semua pendaftar sudah diverifikasi!</p>
            </div>
          ) : (
            <div className="divide-y">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(reg.id)}
                    onChange={() => toggleSelect(reg.id)}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{reg.user?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {reg.nisn} • {reg.registration_number}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {reg.school?.name || '-'}
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    PENDING
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
