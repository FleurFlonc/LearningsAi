import { NavLink } from 'react-router-dom';
import { PenLine, BookOpen, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { to: '/log', icon: PenLine, label: 'Log' },
  { to: '/lessons', icon: BookOpen, label: 'Learnings' },
  { to: '/stats', icon: BarChart2, label: 'Statistieken' },
  { to: '/settings', icon: Settings, label: 'Instellingen' },
] as const;

export function Sidebar() {
  return (
    <aside
      aria-label="Hoofdnavigatie"
      className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-stone-200 dark:bg-slate-900 dark:border-slate-700 shrink-0"
    >
      {/* App name */}
      <div className="px-6 py-6 border-b border-stone-200 dark:border-slate-700/60">
        <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">AI Learning Log</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
