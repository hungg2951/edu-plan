'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PhongHoc } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';

interface PhongHocModalProps {
  open: boolean;
  onClose: () => void;
  editing: PhongHoc | null;
}

const emptyForm = {
  ten: '',
  sucChua: '20',
  moTa: '',
  trangThai: 'hoatDong' as const,
};

export function PhongHocModal({ open, onClose, editing }: PhongHocModalProps) {
  const { addPhongHoc, updatePhongHoc } = useAppStore();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        ten: editing.ten,
        sucChua: String(editing.sucChua),
        moTa: editing.moTa,
        trangThai: editing.trangThai,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, editing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.ten.trim()) errs.ten = 'Vui lòng nhập tên phòng học';
    const capacity = parseInt(form.sucChua);
    if (isNaN(capacity) || capacity < 1) {
      errs.sucChua = 'Sức chứa phải là số nguyên ≥ 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = {
      ten: form.ten.trim(),
      sucChua: parseInt(form.sucChua),
      moTa: form.moTa.trim(),
      trangThai: form.trangThai,
    };
    if (editing) {
      updatePhongHoc(editing.id, data);
    } else {
      addPhongHoc(data);
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
      title={editing ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Tên phòng học <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls('ten')}
            value={form.ten}
            onChange={(e) => setForm({ ...form, ten: e.target.value })}
            placeholder="VD: Phòng B201"
          />
          {errors.ten && <p className="text-xs text-red-500 mt-1">{errors.ten}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Sức chứa (học viên) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            className={inputCls('sucChua')}
            value={form.sucChua}
            onChange={(e) => setForm({ ...form, sucChua: e.target.value })}
            placeholder="VD: 30"
          />
          {errors.sucChua && <p className="text-xs text-red-500 mt-1">{errors.sucChua}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mô tả thiết bị / ghi chú</label>
          <input
            className={inputCls('moTa')}
            value={form.moTa}
            onChange={(e) => setForm({ ...form, moTa: e.target.value })}
            placeholder="VD: Có máy chiếu, điều hòa hòa cơ..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái sử dụng</label>
          <select
            className={inputCls('trangThai')}
            value={form.trangThai}
            onChange={(e) => setForm({ ...form, trangThai: e.target.value as PhongHoc['trangThai'] })}
          >
            <option value="hoatDong">Hoạt động (Sẵn sàng)</option>
            <option value="tamNgung">Tạm ngưng hoạt động (Bảo trì)</option>
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
