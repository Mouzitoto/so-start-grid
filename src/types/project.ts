import { Race } from './race';
import { ParticipantStatus } from './participant';

export interface TimerState {
  started: boolean;
  startTime: number | null; // timestamp
  currentRow: number | null;
}

export type TimerStateUpdater = TimerState | ((prev: TimerState) => TimerState);

export interface ProjectSettings {
  autoScrollEnabled: boolean;
}

export interface Project {
  id: string; // UUID или timestamp
  name: string; // Название проекта (race.title + date)
  createdAt: number; // timestamp создания
  updatedAt: number; // timestamp последнего обновления
  raceData: Race; // Данные из SportOrg
  statuses: Record<string, ParticipantStatus>;
  timerState: TimerState;
  settings: ProjectSettings;
  noStartTimeBibs?: number[]; // Bib номера участников, у которых изначально было start_time === 0
}

export interface StoredData {
  projects: Project[];
  settings: {
    language: 'ru' | 'en' | 'kk';
    currentProjectId: string | null;
  };
}

