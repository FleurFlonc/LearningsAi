import type { LearningSession } from '@/models/session';
import { formatSessionDate } from '@/features/sessions/utils/sessionUtils';
import { StatusBadge } from '@/components/forms/StatusBadge';
import { AIToolBadge } from '@/components/forms/AIToolBadge';

interface SessionCardProps {
  session: LearningSession;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-md transition-all"
    >
      {/* Status dot + lesson */}
      <div className="flex gap-3 items-start">
        <span
          className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${
            session.status === 'success'
              ? 'bg-green-500'
              : session.status === 'partial'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 flex-1">
          {session.lessonLearned}
        </p>
      </div>

      {/* Meta row */}
      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        <StatusBadge status={session.status} />
        {session.aiTools?.map((t) => <AIToolBadge key={t} tool={t} />)}
        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
          {formatSessionDate(session.createdAt)}
        </span>
      </div>
    </button>
  );
}
