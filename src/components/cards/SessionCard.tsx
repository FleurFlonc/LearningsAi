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
      className="w-full text-left bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4 hover:border-stone-300 hover:shadow-md dark:hover:border-slate-500 transition-all"
    >
      {/* Status dot + lesson */}
      <div className="flex gap-3 items-start">
        <span
          className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${
            session.status === 'success'
              ? 'bg-green-500'
              : session.status === 'partial'
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-stone-900 dark:text-slate-100 line-clamp-2 flex-1">
          {session.lessonLearned}
        </p>
      </div>

      {/* Meta row */}
      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        <StatusBadge status={session.status} />
        {session.aiTools?.map((t) => <AIToolBadge key={t} tool={t} />)}
        <span className="ml-auto text-xs text-stone-400 dark:text-slate-500 shrink-0">
          {formatSessionDate(session.createdAt)}
        </span>
      </div>
    </button>
  );
}
