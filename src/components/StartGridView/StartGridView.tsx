import { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import StartGridTable from '../StartGridTable/StartGridTable';
import Timer from '../Timer/Timer';
import ContextMenu from '../ContextMenu/ContextMenu';
import ReportView from '../ReportView/ReportView';
import { Person } from '../../types/race';

export default function StartGridView() {
  const { currentProject } = useProject();
  const [showReport, setShowReport] = useState(false);
  
  if (!currentProject) {
    return null;
  }

  // Группировка участников по времени старта
  const groupedByTime = currentProject.raceData.persons.reduce((acc, person) => {
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

  // Определение количества коридоров
  const corridorCounts = Object.values(groupedByTime).map(persons => persons.length);
  const maxCorridors = corridorCounts.length > 0 ? Math.max(...corridorCounts) : 1;

  // Создание строк для таблицы
  const rows = sortedTimes.map(timeKey => {
    const persons = groupedByTime[timeKey].sort((a, b) => a.start_group - b.start_group);
    return {
      startTime: parseInt(timeKey),
      persons: persons
    };
  });

  return (
    <div className="h-screen w-screen" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {!showReport ? (
        <>
          <Timer rows={rows} />
          <StartGridTable rows={rows} maxCorridors={maxCorridors} competitionTitle={currentProject.raceData.data.title} />
          <ContextMenu onShowReport={() => setShowReport(true)} />
        </>
      ) : (
        <ReportView onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

