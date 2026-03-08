import type { AIToolType, TaskType } from './enums';

// Berekend view-model — niet opgeslagen in de database.
// Wordt gegenereerd door analyticsService op basis van een sessie-array.
export interface DerivedAnalytics {
  totalSessions: number;
  successRate: number;            // Percentage 0–100
  partialRate: number;
  failureRate: number;
  mostUsedAITool: AIToolType | null;
  topTaskType: TaskType | null;
  averageLearningValue: number | null;
  averageFrustration: number | null;
  sessionsThisWeek: number;
  sessionsLastWeek: number;
}
