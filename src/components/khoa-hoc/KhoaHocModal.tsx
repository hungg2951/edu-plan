'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { KhoaHoc, BuoiHoc, ConflictInfo } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { ConflictAlert } from '@/components/ui/ConflictAlert';

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface KhoaHocModalProps {
  open: boolean;
  onClose: () => void;
  editing?: KhoaHoc | null;
}

const TRANG_THAI_OPTIONS: KhoaHoc['trangThai'][] = [
  'Nháp', 'Đang nhận đăng ký', 'Đã khai giảng', 'Đang diễn ra', 'Kết thúc', 'Đã hủy',
];

interface FormState {
  ten: string;
  moTa: string;
  giangVienId: string;
  phongHocId: string;
  ngayKhaiGiang: string;
  soLuongToiThieu: string;
  soLuongToiDa: string;
  trangThai: KhoaHoc['trangThai'];
  buoiHoc: BuoiHoc[];
}

const emptyForm: FormState = {
  ten: '',
  moTa: '',
  giangVienId: '',
  phongHocId: '',
  ngayKhaiGiang: '',
  soLuongToiThieu: '8',
  soLuongToiDa: '25',
  trangThai: 'Nháp',
  buoiHoc: [],
};

export function KhoaHocModal({ open, onClose, editing }: KhoaHocModalProps) {
  const { giangViens, phongHocs, addKhoaHoc, updateKhoaHoc, checkConflict } = useAppStore();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allConflicts, setAllConflicts] = useState<ConflictInfo[]>([]);

  // Active teachers and rooms only
  const activeGV = giangViens.filter((g) => g.trangThai === 'hoatDong');
  const activePH = phongHocs.filter((p) => p.trangThai === 'hoatDong');

  // Init form when editing changes
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        ten: editing.ten,
        moTa: editing.moTa,
        giangVienId: editing.giangVienId,
        phongHocId: editing.phongHocId,
        ngayKhaiGiang: editing.ngayKhaiGiang,
        soLuongToiThieu: String(editing.soLuongToiThieu),
        soLuongToiDa: String(editing.soLuongToiDa),
        trangThai: editing.trangThai,
        buoiHoc: editing.buoiHoc.map((b) => ({ ...b })),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setAllConflicts([]);
  }, [open, editing]);

  // Run conflict check whenever buoiHoc / giangVienId / phongHocId changes
  useEffect(() => {
    if (!form.giangVienId && !form.phongHocId) {
      setAllConflicts([]);
      return;
    }
    const conflicts: ConflictInfo[] = [];
    for (const buoi of form.buoiHoc) {
      if (!buoi.ngay || !buoi.gioKhoi || !buoi.gioCuoi) continue;
      const phongBuoi = buoi.phongHocId || form.phongHocId;
      const c = checkConflict(
        buoi,
        form.giangVienId,
        phongBuoi,
        editing?.id,
      );
      conflicts.push(...c);
    }
    // Deduplicate
    const seen = new Set<string>();
    setAllConflicts(
      conflicts.filter((c) => {
        const key = `${c.loai}-${c.tenDoiTuong}-${c.tenKhoaTrung}-${c.ngayGioTrung}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
    );
  }, [form.buoiHoc, form.giangVienId, form.phongHocId, editing?.id]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const ne = { ...e }; delete ne[k]; return ne; });
  };

  const addBuoi = () => {
    const newBuoi: BuoiHoc = {
      id: uid(),
      ngay: form.ngayKhaiGiang || new Date().toISOString().slice(0, 10),
      gioKhoi: '08:00',
      gioCuoi: '10:00',
      phongHocId: form.phongHocId,
    };
    setField('buoiHoc', [...form.buoiHoc, newBuoi]);
  };

  const updateBuoi = (idx: number, patch: Partial<BuoiHoc>) => {
    setField(
      'buoiHoc',
      form.buoiHoc.map((b, i) => (i === idx ? { ...b, ...patch } : b))
    );
  };

  const removeBuoi = (idx: number) => {
    setField('buoiHoc', form.buoiHoc.filter((_, i) => i !== idx));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.ten.trim()) errs.ten = 'Vui lòng nhập tên khóa học';
    if (!form.giangVienId) errs.giangVienId = 'Vui lòng chọn giảng viên';
    if (!form.phongHocId) errs.phongHocId = 'Vui lòng chọn phòng học';
    if (!form.ngayKhaiGiang) errs.ngayKhaiGiang = 'Vui lòng chọn ngày khai giảng';
    const min = parseInt(form.soLuongToiThieu);
    const max = parseInt(form.soLuongToiDa);
    if (isNaN(min) || min < 1) errs.soLuongToiThieu = 'Tối thiểu ≥ 1';
    if (isNaN(max) || max < min) errs.soLuongToiDa = 'Tối đa ≥ tối thiểu';

    for (const b of form.buoiHoc) {
      if (!b.ngay || !b.gioKhoi || !b.gioCuoi) {
        errs.buoiHoc = 'Mỗi buổi học phải có đủ ngày và giờ';
        break;
      }
      if (b.gioKhoi >= b.gioCuoi) {
        errs.buoiHoc = 'Giờ kết thúc phải sau giờ bắt đầu';
        break;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (allConflicts.length > 0) return; // Block if conflict

    const data = {
      ten: form.ten.trim(),
      moTa: form.moTa.trim(),
      giangVienId: form.giangVienId,
      phongHocId: form.phongHocId,
      ngayKhaiGiang: form.ngayKhaiGiang,
      soLuongToiThieu: parseInt(form.soLuongToiThieu),
      soLuongToiDa: parseInt(form.soLuongToiDa),
      trangThai: form.trangThai,
      buoiHoc: form.buoiHoc,
    };

    if (editing) {
      updateKhoaHoc(editing.id, data);
    } else {
      addKhoaHoc(data);
    }
    onClose();
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
      size="xl"
    >
      <div className="space-y-5">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls('ten')}
              value={form.ten}
              onChange={(e) => setField('ten', e.target.value)}
              placeholder="VD: Toán 10 Nâng Cao – Kỳ hè 2026"
            />
            {errors.ten && <p className="text-xs text-red-500 mt-1">{errors.ten}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mô tả</label>
            <textarea
              className={`${inputCls('moTa')} resize-none`}
              rows={2}
              value={form.moTa}
              onChange={(e) => setField('moTa', e.target.value)}
              placeholder="Mô tả ngắn về khóa học..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Giảng viên <span className="text-red-500">*</span>
            </label>
            <select
              className={inputCls('giangVienId')}
              value={form.giangVienId}
              onChange={(e) => setField('giangVienId', e.target.value)}
            >
              <option value="">— Chọn giảng viên —</option>
              {activeGV.map((gv) => (
                <option key={gv.id} value={gv.id}>{gv.ten} ({gv.chuyenMon})</option>
              ))}
            </select>
            {errors.giangVienId && <p className="text-xs text-red-500 mt-1">{errors.giangVienId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Phòng học mặc định <span className="text-red-500">*</span>
            </label>
            <select
              className={inputCls('phongHocId')}
              value={form.phongHocId}
              onChange={(e) => setField('phongHocId', e.target.value)}
            >
              <option value="">— Chọn phòng —</option>
              {activePH.map((p) => (
                <option key={p.id} value={p.id}>{p.ten} (sức chứa: {p.sucChua})</option>
              ))}
            </select>
            {errors.phongHocId && <p className="text-xs text-red-500 mt-1">{errors.phongHocId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Ngày khai giảng <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={inputCls('ngayKhaiGiang')}
              value={form.ngayKhaiGiang}
              onChange={(e) => setField('ngayKhaiGiang', e.target.value)}
            />
            {errors.ngayKhaiGiang && <p className="text-xs text-red-500 mt-1">{errors.ngayKhaiGiang}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái</label>
            <select
              className={inputCls('trangThai')}
              value={form.trangThai}
              onChange={(e) => setField('trangThai', e.target.value as KhoaHoc['trangThai'])}
            >
              {TRANG_THAI_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Số lượng tối thiểu <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              className={inputCls('soLuongToiThieu')}
              value={form.soLuongToiThieu}
              onChange={(e) => setField('soLuongToiThieu', e.target.value)}
            />
            {errors.soLuongToiThieu && <p className="text-xs text-red-500 mt-1">{errors.soLuongToiThieu}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Số lượng tối đa <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              className={inputCls('soLuongToiDa')}
              value={form.soLuongToiDa}
              onChange={(e) => setField('soLuongToiDa', e.target.value)}
            />
            {errors.soLuongToiDa && <p className="text-xs text-red-500 mt-1">{errors.soLuongToiDa}</p>}
          </div>
        </div>

        {/* Buổi học */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">
              📅 Lịch các buổi học ({form.buoiHoc.length} buổi)
            </h3>
            <button
              onClick={addBuoi}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Thêm buổi
            </button>
          </div>

          {errors.buoiHoc && (
            <p className="text-xs text-red-500 mb-2">{errors.buoiHoc}</p>
          )}

          {form.buoiHoc.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-lg py-6 text-center text-sm text-slate-400">
              Chưa có buổi học nào. Nhấn "+ Thêm buổi" để bắt đầu lên lịch.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {form.buoiHoc.map((buoi, idx) => (
                <div key={buoi.id} className="grid grid-cols-[1fr_120px_120px_1fr_36px] gap-2 items-end bg-slate-50 rounded-lg px-3 py-2.5">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Ngày</label>
                    <input
                      type="date"
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={buoi.ngay}
                      onChange={(e) => updateBuoi(idx, { ngay: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Giờ bắt đầu</label>
                    <input
                      type="time"
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={buoi.gioKhoi}
                      onChange={(e) => updateBuoi(idx, { gioKhoi: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Giờ kết thúc</label>
                    <input
                      type="time"
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={buoi.gioCuoi}
                      onChange={(e) => updateBuoi(idx, { gioCuoi: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Phòng (ghi đè)</label>
                    <select
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                      value={buoi.phongHocId}
                      onChange={(e) => updateBuoi(idx, { phongHocId: e.target.value })}
                    >
                      <option value="">Dùng phòng mặc định</option>
                      {activePH.map((p) => (
                        <option key={p.id} value={p.id}>{p.ten}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removeBuoi(idx)}
                    className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conflict Alert — realtime */}
        <ConflictAlert conflicts={allConflicts} />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {allConflicts.length > 0 ? '❌ Hãy giải quyết xung đột trước khi lưu' : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={allConflicts.length > 0}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editing ? 'Lưu thay đổi' : 'Tạo khóa học'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
