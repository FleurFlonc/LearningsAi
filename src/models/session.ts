import type {
  SessionStatus,
  AIToolType,
  TaskType,
  ProblemCategory,
  ResolutionType,
} from './enums';

export interface LearningSession {
  // Identifiers
  id: string;           // UUID, automatisch gegenereerd
  createdAt: string;    // ISO datetime
  updatedAt: string;    // ISO datetime

  // Verplichte kernvelden
  taskDescription: string;  // Wat probeerde de gebruiker te doen?
  status: SessionStatus;    // success / partial / failed
  lessonLearned: string;    // Het kernveld — altijd verplicht

  // Optionele verdiepingsvelden
  whatWentWrong?: string;
  resolution?: string;
  reflectionNotes?: string;
  aiTool?: AIToolType;
  taskType?: TaskType;
  problemCategory?: ProblemCategory;
  resolutionType?: ResolutionType;

  // Optionele meetvelden (1–5 schaal)
  learningValue?: number;     // 1-5
  frustrationLevel?: number;  // 1-5
  confidenceAfter?: number;   // 1-5

  // Overige optionele velden
  durationMinutes?: number;
  tags?: string[];
  isFavorite?: boolean;
}

// Type voor aanmaken (zonder id, createdAt, updatedAt)
export type CreateSessionInput = Omit<LearningSession, 'id' | 'createdAt' | 'updatedAt'>;

// Type voor updaten (alles optioneel behalve id)
export type UpdateSessionInput = Partial<Omit<LearningSession, 'id' | 'createdAt'>> & {
  id: string;
};
