import { create } from 'zustand';
import type { LearningSession, CreateSessionInput, UpdateSessionInput } from '@/models/session';
import type { SessionStatus, AIToolType, TaskType } from '@/models/enums';
import * as service from '@/features/sessions/services/sessionService';

interface SessionStore {
  sessions: LearningSession[];
  isLoading: boolean;
  error: string | null;

  loadSessions: () => Promise<void>;
  createSession: (input: CreateSessionInput) => Promise<LearningSession>;
  updateSession: (input: UpdateSessionInput) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  duplicateSession: (id: string) => Promise<void>;

  searchQuery: string;
  filterStatus: SessionStatus | null;
  filterTool: AIToolType | null;
  filterTaskType: TaskType | null;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: SessionStatus | null) => void;
  setFilterTool: (tool: AIToolType | null) => void;
  setFilterTaskType: (taskType: TaskType | null) => void;

  filteredSessions: () => LearningSession[];
  filteredLessons: () => LearningSession[];
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,

  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await service.getAllSessions();
      set({ sessions, isLoading: false });
    } catch {
      set({ error: 'Kon sessies niet laden', isLoading: false });
    }
  },

  createSession: async (input) => {
    const session = await service.createSession(input);
    set((state) => ({ sessions: [session, ...state.sessions] }));
    return session;
  },

  updateSession: async (input) => {
    const updated = await service.updateSession(input);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === updated.id ? updated : s)),
    }));
  },

  deleteSession: async (id) => {
    await service.deleteSession(id);
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
  },

  duplicateSession: async (id) => {
    const duplicate = await service.duplicateSession(id);
    set((state) => ({ sessions: [duplicate, ...state.sessions] }));
  },

  searchQuery: '',
  filterStatus: null,
  filterTool: null,
  filterTaskType: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterTool: (tool) => set({ filterTool: tool }),
  setFilterTaskType: (taskType) => set({ filterTaskType: taskType }),

  filteredSessions: () => {
    const { sessions, searchQuery, filterStatus, filterTool, filterTaskType } = get();
    let result = sessions;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.taskDescription.toLowerCase().includes(q) ||
          s.lessonLearned.toLowerCase().includes(q) ||
          (s.whatWentWrong ?? '').toLowerCase().includes(q),
      );
    }

    if (filterStatus !== null) result = result.filter((s) => s.status === filterStatus);
    if (filterTool !== null) result = result.filter((s) => s.aiTools?.includes(filterTool!) ?? false);
    if (filterTaskType !== null) result = result.filter((s) => s.taskType === filterTaskType);

    return result;
  },

  filteredLessons: () => {
    return get()
      .filteredSessions()
      .filter((s) => s.lessonLearned.trim().length > 0);
  },
}));
