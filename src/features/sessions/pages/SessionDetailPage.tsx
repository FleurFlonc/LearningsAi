import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Pencil, Copy, Trash2, Star, X, Check } from 'lucide-react';
import type { z } from 'zod';
import { CreateSessionSchema } from '@/features/sessions/schemas/sessionSchema';
import { useSessionStore } from '@/features/sessions/store/sessionStore';
import { StatusBadge } from '@/components/forms/StatusBadge';
import { AIToolBadge } from '@/components/forms/AIToolBadge';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { formatSessionDate, formatSessionTime } from '@/features/sessions/utils/sessionUtils';
import type { SessionStatus, AIToolType, TaskType } from '@/models/enums';

type FormValues = z.infer<typeof CreateSessionSchema>;

const STATUS_OPTIONS: { value: SessionStatus; label: string; color: string }[] = [
  { value: 'success', label: 'Gelukt', color: 'bg-green-500 text-white' },
  { value: 'partial', label: 'Gedeeltelijk', color: 'bg-yellow-500 text-white' },
  { value: 'failed', label: 'Mislukt', color: 'bg-red-500 text-white' },
];
const INACTIVE_STATUS = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300';

const AI_TOOL_OPTIONS: { value: AIToolType; label: string }[] = [
  { value: 'chatgpt', label: 'ChatGPT' }, { value: 'claude', label: 'Claude' },
  { value: 'cursor', label: 'Cursor' }, { value: 'gemini', label: 'Gemini' },
  { value: 'copilot', label: 'Copilot' }, { value: 'other', label: 'Overig' },
];
const TASK_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: 'debugging', label: 'Debugging' }, { value: 'prompting', label: 'Prompting' },
  { value: 'writing', label: 'Schrijven' }, { value: 'research', label: 'Research' },
  { value: 'automation', label: 'Automatisering' }, { value: 'ideation', label: 'Ideeën' },
  { value: 'ontwikkelen', label: 'Ontwikkelen' }, { value: 'other', label: 'Overig' },
];

