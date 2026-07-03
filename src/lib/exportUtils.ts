import * as XLSX from 'xlsx';
import { KhoaHoc, GiangVien, HocVien, DangKy } from './types';
import { formatNgay, formatNgayGio } from './vietnameseUtils';

/**
 * Xuất danh sách học viên của một khóa học
 */
export function xuatDanhSachHocVien(
  khoa: KhoaHoc,
  dangKys: DangKy[],
  hocViens: HocVien[]
): void {
  const rows = dangKys
    .filter((dk) => dk.khoaHocId === khoa.id)
    .map((dk) => {
      const hv = hocViens.find((h) => h.id === dk.hocVienId);
      return {
        'Họ và tên': hv?.ten ?? '',
        'Email': hv?.email ?? '',
        'Số điện thoại': hv?.sdt ?? '',
        'Ngày sinh': hv?.ngaySinh ? formatNgay(hv.ngaySinh) : '',
        'Địa chỉ': hv?.diaChi ?? '',
        'Ngày đăng ký': formatNgay(dk.ngayDangKy),
        'Trạng thái': labelDangKy(dk.trangThai),
        'Ghi chú': dk.ghiChu ?? '',
      };
    });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách HV');

  // Auto-width columns
  const colWidths = Object.keys(rows[0] ?? {}).map((k) => ({ wch: Math.max(k.length + 2, 20) }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `HocVien_${khoa.ten.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Xuất lịch dạy của một giảng viên
 */
export function xuatLichDayGiangVien(
  gv: GiangVien,
  khoaHocs: KhoaHoc[],
  phongHocs: { id: string; ten: string }[]
): void {
  const rows: Record<string, string>[] = [];

  for (const khoa of khoaHocs) {
    if (khoa.giangVienId !== gv.id) continue;
    const phong = phongHocs.find((p) => p.id === khoa.phongHocId);

    for (const buoi of khoa.buoiHoc) {
      const phongBuoi =
        phongHocs.find((p) => p.id === buoi.phongHocId)?.ten ?? phong?.ten ?? '';
      rows.push({
        'Khóa học': khoa.ten,
        'Ngày dạy': formatNgay(buoi.ngay),
        'Giờ bắt đầu': buoi.gioKhoi,
        'Giờ kết thúc': buoi.gioCuoi,
        'Phòng học': phongBuoi,
        'Trạng thái khóa': khoa.trangThai,
        'Ngày giờ (tóm tắt)': formatNgayGio(buoi.ngay, buoi.gioKhoi, buoi.gioCuoi),
      });
    }
  }

  rows.sort((a, b) => a['Ngày dạy'].localeCompare(b['Ngày dạy']));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lịch dạy');
  ws['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 22 }));

  XLSX.writeFile(wb, `LichDay_${gv.ten.replace(/\s+/g, '_')}.xlsx`);
}

function labelDangKy(t: string): string {
  if (t === 'ChoDuyet') return 'Chờ duyệt';
  if (t === 'DaDuyet') return 'Đã duyệt';
  return 'Hủy đăng ký';
}
