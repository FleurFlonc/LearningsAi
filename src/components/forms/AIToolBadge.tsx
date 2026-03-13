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
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
      {toolLabels[tool]}
    </span>
  );
}
