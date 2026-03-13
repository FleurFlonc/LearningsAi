export function PrivateBrowsingWarning() {
  return (
    <div
      role="alert"
      className="bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800 px-4 py-3"
    >
      <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
        Private browsing gedetecteerd
      </p>
      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
        Data wordt mogelijk niet opgeslagen. Gebruik een reguliere browsertab voor permanente opslag.
      </p>
    </div>
  );
}
