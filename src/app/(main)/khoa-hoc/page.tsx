'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { KhoaHoc } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { KhoaHocModal } from '@/components/khoa-hoc/KhoaHocModal';
import { vietSearch, formatNgay } from '@/lib/vietnameseUtils';
import { xuatLichDayGiangVien } from '@/lib/exportUtils';

const PAGE_SIZE = 10;

const TRANG_THAI_FILTER: (KhoaHoc['trangThai'] | 'Tất cả')[] = [
  'Tất cả', 'Nháp', 'Đang nhận đăng ký', 'Đã khai giảng', 'Đang diễn ra', 'Kết thúc', 'Đã hủy',
];

export default function KhoaHocPage() {
  const {
    khoaHocs, giangViens, phongHocs, dangKys,
    deleteKhoaHoc, doiTrangThaiKhoaHoc,
    getTenGiangVien, getTenPhongHoc, getSoLuongDangKy,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterTT, setFilterTT] = useState<KhoaHoc['trangThai'] | 'Tất cả'>('Tất cả');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KhoaHoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KhoaHoc | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [viewTab, setViewTab] = useState<'list' | 'calendar'>('list');

  const filtered = useMemo(() => {
    return khoaHocs.filter((k) => {
      const matchSearch = !search || vietSearch(k.ten, search) || vietSearch(getTenGiangVien(k.giangVienId), search);
      const matchTT = filterTT === 'Tất cả' || k.trangThai === filterTT;
      return matchSearch && matchTT;
    }).sort((a, b) => b.ngayTao.localeCompare(a.ngayTao));
  }, [khoaHocs, search, filterTT]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (k: KhoaHoc) => { setEditing(k); setModalOpen(true); };

  const handleDelete = (k: KhoaHoc) => {
    const result = deleteKhoaHoc(k.id);
    if (!result.ok) {
      setDeleteError(result.message ?? 'Không thể xóa');
    }
    setDeleteTarget(null);
  };

  const handleExportGV = (k: KhoaHoc) => {
    const gv = giangViens.find((g) => g.id === k.giangVienId);
    if (!gv) return;
    const khoaOfGV = khoaHocs.filter((kh) => kh.giangVienId === gv.id);
    xuatLichDayGiangVien(gv, khoaOfGV, phongHocs);
  };

  // Calendar view: group buoiHoc by week
  const calendarData = useMemo(() => {
    const buois: { ngay: string; gioKhoi: string; gioCuoi: string; khoaTen: string; phong: string; gv: string; trangThai: string }[] = [];
    for (const khoa of khoaHocs) {
      if (['Đã hủy'].includes(khoa.trangThai)) continue;
      for (const b of khoa.buoiHoc) {
        buois.push({
          ngay: b.ngay,
          gioKhoi: b.gioKhoi,
          gioCuoi: b.gioCuoi,
          khoaTen: khoa.ten,
          phong: getTenPhongHoc(b.phongHocId || khoa.phongHocId),
          gv: getTenGiangVien(khoa.giangVienId),
          trangThai: khoa.trangThai,
        });
      }
    }
    return buois.sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gioKhoi.localeCompare(b.gioKhoi));
  }, [khoaHocs]);

  // Group calendar by date
  const calendarGrouped = useMemo(() => {
    const map: Record<string, typeof calendarData> = {};
    for (const item of calendarData) {
      if (!map[item.ngay]) map[item.ngay] = [];
      map[item.ngay].push(item);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [calendarData]);

  const THU_VI = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý khóa học</h1>
          <p className="text-sm text-slate-500 mt-1">
            {khoaHocs.length} khóa học · {khoaHocs.filter((k) => k.trangThai === 'Đang diễn ra').length} đang diễn ra
          </p>
        </div>
        <button
          onClick={openAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Thêm khóa học
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-white border border-slate-200 rounded-lg p-1 w-fit shadow-sm">
        <button
          onClick={() => setViewTab('list')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewTab === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📋 Danh sách
        </button>
        <button
          onClick={() => setViewTab('calendar')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📅 Lịch dạy
        </button>
      </div>

      {viewTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Tìm tên khóa, giảng viên..."
              className="w-full lg:w-72"
            />
            <div className="flex gap-1 flex-wrap">
              {TRANG_THAI_FILTER.map((tt) => (
                <button
                  key={tt}
                  onClick={() => { setFilterTT(tt); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    filterTT === tt
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tt}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm min-w-[850px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên khóa học</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Giảng viên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phòng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khai giảng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Đăng ký</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                        {search || filterTT !== 'Tất cả' ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có khóa học nào'}
                      </td>
                    </tr>
                  )}
                {paginated.map((khoa) => {
                  const soLuong = getSoLuongDangKy(khoa.id);
                  return (
                    <tr key={khoa.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{khoa.ten}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{khoa.buoiHoc.length} buổi học</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{getTenGiangVien(khoa.giangVienId)}</td>
                      <td className="px-4 py-3 text-slate-600">{getTenPhongHoc(khoa.phongHocId)}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatNgay(khoa.ngayKhaiGiang)}</td>
                      <td className="px-4 py-3 w-36">
                        <ProgressBar value={soLuong} max={khoa.soLuongToiDa} min={khoa.soLuongToiThieu} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={khoa.trangThai} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(khoa)}
                            className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleExportGV(khoa)}
                            title="Xuất lịch GV"
                            className="px-2.5 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          >
                            Excel
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(khoa); setDeleteError(''); }}
                            className="px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        </>
      )}

      {viewTab === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Lịch dạy tổng hợp — tất cả giảng viên</h2>
            <p className="text-xs text-slate-400 mt-0.5">Hiển thị các buổi học (trừ khóa đã hủy)</p>
          </div>
          {calendarGrouped.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Chưa có buổi học nào</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto w-full overflow-x-auto">
              {calendarGrouped.map(([ngay, items]) => {
                const d = new Date(ngay);
                const thu = THU_VI[d.getDay()];
                const isToday = ngay === new Date().toISOString().slice(0, 10);
                return (
                  <div key={ngay} className="flex gap-0 min-w-[650px]">
                    {/* Date column */}
                    <div className={`w-24 shrink-0 px-4 py-3 text-right border-r border-slate-100 ${isToday ? 'bg-blue-50' : ''}`}>
                      <p className={`text-xs font-semibold ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>{thu}</p>
                      <p className={`text-sm font-bold mt-0.5 ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                        {d.getDate()}/{d.getMonth() + 1}
                      </p>
                      <p className="text-xs text-slate-400">{d.getFullYear()}</p>
                    </div>
                    {/* Items */}
                    <div className="flex-1 px-4 py-2 space-y-1.5">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors">
                          <span className="text-xs text-slate-500 font-medium w-20 shrink-0">
                            {item.gioKhoi}–{item.gioCuoi}
                          </span>
                          <span className="flex-1 text-sm font-medium text-slate-800 truncate">{item.khoaTen}</span>
                          <span className="text-xs text-slate-500 w-32 shrink-0 text-right">{item.gv}</span>
                          <span className="text-xs text-slate-400 w-24 shrink-0 text-right">{item.phong}</span>
                          <Badge variant={item.trangThai as KhoaHoc['trangThai']} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <KhoaHocModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget && !deleteError}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Xóa khóa học"
        message={`Bạn có chắc muốn xóa khóa học "${deleteTarget?.ten}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa khóa học"
        danger
      />

      {/* Delete error dialog */}
      {deleteError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-slate-800 mb-2">Không thể xóa</h3>
            <p className="text-sm text-slate-600">{deleteError}</p>
            <button
              onClick={() => setDeleteError('')}
              className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
