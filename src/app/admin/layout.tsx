import type { ReactNode } from 'react';
import { AdminNav } from '@/components/AdminNav';

export default function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Bảng điều khiển</p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Trang quản trị</h1>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
