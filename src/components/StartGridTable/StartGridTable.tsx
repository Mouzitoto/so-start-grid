import { useEffect, useRef, useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import ParticipantCell from '../ParticipantCell/ParticipantCell';
import { toHHMMSS } from '../../utils/time';
import { Person } from '../../types/race';
import { useTranslation } from 'react-i18next';
import { calculateIntervals, getCurrentRow } from '../../utils/time';

interface TableRow {
  startTime: number;
  persons: Person[];
}

interface StartGridTableProps {
  rows: TableRow[];
  maxCorridors: number;
  competitionTitle: string;
}

export default function StartGridTable({ rows, maxCorridors, competitionTitle }: StartGridTableProps) {
  const { currentProject, updateStatus, updateTimerState } = useProject();
  const { t } = useTranslation();
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLTableRowElement>(null);
  const previousRowRef = useRef<number | null>(null);

  // Автоскроллинг текущей строки - только когда строка реально меняется
  useEffect(() => {
    if (!currentProject) return;
    
    const { timerState, settings } = currentProject;
    
    if (!settings.autoScrollEnabled) return;
    if (!timerState.started || timerState.currentRow === null) return;
    if (isUserScrolling) return; // Пользователь сейчас скроллит вручную
    
    // Скроллим только если currentRow действительно изменился
    if (previousRowRef.current === timerState.currentRow) return;
    
    previousRowRef.current = timerState.currentRow;
    
    const rowElement = tableRef.current?.querySelector(
      `[data-row-index="${timerState.currentRow}"]`
    ) as HTMLElement;
    
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentProject?.timerState.currentRow, currentProject?.timerState.startTime, currentProject?.settings.autoScrollEnabled, isUserScrolling]);
  
  // Сбрасываем previousRowRef при изменении startTime (при сбросе таймера)
  useEffect(() => {
    previousRowRef.current = null;
  }, [currentProject?.timerState.startTime]);

  // Обработка ручного скроллинга
  useEffect(() => {
    let scrollTimer: number | null = null;
    
    const handleScroll = () => {
      // Помечаем, что пользователь скроллит
      setIsUserScrolling(true);
      
      // Очищаем предыдущий таймер
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
      
      // Устанавливаем таймер для сброса флага после паузы
      scrollTimer = window.setTimeout(() => {
        setIsUserScrolling(false);
        scrollTimer = null;
      }, 3000); // 3 секунды пауза после ручного скроллинга
    };

    const tableElement = tableRef.current;
    tableElement?.addEventListener('scroll', handleScroll);
    
    return () => {
      tableElement?.removeEventListener('scroll', handleScroll);
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
    };
  }, []);

  if (!currentProject) return null;

  const currentRow = currentProject.timerState.currentRow;

  const handleQuickClick = (bib: number) => {
    updateStatus(bib, {
      status: 'entered',
      timestamp: Date.now()
    });
  };

  const handleStatusChange = (bib: number, status: 'late' | 'absent') => {
    const person = currentProject.raceData.persons.find(p => p.bib === bib);
    if (!person) return;

    let delayMinutes: number | undefined;
    if (status === 'late' && currentProject.timerState.started && currentRow !== null) {
      // Время текущей строки (где находится таймер)
      const currentRowTime = rows[currentRow]?.startTime;
      // Время старта участника (из строки, где находится ячейка)
      const personStartTime = person.start_time;
      
      if (currentRowTime !== undefined && personStartTime !== undefined) {
        // Разница в миллисекундах
        const diffMs = currentRowTime - personStartTime;
        // Переводим в минуты (округляем вниз, так как опоздание считается целыми минутами)
        delayMinutes = Math.floor(diffMs / 60000);
        // Если результат отрицательный (текущее время меньше времени старта), устанавливаем 0
        delayMinutes = Math.max(0, delayMinutes);
      }
    }

    updateStatus(bib, {
      status,
      timestamp: Date.now(),
      delayMinutes
    });
  };

  const handleReset = (bib: number) => {
    updateStatus(bib, {
      status: 'not_set',
      timestamp: Date.now()
    });
  };

  // Определяем, скрыт ли таймер (после старта)
  const isTimerHidden = currentProject?.timerState.started || false;

  const handleStart = () => {
    if (!currentProject) return;
    const now = Date.now();
    const intervals = calculateIntervals(rows.map(r => ({ startTime: r.startTime })));
    const currentRow = getCurrentRow(0, intervals);
    
    updateTimerState({
      started: true,
      startTime: now,
      currentRow
    });
  };

  return (
    <div 
      ref={tableRef}
      className="overflow-auto"
      style={{ 
        scrollBehavior: 'smooth',
        height: '100vh',
        width: '100%',
        backgroundColor: 'transparent',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div className="bg-blue-600 text-white px-4 py-3 text-center shadow-md">
        <h2 className="text-xl font-bold">{competitionTitle}</h2>
      </div>
      {!isTimerHidden && (
        <div className="bg-white px-4 py-4 text-center">
          <button
            onClick={handleStart}
            className="text-white rounded-lg font-semibold transition-colors shadow-lg"
            style={{
              width: '60%',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              marginTop: '1rem',
              fontSize: '1.125rem',
              backgroundColor: '#10b981', // Зеленый цвет
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
          >
            {t('common.start')}
          </button>
        </div>
      )}
      <table className="w-full border-collapse bg-white">
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr>
            <th className="border border-gray-300 text-center font-semibold" style={{paddingBottom: '0.1rem' }}>{t('table.time')}</th>
            {Array.from({ length: maxCorridors }, (_, i) => (
              <th key={i} className="border border-gray-300 text-center font-semibold" style={{paddingBottom: '0.1rem' }}>
                {t('table.corridor')} {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const isCurrentRow = currentRow === rowIndex;
            return (
              <tr
                key={row.startTime}
                data-row-index={rowIndex}
                ref={isCurrentRow ? currentRowRef : null}
                className={`
                  ${isCurrentRow ? 'bg-yellow-100' : ''}
                  transition-colors duration-300
                `}
                style={isCurrentRow ? {
                  backgroundColor: '#fef3c7',
                  borderTop: '4px solid #ca8a04',
                  borderBottom: '4px solid #ca8a04'
                } : undefined}
              >
                <td 
                  className="border border-gray-300 p-2 font-mono text-center"
                  style={isCurrentRow ? {
                    backgroundColor: '#fef3c7',
                    fontWeight: 'bold',
                    borderLeft: '4px solid #ca8a04',
                    borderRight: '4px solid #ca8a04',
                    textAlign: 'center'
                  } : undefined}
                >
                  {toHHMMSS(row.startTime)}
                </td>
                {Array.from({ length: maxCorridors }, (_, corridorIndex) => {
                  const person = row.persons[corridorIndex];
                  const statusKey = person ? `bib_${person.bib}` : null;
                  const status = statusKey ? currentProject.statuses[statusKey] : null;
                  const statusValue = status?.status || 'not_set';
                  
                  return (
                    <td 
                      key={corridorIndex} 
                      className="border border-gray-300 p-1"
                      style={isCurrentRow ? {
                        backgroundColor: '#fef3c7',
                        borderLeft: corridorIndex === 0 ? '4px solid #ca8a04' : undefined,
                        borderRight: corridorIndex === maxCorridors - 1 ? '4px solid #ca8a04' : undefined
                      } : undefined}
                    >
                      {person ? (
                        <ParticipantCell
                          key={`${person.id}-${statusValue}`}
                          person={person}
                          status={statusValue}
                          timerStarted={isTimerHidden}
                          onQuickClick={() => handleQuickClick(person.bib)}
                          onStatusChange={(newStatus) => {
                            if (newStatus === 'late' || newStatus === 'absent') {
                              handleStatusChange(person.bib, newStatus);
                            } else if (newStatus === 'not_set') {
                              handleReset(person.bib);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-12"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Невидимый элемент для прокрутки ниже кнопки меню */}
      <div style={{ height: '80px', width: '100%', visibility: 'hidden' }}></div>
    </div>
  );
}

