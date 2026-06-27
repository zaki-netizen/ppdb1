import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white rounded-lg p-2">
                <span className="text-lg font-bold">PP</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">PPDB Portal</h1>
            </div>
            <div className="flex gap-4 items-center">
              <Link href="/info" className="text-gray-700 hover:text-gray-900 font-medium">
                📋 Informasi
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-gray-900 font-medium">
                📝 Daftar
              </Link>
              <Link href="/results" className="text-gray-700 hover:text-gray-900 font-medium">
                🎓 Hasil
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6">
                Sistem Penerimaan Peserta Didik Baru
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Platform pendaftaran online yang transparan, aman, dan efisien untuk
                penerimaan siswa baru di sekolah Anda.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                >
                  📝 Daftar Sekarang
                </Link>
                <Link
                  href="/results"
                  className="bg-blue-500 bg-opacity-50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-70 transition-colors inline-flex items-center gap-2"
                >
                  🎓 Lihat Hasil
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '📊', label: 'Live Ranking', color: 'bg-blue-500' },
                    { icon: '🔒', label: 'Data Aman', color: 'bg-green-500' },
                    { icon: '⚡', label: 'Proses Cepat', color: 'bg-yellow-500' },
                    { icon: '📱', label: 'Mobile Friendly', color: 'bg-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.color} rounded-lg p-4 text-center`}>
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-semibold">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-12 text-center text-gray-900">
            Akses Cepat
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: '📝',
                title: 'Pendaftaran',
                desc: 'Daftar sebagai calon siswa baru',
                href: '/register',
                color: 'bg-blue-50 border-blue-200',
                hover: 'hover:bg-blue-100',
              },
              {
                icon: '🎓',
                title: 'Hasil Seleksi',
                desc: 'Cek hasil dan ranking Anda',
                href: '/results',
                color: 'bg-green-50 border-green-200',
                hover: 'hover:bg-green-100',
              },
              {
                icon: '📄',
                title: 'Upload Dokumen',
                desc: 'Lengkapi berkas pendaftaran',
                href: '/my-registrations',
                color: 'bg-purple-50 border-purple-200',
                hover: 'hover:bg-purple-100',
              },
              {
                icon: '📋',
                title: 'Informasi',
                desc: 'Jadwal dan ketentuan PPDB',
                href: '/info',
                color: 'bg-orange-50 border-orange-200',
                hover: 'hover:bg-orange-100',
              },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`${item.color} ${item.hover} border rounded-xl p-6 transition-colors block`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-12 text-center text-gray-900">
            Keunggulan Platform Kami
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Transparan',
                desc: 'Lihat real-time ranking dan status pendaftaran Anda secara langsung tanpa perlu menanyakan ke panitia.',
              },
              {
                icon: '🔒',
                title: 'Aman',
                desc: 'Data terenkripsi dan terlindungi dengan sistem keamanan database terpusat dan audit trail.',
              },
              {
                icon: '⚡',
                title: 'Efisien',
                desc: 'Proses verifikasi otomatis tanpa antri fisik. Skor dihitung secara otomatis dan akurat.',
              },
              {
                icon: '📍',
                title: 'Verifikasi GPS',
                desc: 'Verifikasi lokasi zonasi real-time untuk memastikan keakuratan data jarak.',
              },
              {
                icon: '📊',
                title: 'Laporan Lengkap',
                desc: 'Dashboard admin lengkap untuk monitoring dan pengelolaan pendaftar.',
              },
              {
                icon: '📱',
                title: 'Responsif',
                desc: 'Akses dari berbagai perangkat, desktop, tablet, maupun smartphone.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-12 text-center text-gray-900">
            📅 Jadwal PPDB 2026
          </h3>
          <div className="max-w-3xl mx-auto">
            {[
              { date: '1-15 Juni 2026', event: 'Pendaftaran Online', status: 'active' },
              { date: '16-20 Juni 2026', event: 'Verifikasi Dokumen', status: 'upcoming' },
              { date: '21-25 Juni 2026', event: 'Seleksi & Ranking', status: 'upcoming' },
              { date: '26 Juni 2026', event: 'Pengumuman Hasil', status: 'upcoming' },
              { date: '27-30 Juni 2026', event: 'Daftar Ulang', status: 'upcoming' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${
                    item.status === 'active' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'
                  }`} />
                  {i < 4 && <div className="w-0.5 h-full bg-gray-300 mt-1" />}
                </div>
                <div className={`flex-1 pb-6 ${i === 4 ? 'pb-0' : ''}`}>
                  <span className={`text-sm font-semibold ${
                    item.status === 'active' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.date}
                  </span>
                  <h4 className="text-lg font-semibold text-gray-900">{item.event}</h4>
                  {item.status === 'active' && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mt-1">
                      SEDANG BERLANGSUNG
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Siap untuk Mendaftar?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Jangan sampai terlewat! Segera daftarkan diri Anda sekarang.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            🚀 Daftar Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 text-white rounded-lg p-2">
                  <span className="text-lg font-bold">PP</span>
                </div>
                <h3 className="font-bold">PPDB Portal</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Sistem Penerimaan Peserta Didik Baru yang transparan dan efisien.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/register" className="hover:text-white">Pendaftaran</Link></li>
                <li><Link href="/results" className="hover:text-white">Hasil Seleksi</Link></li>
                <li><Link href="/info" className="hover:text-white">Informasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white">Hubungi Kami</Link></li>
                <li><a href="mailto:admin@ppdb.test" className="hover:text-white">admin@ppdb.test</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Demo Accounts</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Admin: admin@ppdb.test</li>
                <li>User: ahmad@student.test</li>
                <li>Password: admin123 / password123</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 PPDB Portal. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}