'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PhongHoc } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PhongHocModal } from '@/components/phong-hoc/PhongHocModal';
import { vietSearch } from '@/lib/vietnameseUtils';

const PAGE_SIZE = 10;

export default function PhongHocPage() {
  const { phongHocs, deletePhongHoc } = useAppStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PhongHoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhongHoc | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const filtered = useMemo(() => {
    return phongHocs.filter((p) => {
      return !search || vietSearch(p.ten, search) || vietSearch(p.moTa, search);
    }).sort((a, b) => a.ten.localeCompare(b.ten));
  }, [phongHocs, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: PhongHoc) => { setEditing(p); setModalOpen(true); };

  const handleDelete = (p: PhongHoc) => {
    const result = deletePhongHoc(p.id);
    if (!result.ok) {
      setDeleteError(result.message ?? 'Không thể xóa phòng học');
    } else {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý phòng học</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng số {phongHocs.length} phòng học · {phongHocs.filter((p) => p.trangThai === 'hoatDong').length} hoạt động tốt
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Thêm phòng học
        </button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Tìm tên phòng, thiết bị mô tả..."
          className="w-72"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên phòng học</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sức chứa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả chi tiết</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                  {search ? 'Không tìm thấy phòng phù hợp' : 'Chưa có phòng học nào'}
                </td>
              </tr>
            )}
            {paginated.map((ph) => (
              <tr key={ph.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{ph.ten}</td>
                <td className="px-4 py-3 text-slate-600 font-semibold">{ph.sucChua} học viên</td>
                <td className="px-4 py-3 text-slate-500">{ph.moTa || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={ph.trangThai} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(ph)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(ph); setDeleteError(''); }}
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

      <PhongHocModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Xóa phòng học"
        message={`Bạn có chắc muốn xóa phòng học "${deleteTarget?.ten}"?`}
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
