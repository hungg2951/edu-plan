'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
  { href: '/khoa-hoc', label: 'Khóa học', icon: '📚' },
  { href: '/dang-ky', label: 'Đăng ký HV', icon: '✏️' },
  { href: '/giang-vien', label: 'Giảng viên', icon: '👨‍🏫' },
  { href: '/hoc-vien', label: 'Học viên', icon: '🎓' },
  { href: '/phong-hoc', label: 'Phòng học', icon: '🏫' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-none">SASUCO</p>
            <p className="text-xs text-slate-400 mt-0.5">Quản lý đào tạo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Menu chính
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">© 2026 SASUCO Center</p>
      </div>
    </aside>
  );
}
