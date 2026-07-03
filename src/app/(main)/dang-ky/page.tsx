'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { DangKy, KhoaHoc } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { vietSearch, formatNgay } from '@/lib/vietnameseUtils';
import { checkHocVienTrungLich } from '@/lib/conflictChecker';
import { xuatDanhSachHocVien } from '@/lib/exportUtils';

const PAGE_SIZE = 10;

export default function DangKyPage() {
  const {
    dangKys, hocViens, khoaHocs,
    addDangKy, updateDangKy, deleteDangKy,
    getSoLuongDangKy, getTenHocVien, getTenKhoaHoc,
  } = useAppStore();

  const [selectedKhoaId, setSelectedKhoaId] = useState('');
  const [selectedHocVienId, setSelectedHocVienId] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<DangKy | null>(null);

  // Active entities
  const activeHocVien = useMemo(() => {
    return hocViens.filter((h) => h.trangThai === 'hoatDong');
  }, [hocViens]);

  const activeKhoaHoc = useMemo(() => {
    // Only courses that can accept registrations or draft
    return khoaHocs.filter((k) => ['Nháp', 'Đang nhận đăng ký'].includes(k.trangThai));
  }, [khoaHocs]);

  // Selected course details
  const selectedKhoa = useMemo(() => {
    return khoaHocs.find((k) => k.id === selectedKhoaId);
  }, [selectedKhoaId, khoaHocs]);

  const capacityCount = useMemo(() => {
    if (!selectedKhoaId) return { count: 0, max: 0 };
    return {
      count: getSoLuongDangKy(selectedKhoaId),
      max: selectedKhoa?.soLuongToiDa ?? 0,
    };
  }, [selectedKhoaId, getSoLuongDangKy, selectedKhoa]);

  // Check if selected student has schedule conflicts with the selected course
  const studentConflicts = useMemo(() => {
    if (!selectedHocVienId || !selectedKhoa) return [];
    return checkHocVienTrungLich(
      selectedHocVienId,
      selectedKhoa,
      khoaHocs,
      dangKys,
      getTenKhoaHoc
    );
  }, [selectedHocVienId, selectedKhoa, khoaHocs, dangKys, getTenKhoaHoc]);

  // Filtered registrations list
  const filtered = useMemo(() => {
    return dangKys.filter((dk) => {
      const hvName = getTenHocVien(dk.hocVienId);
      const khName = getTenKhoaHoc(dk.khoaHocId);
      return !search || vietSearch(hvName, search) || vietSearch(khName, search);
    }).sort((a, b) => b.ngayDangKy.localeCompare(a.ngayDangKy));
  }, [dangKys, search, getTenHocVien, getTenKhoaHoc]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKhoaId || !selectedHocVienId) return;

    // Check capacity limit
    if (capacityCount.count >= capacityCount.max) {
      alert('Lớp học đã đạt giới hạn tối đa học viên. Không thể đăng ký thêm.');
      return;
    }

    // Check duplicate registration in the same course
    const isRegistered = dangKys.some(
      (dk) => dk.hocVienId === selectedHocVienId && dk.khoaHocId === selectedKhoaId && dk.trangThai !== 'HuyDangKy'
    );
    if (isRegistered) {
      alert('Học viên này đã đăng ký khóa học này trước đó.');
      return;
    }

    addDangKy({
      hocVienId: selectedHocVienId,
      khoaHocId: selectedKhoaId,
      trangThai: 'DaDuyet',
      ghiChu,
    });

    // Reset form
    setSelectedHocVienId('');
    setGhiChu('');
  };

  const handleUpdateStatus = (id: string, current: DangKy['trangThai']) => {
    const nextStatus: DangKy['trangThai'] = current === 'DaDuyet' ? 'HuyDangKy' : 'DaDuyet';
    updateDangKy(id, { trangThai: nextStatus });
  };

  const handleExportExcel = () => {
    if (!selectedKhoa) return;
    xuatDanhSachHocVien(selectedKhoa, dangKys, hocViens);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Register Form */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Ghi danh học viên</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Chọn khóa học tuyển sinh <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedKhoaId}
                onChange={(e) => setSelectedKhoaId(e.target.value)}
                required
              >
                <option value="">— Chọn khóa học —</option>
                {activeKhoaHoc.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ten} ({getSoLuongDangKy(k.id)}/{k.soLuongToiDa} HV)
                  </option>
                ))}
              </select>
            </div>

            {selectedKhoa && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Sức chứa lớp học:</span>
                  <span className="font-semibold">{capacityCount.count} / {capacityCount.max} chỗ đã nhận</span>
                </div>
                <div className="flex justify-between">
                  <span>Yêu cầu tối thiểu:</span>
                  <span>{selectedKhoa.soLuongToiThieu} học viên</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái tuyển sinh:</span>
                  <span className="font-semibold text-blue-600">{selectedKhoa.trangThai}</span>
                </div>
                {capacityCount.count >= capacityCount.max && (
                  <p className="text-red-500 font-medium mt-1">⚠️ Lớp đã đầy! Không nhận đăng ký mới.</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Chọn học viên ghi danh <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedHocVienId}
                onChange={(e) => setSelectedHocVienId(e.target.value)}
                required
                disabled={!selectedKhoaId}
              >
                <option value="">— Chọn học viên —</option>
                {activeHocVien.map((h) => (
                  <option key={h.id} value={h.id}>{h.ten} ({h.sdt})</option>
                ))}
              </select>
            </div>

            {/* Real-time schedule conflict warning for student */}
            {studentConflicts.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                <p className="font-bold">⚠️ Cảnh báo trùng lịch học của học viên:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {studentConflicts.map((c, i) => (
                    <li key={i}>
                      Trùng với lớp <span className="font-semibold">"{c.tenKhoaTrung}"</span> lúc {c.ngayGioTrung}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ghi chú đăng ký</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="VD: Đã nộp học phí học kỳ I..."
              />
            </div>

            <button
              type="submit"
              disabled={!selectedKhoaId || !selectedHocVienId || capacityCount.count >= capacityCount.max}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Hoàn tất ghi danh
            </button>
          </form>
        </div>

        {selectedKhoa && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Báo cáo lớp {selectedKhoa.ten}</h3>
            <button
              onClick={handleExportExcel}
              className="w-full py-1.5 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
            >
              📥 Xuất Excel Danh sách học viên
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Registrations List (2/3 size) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">Danh sách đăng ký toàn hệ thống</h2>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Tìm theo tên học viên, lớp..."
            className="w-full sm:w-64"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[650px] sm:min-w-0">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Học viên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khóa học</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày đăng ký</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    {search ? 'Không tìm thấy lượt đăng ký nào' : 'Chưa có thông tin ghi danh nào'}
                  </td>
                </tr>
              )}
              {paginated.map((dk) => (
                <tr key={dk.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{getTenHocVien(dk.hocVienId)}</td>
                  <td className="px-4 py-3 text-slate-600">{getTenKhoaHoc(dk.khoaHocId)}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatNgay(dk.ngayDangKy)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={dk.trangThai} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleUpdateStatus(dk.id, dk.trangThai)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          dk.trangThai === 'DaDuyet'
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                            : 'text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {dk.trangThai === 'DaDuyet' ? 'Hủy' : 'Duyệt'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dk)}
                        className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          <div className="px-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteDangKy(deleteTarget.id)}
        title="Xóa lượt đăng ký"
        message="Hành động này sẽ xóa vĩnh viễn thông tin đăng ký học viên khỏi hệ thống."
        confirmLabel="Xóa đăng ký"
        danger
      />
    </div>
  );
}
