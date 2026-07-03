# SASUCO - Hệ thống Quản lý Đào tạo

## Kiến trúc (Architecture)

Hệ thống xây dựng trên **Next.js 16 (App Router) + React 19 + Tailwind CSS v4**.

- **State Management**: Zustand tích hợp LocalStorage để lưu trữ và đồng bộ dữ liệu hoàn toàn dưới client-side (offline-first).
- **Core Engine (`src/lib`)**: Bộ kiểm tra trùng lịch dạy/học (giữa giáo viên, phòng và học viên) hoạt động theo thời gian thực và bộ lọc tìm kiếm tiếng Việt không dấu.
- **Xuất dữ liệu**: Tích hợp thư viện `xlsx` để xuất lịch giảng dạy và danh sách học viên.

## Cài đặt & Chạy dự án

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Biên dịch bản Production
npm run build
```

Truy cập [http://localhost:3000](http://localhost:3000)
