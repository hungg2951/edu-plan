import { BuoiHoc, KhoaHoc, DangKy, ConflictInfo } from './types';
import { formatNgayGio } from './vietnameseUtils';

/**
 * Kiểm tra hai buổi học có bị trùng giờ không
 */
function buoiTrung(a: BuoiHoc, b: BuoiHoc): boolean {
  if (a.ngay !== b.ngay) return false;
  // a.gioKhoi < b.gioCuoi && b.gioKhoi < a.gioCuoi
  return a.gioKhoi < b.gioCuoi && b.gioKhoi < a.gioCuoi;
}

interface CheckParams {
  buoiHocMoi: BuoiHoc;
  phongHocId: string;
  giangVienId: string;
  tatCaKhoaHoc: KhoaHoc[];
  tatCaDangKy: DangKy[];
  hocVienIds?: string[];   // Học viên đăng ký vào khóa đang tạo/sửa
  excludeKhoaHocId?: string;
  tenGiangVien: string;
  tenPhongHoc: (id: string) => string;
  tenKhoaHoc: (id: string) => string;
  tenHocVien: (id: string) => string;
}

export function checkConflictBuoi(params: CheckParams): ConflictInfo[] {
  const {
    buoiHocMoi,
    phongHocId,
    giangVienId,
    tatCaKhoaHoc,
    tatCaDangKy,
    hocVienIds = [],
    excludeKhoaHocId,
    tenGiangVien,
    tenPhongHoc,
    tenKhoaHoc,
    tenHocVien,
  } = params;

  const conflicts: ConflictInfo[] = [];

  // Chỉ kiểm tra các khóa đang hoạt động (không phải đã hủy/kết thúc/nháp)
  const khoaActive = tatCaKhoaHoc.filter(
    (k) =>
      k.id !== excludeKhoaHocId &&
      !['Đã hủy', 'Kết thúc', 'Nháp'].includes(k.trangThai)
  );

  for (const khoa of khoaActive) {
    for (const buoi of khoa.buoiHoc) {
      if (!buoiTrung(buoiHocMoi, buoi)) continue;

      const ngayGio = formatNgayGio(buoi.ngay, buoi.gioKhoi, buoi.gioCuoi);

      // Kiểm tra giảng viên
      if (khoa.giangVienId === giangVienId) {
        conflicts.push({
          loai: 'giangVien',
          tenDoiTuong: tenGiangVien,
          tenKhoaTrung: tenKhoaHoc(khoa.id),
          ngayGioTrung: ngayGio,
        });
      }

      // Kiểm tra phòng học (dùng phòng của buổi cụ thể, fallback về phòng mặc định khóa)
      const phongBuoi = buoi.phongHocId || khoa.phongHocId;
      if (phongBuoi === phongHocId) {
        conflicts.push({
          loai: 'phongHoc',
          tenDoiTuong: tenPhongHoc(phongHocId),
          tenKhoaTrung: tenKhoaHoc(khoa.id),
          ngayGioTrung: ngayGio,
        });
      }

      // Kiểm tra học viên trùng lịch
      const hocVienTrongKhoa = tatCaDangKy
        .filter((dk) => dk.khoaHocId === khoa.id && dk.trangThai === 'DaDuyet')
        .map((dk) => dk.hocVienId);

      for (const hvId of hocVienIds) {
        if (hocVienTrongKhoa.includes(hvId)) {
          conflicts.push({
            loai: 'hocVien',
            tenDoiTuong: tenHocVien(hvId),
            tenKhoaTrung: tenKhoaHoc(khoa.id),
            ngayGioTrung: ngayGio,
          });
        }
      }
    }
  }

  // Loại bỏ trùng lặp
  const seen = new Set<string>();
  return conflicts.filter((c) => {
    const key = `${c.loai}-${c.tenDoiTuong}-${c.tenKhoaTrung}-${c.ngayGioTrung}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Kiểm tra học viên đơn lẻ có trùng lịch với khóa muốn đăng ký
 */
export function checkHocVienTrungLich(
  hocVienId: string,
  khoaHocMoi: KhoaHoc,
  tatCaKhoaHoc: KhoaHoc[],
  tatCaDangKy: DangKy[],
  tenKhoaHoc: (id: string) => string
): { tenKhoaTrung: string; ngayGioTrung: string }[] {
  const khoaDaDangKy = tatCaDangKy
    .filter((dk) => dk.hocVienId === hocVienId && dk.trangThai === 'DaDuyet')
    .map((dk) => dk.khoaHocId);

  const result: { tenKhoaTrung: string; ngayGioTrung: string }[] = [];

  for (const khoaId of khoaDaDangKy) {
    if (khoaId === khoaHocMoi.id) continue;
    const khoa = tatCaKhoaHoc.find((k) => k.id === khoaId);
    if (!khoa) continue;

    for (const buoiCu of khoa.buoiHoc) {
      for (const buoiMoi of khoaHocMoi.buoiHoc) {
        if (buoiTrung(buoiCu, buoiMoi)) {
          result.push({
            tenKhoaTrung: tenKhoaHoc(khoaId),
            ngayGioTrung: formatNgayGio(buoiCu.ngay, buoiCu.gioKhoi, buoiCu.gioCuoi),
          });
        }
      }
    }
  }

  return result;
}
