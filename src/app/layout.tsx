import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "SASUCO – Hệ thống Quản lý Trung tâm Đào tạo",
  description: "Phần mềm quản lý lịch dạy, học viên và khóa học tại trung tâm đào tạo SASUCO",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.variable} h-full`}>
      <body className="h-full bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
