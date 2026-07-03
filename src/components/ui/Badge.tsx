'use client';

import { TrangThaiKhoaHoc, TrangThaiHoSo, TrangThaiDangKy } from '@/lib/types';

type BadgeVariant =
  | 'Nháp'
  | 'Đang nhận đăng ký'
  | 'Đã khai giảng'
  | 'Đang diễn ra'
  | 'Kết thúc'
  | 'Đã hủy'
  | 'hoatDong'
  | 'tamNgung'
  | 'ChoDuyet'
  | 'DaDuyet'
  | 'HuyDangKy';

const variantClasses: Record<BadgeVariant, string> = {
  'Nháp': 'bg-slate-100 text-slate-600 border-slate-200',
  'Đang nhận đăng ký': 'bg-blue-50 text-blue-700 border-blue-200',
  'Đã khai giảng': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Đang diễn ra': 'bg-green-50 text-green-700 border-green-200',
  'Kết thúc': 'bg-zinc-100 text-zinc-500 border-zinc-200',
  'Đã hủy': 'bg-red-50 text-red-600 border-red-200',
  'hoatDong': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'tamNgung': 'bg-slate-100 text-slate-500 border-slate-200',
  'ChoDuyet': 'bg-amber-50 text-amber-700 border-amber-200',
  'DaDuyet': 'bg-green-50 text-green-700 border-green-200',
  'HuyDangKy': 'bg-red-50 text-red-600 border-red-200',
};

const variantLabel: Record<BadgeVariant, string> = {
  'Nháp': 'Nháp',
  'Đang nhận đăng ký': 'Đang nhận đăng ký',
  'Đã khai giảng': 'Đã khai giảng',
  'Đang diễn ra': 'Đang diễn ra',
  'Kết thúc': 'Kết thúc',
  'Đã hủy': 'Đã hủy',
  'hoatDong': 'Hoạt động',
  'tamNgung': 'Tạm ngừng',
  'ChoDuyet': 'Chờ duyệt',
  'DaDuyet': 'Đã duyệt',
  'HuyDangKy': 'Hủy đăng ký',
};

interface BadgeProps {
  variant: BadgeVariant | string;
  className?: string;
}

export function Badge({ variant, className = '' }: BadgeProps) {
  const cls = variantClasses[variant as BadgeVariant] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const label = variantLabel[variant as BadgeVariant] ?? variant;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls} ${className}`}>
      {label}
    </span>
  );
}
