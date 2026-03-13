import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 text-neutral-300 dark:text-neutral-600">{icon}</div>
      )}
      <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500 max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 bg-sage hover:bg-sage-hover text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
