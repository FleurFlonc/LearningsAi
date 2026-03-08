import type { AIToolType } from '@/models/enums';

interface AIToolBadgeProps {
  tool: AIToolType;
}

const toolLabels: Record<AIToolType, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  cursor: 'Cursor',
  gemini: 'Gemini',
  copilot: 'Copilot',
  other: 'Overig',
};

export function AIToolBadge({ tool }: AIToolBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
      {toolLabels[tool]}
    </span>
  );
}
