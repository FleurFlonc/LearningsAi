import { useNavigate } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { useSessionStore } from '@/features/sessions/store/sessionStore';
import { SessionCard } from '@/components/cards/SessionCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { SessionStatus, AIToolType, TaskType } from '@/models/enums';

type FilterChip<T> = { value: T; label: string };

const STATUS_CHIPS: FilterChip<SessionStatus>[] = [
  { value: 'success', label: 'Gelukt' },
  { value: 'partial', label: 'Gedeeltelijk' },
  { value: 'failed', label: 'Mislukt' },
];

const TOOL_CHIPS: FilterChip<AIToolType>[] = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'other', label: 'Overig' },
];

const TASK_CHIPS: FilterChip<TaskType>[] = [
  { value: 'debugging', label: 'Debugging' },
  { value: 'prompting', label: 'Prompting' },
  { value: 'writing', label: 'Schrijven' },
  { value: 'research', label: 'Research' },
  { value: 'automation', label: 'Automatisering' },
  { value: 'ideation', label: 'Ideeën' },
  { value: 'ontwikkelen', label: 'Ontwikkelen' },
  { value: 'other', label: 'Overig' },
];

function FilterRow<T extends string>({
  chips,
  active,
  onToggle,
}: {
  chips: FilterChip<T>[];
  active: T | null;
  onToggle: (v: T | null) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {chips.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onToggle(isActive ? null : value)}
            aria-pressed={isActive}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function LessonsPage() {
  const navigate = useNavigate();
  const {
    sessions,
    searchQuery,
    filterStatus,
    filterTool,
    filterTaskType,
    setSearchQuery,
    setFilterStatus,
    setFilterTool,
    setFilterTaskType,
    filteredLessons,
  } = useSessionStore();

  const lessons = filteredLessons();
  const hasActiveFilters = !!(filterStatus || filterTool || filterTaskType || searchQuery);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center">
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="Je hebt nog geen sessies gelogd"
          description="Log je eerste AI-sessie en bouw aan je leerarchief."
          actionLabel="Log je eerste sessie"
          onAction={() => navigate('/log')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Learnings</h1>

      {/* Search */}
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Zoek in learnings, taken…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Zoek sessies"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-slate-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      {/* Filter chips */}
      <div className="space-y-2 mb-4">
        <FilterRow chips={STATUS_CHIPS} active={filterStatus} onToggle={setFilterStatus} />
        <FilterRow chips={TOOL_CHIPS} active={filterTool} onToggle={setFilterTool} />
        <FilterRow chips={TASK_CHIPS} active={filterTaskType} onToggle={setFilterTaskType} />
      </div>

      {/* Results */}
      {lessons.length === 0 ? (
        <EmptyState
          title="Geen learnings gevonden"
          description="Probeer andere zoektermen of filters."
          actionLabel={hasActiveFilters ? 'Filters wissen' : undefined}
          onAction={
            hasActiveFilters
              ? () => {
                  setSearchQuery('');
                  setFilterStatus(null);
                  setFilterTool(null);
                  setFilterTaskType(null);
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {lessons.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => navigate(`/lessons/${session.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
