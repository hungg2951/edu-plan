// ============================================================
// SASUCO – Định nghĩa kiểu dữ liệu
// ============================================================

export type TrangThaiHoSo = 'hoatDong' | 'tamNgung';

export interface GiangVien {
  id: string;
  ten: string;
  email: string;
  sdt: string;
  chuyenMon: string;
  trangThai: TrangThaiHoSo;
  ngayTao: string; // ISO date string
}

export interface HocVien {
  id: string;
  ten: string;
  email: string;
  sdt: string;
  ngaySinh: string; // ISO date string
  diaChi: string;
  trangThai: TrangThaiHoSo;
  ngayTao: string;
}

export interface PhongHoc {
  id: string;
  ten: string;
  sucChua: number;
  moTa: string;
  trangThai: TrangThaiHoSo;
}

// Vòng đời khóa học
export type TrangThaiKhoaHoc =
  | 'Nháp'
  | 'Đang nhận đăng ký'
  | 'Đã khai giảng'
  | 'Đang diễn ra'
  | 'Kết thúc'
  | 'Đã hủy';

export interface BuoiHoc {
  id: string;
  ngay: string;       // 'YYYY-MM-DD'
  gioKhoi: string;    // 'HH:MM'
  gioCuoi: string;    // 'HH:MM'
  phongHocId: string; // Có thể dùng phòng khác cho buổi này
}

export interface KhoaHoc {
  id: string;
  ten: string;
  moTa: string;
  giangVienId: string;
  phongHocId: string; // Phòng mặc định
  ngayKhaiGiang: string; // ISO date string
  soLuongToiThieu: number;
  soLuongToiDa: number;
  trangThai: TrangThaiKhoaHoc;
  buoiHoc: BuoiHoc[];
  ngayTao: string;
}

export type TrangThaiDangKy = 'ChoDuyet' | 'DaDuyet' | 'HuyDangKy';

export interface DangKy {
  id: string;
  hocVienId: string;
  khoaHocId: string;
  ngayDangKy: string;
  trangThai: TrangThaiDangKy;
  ghiChu: string;
}

// ============================================================
// Conflict types
// ============================================================

export interface ConflictInfo {
  loai: 'giangVien' | 'phongHoc' | 'hocVien';
  tenDoiTuong: string;      // Tên GV / phòng / học viên
  tenKhoaTrung: string;     // Tên khóa học đang trùng
  ngayGioTrung: string;     // VD: "Thứ 3, 15/07/2026, 08:00–10:00"
}
