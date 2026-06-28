"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const notificationTemplates = [
  {
    id: 'verification_complete',
    title: 'Verifikasi Selesai',
    message: 'Pendaftaran Anda telah diverifikasi oleh admin. Silakan tunggu pengumuman hasil.',
  },
  {
    id: 'verification_rejected',
    title: 'Pendaftaran Ditolak',
    message: 'Mohon maaf, pendaftaran Anda belum memenuhi syarat. Silakan hubungi admin.',
  },
  {
    id: 'result_announcement',
    title: 'Pengumuman Hasil',
    message: 'Hasil seleksi PPDB telah diumumkan. Silakan cek di halaman hasil.',
  },
  {
    id: 'document_reminder',
    title: 'Pengingat Dokumen',
    message: 'Segera lengkapi dokumen persyaratan pendaftaran Anda.',
  },
];

export default function SendNotificationPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'pending' | 'verified'>('all');
  const [sending, setSending] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const applyTemplate = (template: typeof notificationTemplates[0]) => {
    setTitle(template.title);
    setMessage(template.message);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      addToast('error', 'Judul dan pesan harus diisi');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          target,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addToast('success', `Berhasil kirim notifikasi ke ${data.count} pendaftar!`);
        setTitle('');
        setMessage('');
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Gagal kirim notifikasi');
      }
    } catch (error) {
      console.error('Send error:', error);
      addToast('error', 'Terjadi kesalahan');
    } finally {
      setSending(false);
    }
  };

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

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">📬 Kirim Notifikasi</h1>
          <p className="text-gray-600">Kirim pengumuman ke pendaftar</p>
        </div>

        {/* Templates */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3 text-gray-900">📝 Template Pesan</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {notificationTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <p className="font-medium text-sm text-gray-900">{template.title}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{template.message}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kirim Kepada
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'all', label: 'Semua Pendaftar' },
                  { value: 'pending', label: 'Pending Verifikasi' },
                  { value: 'verified', label: 'Sudah Verifikasi' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value={opt.value}
                      checked={target === opt.value}
                      onChange={(e) => setTarget(e.target.value as typeof target)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Notifikasi *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pengumuman Hasil Seleksi"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Pesan *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik pesan notifikasi..."
                rows={5}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preview */}
            {title && message && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-bold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600 mt-1">{message}</p>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Mengirim...
                </>
              ) : (
                <>
                  📬 Kirim Notifikasi
                </>
              )}
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
