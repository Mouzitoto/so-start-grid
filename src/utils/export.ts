import { Project } from '../types/project';

export interface ReportData {
  totalEntered: number;
  totalLate: number;
  totalAbsent: number;
  totalNotMarked: number;
  lateParticipants: ParticipantReport[];
  absentParticipants: ParticipantReport[];
  notMarkedParticipants: ParticipantReport[];
}

export interface ParticipantReport {
  bib: number;
  name: string;
  surname: string;
  group: string;
  delayMinutes?: number;
}

/**
 * Генерация отчета по проекту
 */
export function generateReport(project: Project): ReportData {
  const { raceData, statuses } = project;
  
  const report: ReportData = {
    totalEntered: 0,
    totalLate: 0,
    totalAbsent: 0,
    totalNotMarked: 0,
    lateParticipants: [],
    absentParticipants: [],
    notMarkedParticipants: []
  };
  
  raceData.persons.forEach(person => {
    const statusKey = `bib_${person.bib}`;
    const status = statuses[statusKey];
    const statusValue = status?.status || 'not_set';
    
    switch (statusValue) {
      case 'entered':
        report.totalEntered++;
        break;
      case 'late':
        report.totalLate++;
        report.lateParticipants.push({
          bib: person.bib,
          name: person.name,
          surname: person.surname,
          group: person.group?.name || '',
          delayMinutes: status.delayMinutes
        });
        break;
      case 'absent':
        report.totalAbsent++;
        report.absentParticipants.push({
          bib: person.bib,
          name: person.name,
          surname: person.surname,
          group: person.group?.name || ''
        });
        break;
      case 'not_set':
        report.totalNotMarked++;
        report.notMarkedParticipants.push({
          bib: person.bib,
          name: person.name,
          surname: person.surname,
          group: person.group?.name || ''
        });
        break;
    }
  });
  
  return report;
}

/**
 * Экспорт в JSON
 */
export function exportToJSON(project: Project, report: ReportData): string {
  const exportData = {
    race: project.raceData,
    statuses: project.statuses,
    report,
    exportTime: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Экспорт в CSV
 */
export function exportToCSV(project: Project): string {
  const { raceData, statuses } = project;
  const rows: string[] = [];
  
  // Заголовок
  rows.push('Bib,Name,Surname,Group,Status,DelayMinutes');
  
  // Данные
  raceData.persons.forEach(person => {
    const statusKey = `bib_${person.bib}`;
    const status = statuses[statusKey];
    const statusStr = status?.status || 'not_set';
    const delayStr = status?.delayMinutes?.toString() || '';
    const groupName = person.group?.name || '';
    
    rows.push(
      `${person.bib},"${person.name}","${person.surname}","${groupName}",${statusStr},${delayStr}`
    );
  });
  
  return rows.join('\n');
}

/**
 * Скачать файл
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

