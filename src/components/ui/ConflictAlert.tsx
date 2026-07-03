'use client';

import { ConflictInfo } from '@/lib/types';

interface ConflictAlertProps {
  conflicts: ConflictInfo[];
}

const loaiLabel: Record<ConflictInfo['loai'], string> = {
  giangVien: '👨‍🏫 Giảng viên',
  phongHoc: '🏫 Phòng học',
  hocVien: '🎓 Học viên',
};

export function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  // Group by type
  const byLoai = conflicts.reduce((acc, c) => {
    if (!acc[c.loai]) acc[c.loai] = [];
    acc[c.loai].push(c);
    return acc;
  }, {} as Record<string, ConflictInfo[]>);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <div className="flex items-start gap-2">
        <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-700 mb-2">
            Phát hiện {conflicts.length} xung đột lịch — vui lòng kiểm tra lại
          </p>
          <div className="space-y-2">
            {Object.entries(byLoai).map(([loai, items]) => (
              <div key={loai}>
                <p className="text-xs font-semibold text-red-600 mb-1">{loaiLabel[loai as ConflictInfo['loai']]}</p>
                <ul className="space-y-1">
                  {items.map((c, i) => (
                    <li key={i} className="text-xs text-red-700 bg-white/70 rounded px-2 py-1.5 border border-red-100">
                      <span className="font-medium">{c.tenDoiTuong}</span> đang bận lớp{' '}
                      <span className="font-medium">"{c.tenKhoaTrung}"</span> vào{' '}
                      <span className="font-medium">{c.ngayGioTrung}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
