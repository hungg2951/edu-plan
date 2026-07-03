import { GiangVien, HocVien, PhongHoc, KhoaHoc, DangKy } from './types';

function id(prefix: string, n: number) {
  return `${prefix}_${String(n).padStart(3, '0')}`;
}

// ============================================================
// Giảng viên
// ============================================================
export const seedGiangVien: GiangVien[] = [
  { id: id('gv', 1), ten: 'Nguyễn Văn An', email: 'an.nguyen@sasuco.vn', sdt: '0901234001', chuyenMon: 'Toán – Vật lý', trangThai: 'hoatDong', ngayTao: '2024-01-10' },
  { id: id('gv', 2), ten: 'Trần Thị Bích', email: 'bich.tran@sasuco.vn', sdt: '0901234002', chuyenMon: 'Hóa học', trangThai: 'hoatDong', ngayTao: '2024-01-15' },
  { id: id('gv', 3), ten: 'Lê Minh Cường', email: 'cuong.le@sasuco.vn', sdt: '0901234003', chuyenMon: 'Tiếng Anh', trangThai: 'hoatDong', ngayTao: '2024-02-01' },
  { id: id('gv', 4), ten: 'Phạm Thị Dung', email: 'dung.pham@sasuco.vn', sdt: '0901234004', chuyenMon: 'Ngữ văn', trangThai: 'hoatDong', ngayTao: '2024-02-10' },
  { id: id('gv', 5), ten: 'Hoàng Văn Em', email: 'em.hoang@sasuco.vn', sdt: '0901234005', chuyenMon: 'Lịch sử – Địa lý', trangThai: 'hoatDong', ngayTao: '2024-03-01' },
  { id: id('gv', 6), ten: 'Vũ Thị Phương', email: 'phuong.vu@sasuco.vn', sdt: '0901234006', chuyenMon: 'Tin học', trangThai: 'hoatDong', ngayTao: '2024-03-15' },
  { id: id('gv', 7), ten: 'Đặng Quốc Tuấn', email: 'tuan.dang@sasuco.vn', sdt: '0901234007', chuyenMon: 'Toán nâng cao', trangThai: 'hoatDong', ngayTao: '2024-04-01' },
  { id: id('gv', 8), ten: 'Ngô Thị Hương', email: 'huong.ngo@sasuco.vn', sdt: '0901234008', chuyenMon: 'Sinh học', trangThai: 'tamNgung', ngayTao: '2024-04-10' },
];

// ============================================================
// Học viên (20 mẫu — thực tế có thể lên 200+)
// ============================================================
const hvNames = [
  'Nguyễn Anh Đức', 'Trần Minh Khoa', 'Lê Thị Lan', 'Phạm Văn Long', 'Hoàng Thị Mai',
  'Vũ Đức Nam', 'Đỗ Thị Oanh', 'Bùi Văn Phú', 'Đinh Thị Quỳnh', 'Cao Văn Sơn',
  'Lý Thị Thảo', 'Trương Văn Uy', 'Phan Thị Vân', 'Nghiêm Văn Xuyên', 'Kiều Thị Yến',
  'Đặng Anh Bình', 'Nguyễn Thị Cẩm', 'Hồ Văn Dũng', 'Mai Thị Ếch', 'Tô Quốc Gia',
];

