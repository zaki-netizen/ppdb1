import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hasil Seleksi - PPDB Portal',
};

export default function ResultsPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pengumuman Hasil Seleksi</h1>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Cari Hasil Anda</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Masukkan NISN atau No. Registrasi"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
              Cari
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting</h3>
          <p className="text-blue-800 text-sm">
            Pengumuman hasil seleksi resmi akan diunggah pada{' '}
            <strong>15 Juni 2026</strong>. Pantau halaman ini untuk mendapatkan
            informasi terbaru.
          </p>
        </div>
      </div>
    </main>
  );
}