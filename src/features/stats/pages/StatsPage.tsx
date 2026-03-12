import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Zap, Calendar, Star, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useSessionStore } from '@/features/sessions/store/sessionStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { StatCard } from '@/components/cards/StatCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { getWeeklyData, getStatusData, getToolData } from '@/features/stats/utils/chartUtils';

// ── Custom tooltips ─────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
}

function LineTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900 text-slate-100 text-xs px-3 py-2 rounded-lg shadow-lg border border-neutral-700">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="font-semibold">{payload[0].value} sessies</p>
    </div>
  );
}

function BarTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900 text-slate-100 text-xs px-3 py-2 rounded-lg shadow-lg border border-neutral-700">
      <p className="font-semibold">{payload[0].value} sessies</p>
    </div>
  );
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900 text-slate-100 text-xs px-3 py-2 rounded-lg shadow-lg border border-neutral-700">
      <p>
        {payload[0].name}: <span className="font-semibold">{payload[0].value}</span>
      </p>
    </div>
  );
}

// ── Chart card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── TOOL_LABELS for stat card ────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', claude: 'Claude', cursor: 'Cursor',
  gemini: 'Gemini', copilot: 'Copilot', other: 'Overig',
};

// ── StatsPage ────────────────────────────────────────────────────────────────

export function StatsPage() {
  const navigate = useNavigate();
  const sessions = useSessionStore((state) => state.sessions);
  const analytics = useAnalytics();

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center">
        <EmptyState
          icon={<BarChart2 className="w-10 h-10" />}
          title="Nog geen statistieken"
          description="Log je eerste sessies om inzicht te krijgen in je leerproces."
          actionLabel="Log een sessie"
          onAction={() => navigate('/log')}
        />
      </div>
    );
  }

  const weeklyData = getWeeklyData(sessions);
  const statusData = getStatusData(sessions);
  const toolData = getToolData(sessions);
  const toolChartHeight = Math.max(150, toolData.length * 52);
  const showCharts = sessions.length >= 3;

  const gridColor = 'rgba(148,163,184,0.15)';
  const axisColor = '#94a3b8';
  const accentColor = '#0F766E';

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8 md:max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-5">Statistieken</h1>

      {/* ── Six stat cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 mb-8">
        <StatCard
          label="Totaal sessies"
          value={analytics.totalSessions}
          icon={<BarChart2 className="w-4 h-4" />}
        />
        <StatCard
          label="Succesratio"
          value={`${Math.round(analytics.successRate)}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          sublabel={`${Math.round(analytics.failureRate)}% mislukt`}
        />
        <StatCard
          label="Meest gebruikt"
          value={analytics.mostUsedAITool ? TOOL_LABELS[analytics.mostUsedAITool] : '—'}
          icon={<Zap className="w-4 h-4" />}
        />
        <StatCard
          label="Deze week"
          value={analytics.sessionsThisWeek}
          icon={<Calendar className="w-4 h-4" />}
          sublabel={`Vorige week: ${analytics.sessionsLastWeek}`}
        />
        <StatCard
          label="Gem. leerwaarde"
          value={analytics.averageLearningValue !== null ? analytics.averageLearningValue.toFixed(1) : '—'}
          icon={<Star className="w-4 h-4" />}
          sublabel="van 5"
        />
        <StatCard
          label="Vorige week"
          value={analytics.sessionsLastWeek}
          icon={<Clock className="w-4 h-4" />}
          sublabel={`Deze week: ${analytics.sessionsThisWeek}`}
        />
      </div>

      {/* ── Charts section ── */}
      {!showCharts ? (
        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-6 text-center">
          <p className="text-sm text-stone-500 dark:text-slate-400 mb-3">
            Log minimaal 3 sessies om grafieken te zien.
          </p>
          <button
            onClick={() => navigate('/log')}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors dark:bg-teal-700 dark:hover:bg-teal-600"
          >
            Log een sessie
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ── Row: line chart + donut side-by-side on desktop ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 1: sessies per week */}
            <ChartCard title="Sessies per week">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData} margin={{ top: 4, right: 8, bottom: 0, left: -28 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<LineTooltip />} cursor={{ stroke: gridColor }} />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke={accentColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: accentColor }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 2: resultaten (donut) */}
            <ChartCard title="Resultaten">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={78}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Chart 3: gebruik per tool (full-width, horizontal bars) */}
          {toolData.length > 0 && (
            <ChartCard title="Gebruik per tool">
              <ResponsiveContainer width="100%" height={toolChartHeight}>
                <BarChart
                  data={toolData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="tool"
                    width={72}
                    tick={{ fill: axisColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                  <Bar dataKey="count" fill={accentColor} radius={[0, 4, 4, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}
