"use client";

import { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useEffect } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const isAdmin = (session.user as any)?.role === 'admin' || session.user.email?.toLowerCase().includes('admin');
      window.location.href = isAdmin ? '/dashboard' : '/dashboard/student';
    }
  }, [status, session]);

  // Check if user just registered
  const justRegistered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah.');
        setLoading(false);
      } else {
        // Full page redirect
        const isAdmin = email.toLowerCase().includes('admin');
        window.location.href = isAdmin ? '/dashboard' : '/dashboard/student';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <Card className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-block bg-blue-600 text-white rounded-lg p-3 mb-4">
              <span className="text-2xl font-bold">PP</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PPDB Portal</h1>
            <p className="text-gray-600">Sistem Penerimaan Peserta Didik Baru</p>
          </div>

          {/* Success Message for newly registered users */}
          {justRegistered && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✅ Pendaftaran berhasil! Silakan login dengan akun yang baru dibuat.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="user-email"
                id="user-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
                placeholder="email@contoh.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="user-password"
                id="user-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>Belum punya akun?</p>
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Daftar sekarang
            </Link>
          </div>
        </Card>

        {/* Info Banner */}
        <div className="mt-6 text-center text-sm text-gray-600 bg-white bg-opacity-80 rounded-lg p-4">
          <p className="font-medium mb-2">Akun Demo:</p>
          <p><strong>Admin:</strong> admin@ppdb.test / admin123</p>
          <p><strong>Student:</strong> ahmad@student.test / password123</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <span className="inline-block animate-spin text-4xl text-blue-600">⟳</span>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
