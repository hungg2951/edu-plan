'use client';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
  description?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', value: 'text-blue-700', label: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', value: 'text-green-700', label: 'text-green-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700', label: 'text-amber-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', value: 'text-red-700', label: 'text-red-600' },
  slate: { bg: 'bg-slate-50', icon: 'bg-slate-100 text-slate-500', value: 'text-slate-700', label: 'text-slate-500' },
};

export function KpiCard({ label, value, icon, color = 'blue', description }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-xl p-5 border border-white shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${c.label} mb-1`}>{label}</p>
          <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.icon} flex items-center justify-center text-lg shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