const Stars = ({ value }: { value: number }) => (
  <span className="text-sage">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
);

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessions, updateSession, deleteSession } = useSessionStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const session = sessions.find((s) => s.id === id);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(CreateSessionSchema),
  });

  useEffect(() => {
    if (session && isEditing) {
      reset({
        taskDescription: session.taskDescription,
        status: session.status,
        lessonLearned: session.lessonLearned,
        whatWentWrong: session.whatWentWrong ?? '',
        resolution: session.resolution ?? '',
        reflectionNotes: session.reflectionNotes ?? '',
        aiTools: session.aiTools ?? ((session as any).aiTool ? [(session as any).aiTool as AIToolType] : []),
        taskType: session.taskType,
        learningValue: session.learningValue,
        frustrationLevel: session.frustrationLevel,
        durationMinutes: session.durationMinutes,
      });
    }
  }, [isEditing, session, reset]);

  if (!session) return <LoadingSpinner />;

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      await updateSession({
        id: session.id,
        ...data,
        whatWentWrong: data.whatWentWrong?.trim() || undefined,
        resolution: data.resolution?.trim() || undefined,
        reflectionNotes: data.reflectionNotes?.trim() || undefined,
        aiTools: data.aiTools?.length ? data.aiTools : undefined,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteSession(session.id);
    navigate('/lessons');
  };

  const handleDuplicate = () => {
    navigate('/log', { state: { prefillSession: session } });
  };

  const fieldClass =
    'w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100';
  const labelClass = 'block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1';

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('/lessons')}
          className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          aria-label="Terug naar learnings"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Terug
        </button>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-sage hover:text-sage-hover"
            aria-label="Sessie bewerken"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            Bewerken
          </button>
        )}
      </div>

      {isEditing ? (
        /* ── EDIT MODE ── */
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5">
            <div>
              <label htmlFor="edit-task" className={labelClass}>Taak</label>
              <textarea id="edit-task" rows={2} {...register('taskDescription')} className={`${fieldClass} resize-none`} />
              {errors.taskDescription && <p role="alert" className="mt-1 text-xs text-red-600">{errors.taskDescription.message}</p>}
            </div>
            <div>
              <p className={labelClass}>Uitkomst</p>
              <Controller name="status" control={control} render={({ field }) => (
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(({ value, label, color }) => (
                    <button key={value} type="button" onClick={() => field.onChange(value)} aria-pressed={field.value === value}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${field.value === value ? color : INACTIVE_STATUS}`}>{label}</button>
                  ))}
                </div>
              )} />
            </div>
            <div className="bg-sage-subtle/60 dark:bg-sage/10 border border-sage/20 dark:border-sage/20 rounded-xl p-4">
              <label htmlFor="edit-lesson" className="block text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">Learning</label>
              <textarea id="edit-lesson" rows={3} {...register('lessonLearned')} className={`${fieldClass} resize-none`} />
              {errors.lessonLearned && <p role="alert" className="mt-1 text-xs text-red-600">{errors.lessonLearned.message}</p>}
            </div>
            <div>
              <label htmlFor="edit-wrong" className={labelClass}>Wat ging mis?</label>
              <textarea id="edit-wrong" rows={2} {...register('whatWentWrong')} className={`${fieldClass} resize-none`} />
            </div>
            <div>
              <label htmlFor="edit-resolution" className={labelClass}>Oplossing</label>
              <textarea id="edit-resolution" rows={2} {...register('resolution')} className={`${fieldClass} resize-none`} />
            </div>

            {/* AI-tools — multi-select toggle pills */}
            <div>
              <p className={labelClass}>AI-tool(s)</p>
              <Controller
                name="aiTools"
                control={control}
                render={({ field }) => {
                  const selected = field.value ?? [];
                  return (
                    <div className="flex flex-wrap gap-1.5">
                      {AI_TOOL_OPTIONS.map(({ value, label }) => {
                        const isSelected = selected.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              field.onChange(
                                isSelected
                                  ? selected.filter((t) => t !== value)
                                  : [...selected, value],
                              )
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-neutral-900 text-white dark:bg-sage dark:text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </div>

            <div>
              <label htmlFor="edit-task-type" className={labelClass}>Taaktype</label>
              <select id="edit-task-type" {...register('taskType')} className={fieldClass}>
                <option value="">— kies —</option>
                {TASK_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="edit-reflection" className={labelClass}>Reflectie</label>
              <textarea id="edit-reflection" rows={2} {...register('reflectionNotes')} className={`${fieldClass} resize-none`} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSaving}
                className="flex-1 py-3 bg-sage hover:bg-sage-hover disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" aria-hidden="true" />
                {isSaving ? 'Opslaan…' : 'Opslaan'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-colors dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600 flex items-center justify-center gap-2">
                <X className="w-4 h-4" aria-hidden="true" />
                Annuleren
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* ── VIEW MODE ── */
        <div className="space-y-5">
          {/* Learning — most prominent */}
          <div className="bg-sage-subtle/60 dark:bg-sage/10 border border-sage/20 dark:border-sage/20 rounded-xl p-5">
            <p className="text-xs font-semibold text-sage uppercase tracking-wide mb-2">Learning</p>
            <p className="text-base font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
              {session.lessonLearned}
            </p>
          </div>

          {/* Badges + meta */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <StatusBadge status={session.status} />
            {session.aiTools?.map((t) => <AIToolBadge key={t} tool={t} />)}
            {session.taskType && (
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                {TASK_TYPE_OPTIONS.find((o) => o.value === session.taskType)?.label ?? session.taskType}
              </span>
            )}
            <span className="ml-auto">
              {formatSessionDate(session.createdAt)} · {formatSessionTime(session.createdAt)}
            </span>
          </div>

          {/* taskDescription */}
          <div>
            <p className={labelClass}>Taakbeschrijving</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{session.taskDescription}</p>
          </div>

          {session.whatWentWrong && (
            <div>
              <p className={labelClass}>Wat ging er mis?</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{session.whatWentWrong}</p>
            </div>
          )}
          {session.resolution && (
            <div>
              <p className={labelClass}>Oplossing</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{session.resolution}</p>
            </div>
          )}
          {session.reflectionNotes && (
            <div>
              <p className={labelClass}>Reflectie</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{session.reflectionNotes}</p>
            </div>
          )}

          {(session.learningValue || session.frustrationLevel) && (
            <div className="grid grid-cols-2 gap-4">
              {session.learningValue && (
                <div>
                  <p className={labelClass}>Leerwaarde</p>
                  <Stars value={session.learningValue} />
                </div>
              )}
              {session.frustrationLevel && (
                <div>
                  <p className={labelClass}>Frustratie</p>
                  <Stars value={session.frustrationLevel} />
                </div>
              )}
            </div>
          )}
          {session.durationMinutes && (
            <div>
              <p className={labelClass}>Tijdsduur</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{session.durationMinutes} minuten</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDuplicate}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl transition-colors dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            >
              <Copy className="w-4 h-4" aria-hidden="true" />
              Dupliceer
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
              aria-label="Sessie verwijderen"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-3">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                Weet je zeker dat je deze sessie wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Ja, verwijderen
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-lg transition-colors dark:bg-neutral-700 dark:text-neutral-200"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
