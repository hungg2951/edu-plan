'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { GiangVien } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';

interface GiangVienModalProps {
  open: boolean;
  onClose: () => void;
  editing: GiangVien | null;
}

const emptyForm = {
  ten: '',
  email: '',
  sdt: '',
  chuyenMon: '',
  trangThai: 'hoatDong' as const,
};

export function GiangVienModal({ open, onClose, editing }: GiangVienModalProps) {
  const { addGiangVien, updateGiangVien } = useAppStore();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        ten: editing.ten,
        email: editing.email,
        sdt: editing.sdt,
        chuyenMon: editing.chuyenMon,
        trangThai: editing.trangThai,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, editing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.ten.trim()) errs.ten = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Email không đúng định dạng';
    }
    if (!form.sdt.trim()) errs.sdt = 'Vui lòng nhập số điện thoại';
    if (!form.chuyenMon.trim()) errs.chuyenMon = 'Vui lòng nhập chuyên môn';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editing) {
      updateGiangVien(editing.id, form);
    } else {
      addGiangVien(form);
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
      title={editing ? 'Chỉnh sửa thông tin giảng viên' : 'Thêm giảng viên mới'}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls('ten')}
            value={form.ten}
            onChange={(e) => setForm({ ...form, ten: e.target.value })}
            placeholder="VD: Nguyễn Văn An"
          />
          {errors.ten && <p className="text-xs text-red-500 mt-1">{errors.ten}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls('email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="VD: an.nguyen@sasuco.vn"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls('sdt')}
            value={form.sdt}
            onChange={(e) => setForm({ ...form, sdt: e.target.value })}
            placeholder="VD: 0901234001"
          />
          {errors.sdt && <p className="text-xs text-red-500 mt-1">{errors.sdt}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Chuyên môn giảng dạy <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls('chuyenMon')}
            value={form.chuyenMon}
            onChange={(e) => setForm({ ...form, chuyenMon: e.target.value })}
            placeholder="VD: Toán – Vật lý"
          />
          {errors.chuyenMon && <p className="text-xs text-red-500 mt-1">{errors.chuyenMon}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái hoạt động</label>
          <select
            className={inputCls('trangThai')}
            value={form.trangThai}
            onChange={(e) => setForm({ ...form, trangThai: e.target.value as GiangVien['trangThai'] })}
          >
            <option value="hoatDong">Hoạt động</option>
            <option value="tamNgung">Tạm ngừng hoạt động</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editing ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
