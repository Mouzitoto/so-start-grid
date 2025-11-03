export type ParticipantStatusType = 'not_set' | 'entered' | 'late' | 'absent';

export interface ParticipantStatus {
  status: ParticipantStatusType;
  timestamp: number; // Когда был установлен статус
  delayMinutes?: number; // Только для статуса "late"
}

