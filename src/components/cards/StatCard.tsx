import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  sublabel?: string;
}

export function StatCard({ label, value, icon, sublabel }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <span className="text-teal-600 dark:text-teal-400 shrink-0">{icon}</span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-stone-400 dark:text-slate-500">{sublabel}</p>
      )}
    </div>
  );
}
