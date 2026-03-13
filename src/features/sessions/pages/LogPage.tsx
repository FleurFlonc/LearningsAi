import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import type { z } from 'zod';
import { CreateSessionSchema } from '@/features/sessions/schemas/sessionSchema';
import { useSessionStore } from '@/features/sessions/store/sessionStore';
import { incrementSessionCount, shouldShowExportReminder } from '@/features/settings/services/preferenceService';
import { getStatusLabel } from '@/features/sessions/utils/sessionUtils';
import { ExportReminder } from '@/components/feedback/ExportReminder';
import type { SessionStatus, AIToolType, TaskType } from '@/models/enums';
import type { LearningSession } from '@/models/session';

type FormValues = z.infer<typeof CreateSessionSchema>;

const AI_TOOL_OPTIONS: { value: AIToolType; label: string }[] = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'other', label: 'Overig' },
];

const TASK_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: 'debugging', label: 'Debugging' },
  { value: 'prompting', label: 'Prompting' },
  { value: 'writing', label: 'Schrijven' },
  { value: 'research', label: 'Research' },
  { value: 'automation', label: 'Automatisering' },
  { value: 'ideation', label: 'Ideeën' },
  { value: 'ontwikkelen', label: 'Ontwikkelen' },
  { value: 'other', label: 'Overig' },
];

const STATUS_OPTIONS: { value: SessionStatus; label: string; color: string }[] = [
  { value: 'success', label: 'Gelukt', color: 'bg-green-500 text-white' },
  { value: 'partial', label: 'Gedeeltelijk', color: 'bg-yellow-500 text-white' },
  { value: 'failed', label: 'Mislukt', color: 'bg-red-500 text-white' },
];

const INACTIVE_STATUS = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300';

export function LogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createSession = useSessionStore((state) => state.createSession);

  const [showDetails, setShowDetails] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showExportReminder, setShowExportReminder] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateSessionSchema),
    defaultValues: {
      taskDescription: '',
      lessonLearned: '',
      whatWentWrong: '',
      resolution: '',
      reflectionNotes: '',
      aiTools: [],
    },
  });

  // Pre-fill form when navigating from duplicate
  useEffect(() => {
    const prefill = (location.state as { prefillSession?: LearningSession } | null)?.prefillSession;
    if (prefill) {
      reset({
        taskDescription: prefill.taskDescription,
        status: prefill.status,
        lessonLearned: prefill.lessonLearned,
        whatWentWrong: prefill.whatWentWrong ?? '',
        resolution: prefill.resolution ?? '',
        reflectionNotes: prefill.reflectionNotes ?? '',
        aiTools: prefill.aiTools ?? ((prefill as any).aiTool ? [(prefill as any).aiTool as AIToolType] : []),
        taskType: prefill.taskType,
      });
      if (prefill.whatWentWrong || prefill.aiTools?.length || (prefill as any).aiTool || prefill.taskType) {
        setShowDetails(true);
      }
    }
  }, [location.state, reset]);

  const selectedStatus = watch('status');

  const onSubmit = async (data: FormValues) => {
    setSaveStatus('saving');
    try {
      await createSession({
        ...data,
        whatWentWrong: data.whatWentWrong?.trim() || undefined,
        resolution: data.resolution?.trim() || undefined,
        reflectionNotes: data.reflectionNotes?.trim() || undefined,
        aiTools: data.aiTools?.length ? data.aiTools : undefined,
      });
      await incrementSessionCount();
      setSaveStatus('success');
      reset();
      setShowDetails(false);

      const shouldRemind = await shouldShowExportReminder();
      if (shouldRemind) {
        setShowExportReminder(true);
      } else {
        setTimeout(() => {
          setSaveStatus('idle');
          navigate('/lessons');
        }, 1200);
      }
    } catch {
      setSaveStatus('idle');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          AI Learning Log
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Nieuwe sessie
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          {/* taskDescription */}
          <div>
            <label
              htmlFor="taskDescription"
              className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5"
            >
              Wat probeerde je te doen?
            </label>
            <textarea
              id="taskDescription"
              rows={2}
              {...register('taskDescription')}
              placeholder="Beschrijf de taak in één of twee zinnen"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500"
            />
            {errors.taskDescription && (
              <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.taskDescription.message}
              </p>
            )}
          </div>

          {/* status */}
          <div>
            <p className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              Hoe liep het af?
            </p>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      aria-pressed={field.value === value}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        field.value === value ? color : INACTIVE_STATUS
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.status && (
              <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                Selecteer een uitkomst
              </p>
            )}
          </div>

          {/* lessonLearned — visually prominent */}
          <div className="bg-sage-subtle/60 dark:bg-sage/10 border border-sage/20 dark:border-sage/20 rounded-xl p-4">
            <label
              htmlFor="lessonLearned"
              className="block text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1.5"
            >
              Wat is de les?
            </label>
            <textarea
              id="lessonLearned"
              rows={3}
              {...register('lessonLearned')}
              placeholder="Wat neem je mee naar de volgende keer?"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white/80 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-600"
            />
            {errors.lessonLearned && (
              <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.lessonLearned.message}
              </p>
            )}
          </div>

          {/* Expandable extra fields */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-expanded={showDetails}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
              Meer details
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="whatWentWrong" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Wat ging er mis?
                  </label>
                  <textarea
                    id="whatWentWrong"
                    rows={2}
                    {...register('whatWentWrong')}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label htmlFor="resolution" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Hoe heb je het opgelost?
                  </label>
                  <textarea
                    id="resolution"
                    rows={2}
                    {...register('resolution')}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  />
                </div>

                {/* AI-tools — multi-select toggle pills */}
                <div>
                  <p className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    AI-tool(s)
                  </p>
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
                  <label htmlFor="taskType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Taaktype
                  </label>
                  <select
                    id="taskType"
                    {...register('taskType')}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  >
                    <option value="">— kies —</option>
                    {TASK_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reflectionNotes" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Reflectie
                  </label>
                  <textarea
                    id="reflectionNotes"
                    rows={2}
                    {...register('reflectionNotes')}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={saveStatus === 'saving' || saveStatus === 'success'}
            className="w-full py-3.5 bg-sage hover:bg-sage-hover disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saveStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Opgeslagen
              </>
            ) : saveStatus === 'saving' ? (
              'Opslaan…'
            ) : (
              'Sessie opslaan'
            )}
          </button>
        </div>
      </form>

      {/* Export reminder appears after 10 sessions */}
      {showExportReminder && (
        <ExportReminder
          onDismiss={() => {
            setShowExportReminder(false);
            setSaveStatus('idle');
            navigate('/lessons');
          }}
        />
      )}
    </div>
  );
}
