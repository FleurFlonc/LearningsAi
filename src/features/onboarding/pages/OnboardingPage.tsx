import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePreferenceStore } from '@/features/settings/store/preferenceStore';

const EXAMPLE_SESSION = {
  taskDescription: 'Een Python script debuggen dat onverwacht crasht bij grote datasets.',
  status: 'Gelukt' as const,
  lessonLearned:
    'Altijd eerst de datagrootte controleren. De fout zat in een ontbrekende grenscontrole — één if-statement oploste het.',
};

interface StepProps {
  onNext: () => void;
}

function Step1({ onNext }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-6">
        <span className="text-3xl" aria-hidden="true">📖</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
        Welkom bij AI Learning Log
      </h1>
      <p className="text-base text-stone-600 dark:text-slate-400 leading-relaxed max-w-sm">
        Deze app helpt je om systematisch bij te houden wat je leert van AI-sessies. Zo leer je sneller en vergeet je minder.
      </p>
      <button
        onClick={onNext}
        className="mt-8 w-full max-w-xs py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 dark:bg-teal-700 dark:hover:bg-teal-600"
      >
        Volgende
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function Step2({ onNext }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-6">
        <span className="text-3xl" aria-hidden="true">⚡</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
        Wat is een sessie?
      </h1>
      <p className="text-base text-stone-600 dark:text-slate-400 leading-relaxed max-w-sm">
        Een sessie is een afgeronde werkeenheid waarbij je een specifieke taak met een AI-tool hebt geprobeerd — of dat nu gelukt is of niet. Één gerichte poging of een reeks prompts rondom dezelfde taak.
      </p>

      {/* Example card */}
      <div className="mt-6 w-full max-w-sm text-left bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
          <p className="text-xs text-stone-500 dark:text-slate-400">{EXAMPLE_SESSION.taskDescription}</p>
        </div>
        <div className="pl-4">
          <span className="inline-block mb-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
            {EXAMPLE_SESSION.status}
          </span>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
            {EXAMPLE_SESSION.lessonLearned}
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full max-w-xs py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 dark:bg-teal-700 dark:hover:bg-teal-600"
      >
        Volgende
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function Step3({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-6">
        <span className="text-3xl" aria-hidden="true">🚀</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
        Klaar om te starten
      </h1>
      <p className="text-base text-stone-600 dark:text-slate-400 leading-relaxed max-w-sm">
        Log je eerste sessie. Het invullen duurt minder dan 2 minuten.
      </p>
      <button
        onClick={onFinish}
        className="mt-8 w-full max-w-xs py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 dark:bg-teal-700 dark:hover:bg-teal-600"
      >
        Log mijn eerste sessie
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = usePreferenceStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);

  const handleFinish = async () => {
    await completeOnboarding();
    navigate('/log', { replace: true });
  };

  const steps = [
    <Step1 key={0} onNext={() => setStep(1)} />,
    <Step2 key={1} onNext={() => setStep(2)} />,
    <Step3 key={2} onFinish={handleFinish} />,
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-900 flex flex-col items-center justify-center px-6 py-10">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10" aria-label={`Stap ${step + 1} van 3`} role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-teal-700 dark:bg-teal-400' : 'bg-stone-300 dark:bg-slate-600'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="w-full max-w-sm">{steps[step]}</div>
    </div>
  );
}
