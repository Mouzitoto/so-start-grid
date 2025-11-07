import { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import StartGridTable from '../StartGridTable/StartGridTable';
import Timer from '../Timer/Timer';
import ContextMenu from '../ContextMenu/ContextMenu';
import ReportView from '../ReportView/ReportView';
import NoStartTimeDialog from '../NoStartTimeDialog/NoStartTimeDialog';
import { Person } from '../../types/race';

export default function StartGridView() {
  const { currentProject } = useProject();
  const [showReport, setShowReport] = useState(false);
  const [showNoStartTimeDialog, setShowNoStartTimeDialog] = useState(false);
  
  if (!currentProject) {
    return null;
  }

  // Фильтруем участников: исключаем тех, у которых изначально было start_time === 0
  // (даже если им установили время позже, они остаются в списке "без стартового времени")
  const noStartTimeBibsSet = new Set(currentProject.noStartTimeBibs || []);
  const personsWithStartTime = currentProject.raceData.persons.filter(
    person => !noStartTimeBibsSet.has(person.bib)
  );

  // Группировка участников по времени старта (только с временем старта)
  const groupedByTime = personsWithStartTime.reduce((acc, person) => {
    const timeKey = person.start_time.toString();
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(person);
    return acc;
  }, {} as Record<string, Person[]>);

  // Сортировка по времени старта
  const sortedTimes = Object.keys(groupedByTime).sort((a, b) => 
    parseInt(a) - parseInt(b)
  );

  // Определение количества коридоров (только для участников с временем старта)
  // Используем максимальное количество участников в строке после фильтрации
  const corridorCounts = Object.values(groupedByTime).map(persons => persons.length);
  const maxCorridors = corridorCounts.length > 0 ? Math.max(...corridorCounts) : 1;
  
  // Если после фильтрации все строки пустые, используем 1 коридор
  const actualMaxCorridors = maxCorridors > 0 ? maxCorridors : 1;

  // Создание строк для таблицы
  const rows = sortedTimes.map(timeKey => {
    const persons = groupedByTime[timeKey].sort((a, b) => a.start_group - b.start_group);
    return {
      startTime: parseInt(timeKey),
      persons: persons
    };
  });

  // Подсчет участников без стартового времени с серым статусом (not_set)
  const noStartTimeCount = currentProject.raceData.persons.filter(person => {
    if (!noStartTimeBibsSet.has(person.bib)) return false;
    const statusKey = `bib_${person.bib}`;
    const status = currentProject.statuses[statusKey];
    const statusValue = status?.status || 'not_set';
    return statusValue === 'not_set';
  }).length;

  return (
    <div className="h-screen w-screen" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {!showReport ? (
        <>
          <Timer rows={rows} />
          <StartGridTable rows={rows} maxCorridors={actualMaxCorridors} competitionTitle={currentProject.raceData.data.title} />
          <ContextMenu onShowReport={() => setShowReport(true)} />
          {noStartTimeCount > 0 && (
            <button
              onClick={() => setShowNoStartTimeDialog(true)}
              className="w-16 h-16 text-white rounded-full transition-colors flex items-center justify-center"
              style={{
                position: 'fixed',
                bottom: '1rem',
                left: '1rem',
                width: '4rem',
                height: '4rem',
                minWidth: '4rem',
                minHeight: '4rem',
                zIndex: 9999,
                pointerEvents: 'auto',
                margin: 0,
                padding: 0,
                border: 'none',
                outline: 'none',
                backgroundColor: '#1f2937'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1f2937';
              }}
              aria-label="Участники без стартового времени"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '2rem', height: '2rem', color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {noStartTimeCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-0.25rem',
                    right: '-0.25rem',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '1.5rem',
                    height: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {noStartTimeCount}
                </span>
              )}
            </button>
          )}
          {showNoStartTimeDialog && (
            <NoStartTimeDialog onClose={() => setShowNoStartTimeDialog(false)} />
          )}
        </>
      ) : (
        <ReportView onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

