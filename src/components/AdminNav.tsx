'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/users', label: 'Quản lý người dùng' }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 md:gap-4">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 md:text-base ${
              isActive
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
