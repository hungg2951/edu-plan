'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { GiangVien } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GiangVienModal } from '@/components/giang-vien/GiangVienModal';
import { vietSearch, formatNgay } from '@/lib/vietnameseUtils';
import { xuatLichDayGiangVien } from '@/lib/exportUtils';

const PAGE_SIZE = 10;

export default function GiangVienPage() {
  const { giangViens, khoaHocs, phongHocs, deleteGiangVien } = useAppStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GiangVien | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GiangVien | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const filtered = useMemo(() => {
    return giangViens.filter((g) => {
      return !search || vietSearch(g.ten, search) || vietSearch(g.chuyenMon, search) || vietSearch(g.email, search);
    }).sort((a, b) => b.ngayTao.localeCompare(a.ngayTao));
  }, [giangViens, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (g: GiangVien) => { setEditing(g); setModalOpen(true); };

  const handleDelete = (gv: GiangVien) => {
    const result = deleteGiangVien(gv.id);
    if (!result.ok) {
      setDeleteError(result.message ?? 'Không thể xóa giảng viên');
    } else {
      setDeleteTarget(null);
    }
  };

  const handleExportExcel = (gv: GiangVien) => {
    xuatLichDayGiangVien(gv, khoaHocs, phongHocs);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý giảng viên</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng số {giangViens.length} giảng viên · {giangViens.filter((g) => g.trangThai === 'hoatDong').length} đang hoạt động
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Thêm giảng viên
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Tìm tên, chuyên môn, email..."
          className="w-72"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ và tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Chuyên môn</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày gia nhập</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  {search ? 'Không tìm thấy giảng viên phù hợp' : 'Chưa có giảng viên nào'}
                </td>
              </tr>
            )}
            {paginated.map((gv) => (
              <tr key={gv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{gv.ten}</td>
                <td className="px-4 py-3 text-slate-600">{gv.chuyenMon}</td>
                <td className="px-4 py-3">
                  <div className="text-xs">
                    <p className="text-slate-600">{gv.email}</p>
                    <p className="text-slate-400 mt-0.5">{gv.sdt}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatNgay(gv.ngayTao)}</td>
                <td className="px-4 py-3">
                  <Badge variant={gv.trangThai} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(gv)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleExportExcel(gv)}
                      className="px-2.5 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded-md transition-colors font-medium"
                      title="Xuất lịch dạy giảng viên ra Excel"
                    >
                      Xuất lịch
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(gv); setDeleteError(''); }}
                      className="px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <GiangVienModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Xóa giảng viên"
        message={`Bạn có chắc muốn xóa giảng viên "${deleteTarget?.ten}"?`}
        confirmLabel="Xóa"
        danger
      />

      {/* Delete error notification modal */}
      {deleteError && (
        <Modal open={!!deleteError} onClose={() => setDeleteError('')} title="Cảnh báo an toàn">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{deleteError}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDeleteError('')}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
