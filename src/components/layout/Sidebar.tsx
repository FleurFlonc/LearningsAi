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
      className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 shrink-0"
    >
      {/* App name */}
      <div className="px-6 py-6 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">AI Learning Log</span>
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
                  ? 'bg-sage-subtle text-sage dark:bg-sage/10 dark:text-sage'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800'
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
