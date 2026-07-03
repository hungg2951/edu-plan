'use client';

interface ProgressBarProps {
  value: number;      // current
  max: number;        // maximum
  min?: number;       // minimum (for warning)
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max, min, showLabel = true, size = 'md' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const isWarning = min !== undefined && value < min;
  const isFull = pct >= 100;

  const barColor = isFull
    ? 'bg-blue-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-blue-400';

  const trackH = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-slate-200 rounded-full overflow-hidden ${trackH}`}>
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium shrink-0 ${isWarning ? 'text-amber-600' : 'text-slate-600'}`}>
          {value}/{max}
        </span>
      )}
    </div>
  );
}
