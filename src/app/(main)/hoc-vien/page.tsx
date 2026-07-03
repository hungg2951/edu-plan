'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { HocVien } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { HocVienModal } from '@/components/hoc-vien/HocVienModal';
import { Modal } from '@/components/ui/Modal';
import { vietSearch, formatNgay } from '@/lib/vietnameseUtils';

const PAGE_SIZE = 10;

export default function HocVienPage() {
  const { hocViens, deleteHocVien } = useAppStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HocVien | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HocVien | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const filtered = useMemo(() => {
    return hocViens.filter((h) => {
      return !search || vietSearch(h.ten, search) || vietSearch(h.email, search) || vietSearch(h.sdt, search);
    }).sort((a, b) => b.ngayTao.localeCompare(a.ngayTao));
  }, [hocViens, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (h: HocVien) => { setEditing(h); setModalOpen(true); };

  const handleDelete = (hv: HocVien) => {
    const result = deleteHocVien(hv.id);
    if (!result.ok) {
      setDeleteError(result.message ?? 'Không thể xóa học viên');
    } else {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý học viên</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng số {hocViens.length} học viên · {hocViens.filter((h) => h.trangThai === 'hoatDong').length} đang hoạt động
          </p>
        </div>
        <button
          onClick={openAdd}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-center"
        >
          + Thêm học viên
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Tìm tên học viên, email, số điện thoại..."
          className="w-full sm:w-72"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[700px] sm:min-w-0">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ và tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày sinh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa chỉ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  {search ? 'Không tìm thấy học viên phù hợp' : 'Chưa có học viên nào'}
                </td>
              </tr>
            )}
            {paginated.map((hv) => (
              <tr key={hv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{hv.ten}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatNgay(hv.ngaySinh)}</td>
                <td className="px-4 py-3">
                  <div className="text-xs">
                    <p className="text-slate-600">{hv.email}</p>
                    <p className="text-slate-400 mt-0.5">{hv.sdt}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{hv.diaChi || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={hv.trangThai} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(hv)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(hv); setDeleteError(''); }}
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

      <HocVienModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Xóa học viên"
        message={`Bạn có chắc muốn xóa hồ sơ học viên "${deleteTarget?.ten}"?`}
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
