'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { KpiCard } from '@/components/ui/KpiCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { formatNgay } from '@/lib/vietnameseUtils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const {
    khoaHocs, giangViens, hocViens, dangKys,
    getTenGiangVien, getTenPhongHoc, getSoLuongDangKy,
    getKhoaNguyCo,
  } = useAppStore();

  // KPI
  const kpi = useMemo(() => {
    const dangNhanDK = khoaHocs.filter((k) => k.trangThai === 'Đang nhận đăng ký').length;
    const dangDienRa = khoaHocs.filter((k) => ['Đã khai giảng', 'Đang diễn ra'].includes(k.trangThai)).length;
    const ketThuc = khoaHocs.filter((k) => k.trangThai === 'Kết thúc').length;
    const tongHocVien = hocViens.filter((h) => h.trangThai === 'hoatDong').length;
    return { dangNhanDK, dangDienRa, ketThuc, tongHocVien };
  }, [khoaHocs, hocViens]);

  // Sắp khai giảng (trong 30 ngày tới, đang nhận ĐK hoặc nháp)
  const sapKhaiGiang = useMemo(() => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 86400000);
    return khoaHocs
      .filter((k) => {
        const d = new Date(k.ngayKhaiGiang);
        return d >= now && d <= in30 && ['Đang nhận đăng ký', 'Nháp'].includes(k.trangThai);
      })
      .sort((a, b) => a.ngayKhaiGiang.localeCompare(b.ngayKhaiGiang))
      .slice(0, 8);
  }, [khoaHocs]);

  // Nguy cơ hủy
  const nguyCo = useMemo(() => getKhoaNguyCo(), [khoaHocs, dangKys]);

  // Xếp hạng giảng viên theo số buổi dạy trong tháng hiện tại
  const rankGV = useMemo(() => {
    const now = new Date();
    const thang = now.getMonth();
    const nam = now.getFullYear();

    const data = giangViens
      .filter((g) => g.trangThai === 'hoatDong')
      .map((gv) => {
        const sobuoi = khoaHocs
          .filter((k) => k.giangVienId === gv.id)
          .reduce((sum, k) => {
            const buoiThang = k.buoiHoc.filter((b) => {
              const d = new Date(b.ngay);
              return d.getMonth() === thang && d.getFullYear() === nam;
            }).length;
            return sum + buoiThang;
          }, 0);
        return { name: gv.ten.split(' ').slice(-1)[0], fullName: gv.ten, sobuoi };
      })
      .filter((g) => g.sobuoi > 0)
      .sort((a, b) => b.sobuoi - a.sobuoi);

    return data;
  }, [giangViens, khoaHocs]);

  const thangHienTai = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cập nhật {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Đang nhận đăng ký"
          value={kpi.dangNhanDK}
          icon="📋"
          color="blue"
          description="Khóa đang mở đăng ký"
        />
        <KpiCard
          label="Đang diễn ra"
          value={kpi.dangDienRa}
          icon="▶️"
          color="green"
          description="Khóa đã khai giảng"
        />
        <KpiCard
          label="Đã kết thúc"
          value={kpi.ketThuc}
          icon="✅"
          color="slate"
          description="Tổng khóa hoàn thành"
        />
        <KpiCard
          label="Học viên hoạt động"
          value={kpi.tongHocVien}
          icon="🎓"
          color="amber"
          description={`/${hocViens.length} tổng số`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: 2/3 width */}
        <div className="lg:col-span-2 space-y-6">

          {/* Sắp khai giảng */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">📅 Sắp khai giảng (30 ngày tới)</h2>
              <span className="text-xs text-slate-400">{sapKhaiGiang.length} khóa</span>
            </div>
            {sapKhaiGiang.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                Không có khóa nào sắp khai giảng trong 30 ngày tới
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sapKhaiGiang.map((khoa) => {
                  const soLuong = getSoLuongDangKy(khoa.id);
                  return (
                    <div key={khoa.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{khoa.ten}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            👨‍🏫 {getTenGiangVien(khoa.giangVienId)} &nbsp;·&nbsp;
                            🏫 {getTenPhongHoc(khoa.phongHocId)} &nbsp;·&nbsp;
                            📅 {formatNgay(khoa.ngayKhaiGiang)}
                          </p>
                        </div>
                        <Badge variant={khoa.trangThai} />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <ProgressBar
                            value={soLuong}
                            max={khoa.soLuongToiDa}
                            min={khoa.soLuongToiThieu}
                            size="sm"
                          />
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                          Tối thiểu {khoa.soLuongToiThieu}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nguy cơ hủy */}
          {nguyCo.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
              <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2">
                <span className="text-amber-500">⚠️</span>
                <h2 className="font-semibold text-amber-800">Khóa có nguy cơ bị hủy</h2>
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {nguyCo.length} khóa
                </span>
              </div>
              <div className="divide-y divide-amber-50">
                {nguyCo.map((khoa) => {
                  const soLuong = getSoLuongDangKy(khoa.id);
                  const con = khoa.soLuongToiThieu - soLuong;
                  return (
                    <div key={khoa.id} className="px-5 py-3.5 bg-amber-50/40">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{khoa.ten}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            👨‍🏫 {getTenGiangVien(khoa.giangVienId)} &nbsp;·&nbsp; 📅 {formatNgay(khoa.ngayKhaiGiang)}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                          Còn thiếu {con} HV
                        </span>
                      </div>
                      <ProgressBar value={soLuong} max={khoa.soLuongToiDa} min={khoa.soLuongToiThieu} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column: 1/3 width */}
        <div className="space-y-6">
          {/* Xếp hạng GV tháng này */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">🏆 Giảng viên tháng này</h2>
              <p className="text-xs text-slate-400 mt-0.5">{thangHienTai}</p>
            </div>
            {rankGV.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                Chưa có dữ liệu lịch dạy tháng này
              </div>
            ) : (
              <div className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={rankGV} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={60} />
                    <Tooltip
                      formatter={(v: number) => [`${v} buổi`, 'Số buổi dạy']}
                      labelFormatter={(label) => rankGV.find((g) => g.name === label)?.fullName ?? label}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="sobuoi" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-3 space-y-1.5">
                  {rankGV.slice(0, 5).map((gv, i) => (
                    <div key={gv.fullName} className="flex items-center gap-2 text-sm">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-700'
                        : i === 1 ? 'bg-slate-100 text-slate-600'
                        : i === 2 ? 'bg-orange-100 text-orange-600'
                        : 'bg-slate-50 text-slate-400'
                      }`}>{i + 1}</span>
                      <span className="flex-1 text-slate-700 truncate">{gv.fullName}</span>
                      <span className="text-slate-500 font-medium shrink-0">{gv.sobuoi} buổi</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-4">📈 Tổng quan hệ thống</h2>
            <div className="space-y-3">
              {[
                { label: 'Tổng số khóa học', value: khoaHocs.length, icon: '📚' },
                { label: 'Giảng viên hoạt động', value: giangViens.filter((g) => g.trangThai === 'hoatDong').length, icon: '👨‍🏫' },
                { label: 'Phòng học sử dụng được', value: useAppStore.getState().phongHocs.filter((p) => p.trangThai === 'hoatDong').length, icon: '🏫' },
                { label: 'Tổng lượt đăng ký', value: dangKys.filter((d) => d.trangThai === 'DaDuyet').length, icon: '✏️' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
