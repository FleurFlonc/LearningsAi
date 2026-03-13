import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  sublabel?: string;
}

export function StatCard({ label, value, icon, sublabel }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <span className="text-sage shrink-0">{icon}</span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{sublabel}</p>
      )}
    </div>
  );
}
