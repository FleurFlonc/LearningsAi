export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8" aria-label="Laden...">
      <div className="w-6 h-6 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin dark:border-slate-700 dark:border-t-amber-400" />
    </div>
  );
}
