// Gedeelde TypeScript utility types voor de AI Learning Log applicatie

import type { LearningSession } from '@/models/session';
import type { UserPreference } from '@/models/preferences';
import type { SessionStatus, AIToolType, TaskType } from '@/models/enums';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface StorageUsage {
  used: number;
  available: number;
  percentage: number;
}

export type StorageWarningLevel = 'ok' | 'warning' | 'critical';

export interface ImportValidationResult {
  valid: boolean;
  sessionCount: number;
  errors: string[];
}

export interface SessionFilters {
  status?: SessionStatus;
  aiTool?: AIToolType;
  taskType?: TaskType;
  isFavorite?: boolean;
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  sessions: LearningSession[];
  preferences: UserPreference;
}