export const seedHocVien: HocVien[] = hvNames.map((ten, i) => ({
  id: id('hv', i + 1),
  ten,
  email: `hv${String(i + 1).padStart(2, '0')}@gmail.com`,
  sdt: `090${String(9000000 + i + 1)}`,
  ngaySinh: `${2005 - (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
  diaChi: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'][i % 5],
  trangThai: i === 18 ? 'tamNgung' : 'hoatDong',
  ngayTao: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
}));

// ============================================================
// Phòng học
// ============================================================
export const seedPhongHoc: PhongHoc[] = [
  { id: id('ph', 1), ten: 'Phòng A101', sucChua: 30, moTa: 'Phòng học có máy chiếu', trangThai: 'hoatDong' },
  { id: id('ph', 2), ten: 'Phòng A102', sucChua: 25, moTa: 'Phòng học nhỏ', trangThai: 'hoatDong' },
  { id: id('ph', 3), ten: 'Phòng B201', sucChua: 40, moTa: 'Phòng học lớn có điều hòa', trangThai: 'hoatDong' },
  { id: id('ph', 4), ten: 'Phòng B202', sucChua: 20, moTa: 'Phòng thực hành máy tính', trangThai: 'hoatDong' },
  { id: id('ph', 5), ten: 'Phòng C301', sucChua: 35, moTa: 'Phòng học đa năng', trangThai: 'hoatDong' },
  { id: id('ph', 6), ten: 'Phòng C302', sucChua: 15, moTa: 'Phòng học VIP', trangThai: 'tamNgung' },
];

// ============================================================
// Khóa học
// ============================================================
export const seedKhoaHoc: KhoaHoc[] = [
  {
    id: id('kh', 1),
    ten: 'Toán 10 Nâng Cao – Kỳ hè 2026',
    moTa: 'Bồi dưỡng toán nâng cao cho học sinh lớp 10',
    giangVienId: id('gv', 1),
    phongHocId: id('ph', 1),
    ngayKhaiGiang: '2026-07-15',
    soLuongToiThieu: 8,
    soLuongToiDa: 25,
    trangThai: 'Đang nhận đăng ký',
    ngayTao: '2026-06-01',
    buoiHoc: [
      { id: 'b_kh1_1', ngay: '2026-07-15', gioKhoi: '08:00', gioCuoi: '10:00', phongHocId: id('ph', 1) },
      { id: 'b_kh1_2', ngay: '2026-07-17', gioKhoi: '08:00', gioCuoi: '10:00', phongHocId: id('ph', 1) },
      { id: 'b_kh1_3', ngay: '2026-07-19', gioKhoi: '08:00', gioCuoi: '10:00', phongHocId: id('ph', 1) },
      { id: 'b_kh1_4', ngay: '2026-07-22', gioKhoi: '08:00', gioCuoi: '10:00', phongHocId: id('ph', 1) },
      { id: 'b_kh1_5', ngay: '2026-07-24', gioKhoi: '08:00', gioCuoi: '10:00', phongHocId: id('ph', 1) },
    ],
  },
  {
    id: id('kh', 2),
    ten: 'Tiếng Anh Giao Tiếp Cơ Bản',
    moTa: 'Lớp tiếng Anh giao tiếp cho người mới bắt đầu',
    giangVienId: id('gv', 3),
    phongHocId: id('ph', 3),
    ngayKhaiGiang: '2026-07-10',
    soLuongToiThieu: 10,
    soLuongToiDa: 30,
    trangThai: 'Đang diễn ra',
    ngayTao: '2026-05-15',
    buoiHoc: [
      { id: 'b_kh2_1', ngay: '2026-07-10', gioKhoi: '14:00', gioCuoi: '16:00', phongHocId: id('ph', 3) },
      { id: 'b_kh2_2', ngay: '2026-07-12', gioKhoi: '14:00', gioCuoi: '16:00', phongHocId: id('ph', 3) },
      { id: 'b_kh2_3', ngay: '2026-07-14', gioKhoi: '14:00', gioCuoi: '16:00', phongHocId: id('ph', 3) },
      { id: 'b_kh2_4', ngay: '2026-07-17', gioKhoi: '14:00', gioCuoi: '16:00', phongHocId: id('ph', 3) },
    ],
  },
  {
    id: id('kh', 3),
    ten: 'Hóa học 11 – Ôn thi THPT',
    moTa: 'Ôn tập hóa học lớp 11 chuẩn bị thi THPT',
    giangVienId: id('gv', 2),
    phongHocId: id('ph', 2),
    ngayKhaiGiang: '2026-07-20',
    soLuongToiThieu: 6,
    soLuongToiDa: 20,
    trangThai: 'Đang nhận đăng ký',
    ngayTao: '2026-06-10',
    buoiHoc: [
      { id: 'b_kh3_1', ngay: '2026-07-20', gioKhoi: '09:00', gioCuoi: '11:00', phongHocId: id('ph', 2) },
      { id: 'b_kh3_2', ngay: '2026-07-22', gioKhoi: '09:00', gioCuoi: '11:00', phongHocId: id('ph', 2) },
      { id: 'b_kh3_3', ngay: '2026-07-25', gioKhoi: '09:00', gioCuoi: '11:00', phongHocId: id('ph', 2) },
    ],
  },
  {
    id: id('kh', 4),
    ten: 'Tin học Văn phòng – Word & Excel',
    moTa: 'Kỹ năng tin học văn phòng cơ bản đến nâng cao',
    giangVienId: id('gv', 6),
    phongHocId: id('ph', 4),
    ngayKhaiGiang: '2026-06-01',
    soLuongToiThieu: 5,
    soLuongToiDa: 15,
    trangThai: 'Kết thúc',
    ngayTao: '2026-05-01',
    buoiHoc: [
      { id: 'b_kh4_1', ngay: '2026-06-01', gioKhoi: '09:00', gioCuoi: '11:30', phongHocId: id('ph', 4) },
      { id: 'b_kh4_2', ngay: '2026-06-03', gioKhoi: '09:00', gioCuoi: '11:30', phongHocId: id('ph', 4) },
    ],
  },
  {
    id: id('kh', 5),
    ten: 'Ngữ văn 12 – Luyện viết',
    moTa: 'Nâng cao kỹ năng viết cho học sinh lớp 12',
    giangVienId: id('gv', 4),
    phongHocId: id('ph', 5),
    ngayKhaiGiang: '2026-08-01',
    soLuongToiThieu: 10,
    soLuongToiDa: 20,
    trangThai: 'Nháp',
    ngayTao: '2026-06-20',
    buoiHoc: [
      { id: 'b_kh5_1', ngay: '2026-08-01', gioKhoi: '07:30', gioCuoi: '09:30', phongHocId: id('ph', 5) },
      { id: 'b_kh5_2', ngay: '2026-08-04', gioKhoi: '07:30', gioCuoi: '09:30', phongHocId: id('ph', 5) },
    ],
  },
  {
    id: id('kh', 6),
    ten: 'Vật lý 10 – Cơ bản',
    moTa: 'Vật lý cơ bản cho học sinh lớp 10',
    giangVienId: id('gv', 1),
    phongHocId: id('ph', 1),
    ngayKhaiGiang: '2026-07-18',
    soLuongToiThieu: 12,
    soLuongToiDa: 25,
    trangThai: 'Đang nhận đăng ký',
    ngayTao: '2026-06-15',
    buoiHoc: [
      { id: 'b_kh6_1', ngay: '2026-07-18', gioKhoi: '14:00', gioCuoi: '16:00', phongHocId: id('ph', 1) },
      { id: 'b_kh6_2', ngay: '2026-07-20', gioKhoi: '14:00', gioCuoi: '16:00', phongHocId: id('ph', 1) },
      { id: 'b_kh6_3', ngay: '2026-07-23', gioKhoi: '14:00', gioCuoi: '16:00', phongHocId: id('ph', 1) },
    ],
  },
];

// ============================================================
// Đăng ký
// ============================================================
export const seedDangKy: DangKy[] = [
  // Khóa 1: 7 học viên (gần đủ tối thiểu 8)
  ...Array.from({ length: 7 }, (_, i) => ({
    id: id('dk', i + 1),
    hocVienId: id('hv', i + 1),
    khoaHocId: id('kh', 1),
    ngayDangKy: '2026-06-20',
    trangThai: 'DaDuyet' as const,
    ghiChu: '',
  })),
  // Khóa 2: 15 học viên (đang diễn ra)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: id('dk', 10 + i),
    hocVienId: id('hv', (i % 20) + 1),
    khoaHocId: id('kh', 2),
    ngayDangKy: '2026-07-01',
    trangThai: 'DaDuyet' as const,
    ghiChu: '',
  })),
  // Khóa 3: 3 học viên (nguy cơ hủy)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: id('dk', 30 + i),
    hocVienId: id('hv', i + 8),
    khoaHocId: id('kh', 3),
    ngayDangKy: '2026-06-25',
    trangThai: 'DaDuyet' as const,
    ghiChu: '',
  })),
  // Khóa 6: 4 học viên (nguy cơ hủy, tối thiểu 12)
  ...Array.from({ length: 4 }, (_, i) => ({
    id: id('dk', 40 + i),
    hocVienId: id('hv', i + 12),
    khoaHocId: id('kh', 6),
    ngayDangKy: '2026-06-28',
    trangThai: 'DaDuyet' as const,
    ghiChu: '',
  })),
];
