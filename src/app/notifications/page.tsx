import { Metadata } from 'next';
import { NotificationList } from '@/components/NotificationBell';

export const metadata: Metadata = {
  title: 'Notifikasi - PPDB Portal',
};

export default function NotificationsPage() {
  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifikasi</h1>
          <p className="text-gray-600">
            Kelola semua notifikasi dan pengumuman dari sistem PPDB
          </p>
        </div>

        <NotificationList />
      </div>
    </main>
  );
}