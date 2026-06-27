import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Login - PPDB Portal',
};

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <Card className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-block bg-blue-600 text-white rounded-lg p-3 mb-4">
              <span className="text-2xl font-bold">PP</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PPDB Portal</h1>
            <p className="text-gray-600">Sistem Penerimaan Peserta Didik Baru</p>
          </div>

          {/* Form */}
          <form
            action="/api/auth/signin"
            method="post"
            className="space-y-4"
          >
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input type="email" name="email" required placeholder="your@email.com" />
              <p className="text-xs text-gray-500 mt-1">
                Demo: admin@ppdb.test
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <Input type="password" name="password" required placeholder="••••••••" />
              <p className="text-xs text-gray-500 mt-1">
                Demo: admin123
              </p>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full mt-6">Masuk</Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Demo Account Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-semibold text-blue-900">📝 Demo Account:</p>
            <div className="space-y-1 text-blue-800">
              <p>
                <strong>Admin:</strong> admin@ppdb.test / admin123
              </p>
              <p>
                <strong>Peserta:</strong> ahmad@student.test / password123
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>Belum punya akun?</p>
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Daftar sekarang
            </a>
          </div>
        </Card>

        {/* Info Banner */}
        <div className="mt-6 text-center text-sm text-white bg-black bg-opacity-50 rounded-lg p-4">
          ℹ️ Gunakan akun demo untuk testing fitur aplikasi
        </div>
      </div>
    </div>
  );
}
