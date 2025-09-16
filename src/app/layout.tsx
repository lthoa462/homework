// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lịch Báo Bài',
  description: 'Ứng dụng quản lý báo bài hàng ngày',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      {/* Sửa đổi class của thẻ body ở đây */}
      <body className={`${inter.className} bg-blue-100`}>
        {children}
      </body>
    </html>
  );
}