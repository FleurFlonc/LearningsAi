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
  { value: 'other', label: 'Overig' },
];

const STATUS_OPTIONS: { value: SessionStatus; label: string; color: string }[] = [
  { value: 'success', label: 'Gelukt', color: 'bg-green-500 text-white' },
  { value: 'partial', label: 'Gedeeltelijk', color: 'bg-amber-500 text-white' },
  { value: 'failed', label: 'Mislukt', color: 'bg-red-500 text-white' },
];

const INACTIVE_STATUS = 'bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300';

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
        aiTool: prefill.aiTool,
        taskType: prefill.taskType,
      });
      if (prefill.whatWentWrong || prefill.aiTool || prefill.taskType) {
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
        <p className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest">
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
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
            >
              Wat probeerde je te doen?
            </label>
            <textarea
              id="taskDescription"
              rows={2}
              {...register('taskDescription')}
              placeholder="Beschrijf de taak in één of twee zinnen"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-slate-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
            />
            {errors.taskDescription && (
              <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.taskDescription.message}
              </p>
            )}
          </div>

          {/* status */}
          <div>
            <p className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
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
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 rounded-xl p-4">
            <label
              htmlFor="lessonLearned"
              className="block text-sm font-bold text-amber-900 dark:text-amber-200 mb-1.5"
            >
              Wat is de les?
            </label>
            <textarea
              id="lessonLearned"
              rows={3}
              {...register('lessonLearned')}
              placeholder="Wat neem je mee naar de volgende keer?"
              className="w-full px-3 py-2.5 rounded-xl border border-amber-200 bg-white/80 text-sm text-slate-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none dark:bg-slate-800/60 dark:border-amber-700/60 dark:text-slate-100 dark:placeholder-amber-700"
            />
            {errors.lessonLearned && (
              <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.lessonLearned.message}
              </p>
            )}
          </div>

          {/* Expandable extra fields */}
          <div className="border-t border-stone-200 dark:border-slate-700 pt-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 transition-colors"
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
                  <label htmlFor="whatWentWrong" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Wat ging er mis?
                  </label>
                  <textarea
                    id="whatWentWrong"
                    rows={2}
                    {...register('whatWentWrong')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm text-slate-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="resolution" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hoe heb je het opgelost?
                  </label>
                  <textarea
                    id="resolution"
                    rows={2}
                    {...register('resolution')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm text-slate-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="aiTool" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      AI-tool
                    </label>
                    <select
                      id="aiTool"
                      {...register('aiTool')}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    >
                      <option value="">— kies —</option>
                      {AI_TOOL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="taskType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Taaktype
                    </label>
                    <select
                      id="taskType"
                      {...register('taskType')}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    >
                      <option value="">— kies —</option>
                      {TASK_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="reflectionNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reflectie
                  </label>
                  <textarea
                    id="reflectionNotes"
                    rows={2}
                    {...register('reflectionNotes')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm text-slate-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={saveStatus === 'saving' || saveStatus === 'success'}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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
