'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  GiangVien, HocVien, PhongHoc, KhoaHoc, DangKy, BuoiHoc, ConflictInfo,
} from '../lib/types';
import { checkConflictBuoi } from '../lib/conflictChecker';
import {
  seedGiangVien, seedHocVien, seedPhongHoc, seedKhoaHoc, seedDangKy,
} from '../lib/seedData';

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface AppState {
  giangViens: GiangVien[];
  hocViens: HocVien[];
  phongHocs: PhongHoc[];
  khoaHocs: KhoaHoc[];
  dangKys: DangKy[];

  // ─── Khởi tạo / reset dữ liệu ───
  loadSeedData: () => void;
  resetData: () => void;

  // ─── Giảng viên ───
  addGiangVien: (gv: Omit<GiangVien, 'id' | 'ngayTao'>) => void;
  updateGiangVien: (id: string, gv: Partial<GiangVien>) => void;
  deleteGiangVien: (id: string) => { ok: boolean; message?: string };

  // ─── Học viên ───
  addHocVien: (hv: Omit<HocVien, 'id' | 'ngayTao'>) => void;
  updateHocVien: (id: string, hv: Partial<HocVien>) => void;
  deleteHocVien: (id: string) => { ok: boolean; message?: string };

  // ─── Phòng học ───
  addPhongHoc: (ph: Omit<PhongHoc, 'id'>) => void;
  updatePhongHoc: (id: string, ph: Partial<PhongHoc>) => void;
  deletePhongHoc: (id: string) => { ok: boolean; message?: string };

  // ─── Khóa học ───
  addKhoaHoc: (kh: Omit<KhoaHoc, 'id' | 'ngayTao'>) => void;
  updateKhoaHoc: (id: string, kh: Partial<KhoaHoc>) => void;
  deleteKhoaHoc: (id: string) => { ok: boolean; message?: string };
  doiTrangThaiKhoaHoc: (id: string, trangThai: KhoaHoc['trangThai']) => void;

  // ─── Đăng ký ───
  addDangKy: (dk: Omit<DangKy, 'id' | 'ngayDangKy'>) => void;
  updateDangKy: (id: string, dk: Partial<DangKy>) => void;
  deleteDangKy: (id: string) => void;

  // ─── Conflict checker ───
  checkConflict: (
    buoiHocMoi: BuoiHoc,
    giangVienId: string,
    phongHocId: string,
    excludeKhoaHocId?: string,
    hocVienIds?: string[],
  ) => ConflictInfo[];

  // ─── Selectors ───
  getKhoaHocCount: () => { dangMo: number; dangDienRa: number; ketThuc: number; daHuy: number };
  getDangKyCount: (khoaHocId: string) => number;
  getKhoaNguyCo: () => KhoaHoc[];
  getTenGiangVien: (id: string) => string;
  getTenPhongHoc: (id: string) => string;
  getTenKhoaHoc: (id: string) => string;
  getTenHocVien: (id: string) => string;
  getSoLuongDangKy: (khoaHocId: string) => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      giangViens: [],
      hocViens: [],
      phongHocs: [],
      khoaHocs: [],
      dangKys: [],

      // ─── Tạo dữ liệu mẫu ───
      loadSeedData: () => set({
        giangViens: seedGiangVien,
        hocViens: seedHocVien,
        phongHocs: seedPhongHoc,
        khoaHocs: seedKhoaHoc,
        dangKys: seedDangKy,
      }),

      // ─── Xóa sạch dữ liệu ───
      resetData: () => set({
        giangViens: [],
        hocViens: [],
        phongHocs: [],
        khoaHocs: [],
        dangKys: [],
      }),

      // ─── Giảng viên ───
      addGiangVien: (gv) =>
        set((s) => ({
          giangViens: [...s.giangViens, { ...gv, id: uid(), ngayTao: new Date().toISOString().slice(0, 10) }],
        })),
      updateGiangVien: (id, gv) =>
        set((s) => ({
          giangViens: s.giangViens.map((g) => (g.id === id ? { ...g, ...gv } : g)),
        })),
      deleteGiangVien: (id) => {
        const { khoaHocs } = get();
        const active = khoaHocs.filter(
          (k) => k.giangVienId === id && !['Kết thúc', 'Đã hủy'].includes(k.trangThai)
        );
        if (active.length > 0) {
          return {
            ok: false,
            message: `Không thể xóa vì giảng viên đang phụ trách ${active.length} khóa chưa kết thúc: ${active.map((k) => `"${k.ten}"`).join(', ')}.`,
          };
        }
        set((s) => ({ giangViens: s.giangViens.filter((g) => g.id !== id) }));
        return { ok: true };
      },

      // ─── Học viên ───
      addHocVien: (hv) =>
        set((s) => ({
          hocViens: [...s.hocViens, { ...hv, id: uid(), ngayTao: new Date().toISOString().slice(0, 10) }],
        })),
      updateHocVien: (id, hv) =>
        set((s) => ({
          hocViens: s.hocViens.map((h) => (h.id === id ? { ...h, ...hv } : h)),
        })),
      deleteHocVien: (id) => {
        const { dangKys, khoaHocs } = get();
        const activeDks = dangKys.filter((dk) => {
          if (dk.hocVienId !== id || dk.trangThai === 'HuyDangKy') return false;
          const khoa = khoaHocs.find((k) => k.id === dk.khoaHocId);
          return khoa && !['Kết thúc', 'Đã hủy'].includes(khoa.trangThai);
        });
        if (activeDks.length > 0) {
          const names = activeDks
            .map((dk) => khoaHocs.find((k) => k.id === dk.khoaHocId)?.ten)
            .filter(Boolean)
            .map((n) => `"${n}"`).join(', ');
          return { ok: false, message: `Học viên đang đăng ký ${activeDks.length} khóa chưa kết thúc: ${names}.` };
        }
        set((s) => ({ hocViens: s.hocViens.filter((h) => h.id !== id) }));
        return { ok: true };
      },

      // ─── Phòng học ───
      addPhongHoc: (ph) =>
        set((s) => ({ phongHocs: [...s.phongHocs, { ...ph, id: uid() }] })),
      updatePhongHoc: (id, ph) =>
        set((s) => ({
          phongHocs: s.phongHocs.map((p) => (p.id === id ? { ...p, ...ph } : p)),
        })),
      deletePhongHoc: (id) => {
        const { khoaHocs } = get();
        const active = khoaHocs.filter(
          (k) => k.phongHocId === id && !['Kết thúc', 'Đã hủy'].includes(k.trangThai)
        );
        if (active.length > 0) {
          return { ok: false, message: `Phòng đang được sử dụng bởi ${active.length} khóa chưa kết thúc: ${active.map((k) => `"${k.ten}"`).join(', ')}.` };
        }
        set((s) => ({ phongHocs: s.phongHocs.filter((p) => p.id !== id) }));
        return { ok: true };
      },

      // ─── Khóa học ───
      addKhoaHoc: (kh) =>
        set((s) => ({
          khoaHocs: [...s.khoaHocs, { ...kh, id: uid(), ngayTao: new Date().toISOString().slice(0, 10) }],
        })),
      updateKhoaHoc: (id, kh) =>
        set((s) => ({
          khoaHocs: s.khoaHocs.map((k) => (k.id === id ? { ...k, ...kh } : k)),
        })),
      deleteKhoaHoc: (id) => {
        const { khoaHocs } = get();
        const khoa = khoaHocs.find((k) => k.id === id);
        if (khoa && !['Kết thúc', 'Đã hủy', 'Nháp'].includes(khoa.trangThai)) {
          return { ok: false, message: `Không thể xóa khóa đang ở trạng thái "${khoa.trangThai}". Hãy hủy khóa trước.` };
        }
        set((s) => ({ khoaHocs: s.khoaHocs.filter((k) => k.id !== id) }));
        return { ok: true };
      },
      doiTrangThaiKhoaHoc: (id, trangThai) =>
        set((s) => ({
          khoaHocs: s.khoaHocs.map((k) => (k.id === id ? { ...k, trangThai } : k)),
        })),

      // ─── Đăng ký ───
      addDangKy: (dk) =>
        set((s) => ({
          dangKys: [...s.dangKys, { ...dk, id: uid(), ngayDangKy: new Date().toISOString().slice(0, 10) }],
        })),
      updateDangKy: (id, dk) =>
        set((s) => ({
          dangKys: s.dangKys.map((d) => (d.id === id ? { ...d, ...dk } : d)),
        })),
      deleteDangKy: (id) =>
        set((s) => ({ dangKys: s.dangKys.filter((d) => d.id !== id) })),

      // ─── Conflict checker ───
      checkConflict: (buoiHocMoi, giangVienId, phongHocId, excludeKhoaHocId, hocVienIds = []) => {
        const { khoaHocs, dangKys, giangViens, phongHocs } = get();
        const gv = giangViens.find((g) => g.id === giangVienId);
        return checkConflictBuoi({
          buoiHocMoi,
          phongHocId,
          giangVienId,
          tatCaKhoaHoc: khoaHocs,
          tatCaDangKy: dangKys,
          hocVienIds,
          excludeKhoaHocId,
          tenGiangVien: gv?.ten ?? 'Giảng viên',
          tenPhongHoc: (id) => phongHocs.find((p) => p.id === id)?.ten ?? id,
          tenKhoaHoc: (id) => khoaHocs.find((k) => k.id === id)?.ten ?? id,
          tenHocVien: (id) => get().hocViens.find((h) => h.id === id)?.ten ?? id,
        });
      },

      // ─── Selectors ───
      getKhoaHocCount: () => {
        const { khoaHocs } = get();
        return {
          dangMo: khoaHocs.filter((k) => k.trangThai === 'Đang nhận đăng ký').length,
          dangDienRa: khoaHocs.filter((k) => ['Đã khai giảng', 'Đang diễn ra'].includes(k.trangThai)).length,
          ketThuc: khoaHocs.filter((k) => k.trangThai === 'Kết thúc').length,
          daHuy: khoaHocs.filter((k) => k.trangThai === 'Đã hủy').length,
        };
      },
      getDangKyCount: (khoaHocId) =>
        get().dangKys.filter((dk) => dk.khoaHocId === khoaHocId && dk.trangThai === 'DaDuyet').length,
      getKhoaNguyCo: () => {
        const { khoaHocs, dangKys } = get();
        return khoaHocs.filter((k) => {
          if (!['Đang nhận đăng ký', 'Nháp'].includes(k.trangThai)) return false;
          const count = dangKys.filter((dk) => dk.khoaHocId === k.id && dk.trangThai === 'DaDuyet').length;
          return count < k.soLuongToiThieu;
        });
      },
      getTenGiangVien: (id) => get().giangViens.find((g) => g.id === id)?.ten ?? '—',
      getTenPhongHoc: (id) => get().phongHocs.find((p) => p.id === id)?.ten ?? '—',
      getTenKhoaHoc: (id) => get().khoaHocs.find((k) => k.id === id)?.ten ?? '—',
      getTenHocVien: (id) => get().hocViens.find((h) => h.id === id)?.ten ?? '—',
      getSoLuongDangKy: (khoaHocId) =>
        get().dangKys.filter((dk) => dk.khoaHocId === khoaHocId && dk.trangThai === 'DaDuyet').length,
    }),
    {
      name: 'sasuco-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
