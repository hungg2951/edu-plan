/**
 * Tiện ích tìm kiếm tiếng Việt — bỏ dấu khi so sánh
 */
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

export function vietSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return normalize(text).includes(normalize(query));
}

/**
 * Format ngày giờ sang tiếng Việt
 */
export function formatNgay(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatGio(hhmm: string): string {
  return hhmm;
}

const THU_VI = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function formatNgayGio(ngay: string, gioKhoi: string, gioCuoi: string): string {
  const d = new Date(ngay);
  const thu = THU_VI[d.getDay()];
  const formatted = d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${thu}, ${formatted}, ${gioKhoi}–${gioCuoi}`;
}

export function thoiGianTuNay(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  return `${days} ngày trước`;
}
