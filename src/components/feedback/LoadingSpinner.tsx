export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8" aria-label="Laden...">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-sage rounded-full animate-spin dark:border-neutral-700 dark:border-t-sage" />
    </div>
  );
}
