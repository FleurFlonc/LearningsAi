export function PrivateBrowsingWarning() {
  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3"
    >
      <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
        Private browsing gedetecteerd
      </p>
      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
        Data wordt mogelijk niet opgeslagen. Gebruik een reguliere browsertab voor permanente opslag.
      </p>
    </div>
  );
}
