import { NavLink } from 'react-router-dom';
import { PenLine, BookOpen, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { to: '/log', icon: PenLine, label: 'Log' },
  { to: '/lessons', icon: BookOpen, label: 'Learnings' },
  { to: '/stats', icon: BarChart2, label: 'Statistieken' },
  { to: '/settings', icon: Settings, label: 'Instellingen' },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 flex md:hidden dark:bg-neutral-900 dark:border-neutral-800"
    >
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-sage dark:text-sage' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`
          }
          aria-label={label}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
