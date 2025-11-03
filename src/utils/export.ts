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
 * Экспорт в TXT
 */
export function exportToTXT(project: Project): string {
  const report = generateReport(project);
  const lines: string[] = [];
  
  // Общее количество участников
  const totalParticipants = report.totalEntered + report.totalLate + report.totalAbsent + report.totalNotMarked;
  lines.push(`Всего участников: ${totalParticipants}`);
  lines.push('');
  
  // Зашли
  lines.push(`Зашли: ${report.totalEntered}`);
  lines.push('');
  
  // Опоздали
  if (report.lateParticipants.length > 0) {
    lines.push(`Опоздали: ${report.totalLate}`);
    report.lateParticipants.forEach(p => {
      const fullName = `${p.surname} ${p.name}`;
      const delayText = p.delayMinutes ? `${p.delayMinutes} минут` : '';
      lines.push(`${p.bib},"${fullName}","${p.group}",${delayText}`);
    });
    lines.push('');
  }
  
  // Не пришли
  if (report.absentParticipants.length > 0) {
    lines.push(`Не пришли: ${report.totalAbsent}`);
    report.absentParticipants.forEach(p => {
      const fullName = `${p.surname} ${p.name}`;
      lines.push(`${p.bib},"${fullName}","${p.group}"`);
    });
    lines.push('');
  }
  
  // Не отмечены
  if (report.notMarkedParticipants.length > 0) {
    lines.push(`Не отмечены: ${report.totalNotMarked}`);
    report.notMarkedParticipants.forEach(p => {
      const fullName = `${p.surname} ${p.name}`;
      lines.push(`${p.bib},"${fullName}","${p.group}"`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
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

